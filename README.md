# Sunrise · 日の出

A personal **goal-achievement tracker** — a single, offline web app that turns any long-term goal or plan into one checkable day at a time, with streaks, trophies, and a calendar to keep momentum.

It runs by **double-clicking `index.html`** — no dev server, no runtime dependencies. The core is TypeScript, pre-built with esbuild into a committed `dist/sunrise.js` bundle. Content packs and themes stay plain `.js`/`.css` files that self-register at runtime — no rebuild needed to add them.

> Sunrise is **goal-agnostic**: a "content pack" is any plan broken into days — a language, a fitness program, a reading list, an instrument, a course, a 30-day challenge. The bundled example pack happens to be a 13-week software-engineering curriculum (Russian UI, Japanese flourishes), but it's just one pack — load or author your own. See [Plugins](#plugins).

---

## Quick start

```bash
open index.html        # macOS    (or double-click the file)
```

Your progress is saved to `localStorage`; export/import it as JSON from the toolbar. Everything works fully offline from `file://`.

## Features

- **One day at a time** — each day is a small set of tasks; a day completes when all its tasks are checked.
- **Streaks & calendar** — current/longest streak (UTC), plus a month calendar marking completed days.
- **30 trophies** — streaks, totals, reflections, track/phase mastery, weekend/night-owl/early-lark, comeback, and more. Once earned, they stick.
- **Per-day reflection** and an optional **"strong answer" guidance** spoiler under tasks.
- **Spaced repetition** — schedule pattern reviews on review-eligible tracks; due items surface on rest days.
- **5 themes**, switchable live (Neo-Brutalist, Neon, Japanese, Emerald, Dashboard).
- **Confetti, surprise notes, rotating mottos** — small dopamine hits on completion.
- **Export / import** progress as JSON.

## Architecture

Sunrise is a **thin host** that loads plugins. Nothing domain-specific is hardcoded — the curriculum is just the first content pack.

### Runtime topology

```
index.html  →  dist/sunrise.js   (compiled IIFE — wires the app, exposes window.SUNRISE)
            →  data/packs/dev-roadmap.js   (calls window.SUNRISE.registerPack)
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

Two kinds, each a single self-registering `.js` file (themes pair with a `.css`). Install by adding one `<script src>` line to `index.html`.

- **Content pack** — a self-contained knowledge base: its own tracks (subject columns), structure (groups → items → tasks), settings, and optional declarative badges.
- **Theme** — a CSS skin + a tiny manifest, layered over the canonical hooks.

The formats are designed to be **authored from documentation alone** — hand the relevant guide to an LLM (with no source access) and paste back the result. The validator keeps the docs and the runtime honest.

- **[`docs/plugins/README.md`](docs/plugins/README.md)** — overview, loading, canonical DOM hooks
- **[`docs/plugins/content-pack.md`](docs/plugins/content-pack.md)** — the content-pack contract + badge-rule reference + a paste-ready prompt
- **[`docs/plugins/theme.md`](docs/plugins/theme.md)** — the theme contract + CSS-variable list

## Project structure

```
index.html                 app shell + canonical DOM hooks + theme <link>
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
themes/                    bonus · neon · japanese · emerald · dashboard  (CSS only)
test/
  domain/                  unit tests for the domain ring (pure, no DOM)
  adapters/                adapter tests (local-storage, window-registry, DOM via fake-DOM harness)
docs/plugins/              authoring guides (the "AI-first" deliverable)
scripts/reshape-curriculum.js   one-off generator that produced pack #1 (kept for provenance)
```

## Development

**Requires Node ≥ 23.6** (so `node --test` can run `.ts` files natively — zero test-time dependencies).

```bash
npm run build      # esbuild src/main.ts → dist/sunrise.js  (commit the result)
npm run typecheck  # tsc --noEmit
npm test           # node --test "test/**/*.test.ts"
npm run lint       # typescript-eslint
npm run format     # prettier
```

All devDependencies (`esbuild`, `typescript`, `typescript-eslint`, `prettier`) are **dev-only**. The shipped `dist/sunrise.js` has **zero runtime dependencies**.

The domain ring is browser-agnostic and unit-tested directly. `DomRenderer` and `DomController` are tested via a lightweight fake-DOM harness in `test/adapters/dom.test.ts`.

After changing source, run `npm run build` and commit `dist/sunrise.js` alongside the `.ts` changes — `index.html` loads the bundle from `file://` with no dev server involved.

## License

Private / personal project.
