'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { AppSettings } from '@/lib/utils/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [local, setLocal] = useState<AppSettings>(settings);

  useEffect(() => {
    if (isOpen) setLocal(settings);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const warningVal = Number(local.warningThreshold);
  const criticalVal = Number(local.criticalThreshold);
  const isValid =
    !isNaN(warningVal) &&
    !isNaN(criticalVal) &&
    warningVal >= 1 &&
    criticalVal >= 1 &&
    warningVal < criticalVal;

  const handleSave = () => {
    if (!isValid) return;
    onSave({ ...local, warningThreshold: warningVal, criticalThreshold: criticalVal });
    onClose();
  };

  const inputClass =
    'w-12 py-1 bg-slate-900 border-2 rounded text-slate-50 focus:outline-none text-center text-sm';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-xs w-full border border-slate-700">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-slate-50">設定</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Notification toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-slate-200">通知音</p>
              <p className="text-xs text-slate-400 mt-0.5">赤文字になった時に音を鳴らす</p>
            </div>
            <button
              onClick={() => setLocal({ ...local, notificationEnabled: !local.notificationEnabled })}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                local.notificationEnabled ? 'bg-cyan-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  local.notificationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="border-t border-slate-700" />

          {/* Threshold rows */}
          <div className="space-y-3">
            <p className="text-xs text-slate-400">色変更の経過時間</p>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-200">
                <span className="text-yellow-400 font-medium">黄色</span>表示
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  value={local.warningThreshold}
                  onChange={(e) => setLocal({ ...local, warningThreshold: e.target.value as unknown as number })}
                  className={`${inputClass} border-yellow-400`}
                />
                <span className="text-xs text-slate-400">分以上</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-200">
                <span className="text-red-400 font-medium">赤色</span>表示
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  value={local.criticalThreshold}
                  onChange={(e) => setLocal({ ...local, criticalThreshold: e.target.value as unknown as number })}
                  className={`${inputClass} border-red-500`}
                />
                <span className="text-xs text-slate-400">分以上</span>
              </div>
            </div>

            {!isValid && (
              <p className="text-xs text-red-400">黄色 &lt; 赤色 になるよう設定してください</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="flex-1 px-4 py-2 bg-slate-900 rounded-lg font-medium neon-border-cyan disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            <span className="neon-cyan">保存</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-900 rounded-lg font-medium neon-border-purple hover:shadow-lg transition-all"
          >
            <span className="neon-purple">キャンセル</span>
          </button>
        </div>
      </div>
    </div>
  );
}
