import {ViewStyle} from 'react-native';

export interface ISlider {
  setProgress: (value: number) => void;
  setColdProgress: (value: number) => void;
  setBufferProgress: (value: number) => void;
}

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
}
