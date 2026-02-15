import { db, Stand, Event } from './db';

// Helper to generate UUID (using a simple approach for browser/node)
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Record an action on a stand (ash, coal, adjust, note)
 */
export async function recordAction(
  standId: string,
  type: 'ash' | 'coal' | 'adjust' | 'note',
  memo?: string
): Promise<void> {
  const now = Date.now();

  // Create event
  const event: Event = {
    id: generateId(),
    standId,
    type,
    at: now,
    memo,
  };

  // Update stand's lastActionType and lastActionAt
  const stand = await db.stands.get(standId);
  if (!stand) throw new Error(`Stand ${standId} not found`);

  await db.events.add(event);
  await db.stands.update(standId, {
    lastActionType: type === 'note' ? stand.lastActionType : (type as 'ash' | 'coal' | 'adjust'),
    lastActionAt: now,
  });
}

/**
 * End session for a stand
 */
export async function endSession(standId: string): Promise<void> {
  const now = Date.now();

  // Create end event
  const event: Event = {
    id: generateId(),
    standId,
    type: 'end',
    at: now,
  };

  await db.events.add(event);
  await db.stands.update(standId, {
    status: 'ended',
    endedAt: now,
  });
}

/**
 * Sort stands: stale first (oldest lastActionAt),
 * nulls at top, tie-breaker by number ascending
 */
export function sortStands(stands: Stand[]): Stand[] {
  return [...stands].sort((a, b) => {
    // Nulls/undefined first (most stale)
    const aTime = a.lastActionAt ?? -Infinity;
    const bTime = b.lastActionAt ?? -Infinity;

    if (aTime !== bTime) {
      return aTime - bTime;
    }

    // Tie-breaker: by number
    return a.number - b.number;
  });
}

/**
 * Create a new stand
 */
export async function createStand(number: number, flavor?: string): Promise<Stand> {
  const now = Date.now();
  const stand: Stand = {
    id: generateId(),
    number,
    flavor,
    status: 'active',
    lastActionType: 'create',
    lastActionAt: now,
  };

  // Create initial event
  const event: Event = {
    id: generateId(),
    standId: stand.id,
    type: 'create',
    at: now,
  };

  await db.stands.add(stand);
  await db.events.add(event);
  return stand;
}

/**
 * Get all active stands
 */
export async function getActiveStands(): Promise<Stand[]> {
  const stands = await db.stands.where('status').equals('active').toArray();
  return sortStands(stands);
}

/**
 * Get a single stand by ID
 */
export async function getStand(id: string): Promise<Stand | undefined> {
  return db.stands.get(id);
}

/**
 * Get recent events for a stand (latest 10)
 */
export async function getStandEvents(standId: string, limit: number = 10): Promise<Event[]> {
  const events = await db.events
    .where('standId')
    .equals(standId)
    .reverse()
    .sortBy('at');

  return events.slice(0, limit);
}

/**
 * Update stand note
 */
export async function updateStandNote(standId: string, note: string): Promise<void> {
  await db.stands.update(standId, { note });
}

/**
 * Update stand flavor
 */
export async function updateStandFlavor(standId: string, flavor: string): Promise<void> {
  await db.stands.update(standId, { flavor });
}

/**
 * Get all unique flavors from stands
 */
export async function getAllFlavors(): Promise<string[]> {
  const stands = await db.stands.toArray();
  const flavors = stands
    .map((stand) => stand.flavor)
    .filter((flavor): flavor is string => Boolean(flavor));
  return Array.from(new Set(flavors)).sort();
}
