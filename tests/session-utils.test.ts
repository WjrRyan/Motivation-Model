import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createSeedSession,
  parseMotivationSessionPayload,
} from '../lib/session-utils.ts';

test('parseMotivationSessionPayload maps a full AI payload into a complete session', () => {
  const session = parseMotivationSessionPayload(
    JSON.stringify({
      topic: 'Ship the side project',
      doItems: ['Block 45 minutes', 'Write one section'],
      beItems: ['A reliable builder', 'Someone who finishes'],
      feelItems: ['Calm momentum', 'Proud tonight'],
      obstacles: ['Phone distractions', 'Perfectionism'],
      firstAction: 'Open the draft and write the first ugly paragraph.',
      whyNow: 'Momentum matters more than polish this week.',
      reflectionPrompt: 'What made starting easier today?',
    }),
    { sourcePrompt: 'Ship the side project', now: '2026-04-15T14:00:00.000Z' }
  );

  assert.equal(session.topic, 'Ship the side project');
  assert.equal(session.sourcePrompt, 'Ship the side project');
  assert.equal(session.updatedAt, '2026-04-15T14:00:00.000Z');
  assert.equal(session.doItems.length, 2);
  assert.equal(session.beItems[0]?.text, 'A reliable builder');
  assert.deepEqual(session.obstacles, ['Phone distractions', 'Perfectionism']);
  assert.equal(
    session.firstAction,
    'Open the draft and write the first ugly paragraph.'
  );
  assert.equal(session.whyNow, 'Momentum matters more than polish this week.');
  assert.equal(session.reflectionPrompt, 'What made starting easier today?');
});

test('parseMotivationSessionPayload fills safe defaults when AI output is missing fields', () => {
  const session = parseMotivationSessionPayload(
    JSON.stringify({
      topic: 'Practice guitar',
      doItems: ['Tune guitar'],
    }),
    { sourcePrompt: 'Practice guitar', now: '2026-04-15T14:00:00.000Z' }
  );

  assert.equal(session.topic, 'Practice guitar');
  assert.equal(session.doItems.length, 1);
  assert.deepEqual(session.beItems, []);
  assert.deepEqual(session.feelItems, []);
  assert.deepEqual(session.obstacles, []);
  assert.equal(session.firstAction, '');
  assert.equal(session.whyNow, '');
  assert.equal(session.reflectionPrompt, '');
});

test('createSeedSession creates a complete editable draft session', () => {
  const session = createSeedSession('Build a workout habit');

  assert.equal(session.topic, 'Build a workout habit');
  assert.equal(session.sourcePrompt, 'Build a workout habit');
  assert.match(session.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.ok(session.doItems.length > 0);
  assert.ok(session.id.length > 0);
});
