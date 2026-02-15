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

  useEffect(() => {
    loadData();
  }, [standId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const standData = await getStand(standId);
      const eventsData = await getStandEvents(standId);
      setStand(standData || null);
      setEvents(eventsData);
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
    if (!confirm('このスタンドのセッションを終了しますか？')) return;

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

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP');
  };

  const getEventLabel = (type: Event['type']) => {
    const labels: Record<Event['type'], string> = {
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
          <button className="inline-flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-slate-50 mb-4">
            <ArrowLeft size={18} />
            戻る
          </button>
        </Link>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-semibold text-slate-50">
                スタンド #{stand.number}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Status: {stand.status === 'active' ? 'アクティブ' : '終了'}
              </p>
            </div>
          </div>

          {/* Flavor */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-slate-300">
                フレーバー
              </label>
              <button
                onClick={() => handleEditStart('flavor')}
                className="text-slate-400 hover:text-slate-200"
              >
                <Edit2 size={16} />
              </button>
            </div>
            {editingField === 'flavor' ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-2 py-1 border border-slate-700 rounded text-sm bg-slate-900 text-slate-50"
                />
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  保存
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="px-3 py-1 bg-slate-700 text-slate-50 rounded text-sm hover:bg-slate-600"
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <p className="text-slate-50 font-medium">
                {stand.flavor || '未設定'}
              </p>
            )}
          </div>

          {/* Note */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-slate-300">メモ</label>
              <button
                onClick={() => handleEditStart('note')}
                className="text-slate-400 hover:text-slate-200"
              >
                <Edit2 size={16} />
              </button>
            </div>
            {editingField === 'note' ? (
              <div className="flex gap-2">
                <textarea
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-2 py-1 border border-slate-700 rounded text-sm bg-slate-900 text-slate-50"
                  rows={3}
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="px-3 py-1 bg-slate-700 text-slate-50 rounded text-sm hover:bg-slate-600"
                  >
                    キャンセル
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
            <p>
              <span className="font-medium">最終操作:</span>{' '}
              {stand.lastActionType ? (
                <>
                  {stand.lastActionType === 'ash' && 'すす捨て'}
                  {stand.lastActionType === 'coal' && '炭交換'}
                  {stand.lastActionType === 'adjust' && '調整'}
                  {' - '}
                  {formatTime(stand.lastActionAt || Date.now())}
                </>
              ) : (
                '未設定'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {stand.status === 'active' && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-slate-300 mb-3">クイック操作</h2>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickAction('ash')}
              className="px-4 py-3 bg-slate-700 text-slate-50 rounded-lg hover:bg-slate-600 font-medium text-sm"
            >
              すす捨て
            </button>
            <button
              onClick={() => handleQuickAction('coal')}
              className="px-4 py-3 bg-slate-700 text-slate-50 rounded-lg hover:bg-slate-600 font-medium text-sm"
            >
              炭交換
            </button>
            <button
              onClick={() => handleQuickAction('adjust')}
              className="px-4 py-3 bg-slate-700 text-slate-50 rounded-lg hover:bg-slate-600 font-medium text-sm"
            >
              調整
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
                  <span className="font-medium text-slate-50">
                    {getEventLabel(event.type)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatTime(event.at)}
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
    </main>
  );
}
