'use client';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = '終了する',
  cancelLabel = 'キャンセル',
  variant = 'danger',
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const borderColor = variant === 'danger' ? 'border-red-800' : 'border-yellow-600';
  const buttonBg = variant === 'danger' ? 'bg-red-900/30' : 'bg-yellow-900/30';
  const buttonText = variant === 'danger' ? 'text-red-400' : 'text-yellow-400';
  const buttonBorder = variant === 'danger' ? 'border-red-800' : 'border-yellow-600';
  const buttonHover =
    variant === 'danger' ? 'hover:bg-red-900/50' : 'hover:bg-yellow-900/50';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        className={`bg-slate-800 rounded-lg p-6 max-w-sm w-full border-2 ${borderColor}`}
      >
        <h2 className="text-xl font-semibold text-slate-50 mb-4">{title}</h2>
        <p className="text-slate-300 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 ${buttonBg} ${buttonText} rounded-lg ${buttonHover} font-medium border ${buttonBorder} transition-all`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-900 rounded-lg font-medium neon-border-cyan hover:shadow-lg transition-all"
          >
            <span className="neon-cyan">{cancelLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
