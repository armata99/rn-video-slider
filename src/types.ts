import {ViewStyle} from "react-native";

export interface ISlider {
    setProgress: (progress: number) => void;
    setColdProgress: (progress: number) => void;
    setBufferProgress: (progress: number) => void;
}

export interface ISliderProps {
    width: number;
    height?: number;
    thumbSize?: number;
    onSlideStart?: () => void;
    onSlide?: (value: number) => void;
    onSlideFinish?: (progress: number) => void;
    thumbColor?: string;
    progressColor?: string;
    bufferProgressColor?: string;
    trackColor?: string;
    isRTL?: boolean;
    compensateForceRTL?: boolean;
    rootStyle?: ViewStyle;
}
