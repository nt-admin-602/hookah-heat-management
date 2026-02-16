/**
 * Time calculation and formatting utilities
 */

/**
 * Calculate elapsed time in minutes from a timestamp
 */
export function calculateElapsedMinutes(
  timestamp: number,
  currentTime: number = Date.now()
): number {
  return Math.ceil((currentTime - timestamp) / 60000);
}

/**
 * Format elapsed time as "X分前" or "1分前"
 */
export function formatElapsedTime(minutes: number): string {
  return minutes < 1 ? '1分前' : `${minutes}分前`;
}

/**
 * Format elapsed time as "X分" or "1分" (for duration)
 */
export function formatDuration(minutes: number): string {
  return minutes < 1 ? '1分' : `${minutes}分`;
}

/**
 * Get color class based on elapsed time for warning states
 */
export function getElapsedTimeColorClass(minutes: number): string {
  if (minutes > 15) return 'text-red-400 font-semibold';
  if (minutes > 10) return 'text-yellow-400 font-semibold';
  return '';
}

/**
 * Format timestamp as HH:MM in Japanese locale
 */
export function formatTime(timestamp?: number): string {
  if (!timestamp) return '記録なし';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}
