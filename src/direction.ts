import {useEffect} from 'react';
import {I18nManager} from 'react-native';
import type {AnimationDirection} from './types';

let hasWarnedAboutIsRTL = false;

/**
 * Logs the `isRTL` deprecation once per app run rather than once per slider,
 * so a screen holding several sliders does not flood the console.
 */
const useIsRTLDeprecationWarning = (isUsingIsRTL: boolean) => {
  useEffect(() => {
    if (!__DEV__ || !isUsingIsRTL || hasWarnedAboutIsRTL) {
      return;
    }
    hasWarnedAboutIsRTL = true;
    console.warn(
      '[rn-video-slider] The `isRTL` prop is deprecated and will be removed in a future major release. ' +
        "Pass `animationDir=\"RTL\"` or `animationDir=\"LTR\"` instead.",
    );
  }, [isUsingIsRTL]);
};

/**
 * Resolves the direction props down to the single question the slider actually
 * asks: does progress grow towards the left?
 *
 * An explicit `animationDir` always wins. While it is `auto`, a supplied
 * (deprecated) `isRTL` is honoured, and only then does the app's layout
 * direction get a say.
 */
export const useIsReversed = (animationDir: AnimationDirection, isRTL?: boolean): boolean => {
  useIsRTLDeprecationWarning(isRTL !== undefined);

  if (animationDir === 'RTL') {
    return true;
  }
  if (animationDir === 'LTR') {
    return false;
  }
  return isRTL ?? I18nManager.isRTL;
};
