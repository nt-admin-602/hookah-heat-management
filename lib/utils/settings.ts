/**
 * Application settings with localStorage persistence
 */

export interface AppSettings {
  notificationEnabled: boolean;
  warningThreshold: number;  // minutes before yellow
  criticalThreshold: number; // minutes before red
}

const SETTINGS_KEY = 'hookah-settings';

export const DEFAULT_SETTINGS: AppSettings = {
  notificationEnabled: false,
  warningThreshold: 10,
  criticalThreshold: 15,
};

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
