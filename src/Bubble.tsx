import React, {useEffect} from 'react';
import {BubbleProps} from './types';
import {StyleSheet, Text} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const styles = StyleSheet.create({
  bubbleRoot: {
    height: 35,
    minWidth: 60,
    maxWidth: 120,
    backgroundColor: 'white',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleText: {fontSize: 12, fontWeight: 'bold'},
});

const Bubble = (props: BubbleProps) => {
  const {textStyle, text, rootStyle} = props;

  const opacity = useSharedValue<number>(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [
      {translateY: interpolate(opacity.get(), [0, 1], [8, 0], Extrapolation.CLAMP)},
      {scale: interpolate(opacity.get(), [0, 1], [0.8, 1], Extrapolation.CLAMP)},
    ],
  }));

  useEffect(() => {
    opacity.set(withTiming(1, {duration: 150}));
  }, [opacity]);

  return (
    <Animated.View style={[styles.bubbleRoot, rootStyle, animatedStyle]}>
      <Text style={[styles.bubbleText, textStyle]} numberOfLines={1}>
        {text}
      </Text>
    </Animated.View>
  );
};

export default Bubble;
