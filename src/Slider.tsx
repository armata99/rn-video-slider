import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef} from 'react';
import {LayoutChangeEvent, StyleSheet, View, ViewStyle} from 'react-native';
import {
  GestureDetector,
  usePanGesture,
  type PanGestureActiveEvent,
  type PanGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {clamp, useAnimatedStyle, useSharedValue, withSpring, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import {
  BufferTimingConfig,
  DefaultThumbSize,
  DefaultTrackHeight,
  MinBarScale,
  RootPadding,
  SliderSpringConfig,
  ThumbHitSlop,
} from './configs';
import {useIsReversed} from './direction';
import SliderBubble from './SliderBubble';
import {SliderProps} from './types';

const styles = StyleSheet.create({
  root: {padding: RootPadding},
  track: {
    // Everything inside the track is laid out centred and then moved into place
    // by a transform. The centre is the one anchor a right-to-left layout
    // cannot shift, which is what lets the geometry below be identical on both
    // platforms and independent of `I18nManager`.
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {position: 'absolute'},
  thumb: {
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/**
 * Places a full width bar so that it reads as being `value` full.
 *
 * The bar is never resized — resizing is a layout property, and animating one
 * drags the layout engine through every frame of a scrub. It is scaled instead,
 * and because scaling happens around the view's centre, half of the width the
 * scale took away has to be handed back as a translation to pin the bar to the
 * edge it grows from.
 */
const barStyle = (value: number, width: number, isReversed: boolean): ViewStyle => {
  'worklet';
  const scaleX = clamp(value, MinBarScale, 1);
  const translateX = ((isReversed ? 1 : -1) * (width * (1 - scaleX))) / 2;
  return {transform: [{translateX}, {scaleX}]};
};

const Slider = (props: SliderProps) => {
  const {
    ref,
    width,
    height = DefaultTrackHeight,
    thumbSize = DefaultThumbSize,
    thumbColor = '#ffffff',
    thumbStyle,
    progressColor = '#ffffff',
    bufferProgressColor = 'rgba(255,255,255, 0.5)',
    trackColor = 'rgba(255,255,255, 0.2)',
    onSlideFinish,
    onSlideStart,
    onSlide,
    renderBubble,
    bubbleContainerStyle,
    bubbleVisibility = 'onTouch',
    animationDir = 'auto',
    isRTL,
    rootStyle,
    tapActive = true,
    initialProgress = 0,
    bufferInitialProgress = 0,
  } = props;

  const isReversed = useIsReversed(animationDir, isRTL);
  const startingProgress = clamp(initialProgress, 0, 1);

  const progress = useSharedValue<number>(startingProgress);
  const bufferProgress = useSharedValue<number>(clamp(bufferInitialProgress, 0, 1));
  /** Progress at the moment the current gesture began, i.e. the origin a drag is measured from. */
  const gestureOrigin = useSharedValue<number>(0);
  /** Offset between the left edge of the view the gesture is attached to and the left edge of the track. */
  const trackOriginX = useSharedValue<number>(0);
  const isSliding = useSharedValue<boolean>(false);
  /**
   * Mirrors `progress`, but is only written with values a user is meant to read.
   * `progress` also carries every intermediate frame of the `setProgress`
   * spring, and driving the bubble off those would mean a React render per
   * frame for a value that only ever settles on the one already known here.
   */
  const bubbleProgress = useSharedValue<number>(startingProgress);

  /**
   * `setProgress` is expected to be called from a player's progress callback,
   * which keeps firing while the user scrubs. This is the flag that stops those
   * updates from fighting the gesture for control of the thumb.
   */
  const isSlidingRef = useRef<boolean>(false);
  /**
   * Read by the worklets below through the stable emitters. Keeping the props
   * behind a ref is what lets the gesture config stay memoised even when the
   * consumer passes inline arrow functions.
   */
  const eventHandlers = useRef({onSlide, onSlideStart, onSlideFinish});
  useEffect(() => {
    eventHandlers.current = {onSlide, onSlideStart, onSlideFinish};
  });

  const emitSlideStart = useCallback((value: number) => {
    isSlidingRef.current = true;
    eventHandlers.current.onSlideStart?.(value);
  }, []);

  const emitSlide = useCallback((value: number) => {
    eventHandlers.current.onSlide?.(value);
  }, []);

  const emitSlideFinish = useCallback((value: number) => {
    isSlidingRef.current = false;
    eventHandlers.current.onSlideFinish?.(value);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      setProgress: (value: number) => {
        if (isSlidingRef.current) {
          return;
        }
        const next = clamp(value, 0, 1);
        progress.set(withSpring(next, SliderSpringConfig));
        bubbleProgress.set(next);
      },
      setColdProgress: (value: number) => {
        if (isSlidingRef.current) {
          return;
        }
        const next = clamp(value, 0, 1);
        progress.set(next);
        bubbleProgress.set(next);
      },
      setBufferProgress: (value: number) => {
        bufferProgress.set(withTiming(clamp(value, 0, 1), BufferTimingConfig));
      },
    }),
    [bubbleProgress, bufferProgress, progress],
  );

  const onTrackLayout = useCallback(
    (event: LayoutChangeEvent) => {
      trackOriginX.set(event.nativeEvent.layout.x);
    },
    [trackOriginX],
  );

  /**
   * One pan handler covers both gestures. Gesture Handler 3 reports the touch
   * position to `onBegin`, which fires the moment a finger lands, so seeking to
   * a tap no longer needs a second handler racing the pan for it.
   */
  const gestureConfig = useMemo(
    () => ({
      // Gesture Handler does its own hit testing and ignores the view's
      // `hitSlop`, so the slop has to be declared here. It only matters without
      // `tapActive`, where the handler sits on the thumb rather than on the
      // padded root view.
      hitSlop: tapActive ? undefined : ThumbHitSlop,
      onBegin: (event: PanGestureEvent) => {
        'worklet';
        isSliding.set(true);
        if (!tapActive) {
          gestureOrigin.set(progress.get());
          scheduleOnRN(emitSlideStart, progress.get());
          return;
        }
        const ratio = (event.x - trackOriginX.get()) / width;
        const value = clamp(isReversed ? 1 - ratio : ratio, 0, 1);
        gestureOrigin.set(value);
        progress.set(value);
        bubbleProgress.set(value);
        scheduleOnRN(emitSlideStart, value);
        scheduleOnRN(emitSlide, value);
      },
      onUpdate: (event: PanGestureActiveEvent) => {
        'worklet';
        const travelled = (isReversed ? -event.translationX : event.translationX) / width;
        const value = clamp(gestureOrigin.get() + travelled, 0, 1);
        progress.set(value);
        bubbleProgress.set(value);
        scheduleOnRN(emitSlide, value);
      },
      onFinalize: () => {
        'worklet';
        isSliding.set(false);
        scheduleOnRN(emitSlideFinish, progress.get());
      },
    }),
    [
      bubbleProgress,
      emitSlide,
      emitSlideFinish,
      emitSlideStart,
      gestureOrigin,
      isReversed,
      isSliding,
      progress,
      tapActive,
      trackOriginX,
      width,
    ],
  );

  const panGesture = usePanGesture(gestureConfig);

  const progressAnimatedStyle = useAnimatedStyle(() => barStyle(progress.get(), width, isReversed));

  const bufferAnimatedStyle = useAnimatedStyle(() => barStyle(bufferProgress.get(), width, isReversed));

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    // The thumb starts centred on the track, so half a track's width of travel
    // in each direction covers the whole range. Note this never involves the
    // thumb's own size: whatever `thumbStyle` scales it to, its centre still
    // lands exactly on the progress it represents.
    return {transform: [{translateX: (isReversed ? -1 : 1) * (progress.get() - 0.5) * width}]};
  });

  const trackStyle = useMemo<ViewStyle>(
    () => ({...styles.track, backgroundColor: trackColor, width, height}),
    [height, trackColor, width],
  );

  const bars = useMemo(() => {
    // Not annotated as ViewStyle[]: the values returned by useAnimatedStyle are
    // opaque style handles in Reanimated 4, not plain style objects.
    const progressStyle = [{...styles.bar, backgroundColor: progressColor, width, height}, progressAnimatedStyle];
    const bufferStyle = [{...styles.bar, backgroundColor: bufferProgressColor, width, height}, bufferAnimatedStyle];

    return (
      <>
        <Animated.View style={progressStyle} />
        <Animated.View style={bufferStyle} />
      </>
    );
  }, [bufferAnimatedStyle, bufferProgressColor, height, progressAnimatedStyle, progressColor, width]);

  const thumb = useMemo(() => {
    const style = [
      {
        ...styles.thumb,
        width: thumbSize,
        height: thumbSize,
        borderRadius: thumbSize / 2,
        backgroundColor: thumbColor,
      },
      thumbStyle,
      thumbAnimatedStyle,
    ];

    return (
      <Animated.View style={style}>
        {renderBubble && (
          <SliderBubble
            value={bubbleProgress}
            isSliding={isSliding}
            initialValue={startingProgress}
            visibility={bubbleVisibility}
            render={renderBubble}
            containerStyle={bubbleContainerStyle}
            thumbSize={thumbSize}
          />
        )}
      </Animated.View>
    );
  }, [
    bubbleContainerStyle,
    bubbleProgress,
    bubbleVisibility,
    isSliding,
    renderBubble,
    startingProgress,
    thumbAnimatedStyle,
    thumbColor,
    thumbSize,
    thumbStyle,
  ]);

  // With tap-to-seek the whole padded root is touchable, so the detector wraps
  // it. Without it, only dragging the thumb may move the slider.
  if (tapActive) {
    return (
      <GestureDetector gesture={panGesture}>
        <View style={[styles.root, rootStyle]}>
          <View style={trackStyle} onLayout={onTrackLayout}>
            {bars}
            {thumb}
          </View>
        </View>
      </GestureDetector>
    );
  }

  return (
    <View style={[styles.root, rootStyle]}>
      <View style={trackStyle}>
        {bars}
        <GestureDetector gesture={panGesture}>{thumb}</GestureDetector>
      </View>
    </View>
  );
};

export default Slider;
