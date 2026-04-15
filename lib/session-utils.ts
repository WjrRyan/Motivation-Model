import type {
  MotivationItem,
  MotivationSession,
  MotivationSessionPayload,
  SessionArrayKey,
  SessionListKey,
  SessionRegenerationKey,
} from '../types.ts';

const MAX_CATEGORY_ITEMS = 4;
const MAX_OBSTACLES = 4;

const uniqueTextItems = (value: unknown, limit: number) => {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const items: string[] = [];

  for (const entry of value) {
    if (typeof entry !== 'string') {
      continue;
    }

    const text = entry.trim();
    if (!text || seen.has(text)) {
      continue;
    }

    seen.add(text);
    items.push(text);

    if (items.length === limit) {
      break;
    }
  }

  return items;
};

const optionalText = (value: unknown) => {
  return typeof value === 'string' ? value.trim() : '';
};

const createItem = (text: string): MotivationItem => ({
  id: crypto.randomUUID(),
  text,
});

const createItems = (value: unknown, limit = MAX_CATEGORY_ITEMS) => {
  return uniqueTextItems(value, limit).map(createItem);
};

const parsePayloadObject = (value: string) => {
  const parsed = JSON.parse(value) as MotivationSessionPayload;

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('AI response must be a JSON object.');
  }

  return parsed;
};

export const createSeedSession = (
  topic = 'Build a steadier creative habit'
): MotivationSession => ({
  id: crypto.randomUUID(),
  topic,
  sourcePrompt: topic,
  doItems: [
    createItem('Block 20 minutes'),
    createItem('Remove one distraction'),
    createItem('Finish the next tiny step'),
  ],
  beItems: [
    createItem('A person who ships'),
    createItem('Someone who keeps promises'),
  ],
  feelItems: [
    createItem('Calm momentum'),
    createItem('Pride in progress'),
  ],
  obstacles: ['Phone drift', 'Perfectionism'],
  firstAction: 'Open the draft and write for two minutes without editing.',
  whyNow: 'A small win today makes the next session easier to start.',
  reflectionPrompt: 'What made starting easier than expected?',
  updatedAt: new Date().toISOString(),
});

export const createBlankSession = (
  topic = ''
): MotivationSession => ({
  id: crypto.randomUUID(),
  topic,
  sourcePrompt: topic,
  doItems: [],
  beItems: [],
  feelItems: [],
  obstacles: [],
  firstAction: '',
  whyNow: '',
  reflectionPrompt: '',
  updatedAt: new Date().toISOString(),
});

export const parseMotivationSessionPayload = (
  payloadText: string,
  options: { sourcePrompt: string; now?: string }
): MotivationSession => {
  const parsed = parsePayloadObject(payloadText);
  const topic = optionalText(parsed.topic) || options.sourcePrompt.trim();

  return {
    id: crypto.randomUUID(),
    topic,
    sourcePrompt: options.sourcePrompt.trim(),
    doItems: createItems(parsed.doItems),
    beItems: createItems(parsed.beItems),
    feelItems: createItems(parsed.feelItems),
    obstacles: uniqueTextItems(parsed.obstacles, MAX_OBSTACLES),
    firstAction: optionalText(parsed.firstAction),
    whyNow: optionalText(parsed.whyNow),
    reflectionPrompt: optionalText(parsed.reflectionPrompt),
    updatedAt: options.now ?? new Date().toISOString(),
  };
};

export const refreshSessionTimestamp = (
  session: MotivationSession,
  now = new Date().toISOString()
): MotivationSession => ({
  ...session,
  updatedAt: now,
});

export const replaceSessionList = (
  session: MotivationSession,
  key: SessionListKey,
  nextItems: MotivationItem[]
): MotivationSession => ({
  ...session,
  [key]: nextItems,
});

export const replaceSessionStringList = (
  session: MotivationSession,
  key: Extract<SessionArrayKey, 'obstacles'>,
  nextItems: string[]
): MotivationSession => ({
  ...session,
  [key]: nextItems
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, MAX_OBSTACLES),
});

export const isListRegenerationKey = (
  key: SessionRegenerationKey
): key is SessionArrayKey => {
  return (
    key === 'doItems' ||
    key === 'beItems' ||
    key === 'feelItems' ||
    key === 'obstacles'
  );
};

export const toSessionPatchValue = (
  key: SessionRegenerationKey,
  value: unknown
) => {
  if (key === 'obstacles') {
    return uniqueTextItems(value, MAX_OBSTACLES);
  }

  if (key === 'doItems' || key === 'beItems' || key === 'feelItems') {
    return createItems(value);
  }

  return optionalText(value);
};

export const applySessionPatch = (
  session: MotivationSession,
  key: SessionRegenerationKey,
  value: unknown,
  now = new Date().toISOString()
): MotivationSession => ({
  ...session,
  [key]: toSessionPatchValue(key, value),
  updatedAt: now,
});
