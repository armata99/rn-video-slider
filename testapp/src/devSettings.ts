import type {AnimationDirection} from '../../src';

export type BubbleMode = 'off' | 'onTouch' | 'always';

export type VideoSample = {
  label: string;
  uri: string;
  /** Why this sample is here — shown in the dev panel. */
  hint: string;
};

export const VIDEO_SAMPLES: readonly VideoSample[] = [
  {
    label: 'short mp4',
    uri: 'https://www.w3schools.com/tags/mov_bbb.mp4',
    hint: '~10s, exercises the m:ss label',
  },
  {
    label: 'long mp4',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    hint: '~10min, exercises slow scrubbing',
  },
  {
    label: 'hls stream',
    uri: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    hint: 'adaptive stream, exercises the buffer indicator',
  },
];

export const PLAYBACK_RATES: readonly number[] = [0.25, 0.5, 1, 1.5, 2];

export type DevSettings = {
  /** Slider `animationDir` prop — pins the fill direction regardless of the app's layout direction. */
  animationDir: AnimationDirection;
  /** Slider `tapActive` prop. */
  tapActive: boolean;
  bubbleMode: BubbleMode;
  thumbSize: number;
  trackHeight: number;
  /** Slider `width`, as a percentage of the window width. */
  widthPercent: number;
  /** Drive progress with `setProgress` (animated) or `setColdProgress` (instant). */
  animateProgress: boolean;
  /** Seek the player on every slide frame instead of only on release. */
  seekWhileScrubbing: boolean;
  /** Ignore `playableDuration` and drive the buffer bar from `bufferPercent`. */
  manualBuffer: boolean;
  bufferPercent: number;
  rate: number;
  muted: boolean;
  sourceIndex: number;
};

export const DEFAULT_DEV_SETTINGS: DevSettings = {
  animationDir: 'auto',
  tapActive: true,
  bubbleMode: 'onTouch',
  thumbSize: 16,
  trackHeight: 5,
  widthPercent: 90,
  animateProgress: true,
  seekWhileScrubbing: false,
  manualBuffer: false,
  bufferPercent: 40,
  rate: 1,
  muted: false,
  sourceIndex: 0,
};

type BooleanKey = {
  [K in keyof DevSettings]: DevSettings[K] extends boolean ? K : never;
}[keyof DevSettings];

type NumericKey = 'thumbSize' | 'trackHeight' | 'widthPercent' | 'bufferPercent';

type Bounds = {min: number; max: number; step: number};

const BOUNDS: Record<NumericKey, Bounds> = {
  thumbSize: {min: 0, max: 48, step: 2},
  trackHeight: {min: 1, max: 32, step: 1},
  widthPercent: {min: 30, max: 100, step: 5},
  bufferPercent: {min: 0, max: 100, step: 10},
};

const BUBBLE_MODES: readonly BubbleMode[] = ['off', 'onTouch', 'always'];

const ANIMATION_DIRS: readonly AnimationDirection[] = ['auto', 'LTR', 'RTL'];

export type DevSettingsAction =
  | {type: 'toggle'; key: BooleanKey}
  | {type: 'step'; key: NumericKey; direction: 1 | -1}
  | {type: 'cycleAnimationDir'}
  | {type: 'cycleBubbleMode'}
  | {type: 'cycleRate'}
  | {type: 'cycleSource'}
  | {type: 'reset'};

function cycle<T>(values: readonly T[], current: T): T {
  const nextIndex = (values.indexOf(current) + 1) % values.length;
  return values[nextIndex];
}

export function devSettingsReducer(state: DevSettings, action: DevSettingsAction): DevSettings {
  switch (action.type) {
    case 'toggle':
      return {...state, [action.key]: !state[action.key]};
    case 'step': {
      const {min, max, step} = BOUNDS[action.key];
      const next = Math.min(max, Math.max(min, state[action.key] + step * action.direction));
      return next === state[action.key] ? state : {...state, [action.key]: next};
    }
    case 'cycleAnimationDir':
      return {...state, animationDir: cycle(ANIMATION_DIRS, state.animationDir)};
    case 'cycleBubbleMode':
      return {...state, bubbleMode: cycle(BUBBLE_MODES, state.bubbleMode)};
    case 'cycleRate':
      return {...state, rate: cycle(PLAYBACK_RATES, state.rate)};
    case 'cycleSource':
      return {...state, sourceIndex: (state.sourceIndex + 1) % VIDEO_SAMPLES.length};
    case 'reset':
      return DEFAULT_DEV_SETTINGS;
  }
}
