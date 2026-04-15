import { GoogleGenAI, Schema, Type } from '@google/genai';

import {
  applySessionPatch,
  parseMotivationSessionPayload,
} from '../lib/session-utils.ts';
import type { MotivationSession, SessionRegenerationKey } from '../types.ts';

const apiKey = process.env.GEMINI_API_KEY ?? process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const GEMINI_MODEL = 'gemini-2.5-flash';

const motivationSessionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: {
      type: Type.STRING,
      description: 'A clean title for the focus area or goal.',
    },
    doItems: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Three to four concrete actions or habits. Keep each item under 7 words.',
    },
    beItems: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Two to four identity statements the person grows into.',
    },
    feelItems: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Two to four emotional payoffs or felt rewards.',
    },
    obstacles: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Zero to four realistic blockers or resistance patterns.',
    },
    firstAction: {
      type: Type.STRING,
      description: 'A single next action the person can do in under ten minutes.',
    },
    whyNow: {
      type: Type.STRING,
      description: 'One short reason why this matters now.',
    },
    reflectionPrompt: {
      type: Type.STRING,
      description: 'One short journaling prompt for a later check-in.',
    },
  },
  required: [
    'topic',
    'doItems',
    'beItems',
    'feelItems',
    'obstacles',
    'firstAction',
    'whyNow',
    'reflectionPrompt',
  ],
};

const listPatchSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    value: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A refreshed list for the requested section.',
    },
  },
  required: ['value'],
};

const textPatchSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    value: {
      type: Type.STRING,
      description: 'A refreshed value for the requested text field.',
    },
  },
  required: ['value'],
};

const requireClient = () => {
  if (!ai) {
    throw new Error(
      'Missing Gemini API key. Set GEMINI_API_KEY in .env.local for local-only use.'
    );
  }

  return ai;
};

const requestJson = async (prompt: string, schema: Schema) => {
  const client = requireClient();
  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      systemInstruction:
        'You are a concise behavioral coach. Be concrete, compassionate, and practical.',
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('No response from Gemini.');
  }

  return text;
};

export const generateMotivationModel = async (
  topic: string
): Promise<MotivationSession> => {
  const sourcePrompt = topic.trim();
  const responseText = await requestJson(
    `Turn the goal "${sourcePrompt}" into a practical motivation coaching session.

Return:
- three motivation layers: DO, BE, FEEL
- likely obstacles
- the smallest first action
- a short why-now statement
- a reflection prompt for later

Keep the tone grounded, not hypey. Prefer specific language over generic advice.`,
    motivationSessionSchema
  );

  return parseMotivationSessionPayload(responseText, { sourcePrompt });
};

const buildRegenerationPrompt = (
  session: MotivationSession,
  key: SessionRegenerationKey
) => `You are refreshing one part of a motivation coaching session.

Goal: ${session.topic}
Original prompt: ${session.sourcePrompt}
Current DO: ${session.doItems.map((item) => item.text).join(' | ') || '(empty)'}
Current BE: ${session.beItems.map((item) => item.text).join(' | ') || '(empty)'}
Current FEEL: ${session.feelItems.map((item) => item.text).join(' | ') || '(empty)'}
Current obstacles: ${session.obstacles.join(' | ') || '(empty)'}
Current first action: ${session.firstAction || '(empty)'}
Current why-now: ${session.whyNow || '(empty)'}
Current reflection prompt: ${session.reflectionPrompt || '(empty)'}

Refresh only "${key}".
- If it is a list field, return 2-4 concise items.
- If it is a text field, return one short practical sentence.
- Keep the rest of the session context in mind.
- Avoid repeating the exact current phrasing unless it is already strong.`;

export const regenerateSessionSection = async (
  session: MotivationSession,
  key: SessionRegenerationKey
) => {
  const schema =
    key === 'firstAction' || key === 'whyNow' || key === 'reflectionPrompt'
      ? textPatchSchema
      : listPatchSchema;

  const responseText = await requestJson(buildRegenerationPrompt(session, key), schema);
  const parsed = JSON.parse(responseText) as { value?: unknown };
  return applySessionPatch(session, key, parsed.value);
};

export { GEMINI_MODEL };
