import React from 'react';
import {Image, ImageSourcePropType, Pressable, StyleSheet, ViewStyle} from 'react-native';
import {colors, radius} from './theme';

const SIZE = 48;

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.surfaceActive,
    borderColor: colors.borderActive,
  },
  disabled: {
    opacity: 0.4,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});

type ControlButtonProps = {
  iconPath: ImageSourcePropType;
  onPress: () => void;
  accessibilityLabel: string;
  style?: ViewStyle;
  disabled?: boolean;
};

function ControlButton({iconPath, onPress, accessibilityLabel, style, disabled}: ControlButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{disabled: !!disabled}}
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [styles.button, style, pressed && styles.pressed, disabled && styles.disabled]}>
      <Image style={styles.icon} source={iconPath} />
    </Pressable>
  );
}

export default React.memo(ControlButton);
