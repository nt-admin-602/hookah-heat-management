'use client';

import { Trash2, Flame, Sliders } from 'lucide-react';

interface QuickActionButtonsProps {
  onAction: (type: 'ash' | 'coal' | 'adjust') => void;
  disabled?: boolean;
}

export function QuickActionButtons({ onAction, disabled = false }: QuickActionButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={() => onAction('ash')}
        disabled={disabled}
        className="px-3 py-2 text-xs bg-slate-900 rounded hover:shadow-lg font-medium flex flex-col items-center gap-1 neon-border-cyan transition-all disabled:opacity-50"
      >
        <Trash2 size={24} className="neon-cyan" />
        <span className="neon-cyan">すす捨て</span>
      </button>
      <button
        onClick={() => onAction('coal')}
        disabled={disabled}
        className="px-3 py-2 text-xs bg-slate-900 rounded hover:shadow-lg font-medium flex flex-col items-center gap-1 neon-border-pink transition-all disabled:opacity-50"
      >
        <Flame size={24} className="neon-pink" />
        <span className="neon-pink">炭交換</span>
      </button>
      <button
        onClick={() => onAction('adjust')}
        disabled={disabled}
        className="px-3 py-2 text-xs bg-slate-900 rounded hover:shadow-lg font-medium flex flex-col items-center gap-1 neon-border-purple transition-all disabled:opacity-50"
      >
        <Sliders size={24} className="neon-purple" />
        <span className="neon-purple">調整</span>
      </button>
    </div>
  );
}
