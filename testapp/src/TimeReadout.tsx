import React, {Ref, useImperativeHandle, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {formatTime} from './formatTime';
import {colors, spacing} from './theme';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  current: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  total: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});

export type TimeReadoutHandle = {
  /** Pushes a new playback position. Cheap to call at gesture frequency. */
  setCurrentTime: (seconds: number) => void;
};

type TimeReadoutProps = {
  duration: number;
  ref?: Ref<TimeReadoutHandle>;
};

/**
 * Displays the playback position without re-rendering its parent.
 *
 * The position is pushed in imperatively — the same trick the Slider itself
 * uses — so a playing video does not re-render the player tree four times a
 * second. Internally it re-renders at most once per displayed second, because
 * setState bails out when the formatted label is unchanged.
 */
function TimeReadout({duration, ref}: TimeReadoutProps) {
  const [label, setLabel] = useState(() => formatTime(0));

  useImperativeHandle(
    ref,
    () => ({
      setCurrentTime: (seconds: number) => {
        const next = formatTime(seconds);
        setLabel(previous => (previous === next ? previous : next));
      },
    }),
    [],
  );

  return (
    <View style={styles.row}>
      <Text style={styles.current}>{label}</Text>
      <Text style={styles.total}>{`/ ${formatTime(duration)}`}</Text>
    </View>
  );
}

export default React.memo(TimeReadout);
