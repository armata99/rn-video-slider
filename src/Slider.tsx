import React, {ForwardedRef, forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {I18nManager, StyleSheet, View, ViewStyle, Platform} from 'react-native';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {SliderProps, SliderRef} from './types';
import {SliderSpringConfig, ThumbHitSlop} from './configs';

const styles = StyleSheet.create({
  root: {padding: 10},
  track: {
    justifyContent: 'center',
  },
  progress: {
    position: 'absolute',
  },
  buffer: {
    position: 'absolute',
  },
  thumb: {
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const SliderComponent = (props: SliderProps, ref: ForwardedRef<SliderRef | undefined>) => {
  const {
    width,
    height = 3,
    thumbSize = 12,
    thumbColor = '#ffffff',
    thumbStyle: _thumbStyle,
    progressColor = '#ffffff',
    bufferProgressColor = 'rgba(255,255,255, 0.5)',
    trackColor = 'rgba(255,255,255, 0.2)',
    onSlideFinish,
    onSlideStart,
    onSlide,
    renderBubble,
    bubbleContainerStyle,
    bubbleVisibility = 'onTouch',
    isRTL = I18nManager.isRTL,
    rootStyle,
    tapActive = true,
    initialProgress = 0,
    bufferInitialProgress = 0,
  } = props;

  //calculated values
  const progress = useSharedValue<number>(initialProgress);
  const [progressBackup, setProgressBackup] = useState<number | undefined>(
    bubbleVisibility === 'always' ? initialProgress : undefined,
  ); //this hook is used in rendering bubble to avoid accessing shared value during render
  const bufferProgress = useSharedValue<number>(bufferInitialProgress);
  const offsetOverflow: number = thumbSize / 2;
  const maxDrag: number = width;
  const minDrag: number = -offsetOverflow;
  const xRange = isRTL ? -width : width;
  const startX = useSharedValue<number>(0); //to memorize the start point
  const shouldRotateTrack: boolean = I18nManager.isRTL !== isRTL && Platform.OS === 'android';
  const shouldInvertDir: boolean = (isRTL && Platform.OS === 'ios') || (Platform.OS === 'android' && I18nManager.isRTL);
  const isSliding = useRef<boolean>(false);

  useImperativeHandle(ref, () => ({
    setProgress: (p: number) => {
      if (!isSliding.current) {
        progress.value = withSpring(p, SliderSpringConfig);
        if (bubbleVisibility === 'always' && renderBubble) {
          setProgressBackup(p);
        }
      }
    },
    setColdProgress: (p: number) => {
      if (!isSliding.current) {
        progress.value = p;
      }
    },
    setBufferProgress: (p: number) => (bufferProgress.value = p),
  }));

  const thumbOffset = useDerivedValue(() => {
    const nextValue = progress.value * width - offsetOverflow;
    if (nextValue >= minDrag && nextValue <= maxDrag - offsetOverflow) {
      return nextValue;
    } else {
      if (nextValue > maxDrag - offsetOverflow) {
        progress.value = 1;
        return maxDrag - offsetOverflow;
      } else {
        progress.value = 0;
        return minDrag;
      }
    }
  });

  const progressWidth = useDerivedValue(() => {
    const nextValue = progress.value * width;
    if (nextValue >= 0 && nextValue <= width) {
      return nextValue;
    } else {
      if (nextValue > width) {
        progress.value = 1;
        return width;
      } else {
        progress.value = 0;
        return 0;
      }
    }
  });

  const bufferWidth: SharedValue<number> = useDerivedValue(() => {
    const nextValue = bufferProgress.value * width;
    if (nextValue >= 0 && nextValue <= width) {
      return nextValue;
    } else {
      if (nextValue > width) {
        bufferProgress.value = 1;
        return width;
      } else {
        bufferProgress.value = 0;
        return 0;
      }
    }
  });

  const progressAnimatedStyle = useAnimatedStyle((): ViewStyle => {
    return {width: progressWidth.value};
  });

  const bufferAnimatedStyle = useAnimatedStyle((): ViewStyle => {
    return {
      width: withTiming(bufferWidth.value),
    };
  });

  const thumbAnimatedStyle = useAnimatedStyle((): ViewStyle => {
    return {
      transform: [{translateX: shouldInvertDir ? -thumbOffset.value : thumbOffset.value}],
    };
  });

  const trackStyle: ViewStyle = {
    ...styles.track,
    direction: isRTL ? 'rtl' : 'ltr', //android does not support this props. it can be fixed it with below prop
    ...(shouldRotateTrack && {transform: [{rotateY: '180deg'}]}),
    backgroundColor: trackColor,
    width,
    height,
  };

  const _onSlideStart = useCallback(
    (progressVal: number) => {
      isSliding.current = true;
      if (renderBubble) {
        setProgressBackup(progressVal);
      }
      onSlideStart?.(progressVal);
    },
    [onSlideStart, renderBubble],
  );

  const _onSlide = useCallback(
    (progressVal: number) => {
      if (renderBubble) {
        setProgressBackup(progressVal);
      }
      onSlide?.(progressVal);
    },
    [onSlide, renderBubble],
  );

  const _onSlideFinish = useCallback(
    (progressVal: number) => {
      isSliding.current = false;
      if (bubbleVisibility === 'onTouch' && renderBubble) {
        setProgressBackup(undefined);
      }
      onSlideFinish?.(progressVal);
    },
    [bubbleVisibility, onSlideFinish, renderBubble],
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          if (!tapActive) {
            runOnJS(_onSlideStart)(progress.value);
            startX.value = progress.value * xRange;
          }
        })
        .onUpdate(event => {
          const nextValue = startX.value + event.translationX;
          const clampedValue = Math.max(0, Math.min(nextValue / xRange, 1));
          progress.value = clampedValue;
          runOnJS(_onSlide)(clampedValue);
        })
        .onFinalize(() => runOnJS(_onSlideFinish)(progress.value)),
    [_onSlide, _onSlideFinish, _onSlideStart, progress, startX, tapActive, xRange],
  );

  const AnimatedViews = useMemo(() => {
    const progressStyle: ViewStyle[] = [
      {
        ...styles.progress,
        backgroundColor: progressColor,
        height,
      },
      progressAnimatedStyle,
    ];

    const bufferStyle: ViewStyle[] = [
      {
        ...styles.buffer,
        backgroundColor: bufferProgressColor,
        height,
      },
      bufferAnimatedStyle,
    ];

    return (
      <>
        <Animated.View style={progressStyle} />
        <Animated.View style={bufferStyle} />
      </>
    );
  }, [bufferAnimatedStyle, bufferProgressColor, height, progressAnimatedStyle, progressColor]);

  const ThumbView = useMemo(() => {
    const thumbStyle: (ViewStyle | undefined)[] = [
      {
        ...styles.thumb,
        width: thumbSize,
        height: thumbSize,
        borderRadius: thumbSize / 2,
        backgroundColor: thumbColor,
      },
      _thumbStyle,
      thumbAnimatedStyle,
    ];
    return (
      <Animated.View hitSlop={ThumbHitSlop} style={thumbStyle}>
        <View style={[styles.bubbleContainer, {bottom: thumbSize + 15}, bubbleContainerStyle]}>
          {progressBackup !== undefined && renderBubble?.(progressBackup)}
        </View>
      </Animated.View>
    );
  }, [_thumbStyle, bubbleContainerStyle, progressBackup, renderBubble, thumbAnimatedStyle, thumbColor, thumbSize]);

  const tapGesture = useMemo(
    () =>
      tapActive
        ? Gesture.Tap()
            .onBegin(() => runOnJS(_onSlideStart)(progress.value))
            .maxDuration(150)
            .onTouchesDown(event => {
              const targetX = event.allTouches[0].x - Math.max(12, offsetOverflow);
              //we need complement of x on rtl
              const progressVal = isRTL ? 1 - Math.abs(targetX / xRange) : targetX / xRange;
              const clampedValue = Math.max(0, Math.min(progressVal, 1));
              progress.value = clampedValue;
              startX.value = clampedValue * xRange;
              runOnJS(_onSlide)(clampedValue);
            })
        : undefined,
    [_onSlide, _onSlideStart, isRTL, offsetOverflow, progress, startX, tapActive, xRange],
  );

  if (tapActive && tapGesture) {
    return (
      <GestureDetector gesture={Gesture.Simultaneous(tapGesture, panGesture)}>
        <View style={[styles.root, rootStyle]}>
          <View style={trackStyle}>
            {AnimatedViews}
            {ThumbView}
          </View>
        </View>
      </GestureDetector>
    );
  } else {
    return (
      <View style={[styles.root, rootStyle]}>
        <View style={trackStyle}>
          {AnimatedViews}
          <GestureDetector gesture={panGesture}>{ThumbView}</GestureDetector>
        </View>
      </View>
    );
  }
};

export default forwardRef(SliderComponent);
