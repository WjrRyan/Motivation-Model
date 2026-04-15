export const CategoryType = {
  DO: 'DO',
  BE: 'BE',
  FEEL: 'FEEL',
} as const;

export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType];

export type SessionListKey = 'doItems' | 'beItems' | 'feelItems';
export type SessionTextKey =
  | 'firstAction'
  | 'whyNow'
  | 'reflectionPrompt';
export type SessionArrayKey = SessionListKey | 'obstacles';
export type SessionRegenerationKey = SessionArrayKey | SessionTextKey;

export interface MotivationItem {
  id: string;
  text: string;
}

export interface MotivationSession {
  id: string;
  topic: string;
  sourcePrompt: string;
  doItems: MotivationItem[];
  beItems: MotivationItem[];
  feelItems: MotivationItem[];
  obstacles: string[];
  firstAction: string;
  whyNow: string;
  reflectionPrompt: string;
  updatedAt: string;
}

export interface MotivationSessionPayload {
  topic?: unknown;
  doItems?: unknown;
  beItems?: unknown;
  feelItems?: unknown;
  obstacles?: unknown;
  firstAction?: unknown;
  whyNow?: unknown;
  reflectionPrompt?: unknown;
}
