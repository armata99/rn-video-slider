import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import VideoComponent from './VideoComponent';
import {colors} from './theme';

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
});

const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.container}>
        <VideoComponent />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default App;
