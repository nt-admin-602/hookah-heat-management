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
}

export function ElapsedTimeDisplay({
  timestamp,
  currentTime,
  variant,
  showWarning = false,
}: ElapsedTimeDisplayProps) {
  const elapsed = calculateElapsedMinutes(timestamp, currentTime);
  const formattedTime =
    variant === 'ago' ? formatElapsedTime(elapsed) : formatDuration(elapsed);
  const colorClass = showWarning ? getElapsedTimeColorClass(elapsed) : '';

  return <span className={colorClass}>{formattedTime}</span>;
}
