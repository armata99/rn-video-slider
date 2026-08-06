const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const PLACEHOLDER = '--:--';

/**
 * Clamps a slider progress value into the 0..1 range the Slider works with.
 * Floating point drift at the extremes is common enough that callers should
 * never assume the raw value is already in range.
 */
export function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

/**
 * Formats a duration in seconds as `m:ss`, or `h:mm:ss` past the hour mark.
 *
 * This runs on the render path of the hovering bubble, so it never throws:
 * a non-finite or negative input yields a placeholder instead.
 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return PLACEHOLDER;
  }

  const total = Math.floor(seconds);
  const hours = Math.floor(total / SECONDS_PER_HOUR);
  const minutes = Math.floor((total % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const remainder = total % SECONDS_PER_MINUTE;

  const paddedSeconds = String(remainder).padStart(2, '0');
  if (hours === 0) {
    return `${minutes}:${paddedSeconds}`;
  }
  return `${hours}:${String(minutes).padStart(2, '0')}:${paddedSeconds}`;
}

/**
 * Converts a 0..1 slider progress value into a displayable timestamp.
 */
export function progressToVideoTime(progress: number, videoLength: number): string {
  if (!Number.isFinite(videoLength) || videoLength <= 0) {
    return PLACEHOLDER;
  }
  return formatTime(clamp01(progress) * videoLength);
}
