import Dexie, { Table } from 'dexie';

export interface Stand {
  id: string;
  number: number;
  flavor?: string;
  note?: string;
  status: 'active' | 'ended';
  lastActionType?: 'create' | 'steam' | 'coal' | 'adjust';
  lastActionAt?: number;
  endedAt?: number;
}

export interface Event {
  id: string;
  standId: string;
  type: 'create' | 'steam' | 'coal' | 'adjust' | 'note' | 'end';
  at: number;
  memo?: string;
}

export interface Coal {
  id: string;
  type: 'flat' | 'cube' | 'hexa';
  status: 'preparing' | 'completed';
  startedAt: number;
  completedAt?: number;
}

export class HookahDB extends Dexie {
  stands!: Table<Stand>;
  events!: Table<Event>;
  coals!: Table<Coal>;

  constructor() {
    super('HookahHeatManagement');
    this.version(1).stores({
      stands: 'id, number, status',
      events: 'id, standId, at',
    });
    this.version(2).stores({
      stands: 'id, number, status',
      events: 'id, standId, at',
      coals: 'id, status',
    });
  }
}

export const db = new HookahDB();
