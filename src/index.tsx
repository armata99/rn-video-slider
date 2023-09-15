import React, {ForwardedRef, forwardRef, useImperativeHandle} from 'react';
import Animated, {
    runOnJS,
    SharedValue,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import {PanGestureHandler, GestureHandlerRootView} from 'react-native-gesture-handler';
import {I18nManager, Platform, StyleSheet, ViewStyle} from 'react-native';

const THUMB_HIT_SLOP = {top: 15, bottom: 15, left: 15, right: 15};

export const DEFAULT_SLIDER_SPRING_CONFIG: object = {
    damping: 250,
    mass: 1,
    stiffness: 50,
    overshootClamping: false,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
};

export interface ISlider {
    setProgress: (progress: number) => void;
    setProgressWithSpring: (progress: number) => void;
    setBufferProgress: (progress: number) => void;
}

interface ISliderProps {
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
}

const styles = StyleSheet.create({
    root: {padding: 10},
    track: {
        overflow: 'visible',
        justifyContent: 'center',
    },
    progress: {
        overflow: 'visible',
        justifyContent: 'center',
        position: 'absolute',
    },
    buffer: {
        overflow: 'visible',
        justifyContent: 'center',
        position: 'absolute',
    },
    thumb: {borderRadius: 50, elevation: 5},
});

const SliderComponent = (props: ISliderProps, ref: ForwardedRef<ISlider>) => {
    const {
        width,
        height = 3,
        thumbSize = 12,
        thumbColor = '#ffffff',
        progressColor = '#ffffff',
        bufferProgressColor = 'rgba(255,255,255, 0.5)',
        trackColor = 'rgba(255,255,255, 0.2)',
        onSlideFinish,
        onSlideStart,
        onSlide,
        isRTL = I18nManager.isRTL,
        compensateForceRTL: _compForceRTL = false,
    } = props;

    const progress = useSharedValue(0);
    const bufferProgress = useSharedValue(0);
    const offsetOverflow = thumbSize / 2;
    const maxDrag = width;
    const minDrag = -offsetOverflow;

    const compensateForceRTL = Platform.OS === 'android' ? _compForceRTL : false;

    useImperativeHandle(ref, () => ({
        setProgress: p => (progress.value = p),
        setProgressWithSpring: p => (progress.value = withSpring(p, DEFAULT_SLIDER_SPRING_CONFIG)),
        setBufferProgress: p => (bufferProgress.value = p),
    }));

    const _onEndHandler = () => {
        onSlideFinish?.(progress.value);
    };

    const _onGestureEvent = useAnimatedGestureHandler({
        onStart: (event, ctx: {startX: number}) => {
            ctx.startX = progress.value * (isRTL ? -width : width);
        },
        onActive: (event: {translationX: number}, ctx) => {
            const nextValue = ctx.startX + event.translationX;
            const clampedValue = Math.max(0, Math.min(nextValue / (isRTL ? -width : width), 1));
            progress.value = clampedValue;
            if (onSlide) {
                runOnJS(onSlide)(clampedValue);
            }
        },
    });

    const thumbOffset = useDerivedValue(() => {
        const nextValue = progress.value * width - offsetOverflow;
        if (nextValue >= minDrag && nextValue <= maxDrag - offsetOverflow) {
            return nextValue;
        } else {
            if (nextValue > maxDrag - offsetOverflow) {
                progress.value = 1;
                return maxDrag - offsetOverflow;
            } else {
                progress.value = 0;
                return minDrag;
            }
        }
    });

    const bufferWidth: SharedValue<number> = useDerivedValue(() => {
        const nextValue = bufferProgress.value * width;
        if (nextValue >= 0 && nextValue <= width) {
            return nextValue;
        } else {
            if (nextValue > width) {
                bufferProgress.value = 1;
                return width;
            } else {
                bufferProgress.value = 0;
                return 0;
            }
        }
    });

    const progressAnimatedStyle = useAnimatedStyle((): ViewStyle => {
        return {
            width: withSpring(thumbOffset.value + offsetOverflow, {stiffness: 1000, damping: 1000}),
        };
    });

    const bufferAnimatedStyle = useAnimatedStyle((): ViewStyle => {
        return {
            width: withTiming(bufferWidth.value),
        };
    });

    const thumbAnimatedStyle = useAnimatedStyle((): ViewStyle => {
        return {
            transform: [{translateX: isRTL || compensateForceRTL ? -thumbOffset.value : thumbOffset.value} as never], //to get rid of weired error
        };
    });

    const trackStyle: ViewStyle = {
        ...styles.track,
        direction: isRTL ? 'rtl' : 'ltr', //this won't work if force RTL is activated at android native level.
        ...(compensateForceRTL && {transform: [{rotateY: '180deg'}]}), //so this will fix it
        backgroundColor: trackColor,
        width,
        height,
    };

    const progressStyle: ViewStyle[] = [
        {
            ...styles.progress,
            backgroundColor: progressColor,
            height,
        },
        progressAnimatedStyle,
    ];

    const bufferStyle: ViewStyle[] = [
        {
            ...styles.buffer,
            backgroundColor: bufferProgressColor,
            height,
        },
        bufferAnimatedStyle,
    ];

    const thumbStyle: ViewStyle[] = [
        {
            ...styles.thumb,
            width: thumbSize,
            height: thumbSize,
            backgroundColor: thumbColor,
        },
        thumbAnimatedStyle,
    ];

    return (
        <GestureHandlerRootView style={styles.root}>
            <Animated.View style={trackStyle}>
                <Animated.View style={progressStyle} />
                <Animated.View style={bufferStyle} />
                <PanGestureHandler onGestureEvent={_onGestureEvent} onActivated={onSlideStart} onEnded={_onEndHandler} minDist={0}>
                    <Animated.View hitSlop={THUMB_HIT_SLOP} style={thumbStyle} />
                </PanGestureHandler>
            </Animated.View>
        </GestureHandlerRootView>
    );
};

export default forwardRef(SliderComponent);
