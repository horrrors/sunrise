// test/themes/offline-guard.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hasRemoteUrl } from '../../src/domain/validators.ts';

const root = fileURLToPath(new URL('../..', import.meta.url));

// Sunrise is offline-first (file:// + PWA precache). A remote url()/@import
// breaks file://, escapes the precache, and phones a third party. Fonts are
// self-hosted in fonts/ + fonts.css; keep it that way.
test('no theme or fonts.css references a remote URL', () => {
  const offenders: string[] = [];
  const dir = join(root, 'themes');
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.css'))) {
    if (hasRemoteUrl(readFileSync(join(dir, f), 'utf8'))) offenders.push(f);
  }
  if (hasRemoteUrl(readFileSync(join(root, 'fonts.css'), 'utf8'))) offenders.push('fonts.css');
  assert.deepEqual(offenders, [], 'self-host fonts; remote url()/@import is rejected');
});
