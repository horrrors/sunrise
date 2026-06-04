# Sunrise — Architecture Guide

A guide to *how the code is shaped and why*, written so you can read it once and then add features yourself. If you've never seen this codebase, read it top to bottom; if you're here to do a specific change, jump to **[How to extend it](#how-to-extend-it)**.

---

## 1. The one big idea

The app is a **thin host that runs plugins**, built as a **SOLID onion** (a.k.a. ports-and-adapters / clean architecture). The whole point of the shape is one rule:

> **The dependency rule: all dependencies point *inward*. The pure logic at the center knows nothing about the browser.**

So the rules of the app (what "completing a day" means, how streaks work, when a badge unlocks) live in plain TypeScript classes that never touch the DOM, `localStorage`, `Date`, or `Math.random`. Everything browser-shaped — the screen, storage, the clock, the plugin registry — lives at the *edges* and is handed to the core through small interfaces. The core asks for what it needs ("what's today?", "save this") and the edges provide it.

**Why bother?** Two payoffs you can feel:
1. **The core is tested without a browser.** All ~75 tests run in plain Node (`node --test`): the domain has zero browser dependencies, and even the adapter tests use a tiny fake DOM rather than a real browser. No jsdom, no DOM mocking for the rules.
2. **The edges are swappable.** Storage is an interface; today it's `localStorage`, tomorrow it could be a server, and the core wouldn't change a line.

> **Honest note:** for an app this small this structure is *more* than strictly necessary — it's a deliberate, learn-it-properly choice, not a reflex. If it ever feels heavy, that's expected; the payoff is clarity and testability, not fewer files.

---

## 2. Runtime shape (what the browser loads)

```
index.html
   │  loads two plain <script> tags, in order:
   ├─▶ dist/sunrise.js          ← the COMPILED core (one IIFE bundle, built by esbuild from src/)
   └─▶ data/packs/dev-roadmap.js ← a content pack (plain .js; calls window.SUNRISE.registerPack)
   themes/*.css                  ← swapped into <link id="themeCss"> when you pick a theme
```

- You author the core in **TypeScript** under `src/`. `npm run build` bundles `src/main.ts` → `dist/sunrise.js` with **esbuild**. That bundle is **committed to git**, so the app still opens by **double-clicking `index.html`** (no dev server). After changing `src/`, run `npm run build` and commit the new `dist/`.
- **Only the core is compiled.** Content packs and themes stay plain runtime files — drop in a new pack/theme and it works with no rebuild. That's the pluginability.
- ES-module `import` is blocked by browsers on `file://`, which is exactly why the core is bundled into one classic `<script>`.
- The bundle, when it loads, immediately puts `window.SUNRISE = { registerPack, registerTheme }` on the page, then waits for `DOMContentLoaded` to boot. The pack `<script>` (which runs after the bundle) self-registers in between. So the order in `index.html` matters: **bundle first, packs after, both plain scripts** (no `defer`/`async`/`type=module`).

---

## 3. The three rings

```
        ┌──────────────────────── ADAPTERS (the edges — browser-aware) ────────────────────────┐
        │  DomRenderer · DomController · LocalStorageProgressStore/SessionStore                  │
        │  WindowPluginRegistry · SystemClock · MathRandom            + main.ts (composition root)│
        │                                                                                        │
        │     ┌──────────────────── PORTS (interfaces — the seams) ────────────────────┐         │
        │     │  Clock · Random · ProgressStore · SessionStore · PackSource · ThemeSource│         │
        │     │                                                                          │         │
        │     │      ┌──────────────── DOMAIN (pure logic — no browser) ──────────┐      │         │
        │     │      │  Entities (types)   Progress (aggregate)                    │      │         │
        │     │      │  Services: Streaks · ProgressStats · ReviewSchedule ·       │      │         │
        │     │      │            BadgeEngine · Validators                         │      │         │
        │     │      │  Tracker (facade — the app's one entry point)               │      │         │
        │     │      └─────────────────────────────────────────────────────────────┘      │         │
        │     └────────────────────────────────────────────────────────────────────────┘         │
        └──────────────────────────────────────────────────────────────────────────────────────┘

   imports allowed: Adapters → Ports → Domain.   NEVER the reverse (Domain must not import an adapter).
```

The folder layout mirrors the rings:

```
src/
  domain/        ← ring 1: pure logic. Classes + functions, NO browser globals.
    types/       ← all the domain's type/interface declarations (data shapes)
    progress.ts, streaks.ts, progress-stats.ts, review-schedule.ts,
    badge-engine.ts, validators.ts, tracker.ts, builtins.ts, dates.ts, errors.ts
  ports/
    index.ts     ← ring 2: the interfaces the domain depends on
  adapters/      ← ring 3: browser implementations of the ports + the UI
    types/       ← adapter-local type declarations
    system-clock.ts, math-random.ts, local-storage-store.ts,
    window-registry.ts, dom-renderer.ts, dom-controller.ts
  main.ts        ← composition root: builds everything and wires it together
```

A rule the linter enforces for you: **files under `src/domain/` may not use `window`, `document`, `localStorage`, `Date`, or `Math.random`.** If you reach for one, ESLint stops you — that's the dependency rule made automatic. (The one exception is `domain/dates.ts`, which does pure UTC date *arithmetic* on date *strings* — no clock reads — and is explicitly allowed.)

### Ring 1 — Domain (the rules)

Pure TypeScript. Knows nothing about the outside world. Four kinds of thing live here:

**a) Entity types** (`domain/types/*`) — the data shapes, all `interface`s:
- `entities.ts` — the **content-pack contract**: `Pack`, `Track`, `Phase`, `Group`, `Item`, `Task`, `Theme`, `Session`. These describe data that comes *in* from plugins; they're read-only (`readonly` everywhere).
- `badge-rule.ts` — `BadgeRule`, a **discriminated union** of the 14 achievement conditions (`{type:'streak', gte}`, `{type:'track-complete', track}`, …).
- `progress.ts` — `ProgressData`/`ItemProgress`/`Review`/`Surprise`: the saved-state shape.
- `view-models.ts` — the **DTOs the UI renders** (`TodayVM`, `DashboardVM`, `CalendarVM`, …). More on these below.
- `progress-stats.ts`, `badge-engine.ts`, `tracker.ts` — small public types tied to those modules (`Stat`, `BadgeStatus`, `TrackerDeps`).

**b) The `Progress` aggregate** (`domain/progress.ts`) — the *one mutable thing* in the app. It owns your task checks, reflections, reviews, and earned badges behind `private` fields, and it **enforces the completion invariant in one place**: checking the last task of a day sets `completedAt`/`completedHour`; un-checking clears them. Because that rule lives *inside* the object, no other code can set "completed" incorrectly. It also does `toJSON()` (for saving) and `Progress.empty()` / takes `ProgressData` in its constructor (for loading).

**c) Services** — stateless classes, each a single responsibility, that compute over a `Pack` + a `Progress`:
- `Streaks` — current / longest streak, "has there been a comeback gap".
- `ProgressStats` — totals: overall %, per-track, per-phase, task counts, completed groups.
- `ReviewSchedule` — the spaced-repetition interval policy (which reviews are due).
- `BadgeEngine` — interprets the `BadgeRule` union: builds a small context (streak, %, hours, etc.) and evaluates each rule. `evaluate()` (read) and `sync()` (awards newly-passing badges).
- `Validators` (`validators.ts`) — `PackValidator` / `ThemeValidator` / `ProgressValidator`. They check untrusted incoming data (plugins, imported JSON) and **throw** `ValidationError`/`ImportError` on bad shape. This is where the runtime contract lives.

**d) The `Tracker` facade** (`domain/tracker.ts`) — **the single entry point the UI talks to.** Everything outside the domain goes through it. It has two kinds of method:
- **Intents (commands)** — `toggleTask`, `setReflection`, `selectPack`, `selectTheme`, `goToItem`, `scheduleReviewForCurrent`, `importProgress`, `exportProgress`. These mutate state (via `Progress`) and persist (via the `ProgressStore` port).
- **Queries** — `dashboard()`, `todayCard()`, `selectors()`, `calendar()`, `trophies()`, `comeback()`. Each returns a **plain view-model** (a DTO from `view-models.ts`) describing *what to show* — never any HTML.

The `Tracker` is constructed with all its dependencies (ports + services + default data) in one `TrackerDeps` object — that's the dependency injection. It holds the active pack, the loaded progress, and the current day, and orchestrates the services and ports to fulfill each intent/query.

### Ring 2 — Ports (the seams)

`ports/index.ts` is just six small interfaces — the things the domain needs *from* the outside, expressed as contracts so the domain depends on the abstraction, not the implementation:

```ts
interface Clock        { today(): string; hour(): number; }   // abstracts `Date`
interface Random       { next(): number; }                    // abstracts `Math.random`
interface ProgressStore{ load(packId): Progress; save(packId, p): void; } // abstracts localStorage
interface SessionStore { load(): Session; save(s): void; }
interface PackSource   { packs(): readonly Pack[]; }           // abstracts the plugin registry
interface ThemeSource  { themes(): readonly Theme[]; }
```

This is *dependency inversion*: the `Tracker` says "give me a `Clock`," and `main.ts` decides that a `Clock` is `new Date()` in production and a fixed `{today:'2026-05-30'}` in tests. The domain never learns which.

### Ring 3 — Adapters (the edges) + composition root

The only browser-aware code. Each adapter implements a port or drives the UI:

- `SystemClock` / `MathRandom` — the trivial real implementations of `Clock`/`Random`.
- `LocalStorageProgressStore` / `LocalStorageSessionStore` — read/write `localStorage` (keys `sunrise.progress.<packId>` / `sunrise.session`), and the one-shot `migrateLegacy()` that imports old saves. They **catch all errors and fall back to a fresh value** — corrupt storage never crashes the app.
- `WindowPluginRegistry` — backs `window.SUNRISE.registerPack/registerTheme`. When a pack/theme self-registers, it's **validated on the spot**; valid ones go into `packs()`/`themes()`, invalid ones are recorded in `rejected()` (with reasons) and dropped. It implements both `PackSource` and `ThemeSource`.
- `DomRenderer` — turns a view-model into DOM. It builds HTML strings (with `esc()` on every interpolated value) and writes them into the canonical hook elements. **It only reads view-models; it never computes anything.**
- `DomController` — wires DOM events to `Tracker` intents and re-renders. Checkbox → `tracker.toggleTask()` → fire confetti/toast → re-render. It's a faithful port of the old `app.js` event wiring.
- `main.ts` — the **composition root**: it `new`s every adapter and service, packs them into `TrackerDeps`, runs migration, calls `tracker.init()`, and starts the `DomController`. It also wraps boot in a `try/catch` — the **single place** that turns an exception into a graceful fallback screen.

---

## 4. How a click flows through the rings

Trace "user checks the last task of a day" end to end — this is the mental model for everything:

```
1. DOM  : <input id="cb_t3"> change event
2. DomController  : the cb.onchange handler runs →
3. Tracker.toggleTask('t3', true)        (intent)
4.   Progress.setTaskDone(item, 't3', …) → all tasks now checked → sets completedAt/hour (the invariant)
5.   BadgeEngine.sync(pack, progress, rules, today) → awards any newly-passing badges, returns their ids
6.   (12% roll via Random port → maybe a surprise message)
7.   ProgressStore.save(packId, progress)   (persist, through the port)
8.   returns { unlockedBadges, surprise? } to the controller
9. DomController  : because the day went incomplete→complete, fire DomRenderer.celebrate() + badgeToast()
10.               then #renderAll() → pulls fresh view-models from Tracker queries
11. DomRenderer  : renderToday(vm) / renderDashboard(vm) / renderTrophies(vm) → writes HTML into the hooks
```

Notice what *didn't* happen: the domain (steps 3–8) never touched the DOM, and the renderer (steps 9–11) never computed anything — it only painted data the `Tracker` handed it. That clean split is the whole architecture in one example.

---

## 5. Ideas & conventions you need to hold in your head

- **View-models, not HTML, cross the boundary.** The domain emits plain data (`TodayVM`, etc.) describing *what* to show; the `DomRenderer` decides *how* (the DOM). This is why the rules are DOM-free and why you can test rendering output by asserting on the VM.
- **Exceptions are caught only at the edges.** The domain *throws* (`ValidationError`, `ImportError`) for bad input/invariants; the adapters/`main.ts` are the **only** `catch` sites, where a throw becomes a graceful fallback (reject the plugin, reset to fresh, alert on bad import, show the stub). Net effect: "never crash the UI" while still using exceptions internally.
- **Plugins are data, validated at the door.** Packs/themes are plain objects supplied at runtime; the validators are the gate. A pack author (human or LLM) only needs the contract in `docs/plugins/`, never the source.
- **Progress is namespaced per pack.** Each pack's state lives under its own `localStorage` key, so switching packs never mixes histories.
- **Badges are declarative rules, not code.** A pack adds achievements as data (`{type:'track-complete', track:'dsa', …}`); the `BadgeEngine` interprets them. The app ships ~20 generic rules; packs append their own.
- **Style conventions:** TypeScript with Java-style access (`private`/`public`, not `#`); types live in `types/` folders; relative imports keep the `.ts` extension and `import type` for type-only imports; **erasable TS only** (no `enum`, no `namespace`, no constructor *parameter properties* — declare fields and assign them in the body) so Node can run the `.ts` tests natively.
- **The composition root is the only place that knows the whole graph.** If you want to see how it all wires together, read `main.ts` — it's under 50 lines.

---

## 6. How to extend it

A cookbook. The pattern is always: *figure out which ring owns the change, do it there, let it flow outward.*

**Add a content pack or a theme** — no code change, no rebuild. Write a `data/packs/<id>.js` that calls `window.SUNRISE.registerPack({...})` (follow `docs/plugins/content-pack.md`), or a `themes/<id>.css` + a `registerTheme({...})` call (see `docs/plugins/theme.md`), and add one `<script>`/register line. The validator will tell you if the shape is wrong.

**Add a new badge type** (e.g. "complete N days in one calendar week"):
1. `src/domain/types/badge-rule.ts` — add the variant to the `BadgeCondition` union.
2. `src/domain/badge-engine.ts` — add a `case` to `#passes()` (TypeScript's exhaustiveness check *forces* you to — it won't compile until you handle the new type). Pull whatever you need from the `BadgeContext`, extending it if needed.
3. `src/domain/validators.ts` — add the type's required params to `BADGE_PARAMS` so packs can be validated.
4. `docs/plugins/content-pack.md` — document the new rule. Add a test in `test/domain/badge-engine.test.ts`.

**Add a new stat / streak rule** — put the computation in the relevant service (`ProgressStats` or `Streaks`), add a method, write a `test/domain/*.test.ts`. Pure functions of `(pack, progress)` — trivial to test.

**Add a piece of UI** (e.g. a "tasks remaining" badge on the today card):
1. Add the field to the relevant view-model in `src/domain/types/view-models.ts`.
2. Compute it in the matching `Tracker` query (`todayCard()` etc.).
3. Render it in `src/adapters/dom-renderer.ts`, using a canonical hook id/class that exists in `index.html` (add the element to `index.html` if new), and `esc()` any data.
4. `npm run build` to refresh the bundle.

**Change where progress is stored** (e.g. to a backend) — write a new class implementing `ProgressStore` in `src/adapters/`, and swap it in `main.ts`. The domain doesn't change.

**Add a domain operation** (a new intent) — add a method to `Tracker`, mutate via `Progress`/a service, persist via the store, and call it from a `DomController` event handler.

**Golden rules while you work:**
- Never `import` anything from `adapters/` or `ports/` into `domain/` (the linter blocks it).
- Never reach for `document`/`Date`/`localStorage`/`Math.random` inside `domain/` — ask for a port instead.
- Keep the renderer dumb: it paints view-models, it doesn't decide anything.
- After touching `src/`, run the gate before committing: `npm run typecheck && npm run lint && npm test && npm run build`, and commit the rebuilt `dist/sunrise.js`.

---

## 7. Where things are (quick map)

| You want to change… | Go to |
|---|---|
| What "day complete" / reflections / reviews / badges-owned mean | `src/domain/progress.ts` |
| Streak math | `src/domain/streaks.ts` (+ UTC helpers in `dates.ts`) |
| Progress totals (%, per-track, per-phase) | `src/domain/progress-stats.ts` |
| Badge unlock logic | `src/domain/badge-engine.ts` (+ types in `domain/types/badge-rule.ts`) |
| Spaced-repetition intervals | `src/domain/review-schedule.ts` |
| Plugin/import validation rules | `src/domain/validators.ts` |
| App orchestration / what the UI can ask for | `src/domain/tracker.ts` |
| Default UI strings, generic badges, bundled themes | `src/domain/builtins.ts` |
| Storage / migration | `src/adapters/local-storage-store.ts` |
| Plugin registration & validation-at-load | `src/adapters/window-registry.ts` |
| The HTML that's rendered | `src/adapters/dom-renderer.ts` |
| Event wiring / effects | `src/adapters/dom-controller.ts` |
| How it all boots & wires together | `src/main.ts` |
| The page shell + canonical DOM hooks | `index.html` |
| The shipped curriculum | `data/packs/dev-roadmap.js` |
| Plugin authoring contracts | `docs/plugins/` |
