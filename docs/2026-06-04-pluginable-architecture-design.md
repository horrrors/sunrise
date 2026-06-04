# Sunrise — Pluginable & AI-First Architecture — Design / Spec

**Date:** 2026-06-04 · **Status:** approved for planning

## 1. Goal & philosophy

Turn Sunrise from a single hardcoded curriculum tracker into a **thin host that loads plugins**. Two plugin
types — **themes** and **self-contained content packs** — drop in without touching core. The current 13-week
dev curriculum becomes "pack #1", authored against the same contract any future pack uses.

"AI-first" means **the docs are the interface**: each plugin type gets a professional, *standalone* authoring
doc, complete enough that an LLM with zero knowledge of the source produces a valid, working plugin from the
doc alone. The contract is declarative, versioned, and faithfully enforced by a validator, so the doc and the
runtime cannot drift.

No feature here ships an import button. The point is to **establish the architecture** so that import-from-file
(and a later dev-server) become small, isolated additions rather than rewrites.

## 2. Constraints (kept)

- **Zero-build, file://, offline, vanilla.** No framework, bundler, npm dependency, or build step. Opens by
  double-click. Data ships as `.js` wrappers; themes as CSS; no `fetch`/ES-module of local files.
- **Simplicity-first.** Every abstraction must justify the concrete pain it removes today. We are building a
  small host + contract, not a plugin framework. No layout/widget DSL (explicitly rejected).
- **Behavior parity + lossless migration.** All current behavior (progress, streaks, calendar, 30 badges,
  confetti, surprises, comeback, motd, export/import, themes) is preserved. Existing saved progress migrates
  with zero loss.
- **Future-swappable load seam.** Moving to a dev server later (fetch JSON → register) must touch exactly one
  file.

## 3. Decisions (resolved during brainstorming)

1. **Runtime:** stay zero-build / file://; isolate the load mechanism so a dev-server swap is one-spot.
2. **AI-first:** pluginable architecture + standalone per-plugin authoring docs an LLM can author from blind.
   (No in-app AI, no MCP, no adaptive curriculum — out of scope.)
3. **Plugin model:** two types — themes (independent CSS) and **self-contained content packs** (each declares
   its own tracks, structure, settings, and optional badges inline; no cross-plugin dependencies).
4. **Packs + progress:** multiple packs installed, switchable; **progress namespaced per pack**. Curriculum =
   pack #1.
5. **Badges:** a generic, structure-agnostic engine ships with the app; packs add extra badges via a
   **declarative (no-JS) rule format**.
6. **Contract approach (B):** a hand-rolled, versioned schema per plugin type that is both the doc's core and
   enforced by a pure `validate*()` in `logic.js`. Invalid plugins are rejected with a precise reason.

**Vocabulary:** the contract uses neutral nouns `groups`/`items` (not `weeks`/`days`); a pack's
`settings.labels` carries the display vocabulary (e.g. "Неделя"/"День"), so the UI reads naturally per pack.

## 4. Architecture & file layout

Three layers with one deliberately isolated seam.

**The load seam.** `core/registry.js` loads first and exposes exactly four functions on `window.SUNRISE`:
`registerPack(pack)`, `registerTheme(theme)`, `packs()`, `themes()`. Every plugin self-registers by calling
these. This is the entire loading contract; a future dev server replaces only this file (fetch JSON →
`registerPack`) and nothing downstream changes. Adding a plugin never touches core — add one `<script src>`
line (and later, the import button feeds the same `registerPack`).

```
index.html              load order: core/registry.js → logic.js → data/app-defaults.js
                        → data/builtin-themes.js → data/packs/dev-roadmap.js → app.js
core/registry.js        [new] the 4-function load seam — the ONE swappable place
logic.js                pure core, generalized (no hardcoded 13/7/phases)
                        + declarative badge-rule interpreter
                        + validatePack() / validateTheme() / validateProgress()
app.js                  host/controller: resolves active pack + theme, renders from the
                        pack's declared structure, pack switcher, per-pack progress
data/app-defaults.js    [was content.js] app-level fallback UI strings + the GENERIC badge rule set
data/builtin-themes.js  [new] registers the 5 bundled themes
themes/<id>.css         unchanged
data/packs/dev-roadmap.js  [was data/curriculum.js + the RU/JP flavor of content.js] pack #1
docs/plugins/           [new] README.md, content-pack.md, theme.md — the AI-first authoring docs
test/                   generalized + new tests (validate, badges, migration, dev-roadmap, doc-drift)
```

**What each layer knows:**
- `logic.js` — knows the *shapes* (pack/theme/progress contracts, badge-rule types) but nothing about any
  specific pack. Stays pure + Node-testable.
- `app.js` — knows the canonical DOM hooks and how to render *a* pack; reads structure/labels/badges from the
  active pack, never hardcodes them.
- plugins — know their own content; know nothing about app internals beyond the documented contract.

## 5. Content-pack contract (`sunrise.pack/v1`)

A content pack is one declarative object passed to `registerPack(...)`.

### 5.1 Envelope
```js
{
  schema: "sunrise.pack/v1",   // contract version (validator + future migration)
  id: "dev-roadmap",           // unique; namespaces this pack's progress
  name: "Dev Growth Roadmap",
  version: "1.0.0",
  locale: "ru",                // drives <html lang> (also closes the a11y lang gap)
  settings: { ... },           // behavioral/display knobs (optional)
  tracks:   [ ... ],           // the columns/subjects (required, >=1)
  phases:   [ ... ],           // OPTIONAL top grouping for the dashboard "phases" card
  groups:   [ ... ],           // ordered sections holding items (required, >=1)
  badges:   [ ... ],           // OPTIONAL declarative rules
  mottos: [...], surprises: [...]  // OPTIONAL flavor; fall back to app defaults
}
```
Required: `schema, id, name, version, tracks, groups`. All else optional with documented fallbacks.

### 5.2 `tracks[]` — per-column settings
```js
{ id:"dsa", label:"Алгоритмы", icon:"算", color:"#e23", reviewable:true }
```
- `color` is a **hint**: `app.js` sets `--track-<id>: <color>` inline so a pack looks right under *any* theme.
  This pack `color` takes precedence over a theme's `:root` `--track-<id>`; a theme that wants to control a
  track's color should style `[data-track="<id>"]` elements directly. This lets a brand-new pack with
  brand-new track ids work without a custom theme.
- `reviewable` generalizes spaced repetition (today hardcoded to `track==='dsa'`).

### 5.3 `settings{}` — structural/behavioral knobs (no hardcoded counts)
```js
{
  labels: { phase:"Фаза", group:"Неделя", groupAbbr:"Нед", item:"День" },
  reviews: true,        // enable spaced repetition for this pack
  reflections: true,    // show the reflection textarea
  warmups: true         // show the warm-up line
}
```
"Item count per group" is not a setting — it is whatever items a group declares (free).

### 5.4 `phases[]` / `groups[]` / `items[]` — generalized structure
```js
phases: [ { id:"p1", title:"Фундамент" } ],         // optional; card hides if absent
groups: [
  { id:"w1", title:"Неделя 1", phase:"p1", theme:"Сложность, базовые структуры…",
    items: [
      { id:"w1d1", track:"dsa", title:"Сложность + массивы + хеш-таблицы",
        warmup:"…", reflectPrompt:"…",
        tasks:[ {id:"t1", text:"…", guidance:"what a strong answer looks like"}, {id:"t2", text:"…"} ],
        resources:[ {label:"Big-O", note:"bigocheatsheet.com"} ] },
      { id:"w1d7", track:"rest", rest:true, reflectPrompt:"…" }   // breather, not counted
    ] }
]
```
- `item` is complete when all its `tasks` are checked (unchanged semantics). `rest:true` items are
  non-trackable and excluded from all progress.
- Each task is `{ id, text, guidance? }`. `guidance` is optional text shown as a collapsible
  `.task-hint` spoiler under the checkbox (the "what counts as a strong answer" note); its label is the
  app-default `ui.hint`. `.task-wrap`/`.task-hint`/`.task-hint-body` are canonical hooks themes may style.
- `group.phase` (optional) references a `phases[].id`. A pack with no phases hides the phases card.
- Dropped vs today: the required `week`/`dow` integer fields (they baked in the 7-day-week assumption).
- Mapping from today's curriculum: week→group, day→item, `week.theme`→`group.theme`, `week.phase`→`group.phase`,
  track/title/tasks/warmup/resources unchanged, `dow`/`week` numbers dropped, rest day → `rest:true` item.

### 5.5 `badges[]` — declarative rule DSL
Each badge is data: `{ id, title, desc, icon, type, ...params }`. One pure interpreter maps `type` → predicate.
The **generic set ships in `data/app-defaults.js`** (works for any pack); a pack *appends* its own; both run
through the same interpreter and are deduped by `id`.

| `type` | params | reproduces today's badge |
|---|---|---|
| `streak` | `{gte}` | streak-3/7/14/30/100 |
| `days-done` | `{gte}` | first-light (gte 1), days-10/25/50 |
| `percent` | `{gte}` | halfway (50) |
| `all-done` | — | finisher |
| `tasks-done` | `{gte, track?}` | tasks-100; algorithmist (track dsa, gte 50) |
| `reflections` | `{gte}` | scribe-10/30 |
| `groups-complete` | `{gte}` | perfect-week (1), weeks-4 (4) |
| `track-complete` | `{track}` | dsa/node/ts/sysdesign-master |
| `phase-complete` | `{phase}` | phase-1/2/3 |
| `item-complete` | `{item}` | capstone (item `w13d6`) |
| `all-tracks` | `{eachGte}` | polyglot (≥1 in every track) |
| `weekday` | `{days:[6,7]}` | weekend |
| `hour-range` | `{from, to}` (wraps if from>to) | night-owl (22→5), early-lark (5→8) |
| `comeback` | — | comeback |

The generic (app-default) set is everything that needs no pack-specific id: `streak`, `days-done`, `percent`,
`all-done`, `tasks-done` (no track), `reflections`, `groups-complete`, `weekday`, `hour-range`, `comeback`. The
pack-specific badges (`track-complete`, `phase-complete`, `item-complete`, `tasks-done` with track, `all-tracks`)
move into `dev-roadmap.js`. A pack with zero declared badges still earns the entire generic set.

**Badge id stability requirement:** pack #1's declared badge ids + the generic set ids stay byte-identical to
today's (`first-light`, `capstone`, `dsa-master`, …) so already-earned badges survive migration.

## 6. Theme contract (`sunrise.theme/v1`)

A theme registers a manifest: `{ schema, id, name, version, cssHref }`. Bundled themes register together via
`data/builtin-themes.js`; external/AI themes are individual self-registering files. `app.js` swaps the active
theme's `cssHref` into `#themeCss` (today's mechanism) and sets `data-theme`. The theme styles the **canonical
DOM hooks** and provides the **CSS-variable contract** (`--bg/--panel/--line/--ink/--accent/--gold/--track-<id>/
--confetti-*` …). `prefers-reduced-motion` support becomes a documented requirement (all 5 current themes
already honor it). Full hook + variable reference lives in `docs/plugins/theme.md`.

## 7. State model & migration

### 7.1 Storage — one key per pack
```
sunrise.session                → { activePackId, themeId }
sunrise.progress.<packId>      → { schema:"sunrise.progress/v1", items:{…}, reviews:[…], badges:{…}, lastSurprise }
```
One key per pack gives true isolation (independent streaks), makes future per-pack export trivial (one key =
one file), and makes deleting a pack's data a single `removeItem`. `sunrise.session` holds the two active
pointers.

### 7.2 Per-pack progress shape
Semantically identical to today's v2. The only rename: the inner `days` map → `items` (coherence with the
contract; invisible to plugin authors; mechanical, test-covered change in `logic.js`).
```js
{ schema:"sunrise.progress/v1",
  items: { "w1d1": { tasks:{t1:true}, reflection:"…", completedAt:"2026-06-04", completedHour:14 } },
  reviews: [ { itemId, lastDate, stage } ],
  badges:  { "first-light": { at:"2026-06-04" } },
  lastSurprise: null }
```

### 7.3 Migration: legacy state → per-pack progress (lossless)
The legacy blob carries `version:2`; the new per-pack format is `sunrise.progress/v1`. One-time `migrate()` on
startup:
1. If `devRoadmapState.v1` exists and `sunrise.progress.dev-roadmap` does not → parse the old blob, copy
   `{days→items, reviews, badges, lastSurprise}` verbatim under pack id `dev-roadmap` (item ids unchanged), set
   `sunrise.session.activePackId = "dev-roadmap"`.
2. `sunriseTheme` → `sunrise.session.themeId`.
3. Leave the old key untouched as a safety net (drop a version later).

Migration is **idempotent** and asserted by test against a real exported v2 file: every completion, streak, and
badge must survive intact.

### 7.4 Resolution
- On init, if `activePackId` isn't among registered packs → fall back to the first registered pack; same for
  theme. No crash, no blank screen.

## 8. Loader, validation & error handling

### 8.1 Validate-at-register
`registerPack`/`registerTheme` run the validator first; only valid plugins enter the registry, so `app.js` never
sees a malformed plugin. The registry keeps `_rejected[]` (`{kind, id, errors}`) — the exact data a future
import dialog will display.

### 8.2 Validators (`logic.js`, pure + tested)
`validatePack`, `validateTheme`, `validateProgress` → `{ ok, errors:[{path, msg}] }`. Two layers:
1. **Structural** — driven by a small **schema descriptor** (plain JS object: required keys, types, nesting,
   patterns) interpreted by a tiny `check(value, schema, path)` walker. The descriptor is the single source of
   truth, embedded into the authoring docs so they cannot describe a shape the validator rejects.
2. **Semantic** — explicit cross-reference checks a type-walk can't express: globally-unique `item.id`; unique
   `track.id`/`badge.id`/`group.id`/`phase.id`; every `item.track` references a declared track; every
   `group.phase` references a declared phase; every `badge.type` known with required params present; referential
   badges resolve (`item-complete{item}`, `track-complete{track}`, `phase-complete{phase}`).

Messages are path-anchored and actionable: `tracks[2].color: required`,
`badges[5].type "tarck-complete" unknown`, `groups[0].items[3].track "dsaa" not declared`.

### 8.3 Error-handling matrix
| Situation | Behavior |
|---|---|
| Pack fails validation | Rejected, not registered; reason in `_rejected[]` + console; absent from switcher. |
| Active/only pack invalid → nothing to render | Existing graceful full-screen stub, now listing the reason. |
| Theme fails validation | Rejected; fall back to first valid theme (bundled themes always valid). |
| `activePackId` points to a removed pack | Fall back to first registered pack. |
| Unknown `schema` version | Rejected with a clear "unsupported contract version" message (migration hook later). |
| Corrupt/hand-edited progress | `validateProgress` fails → fresh per-pack progress; **no crash** (fixes the review's robustness bug). |
| Future import button | Feeds the same validators; surfaces `errors[]` in the dialog instead of console. |

One set of pure validators, exercised at register-time, at migration, and (later) at import.

## 9. Docs deliverable (`docs/plugins/`)

Standalone, source-free authoring docs:
- **`README.md`** — the two plugin types, the canonical DOM-hook contract (refreshed from the modular-refactor
  doc §5), and the loading convention.
- **`content-pack.md`** — full pack contract; `tracks`/`settings`/`groups`/`items` references; the complete
  badge-rule reference; the embedded schema descriptor (same object `validatePack` walks); a complete minimal
  working pack; a paste-ready LLM prompt template; versioning note.
- **`theme.md`** — canonical hooks a theme must style; the CSS-variable contract; manifest shape;
  `prefers-reduced-motion` requirement; a minimal complete example; a prompt template.

The docs are correct because pack #1 is itself authored against the same contract the validator enforces.

## 10. Testing

All `node --test`, no deps, pure where possible.
- **`validate.test.js`** *(new, core)* — valid pack/theme/progress pass; each semantic violation yields the
  expected `{path, msg}`; unsupported `schema` version rejected.
- **`badges.test.js`** *(new)* — every rule `type` evaluates correctly (incl. `hour-range` wrap, `all-tracks`,
  `comeback`); generic + pack sets merge and dedupe by id.
- **`logic.test.js`** *(updated)* — progress/streak/review functions run against a generic pack fixture (no
  hardcoded 13/7); existing pack-agnostic date/streak/immutability tests retained.
- **`migration.test.js`** *(new, critical)* — a real `devRoadmapState.v1` blob migrates with every completion,
  streak, and badge intact; idempotent.
- **`dev-roadmap.test.js`** *(was curriculum.test.js)* — pack #1 passes `validatePack`; structural invariants
  hold; declared badge ids match what old saved data references.
- **`app.test.js`** *(updated)* — vm+fake-DOM harness boots registry → logic → app-defaults → builtin-themes →
  dev-roadmap → app; renders dashboard/day/selectors; pack switcher present; theme switch works; completing an
  item persists a badge under the namespaced key.
- **`doc-drift.test.js`** *(optional)* — the schema descriptor embedded in the docs equals `logic.js`'s
  descriptor, enforcing "docs can't drift".

## 11. Out of scope (now)

Import buttons / file pickers (the architecture is built *for* them, but they are not built here); dev server +
real JSON + fetch; in-app AI / MCP / adaptive curriculum; a layout/widget DSL or any "framework" generality;
new themes or new packs beyond reshaping the existing curriculum into pack #1.

## 12. Implementation phases (high-level — detailed in the plan)

1. `core/registry.js` + load-order wiring in `index.html`; `validatePack/Theme/Progress` + schema descriptors
   in `logic.js` (with tests) — no behavior change yet.
2. Generalize `logic.js`: structure-agnostic progress/streak/phase/review functions; the declarative badge
   interpreter; the generic badge set in `data/app-defaults.js`.
3. Reshape today's curriculum + RU/JP flavor into `data/packs/dev-roadmap.js` (pack #1), with its
   pack-specific declarative badges; split app-level defaults into `data/app-defaults.js`;
   `data/builtin-themes.js`.
4. State v2→v3: per-pack keys, `sunrise.session`, lossless `migrate()`, validated `parseImported`
   (folds in the three review robustness fixes).
5. `app.js`: resolve active pack/theme, render from declared structure + labels, pack switcher, namespaced
   progress, inline `--track-<id>` colors, graceful fallbacks.
6. Authoring docs under `docs/plugins/` (README, content-pack, theme).
7. Full test pass + behavior-parity verification against current app.
