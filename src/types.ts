import {ViewStyle} from 'react-native';

/**
 * type of slider's reference object
 */
export interface SliderRef {
  /**
   * Animates main progress slider based on given value
   * @param value is the desired value between 0 and 1
   */
  setProgress: (value: number) => void;
  /**
   * Sets main progress level without any animation
   * @param value is the desired value between 0 and 1
   */
  setColdProgress: (value: number) => void;
  /**
   * Sets progress level of the buffer indicator with a simple timing animation
   * @param value is the desired value between 0 and 1
   */
  setBufferProgress: (value: number) => void;
}

/**
 * type of slider's props object
 */
export interface SliderProps {
  /**
   * width of slider track
   */
  width: number;
  /**
   * height of slider track
   */
  height?: number;
  /**
   * diameter of sliding thumb
   */
  thumbSize?: number;
  /**
   * color of sliding thumb
   */
  thumbColor?: string;
  /**
   * style override for thumb view. Has higher priority than
   * thumbSize and thumbColor
   */
  thumbStyle?: ViewStyle;
  /**
   * color of progress indicator
   */
  progressColor?: string;
  /**
   * color of buffer progress indicator
   */
  bufferProgressColor?: string;
  /**
   * color of underlying view
   */
  trackColor?: string;
  /**
   * overrides direction of movement. setting to "true" makes the slider animate from right to left.
   */
  isRTL?: boolean;
  /**
   * style addon for root view
   */
  rootStyle?: ViewStyle;
  /**
   * activates tap gesture. when set to "true", onSlide function fires on receiving single taps.
   */
  tapActive?: boolean;
  /**
   * sets the initial progress value.
   */
  initialProgress?: number;
  /**
   * sets the initial buffer progress value.
   */
  bufferInitialProgress?: number;
  /**
   * Called when the slider is being moved via a pan or tap gesture.
   * @param value is the current progress value between 0 and 1
   */
  onSlide?: (value: number) => void;
  /**
   * Called when one of tapping or sliding gestures start.
   * @param value is progress value at the moment which is between 0 and 1
   */
  onSlideStart?: (value: number) => void;
  /**
   * Called when one of tapping or sliding gestures finish.
   * @param value is progress value at the moment which is between 0 and 1
   */
  onSlideFinish?: (value: number) => void;
}
