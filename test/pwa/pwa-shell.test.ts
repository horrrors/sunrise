// test/pwa/pwa-shell.test.ts — PWA shell contract: manifest validity, head
// wiring, and the generated service worker (committed like dist/sunrise.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));

test('manifest.webmanifest is valid and complete for installability', () => {
  const m = JSON.parse(readFileSync(join(root, 'manifest.webmanifest'), 'utf8'));
  assert.equal(m.display, 'standalone');
  assert.equal(m.start_url, './');
  assert.equal(m.scope, './');
  for (const k of ['name', 'short_name', 'theme_color', 'background_color']) {
    assert.ok(typeof m[k] === 'string' && m[k].length > 0, `${k} present`);
  }
  const sizes = m.icons.map((i: { sizes: string }) => i.sizes);
  assert.ok(sizes.includes('192x192') && sizes.includes('512x512'), '192 + 512 icons');
  assert.ok(
    m.icons.some((i: { purpose?: string }) => i.purpose === 'maskable'),
    'maskable icon present',
  );
  for (const i of m.icons as { src: string }[]) {
    assert.ok(existsSync(join(root, i.src)), `${i.src} exists on disk`);
  }
});

test('index.html wires the PWA shell into <head>', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.ok(html.includes('rel="manifest"'), 'manifest link');
  assert.ok(html.includes('name="theme-color"'), 'theme-color meta');
  assert.ok(html.includes('rel="apple-touch-icon"'), 'iOS home-screen icon');
});

test('sw.js precaches every shippable asset (themes can never be forgotten)', () => {
  const sw = readFileSync(join(root, 'sw.js'), 'utf8');
  for (const must of ['index.html', 'manifest.webmanifest', 'dist/sunrise.js']) {
    assert.ok(sw.includes(`"${must}"`), `${must} precached`);
  }
  for (const [dir, ext] of [
    ['themes', '.css'],
    ['data/packs', '.js'],
    ['icons', '.png'],
  ] as const) {
    for (const f of readdirSync(join(root, dir))) {
      if (!f.endsWith(ext)) continue;
      assert.ok(sw.includes(`"${dir}/${f}"`), `${dir}/${f} precached`);
    }
  }
});

test('committed sw.js matches a fresh run of scripts/gen-sw.mjs', () => {
  const out = join(tmpdir(), `sunrise-sw-${process.pid}-${Date.now()}.js`);
  try {
    execSync(`node scripts/gen-sw.mjs ${out}`, { cwd: root, stdio: 'pipe' });
    assert.equal(
      readFileSync(join(root, 'sw.js'), 'utf8'),
      readFileSync(out, 'utf8'),
      'sw.js is stale — run `npm run build` and commit the result',
    );
  } finally {
    rmSync(out, { force: true });
  }
});
