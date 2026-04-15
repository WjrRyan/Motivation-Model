import test from 'node:test';
import assert from 'node:assert/strict';

import {
  deleteSessionRecord,
  loadStoredSessions,
  upsertSessionRecord,
} from '../lib/session-storage.ts';
import { createSeedSession } from '../lib/session-utils.ts';

class MemoryStorage implements Storage {
  #store = new Map<string, string>();

  get length() {
    return this.#store.size;
  }

  clear() {
    this.#store.clear();
  }

  getItem(key: string) {
    return this.#store.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.#store.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.#store.delete(key);
  }

  setItem(key: string, value: string) {
    this.#store.set(key, value);
  }
}

test('upsertSessionRecord saves and updates sessions in reverse chronological order', () => {
  const storage = new MemoryStorage();
  const older = {
    ...createSeedSession('Practice piano'),
    id: 'older',
    updatedAt: '2026-04-15T10:00:00.000Z',
  };
  const newer = {
    ...createSeedSession('Learn TypeScript'),
    id: 'newer',
    updatedAt: '2026-04-15T12:00:00.000Z',
  };

  upsertSessionRecord(storage, older);
  const saved = upsertSessionRecord(storage, newer);

  assert.deepEqual(
    saved.map((session) => session.id),
    ['newer', 'older']
  );

  const updated = upsertSessionRecord(storage, {
    ...older,
    topic: 'Practice piano daily',
    updatedAt: '2026-04-15T13:00:00.000Z',
  });

  assert.deepEqual(
    updated.map((session) => session.id),
    ['older', 'newer']
  );
  assert.equal(updated[0]?.topic, 'Practice piano daily');
});

test('loadStoredSessions tolerates malformed storage payloads', () => {
  const storage = new MemoryStorage();
  storage.setItem('motivation-model.sessions', '{broken json');

  assert.deepEqual(loadStoredSessions(storage), []);
});

test('deleteSessionRecord removes a stored session by id', () => {
  const storage = new MemoryStorage();
  const session = {
    ...createSeedSession('Walk every morning'),
    id: 'draft-1',
  };

  upsertSessionRecord(storage, session);
  const next = deleteSessionRecord(storage, 'draft-1');

  assert.deepEqual(next, []);
});
