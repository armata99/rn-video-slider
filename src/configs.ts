import type {WithSpringConfig} from 'react-native-reanimated';

export const ThumbHitSlop = {top: 15, bottom: 15, left: 15, right: 15};

/**
 * Only physics parameters that exist in both Reanimated 3 and 4 are set here.
 * Reanimated 4 replaced `restSpeedThreshold`/`restDisplacementThreshold` with a
 * single `energyThreshold`, so pinning either one would break one major version.
 * The defaults are close enough to the previous thresholds to be unnoticeable.
 */
export const SliderSpringConfig: WithSpringConfig = {
  damping: 250,
  mass: 1,
  stiffness: 50,
  overshootClamping: false,
};
