'use client';

import { Trash2, Flame, Sliders } from 'lucide-react';
import { ActionType } from '@/lib/types';
import { ACTION_LABELS } from '@/lib/utils/constants';

interface ActionTypeDisplayProps {
  actionType: ActionType | 'note' | 'end' | null;
  size?: number;
  showLabel?: boolean;
  className?: string;
}

export function ActionTypeDisplay({
  actionType,
  size = 14,
  showLabel = true,
  className = '',
}: ActionTypeDisplayProps) {
  if (!actionType) return null;

  const getActionContent = () => {
    switch (actionType) {
      case 'create':
        return showLabel ? <span>新規追加</span> : null;
      case 'ash':
        return (
          <>
            <Trash2 size={size} className="neon-cyan" />
            {showLabel && <span>すす捨て</span>}
          </>
        );
      case 'coal':
        return (
          <>
            <Flame size={size} className="neon-pink" />
            {showLabel && <span>炭交換</span>}
          </>
        );
      case 'adjust':
        return (
          <>
            <Sliders size={size} className="neon-purple" />
            {showLabel && <span>調整</span>}
          </>
        );
      default:
        return showLabel ? <span>{ACTION_LABELS[actionType] || actionType}</span> : null;
    }
  };

  return <span className={`inline-flex items-center gap-1 ${className}`}>{getActionContent()}</span>;
}
