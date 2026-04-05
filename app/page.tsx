'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Hourglass, Flame, Sliders, Settings, Square, Box, Hexagon } from 'lucide-react';
import { Stand, Coal } from '@/lib/db';
import { getActiveStands, createStand, recordAction, endSession, getAllFlavors, getSessionStartTime } from '@/lib/domain';
import { createCoal, completeCoal, getPreparingCoals } from '@/lib/coal-domain';
import { ActionTypeDisplay } from '@/components/stand/ActionTypeDisplay';
import { ElapsedTimeDisplay } from '@/components/stand/ElapsedTimeDisplay';
import { CoalTypeDisplay } from '@/components/coal/CoalTypeDisplay';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { UPDATE_INTERVAL } from '@/lib/utils/constants';
import { loadSettings, saveSettings, AppSettings } from '@/lib/utils/settings';
import { calculateElapsedMinutes } from '@/lib/utils/time';
import type { CoalType } from '@/lib/types/coal';

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.6);
  } catch {
    // AudioContext not available
  }
}

export default function StandListPage() {
  const router = useRouter();
  const [stands, setStands] = useState<Stand[]>([]);
  const [coals, setCoals] = useState<Coal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAddCoalModal, setShowAddCoalModal] = useState(false);
  const [formData, setFormData] = useState({ number: '', flavor: '' });
  const [flavors, setFlavors] = useState<string[]>([]);
  const [showFlavorList, setShowFlavorList] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [sessionStartTimes, setSessionStartTimes] = useState<Record<string, number>>({});
  const [confirmEndSession, setConfirmEndSession] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  // Track which stand IDs were already in critical state (to avoid repeat sounds)
  const criticalStandIdsRef = useRef<Set<string>>(new Set());
  // Track which coal IDs were already warned (to avoid repeat sounds)
  const warnedCoalIdsRef = useRef<Set<string>>(new Set());
  // Flag to skip sound on initial load
  const initialLoadDoneRef = useRef(false);

  useEffect(() => {
    loadStands();
    loadFlavors();
    loadCoals();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, UPDATE_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  // Check for newly critical stands when time or stands change
  useEffect(() => {
    if (!initialLoadDoneRef.current || stands.length === 0) return;

    const now = Date.now();
    const newCritical = new Set<string>();

    stands.forEach((stand) => {
      if (stand.lastActionAt) {
        const elapsed = calculateElapsedMinutes(stand.lastActionAt, now);
        if (elapsed >= settings.criticalThreshold) {
          newCritical.add(stand.id);
        }
      }
    });

    // Find stands that just became critical
    const newlyRed = [...newCritical].filter((id) => !criticalStandIdsRef.current.has(id));
    if (newlyRed.length > 0 && settings.notificationEnabled) {
      playNotificationSound();
    }

    criticalStandIdsRef.current = newCritical;
  }, [currentTime, stands, settings.criticalThreshold, settings.notificationEnabled]);

  // Check for coals that reached warning time
  useEffect(() => {
    if (!initialLoadDoneRef.current || coals.length === 0) return;

    const now = Date.now();
    const newWarned = new Set<string>();

    coals.forEach((coal) => {
      const elapsedMinutes = calculateElapsedMinutes(coal.startedAt, now);
      const warningTime = settings.coalWarningTime[coal.type];
      if (elapsedMinutes >= warningTime) {
        newWarned.add(coal.id);
      }
    });

    // Find coals that just reached warning time
    const newlyWarned = [...newWarned].filter((id) => !warnedCoalIdsRef.current.has(id));
    if (newlyWarned.length > 0 && settings.notificationEnabled) {
      playNotificationSound();
    }

    warnedCoalIdsRef.current = newWarned;
  }, [currentTime, coals, settings.coalWarningTime, settings.notificationEnabled]);

  useEffect(() => {
    if (!showForm) {
      setShowFlavorList(false);
    }
  }, [showForm]);

  const loadStands = async () => {
    setLoading(true);
    try {
      const data = await getActiveStands();
      setStands(data);

      // Load session start times for all stands
      const startTimes: Record<string, number> = {};
      await Promise.all(
        data.map(async (stand) => {
          const startTime = await getSessionStartTime(stand.id);
          if (startTime) {
            startTimes[stand.id] = startTime;
          }
        })
      );
      setSessionStartTimes(startTimes);

      // Initialize critical state without playing sound
      const now = Date.now();
      const initialCritical = new Set<string>();
      data.forEach((stand) => {
        if (stand.lastActionAt) {
          const elapsed = calculateElapsedMinutes(stand.lastActionAt, now);
          if (elapsed >= settings.criticalThreshold) {
            initialCritical.add(stand.id);
          }
        }
      });
      criticalStandIdsRef.current = initialCritical;
      initialLoadDoneRef.current = true;
    } catch (err) {
      console.error('Failed to load stands:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFlavors = async () => {
    try {
      const data = await getAllFlavors();
      setFlavors(data);
    } catch (err) {
      console.error('Failed to load flavors:', err);
    }
  };

  const loadCoals = async () => {
    try {
      const data = await getPreparingCoals();
      setCoals(data);
    } catch (err) {
      console.error('Failed to load coals:', err);
    }
  };

  const handleCreateStand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number) return;

    try {
      await createStand(parseInt(formData.number, 10), formData.flavor || undefined);
      setFormData({ number: '', flavor: '' });
      setShowFlavorList(false);
      setShowForm(false);
      await loadStands();
      await loadFlavors();
    } catch (err) {
      console.error('Failed to create stand:', err);
    }
  };

  const handleQuickAction = async (standId: string, actionType: 'steam' | 'coal' | 'adjust', e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await recordAction(standId, actionType);
      // Stand is no longer critical after action
      criticalStandIdsRef.current.delete(standId);
      await loadStands();
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const handleEndSession = async (standId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmEndSession(standId);
  };

  const confirmEndSessionAction = async () => {
    if (!confirmEndSession) return;

    try {
      await endSession(confirmEndSession);
      criticalStandIdsRef.current.delete(confirmEndSession);
      await loadStands();
      setConfirmEndSession(null);
    } catch (err) {
      console.error('End session failed:', err);
    }
  };

  const handleAddCoal = async (type: CoalType) => {
    try {
      await createCoal(type);
      setShowAddCoalModal(false);
      await loadCoals();
    } catch (err) {
      console.error('Failed to create coal:', err);
    }
  };

  const handleCompleteCoal = async (coalId: string) => {
    try {
      await completeCoal(coalId);
      warnedCoalIdsRef.current.delete(coalId);
      await loadCoals();
    } catch (err) {
      console.error('Failed to complete coal:', err);
    }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    // Re-initialize critical stands with new threshold
    const now = Date.now();
    const updatedCritical = new Set<string>();
    stands.forEach((stand) => {
      if (stand.lastActionAt) {
        const elapsed = calculateElapsedMinutes(stand.lastActionAt, now);
        if (elapsed >= newSettings.criticalThreshold) {
          updatedCritical.add(stand.id);
        }
      }
    });
    criticalStandIdsRef.current = updatedCritical;
  };

  // Create unified list of stands and coals, sorted by oldest first
  type Item =
    | { type: 'stand'; data: Stand; timestamp: number }
    | { type: 'coal'; data: Coal; timestamp: number };

  const unifiedItems: Item[] = [
    ...stands.map(stand => ({
      type: 'stand' as const,
      data: stand,
      timestamp: stand.lastActionAt || stand.endedAt || Date.now(),
    })),
    ...coals.map(coal => ({
      type: 'coal' as const,
      data: coal,
      timestamp: coal.startedAt,
    })),
  ].sort((a, b) => a.timestamp - b.timestamp); // Oldest first

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light neon-red font-[family-name:var(--font-stick)]">オキビモリ</h1>
          <p className="text-sm text-slate-400"></p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddCoalModal(true)}
            className="px-4 py-2 bg-slate-900 rounded-lg font-medium neon-border-cyan hover:shadow-lg transition-all"
          >
            <span className="neon-cyan">炭準備</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-slate-900 rounded-lg font-medium neon-border-yellow hover:shadow-lg transition-all"
          >
            <span className="neon-yellow">台追加</span>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 bg-slate-900 rounded-lg neon-border-purple hover:shadow-lg transition-all"
            title="設定"
          >
            <Settings size={20} className="neon-purple" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-400">読込中...</p>
        </div>
      ) : unifiedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <p className="text-slate-400">まず、セッションまたは炭準備を追加してみてください♪</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 mb-6">
            {unifiedItems.map((item) => {
              if (item.type === 'coal') {
                const coal = item.data;
                return (
                  <div key={`coal-${coal.id}`} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between gap-4">
                      <CoalTypeDisplay type={coal.type} size={20} />
                      <div className="flex-1 text-right">
                        <ElapsedTimeDisplay
                          timestamp={coal.startedAt}
                          currentTime={currentTime}
                          variant="ago"
                          showWarning
                          warningThreshold={settings.coalWarningTime[coal.type]}
                          criticalThreshold={settings.coalWarningTime[coal.type]}
                        />
                      </div>
                      <button
                        onClick={() => handleCompleteCoal(coal.id)}
                        className="px-4 py-2 bg-green-900/30 text-green-400 rounded hover:bg-green-900/50 font-medium border border-green-800 transition-all whitespace-nowrap"
                      >
                        完了
                      </button>
                    </div>
                  </div>
                );
              } else {
                const stand = item.data;
                return (
              <div key={stand.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-400 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl font-semibold neon-cyan">
                    {stand.number}番台
                  </span>
                  {stand.flavor && (
                    <span className="text-2xl font-semibold neon-green">{stand.flavor}</span>
                  )}
                </div>

                <div className="flex gap-6 text-sm text-slate-400 mb-3">
                  {stand.lastActionType && stand.lastActionAt && stand.lastActionType !== 'create' && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">最終メンテ:</span>{' '}
                      <ActionTypeDisplay actionType={stand.lastActionType} size={14} showLabel />
                      {' '}
                      <ElapsedTimeDisplay
                        timestamp={stand.lastActionAt}
                        currentTime={currentTime}
                        variant="ago"
                        showWarning
                        warningThreshold={settings.warningThreshold}
                        criticalThreshold={settings.criticalThreshold}
                      />
                    </div>
                  )}
                  <div>
                    <span className="font-medium">経過時間:</span>{' '}
                    {sessionStartTimes[stand.id] ? (
                      <ElapsedTimeDisplay
                        timestamp={sessionStartTimes[stand.id]}
                        currentTime={currentTime}
                        variant="duration"
                      />
                    ) : (
                      '—'
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  <button
                    onClick={(e) => handleQuickAction(stand.id, 'steam', e)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 rounded hover:shadow-lg font-medium flex flex-col items-center gap-1 neon-border-green transition-all"
                  >
                    <Hourglass size={24} className="neon-green" />
                    <span className="neon-green">蒸らし</span>
                  </button>
                  <button
                    onClick={(e) => handleQuickAction(stand.id, 'coal', e)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 rounded hover:shadow-lg font-medium flex flex-col items-center gap-1 neon-border-pink transition-all"
                  >
                    <Flame size={24} className="neon-pink" />
                    <span className="neon-pink">炭交換</span>
                  </button>
                  <button
                    onClick={(e) => handleQuickAction(stand.id, 'adjust', e)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 rounded hover:shadow-lg font-medium flex flex-col items-center gap-1 neon-border-purple transition-all"
                  >
                    <Sliders size={24} className="neon-purple" />
                    <span className="neon-purple">調整</span>
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
                );
              }
            })}
          </div>
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full border border-slate-700">
            <h2 className="text-xl font-semibold text-slate-50 mb-4">
              新しいセッションを追加
            </h2>

            <form onSubmit={handleCreateStand} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  シーシャ台番号
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData({ ...formData, number: String(num) })}
                      className={`py-3 rounded-lg font-bold text-lg transition-all ${
                        formData.number === String(num)
                          ? 'neon-border-pink'
                          : 'neon-border-cyan'
                      }`}
                    >
                      <span className={formData.number === String(num) ? 'neon-pink' : 'neon-cyan'}>
                        {num}
                      </span>
                    </button>
                  ))}
                </div>
                {formData.number && (
                  <p className="text-sm text-slate-400 mt-2">
                    選択: <span className="neon-cyan font-semibold">{formData.number}番台</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  フレーバー名
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.flavor}
                    onChange={(e) =>
                      setFormData({ ...formData, flavor: e.target.value })
                    }
                    onFocus={() => setShowFlavorList(true)}
                    className="w-full px-3 py-2 border-2 rounded-lg bg-slate-900 text-slate-50 focus:outline-none neon-border-cyan"
                    placeholder="新規入力または選択"
                  />
                  {showFlavorList && flavors.length > 0 && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-slate-900 border-2 neon-border-cyan rounded-lg z-10 max-h-32 overflow-y-auto">
                      {flavors.slice(0, 10).map((flavor) => (
                        <button
                          key={flavor}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setFormData({ ...formData, flavor });
                            setShowFlavorList(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-slate-50 hover:bg-slate-800 transition-colors"
                        >
                          {flavor}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!formData.number}
                  className="flex-1 px-4 py-2 bg-slate-900 rounded-lg font-medium neon-border-cyan disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  <span className="neon-cyan">追加</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ number: '', flavor: '' });
                    setShowFlavorList(false);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-900 rounded-lg font-medium neon-border-purple hover:shadow-lg transition-all"
                >
                  <span className="neon-purple">キャンセル</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coal Modal */}
      {showAddCoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full border border-slate-700">
            <h2 className="text-xl font-semibold text-slate-50 mb-4">
              炭の準備を開始
            </h2>

            <div className="grid grid-cols-1 gap-3 mb-4">
              <button
                className="py-4 neon-border-yellow rounded-lg hover:shadow-lg transition-all"
                onClick={() => handleAddCoal('flat')}
              >
                <Square size={32} className="mx-auto mb-1 neon-yellow" />
                <span className="neon-yellow text-lg font-semibold">フラット</span>
              </button>
              <button
                className="py-4 neon-border-pink rounded-lg hover:shadow-lg transition-all"
                onClick={() => handleAddCoal('cube')}
              >
                <Box size={32} className="mx-auto mb-1 neon-pink" />
                <span className="neon-pink text-lg font-semibold">キューブ</span>
              </button>
              <button
                className="py-4 neon-border-purple rounded-lg hover:shadow-lg transition-all"
                onClick={() => handleAddCoal('hexa')}
              >
                <Hexagon size={32} className="mx-auto mb-1 neon-purple" />
                <span className="neon-purple text-lg font-semibold">ヘキサ</span>
              </button>
            </div>

            <button
              onClick={() => setShowAddCoalModal(false)}
              className="w-full px-4 py-2 bg-slate-900 rounded-lg font-medium neon-border-cyan hover:shadow-lg transition-all"
            >
              <span className="neon-cyan">キャンセル</span>
            </button>
          </div>
        </div>
      )}

      {/* End Session Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!confirmEndSession}
        onClose={() => setConfirmEndSession(null)}
        onConfirm={confirmEndSessionAction}
        title="セッション終了の確認"
        message={(() => {
          const stand = stands.find(s => s.id === confirmEndSession);
          return `${stand?.number}番台${stand?.flavor ? ` ${stand.flavor}` : ''}`;
        })()}
        variant="danger"
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </main>
  );
}
