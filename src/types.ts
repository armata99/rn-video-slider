import {ViewStyle} from 'react-native';

/**
 * @Deprecated use ISliderRef instead.
 */
export interface ISlider {
  setProgress: (value: number) => void;
  setColdProgress: (value: number) => void;
  setBufferProgress: (value: number) => void;
}

/**
 * this will have its parent properties on final release
 */
export interface ISliderRef extends ISlider {}

export interface ISliderProps {
  width: number;
  height?: number;
  thumbSize?: number;
  onSlideStart?: (value: number) => void;
  onSlide?: (value: number) => void;
  onSlideFinish?: (value: number) => void;
  thumbColor?: string;
  progressColor?: string;
  bufferProgressColor?: string;
  trackColor?: string;
  isRTL?: boolean;
  rootStyle?: ViewStyle;
  tapActive?: boolean;
  initialProgress?: number;
  bufferInitialProgress?: number;
}
