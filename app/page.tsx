'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ChevronRight, Trash2, Flame, Settings } from 'lucide-react';
import { Stand } from '@/lib/db';
import { getActiveStands, createStand, recordAction, endSession } from '@/lib/domain';

export default function StandListPage() {
  const router = useRouter();
  const [stands, setStands] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ number: '', flavor: '' });

  useEffect(() => {
    loadStands();
  }, []);

  const loadStands = async () => {
    setLoading(true);
    try {
      const data = await getActiveStands();
      setStands(data);
    } catch (err) {
      console.error('Failed to load stands:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number) return;

    try {
      await createStand(parseInt(formData.number, 10), formData.flavor || undefined);
      setFormData({ number: '', flavor: '' });
      setShowForm(false);
      await loadStands();
    } catch (err) {
      console.error('Failed to create stand:', err);
    }
  };

  const handleQuickAction = async (standId: string, actionType: 'ash' | 'coal' | 'adjust', e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await recordAction(standId, actionType);
      await loadStands();
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const handleEndSession = async (standId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('このスタンドのセッションを終了しますか？')) return;

    try {
      await endSession(standId);
      await loadStands();
    } catch (err) {
      console.error('End session failed:', err);
    }
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '記録なし';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const getElapsedMinutes = (timestamp?: number) => {
    if (!timestamp) return null;
    const elapsed = Math.floor((Date.now() - timestamp) / 60000);
    if (elapsed < 1) return '1分';
    if (elapsed < 60) return `${elapsed}分`;
    const hours = Math.floor(elapsed / 60);
    if (hours < 24) return `${hours}時間`;
    const days = Math.floor(hours / 24);
    return `${days}日`;
  };

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-slate-50 mb-2">HeatManagementMemo</h1>
          <p className="text-sm text-slate-400"></p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-3xl font-light text-slate-50 hover:text-blue-400 transition-colors"
        >
          +
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-400">読込中...</p>
        </div>
      ) : stands.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <p className="text-slate-400">スタンドが見つかりません</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            新規追加
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 mb-6">
            {stands.map((stand) => (
              <div key={stand.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-400 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl font-semibold text-slate-50">
                    {stand.number}番台
                  </span>
                  {stand.flavor && (
                    <span className="text-2xl font-semibold text-slate-400">{stand.flavor}</span>
                  )}
                </div>

                <div className="flex gap-6 text-sm text-slate-400 mb-3">
                  {stand.lastActionType && (
                    <div>
                      <span className="font-medium">最終:</span>{' '}
                      {stand.lastActionType === 'ash' && 'すす捨て'}
                      {stand.lastActionType === 'coal' && '炭交換'}
                      {stand.lastActionType === 'adjust' && '調整'}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">処理時間:</span>{' '}
                    {formatTime(stand.lastActionAt)}
                  </div>
                  <div>
                    <span className="font-medium">経過:</span>{' '}
                    {getElapsedMinutes(stand.lastActionAt) || '—'}
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  <button
                    onClick={(e) => handleQuickAction(stand.id, 'ash', e)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-700 text-slate-50 rounded hover:bg-slate-600 font-medium flex flex-col items-center gap-1"
                  >
                    <Trash2 size={24} />
                    すす捨て
                  </button>
                  <button
                    onClick={(e) => handleQuickAction(stand.id, 'coal', e)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-700 text-slate-50 rounded hover:bg-slate-600 font-medium flex flex-col items-center gap-1"
                  >
                    <Flame size={24} />
                    炭交換
                  </button>
                  <button
                    onClick={(e) => handleQuickAction(stand.id, 'adjust', e)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-700 text-slate-50 rounded hover:bg-slate-600 font-medium flex flex-col items-center gap-1"
                  >
                    <Settings size={24} />
                    調整
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/stands/${stand.id}`)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium inline-flex items-center justify-center gap-1"
                  >
                    詳細
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={(e) => handleEndSession(stand.id, e)}
                    className="flex-1 px-3 py-2 text-sm bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 font-medium border border-red-800"
                  >
                    セッション終了
                  </button>
                </div>

                {stand.note && (
                  <p className="text-sm text-slate-300 mt-3 italic border-t border-slate-700 pt-3">{stand.note}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full border border-slate-700">
            <h2 className="text-xl font-semibold text-slate-50 mb-4">
              新しいスタンドを追加
            </h2>

            <form onSubmit={handleCreateStand} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  スタンド番号 *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  フレーバー (オプション)
                </label>
                <input
                  type="text"
                  value={formData.flavor}
                  onChange={(e) =>
                    setFormData({ ...formData, flavor: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: アップルミント"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  作成
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ number: '', flavor: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 text-slate-50 rounded-lg hover:bg-slate-600"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
