# PWA Phase 1 — Installable Offline Shell: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sunrise installs to a phone home screen from a Cloudflare-Pages-hosted shell, runs fully offline with every theme working, and keeps localStorage durable — while `file://` desktop use stays byte-identical in behavior.

**Architecture:** Static-shell PWA per §6 of `2026-06-12-sunrise-android-pwa-sync-design.md`. Three committed artifacts (manifest, icons, `sw.js`) plus one build-time generator: `scripts/gen-sw.mjs` globs every shippable asset (so a new theme can never be forgotten), stamps a content-hash cache name (so any asset edit busts the cache), and writes `sw.js` — a hand-rolled ~40-line cache-first service worker, committed like `dist/sunrise.js` and guarded by the same staleness-test pattern. `src/main.ts` registers the worker only on `http(s):` so the `file://` flow never sees it.

**Tech Stack:** zero new dependencies. Node built-ins (`fs`, `crypto`) for the generator; headless Chrome (dev machine only) to rasterize the icon SVG; Cloudflare Pages with **no build step** for hosting.

**Out of scope (Phase 2):** merge, sync server, LAN anything. Note for the Phase 2 planner: the spec's §7 merge table still lists `reviews` — the review feature was deleted on 2026-06-12, so that row dies at planning time.

---

### Task 1: Icon — SVG source, generator, committed PNGs

**Files:**
- Create: `icons/icon.svg` (riso sunrise mark — bonus-palette: cream/scarlet/cobalt/yellow/ink)
- Create: `scripts/gen-icons.mjs` (dev-only rasterizer via headless Chrome; PNGs are committed)
- Create (generated): `icons/icon-192.png`, `icons/icon-512.png`, `icons/icon-maskable-512.png`

- [ ] **Step 1: Write `icons/icon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Sunrise mark in the bonus riso palette. The cobalt copy under the sun is
       the riso misregistration offset; keep shapes bold — must read at 48px. -->
  <rect width="512" height="512" fill="#f5f1e6"/>
  <g stroke="#14110d" stroke-width="14" stroke-linecap="round">
    <line x1="256" y1="96"  x2="256" y2="150"/>
    <line x1="139" y1="144" x2="177" y2="182"/>
    <line x1="373" y1="144" x2="335" y2="182"/>
    <line x1="92"  y1="260" x2="146" y2="260"/>
    <line x1="420" y1="260" x2="366" y2="260"/>
  </g>
  <path d="M148 340 a108 108 0 0 1 216 0 Z" fill="#2b4cf0"/>
  <path d="M136 328 a120 120 0 0 1 240 0 Z" fill="#ff5436" stroke="#14110d" stroke-width="14"/>
  <path d="M196 328 a60 60 0 0 1 120 0 Z" fill="#ffd23f"/>
  <line x1="56" y1="328" x2="456" y2="328" stroke="#14110d" stroke-width="16" stroke-linecap="round"/>
  <line x1="120" y1="396" x2="392" y2="396" stroke="#14110d" stroke-width="12" stroke-linecap="round" stroke-dasharray="56 34"/>
  <line x1="176" y1="448" x2="336" y2="448" stroke="#14110d" stroke-width="12" stroke-linecap="round" stroke-dasharray="34 40"/>
</svg>
```

- [ ] **Step 2: Write `scripts/gen-icons.mjs`**

```js
#!/usr/bin/env node
// Rasterize icons/icon.svg -> committed PNGs via headless Chrome (dev-only tool;
// CI never runs this). The maskable variant zooms the mark out to the 80% safe
// zone on a full-bleed background.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, copyFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const CHROME =
  process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const root = resolve(new URL('..', import.meta.url).pathname);
const svg = join(root, 'icons', 'icon.svg');

function shoot(size, scale, out) {
  const dir = mkdtempSync(join(tmpdir(), 'sunrise-icon-'));
  const page = join(dir, 'i.html');
  writeFileSync(
    page,
    `<!doctype html><body style="margin:0;background:#f5f1e6">` +
      `<img src="file://${svg}" style="display:block;width:${size}px;height:${size}px;` +
      `transform:scale(${scale});transform-origin:center"></body>`,
  );
  const png = join(dir, 'i.png');
  execFileSync(CHROME, [
    '--headless',
    '--no-first-run',
    '--disable-gpu',
    `--window-size=${size},${size}`,
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--screenshot=${png}`,
    '--virtual-time-budget=800',
    `file://${page}`,
  ]);
  copyFileSync(png, join(root, 'icons', out));
  rmSync(dir, { recursive: true, force: true });
  console.log('icons/' + out);
}

if (!existsSync(CHROME)) {
  console.error('Chrome not found — set CHROME_BIN');
  process.exit(1);
}
shoot(192, 1, 'icon-192.png');
shoot(512, 1, 'icon-512.png');
shoot(512, 0.78, 'icon-maskable-512.png'); // mark inside the maskable safe zone
```

- [ ] **Step 3: Generate and eyeball**

Run: `node scripts/gen-icons.mjs`
Expected: three PNGs in `icons/`; view `icons/icon-512.png` — bold sunrise mark, readable at small sizes; maskable variant has comfortable padding.

- [ ] **Step 4: Commit**

```bash
git add icons scripts/gen-icons.mjs
git commit -m "feat(pwa): sunrise icon - svg source, chrome rasterizer, committed pngs"
```

### Task 2: Manifest + shell links (TDD)

**Files:**
- Test: `test/pwa/pwa-shell.test.ts` (new)
- Create: `manifest.webmanifest`
- Modify: `index.html` `<head>`

- [ ] **Step 1: Write the failing tests**

```ts
// test/pwa/pwa-shell.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
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
```

- [ ] **Step 2: Run to verify both fail** (`manifest.webmanifest` missing)

Run: `node --test test/pwa/pwa-shell.test.ts`
Expected: 2 fail.

- [ ] **Step 3: Create `manifest.webmanifest`**

```json
{
  "name": "Sunrise · 日の出",
  "short_name": "Sunrise",
  "id": "./",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "lang": "ru",
  "background_color": "#f5f1e6",
  "theme_color": "#ff5436",
  "description": "Offline goal-achievement tracker",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

- [ ] **Step 4: Add to `index.html` `<head>` (after the `<title>` line)**

```html
<link rel="manifest" href="manifest.webmanifest" />
<meta name="theme-color" content="#ff5436" />
<link rel="apple-touch-icon" href="icons/icon-192.png" />
```

- [ ] **Step 5: Run tests to verify they pass**, then commit

```bash
node --test test/pwa/pwa-shell.test.ts   # 2 pass
git add manifest.webmanifest index.html test/pwa/pwa-shell.test.ts
git commit -m "feat(pwa): web app manifest + shell links"
```

### Task 3: Service worker generator + committed `sw.js` (TDD)

**Files:**
- Test: append to `test/pwa/pwa-shell.test.ts`
- Create: `scripts/gen-sw.mjs`
- Create (generated): `sw.js`
- Modify: `package.json` (`build` script)

- [ ] **Step 1: Append the failing tests**

```ts
test('sw.js precaches every shippable asset (themes can never be forgotten)', () => {
  const sw = readFileSync(join(root, 'sw.js'), 'utf8');
  for (const must of ['index.html', 'manifest.webmanifest', 'dist/sunrise.js']) {
    assert.ok(sw.includes(`"${must}"`), `${must} precached`);
  }
  for (const dir of ['themes', 'data/packs', 'icons'] as const) {
    for (const f of readdirSync(join(root, dir))) {
      if (dir === 'themes' && !f.endsWith('.css')) continue;
      if (dir === 'data/packs' && !f.endsWith('.js')) continue;
      if (dir === 'icons' && !f.endsWith('.png')) continue;
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
```

(adds imports: `readdirSync`, `rmSync` from `node:fs`, `execSync` from `node:child_process`, `tmpdir` from `node:os`)

- [ ] **Step 2: Run to verify both fail** (`sw.js` missing)

- [ ] **Step 3: Write `scripts/gen-sw.mjs`**

```js
#!/usr/bin/env node
// Generates sw.js: globs every shippable asset (a new theme/pack/icon can never
// be forgotten) and stamps a content-hash cache name (editing any asset busts
// the stale cache). sw.js is a committed build artifact like dist/sunrise.js;
// test/pwa/pwa-shell.test.ts fails if it goes stale.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const list = (dir, ext) =>
  readdirSync(join(root, dir))
    .filter((f) => f.endsWith(ext))
    .sort()
    .map((f) => `${dir}/${f}`);

const ASSETS = [
  'index.html',
  'manifest.webmanifest',
  'dist/sunrise.js',
  ...list('data/packs', '.js'),
  ...list('themes', '.css'),
  ...list('icons', '.png'),
];

const hash = createHash('sha256');
for (const a of ASSETS) hash.update(a).update(readFileSync(join(root, a)));
const CACHE = `sunrise-${hash.digest('hex').slice(0, 12)}`;

const sw = `// Generated by scripts/gen-sw.mjs — do not edit by hand (npm run build).
// Cache-first shell: precache everything, serve from cache, fall back to network.
const CACHE = ${JSON.stringify(CACHE)};
const ASSETS = ${JSON.stringify(ASSETS, null, 2)};

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('index.html').then((r) => r ?? fetch(req)));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((r) => r ?? fetch(req)));
});
`;

writeFileSync(process.argv[2] ?? join(root, 'sw.js'), sw);
console.log(`sw.js: ${ASSETS.length} assets, cache ${CACHE}`);
```

- [ ] **Step 4: Wire into the build and generate**

`package.json`:

```json
"build": "esbuild src/main.ts --bundle --format=iife --target=es2022 --sourcemap --outfile=dist/sunrise.js && node scripts/gen-sw.mjs",
```

Run: `npm run build` → writes `sw.js`.

- [ ] **Step 5: Run tests to verify all pass**, then commit

```bash
node --test test/pwa/pwa-shell.test.ts   # 4 pass
git add scripts/gen-sw.mjs sw.js package.json test/pwa/pwa-shell.test.ts
git commit -m "feat(pwa): generated cache-first service worker, staleness-guarded"
```

### Task 4: Registration + durable storage in the composition root

**Files:**
- Modify: `src/main.ts` (after `watchMobileMode(...)`)
- Regenerate: `dist/sunrise.js`, `dist/sunrise.js.map`, `sw.js`

- [ ] **Step 1: Add to `src/main.ts`**

```ts
// PWA: register the offline shell + ask for durable storage. http(s) only —
// the file:// desktop flow must stay silent (SW cannot register there).
if (location.protocol.startsWith('http') && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
  void navigator.storage?.persist?.();
}
```

- [ ] **Step 2: Rebuild, run the full suite**

Run: `npm run build && npm test`
Expected: all pass (incl. `dist-sync` and the new sw staleness test).

- [ ] **Step 3: Commit**

```bash
git add src/main.ts dist sw.js
git commit -m "feat(pwa): register service worker + storage.persist() on http(s) boots"
```

### Task 5: Docs + deploy instructions

**Files:**
- Modify: `CLAUDE.md` (build command note, topology), `docs/FEATURES.md` (Platform), `docs/2026-06-12-sunrise-android-pwa-sync-design.md` (§7 drift note)

- [ ] **Step 1: CLAUDE.md** — extend the build command comment to "REBUILD AFTER ANY src CHANGE (also regenerates sw.js)"; add one invariant bullet: `sw.js` is a committed build artifact (generated by `scripts/gen-sw.mjs`, staleness-tested); shell installs as a PWA from HTTPS while `file://` skips SW registration.

- [ ] **Step 2: FEATURES.md Platform section** — add: installable offline PWA (manifest + cache-first SW precaching every theme/pack; `file://` desktop unaffected).

- [ ] **Step 3: Spec §7 drift note** — one italic line under the §7 heading: reviews were removed 2026-06-13; drop that merge row in Phase 2 planning.

- [ ] **Step 4: Deploy (manual, user account required)** — Cloudflare Pages, two options:
  - *Git integration (primary):* Pages → Create project → connect the repo → build command **none**, output dir `/`. Every push deploys.
  - *CLI:* `npx wrangler pages deploy . --project-name=sunrise` after `npx wrangler login`.

- [ ] **Step 5: Gates + commit**

```bash
npm test && npm run lint && npm run format:check && npm run typecheck
git add CLAUDE.md docs
git commit -m "docs(pwa): build artifact rules, deploy instructions, spec drift note"
```

### Task 6: Verification (per spec §8, the automatable part)

- [ ] `npm test` — all green (manifest/sw/dist guards included).
- [ ] Headless screenshot of the app from `file://` at phone width — boots with no SW, no errors (existing harness).
- [ ] Serve the repo over `http://localhost` and load once in headless Chrome — page boots; (full Lighthouse/install/airplane-mode checks are the user's on-phone checklist from spec §8).

**Manual checklist left for the user (needs a phone + CF account):** Lighthouse PWA audit on the deployed URL, install on Android, airplane-mode cold start, switch every theme offline, confirm `persist()` granted.
