import React, {Ref, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, radius, spacing} from './theme';

const MAX_ENTRIES = 4;
/** onSlide fires at gesture frequency; repaint the log at most this often. */
const FLUSH_INTERVAL_MS = 120;

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 2,
  },
  title: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  line: {
    color: colors.text,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  name: {
    color: colors.accent,
    fontWeight: '700',
  },
  empty: {
    color: colors.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
  },
});

type Entry = {
  id: number;
  name: string;
  value: number;
  /** How many consecutive calls this line stands for. */
  count: number;
};

export type EventLogHandle = {
  push: (name: string, value: number) => void;
  clear: () => void;
};

type EventLogProps = {
  ref?: Ref<EventLogHandle>;
};

/**
 * Rolling log of the Slider's callbacks.
 *
 * `onSlide` fires once per gesture frame, so entries are buffered in a ref and
 * flushed on a timer; repeated calls to the same callback collapse into one
 * line with a counter instead of flooding the list.
 */
function EventLog({ref}: EventLogProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const pending = useRef<Entry[]>([]);
  const nextId = useRef(0);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (flushTimer.current !== null) {
        clearTimeout(flushTimer.current);
      }
    },
    [],
  );

  useImperativeHandle(ref, () => {
    const flush = () => {
      flushTimer.current = null;
      setEntries(pending.current);
    };

    const scheduleFlush = () => {
      if (flushTimer.current === null) {
        flushTimer.current = setTimeout(flush, FLUSH_INTERVAL_MS);
      }
    };

    return {
      push: (name: string, value: number) => {
        const [latest, ...rest] = pending.current;
        pending.current =
          latest?.name === name
            ? [{...latest, value, count: latest.count + 1}, ...rest]
            : [{id: nextId.current++, name, value, count: 1}, ...pending.current].slice(0, MAX_ENTRIES);
        scheduleFlush();
      },
      clear: () => {
        pending.current = [];
        setEntries([]);
      },
    };
  }, []);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>SLIDER EVENTS</Text>
      {entries.length === 0 ? (
        <Text style={styles.empty}>waiting for a gesture…</Text>
      ) : (
        entries.map(entry => (
          <Text key={entry.id} style={styles.line} numberOfLines={1}>
            <Text style={styles.name}>{entry.name}</Text>
            {`  ${entry.value.toFixed(4)}${entry.count > 1 ? `  ×${entry.count}` : ''}`}
          </Text>
        ))
      )}
    </View>
  );
}

export default React.memo(EventLog);
