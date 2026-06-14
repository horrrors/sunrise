# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Sunrise is an **offline, zero-runtime-dependency goal-achievement tracker**. It runs by double-clicking `index.html` from `file://` — no dev server. The core is TypeScript compiled by esbuild into a **committed** `dist/sunrise.js` IIFE. Content packs (`data/packs/*.js`) and themes (`themes/*.css`) are plain files that self-register at page load — they need no rebuild. Only core `src/` changes require a rebuild.

## Commands

```bash
npm run build      # esbuild src/main.ts -> dist/sunrise.js (+ .map) AND regenerates sw.js. REBUILD AFTER ANY src CHANGE.
npm run typecheck  # tsc --noEmit
npm test           # node --test "test/**/*.test.ts"
npm run lint       # eslint src test
npm run format     # prettier --write .
npm run format:check # prettier --check . — part of the pre-commit gate

# Single test file:
node --test test/domain/tracker.test.ts
# Single test case (regex on the test name):
node --test test/domain/tracker.test.ts --test-name-pattern='completing the active item'
```

- **Requires Node 23.11.0** (pinned in `.tool-versions` / `.nvmrc`). Tests are `.ts` files run *natively* by `node --test` via type-stripping — there is no test compile step and zero test-time dependencies.
- **Critical workflow:** after editing anything under `src/`, run `npm run build` and commit the regenerated `dist/sunrise.js` (and `.map`) *in the same change* as the `.ts` edits. `index.html` loads the bundle directly; stale `dist` means stale app.
- **`sw.js` is a committed build artifact too** — `scripts/gen-sw.mjs` (part of `npm run build`) globs every pack/theme/icon into the precache list and stamps a content-hash cache name, so adding a theme or editing any asset requires a rebuild+commit (staleness-tested in `test/pwa/pwa-shell.test.ts`). The PWA installs from HTTPS (Cloudflare Pages, no build step); on `file://` the app skips SW registration silently and behaves exactly as before.

## Architecture

A 3-ring onion. Dependencies point **inward only**: adapters → ports ← domain. The domain imports port *interfaces* but never adapters; `src/main.ts` is the **only** place adapters are imported (the composition root).

| Ring | Path | Rule |
|---|---|---|
| **Domain** | `src/domain/` | Pure business logic. No DOM, no I/O, no globals. |
| **Ports** | `src/ports/index.ts` | Interfaces only: `Clock`, `Random`, `ProgressStore`, `SessionStore`, `PackSource`, `ThemeSource`. |
| **Adapters** | `src/adapters/` | Implement ports against the real world (DOM, localStorage, `window`, system time). |
| **Composition root** | `src/main.ts` | Instantiates adapters, injects them into `Tracker` via `TrackerDeps`, exposes `window.SUNRISE`, boots `DomController`. |

- **`Tracker` (`src/domain/tracker.ts`) is the single domain facade.** All consumers — and especially the adapters — call `Tracker` methods; nothing reaches into individual domain services directly. Domain *services* (`streaks`, `progress-stats`, `badge-engine`) are stateless calculators over `(Pack, Progress)`; `Tracker` orchestrates them, holds navigation state, and persists via the injected `ProgressStore`/`SessionStore`.
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
- **Dates are local-calendar-day strings (`YYYY-MM-DD`) everywhere.** `SystemClock.today()` returns the *local* day (same time basis as `hour()` — the `Clock` port documents this). Date *math* lives in `src/domain/dates.ts` and is UTC-epoch arithmetic over the strings, so it's timezone-free (`weekdayMon()` returns 0=Mon..6=Sun). Streaks are keyed on these strings.
- **Progress is namespaced per pack** — `LocalStorageProgressStore` keys on `sunrise.progress.<packId>`, so multiple packs keep independent streaks/badges/reflections. Session state (active pack/theme/`lang`, per-pack `cursors` map of resume positions) is global under `sunrise.session`.
- **i18n: every user-visible string is `Localized` (`string | {lang→string}`), resolved centrally in `Tracker`.** `Localized` lives in `entities.ts`; the resolver `tr(v, lang)` (`src/domain/i18n.ts`) picks the active language with **EN as the default/fallback** (then any present value, then `''`). A plain `string` is language-neutral. Resolution happens *inside* `Tracker` when it builds the (plain-string) view-models, so `DomRenderer`/`DomController` stay string-based. Language is `Session.lang` (default `en`), toggled by the header 🌐 button via `Tracker.setLang`; `SUPPORTED_LANGS` (`builtins.ts`) is the fixed EN/RU list. Pluralization is per-language in `src/domain/plural.ts` (`pluralIndex`) over per-language `DEFAULT_STREAK_WORDS`. The validator accepts a string *or* a `{lang:string}` map for every text field (`localized` schema flag). **Theme names are fixed brand strings — not localized.** Built-in chrome strings must ship both `en` and `ru` (guarded by `test/domain/builtins.test.ts`). `pack.locale` is now only a source-language hint; it no longer drives the UI language.
- **Badge awards are one-way and eagerly synced** — every progress mutation (`setTaskDone`, `setReflection`) runs `sync()`, which only *adds* newly-earned badges; nothing un-awards, so a trophy can never re-lock. A task is stored `true` or deleted, never `false`. An item completes only when *all* its tasks are checked (rest items never complete; task-less non-rest items are rejected by the validator).
- **Schema versions are checked:** packs are `sunrise.pack/v1`, progress `sunrise.progress/v1` (any *other* progress schema string is rejected; missing is tolerated), themes `sunrise.theme/v1`. `ProgressValidator` migrates a legacy v2 (days→items) shape and silently drops the removed review feature's `reviews` key from stored blobs/old exports. Duplicate pack/theme ids are rejected at registration by `WindowPluginRegistry` (path `id`).
- **TS strictness:** `strict`, `noUncheckedIndexedAccess`, `erasableSyntaxOnly`, `verbatimModuleSyntax`, `allowImportingTsExtensions`; `module`/`moduleResolution` are `NodeNext`, which enforces the explicit `.ts` extensions on relative imports (required for native `node --test`).

## Plugins

Two kinds, each self-registering, each installed by adding one line to `index.html` (no rebuild):

- **Content pack** — a `.js` file whose IIFE calls `SUNRISE.registerPack({...})`. Install via `<script src="data/packs/x.js"></script>`. Contract enforced by `PackValidator` in `src/domain/validators.ts`: `schema:"sunrise.pack/v1"`, unique ids, ≥1 track, ordered groups of items, non-rest items need ≥1 task, declarative-only badge rules referencing valid track/phase/item ids. Invalid packs are rejected (logged, never crash the app).
- **Theme** — a `themes/x.css` file scoping rules under `:root[data-theme="<id>"]`, plus a manifest. The 5 *built-in* themes live in `BUILTIN_THEMES` (`src/domain/builtins.ts`, added via `registry.addBuiltinThemes` in `main.ts`); **additional themes are registered by the inline `<script>` block at the bottom of `index.html`** calling `SUNRISE.registerTheme({...})`. To add a theme: drop the `.css` and add one `registerTheme` line there.
  - **Motion is per-theme CSS, not a shared abstraction.** `DomRenderer.applyTheme` cross-fades every switch (an opacity dip — automatic, theme-agnostic; degrades to an instant swap under reduced-motion and survives `[data-mobile]` since the mobile kill spares `opacity`/`transition`). Each theme owns its *entrance* + *idle signature* in its own file. Conventions (codified in `docs/plugins/theme.md` §7): prefer `transform`/`opacity` and **never animate `filter`/`backdrop-filter`** (the real frame-killers; a *single* `background-position` scroll layer is an accepted exception — the arcade perspective grids use it, since translating a repeating tiled layer can't loop seamlessly), **theme-prefix every `@keyframes`** (outgoing+incoming sheets coexist ~200ms during the fade, so generic names like `flicker`/`taskIn` bleed across themes), and **anchor loops off `body`/`.app-header`** so `[data-mobile]`'s `animation:none` on those two elements doesn't kill them. The reduced-motion + `[data-mobile]` guards stay centralized — no per-theme copies.

The authoring guides — `docs/plugins/content-pack.md` and `docs/plugins/theme.md` — are the project's primary deliverable and are designed to be **self-contained**: paste the whole guide + filled prompt into an LLM and paste the result back. Keep them in sync with `validators.ts`, with the canonical DOM hooks in `index.html` (`.app-header`, `.wrap`, `#dashboard`, `#todayCard`, `.day-rail`, `.modal`, the `.cm-*` card-map grid, `#motd`, `#fx`, etc.), and with the motion conventions (`theme.md` §7 + the cross-fade in `dom-renderer.ts`).

## Where things live

`src/main.ts` composition root · `src/domain/` pure core (`tracker.ts` facade, `entities.ts` types, `progress.ts` aggregate, services, `validators.ts`, `builtins.ts`, `i18n.ts` (`tr` resolver), `plural.ts`) · `src/ports/index.ts` interfaces · `src/adapters/` DOM + storage + window registry · `test/domain/` pure unit tests · `test/adapters/` use a fake-DOM harness (`FakeEl` in `dom.test.ts`) and a Map-backed fake `localStorage`, so adapter tests run without a browser · `data/packs/dev-roadmap.js` the bundled example pack · `docs/` design docs + the plugin authoring guides.

> Note: 17 themes are registered (5 built-in in `BUILTIN_THEMES` + 12 via the inline `<script>` in `index.html`). The "calendar" concept was replaced by the **card map** (`.cm-*` hooks, `#cardMapModal`); some older docs may still reference the calendar.
