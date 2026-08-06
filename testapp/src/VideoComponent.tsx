import React, {useCallback, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import Video, {OnBufferData, OnLoadData, OnProgressData, OnVideoErrorData, VideoRef} from 'react-native-video';
import Slider, {Bubble, SliderRef} from '../../src';
import ControlButton from './ControlButton';
import DevPanel from './DevPanel';
import EventLog, {EventLogHandle} from './EventLog';
import TimeReadout, {TimeReadoutHandle} from './TimeReadout';
import {DEFAULT_DEV_SETTINGS, devSettingsReducer, VIDEO_SAMPLES} from './devSettings';
import {clamp01, progressToVideoTime} from './formatTime';
import {colors, radius, spacing} from './theme';

const PLAY_ICON = require('./images/play_icon.png');
const PAUSE_ICON = require('./images/pause_icon.png');

const SKIP_SECONDS = 10;
const PROGRESS_UPDATE_INTERVAL_MS = 250;
/** The Slider's root view has a fixed padding of 10 on each side. */
const SLIDER_ROOT_PADDING = 10;
const PERCENT = 100;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.videoBackdrop,
  },
  spinner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  statusBadge: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    overflow: 'hidden',
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  sliderRow: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  skipButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  skipLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  logRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  spacer: {
    flex: 1,
  },
});

type Phase = 'loading' | 'ready' | 'ended' | 'error';

/**
 * Test harness for the Slider.
 *
 * The important structural decision here is that playback position never enters
 * this component's state. `onProgress` fires four times a second and the pan
 * gesture fires on every frame; routing either of those through `useState` here
 * would re-render the whole tree — including the Slider, whose gesture objects
 * are memoised against its callback props and would be rebuilt each time. So
 * position is pushed straight into the Slider and the readout through their
 * imperative handles, and every callback below keeps a stable identity by
 * reading mutable state from refs.
 */
const VideoComponent = () => {
  const {width: windowWidth} = useWindowDimensions();

  const [settings, dispatch] = useReducer(devSettingsReducer, DEFAULT_DEV_SETTINGS);
  const [phase, setPhase] = useState<Phase>('loading');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  const playerRef = useRef<VideoRef>(null);
  const sliderRef = useRef<SliderRef>(null);
  const timeRef = useRef<TimeReadoutHandle>(null);
  const logRef = useRef<EventLogHandle>(null);

  // Mirrors of state that high-frequency callbacks need to read without being
  // rebuilt — a new callback identity would invalidate the Slider's memos.
  const durationRef = useRef(0);
  const positionRef = useRef(0);
  const isScrubbingRef = useRef(false);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const applyProgress = useCallback((progress: number) => {
    const clamped = clamp01(progress);
    if (settingsRef.current.animateProgress) {
      sliderRef.current?.setProgress(clamped);
    } else {
      sliderRef.current?.setColdProgress(clamped);
    }
  }, []);

  const seekTo = useCallback(
    (seconds: number) => {
      const total = durationRef.current;
      const upperBound = total > 0 ? total : Number.MAX_SAFE_INTEGER;
      const target = Math.min(Math.max(0, seconds), upperBound);

      positionRef.current = target;
      playerRef.current?.seek(target);
      timeRef.current?.setCurrentTime(target);
      if (total > 0) {
        applyProgress(target / total);
      }
    },
    [applyProgress],
  );

  const handleLoad = useCallback(({duration: loadedDuration}: OnLoadData) => {
    durationRef.current = Number.isFinite(loadedDuration) ? loadedDuration : 0;
    setDuration(loadedDuration);
    setErrorText(null);
    setPhase('ready');
  }, []);

  const handleProgress = useCallback(
    ({currentTime, playableDuration, seekableDuration}: OnProgressData) => {
      positionRef.current = currentTime;

      const total = seekableDuration > 0 ? seekableDuration : durationRef.current;
      if (!(total > 0)) {
        return;
      }

      if (!isScrubbingRef.current) {
        applyProgress(currentTime / total);
        timeRef.current?.setCurrentTime(currentTime);
      }
      if (!settingsRef.current.manualBuffer) {
        sliderRef.current?.setBufferProgress(clamp01(playableDuration / total));
      }
    },
    [applyProgress],
  );

  const handleEnd = useCallback(() => {
    setIsPlaying(false);
    setPhase('ended');
  }, []);

  const handleBuffer = useCallback(({isBuffering: buffering}: OnBufferData) => {
    setIsBuffering(buffering);
  }, []);

  const handleError = useCallback(({error}: OnVideoErrorData) => {
    setErrorText(error?.errorString ?? error?.localizedDescription ?? error?.errorCode ?? 'unknown playback error');
    setIsPlaying(false);
    setPhase('error');
  }, []);

  const handleSlideStart = useCallback((value: number) => {
    isScrubbingRef.current = true;
    setIsScrubbing(true);
    logRef.current?.push('onSlideStart', value);
  }, []);

  const handleSlide = useCallback((value: number) => {
    logRef.current?.push('onSlide', value);

    const total = durationRef.current;
    if (!(total > 0)) {
      return;
    }

    const target = clamp01(value) * total;
    positionRef.current = target;
    timeRef.current?.setCurrentTime(target);
    if (settingsRef.current.seekWhileScrubbing) {
      playerRef.current?.seek(target);
    }
  }, []);

  const handleSlideFinish = useCallback((value: number) => {
    logRef.current?.push('onSlideFinish', value);
    isScrubbingRef.current = false;
    setIsScrubbing(false);

    const total = durationRef.current;
    if (total > 0) {
      const target = clamp01(value) * total;
      positionRef.current = target;
      playerRef.current?.seek(target);
      timeRef.current?.setCurrentTime(target);
    }
    // Scrubbing back from the end makes the video playable again.
    setPhase(previous => (previous === 'ended' ? 'ready' : previous));
  }, []);

  const handlePlayPause = useCallback(() => {
    if (phase === 'error') {
      return;
    }
    if (phase === 'ended') {
      seekTo(0);
      setPhase('ready');
      setIsPlaying(true);
      return;
    }
    setIsPlaying(previous => !previous);
  }, [phase, seekTo]);

  const handleRewind = useCallback(() => seekTo(positionRef.current - SKIP_SECONDS), [seekTo]);
  const handleForward = useCallback(() => seekTo(positionRef.current + SKIP_SECONDS), [seekTo]);

  const handleJumpToProgress = useCallback(
    (progress: number) => {
      if (durationRef.current > 0) {
        seekTo(progress * durationRef.current);
      } else {
        applyProgress(progress);
      }
    },
    [applyProgress, seekTo],
  );

  const handleClearEvents = useCallback(() => logRef.current?.clear(), []);
  const handleTogglePanel = useCallback(() => setIsPanelExpanded(previous => !previous), []);

  const renderBubble = useCallback(
    (progress: number) => <Bubble text={progressToVideoTime(progress, duration)} />,
    [duration],
  );

  const source = useMemo(() => ({uri: VIDEO_SAMPLES[settings.sourceIndex].uri}), [settings.sourceIndex]);

  // Reset every position indicator when the source changes.
  useEffect(() => {
    durationRef.current = 0;
    positionRef.current = 0;
    setDuration(0);
    setErrorText(null);
    setPhase('loading');
    sliderRef.current?.setColdProgress(0);
    sliderRef.current?.setBufferProgress(0);
    timeRef.current?.setCurrentTime(0);
  }, [settings.sourceIndex]);

  // Manual buffer override, for exercising the indicator without a real stream.
  useEffect(() => {
    if (settings.manualBuffer) {
      sliderRef.current?.setBufferProgress(settings.bufferPercent / PERCENT);
    }
  }, [settings.manualBuffer, settings.bufferPercent]);

  const sliderWidth = Math.max(
    1,
    Math.round((windowWidth * settings.widthPercent) / PERCENT) - SLIDER_ROOT_PADDING * 2,
  );
  const isPaused = !isPlaying || isScrubbing;
  const showBubble = settings.bubbleMode !== 'off';

  return (
    <View style={styles.container}>
      <View>
        <Video
          ref={playerRef}
          source={source}
          style={styles.video}
          resizeMode="contain"
          paused={isPaused}
          rate={settings.rate}
          muted={settings.muted}
          playInBackground={false}
          ignoreSilentSwitch="ignore"
          progressUpdateInterval={PROGRESS_UPDATE_INTERVAL_MS}
          onLoad={handleLoad}
          onProgress={handleProgress}
          onBuffer={handleBuffer}
          onEnd={handleEnd}
          onError={handleError}
        />
        {(phase === 'loading' || isBuffering) && (
          <View style={styles.spinner} pointerEvents="none">
            <ActivityIndicator color={colors.accent} size="large" />
          </View>
        )}
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusBadge}>
          {`${phase}${isScrubbing ? ' · scrubbing' : ''}${isBuffering ? ' · buffering' : ''}`}
        </Text>
        <TimeReadout ref={timeRef} duration={duration} />
      </View>

      {errorText !== null && <Text style={styles.error}>{errorText}</Text>}

      <View style={styles.sliderRow}>
        <Slider
          ref={sliderRef}
          width={sliderWidth}
          height={settings.trackHeight}
          thumbSize={settings.thumbSize}
          animationDir={settings.animationDir}
          tapActive={settings.tapActive}
          bubbleVisibility={settings.bubbleMode === 'always' ? 'always' : 'onTouch'}
          renderBubble={showBubble ? renderBubble : undefined}
          onSlide={handleSlide}
          onSlideStart={handleSlideStart}
          onSlideFinish={handleSlideFinish}
        />
      </View>

      <View style={styles.transport}>
        <Text
          accessibilityRole="button"
          accessibilityLabel={`rewind ${SKIP_SECONDS} seconds`}
          onPress={handleRewind}
          style={[styles.skipButton, styles.skipLabel]}>
          {`−${SKIP_SECONDS}s`}
        </Text>
        <ControlButton
          iconPath={isPlaying ? PAUSE_ICON : PLAY_ICON}
          accessibilityLabel={isPlaying ? 'pause' : 'play'}
          disabled={phase === 'error'}
          onPress={handlePlayPause}
        />
        <Text
          accessibilityRole="button"
          accessibilityLabel={`forward ${SKIP_SECONDS} seconds`}
          onPress={handleForward}
          style={[styles.skipButton, styles.skipLabel]}>
          {`+${SKIP_SECONDS}s`}
        </Text>
      </View>

      <View style={styles.logRow}>
        <EventLog ref={logRef} />
      </View>

      <View style={styles.spacer} />

      <DevPanel
        settings={settings}
        dispatch={dispatch}
        isExpanded={isPanelExpanded}
        onToggleExpanded={handleTogglePanel}
        onJumpToProgress={handleJumpToProgress}
        onClearEvents={handleClearEvents}
      />
    </View>
  );
};

export default VideoComponent;
