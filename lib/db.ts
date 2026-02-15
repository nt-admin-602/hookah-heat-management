import Dexie, { Table } from 'dexie';

export interface Stand {
  id: string;
  number: number;
  flavor?: string;
  note?: string;
  status: 'active' | 'ended';
  lastActionType?: 'ash' | 'coal' | 'adjust';
  lastActionAt?: number;
  endedAt?: number;
}

export interface Event {
  id: string;
  standId: string;
  type: 'ash' | 'coal' | 'adjust' | 'note' | 'end';
  at: number;
  memo?: string;
}

export class HookahDB extends Dexie {
  stands!: Table<Stand>;
  events!: Table<Event>;

  constructor() {
    super('HookahHeatManagement');
    this.version(1).stores({
      stands: 'id, number, status',
      events: 'id, standId, at',
    });
  }
}

export const db = new HookahDB();
