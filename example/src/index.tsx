import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import VideoComponent from './VideoComponent';

const styles = StyleSheet.create({
  container: {flex: 1},
});

const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <VideoComponent />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default App;
