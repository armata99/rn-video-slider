import {ViewStyle} from 'react-native';

/**
 * type of slider's reference object
 */
export interface SliderRef {
  setProgress: (value: number) => void;
  setColdProgress: (value: number) => void;
  setBufferProgress: (value: number) => void;
}

/**
 * type of slider's props object
 */
export interface SliderProps {
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
