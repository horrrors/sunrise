# Sunrise · 日の出

A personal **goal-achievement tracker** — a single, offline web app that turns any long-term goal or plan into one checkable day at a time, with streaks, trophies, and a progress map to keep momentum.

**▶ Live: [sunrise-6r3.pages.dev](https://sunrise-6r3.pages.dev/)** — installable as a Progressive Web App (phone or desktop), or run it locally by double-clicking `index.html`.

**No dev server, no runtime dependencies, no build step to just use it.** The core is TypeScript, pre-built with esbuild into a committed `dist/sunrise.js` bundle. Content packs and themes stay plain `.js`/`.css` files that self-register at runtime — no rebuild needed to add them.

> Sunrise is **goal-agnostic**: a "content pack" is any plan broken into days — a language, a fitness program, a reading list, an instrument, a course, a 30-day challenge. The bundled example pack happens to be a 13-week software-engineering curriculum (Russian UI, Japanese flourishes), but it's just one pack — load or author your own. See [Plugins](#plugins).

---

## Quick start

**Hosted (PWA).** Open **[sunrise-6r3.pages.dev](https://sunrise-6r3.pages.dev/)** and use the browser's _Install_ / _Add to Home Screen_ prompt. Installed, it launches in its own window and works fully offline — see [Progressive Web App](#progressive-web-app).

**Local.** Clone the repo and open the file directly — no server, no install step:

```bash
open index.html        # macOS    (or double-click the file)
```

Your progress is saved to `localStorage` (per device); export/import it as JSON from the toolbar. Everything works offline either way.

## Features

- **One day at a time** — each day is a small set of tasks; a day completes when all its tasks are checked.
- **Streaks & card map** — current/longest streak (counted on local calendar days), plus a card map of the whole pack marking which cards are done.
- **30 trophies** — streaks, totals, reflections, track/phase mastery, weekend/night-owl/early-lark, comeback, and more. Once earned, they stick.
- **Per-day reflection** and an optional **"strong answer" guidance** spoiler under tasks.
- **Review reminders** — schedule a topic on a review-eligible track; it surfaces on rest days until re-scheduled.
- **17 live-switchable themes** — 5 built-in (Neo-Brutalist Riso, Neon, Japanese, Emerald, Colorful Dashboard) plus 12 registered in `index.html` (Dawn, Arcade · 8-bit, Solarpunk, Swiss, Bauhaus, Blueprint, Memphis, Arcade · Synthwave Sun, Arcade · Cyber Grid, Aurora Noir, Gazette · Утренний выпуск, OS '95 · Рабочий стол).
- **Confetti, surprise notes, rotating mottos** — small dopamine hits on completion.
- **Export / import** progress as JSON — exports embed the pack id, so importing another pack's file is rejected.

## Progressive Web App

The hosted build at **[sunrise-6r3.pages.dev](https://sunrise-6r3.pages.dev/)** is an installable, offline-first PWA:

- **`manifest.webmanifest`** describes the app (name, icons, `standalone` display, theme color), so browsers offer _Install_ / _Add to Home Screen_. Installed, it opens in its own window with no browser chrome — like a native app.
- **`sw.js`** is a cache-first service worker that precaches the whole shell (bundle, packs, themes, fonts, icons) on first visit, then serves it from cache — so the app opens instantly and keeps working with no network. It's a **committed build artifact**: `scripts/gen-sw.mjs` (run by `npm run build`) globs every shippable asset into the precache list and stamps a content-hash cache name, so editing any asset busts the stale cache. A staleness-guard test fails if the committed `sw.js` drifts from the tree.
- **Degrades cleanly on `file://`.** The service worker registers only under `http(s)` (`src/main.ts`); opened as a local file, the app skips registration silently and behaves exactly as before. Either way, `localStorage` is the only persistence — there is no server and no account.

It deploys to **Cloudflare Pages** with `npm run deploy`: a direct upload of the committed tree (`git archive HEAD`), gated behind the full CI suite. No build runs on the host — the committed `dist/sunrise.js` and `sw.js` are exactly what ship.

## Architecture

Sunrise is a **thin host** that loads plugins. Nothing domain-specific is hardcoded — the curriculum is just the first content pack.

### Runtime topology

```
index.html  →  dist/sunrise.js   (compiled IIFE — wires the app, exposes window.SUNRISE)
            →  data/packs/dev-roadmap.js   (calls window.SUNRISE.registerPack)
            →  inline <script>   (one window.SUNRISE.registerTheme call per extra theme)
```

`index.html` is the shell. `dist/sunrise.js` is a zero-dependency IIFE built from `src/main.ts` by esbuild. Content packs call `window.SUNRISE.registerPack(...)` when they load; themes call `window.SUNRISE.registerTheme(...)`.

### 3-ring onion (TypeScript, in `src/`)

| Ring | Path | Responsibility |
|---|---|---|
| **Domain** | `src/domain/` | Pure business logic — no DOM, no I/O. `entities.ts` (types), `progress.ts` (`Progress` aggregate), `streaks.ts`, `progress-stats.ts`, `review-schedule.ts`, `badge-engine.ts` (services), `validators.ts`, `tracker.ts` (facade), `builtins.ts` (default data). |
| **Ports** | `src/ports/index.ts` | Interfaces only: `Clock`, `Random`, `ProgressStore`, `SessionStore`, `PackSource`, `ThemeSource`. |
| **Adapters** | `src/adapters/` | Implementations: `SystemClock`, `MathRandom`, `LocalStorageProgressStore`, `LocalStorageSessionStore`, `WindowPluginRegistry`, `DomRenderer`, `DomController`. |
| **Composition root** | `src/main.ts` | Wires rings together; exposes `window.SUNRISE`; boots `DomController`. |

**Runtime-pluggable (no rebuild required):** content packs (`data/packs/*.js`) and themes (`themes/*.css`) are plain files that self-register at page load time. Only the core needs to be compiled.

Progress is **namespaced per pack**, so multiple roadmaps keep independent streaks and trophies.

## Plugins

Two kinds. A **content pack** installs by adding one `<script src>` line to `index.html`; a **theme** is a `.css` file plus one `SUNRISE.registerTheme(...)` line in the inline script block at the bottom of `index.html`.

- **Content pack** — a self-contained knowledge base: its own tracks (subject columns), structure (groups → items → tasks), settings, and optional declarative badges.
- **Theme** — a CSS skin + a tiny manifest, layered over the canonical hooks.

Each format is documented in **one self-contained guide** — paste the whole file into an LLM (no source access needed), fill in the prompt at its bottom, and paste back the result. The validator keeps the docs and the runtime honest.

- **[`docs/plugins/content-pack.md`](docs/plugins/content-pack.md)** — the full content-pack contract: envelope, structure, badge-rule reference, and a paste-ready prompt
- **[`docs/plugins/theme.md`](docs/plugins/theme.md)** — the full theme contract: manifest, canonical DOM hooks, CSS variables, and a paste-ready prompt

## Project structure

```
index.html                 app shell + canonical DOM hooks + theme <link>
manifest.webmanifest       PWA manifest (name, icons, standalone display)
sw.js                      service worker — cache-first offline shell (committed; produced by `npm run build`)
icons/                     PWA icons — 192 / 512 / maskable (+ source SVG)
fonts.css  fonts/          self-hosted webfonts (committed build artifacts)
dist/
  sunrise.js               compiled IIFE bundle (committed; produced by `npm run build`)
  sunrise.js.map           source map
src/
  main.ts                  composition root — wires rings, exposes window.SUNRISE
  domain/                  pure domain ring (entities, progress aggregate, services, tracker facade, builtins)
  ports/                   interface ring (Clock, Random, ProgressStore, SessionStore, PackSource, ThemeSource)
  adapters/                adapter ring (SystemClock, MathRandom, LocalStorage*, WindowPluginRegistry, DomRenderer, DomController)
data/
  packs/dev-roadmap.js     pack #1 — the 13-week curriculum (13 groups · 91 items · 9 tracks)
themes/                    17 theme stylesheets — 5 built-in + 12 registered in index.html  (CSS only)
test/
  domain/                  unit tests for the domain ring (pure, no DOM)
  adapters/                adapter tests (local-storage, window-registry, DOM via fake-DOM harness)
docs/plugins/              authoring guides (the "AI-first" deliverable)
scripts/
  gen-sw.mjs               regenerates sw.js (precache list + cache hash) — part of `npm run build`
  deploy-pages.sh          uploads the committed tree to Cloudflare Pages — `npm run deploy`
  reshape-curriculum.js    one-off generator that produced pack #1 (kept for provenance)
```

## Development

**Requires Node 23.11.0** (pinned in `.nvmrc` / `.tool-versions`; `node --test` runs `.ts` files natively — zero test-time dependencies).

```bash
npm run build      # esbuild src/main.ts → dist/sunrise.js + regenerates sw.js  (commit the result)
npm run typecheck  # tsc --noEmit
npm test           # node --test "test/**/*.test.ts"
npm run lint       # typescript-eslint
npm run format     # prettier
npm run deploy     # upload the committed tree to Cloudflare Pages (runs CI first)
```

All devDependencies (`esbuild`, `typescript`, `typescript-eslint`, `prettier`) are **dev-only**. The shipped `dist/sunrise.js` has **zero runtime dependencies**.

The domain ring is browser-agnostic and unit-tested directly. `DomRenderer` and `DomController` are tested via a lightweight fake-DOM harness in `test/adapters/dom.test.ts`.

After changing source, run `npm run build` and commit `dist/sunrise.js` alongside the `.ts` changes — `index.html` loads the bundle from `file://` with no dev server involved.

## Limitations

Sunrise is a **single-tab app**: progress saves are whole-blob `localStorage` writes, so two open tabs overwrite each other's saves — keep it open in one tab.

## License

Private / personal project.
