import React, {useCallback, useState} from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {SharedValue, useAnimatedReaction} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import {BubbleGap} from './configs';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

interface SliderBubbleProps {
  /** Value the bubble should display. Written at the points the user can perceive, never animated. */
  value: SharedValue<number>;
  /** Whether a gesture is currently in progress. */
  isSliding: SharedValue<boolean>;
  /** Value to display before the first reaction lands, so `always` bubbles paint on the first frame. */
  initialValue: number;
  visibility: 'always' | 'onTouch';
  render: (value: number) => React.JSX.Element;
  containerStyle?: ViewStyle;
  /** Distance from the bottom of the thumb to the bottom of the bubble, in points. */
  thumbSize: number;
}

/**
 * Renders the hovering bubble and owns the state that drives it.
 *
 * `render` produces arbitrary JSX from a number, so following the progress does
 * cost a React render per change — there is no way around that. What this
 * component buys is that the render stops here: the Slider itself, its gesture
 * config and its animated styles are never invalidated by a scrub, which is
 * what used to happen when this state lived one level up.
 */
const SliderBubble = ({
  value,
  isSliding,
  initialValue,
  visibility,
  render,
  containerStyle,
  thumbSize,
}: SliderBubbleProps) => {
  const isAlwaysVisible = visibility === 'always';
  const [displayed, setDisplayed] = useState<number | undefined>(isAlwaysVisible ? initialValue : undefined);

  const show = useCallback((next: number) => setDisplayed(next), []);
  const hide = useCallback(() => setDisplayed(undefined), []);

  useAnimatedReaction(
    () => ({current: value.get(), isVisible: isAlwaysVisible || isSliding.get()}),
    (next, previous) => {
      const wasVisible = previous?.isVisible ?? false;
      if (!next.isVisible) {
        // Only worth a hop to the JS thread on the frame the bubble disappears.
        if (wasVisible) {
          scheduleOnRN(hide);
        }
        return;
      }
      if (wasVisible && next.current === previous?.current) {
        return;
      }
      scheduleOnRN(show, next.current);
    },
  );

  return (
    <View style={[styles.container, {bottom: thumbSize + BubbleGap}, containerStyle]}>
      {displayed !== undefined && render(displayed)}
    </View>
  );
};

export default SliderBubble;
