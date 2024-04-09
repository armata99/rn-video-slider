import React, {useRef, useState} from 'react';
import {Dimensions, StyleSheet, View} from "react-native";
import Video, {OnLoadData, OnProgressData} from 'react-native-video'
import Slider, {ISlider} from 'rn-video-slider';
import ControlButton from "./ControlButton";

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center'},
    videoView: {width: '100%', height: '100%'},
    controlSet: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sliderWrapper: {position: 'absolute', bottom: 50, alignSelf: 'center'},
})

const VideoComponent = () => {
    const videoLength = useRef(0);
    const [paused, setPaused] = useState(true);
    const _sliderRef = React.createRef<ISlider>();
    const _playerRef = React.createRef<Video>();

    const onLoad = ({duration}: OnLoadData) => {
        videoLength.current = duration;
    }

    const _onSlide = (value: number) => {
        _playerRef.current?.seek(value * videoLength.current);
    };

    const _onSlideStart = () => setPaused(true);

    const _onSlideFinish = () => setPaused(false);

    const onProgress = ({currentTime, playableDuration, seekableDuration}: OnProgressData) => {
        _sliderRef.current?.setProgress(currentTime / seekableDuration);
        _sliderRef.current?.setBufferProgress(playableDuration / seekableDuration);
    };

    const _onPlayPausePress = () => {
        setPaused(!paused);
    }

    const onEnd=()=>{
        _sliderRef.current?.setColdProgress(0);
        _playerRef.current?.seek(0);
    }

    return (
        <View style={styles.container}>
            <Video
                ref={_playerRef}
                onProgress={onProgress}
                paused={paused}
                style={styles.videoView}
                resizeMode={'contain'}
                source={{uri: 'https://www.w3schools.com/tags/mov_bbb.mp4'}}
                onLoad={onLoad}
                onEnd={onEnd}
            />
            <View style={styles.controlSet}>
                <ControlButton
                    style={{position: 'absolute'}}
                    iconPath={paused ?
                        require('./images/play_icon.png') :
                        require('./images/pause_icon.png')}
                    onPress={_onPlayPausePress}
                />
                <View style={styles.sliderWrapper}>
                    <Slider
                        ref={_sliderRef}
                        width={Dimensions.get('window').width - 50}
                        onSlide={_onSlide}
                        onSlideStart={_onSlideStart}
                        onSlideFinish={_onSlideFinish}
                    />
                </View>
            </View>
        </View>
    )
}

export default VideoComponent;
