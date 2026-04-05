import { db, Coal } from './db';
import type { CoalType } from './types/coal';

// Helper to generate UUID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Create a new coal preparation
 */
export async function createCoal(type: CoalType): Promise<Coal> {
  const now = Date.now();
  const coal: Coal = {
    id: generateId(),
    type,
    status: 'preparing',
    startedAt: now,
  };

  await db.coals.add(coal);
  return coal;
}

/**
 * Mark coal as completed (ready to use)
 */
export async function completeCoal(coalId: string): Promise<void> {
  const now = Date.now();
  await db.coals.update(coalId, {
    status: 'completed',
    completedAt: now,
  });

  // Delete completed coal from database
  await db.coals.delete(coalId);
}

/**
 * Get all preparing coals sorted by start time (oldest first)
 */
export async function getPreparingCoals(): Promise<Coal[]> {
  const coals = await db.coals
    .where('status')
    .equals('preparing')
    .toArray();

  return coals.sort((a, b) => a.startedAt - b.startedAt);
}
