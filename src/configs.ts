import type {WithSpringConfig, WithTimingConfig} from 'react-native-reanimated';

/** Padding around the track, in points. Widens the touch area of a 3pt tall track. */
export const RootPadding = 10;

/** Default height of the track, in points. */
export const DefaultTrackHeight = 3;

/** Default diameter of the thumb, in points. */
export const DefaultThumbSize = 12;

/** Vertical gap between the top of the thumb and the bottom of the bubble, in points. */
export const BubbleGap = 15;

/**
 * Touch area added around the thumb. Only applies when `tapActive` is off,
 * because that is the one case where the gesture is attached to the thumb
 * itself rather than to the padded root view.
 */
export const ThumbHitSlop = {top: 15, bottom: 15, left: 15, right: 15};

/**
 * Smallest scale the progress and buffer bars are allowed to shrink to.
 *
 * The bars are drawn full width and scaled down, so an empty bar means
 * `scaleX: 0` — a singular matrix, which the platform transform decomposition
 * cannot invert and turns into NaN rotations. At any realistic track width this
 * leaves well under a hundredth of a pixel on screen.
 */
export const MinBarScale = 0.0001;

/**
 * Heavily damped on purpose: `setProgress` is normally driven by a player's
 * progress callback several times a second, so the spring has to settle without
 * ever overshooting the value it was handed. Reanimated 4's `energyThreshold`
 * is left at its default, which sits close enough to the `restSpeedThreshold`
 * this used to pin under Reanimated 3 to be unnoticeable.
 */
export const SliderSpringConfig: WithSpringConfig = {
  damping: 250,
  mass: 1,
  stiffness: 50,
  overshootClamping: false,
};

/** Timing used to ease the buffer indicator towards a newly reported value. */
export const BufferTimingConfig: WithTimingConfig = {duration: 300};
