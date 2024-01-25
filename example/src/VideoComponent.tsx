import React, {useRef} from 'react';
import {Dimensions, StyleSheet, View} from "react-native";
import Video, {OnLoadData, OnProgressData} from 'react-native-video'
import Slider from "rn-video-slider";
import ControlButton from "./ControlButton";
import {useState} from "react";
import {ISlider} from "../../src";

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center'},
    videoView: {width: '100%', height: '100%'},
    controlSet: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    }
})

const VideoComponent = () => {
    const videoLength = useRef(0);
    const [paused, setPaused] = useState(false);
    const _sliderRef = React.createRef<ISlider>();
    const _playerRef = React.createRef<Video>();

    const onLoad = ({duration}: OnLoadData) => {
        videoLength.current = duration;
    }

    const _onSlide = (value: number) => {
        _playerRef.current?.seek(value * videoLength.current);
    };

    const onProgress = ({currentTime, playableDuration, seekableDuration}: OnProgressData) => {
        console.log(currentTime);
        _sliderRef.current?.setProgressWithSpring(currentTime / seekableDuration);
        _sliderRef.current?.setBufferProgress(playableDuration / seekableDuration);
    };

    const _onPlayPausePress = () => {
        setPaused(!paused);
    }

    return (
        <View style={styles.container}>
            <Video
                ref={_playerRef}
                onProgress={onProgress}
                paused={paused} style={styles.videoView}
                resizeMode={'contain'}
                source={{uri: 'https://www.w3schools.com/tags/mov_bbb.mp4'}}
                onLoad={onLoad}
            />
            <View style={styles.controlSet}>
                <ControlButton
                    style={{position: 'absolute'}}
                    iconPath={paused ?
                        require('./images/play_icon.png') :
                        require('./images/pause_icon.png')}
                    onPress={_onPlayPausePress}
                />
                <View style={{position: 'absolute', bottom: 50, alignSelf: 'center'}}>
                    <Slider
                        ref={_sliderRef}
                        width={Dimensions.get('window').width - 100}
                        onSlide={_onSlide}
                    />
                </View>
            </View>
        </View>
    )
}

export default VideoComponent;