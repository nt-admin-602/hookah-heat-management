/**
 * Coal type constants and labels
 */

export const COAL_TYPES = {
  FLAT: 'flat',
  CUBE: 'cube',
  HEXA: 'hexa',
} as const;

export const COAL_TYPE_LABELS: Record<string, string> = {
  flat: 'フラット',
  cube: 'キューブ',
  hexa: 'ヘキサ',
} as const;
