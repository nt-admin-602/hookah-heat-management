/**
 * Shared type definitions
 */

// Re-export DB types
export type { Stand, Event } from '../db';

// Action types
export type ActionType = 'create' | 'ash' | 'coal' | 'adjust';
export type EventType = ActionType | 'note' | 'end';

// UI variants
export type ButtonVariant = 'cyan' | 'pink' | 'purple' | 'yellow' | 'red';
export type NeonColor = 'cyan' | 'pink' | 'purple' | 'yellow' | 'red' | 'green';
