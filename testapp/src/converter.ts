export function progressToVideoTime(progress: number, videoLength: number): string {
  // Validate inputs
  if (progress < 0 || progress > 1) {
    throw new Error('Progress must be between 0 and 1');
  }
  if (isNaN(videoLength)) {
    throw new Error('Video length must be a number');
  }

  // Calculate the time in seconds (with milliseconds for precision)
  const timeInSeconds = progress * videoLength;

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(timeInSeconds / 3600);
  const remainingSeconds = timeInSeconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  // Format based on duration
  if (timeInSeconds < 60) {
    // Under 1 minute: show 2 decimal places (e.g., "0:45.67")
    return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
  } else if (hours > 0) {
    // Over 1 hour: "h:mm:ss"
    return `${hours}:${minutes.toString().padStart(2, '0')}:${Math.floor(seconds).toString().padStart(2, '0')}`;
  } else {
    // Between 1-60 minutes: "mm:ss"
    return `${minutes}:${Math.floor(seconds).toString().padStart(2, '0')}`;
  }
}
