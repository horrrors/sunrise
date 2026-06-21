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

- **Command/query split (CQS).** The domain has two consumer-facing units, both injected into `DomController`: **`Tracker` (`src/domain/tracker.ts`) is the write model** — lifecycle (`init`/`loadPack`), navigation, intents (`setTaskDone`/`setReflection`), selection (`selectPack`/`selectTheme`/`setLang`), progress I/O (`importProgress(packId,data)`/`exportProgress`), raw state getters, and a readonly `view()` snapshot. **`Projections` (`src/domain/projections.ts`) is the read model** — it builds *every* view-model (`todayCard`/`dashboard`/`cardMap`/`trophies`/`selectors`/`comeback`/`aiPrompt`/`ui`/etc.) and owns *all* `Localized→string` i18n resolution, reading `tracker.view()` live. Domain *services* (`streaks`, `progress-stats`, `badge-engine`) are stateless calculators over `(Pack, Progress)` that both models share. Nothing reaches into individual services directly. Plugin import is its own use-case (see `src/domain/plugins/`), not part of either model.
- **Adapter split:** `DomRenderer` is a pure presenter (VMs → canonical DOM hooks, focus, theme/track-color CSS vars; no event wiring). `DomController` owns *all* event listeners; it routes **commands → `Tracker`**, **queries → `Projections`**, and **imports → `Importer`**, then re-renders via `DomRenderer`. UI strings the view-models don't carry are passed as `RenderLabels`, filled by the controller from `projections.ui(key)`.

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
- **Progress is namespaced per pack** — `LocalStorageProgressStore` keys on `sunrise.progress.<packId>`, so multiple packs keep independent streaks/badges/reflections. Session state (active pack/theme/`lang`, per-pack `cursors` map of resume positions) is global under `sunrise.session`. **User-imported packs/themes** are persisted as a flat list of raw, self-describing-by-`schema` objects under `sunrise.plugins` (`LocalStoragePluginStore`); `Importer.loadStored()` replays them into the registry at boot *after* built-ins, so a built-in wins any id clash.
- **i18n: every user-visible string is `Localized` (`string | {lang→string}`), resolved centrally in `Tracker`.** `Localized` lives in `entities.ts`; the resolver `tr(v, lang)` (`src/domain/i18n.ts`) picks the active language with **EN as the default/fallback** (then any present value, then `''`). A plain `string` is language-neutral. Resolution happens *inside* `Projections` (the read model) when it builds the (plain-string) view-models, so `DomRenderer`/`DomController` stay string-based. Language is `Session.lang` (default `en`), toggled by the header 🌐 button via `Tracker.setLang`; `SUPPORTED_LANGS` (`builtins.ts`) is the fixed EN/RU list. Pluralization is per-language in `src/domain/plural.ts` (`pluralIndex`) over per-language `DEFAULT_STREAK_WORDS`. The validator accepts a string *or* a `{lang:string}` map for every text field (`localized` schema flag). **Theme names are fixed brand strings — not localized.** Built-in chrome strings must ship both `en` and `ru` (guarded by `test/domain/builtins.test.ts`). `pack.locale` is now only a source-language hint; it no longer drives the UI language.
- **Badge awards are one-way and eagerly synced** — every progress mutation (`setTaskDone`, `setReflection`) runs `sync()`, which only *adds* newly-earned badges; nothing un-awards, so a trophy can never re-lock. A task is stored `true` or deleted, never `false`. An item completes only when *all* its tasks are checked (rest items never complete; task-less non-rest items are rejected by the validator).
- **Schema versions are checked:** packs are `sunrise.pack/v1`, progress `sunrise.progress/v1` (any *other* progress schema string is rejected; missing is tolerated), themes `sunrise.theme/v1`. A theme manifest must carry **exactly one of `cssHref` (a file path, for built-in/script-tag themes) or `css` (inline text, for JSON-imported themes)** — `WindowPluginRegistry.addTheme` materializes inline `css` into a blob-URL `cssHref` so the renderer's `<link>` path is unchanged. `ProgressValidator` migrates a legacy v2 (days→items) shape and silently drops the removed review feature's `reviews` key from stored blobs/old exports. Duplicate pack/theme ids are rejected at registration by `WindowPluginRegistry` (path `id`).
- **Import pipeline is open/closed (`src/domain/plugins/`).** The 📥 button feeds `Importer.import(json)`, which finds the first `ImportHandler` whose `matches(raw)` is true (by `schema`) → `validate` → `install`, persisting only `persistable` (catalog) handlers. Current handlers: `PackPlugin`/`ThemePlugin` (register into the live registry + persist), `ProgressPlugin` (applies to the active aggregate via the `ProgressTarget` port Tracker implements; not persistable). Adding a new importable kind = a new handler + one line in `main.ts`'s handler list — `Importer`, controller, storage format and boot loop don't change. Import is additive: duplicate ids are rejected, nothing is overwritten or removed.
- **TS strictness:** `strict`, `noUncheckedIndexedAccess`, `erasableSyntaxOnly`, `verbatimModuleSyntax`, `allowImportingTsExtensions`; `module`/`moduleResolution` are `NodeNext`, which enforces the explicit `.ts` extensions on relative imports (required for native `node --test`).

## Plugins

Two kinds, each self-registering, each installed by adding one line to `index.html` (no rebuild) **or** imported at runtime as JSON via the 📥 button (classified by `schema`, registered live, persisted under `sunrise.plugins`):

- **Content pack** — a `.js` file whose IIFE calls `SUNRISE.registerPack({...})` (install via `<script src="data/packs/x.js"></script>`), or the bare pack object as a `.json` file dropped on 📥. Contract enforced by `PackValidator` in `src/domain/validators.ts`: `schema:"sunrise.pack/v1"`, unique ids, ≥1 track, ordered groups of items, non-rest items need ≥1 task, declarative-only badge rules referencing valid track/phase/item ids. Invalid packs are rejected (logged, never crash the app).
- **Theme** — a manifest plus CSS scoped under `:root[data-theme="<id>"]`. Script-tag/built-in themes point at a `themes/x.css` file via `cssHref`; JSON-imported themes carry the CSS **inline** in `css` (a `file://` app can't ship a companion file). The 5 *built-in* themes live in `BUILTIN_THEMES` (`src/domain/builtins.ts`, added via `registry.addBuiltinThemes` in `main.ts`); **additional file-based themes are registered by the inline `<script>` block at the bottom of `index.html`** calling `SUNRISE.registerTheme({...})`. To add a file-based theme: drop the `.css` and add one `registerTheme` line there. To share a one-file theme: ship the manifest with inline `css` as `.json` and import it on 📥.
  - **Motion is per-theme CSS, not a shared abstraction.** `DomRenderer.applyTheme` cross-fades every switch (an opacity dip — automatic, theme-agnostic; degrades to an instant swap under reduced-motion and survives `[data-mobile]` since the mobile kill spares `opacity`/`transition`). Each theme owns its *entrance* + *idle signature* in its own file. Conventions (codified in `docs/plugins/theme.md` §7): prefer `transform`/`opacity` and **never animate `filter`/`backdrop-filter`** (the real frame-killers; a *single* `background-position` scroll layer is an accepted exception — the arcade perspective grids use it, since translating a repeating tiled layer can't loop seamlessly), **`@keyframes` prefixing is optional** (the app kills all animations during the cross-fade via `:root.theme-switching *{animation:none}`, so same-named keyframes across themes can no longer bleed; prefixing is still recommended for readability), and **anchor loops on children/pseudos** (the `[data-mobile]` kill zeroes `animation`/`transform`/`filter` only on the bare `body`/`.app-header` *elements*, not their pseudos/children). Because the heavy loops live on those pseudos/children, the mobile baseline *also* (centrally, in `index.html`) **freezes the full-viewport background loops** on `body`/`.app-header` pseudos + `.bar>i` (many scroll `background-position` — a whole-screen repaint a phone GPU can't sustain) and **strips the static `filter`/`drop-shadow`/`blur`** on the animated decorative glyphs (`.flame`/`.ring`/`.badge .bi`/`.wrap` pseudos) so their transform loops stay compositor-cheap on a phone (motion survives, glow drops). Decorative full-viewport layers must be `position:fixed` (an `absolute` layer with negative offsets bleeds past the edge → stray mobile scroll), and mobile chrome (footer/header padding) is kept tight so a near-empty day fits one screen. The reduced-motion + `[data-mobile]` guards stay centralized — no per-theme copies.
  - **Fonts are self-hosted via `fonts.css`** (always loaded by `index.html`; `fonts.css` + `fonts/*.woff2` are committed build artifacts precached by `gen-sw`). Themes use `font-family: 'Name', fallback` — 31 families are available (see `docs/plugins/theme.md` §7 for the full list). **Remote `@import` or any remote `url(...)` in theme CSS is forbidden** and rejected at both build time (`test/themes/offline-guard.test.ts`) and runtime (`ThemeValidator`). The app also injects three state vars on `<html>` refreshed every render: `--sunrise-progress` (0–100), `--sunrise-streak` (integer days), `--sunrise-hour` (0–23) — use them to make a theme react to the user's state.

The authoring guides — `docs/plugins/content-pack.md` and `docs/plugins/theme.md` — are the project's primary deliverable and are designed to be **self-contained**: paste the whole guide + filled prompt into an LLM and paste the result back. Keep them in sync with `validators.ts`, with the canonical DOM hooks in `index.html` (`.app-header`, `.wrap`, `#dashboard`, `#todayCard`, `.day-rail`, `.modal`, the `.cm-*` card-map grid, `#motd`, `#fx`, etc.), and with the motion conventions (`theme.md` §7 + the cross-fade in `dom-renderer.ts`).

## Where things live

`src/main.ts` composition root · `src/domain/` pure core (`tracker.ts` write model, `projections.ts` read model, `plugins/` import pipeline (`import-handler.ts` contracts, `importer.ts`, `{pack,theme,progress}-plugin.ts`), `entities.ts` types, `progress.ts` aggregate, services, `validators.ts`, `builtins.ts`, `i18n.ts` (`tr` resolver), `plural.ts`) · `src/ports/index.ts` interfaces (incl. `PluginStore`, write-`PluginRegistry`) · `src/adapters/` DOM + storage (`LocalStoragePluginStore`) + window registry · `test/domain/` pure unit tests (`plugins/` covers the import handlers) · `test/adapters/` use a fake-DOM harness (`FakeEl` in `dom.test.ts`) and a Map-backed fake `localStorage`, so adapter tests run without a browser · `data/packs/dev-roadmap.js` the bundled example pack · `docs/` design docs + the plugin authoring guides.

> Note: 17 themes are registered (5 built-in in `BUILTIN_THEMES` + 12 via the inline `<script>` in `index.html`). The "calendar" concept was replaced by the **card map** (`.cm-*` hooks, `#cardMapModal`); some older docs may still reference the calendar.
