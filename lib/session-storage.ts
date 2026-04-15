import type { MotivationSession } from '../types.ts';

export const STORAGE_KEY = 'motivation-model.sessions';

const sortSessions = (sessions: MotivationSession[]) => {
  return [...sessions].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt)
  );
};

export const loadStoredSessions = (
  storage: Pick<Storage, 'getItem'>
): MotivationSession[] => {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as MotivationSession[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return sortSessions(
      parsed.filter((session) => session && typeof session === 'object')
    );
  } catch {
    return [];
  }
};

const persist = (
  storage: Pick<Storage, 'setItem' | 'getItem'>,
  sessions: MotivationSession[]
) => {
  const next = sortSessions(sessions);
  storage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const upsertSessionRecord = (
  storage: Pick<Storage, 'setItem' | 'getItem'>,
  session: MotivationSession
) => {
  const existing = loadStoredSessions(storage);
  const next = existing.filter((entry) => entry.id !== session.id);
  next.push(session);
  return persist(storage, next);
};

export const deleteSessionRecord = (
  storage: Pick<Storage, 'setItem' | 'getItem'>,
  sessionId: string
) => {
  const existing = loadStoredSessions(storage);
  return persist(
    storage,
    existing.filter((entry) => entry.id !== sessionId)
  );
};
