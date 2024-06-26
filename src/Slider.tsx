import React, {ForwardedRef, forwardRef, useImperativeHandle} from 'react';
import {I18nManager, Platform, StyleSheet, View, ViewStyle} from 'react-native';
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
import {ISlider, ISliderProps} from './types';
import {DEFAULT_SLIDER_SPRING_CONFIG, THUMB_HIT_SLOP} from './configs';

const styles = StyleSheet.create({
  root: {padding: 10},
  track: {
    overflow: 'visible',
    justifyContent: 'center',
  },
  progress: {
    overflow: 'visible',
    justifyContent: 'center',
    position: 'absolute',
  },
  buffer: {
    overflow: 'visible',
    justifyContent: 'center',
    position: 'absolute',
  },
  thumb: {borderRadius: 50, elevation: 5},
});

const SliderComponent = (props: ISliderProps, ref: ForwardedRef<ISlider>) => {
  const {
    width,
    height = 3,
    thumbSize = 12,
    thumbColor = '#ffffff',
    progressColor = '#ffffff',
    bufferProgressColor = 'rgba(255,255,255, 0.5)',
    trackColor = 'rgba(255,255,255, 0.2)',
    onSlideFinish,
    onSlideStart,
    onSlide,
    isRTL = I18nManager.isRTL,
    compensateForceRTL: _compForceRTL = false,
    rootStyle,
    tapActive = true,
  } = props;

  //calculated values
  const progress = useSharedValue<number>(0);
  const bufferProgress = useSharedValue<number>(0);
  const offsetOverflow: number = thumbSize / 2;
  const maxDrag: number = width;
  const minDrag: number = -offsetOverflow;
  const xRange = isRTL ? -width : width;
  const startX = useSharedValue<number>(0); //to memorize the start point
  const compensateForceRTL: boolean = Platform.OS === 'android' ? _compForceRTL : false;

  useImperativeHandle(ref, () => ({
    setProgress: p => (progress.value = withSpring(p, DEFAULT_SLIDER_SPRING_CONFIG)),
    setColdProgress: p => (progress.value = p),
    setBufferProgress: p => (bufferProgress.value = p),
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
      transform: [{translateX: isRTL || compensateForceRTL ? -thumbOffset.value : thumbOffset.value}],
    };
  });

  const trackStyle: ViewStyle = {
    ...styles.track,
    direction: isRTL ? 'rtl' : 'ltr', //this won't work if force RTL is activated at android native level.
    ...(compensateForceRTL && {transform: [{rotateY: '180deg'}]}), //so this will fix it
    backgroundColor: trackColor,
    width,
    height,
  };

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

  const thumbStyle: ViewStyle[] = [
    {
      ...styles.thumb,
      width: thumbSize,
      height: thumbSize,
      backgroundColor: thumbColor,
    },
    thumbAnimatedStyle,
  ];

  //a bit of safe calling
  const _onSlideStart = (progressVal: number) => onSlideStart?.(progressVal);

  const _onSlide = (progressVal: number) => onSlide?.(progressVal);

  const _onSlideFinish = (progressVal: number) => onSlideFinish?.(progressVal);

  const pan = Gesture.Pan()
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
    .onFinalize(() => runOnJS(_onSlideFinish)(progress.value));

  if (tapActive) {
    const tap = Gesture.Tap()
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
      });

    return (
      <GestureDetector gesture={Gesture.Simultaneous(tap, pan)}>
        <View style={[styles.root, rootStyle]}>
          <View style={trackStyle}>
            <Animated.View style={progressStyle} />
            <Animated.View style={bufferStyle} />
            <Animated.View hitSlop={THUMB_HIT_SLOP} style={thumbStyle} />
          </View>
        </View>
      </GestureDetector>
    );
  } else {
    return (
      <View style={[styles.root, rootStyle]}>
        <View style={trackStyle}>
          <Animated.View style={progressStyle} />
          <Animated.View style={bufferStyle} />
          <GestureDetector gesture={pan}>
            <Animated.View hitSlop={THUMB_HIT_SLOP} style={thumbStyle} />
          </GestureDetector>
        </View>
      </View>
    );
  }
};

export default forwardRef(SliderComponent);
