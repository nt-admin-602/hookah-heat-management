/**
 * Time calculation and formatting utilities
 */

import { TIME_THRESHOLDS } from './constants';

/**
 * Calculate elapsed time in seconds from a timestamp
 */
export function calculateElapsedSeconds(
  timestamp: number,
  currentTime: number = Date.now()
): number {
  return Math.max(0, Math.floor((currentTime - timestamp) / 1000));
}

/**
 * Calculate elapsed time in minutes from a timestamp
 */
export function calculateElapsedMinutes(
  timestamp: number,
  currentTime: number = Date.now()
): number {
  return Math.max(0, Math.floor((currentTime - timestamp) / 60000));
}

/**
 * Format elapsed time as "X分Y秒前"
 */
export function formatElapsedTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}秒前`;
  }

  return `${minutes}分${remainingSeconds}秒前`;
}

/**
 * Format elapsed time as "X分Y秒" (for duration)
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}秒`;
  }

  return `${minutes}分${remainingSeconds}秒`;
}

/**
 * Get color class based on elapsed time for warning states
 */
export function getElapsedTimeColorClass(
  minutes: number,
  warningThreshold: number = TIME_THRESHOLDS.WARNING,
  criticalThreshold: number = TIME_THRESHOLDS.CRITICAL
): string {
  if (minutes >= criticalThreshold) return 'text-red-400 font-semibold';
  if (minutes >= warningThreshold) return 'text-yellow-400 font-semibold';
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
