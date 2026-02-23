'use client';

import {
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
  const elapsed = calculateElapsedMinutes(timestamp, currentTime);
  const formattedTime =
    variant === 'ago' ? formatElapsedTime(elapsed) : formatDuration(elapsed);
  const colorClass = showWarning
    ? getElapsedTimeColorClass(elapsed, warningThreshold, criticalThreshold)
    : '';

  return <span className={colorClass}>{formattedTime}</span>;
}
