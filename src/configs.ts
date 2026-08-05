import type {WithSpringConfig} from 'react-native-reanimated';

export const ThumbHitSlop = {top: 15, bottom: 15, left: 15, right: 15};

export const SliderSpringConfig: WithSpringConfig = {
  damping: 250,
  mass: 1,
  stiffness: 50,
  overshootClamping: false,
  restSpeedThreshold: 0.001,
  restDisplacementThreshold: 0.001,
};
