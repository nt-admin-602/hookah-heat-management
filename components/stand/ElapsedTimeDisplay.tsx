'use client';

import {
  calculateElapsedSeconds,
  calculateElapsedMinutes,
  formatElapsedTime,
  formatDuration,
  getElapsedTimeColorClass,
} from '@/lib/utils/time';

interface ElapsedTimeDisplayProps {
  timestamp: number;
  currentTime: number;
  variant: 'ago' | 'duration';
  showWarning?: boolean;
  warningThreshold?: number;
  criticalThreshold?: number;
}

export function ElapsedTimeDisplay({
  timestamp,
  currentTime,
  variant,
  showWarning = false,
  warningThreshold,
  criticalThreshold,
}: ElapsedTimeDisplayProps) {
  const elapsedSeconds = calculateElapsedSeconds(timestamp, currentTime);
  const elapsedMinutes = calculateElapsedMinutes(timestamp, currentTime);
  const formattedTime =
    variant === 'ago' ? formatElapsedTime(elapsedSeconds) : formatDuration(elapsedSeconds);
  const colorClass = showWarning
    ? getElapsedTimeColorClass(elapsedMinutes, warningThreshold, criticalThreshold)
    : '';

  return <span className={colorClass}>{formattedTime}</span>;
}
