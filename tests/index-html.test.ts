import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('index.html loads the React entry module', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(
    html,
    /<script\s+type="module"\s+src="\/index\.tsx"><\/script>/,
    'Expected index.html to load /index.tsx so the app mounts into #root.'
  );
});
