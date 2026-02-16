'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Power } from 'lucide-react';
import { Stand, Event } from '@/lib/db';
import {
  getStand,
  getStandEvents,
  recordAction,
  endSession,
  updateStandNote,
  updateStandFlavor,
  getSessionStartTime,
} from '@/lib/domain';
import { ActionTypeDisplay } from '@/components/stand/ActionTypeDisplay';
import { ElapsedTimeDisplay } from '@/components/stand/ElapsedTimeDisplay';
import { QuickActionButtons } from '@/components/stand/QuickActionButtons';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { formatTime } from '@/lib/utils/time';
import { UPDATE_INTERVAL } from '@/lib/utils/constants';

export default function StandDetailPage() {
  const router = useRouter();
  const params = useParams();
  const standId = params.id as string;

  const [stand, setStand] = useState<Stand | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<'flavor' | 'note' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  useEffect(() => {
    loadData();
  }, [standId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, UPDATE_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const standData = await getStand(standId);
      const eventsData = await getStandEvents(standId);
      const startTime = await getSessionStartTime(standId);
      setStand(standData || null);
      setEvents(eventsData);
      setSessionStartTime(startTime);
    } catch (err) {
      console.error('Failed to load stand:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (actionType: 'ash' | 'coal' | 'adjust') => {
    try {
      await recordAction(standId, actionType);
      await loadData();
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const handleEndSession = async () => {
    setShowConfirmEnd(true);
  };

  const confirmEndSession = async () => {
    try {
      await endSession(standId);
      router.push('/');
    } catch (err) {
      console.error('End session failed:', err);
    }
  };

  const handleEditStart = (field: 'flavor' | 'note') => {
    setEditingField(field);
    setEditValue(field === 'flavor' ? stand?.flavor || '' : stand?.note || '');
  };

  const handleSaveEdit = async () => {
    if (editingField === 'flavor') {
      await updateStandFlavor(standId, editValue);
    } else if (editingField === 'note') {
      await updateStandNote(standId, editValue);
    }
    setEditingField(null);
    await loadData();
  };

  if (loading) {
    return (
      <main className="flex-1 max-w-2xl mx-auto w-full p-4 flex items-center justify-center">
        <p className="text-slate-400">読込中...</p>
      </main>
    );
  }

  if (!stand) {
    return (
      <main className="flex-1 max-w-2xl mx-auto w-full p-4">
        <Link href="/">
          <button className="inline-flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-slate-50 mb-4">
            <ArrowLeft size={18} />
            戻る
          </button>
        </Link>
        <p className="text-slate-400">スタンドが見つかりません</p>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full p-4">
      {/* Header */}
      <div className="mb-6">
        <Link href="/">
          <button className="inline-flex items-center gap-2 px-3 py-2 text-slate-300 hover:neon-cyan transition-colors mb-4">
            <ArrowLeft size={18} />
            戻る
          </button>
        </Link>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h1 className="text-xl font-semibold text-slate-50 mb-4">
            {stand.number}番台
          </h1>

          {/* Flavor */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-slate-300">
                フレーバー
              </label>
              {!editingField && (
                <button
                  onClick={() => handleEditStart('flavor')}
                  className="text-slate-400 hover:neon-cyan transition-colors"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
            {editingField === 'flavor' ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-2 border-2 rounded-lg bg-slate-900 text-slate-50 focus:outline-none neon-border-cyan"
                />
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-slate-900 rounded-lg font-medium neon-border-cyan hover:shadow-lg transition-all"
                >
                  <span className="neon-cyan">保存</span>
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="px-4 py-2 bg-slate-900 rounded-lg font-medium neon-border-purple hover:shadow-lg transition-all"
                >
                  <span className="neon-purple">キャンセル</span>
                </button>
              </div>
            ) : (
              <p className="text-slate-50 text-lg">
                {stand.flavor || <span className="text-slate-400">未設定</span>}
              </p>
            )}
          </div>

          {/* Note */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-slate-300">メモ</label>
              {!editingField && (
                <button
                  onClick={() => handleEditStart('note')}
                  className="text-slate-400 hover:neon-cyan transition-colors"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
            {editingField === 'note' ? (
              <div className="flex gap-2">
                <textarea
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-2 border-2 rounded-lg bg-slate-900 text-slate-50 focus:outline-none neon-border-cyan"
                  rows={3}
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-slate-900 rounded-lg font-medium neon-border-cyan hover:shadow-lg transition-all"
                  >
                    <span className="neon-cyan">保存</span>
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="px-4 py-2 bg-slate-900 rounded-lg font-medium neon-border-purple hover:shadow-lg transition-all"
                  >
                    <span className="neon-purple">キャンセル</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-50">
                {stand.note ? (
                  <span className="italic">{stand.note}</span>
                ) : (
                  <span className="text-slate-400">未設定</span>
                )}
              </p>
            )}
          </div>

          {/* Last Action */}
          <div className="text-sm text-slate-400 border-t border-slate-700 pt-4">
            <div className="flex gap-6 mb-2">
              {stand.lastActionType && stand.lastActionAt && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">最終メンテ:</span>{' '}
                  <ActionTypeDisplay actionType={stand.lastActionType} size={14} showLabel />
                  {' '}
                  <ElapsedTimeDisplay
                    timestamp={stand.lastActionAt}
                    currentTime={currentTime}
                    variant="ago"
                    showWarning
                  />
                </div>
              )}
              <div>
                <span className="font-medium">経過時間:</span>{' '}
                {sessionStartTime ? (
                  <ElapsedTimeDisplay
                    timestamp={sessionStartTime}
                    currentTime={currentTime}
                    variant="duration"
                  />
                ) : (
                  '—'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {stand.status === 'active' && (
        <div className="mb-6">
          <QuickActionButtons onAction={handleQuickAction} />
        </div>
      )}

      {/* Events */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-slate-300 mb-3">
          履歴 (最新10件)
        </h2>

        {events.length === 0 ? (
          <p className="text-sm text-slate-400 py-4">イベントがありません</p>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <div key={event.id} className="p-3 bg-slate-800 rounded border border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1 font-medium text-slate-50">
                    <ActionTypeDisplay actionType={event.type} size={14} showLabel />
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatTime(event.at)}
                    {event.at && (
                      <>
                        {' '}
                        (
                        <ElapsedTimeDisplay
                          timestamp={event.at}
                          currentTime={currentTime}
                          variant="ago"
                        />
                        )
                      </>
                    )}
                  </span>
                </div>
                {event.memo && (
                  <p className="text-sm text-slate-300 italic">{event.memo}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* End Session Button */}
      {stand.status === 'active' && (
        <div className="flex justify-center mb-8">
          <button
            onClick={handleEndSession}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 font-medium text-sm border border-red-800"
          >
            <Power size={18} />
            セッション終了
          </button>
        </div>
      )}

      {/* End Session Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmEnd}
        onClose={() => setShowConfirmEnd(false)}
        onConfirm={confirmEndSession}
        title="セッション終了の確認"
        message={`${stand?.number}番台${stand?.flavor ? ` ${stand.flavor}` : ''}`}
        variant="danger"
      />
    </main>
  );
}
