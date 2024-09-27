import {SpringConfig} from 'react-native-reanimated/lib/typescript/animation/springUtils';

export const ThumbHitSlop = {top: 15, bottom: 15, left: 15, right: 15};

export const SliderSpringConfig: SpringConfig = {
  damping: 250,
  mass: 1,
  stiffness: 50,
  overshootClamping: false,
  restSpeedThreshold: 0.001,
  restDisplacementThreshold: 0.001,
};
