'use client';

import { Square, Box, Hexagon } from 'lucide-react';
import { COAL_TYPE_LABELS } from '@/lib/utils/coal-constants';
import type { CoalType } from '@/lib/types/coal';

interface CoalTypeDisplayProps {
  type: CoalType;
  size?: number;
  showLabel?: boolean;
}

export function CoalTypeDisplay({ type, size = 16, showLabel = true }: CoalTypeDisplayProps) {
  const renderIcon = () => {
    switch (type) {
      case 'flat':
        return <Square size={size} className="neon-yellow" />;
      case 'cube':
        return <Box size={size} className="neon-pink" />;
      case 'hexa':
        return <Hexagon size={size} className="neon-purple" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {renderIcon()}
      {showLabel && (
        <span className={`font-semibold ${
          type === 'flat' ? 'neon-yellow' :
          type === 'cube' ? 'neon-pink' :
          'neon-purple'
        }`}>
          {COAL_TYPE_LABELS[type]}
        </span>
      )}
    </div>
  );
}
