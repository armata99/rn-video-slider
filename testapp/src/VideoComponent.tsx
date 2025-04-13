import React, {useRef, useState} from 'react';
import {Dimensions, StyleSheet, View, Text} from 'react-native';
import Video, {OnLoadData, OnProgressData, VideoRef} from 'react-native-video';
import Slider, {SliderRef, Bubble} from '../../src';
import ControlButton from './ControlButton';
import {progressToVideoTime} from './converter';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
  },
  videoView: {width: '100%', height: '30%'},
  controlSet: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
    marginVertical: 10,
  },
  sliderWrapper: {position: 'absolute', bottom: 50, alignSelf: 'center'},
  txtBtn: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  timeIndicator: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 5,
  },
});

enum EPlayerStates {
  LOADING = 'loading',
  PAUSED = 'paused',
  PLAYING = 'playing',
  SLIDING = 'sliding',
  ENDED = 'ended',
}

function convertToTime(seconds: number): string {
  let substringBegin = 0;
  let substringLength = 0;
  if (seconds < 3600) {
    substringBegin = 14;
    substringLength = 5;
  } else if (seconds > 3600) {
    substringBegin = 11;
    substringLength = 8;
  }
  return new Date(seconds * 1000).toISOString().substr(substringBegin, substringLength);
}

const VideoComponent = () => {
  const videoLength = useRef(0);
  const [playerState, setPlayerState] = useState<EPlayerStates>(EPlayerStates.LOADING);
  const [currentTime, setCurrentTime] = useState(0);

  const prevPlayerState = useRef<EPlayerStates>(EPlayerStates.PAUSED);
  const _sliderRef = React.createRef<SliderRef>();
  const _playerRef = React.createRef<VideoRef>();

  const onLoad = ({duration}: OnLoadData) => {
    videoLength.current = duration;
    setPlayerState(EPlayerStates.PAUSED);
  };

  const _onSlide = (value: number) => {
    const result = value * videoLength.current;
    _playerRef.current?.seek(value * videoLength.current);
    setCurrentTime(result);
  };

  const _onSlideStart = () => {
    prevPlayerState.current = playerState;
    setPlayerState(EPlayerStates.SLIDING);
  };

  const _onSlideFinish = () => {
    if (playerState === EPlayerStates.ENDED || prevPlayerState.current === EPlayerStates.ENDED) {
      setPlayerState(EPlayerStates.PAUSED);
    } else {
      setPlayerState(prevPlayerState.current);
    }
  };

  const _renderBubble = (progress: number) => {
    return <Bubble text={progressToVideoTime(progress, videoLength.current)} />;
  };

  const onProgress = ({currentTime: _ct, playableDuration, seekableDuration}: OnProgressData) => {
    setCurrentTime(_ct);
    if (playerState !== EPlayerStates.SLIDING) {
      _sliderRef.current?.setProgress(_ct / seekableDuration);
    }
    _sliderRef.current?.setBufferProgress(playableDuration / seekableDuration);
  };

  const _onPlayPausePress = () => {
    setPlayerState(playerState === EPlayerStates.PLAYING ? EPlayerStates.PAUSED : EPlayerStates.PLAYING);
  };

  const onEnd = () => {
    setPlayerState(EPlayerStates.ENDED);
  };

  const paused = playerState === EPlayerStates.PAUSED || playerState === EPlayerStates.SLIDING;

  return (
    <View style={styles.container}>
      <Video
        ref={_playerRef}
        onProgress={onProgress}
        paused={paused}
        style={styles.videoView}
        resizeMode={'cover'}
        source={{uri: 'https://www.w3schools.com/tags/mov_bbb.mp4'}}
        onLoad={onLoad}
        onEnd={onEnd}
      />
      <View style={styles.controlSet}>
        <Text style={styles.txtBtn} onPress={() => _playerRef.current?.seek(currentTime - 2)}>
          -2s
        </Text>
        <ControlButton
          iconPath={playerState === EPlayerStates.PAUSED ? require('./images/play_icon.png') : require('./images/pause_icon.png')}
          onPress={_onPlayPausePress}
        />
        <Text style={styles.txtBtn} onPress={() => _playerRef.current?.seek(currentTime + 2)}>
          +2s
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.timeIndicator}>{`state: ${playerState}`}</Text>
        <Text style={styles.timeIndicator}>{`${convertToTime(currentTime)} / ${convertToTime(videoLength.current)}`}</Text>
      </View>
      <View style={styles.sliderWrapper}>
        <Slider
          ref={_sliderRef}
          width={Dimensions.get('window').width - 50}
          onSlide={_onSlide}
          onSlideStart={_onSlideStart}
          onSlideFinish={_onSlideFinish}
          renderBubble={_renderBubble}
          thumbSize={16}
          height={5}
        />
      </View>
    </View>
  );
};

export default VideoComponent;
