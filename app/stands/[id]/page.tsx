'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Power, Trash2, Flame, Sliders } from 'lucide-react';
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
    }, 60000); // 1分ごとに更新

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

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '記録なし';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const getEventLabel = (type: Event['type']) => {
    const labels: Record<Event['type'], string> = {
      create: '新規追加',
      ash: 'すす捨て',
      coal: '炭交換',
      adjust: '調整',
      note: 'メモ',
      end: 'セッション終了',
    };
    return labels[type];
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
                  {stand.lastActionType === 'create' && (
                    <>
                      <span>新規追加</span>
                    </>
                  )}
                  {stand.lastActionType === 'ash' && (
                    <>
                      <Trash2 size={14} className="neon-cyan inline" />
                      <span>すす捨て</span>
                    </>
                  )}
                  {stand.lastActionType === 'coal' && (
                    <>
                      <Flame size={14} className="neon-pink inline" />
                      <span>炭交換</span>
                    </>
                  )}
                  {stand.lastActionType === 'adjust' && (
                    <>
                      <Sliders size={14} className="neon-purple inline" />
                      <span>調整</span>
                    </>
                  )}
                  {' '}
                  {(() => {
                    const elapsed = Math.floor((currentTime - stand.lastActionAt) / 60000);
                    const colorClass = elapsed > 15 ? 'text-red-400 font-semibold' : elapsed > 10 ? 'text-yellow-400 font-semibold' : '';
                    return <span className={colorClass}>{elapsed < 1 ? '1分前' : `${elapsed}分前`}</span>;
                  })()}
                </div>
              )}
              <div>
                <span className="font-medium">経過時間:</span>{' '}
                {(() => {
                  if (!sessionStartTime) return '—';
                  const elapsed = Math.floor((currentTime - sessionStartTime) / 60000);
                  return <span>{elapsed < 1 ? '1分' : `${elapsed}分`}</span>;
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {stand.status === 'active' && (
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickAction('ash')}
              className="px-3 py-2 text-xs bg-slate-900 rounded hover:shadow-lg font-medium flex flex-col items-center gap-1 neon-border-cyan transition-all"
            >
              <Trash2 size={24} className="neon-cyan" />
              <span className="neon-cyan">すす捨て</span>
            </button>
            <button
              onClick={() => handleQuickAction('coal')}
              className="px-3 py-2 text-xs bg-slate-900 rounded hover:shadow-lg font-medium flex flex-col items-center gap-1 neon-border-pink transition-all"
            >
              <Flame size={24} className="neon-pink" />
              <span className="neon-pink">炭交換</span>
            </button>
            <button
              onClick={() => handleQuickAction('adjust')}
              className="px-3 py-2 text-xs bg-slate-900 rounded hover:shadow-lg font-medium flex flex-col items-center gap-1 neon-border-purple transition-all"
            >
              <Sliders size={24} className="neon-purple" />
              <span className="neon-purple">調整</span>
            </button>
          </div>
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
                    {event.type === 'create' && (
                      <span>{getEventLabel(event.type)}</span>
                    )}
                    {event.type === 'ash' && (
                      <>
                        <Trash2 size={14} className="neon-cyan inline" />
                        <span>{getEventLabel(event.type)}</span>
                      </>
                    )}
                    {event.type === 'coal' && (
                      <>
                        <Flame size={14} className="neon-pink inline" />
                        <span>{getEventLabel(event.type)}</span>
                      </>
                    )}
                    {event.type === 'adjust' && (
                      <>
                        <Sliders size={14} className="neon-purple inline" />
                        <span>{getEventLabel(event.type)}</span>
                      </>
                    )}
                    {event.type === 'note' && (
                      <span>{getEventLabel(event.type)}</span>
                    )}
                    {event.type === 'end' && (
                      <>
                        <Power size={14} className="text-red-400 inline" />
                        <span>{getEventLabel(event.type)}</span>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatTime(event.at)}
                    {' '}
                    {(() => {
                      if (!event.at) return '';
                      const elapsed = Math.floor((currentTime - event.at) / 60000);
                      return `(${elapsed < 1 ? '1分前' : `${elapsed}分前`})`;
                    })()}
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
      {showConfirmEnd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full border-2 border-red-800">
            <h2 className="text-xl font-semibold text-slate-50 mb-4">
              セッション終了の確認
            </h2>
            <p className="text-slate-300 mb-6">
              {stand?.number}番台{stand?.flavor ? ` ${stand.flavor}` : ''}
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmEndSession}
                className="flex-1 px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 font-medium border border-red-800 transition-all"
              >
                終了する
              </button>
              <button
                onClick={() => setShowConfirmEnd(false)}
                className="flex-1 px-4 py-2 bg-slate-900 rounded-lg font-medium neon-border-cyan hover:shadow-lg transition-all"
              >
                <span className="neon-cyan">キャンセル</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
