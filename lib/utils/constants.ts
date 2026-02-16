/**
 * Shared constants across the application
 */

export const ACTION_TYPES = {
  CREATE: 'create',
  ASH: 'ash',
  COAL: 'coal',
  ADJUST: 'adjust',
  NOTE: 'note',
  END: 'end',
} as const;

export const ACTION_LABELS: Record<string, string> = {
  create: '新規追加',
  ash: 'すす捨て',
  coal: '炭交換',
  adjust: '調整',
  note: 'メモ',
  end: 'セッション終了',
} as const;

export const TIME_THRESHOLDS = {
  WARNING: 10, // minutes
  CRITICAL: 15, // minutes
} as const;

export const UPDATE_INTERVAL = 60000; // 1 minute in ms
