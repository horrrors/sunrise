# Sunrise — Core TypeScript + Onion Rewrite — Design / Spec

**Date:** 2026-06-04 · **Status:** approved for planning

## 1. Goal & philosophy

Rewrite Sunrise's core in **TypeScript**, restructured as a **SOLID, 3-ring onion** (clean
architecture): a pure, browser-agnostic domain at the center, small interfaces (ports) around it, and
browser concerns (DOM, `localStorage`, `Date`, `Math.random`) pushed to the outer ring as injected
adapters. The domain becomes fully unit-testable in isolation.

This is a **re-implementation that preserves observable behavior and data formats** — not a redesign.
Every current feature, the 30 badges, the plugin contracts, and existing saved progress carry over
unchanged. What changes: the language (JS→TS), the paradigm (functions → classes), the structure
(flat UMD modules → rings), the build (none → an esbuild bundle), and dev tooling.

Stated openly: a 3-ring onion over ~500 lines of logic is more structure than the app strictly needs.
Its justification is a deliberate goal — a clean, type-safe, SOLID core to build and learn on — which is
accepted as trading against raw simplicity.

## 2. Decisions (resolved during brainstorming)

1. **Language:** real TypeScript (not JSDoc/`.d.ts`-only). Authored in **erasable-syntax** style.
2. **Build/run:** a **pre-build** is allowed; **no dev server**. The app must still open by double-clicking
   `index.html` from `file://`. esbuild bundles the TS core to a single committed `dist/sunrise.js`.
3. **Plugin boundary:** **compile the core only.** Content packs stay runtime-loaded plain `.js`
   (self-registering on `window.SUNRISE`); themes stay `.css`. Adding/authoring a pack or external theme
   needs **no rebuild** — the AI-first pluginable goal is preserved.
4. **Paradigm/architecture:** OOP classes, **SOLID**, **pragmatic onion (3 rings)** — Domain / Ports /
   Adapters + a composition root.
5. **Error handling:** **exceptions**; the domain throws typed errors, and the **adapters/composition root
   are the only catch sites**, converting them to graceful fallbacks (never crash the UI).
6. **Testing:** upgrade to **Node 23** so `node --test` strips `.ts` types natively — **zero test
   dependencies**. (Implies erasable TS: no `enum`/`namespace`/constructor-parameter-properties.)
7. **Tooling:** **Prettier + typescript-eslint** (dev-only). All tooling is dev-only; the shipped
   `dist/sunrise.js` is plain JS with zero runtime dependencies.
8. **Domain modeling:** rich **`Progress` aggregate** (a class, mutable behind `#`-private fields, with
   invariants + `toJSON`/`static from`); immutable external contracts (`Pack`, `Track`, `Item`, `BadgeRule`,
   …) stay **interfaces**; stateless rules are **SRP service classes**; a **`Tracker` facade** orchestrates.

## 3. Constraints

**Kept:** opens by double-click on `file://`; no dev server; no runtime dependencies / no framework in the
shipped artifact; packs/themes remain runtime-pluggable without a rebuild; behavior + data-format parity;
simplicity-first applied *within* the chosen architecture (no ceremony beyond the 3 rings).

**Changed (deliberately relaxed):** a pre-build step now exists (esbuild + tsc); dev dependencies are
introduced (dev-only); the toolchain requires Node ≥ 23.6.

## 4. Architecture & runtime topology

Three rings; dependencies point strictly inward (no inner ring imports an outer one):

- **① Domain (pure TS, center):** entities/value-objects (`Pack`, `Track`, `Phase`, `Group`, `Item`,
  `Task`, `Resource`, `Theme`, `Session`, `BadgeRule`); the `Progress` aggregate; domain services
  `Completion`, `Streaks`, `ProgressStats`, `BadgeEngine`, `ReviewSchedule`, and `PackValidator` /
  `ThemeValidator` / `ProgressValidator`; the `Tracker` facade (the application/use-case layer, folded into
  this ring). Knows nothing of the browser, `Date`, `localStorage`, or the DOM.
- **② Ports (interfaces):** `Clock`, `Random`, `ProgressStore`, `SessionStore`, `PackSource`,
  `ThemeSource`. The domain/facade depend only on these (DIP + ISP). Presentation is **not** a port — see §6.
- **③ Adapters (browser, outer):** `SystemClock`, `MathRandom`, `LocalStorageProgressStore` /
  `LocalStorageSessionStore`, `WindowPluginRegistry`, `DomRenderer`, `DomController`; plus the composition
  root `main.ts` that wires adapters → domain and is the single top-level catch boundary.

**Runtime topology (how it loads on `file://`):**
```
index.html
  → dist/sunrise.js          (esbuild IIFE bundle: domain+ports+adapters+root; assigns window.SUNRISE
                              with registerPack/registerTheme immediately; boots on DOMContentLoaded)
  → data/packs/dev-roadmap.js (runtime content pack — plain classic-IIFE .js, validated at register)
  → … any user/AI-authored pack or external theme .js …   ← added with NO rebuild
themes/*.css                 (loaded via the #themeCss <link>, swapped on theme change)
```
ES-module `import`s are blocked by browsers on `file://` (origin `null`), which is exactly why the core is
**bundled to one classic IIFE**. App-level defaults and the 5 bundled theme manifests live **inside** the
bundle (`builtins.ts`); only content packs (and user themes) are runtime files.

## 5. Domain model & type conventions

**Type conventions (erasable TS):** `interface` for object shapes; **discriminated unions** for variants;
`as const` + string-literal unions instead of `enum`; `readonly` / `Readonly<>` on external contracts;
`import type` for type-only imports; `#`-private fields for genuine encapsulation on mutable classes (real
JS, strips cleanly). `strict`, `erasableSyntaxOnly`, `noUncheckedIndexedAccess` on. **No** `enum`,
`namespace`, or constructor parameter properties (declare fields and assign explicitly).

**External contracts = interfaces** (immutable plugin/storage data, validated at the boundary, never
mutated; classing them would only add hydration cost):
```ts
interface Pack {
  readonly schema: 'sunrise.pack/v1';
  readonly id: string; readonly name: string; readonly version: string;
  readonly locale?: string; readonly settings?: PackSettings;
  readonly tracks: readonly Track[]; readonly phases?: readonly Phase[];
  readonly groups: readonly Group[]; readonly badges?: readonly BadgeRule[];
  readonly mottos?: readonly string[]; readonly surprises?: readonly string[];
  readonly ui?: Readonly<Record<string, string>>;
}
interface Item { readonly id: string; readonly track: string; readonly title?: string;
  readonly warmup?: string; readonly reflectPrompt?: string;
  readonly tasks?: readonly Task[]; readonly resources?: readonly Resource[]; readonly rest?: boolean; }
interface Task { readonly id: string; readonly text: string; readonly guidance?: string; }
// Track, Phase, Group, Resource, PackSettings, Theme, Session analogous
```

**Badge rules = discriminated union** (the idiomatic upgrade of today's `BADGE_RULES` table; gives the
engine a compile-time exhaustive `switch (rule.type)` with a `never` default):
```ts
type BadgeRule = BadgeMeta & BadgeCondition;            // BadgeMeta = { id; title; desc?; icon? }
type BadgeCondition =
  | { type: 'streak'; gte: number } | { type: 'days-done'; gte: number }
  | { type: 'percent'; gte: number } | { type: 'all-done' }
  | { type: 'tasks-done'; gte: number; track?: string } | { type: 'reflections'; gte: number }
  | { type: 'groups-complete'; gte: number } | { type: 'track-complete'; track: string }
  | { type: 'phase-complete'; phase: string } | { type: 'item-complete'; item: string }
  | { type: 'all-tracks'; eachGte: number } | { type: 'weekday'; days: readonly number[] }
  | { type: 'hour-range'; from: number; to: number } | { type: 'comeback' };
```

**Domain split (DDD-lite — rich aggregate + service classes):**
- **`Progress`** — the one mutable aggregate, a class: `#`-private state, intent methods (`setTaskDone`,
  `setReflection`, `scheduleReview`, `completeReview`, `awardBadge`) that enforce the completion invariant
  (all of an item's tasks checked ⇒ `completedAt`/`completedHour` set; un-checking clears them), read
  accessors, and `toJSON()` / `static from(raw): Progress` at the storage seam (which validates and is a
  catch point). Encapsulation replaces the old spread-everywhere immutability.
- **Stateless services = SRP classes**, composed by constructor injection (explicit fields, no
  param-properties): `Completion`, `Streaks`, `ProgressStats`, `BadgeEngine` (consumes the prior three),
  `ReviewSchedule`, and the three validators (throw `ValidationError`). They operate on `Pack` + `Progress`
  and take `today`/`hour` as parameters (never call `Date`).
- **`Tracker`** — the facade: constructor-injected with the ports + services; exposes command intents and
  **query methods returning plain view-models** (`dashboard()`, `todayCard()`, `selectors()`,
  `calendar(month)`, `trophies()`). Intent results carry effect data, e.g.
  `completeTask() → { unlockedBadges: string[]; surprise?: string }`.

## 6. Ports, adapters & the exception boundary

**Ports** (small, single-purpose):
```ts
interface Clock         { today(): string; hour(): number; }   // UTC date string; local hour (parity)
interface Random        { next(): number; }                    // [0,1)
interface ProgressStore { load(packId: string): Progress; save(packId: string, p: Progress): void; }
interface SessionStore  { load(): Session; save(s: Session): void; }
interface PackSource    { packs(): readonly Pack[]; }
interface ThemeSource   { themes(): readonly Theme[]; }
```

**Presentation is an adapter concern, not a domain port.** The `DomController` calls `Tracker` queries to
get view-models and drives `DomRenderer`; after each intent it re-renders and fires confetti/toasts from the
intent result. The domain therefore has zero knowledge of rendering.

**Adapters:** `SystemClock` (`new Date()`), `MathRandom` (`Math.random()`), `LocalStorageProgressStore` /
`LocalStorageSessionStore` (keys `sunrise.progress.<id>` / `sunrise.session`; `load` hydrates via
`Progress.from` and **catches → `Progress.empty()`**), `WindowPluginRegistry` (`PackSource` + `ThemeSource`;
backs `window.SUNRISE.registerPack/registerTheme`; validate-at-register, rejecting bad plugins with a
recorded reason), `DomRenderer` (view-models → DOM, `esc()` on all data), `DomController` (events → intents
→ re-render; Escape-to-close), and `main.ts` (composition root, one-shot migration, boot).

**Exception model** (exceptions internally; "never crash the UI" preserved by confining catches to the edge):
- Domain throws typed errors: `ValidationError` (bad pack/theme/progress shape), `ImportError` (bad import
  JSON). Genuinely-absent-but-expected lookups return `undefined`; only "this should never happen"
  invariants throw.
- **The only four catch sites**, all in adapters/root:
  1. `WindowPluginRegistry.register*` → reject the plugin (record + `console.error`); app keeps running.
  2. `LocalStorage*Store.load` → fresh defaults; corrupt save degrades, no crash.
  3. `DomController` import handler → `alert` + keep current progress.
  4. `main.ts` boot → render the stub (listing rejection reasons) if nothing loads.
- Everywhere else, errors propagate to one of these. The domain never catches its own.

## 7. Project layout, build, tooling, testing

```
src/
  domain/
    entities.ts badge-rule.ts progress.ts
    completion.ts streaks.ts progress-stats.ts badge-engine.ts review-schedule.ts
    validators.ts errors.ts tracker.ts builtins.ts
  ports/index.ts
  adapters/
    system-clock.ts math-random.ts local-storage-store.ts
    window-registry.ts dom-renderer.ts dom-controller.ts
  main.ts
dist/sunrise.js            esbuild bundle (committed)
data/packs/dev-roadmap.js  pack #1 — runtime classic-IIFE .js (droppable, AI-authorable)
themes/*.css               unchanged
test/*.test.ts             run by node --test (Node 23 strips types natively)
```

One class per file (SRP + small focused files); ports grouped in one file (tiny interfaces). The app-level
defaults + the 5 bundled theme manifests move **into** the bundle (`builtins.ts`); only content packs (and
user themes) stay runtime `.js`. **Runtime plugin files** are framework-free classic-IIFE `.js` touching
only `globalThis.SUNRISE` (no `import`/`export`/`module.exports`) — so the same file works as a browser
`<script>` on `file://` *and* as a side-effect `import()` in a Node test (with a fake `globalThis.SUNRISE`).

**Build & config:**
- **esbuild:** `src/main.ts → dist/sunrise.js`, `--bundle --format=iife --target=es2020 --sourcemap`
  (unminified, committed). The IIFE assigns `window.SUNRISE` immediately and boots on `DOMContentLoaded`,
  so pack `<script>` tags after it register in time.
- **tsconfig** (type-check only — esbuild transpiles): `strict`, `erasableSyntaxOnly`, `verbatimModuleSyntax`,
  `isolatedModules`, `noUncheckedIndexedAccess`, `noEmit`, `lib: ["ES2020","DOM"]`. `package.json`
  `"type": "module"`.
- **npm scripts:** `build` (esbuild), `typecheck` (`tsc --noEmit`), `test`
  (`node --test 'test/**/*.test.ts'`, Node ≥ 23.6), `lint` (eslint), `format` (prettier).
- **Dev deps** (first ever, all dev-only): `typescript`, `esbuild`, `prettier`, `eslint`,
  `typescript-eslint`. `.gitignore` adds `node_modules/`; `dist/` is committed.

**Testing:** `.ts` tests import domain classes directly (the domain ring needs no DOM — the onion payoff).
`node --test` strips types natively (zero test deps). Adapters get lighter coverage via a small fake-DOM
`vm` harness (ported from today's `app.test`).

## 8. Parity, migration & rollout

**Parity (hard guarantee):** every feature on the prior final-review checklist is preserved — strict day
completion, streaks (current/longest, UTC), all **30 badges** with identical ids + sticky-`at` semantics,
calendar, confetti, surprises (12% + `lastSurprise`), comeback, motd rotation, export/import round-trip
(incl. legacy-v2 acceptance), 5 themes + persistence, the guidance spoiler, phases/tracks cards, spaced
repetition, pack switcher, per-pack progress. Plugin contracts stay byte-compatible (`sunrise.pack/v1`,
`sunrise.theme/v1`, `sunrise.progress/v1`).

**Data migration: none needed.** Storage keys and JSON shapes are unchanged; `Progress.from(raw)` hydrates
the same blobs, and the legacy `devRoadmapState.v1 → sunrise.progress.dev-roadmap` one-shot is ported into
the store/root. The current 69 tests' coverage is ported to `.ts` tests against the new domain classes.

**Phased rollout** (the old browser app keeps running on the old `.js` — `index.html` untouched — until the
final flip; `<script>` ignores `package.json` `type`):
1. **Toolchain & skeleton** — Node 23; devDeps + `tsconfig`/eslint/prettier + `package.json`
   (`"type":"module"`, scripts); `src/` skeleton. Old CommonJS `.js` tests retire as `.ts` replacements land.
2. **Domain ring (TDD)** — entities, `Progress`, services, validators, `Tracker`, `builtins`; pure `.ts`
   tests porting the existing coverage. Green gate.
3. **Ports & adapters** — interfaces + `LocalStorage*`, `SystemClock`, `MathRandom`, `WindowPluginRegistry`,
   `DomRenderer`, `DomController`; adapter tests via the fake-DOM harness.
4. **Composition root + bundle** — `main.ts`; esbuild → `dist/sunrise.js`; verify boot in the harness.
5. **The flip (one commit)** — new `index.html` loads `dist/sunrise.js` + runtime packs; tweak
   `dev-roadmap.js` to the classic-IIFE form (drop `module.exports`); **delete** old core
   (`logic.js`, `app.js`, `core/*.js`, `data/app-defaults.js`, `data/builtin-themes.js`) + old tests.
   Manual browser parity pass.
6. **Verify** — full `.ts` suite green + browser smoke + confirm a real legacy save migrates.

**Transition note:** between steps 1 and 5 the browser runs the old code while the new tests cover the
ported logic — a window where the about-to-be-deleted old source isn't covered by its old suite. Accepted
cost of a language swap; the app stays runnable throughout and the flip is one reviewable commit.

## 9. Out of scope

A dev server / live transpile / HMR; ES-module `<script type=module>` at runtime; minified/obfuscated
output; bundling packs into the build (they stay runtime); any new feature or behavior change beyond the
port; changing the plugin contracts or storage formats; rewriting the themes or the curriculum content.

## 10. Risks & honest caveats

- **Over-architecture for the size.** Accepted, as a deliberate learning/quality goal (§1).
- **First dependencies + a build step.** A real shift for a project whose identity was "zero-build" — kept
  dev-only and the runnable artifact stays file://-openable, but the toolchain now matters (Node 23, esbuild).
- **Committed `dist/`.** The built bundle is in git; it can drift from `src/` if someone edits source without
  rebuilding. Mitigation: `build` is part of the verify step; consider a pre-commit/CI check later.
- **Erasable-TS discipline.** `enum`/`namespace`/param-properties are forbidden (else Node-native tests
  break); enforced by `erasableSyntaxOnly` + eslint.
- **Transition coverage window** (§8) during the language swap.
