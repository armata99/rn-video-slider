import React, {Dispatch, useCallback} from 'react';
import {I18nManager, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {DevSettings, DevSettingsAction, VIDEO_SAMPLES} from './devSettings';
import {colors, radius, spacing} from './theme';

const styles = StyleSheet.create({
  root: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  headerHint: {
    color: colors.textMuted,
    fontSize: 11,
  },
  scroll: {
    maxHeight: 260,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.surfaceActive,
    borderColor: colors.borderActive,
  },
  chipPressed: {
    opacity: 0.6,
  },
  chipLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  chipLabelActive: {
    color: colors.text,
  },
  chipValue: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingLeft: spacing.md,
  },
  stepperLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  stepperValue: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    minWidth: 34,
    textAlign: 'center',
  },
  stepperButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  stepperButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  note: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
  },
});

type ChipProps = {
  label: string;
  value?: string;
  isActive?: boolean;
  onPress: () => void;
};

function Chip({label, value, isActive = false, onPress}: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{selected: isActive}}
      accessibilityLabel={value === undefined ? label : `${label}: ${value}`}
      onPress={onPress}
      style={({pressed}) => [styles.chip, isActive && styles.chipActive, pressed && styles.chipPressed]}>
      <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{label}</Text>
      {value !== undefined && <Text style={styles.chipValue}>{value}</Text>}
    </Pressable>
  );
}

type StepperProps = {
  label: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
};

function Stepper({label, value, onDecrease, onIncrease}: StepperProps) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`decrease ${label}`}
        onPress={onDecrease}
        style={({pressed}) => [styles.stepperButton, pressed && styles.chipPressed]}>
        <Text style={styles.stepperButtonText}>−</Text>
      </Pressable>
      <Text style={styles.stepperValue}>{value}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`increase ${label}`}
        onPress={onIncrease}
        style={({pressed}) => [styles.stepperButton, pressed && styles.chipPressed]}>
        <Text style={styles.stepperButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

type DevPanelProps = {
  settings: DevSettings;
  dispatch: Dispatch<DevSettingsAction>;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onJumpToProgress: (progress: number) => void;
  onClearEvents: () => void;
};

/**
 * On-screen controls for every Slider prop worth exercising by hand, plus a few
 * player-side switches that change what the Slider has to cope with.
 */
function DevPanel({
  settings,
  dispatch,
  isExpanded,
  onToggleExpanded,
  onJumpToProgress,
  onClearEvents,
}: DevPanelProps) {
  const stepDown = useCallback(
    (key: 'thumbSize' | 'trackHeight' | 'widthPercent' | 'bufferPercent') => () =>
      dispatch({type: 'step', key, direction: -1}),
    [dispatch],
  );
  const stepUp = useCallback(
    (key: 'thumbSize' | 'trackHeight' | 'widthPercent' | 'bufferPercent') => () =>
      dispatch({type: 'step', key, direction: 1}),
    [dispatch],
  );

  const sample = VIDEO_SAMPLES[settings.sourceIndex];

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{expanded: isExpanded}}
        onPress={onToggleExpanded}
        style={styles.header}>
        <Text style={styles.headerTitle}>DEV TOOLS</Text>
        <Text style={styles.headerHint}>{isExpanded ? 'tap to hide ▾' : 'tap to show ▸'}</Text>
      </Pressable>

      {isExpanded && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.body}>
          <Text style={styles.sectionTitle}>SLIDER PROPS</Text>
          <View style={styles.chipRow}>
            <Chip
              label="animationDir"
              value={settings.animationDir}
              isActive={settings.animationDir !== 'auto'}
              onPress={() => dispatch({type: 'cycleAnimationDir'})}
            />
            <Chip
              label="tapActive"
              value={settings.tapActive ? 'on' : 'off'}
              isActive={settings.tapActive}
              onPress={() => dispatch({type: 'toggle', key: 'tapActive'})}
            />
            <Chip
              label="bubble"
              value={settings.bubbleMode}
              isActive={settings.bubbleMode !== 'off'}
              onPress={() => dispatch({type: 'cycleBubbleMode'})}
            />
          </View>
          <View style={styles.chipRow}>
            <Stepper
              label="thumb"
              value={String(settings.thumbSize)}
              onDecrease={stepDown('thumbSize')}
              onIncrease={stepUp('thumbSize')}
            />
            <Stepper
              label="height"
              value={String(settings.trackHeight)}
              onDecrease={stepDown('trackHeight')}
              onIncrease={stepUp('trackHeight')}
            />
            <Stepper
              label="width"
              value={`${settings.widthPercent}%`}
              onDecrease={stepDown('widthPercent')}
              onIncrease={stepUp('widthPercent')}
            />
          </View>
          <Text style={styles.note}>
            {`app layout direction is ${I18nManager.isRTL ? 'RTL' : 'LTR'} — animationDir pins the Slider's own direction on both platforms, without a reload`}
          </Text>

          <Text style={styles.sectionTitle}>PROGRESS DRIVER</Text>
          <View style={styles.chipRow}>
            <Chip
              label="ref method"
              value={settings.animateProgress ? 'setProgress' : 'setColdProgress'}
              isActive={settings.animateProgress}
              onPress={() => dispatch({type: 'toggle', key: 'animateProgress'})}
            />
            <Chip
              label="seek while scrubbing"
              value={settings.seekWhileScrubbing ? 'on' : 'off'}
              isActive={settings.seekWhileScrubbing}
              onPress={() => dispatch({type: 'toggle', key: 'seekWhileScrubbing'})}
            />
          </View>
          <View style={styles.chipRow}>
            <Chip label="jump 0%" onPress={() => onJumpToProgress(0)} />
            <Chip label="jump 50%" onPress={() => onJumpToProgress(0.5)} />
            <Chip label="jump 100%" onPress={() => onJumpToProgress(1)} />
          </View>

          <Text style={styles.sectionTitle}>BUFFER INDICATOR</Text>
          <View style={styles.chipRow}>
            <Chip
              label="source"
              value={settings.manualBuffer ? 'manual' : 'player'}
              isActive={settings.manualBuffer}
              onPress={() => dispatch({type: 'toggle', key: 'manualBuffer'})}
            />
            <Stepper
              label="buffer"
              value={`${settings.bufferPercent}%`}
              onDecrease={stepDown('bufferPercent')}
              onIncrease={stepUp('bufferPercent')}
            />
          </View>

          <Text style={styles.sectionTitle}>PLAYER</Text>
          <View style={styles.chipRow}>
            <Chip label="rate" value={`${settings.rate}×`} onPress={() => dispatch({type: 'cycleRate'})} />
            <Chip
              label="muted"
              value={settings.muted ? 'on' : 'off'}
              isActive={settings.muted}
              onPress={() => dispatch({type: 'toggle', key: 'muted'})}
            />
            <Chip label="source" value={sample.label} onPress={() => dispatch({type: 'cycleSource'})} />
          </View>
          <Text style={styles.note}>{sample.hint}</Text>

          <View style={styles.chipRow}>
            <Chip label="clear events" onPress={onClearEvents} />
            <Chip label="reset all" onPress={() => dispatch({type: 'reset'})} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

export default React.memo(DevPanel);
