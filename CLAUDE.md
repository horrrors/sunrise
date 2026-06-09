# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Sunrise is an **offline, zero-runtime-dependency goal-achievement tracker**. It runs by double-clicking `index.html` from `file://` — no dev server. The core is TypeScript compiled by esbuild into a **committed** `dist/sunrise.js` IIFE. Content packs (`data/packs/*.js`) and themes (`themes/*.css`) are plain files that self-register at page load — they need no rebuild. Only core `src/` changes require a rebuild.

## Commands

```bash
npm run build      # esbuild src/main.ts -> dist/sunrise.js (+ .map). REBUILD AFTER ANY src CHANGE.
npm run typecheck  # tsc --noEmit
npm test           # node --test "test/**/*.test.ts"
npm run lint       # eslint src test
npm run format     # prettier --write .

# Single test file:
node --test test/domain/tracker.test.ts
# Single test case (regex on the test name):
node --test test/domain/tracker.test.ts --test-name-pattern='completing the active item'
```

- **Requires Node 23.11.0** (pinned in `.tool-versions` / `.nvmrc`). Tests are `.ts` files run *natively* by `node --test` via type-stripping — there is no test compile step and zero test-time dependencies.
- **Critical workflow:** after editing anything under `src/`, run `npm run build` and commit the regenerated `dist/sunrise.js` (and `.map`) *in the same change* as the `.ts` edits. `index.html` loads the bundle directly; stale `dist` means stale app.

## Architecture

A 3-ring onion. Dependencies point **inward only**: adapters → ports ← domain. The domain imports port *interfaces* but never adapters; `src/main.ts` is the **only** place adapters are imported (the composition root).

| Ring | Path | Rule |
|---|---|---|
| **Domain** | `src/domain/` | Pure business logic. No DOM, no I/O, no globals. |
| **Ports** | `src/ports/index.ts` | Interfaces only: `Clock`, `Random`, `ProgressStore`, `SessionStore`, `PackSource`, `ThemeSource`. |
| **Adapters** | `src/adapters/` | Implement ports against the real world (DOM, localStorage, `window`, system time). |
| **Composition root** | `src/main.ts` | Instantiates adapters, injects them into `Tracker` via `TrackerDeps`, exposes `window.SUNRISE`, boots `DomController`. |

- **`Tracker` (`src/domain/tracker.ts`) is the single domain facade.** All consumers — and especially the adapters — call `Tracker` methods; nothing reaches into individual domain services directly. Domain *services* (`streaks`, `progress-stats`, `review-schedule`, `badge-engine`) are stateless calculators over `(Pack, Progress)`; `Tracker` orchestrates them, holds navigation state, and persists via the injected `ProgressStore`/`SessionStore`.
- **Adapter split:** `DomRenderer` is a pure presenter (VMs → canonical DOM hooks, focus, theme/track-color CSS vars; no event wiring). `DomController` owns *all* event listeners and turns DOM events into `Tracker` intents, then re-renders via `DomRenderer`. UI strings the view-models don't carry are passed as `RenderLabels`, filled by the controller from `tracker.ui(key)`.

### Runtime topology

```
index.html  ──<script src>──>  dist/sunrise.js   (IIFE: defines window.SUNRISE, boots on DOMContentLoaded)
            ──<script src>──>  data/packs/dev-roadmap.js   (calls SUNRISE.registerPack(...))
            ──inline <script>─> SUNRISE.registerTheme(...)  (one call per extra theme)
```

`main.ts` exposes `window.SUNRISE` at bundle-eval time, *before* `DOMContentLoaded`, so plugin scripts that load after it can register immediately. `boot()` then runs `migrateLegacy()`, builds the `Tracker`, calls `tracker.init()` (which **throws if no pack registered**), and starts `DomController`. On any boot failure the catch renders `DomRenderer.stub(...)`, listing rejected plugins with `path msg` detail — check there first when the app shows an error page.

## Key invariants (these will bite you)

- **Domain purity is lint-enforced.** `eslint.config.js` bans `window`, `document`, `localStorage`, `Date`, and `Math.random` inside `src/domain/**`. Need wall-clock time or randomness in the domain? Use the `Clock` / `Random` ports. The *only* exempt file is `src/domain/dates.ts`.
- **Dates are UTC ISO strings (`YYYY-MM-DD`) everywhere.** All date math lives in `src/domain/dates.ts` (uses `Date.UTC`; `weekdayMon()` returns 0=Mon..6=Sun). Streaks/reviews are keyed on these strings.
- **Progress is namespaced per pack** — `LocalStorageProgressStore` keys on `sunrise.progress.<packId>`, so multiple packs keep independent streaks/badges/reflections. Session state (active pack/theme, resume cursor) is global under `sunrise.session`.
- **Badge awards are one-way** — `sync()` only *adds* newly-earned badges; nothing un-awards. A task is stored `true` or deleted, never `false`. An item completes only when *all* its tasks are checked (rest items and task-less items never complete).
- **Schema versions are checked:** packs are `sunrise.pack/v1`, progress `sunrise.progress/v1`, themes `sunrise.theme/v1`. `ProgressValidator` migrates a legacy v2 (days→items) shape.
- **TS strictness:** `strict`, `noUncheckedIndexedAccess`, `erasableSyntaxOnly`, `verbatimModuleSyntax`, `allowImportingTsExtensions`. Imports use explicit `.ts` extensions (required for native `node --test`).

## Plugins

Two kinds, each self-registering, each installed by adding one line to `index.html` (no rebuild):

- **Content pack** — a `.js` file whose IIFE calls `SUNRISE.registerPack({...})`. Install via `<script src="data/packs/x.js"></script>`. Contract enforced by `PackValidator` in `src/domain/validators.ts`: `schema:"sunrise.pack/v1"`, unique ids, ≥1 track, ordered groups of items, non-rest items need ≥1 task, declarative-only badge rules referencing valid track/phase/item ids. Invalid packs are rejected (logged, never crash the app).
- **Theme** — a `themes/x.css` file scoping rules under `:root[data-theme="<id>"]`, plus a manifest. The 5 *built-in* themes live in `BUILTIN_THEMES` (`src/domain/builtins.ts`, added via `registry.addBuiltinThemes` in `main.ts`); **additional themes are registered by the inline `<script>` block at the bottom of `index.html`** calling `SUNRISE.registerTheme({...})`. To add a theme: drop the `.css` and add one `registerTheme` line there.

The authoring guides — `docs/plugins/content-pack.md` and `docs/plugins/theme.md` — are the project's primary deliverable and are designed to be **self-contained**: paste the whole guide + filled prompt into an LLM and paste the result back. Keep them in sync with `validators.ts` and with the canonical DOM hooks in `index.html` (`.app-header`, `.wrap`, `#dashboard`, `#todayCard`, `.day-rail`, `.modal`, the `.cm-*` card-map grid, `#motd`, `#fx`, etc.).

## Where things live

`src/main.ts` composition root · `src/domain/` pure core (`tracker.ts` facade, `entities.ts` types, `progress.ts` aggregate, services, `validators.ts`, `builtins.ts`) · `src/ports/index.ts` interfaces · `src/adapters/` DOM + storage + window registry · `test/domain/` pure unit tests · `test/adapters/` use a fake-DOM harness (`FakeEl` in `dom.test.ts`) and a Map-backed fake `localStorage`, so adapter tests run without a browser · `data/packs/dev-roadmap.js` the bundled example pack · `docs/` design docs + the plugin authoring guides.

> Note: the README still says "5 themes" — there are now 15 registered (5 built-in + 10 in `index.html`). The "calendar" concept was replaced by the **card map** (`.cm-*` hooks, `#cardMapModal`); some older docs may still reference the calendar.
