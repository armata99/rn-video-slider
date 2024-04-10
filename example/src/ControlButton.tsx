import React from 'react';
import {TouchableOpacity, Image, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  icon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
});

const ControlButton = (props: any) => {
  return (
    <TouchableOpacity
      style={[styles.button, props.style]}
      onPress={props.onPress}>
      <Image style={styles.icon} source={props.iconPath} />
    </TouchableOpacity>
  );
};

export default ControlButton;
