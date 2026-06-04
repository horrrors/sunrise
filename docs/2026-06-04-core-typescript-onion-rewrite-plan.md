# Core TypeScript + Onion Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-implement Sunrise's core in TypeScript as a SOLID 3-ring onion (domain / ports / adapters), bundled by esbuild to a committed `dist/sunrise.js` that still opens on `file://`, preserving all behavior, the 30 badges, the plugin contracts, and saved progress.

**Architecture:** Pure browser-agnostic domain (a rich `Progress` aggregate + SRP service classes + a `Tracker` facade) depends only on small port interfaces; browser concerns (`localStorage`, `Date`, `Math.random`, DOM, the `window.SUNRISE` registry) are injected adapters in the outer ring; a composition root (`main.ts`) wires them and is the only catch boundary. Content packs stay runtime-loaded `.js`; themes stay `.css`.

**Tech Stack:** TypeScript (erasable syntax), esbuild (bundle), Node ≥ 23.6 (`node --test` strips `.ts` natively — zero test deps), Prettier + typescript-eslint. All tooling dev-only; shipped `dist/sunrise.js` has zero runtime deps. Spec: `docs/2026-06-04-core-typescript-onion-rewrite-design.md`.

---

## Build strategy (read first)

- **The old browser app keeps running on the old `.js`** (`index.html` untouched) until the **flip** in Phase 5. `<script>` ignores `package.json` `"type"`, so the browser is unaffected by the toolchain.
- **`npm test` is the gate** from Phase 2 on, running the NEW `.ts` suite. The **old CommonJS `.js` tests are deleted in Phase 1** (their coverage is re-created as `.ts`), because `"type":"module"` would break them. The old *source* stays (browser uses it) until Phase 5.
- **One class per file**; pure domain has **no** DOM/`Date`/`localStorage`/`window` references (enforced by an eslint `no-restricted-globals`/`no-restricted-imports` rule on `src/domain`).
- **Erasable TS only**: no `enum`, no `namespace`, no constructor parameter properties (declare fields, assign in the constructor body). Enforced by `tsconfig` `erasableSyntaxOnly` + eslint.
- DRY, YAGNI within the chosen rings, TDD, frequent commits. Exact paths + complete code below.

## Plan-level refinements to the spec (deliberate, noted)

1. **`Completion` folds into `Progress`.** The completion invariant (all of an item's tasks checked ⇒ `completedAt`/`completedHour`) belongs in the aggregate it mutates, so `Progress.isItemComplete(item)` and `Progress.setTaskDone(item, …)` live on `Progress` (fed the `Item` definition). No separate `Completion` service — it would be an anemic split.
2. **`Progress.from` → validator + constructor.** To avoid a `progress.ts ↔ validators.ts` import cycle, hydration is `new Progress(progressValidator.parse(raw))`: `ProgressValidator.parse(raw): ProgressData` (throws `ValidationError`, maps legacy `days→items`) lives in `validators.ts`; `Progress` only takes already-validated `ProgressData`.

## File structure

| File | Responsibility |
|---|---|
| `src/domain/entities.ts` | Read-only contract interfaces: `Pack, Track, Phase, Group, Item, Task, Resource, PackSettings, Theme, Session` |
| `src/domain/badge-rule.ts` | `BadgeRule` discriminated union + `BadgeMeta` |
| `src/domain/errors.ts` | `ValidationIssue`, `ValidationError`, `ImportError` |
| `src/domain/progress.ts` | `ProgressData`/`ItemProgress`/`Review`/`Surprise` + the `Progress` aggregate class |
| `src/domain/streaks.ts` | `Streaks` service (current/longest/completedDates) |
| `src/domain/progress-stats.ts` | `ProgressStats` service (overall/byTrack/byPhase/countTasks/completedGroups/tracks) + `Stat` |
| `src/domain/review-schedule.ts` | `ReviewSchedule` service (`REVIEW_INTERVALS`, due/schedule/complete) |
| `src/domain/badge-engine.ts` | `BadgeEngine` service (interprets `BadgeRule`; evaluate/sync) |
| `src/domain/validators.ts` | `PackValidator`/`ThemeValidator`/`ProgressValidator` (throw on bad shape) |
| `src/domain/view-models.ts` | Plain DTO types the facade returns to the view |
| `src/domain/tracker.ts` | `Tracker` facade (command intents + query view-models) |
| `src/domain/builtins.ts` | `DEFAULT_UI`, `GENERIC_BADGES`, `BUILTIN_THEMES` |
| `src/ports/index.ts` | `Clock, Random, ProgressStore, SessionStore, PackSource, ThemeSource` |
| `src/adapters/system-clock.ts` · `math-random.ts` | trivial `Date`/`Math.random` adapters |
| `src/adapters/local-storage-store.ts` | `LocalStorageProgressStore`, `LocalStorageSessionStore` |
| `src/adapters/window-registry.ts` | `WindowPluginRegistry` (PackSource+ThemeSource+validate-at-register) |
| `src/adapters/dom-renderer.ts` | view-models → DOM (port of today's render functions) |
| `src/adapters/dom-controller.ts` | DOM events → facade intents → re-render; effects; Escape |
| `src/main.ts` | composition root: wire, register builtins, migrate, boot, top-level catch |
| `dist/sunrise.js` | esbuild bundle (committed) |
| `data/packs/dev-roadmap.js` | pack #1 — runtime classic-IIFE `.js` (tweaked in Phase 5) |
| `test/*.test.ts` | `node --test` suites |
| Deleted in Phase 5 | `logic.js`, `app.js`, `core/*.js`, `data/app-defaults.js`, `data/builtin-themes.js` |

---

## Phase 1 — Toolchain & skeleton

Goal: Node 23, dependencies, configs, `package.json` rewrite, retire old `.js` tests. The old browser app still runs (index.html untouched); there's no `.ts` code yet, so `npm test` has nothing to run until Phase 2.

### Task 1: Upgrade Node to 23 and pin it

**Files:**
- Create: `.tool-versions` (asdf)
- Create: `.nvmrc`

- [ ] **Step 1: Install + select Node 23 via asdf**

Run:
```bash
asdf install nodejs 23.11.0 && asdf local nodejs 23.11.0
node --version
```
Expected: `v23.11.0` (any `23.6+` is fine; ≥23.6 strips TS by default).

- [ ] **Step 2: Pin the version**

Create `.tool-versions`:
```
nodejs 23.11.0
```
Create `.nvmrc`:
```
23.11.0
```

- [ ] **Step 3: Verify native TS execution works**

Run:
```bash
printf 'const x: number = 41 + 1;\nconsole.log("strip ok", x);\n' > /tmp/strip-check.ts && node /tmp/strip-check.ts
```
Expected: `strip ok 42` (no flag needed on ≥23.6). If it errors, the Node version is < 23.6 — stop and resolve before continuing.

- [ ] **Step 4: Commit**

```bash
git add .tool-versions .nvmrc
git commit -m "chore: pin Node 23 (native .ts execution)"
```

### Task 2: Dev dependencies + `package.json` rewrite

**Files:**
- Modify: `package.json`
- Create: `.gitignore` (append)

- [ ] **Step 1: Install dev dependencies**

Run:
```bash
npm install -D typescript esbuild prettier eslint typescript-eslint @types/node
```
Expected: a `node_modules/` + `package-lock.json` appear; all are devDependencies.

- [ ] **Step 2: Rewrite `package.json`**

Replace `package.json` with:
```json
{
  "name": "sunrise",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "Personal goal-achievement tracker (pluginable, zero-runtime-deps)",
  "scripts": {
    "build": "esbuild src/main.ts --bundle --format=iife --target=es2020 --sourcemap --outfile=dist/sunrise.js",
    "typecheck": "tsc --noEmit",
    "test": "node --test \"test/**/*.test.ts\"",
    "lint": "eslint src test",
    "format": "prettier --write ."
  }
}
```

- [ ] **Step 3: Update `.gitignore`**

Append to `.gitignore`:
```
node_modules/
*.tsbuildinfo
```
(Do NOT ignore `dist/` — the built bundle is committed.)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: add TS/esbuild/eslint/prettier dev deps; module package + scripts"
```

### Task 3: `tsconfig.json`

**Files:**
- Create: `tsconfig.json`

- [ ] **Step 1: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": false,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src", "test"]
}
```

- [ ] **Step 2: Verify tsc runs (no files yet → no errors)**

Run: `npm run typecheck`
Expected: exits 0 (nothing to check yet, or "No inputs found" is acceptable until `src` exists — if it errors on no inputs, that's fine; it'll pass once Phase 2 adds files).

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "chore: tsconfig (strict, erasableSyntaxOnly, noEmit — esbuild transpiles)"
```

### Task 4: Prettier + ESLint config

**Files:**
- Create: `.prettierrc.json`
- Create: `eslint.config.js`

- [ ] **Step 1: Create `.prettierrc.json`**

```json
{ "singleQuote": true, "semi": true, "printWidth": 100, "trailingComma": "all" }
```

- [ ] **Step 2: Create `eslint.config.js`** (flat config; enforces the domain-purity boundary)

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      // the domain ring must stay browser-agnostic
      'no-restricted-globals': ['error', 'window', 'document', 'localStorage', 'Date', 'Math'],
    },
  },
  { ignores: ['dist/', 'node_modules/', 'data/', 'themes/', 'logic.js', 'app.js', 'core/'] },
);
```
Note: `Math` is restricted in the domain too (randomness comes via the `Random` port); domain code that needs rounding uses `Math.round` — so allow `Math.round` by NOT restricting `Math` and instead restricting only `Math.random` via `no-restricted-properties`. Replace the `no-restricted-globals` line with:
```js
      'no-restricted-globals': ['error', 'window', 'document', 'localStorage', 'Date'],
      'no-restricted-properties': ['error', { object: 'Math', property: 'random', message: 'Use the Random port.' }],
```

- [ ] **Step 3: Verify eslint runs**

Run: `npx eslint --version` then `npm run lint` (no `src` files yet → passes or "0 problems").
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add .prettierrc.json eslint.config.js
git commit -m "chore: prettier + typescript-eslint (domain-purity rule on src/domain)"
```

### Task 5: Retire the old CommonJS test suite

The old `test/*.test.js` use CommonJS `require`, which breaks under `"type":"module"`. Their coverage is re-created as `.ts` in Phase 2+. The old *source* (`logic.js`, `core/*.js`, etc.) stays — the browser still uses it until Phase 5.

**Files:**
- Delete: `test/*.test.js`

- [ ] **Step 1: Confirm the old tests would now fail under ESM**

Run: `node --test "test/**/*.test.js" 2>&1 | tail -5`
Expected: failures/errors (CommonJS `require` under `type:module`). This confirms why they must go.

- [ ] **Step 2: Delete them**

```bash
git rm test/*.test.js
```

- [ ] **Step 3: Confirm the browser app is untouched**

Run: `git status` — only `test/*.test.js` deleted; `index.html`, `logic.js`, `app.js`, `core/*`, `data/*` unchanged.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: retire old CommonJS tests (re-created as .ts in Phase 2); source untouched"
```

## Phase 2 — Domain ring (pure TS, TDD)

Goal: the browser-agnostic core, fully unit-tested via `node --test` (no DOM). **All relative imports use `.ts` extensions** (Node-native requirement) and `import type` for type-only imports (`verbatimModuleSyntax`). From here `npm test` is the gate.

### Task 6: Contract types — `entities.ts`, `badge-rule.ts`, `errors.ts`

**Files:**
- Create: `src/domain/badge-rule.ts`, `src/domain/entities.ts`, `src/domain/errors.ts`
- Test: `src/domain/errors.test.ts`  → place tests under `test/`? Use `test/domain/errors.test.ts`

- [ ] **Step 1: Create `src/domain/badge-rule.ts`**

```ts
export interface BadgeMeta {
  readonly id: string;
  readonly title: string;
  readonly desc?: string;
  readonly icon?: string;
}
export type BadgeCondition =
  | { readonly type: 'streak'; readonly gte: number }
  | { readonly type: 'days-done'; readonly gte: number }
  | { readonly type: 'percent'; readonly gte: number }
  | { readonly type: 'all-done' }
  | { readonly type: 'tasks-done'; readonly gte: number; readonly track?: string }
  | { readonly type: 'reflections'; readonly gte: number }
  | { readonly type: 'groups-complete'; readonly gte: number }
  | { readonly type: 'track-complete'; readonly track: string }
  | { readonly type: 'phase-complete'; readonly phase: string }
  | { readonly type: 'item-complete'; readonly item: string }
  | { readonly type: 'all-tracks'; readonly eachGte: number }
  | { readonly type: 'weekday'; readonly days: readonly number[] }
  | { readonly type: 'hour-range'; readonly from: number; readonly to: number }
  | { readonly type: 'comeback' };
export type BadgeRule = BadgeMeta & BadgeCondition;
export type BadgeType = BadgeCondition['type'];
```

- [ ] **Step 2: Create `src/domain/entities.ts`**

```ts
import type { BadgeRule } from './badge-rule.ts';

export interface Task { readonly id: string; readonly text: string; readonly guidance?: string; }
export interface Resource { readonly label: string; readonly note: string; }
export interface Item {
  readonly id: string;
  readonly track: string;
  readonly title?: string;
  readonly warmup?: string;
  readonly reflectPrompt?: string;
  readonly tasks?: readonly Task[];
  readonly resources?: readonly Resource[];
  readonly rest?: boolean;
}
export interface Group {
  readonly id: string;
  readonly title: string;
  readonly phase?: string;
  readonly theme?: string;
  readonly items: readonly Item[];
}
export interface Phase { readonly id: string; readonly title: string; }
export interface Track {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly color?: string;
  readonly reviewable?: boolean;
}
export interface Labels { readonly phase?: string; readonly group?: string; readonly groupAbbr?: string; readonly item?: string; }
export interface PackSettings {
  readonly labels?: Labels;
  readonly reviews?: boolean;
  readonly reflections?: boolean;
  readonly warmups?: boolean;
}
export interface Pack {
  readonly schema: 'sunrise.pack/v1';
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly locale?: string;
  readonly settings?: PackSettings;
  readonly tracks: readonly Track[];
  readonly phases?: readonly Phase[];
  readonly groups: readonly Group[];
  readonly badges?: readonly BadgeRule[];
  readonly mottos?: readonly string[];
  readonly surprises?: readonly string[];
  readonly ui?: Readonly<Record<string, string>>;
}
export interface Theme {
  readonly schema: 'sunrise.theme/v1';
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly cssHref: string;
}
export interface Session { activePackId?: string; themeId?: string; }
```

- [ ] **Step 3: Create `src/domain/errors.ts`**

```ts
export interface ValidationIssue { readonly path: string; readonly msg: string; }

export class ValidationError extends Error {
  readonly issues: readonly ValidationIssue[];
  constructor(issues: readonly ValidationIssue[]) {
    super(issues.map((i) => `${i.path}: ${i.msg}`).join('; ') || 'validation failed');
    this.name = 'ValidationError';
    this.issues = issues;
  }
}

export class ImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImportError';
  }
}
```

- [ ] **Step 4: Write `test/domain/errors.test.ts`**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ValidationError, ImportError } from '../../src/domain/errors.ts';

test('ValidationError carries issues and a joined message', () => {
  const e = new ValidationError([{ path: 'tracks[0].id', msg: 'required' }]);
  assert.ok(e instanceof Error);
  assert.equal(e.name, 'ValidationError');
  assert.equal(e.message, 'tracks[0].id: required');
  assert.deepEqual(e.issues, [{ path: 'tracks[0].id', msg: 'required' }]);
});
test('ImportError is an Error with a name', () => {
  const e = new ImportError('bad json');
  assert.ok(e instanceof Error);
  assert.equal(e.name, 'ImportError');
  assert.equal(e.message, 'bad json');
});
```

- [ ] **Step 5: Typecheck + test**

Run: `npm run typecheck && npm test`
Expected: typecheck passes; errors test PASS. (Type-only files have no runtime tests; the import in the test proves `entities.ts`/`badge-rule.ts` compile.)

- [ ] **Step 6: Commit**

```bash
git add src/domain/badge-rule.ts src/domain/entities.ts src/domain/errors.ts test/domain/errors.test.ts
git commit -m "feat(domain): contract types (entities, badge-rule) + typed errors"
```

### Task 7: `Progress` aggregate — `progress.ts`

**Files:**
- Create: `src/domain/progress.ts`
- Test: `test/domain/progress.test.ts`

- [ ] **Step 1: Write `test/domain/progress.test.ts`**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Progress } from '../../src/domain/progress.ts';
import type { Item } from '../../src/domain/entities.ts';

const item: Item = { id: 'i1', track: 'dsa', title: 'A', tasks: [{ id: 't1', text: 'x' }, { id: 't2', text: 'y' }] };
const rest: Item = { id: 'r', track: 'rest', rest: true };

test('empty + toJSON round-trips shape', () => {
  const p = Progress.empty();
  assert.deepEqual(p.toJSON(), { schema: 'sunrise.progress/v1', items: {}, reviews: [], badges: {}, lastSurprise: null });
});
test('completion invariant: partial not complete; full sets completedAt+hour', () => {
  const p = Progress.empty();
  p.setTaskDone(item, 't1', true, '2026-05-30', 14);
  assert.equal(p.isItemComplete(item), false);
  assert.equal(p.toJSON().items['i1']?.completedAt, null);
  p.setTaskDone(item, 't2', true, '2026-05-30', 14);
  assert.equal(p.isItemComplete(item), true);
  assert.equal(p.toJSON().items['i1']?.completedAt, '2026-05-30');
  assert.equal(p.toJSON().items['i1']?.completedHour, 14);
});
test('un-checking clears completion; re-completing later keeps the ORIGINAL completedAt', () => {
  const p = Progress.empty();
  p.setTaskDone(item, 't1', true, '2026-05-30', 14);
  p.setTaskDone(item, 't2', true, '2026-05-30', 14);
  p.setTaskDone(item, 't2', false, '2026-05-31', 9);
  assert.equal(p.toJSON().items['i1']?.completedAt, null);
  p.setTaskDone(item, 't2', true, '2026-06-02', 8);
  assert.equal(p.toJSON().items['i1']?.completedAt, '2026-06-02'); // re-set after clear
});
test('rest item never completes', () => {
  const p = Progress.empty();
  assert.equal(p.isItemComplete(rest), false);
});
test('reflections, completedDates, counts', () => {
  const p = Progress.empty();
  p.setReflection('i1', 'note'); p.setReflection('i2', '   ');
  assert.equal(p.reflection('i1'), 'note');
  assert.equal(p.reflectionCount(), 1);
  p.setTaskDone(item, 't1', true, '2026-05-30', 14); p.setTaskDone(item, 't2', true, '2026-05-30', 14);
  assert.deepEqual(p.completedDates(), ['2026-05-30']);
  assert.deepEqual(p.completedHours(), [14]);
  assert.equal(p.completedCount(), 1);
});
test('reviews: schedule replaces; advance clamps to maxStage', () => {
  const p = Progress.empty();
  p.scheduleReview('bfs', '2026-05-30');
  p.scheduleReview('bfs', '2026-05-31'); // replaces
  assert.equal(p.reviewList.length, 1);
  assert.equal(p.reviewList[0]?.stage, 0);
  p.advanceReview('bfs', '2026-06-01', 3);
  assert.equal(p.reviewList[0]?.stage, 1);
  for (let i = 0; i < 9; i++) p.advanceReview('bfs', '2026-06-02', 3);
  assert.equal(p.reviewList[0]?.stage, 3); // clamped
});
test('badges: award is sticky and records date', () => {
  const p = Progress.empty();
  p.awardBadge('first-light', '2026-05-30');
  p.awardBadge('first-light', '2026-06-01'); // ignored — already owned
  assert.equal(p.isBadgeOwned('first-light'), true);
  assert.equal(p.badgeAt('first-light'), '2026-05-30');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test` → FAIL (`Cannot find module .../progress.ts`).

- [ ] **Step 3: Write `src/domain/progress.ts`**

```ts
import type { Item } from './entities.ts';

export interface ItemProgress {
  tasks: Record<string, boolean>;
  reflection: string;
  completedAt: string | null;
  completedHour: number | null;
}
export interface Review { itemId: string; lastDate: string; stage: number; }
export interface Surprise { text: string; at: string; }
export interface ProgressData {
  schema: 'sunrise.progress/v1';
  items: Record<string, ItemProgress>;
  reviews: Review[];
  badges: Record<string, { at: string }>;
  lastSurprise: Surprise | null;
}

export class Progress {
  #items: Record<string, ItemProgress>;
  #reviews: Review[];
  #badges: Record<string, { at: string }>;
  #lastSurprise: Surprise | null;

  constructor(data: ProgressData) {
    this.#items = data.items;
    this.#reviews = data.reviews;
    this.#badges = data.badges;
    this.#lastSurprise = data.lastSurprise;
  }

  static empty(): Progress {
    return new Progress({ schema: 'sunrise.progress/v1', items: {}, reviews: [], badges: {}, lastSurprise: null });
  }

  toJSON(): ProgressData {
    return {
      schema: 'sunrise.progress/v1',
      items: this.#items,
      reviews: this.#reviews,
      badges: this.#badges,
      lastSurprise: this.#lastSurprise,
    };
  }

  #ensure(itemId: string): ItemProgress {
    let it = this.#items[itemId];
    if (!it) {
      it = { tasks: {}, reflection: '', completedAt: null, completedHour: null };
      this.#items[itemId] = it;
    }
    return it;
  }

  isItemComplete(item: Item): boolean {
    if (item.rest || !item.tasks || item.tasks.length === 0) return false;
    const st = this.#items[item.id];
    if (!st) return false;
    return item.tasks.every((t) => st.tasks[t.id] === true);
  }

  setTaskDone(item: Item, taskId: string, done: boolean, today: string, hour: number): void {
    const st = this.#ensure(item.id);
    if (done) st.tasks[taskId] = true;
    else delete st.tasks[taskId];
    if (this.isItemComplete(item)) {
      if (!st.completedAt) {
        st.completedAt = today;
        st.completedHour = hour;
      }
    } else {
      st.completedAt = null;
      st.completedHour = null;
    }
  }

  setReflection(itemId: string, text: string): void {
    this.#ensure(itemId).reflection = text;
  }
  reflection(itemId: string): string {
    return this.#items[itemId]?.reflection ?? '';
  }
  taskChecked(itemId: string, taskId: string): boolean {
    return this.#items[itemId]?.tasks[taskId] === true;
  }

  completedDates(): string[] {
    const set = new Set<string>();
    for (const id of Object.keys(this.#items)) {
      const c = this.#items[id]?.completedAt;
      if (c) set.add(c);
    }
    return [...set].sort();
  }
  completedHours(): number[] {
    const out: number[] = [];
    for (const id of Object.keys(this.#items)) {
      const it = this.#items[id];
      if (it && it.completedAt != null && it.completedHour != null) out.push(it.completedHour);
    }
    return out;
  }
  completedCount(): number {
    return Object.keys(this.#items).filter((id) => this.#items[id]?.completedAt).length;
  }
  reflectionCount(): number {
    let n = 0;
    for (const id of Object.keys(this.#items)) {
      const r = this.#items[id]?.reflection;
      if (r && r.trim()) n++;
    }
    return n;
  }

  get reviewList(): readonly Review[] {
    return this.#reviews;
  }
  scheduleReview(itemId: string, today: string): void {
    this.#reviews = this.#reviews.filter((r) => r.itemId !== itemId);
    this.#reviews.push({ itemId, lastDate: today, stage: 0 });
  }
  advanceReview(itemId: string, today: string, maxStage: number): void {
    const r = this.#reviews.find((x) => x.itemId === itemId);
    if (r) {
      r.lastDate = today;
      r.stage = Math.min(r.stage + 1, maxStage);
    }
  }

  ownedBadges(): Readonly<Record<string, { at: string }>> {
    return this.#badges;
  }
  isBadgeOwned(id: string): boolean {
    return this.#badges[id] !== undefined;
  }
  awardBadge(id: string, at: string): void {
    if (!this.#badges[id]) this.#badges[id] = { at };
  }
  badgeAt(id: string): string | null {
    return this.#badges[id]?.at ?? null;
  }

  get lastSurprise(): Surprise | null {
    return this.#lastSurprise;
  }
  setLastSurprise(s: Surprise): void {
    this.#lastSurprise = s;
  }
}
```

- [ ] **Step 4: Typecheck + test**

Run: `npm run typecheck && npm test`
Expected: PASS (all progress tests).

- [ ] **Step 5: Commit**

```bash
git add src/domain/progress.ts test/domain/progress.test.ts
git commit -m "feat(domain): Progress aggregate (completion invariant, reviews, badges, encapsulated)"
```

### Task 8: `Streaks` service — `streaks.ts`

**Files:**
- Create: `src/domain/streaks.ts`
- Test: `test/domain/streaks.test.ts`

- [ ] **Step 1: Write `test/domain/streaks.test.ts`**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Streaks } from '../../src/domain/streaks.ts';
import { Progress } from '../../src/domain/progress.ts';
import type { ProgressData } from '../../src/domain/progress.ts';

function progressOf(dates: string[]): Progress {
  const items: ProgressData['items'] = {};
  dates.forEach((d, i) => { items['x' + i] = { tasks: {}, reflection: '', completedAt: d, completedHour: 12 }; });
  return new Progress({ schema: 'sunrise.progress/v1', items, reviews: [], badges: {}, lastSurprise: null });
}

test('streaks: empty, consecutive ending today, anchors to yesterday', () => {
  const s = new Streaks();
  assert.equal(s.current(progressOf([]), '2026-05-30'), 0);
  assert.equal(s.current(progressOf(['2026-05-28', '2026-05-29', '2026-05-30']), '2026-05-30'), 3);
  assert.equal(s.current(progressOf(['2026-05-28', '2026-05-29']), '2026-05-30'), 2);
  assert.equal(s.current(progressOf(['2026-05-27']), '2026-05-30'), 0);
});
test('longest streak across gaps', () => {
  const s = new Streaks();
  assert.equal(s.longest(progressOf([])), 0);
  assert.equal(s.longest(progressOf(['2026-05-30'])), 1);
  assert.equal(s.longest(progressOf(['2026-05-20', '2026-05-21', '2026-05-29', '2026-05-30', '2026-05-31'])), 3);
});
```

- [ ] **Step 2: Run test → FAIL** (`streaks.ts` missing).

- [ ] **Step 3: Write `src/domain/streaks.ts`**

```ts
import type { Progress } from './progress.ts';

function ms(s: string): number {
  const [y, m, d] = s.split('-').map(Number) as [number, number, number];
  return Date.UTC(y, m - 1, d);
}
export function addDays(s: string, n: number): string {
  const dt = new Date(ms(s));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}
export function diffDays(a: string, b: string): number {
  return Math.round((ms(b) - ms(a)) / 86400000);
}
export function weekdayMon(s: string): number {
  return ((diffDays('2024-01-01', s) % 7) + 7) % 7; // 0=Mon..6=Sun
}

export class Streaks {
  current(progress: Progress, today: string): number {
    const set = new Set(progress.completedDates());
    if (set.size === 0) return 0;
    let cursor: string;
    if (set.has(today)) cursor = today;
    else if (set.has(addDays(today, -1))) cursor = addDays(today, -1);
    else return 0;
    let n = 0;
    while (set.has(cursor)) { n++; cursor = addDays(cursor, -1); }
    return n;
  }
  longest(progress: Progress): number {
    const dates = progress.completedDates();
    if (dates.length === 0) return 0;
    let best = 1, cur = 1;
    for (let i = 1; i < dates.length; i++) {
      if (diffDays(dates[i - 1]!, dates[i]!) === 1) cur++;
      else cur = 1;
      if (cur > best) best = cur;
    }
    return best;
  }
  hasComeback(progress: Progress): boolean {
    const dates = progress.completedDates();
    for (let i = 1; i < dates.length; i++) if (diffDays(dates[i - 1]!, dates[i]!) >= 2) return true;
    return false;
  }
}
```
Note: `addDays`/`diffDays`/`weekdayMon` are pure date math (UTC) and live here as exported module functions (no `Date`-as-clock; these are deterministic transforms of date *strings*, not "now"). The eslint domain rule restricts the `Date` *global* used as a clock — these construct `Date` only to do UTC arithmetic on an explicit input, which is pure. **Exception:** add an eslint-disable note OR move these to a `src/domain/dates.ts` with a file-level allowance. Decision: put them in `src/domain/dates.ts` and exempt that one file from the `no-restricted-globals` Date rule via an eslint override block; `streaks.ts` imports from it. (Keeps the rule meaningful elsewhere.)

- [ ] **Step 3b: Move date helpers to `src/domain/dates.ts`**

Create `src/domain/dates.ts` with the three functions (`ms` private, `addDays`, `diffDays`, `weekdayMon` exported) exactly as above, and change `streaks.ts` to `import { addDays, diffDays } from './dates.ts';` (drop the local copies). Add an eslint override in `eslint.config.js`:
```js
  { files: ['src/domain/dates.ts'], rules: { 'no-restricted-globals': 'off' } },
```

- [ ] **Step 4: Typecheck + test**

Run: `npm run typecheck && npm test` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/dates.ts src/domain/streaks.ts test/domain/streaks.test.ts eslint.config.js
git commit -m "feat(domain): UTC date helpers + Streaks service"
```

### Task 9: `ProgressStats` service — `progress-stats.ts`

**Files:** Create `src/domain/progress-stats.ts`; Test `test/domain/progress-stats.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ProgressStats } from '../../src/domain/progress-stats.ts';
import { Progress } from '../../src/domain/progress.ts';
import type { Pack, Item } from '../../src/domain/entities.ts';

const PACK: Pack = {
  schema: 'sunrise.pack/v1', id: 't', name: 'T', version: '1.0.0',
  tracks: [{ id: 'dsa', label: 'DSA' }, { id: 'js', label: 'JS' }],
  phases: [{ id: 'p1', title: 'P1' }, { id: 'p2', title: 'P2' }],
  groups: [
    { id: 'g1', title: 'G1', phase: 'p1', items: [
      { id: 'g1i1', track: 'dsa', tasks: [{ id: 't1', text: 'x' }, { id: 't2', text: 'y' }] },
      { id: 'g1i2', track: 'js', tasks: [{ id: 't1', text: 'x' }] },
      { id: 'g1r', track: 'rest', rest: true },
    ] },
    { id: 'g2', title: 'G2', phase: 'p2', items: [{ id: 'g2i1', track: 'dsa', tasks: [{ id: 't1', text: 'x' }] }] },
  ],
};
function complete(p: Progress, item: Item): void { for (const t of item.tasks ?? []) p.setTaskDone(item, t.id, true, '2026-05-30', 10); }
const itemOf = (id: string): Item => PACK.groups.flatMap((g) => g.items).find((i) => i.id === id)! as Item;

test('overall/byTrack/byPhase exclude rest; tracks lists non-rest', () => {
  const s = new ProgressStats(); const p = Progress.empty();
  complete(p, itemOf('g1i1'));
  assert.deepEqual(s.overall(PACK, p), { done: 1, total: 3, pct: 33 });
  assert.deepEqual(s.byTrack(PACK, p)['dsa'], { done: 1, total: 2, pct: 50 });
  assert.deepEqual(s.byPhase(PACK, p)['p1'], { done: 1, total: 2, pct: 50 });
  assert.deepEqual(s.tracks(PACK).sort(), ['dsa', 'js']);
});
test('countTasks (optionally by track), completedGroups', () => {
  const s = new ProgressStats(); const p = Progress.empty();
  complete(p, itemOf('g1i1'));
  assert.equal(s.countTasks(PACK, p), 2);
  assert.equal(s.countTasks(PACK, p, 'js'), 0);
  assert.equal(s.completedGroups(PACK, p), 0);
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Write `src/domain/progress-stats.ts`**

```ts
import type { Pack, Item } from './entities.ts';
import type { Progress } from './progress.ts';

export interface Stat { done: number; total: number; pct: number; }
const pct = (done: number, total: number): number => (total ? Math.round((done / total) * 100) : 0);

export class ProgressStats {
  #all(pack: Pack): Item[] { return pack.groups.flatMap((g) => [...g.items]); }
  tracks(pack: Pack): string[] {
    const s = new Set<string>();
    for (const it of this.#all(pack)) if (!it.rest) s.add(it.track);
    return [...s];
  }
  overall(pack: Pack, progress: Progress): Stat {
    let done = 0, total = 0;
    for (const it of this.#all(pack)) { if (it.rest) continue; total++; if (progress.isItemComplete(it)) done++; }
    return { done, total, pct: pct(done, total) };
  }
  byTrack(pack: Pack, progress: Progress): Record<string, Stat> {
    const acc: Record<string, Stat> = {};
    for (const it of this.#all(pack)) { if (it.rest) continue; this.#bump(acc, it.track, progress.isItemComplete(it)); }
    return this.#finalize(acc);
  }
  byPhase(pack: Pack, progress: Progress): Record<string, Stat> {
    const acc: Record<string, Stat> = {};
    for (const g of pack.groups) {
      if (g.phase == null) continue;
      for (const it of g.items) { if (it.rest) continue; this.#bump(acc, g.phase, progress.isItemComplete(it)); }
    }
    return this.#finalize(acc);
  }
  countTasks(pack: Pack, progress: Progress, track?: string): number {
    let n = 0;
    for (const it of this.#all(pack)) {
      if (track && it.track !== track) continue;
      for (const t of it.tasks ?? []) if (progress.taskChecked(it.id, t.id)) n++;
    }
    return n;
  }
  completedGroups(pack: Pack, progress: Progress): number {
    let n = 0;
    for (const g of pack.groups) {
      const work = g.items.filter((it) => !it.rest);
      if (work.length && work.every((it) => progress.isItemComplete(it))) n++;
    }
    return n;
  }
  #bump(acc: Record<string, Stat>, key: string, done: boolean): void {
    const a = acc[key] ?? (acc[key] = { done: 0, total: 0, pct: 0 });
    a.total++; if (done) a.done++;
  }
  #finalize(acc: Record<string, Stat>): Record<string, Stat> {
    for (const k of Object.keys(acc)) { const a = acc[k]!; a.pct = pct(a.done, a.total); }
    return acc;
  }
}
```

- [ ] **Step 4: Typecheck + test → PASS.**
- [ ] **Step 5: Commit** `git add src/domain/progress-stats.ts test/domain/progress-stats.test.ts && git commit -m "feat(domain): ProgressStats service"`

### Task 10: `ReviewSchedule` service — `review-schedule.ts`

**Files:** Create `src/domain/review-schedule.ts`; Test `test/domain/review-schedule.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ReviewSchedule } from '../../src/domain/review-schedule.ts';
import { Progress } from '../../src/domain/progress.ts';

test('schedule → due after interval; complete advances; negative stage clamps to due', () => {
  const rs = new ReviewSchedule(); const p = Progress.empty();
  rs.schedule(p, 'bfs', '2026-05-30');
  assert.deepEqual(rs.due(p, '2026-05-30'), []);
  assert.deepEqual(rs.due(p, '2026-05-31'), ['bfs']);
  rs.complete(p, 'bfs', '2026-05-31');
  assert.equal(p.reviewList[0]?.stage, 1);
});
test('tampered negative stage still becomes due (clamp lower bound)', () => {
  const p = new Progress({ schema: 'sunrise.progress/v1', items: {}, reviews: [{ itemId: 'x', lastDate: '2026-05-01', stage: -5 }], badges: {}, lastSurprise: null });
  assert.deepEqual(new ReviewSchedule().due(p, '2026-06-30'), ['x']);
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Write `src/domain/review-schedule.ts`**

```ts
import type { Progress } from './progress.ts';
import { diffDays } from './dates.ts';

export const REVIEW_INTERVALS = [1, 3, 7, 16] as const;
const MAX_STAGE = REVIEW_INTERVALS.length - 1;

export class ReviewSchedule {
  due(progress: Progress, today: string): string[] {
    return progress.reviewList
      .filter((r) => {
        const stage = Math.min(Math.max(r.stage, 0), MAX_STAGE);
        return diffDays(r.lastDate, today) >= REVIEW_INTERVALS[stage]!;
      })
      .map((r) => r.itemId);
  }
  schedule(progress: Progress, itemId: string, today: string): void {
    progress.scheduleReview(itemId, today);
  }
  complete(progress: Progress, itemId: string, today: string): void {
    progress.advanceReview(itemId, today, MAX_STAGE);
  }
}
```

- [ ] **Step 4: Typecheck + test → PASS.**
- [ ] **Step 5: Commit** `git add src/domain/review-schedule.ts test/domain/review-schedule.test.ts && git commit -m "feat(domain): ReviewSchedule service (interval policy + clamp)"`

### Task 11: `BadgeEngine` service — `badge-engine.ts`

**Files:** Create `src/domain/badge-engine.ts`; Test `test/domain/badge-engine.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BadgeEngine } from '../../src/domain/badge-engine.ts';
import { Streaks } from '../../src/domain/streaks.ts';
import { ProgressStats } from '../../src/domain/progress-stats.ts';
import { Progress } from '../../src/domain/progress.ts';
import type { Pack, Item } from '../../src/domain/entities.ts';
import type { BadgeRule } from '../../src/domain/badge-rule.ts';

const PACK: Pack = {
  schema: 'sunrise.pack/v1', id: 't', name: 'T', version: '1.0.0',
  tracks: [{ id: 'dsa', label: 'DSA' }, { id: 'js', label: 'JS' }],
  phases: [{ id: 'p1', title: 'P1' }],
  groups: [{ id: 'g1', title: 'G1', phase: 'p1', items: [
    { id: 'i1', track: 'dsa', tasks: [{ id: 't1', text: 'x' }] },
    { id: 'i2', track: 'js', tasks: [{ id: 't1', text: 'x' }] },
  ] }],
};
const itemOf = (id: string): Item => PACK.groups.flatMap((g) => g.items).find((i) => i.id === id)!;
function engine(): BadgeEngine { return new BadgeEngine(new Streaks(), new ProgressStats()); }
function done(ids: string[], hour = 12): Progress {
  const p = Progress.empty();
  for (const id of ids) { const it = itemOf(id); p.setTaskDone(it, 't1', true, '2026-05-30', hour); }
  return p;
}

test('generic + pack rules evaluate', () => {
  const rules: BadgeRule[] = [
    { id: 'first', type: 'days-done', gte: 1, title: 'F' },
    { id: 'fin', type: 'all-done', title: 'Fin' },
    { id: 'owl', type: 'hour-range', from: 22, to: 5, title: 'O' },
    { id: 'wknd', type: 'weekday', days: [6, 7], title: 'W' },
    { id: 'poly', type: 'all-tracks', eachGte: 1, title: 'P' },
    { id: 'dsam', type: 'track-complete', track: 'dsa', title: 'D' },
    { id: 'cap', type: 'item-complete', item: 'i2', title: 'C' },
  ];
  const p = done(['i1'], 23); // Saturday 2026-05-30, 23:00, dsa done
  const by = Object.fromEntries(engine().evaluate(PACK, p, rules).map((b) => [b.id, b.unlocked]));
  assert.equal(by['first'], true);
  assert.equal(by['fin'], false);   // i2 not done
  assert.equal(by['owl'], true);    // 23 in [22,5)
  assert.equal(by['wknd'], true);   // Saturday
  assert.equal(by['poly'], false);  // js track not touched
  assert.equal(by['dsam'], true);   // dsa 100%
  assert.equal(by['cap'], false);   // i2 not complete
});
test('sync awards once; evaluate keeps owned unlocked + at after work undone', () => {
  const e = engine();
  const rules: BadgeRule[] = [{ id: 'first', type: 'days-done', gte: 1, title: 'F' }];
  const p = done(['i1']);
  assert.deepEqual(e.sync(PACK, p, rules, '2026-05-30'), ['first']);
  assert.deepEqual(e.sync(PACK, p, rules, '2026-05-31'), []); // idempotent
  const undone = new Progress({ schema: 'sunrise.progress/v1', items: {}, reviews: [], badges: p.toJSON().badges, lastSurprise: null });
  const b = e.evaluate(PACK, undone, rules).find((x) => x.id === 'first')!;
  assert.equal(b.unlocked, true);     // sticky
  assert.equal(b.at, '2026-05-30');   // preserved
});
test('later rule with same id wins (dedupe keeps last)', () => {
  const rules: BadgeRule[] = [
    { id: 'first', type: 'days-done', gte: 1, title: 'F' },
    { id: 'first', type: 'days-done', gte: 99, title: 'F2' },
  ];
  const by = engine().evaluate(PACK, done(['i1']), rules).find((b) => b.id === 'first')!;
  assert.equal(by.unlocked, false); // gte:99 wins
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Write `src/domain/badge-engine.ts`**

```ts
import type { Pack } from './entities.ts';
import type { Progress } from './progress.ts';
import type { BadgeRule } from './badge-rule.ts';
import { Streaks } from './streaks.ts';
import { ProgressStats } from './progress-stats.ts';
import { weekdayMon } from './dates.ts';

export interface BadgeStatus { id: string; unlocked: boolean; at: string | null; }

interface BadgeContext {
  longestStreak: number; daysDone: number; total: number; pct: number;
  reflections: number; groupsComplete: number; hasComeback: boolean;
  tracks: string[]; dates: string[]; hours: number[];
  tasks(track?: string): number; trackDone(track: string): number;
  trackPct(track: string): number; phasePct(phase: string): number;
  itemComplete(itemId: string): boolean;
}
const inHourRange = (h: number, from: number, to: number): boolean =>
  from <= to ? h >= from && h < to : h >= from || h < to;

export class BadgeEngine {
  #streaks: Streaks;
  #stats: ProgressStats;
  constructor(streaks: Streaks, stats: ProgressStats) { this.#streaks = streaks; this.#stats = stats; }

  #context(pack: Pack, progress: Progress): BadgeContext {
    const overall = this.#stats.overall(pack, progress);
    const byTrack = this.#stats.byTrack(pack, progress);
    const byPhase = this.#stats.byPhase(pack, progress);
    const byId = new Map(pack.groups.flatMap((g) => g.items).map((it) => [it.id, it] as const));
    return {
      longestStreak: this.#streaks.longest(progress),
      daysDone: overall.done, total: overall.total, pct: overall.pct,
      reflections: progress.reflectionCount(),
      groupsComplete: this.#stats.completedGroups(pack, progress),
      hasComeback: this.#streaks.hasComeback(progress),
      tracks: this.#stats.tracks(pack),
      dates: progress.completedDates(),
      hours: progress.completedHours(),
      tasks: (track) => this.#stats.countTasks(pack, progress, track),
      trackDone: (track) => byTrack[track]?.done ?? 0,
      trackPct: (track) => byTrack[track]?.pct ?? 0,
      phasePct: (phase) => byPhase[phase]?.pct ?? 0,
      itemComplete: (id) => { const it = byId.get(id); return it ? progress.isItemComplete(it) : false; },
    };
  }

  #passes(rule: BadgeRule, c: BadgeContext): boolean {
    switch (rule.type) {
      case 'streak': return c.longestStreak >= rule.gte;
      case 'days-done': return c.daysDone >= rule.gte;
      case 'percent': return c.pct >= rule.gte;
      case 'all-done': return c.total > 0 && c.daysDone === c.total;
      case 'tasks-done': return c.tasks(rule.track) >= rule.gte;
      case 'reflections': return c.reflections >= rule.gte;
      case 'groups-complete': return c.groupsComplete >= rule.gte;
      case 'track-complete': return c.trackPct(rule.track) === 100;
      case 'phase-complete': return c.phasePct(rule.phase) === 100;
      case 'item-complete': return c.itemComplete(rule.item);
      case 'all-tracks': return c.tracks.length > 0 && c.tracks.every((t) => c.trackDone(t) >= rule.eachGte);
      case 'weekday': return c.dates.some((d) => rule.days.includes(weekdayMon(d) + 1));
      case 'hour-range': return c.hours.some((h) => inHourRange(h, rule.from, rule.to));
      case 'comeback': return c.hasComeback;
      default: { const _exhaustive: never = rule; return _exhaustive ? false : false; }
    }
  }

  #dedupe(rules: readonly BadgeRule[]): BadgeRule[] {
    const idx = new Map<string, number>();
    const out: BadgeRule[] = [];
    for (const r of rules) {
      const at = idx.get(r.id);
      if (at !== undefined) out[at] = r;
      else { idx.set(r.id, out.length); out.push(r); }
    }
    return out;
  }

  evaluate(pack: Pack, progress: Progress, rules: readonly BadgeRule[]): BadgeStatus[] {
    const ctx = this.#context(pack, progress);
    return this.#dedupe(rules).map((r) => ({
      id: r.id,
      unlocked: progress.isBadgeOwned(r.id) || this.#passes(r, ctx),
      at: progress.badgeAt(r.id),
    }));
  }

  sync(pack: Pack, progress: Progress, rules: readonly BadgeRule[], today: string): string[] {
    const ctx = this.#context(pack, progress);
    const unlocked: string[] = [];
    for (const r of this.#dedupe(rules)) {
      if (!progress.isBadgeOwned(r.id) && this.#passes(r, ctx)) {
        progress.awardBadge(r.id, today);
        unlocked.push(r.id);
      }
    }
    return unlocked;
  }
}
```
(`weekday` uses `weekdayMon(d)+1` → 1=Mon..7=Sun, so `days:[6,7]` = Sat/Sun, matching the old behavior.)

- [ ] **Step 4: Typecheck + test → PASS.**
- [ ] **Step 5: Commit** `git add src/domain/badge-engine.ts test/domain/badge-engine.test.ts && git commit -m "feat(domain): BadgeEngine (discriminated-union interpreter, exhaustive)"`

### Task 12: Validators — `validators.ts`

Ports the structural + semantic checks from the existing `core/validate.js` (still in the repo) to TS, throwing `ValidationError`. Behavior reference: `core/validate.js` (`validatePack`/`validateTheme`/`validateProgress`/`parseProgress`, incl. the duplicate-id, track/phase/item-ref, and badge-param checks, and the legacy `days→items` mapping).

**Files:** Create `src/domain/validators.ts`; Test `test/domain/validators.test.ts`

- [ ] **Step 1: Write the test** (mirrors the old `validate.test.js` cases, now throw-based)

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PackValidator, ThemeValidator, ProgressValidator } from '../../src/domain/validators.ts';
import { ValidationError } from '../../src/domain/errors.ts';

const PACK = {
  schema: 'sunrise.pack/v1', id: 'p', name: 'P', version: '1.0.0',
  tracks: [{ id: 'dsa', label: 'DSA' }],
  groups: [{ id: 'g1', title: 'G1', items: [{ id: 'g1i1', track: 'dsa', tasks: [{ id: 't1', text: 'x' }] }] }],
};
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));

test('valid pack parses to itself', () => {
  assert.deepEqual(new PackValidator().parse(clone(PACK)), PACK);
});
test('issues: bad track ref, dup item id, unknown badge type, bad item-complete ref, leading-hyphen id, empty tracks', () => {
  const v = new PackValidator();
  const undeclared = clone(PACK); undeclared.groups[0].items[0].track = 'nope';
  assert.throws(() => v.parse(undeclared), (e: unknown) => e instanceof ValidationError && e.issues.some((i) => i.path === 'groups[0].items[0].track'));
  const dup = clone(PACK); dup.groups[0].items.push({ id: 'g1i1', track: 'dsa', tasks: [{ id: 't1', text: 'y' }] });
  assert.throws(() => v.parse(dup), (e: unknown) => e instanceof ValidationError && e.issues.some((i) => /duplicate item id/.test(i.msg)));
  const badge = clone(PACK); badge.badges = [{ id: 'b', title: 'B', type: 'tarck-complete', track: 'dsa' }];
  assert.throws(() => v.parse(badge), (e: unknown) => e instanceof ValidationError && e.issues.some((i) => /unknown rule type/.test(i.msg)));
  const cap = clone(PACK); cap.badges = [{ id: 'c', title: 'C', type: 'item-complete', item: 'ghost' }];
  assert.throws(() => v.parse(cap), (e: unknown) => e instanceof ValidationError && e.issues.some((i) => i.path === 'badges[0].item'));
  const ctor = clone(PACK); ctor.tracks = [{ id: 'constructor', label: 'C' }]; ctor.groups[0].items[0].track = 'constructor';
  assert.deepEqual(new PackValidator().parse(ctor).tracks[0]!.id, 'constructor'); // proto-chain regression
  const empty = clone(PACK); empty.tracks = [];
  assert.throws(() => v.parse(empty), ValidationError);
});
test('theme parse: valid passes; wrong version throws', () => {
  const t = { schema: 'sunrise.theme/v1', id: 'neon', name: 'Neon', version: '1.0.0', cssHref: 'themes/neon.css' };
  assert.deepEqual(new ThemeValidator().parse(t), t);
  assert.throws(() => new ThemeValidator().parse({ ...t, schema: 'sunrise.theme/v2' }), ValidationError);
});
test('progress parse: valid passes; null item rejected; legacy days→items', () => {
  const v = new ProgressValidator();
  const ok = { schema: 'sunrise.progress/v1', items: { a: { tasks: {}, reflection: '', completedAt: null, completedHour: null } }, reviews: [], badges: {}, lastSurprise: null };
  assert.deepEqual(v.parse(ok).items['a']?.reflection, '');
  assert.throws(() => v.parse({ items: { x: null }, reviews: [] }), ValidationError);
  const legacy = { version: 2, days: { w1d1: { tasks: { t1: true }, reflection: '', completedAt: '2026-05-30', completedHour: 14 } }, reviews: [], badges: { 'first-light': { at: '2026-05-30' } } };
  const out = v.parse(legacy);
  assert.equal(out.items['w1d1']?.completedHour, 14);
  assert.equal(out.badges['first-light']?.at, '2026-05-30');
});
test('parse rejects bad JSON via parseProgressJson', () => {
  assert.throws(() => new ProgressValidator().parseJson('{bad'), (e: unknown) => e instanceof ValidationError || (e as Error).name === 'ImportError');
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Write `src/domain/validators.ts`** — a direct TS port of `core/validate.js`'s checks, collecting `ValidationIssue[]` and throwing `ValidationError`. Required pieces (match `core/validate.js` behavior exactly):

```ts
import type { Pack, Theme, Track, Phase, Group, Item, Task } from './entities.ts';
import type { BadgeRule, BadgeType } from './badge-rule.ts';
import type { ProgressData } from './progress.ts';
import { ValidationError, ImportError, type ValidationIssue } from './errors.ts';

const ID_RE = /^[a-z0-9][a-z0-9-]*$/;
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number';

// Required params per badge type — mirror of the old BADGE_RULES param specs.
const BADGE_PARAMS: Record<BadgeType, ReadonlyArray<[string, 'number' | 'string' | 'string?' | 'number[]']>> = {
  'streak': [['gte', 'number']], 'days-done': [['gte', 'number']], 'percent': [['gte', 'number']],
  'all-done': [], 'tasks-done': [['gte', 'number'], ['track', 'string?']], 'reflections': [['gte', 'number']],
  'groups-complete': [['gte', 'number']], 'track-complete': [['track', 'string']],
  'phase-complete': [['phase', 'string']], 'item-complete': [['item', 'string']],
  'all-tracks': [['eachGte', 'number']], 'weekday': [['days', 'number[]']],
  'hour-range': [['from', 'number'], ['to', 'number']], 'comeback': [],
};

export class PackValidator {
  parse(raw: unknown): Pack {
    const issues: ValidationIssue[] = [];
    // structural: required top-level fields + types (push issues with paths) …
    // semantic: schema==='sunrise.pack/v1'; unique track/phase/group/badge ids (use a Set, NOT {}, so 'constructor' is fine);
    //   global-unique item ids; per-item task-id uniqueness; item.track ∈ tracks(+'rest'); group.phase ∈ phases;
    //   badge.type ∈ BADGE_PARAMS with required params present & typed; referential badge refs declared.
    // (Port verbatim from core/validate.js validatePack + _uniq(Set) + _checkBadgeRule.)
    if (issues.length) throw new ValidationError(issues);
    return raw as Pack;
  }
}
export class ThemeValidator {
  parse(raw: unknown): Theme { /* schema/id/name/version/cssHref present+string; schema==='sunrise.theme/v1'; else throw */ return raw as Theme; }
}
export class ProgressValidator {
  parse(raw: unknown): ProgressData {
    // if (raw.days && !raw.items) → map to { schema:'sunrise.progress/v1', items: raw.days, reviews: raw.reviews||[], badges: raw.badges||{}, lastSurprise: raw.lastSurprise||null }
    // require items is object (each value a non-null object), reviews is array (each {itemId:string,lastDate:string,stage:number}); else throw ValidationError
    return raw as ProgressData;
  }
  parseJson(json: string): ProgressData {
    let data: unknown;
    try { data = JSON.parse(json); } catch { throw new ImportError('Invalid JSON'); }
    return this.parse(data);
  }
}
```
Implement the elided bodies as a faithful, line-by-line port of `core/validate.js` (the `check` semantics + `_uniq` using `Set` + `_checkBadgeRule`), adapting messages identically. The tests above pin the externally-observable behavior; keep the issue `path`/`msg` strings matching what the tests assert (`'groups[0].items[0].track'`, `'duplicate item id …'`, `'unknown rule type …'`, `'badges[0].item'`).

- [ ] **Step 4: Typecheck + test → PASS.**
- [ ] **Step 5: Commit** `git add src/domain/validators.ts test/domain/validators.test.ts && git commit -m "feat(domain): Pack/Theme/Progress validators (throw ValidationError; port of core/validate.js)"`

### Task 13: View-models + `Tracker` facade — `view-models.ts`, `tracker.ts`

The facade orchestrates intents/queries through the ports. It ports the orchestration in the old `app.js` (init/selectPack/renderToday/renderDashboard/onItemCompleted/import/export), but returns plain DTOs instead of touching the DOM.

**Files:** Create `src/domain/view-models.ts`, `src/domain/tracker.ts`; Test `test/domain/tracker.test.ts`

- [ ] **Step 1: Write `src/domain/view-models.ts`** (plain DTOs the renderer consumes)

```ts
import type { Stat } from './progress-stats.ts';
import type { BadgeStatus } from './badge-engine.ts';

export interface Option { id: string; label: string; selected: boolean; }
export interface TaskVM { id: string; text: string; guidance?: string; done: boolean; }
export interface TodayVM {
  itemId: string; rest: boolean; track: string; trackLabel: string; trackIcon: string;
  title: string; phaseLabel: string; warmup?: string; reflectPrompt?: string; reflection: string;
  tasks: TaskVM[]; resources: { label: string; note: string }[];
  reviewable: boolean; dueReviews: string[]; complete: boolean; notLast: boolean;
  show: { warmup: boolean; reflection: boolean; review: boolean };
}
export interface DashboardVM {
  overall: Stat; streak: number; streakWord: string;
  phases: { id: string; title: string; stat: Stat }[] | null;
  tracks: { id: string; label: string; stat: Stat }[];
  daysOfLabel: string;
}
export interface CalendarVM { title: string; dow: string[]; cells: { day: number; done: boolean; today: boolean; other: boolean }[]; }
export interface TrophyVM { id: string; title: string; desc: string; icon: string; unlocked: boolean; }
export interface SelectorsVM { packs: Option[]; themes: Option[]; items: Option[]; }
export interface CompleteResult { unlockedBadges: string[]; surprise?: string; }
export interface TrackColor { id: string; color: string; }
```

- [ ] **Step 2: Write `test/domain/tracker.test.ts`** — drives the facade with fake ports (in-memory stores, fixed clock/random) and a tiny pack; asserts: completing all tasks of the active item returns `unlockedBadges` incl. `first-light` and persists via the store; `dashboard()`/`todayCard()`/`trophies()` shapes; pack switch reloads per-pack progress; `exportProgress()`→`importProgress()` round-trips. (Use a `FakeProgressStore`/`FakeSessionStore` Map-backed, `FixedClock {today:'2026-05-30', hour:14}`, `Random {next:()=>0.99}`.) Provide ~6 assertions.

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Tracker } from '../../src/domain/tracker.ts';
import { Progress } from '../../src/domain/progress.ts';
import { Streaks } from '../../src/domain/streaks.ts';
import { ProgressStats } from '../../src/domain/progress-stats.ts';
import { ReviewSchedule } from '../../src/domain/review-schedule.ts';
import { BadgeEngine } from '../../src/domain/badge-engine.ts';
import type { Pack, Theme, Session } from '../../src/domain/entities.ts';
import type { ProgressStore, SessionStore, PackSource, ThemeSource, Clock, Random } from '../../src/ports/index.ts';
import { DEFAULT_UI, GENERIC_BADGES, DEFAULT_DOW, DEFAULT_STREAK_WORDS, DEFAULT_MONTHS, DEFAULT_MOTTOS } from '../../src/domain/builtins.ts';

const PACK: Pack = { schema: 'sunrise.pack/v1', id: 'p', name: 'P', version: '1.0.0',
  tracks: [{ id: 'dsa', label: 'DSA' }],
  groups: [{ id: 'g1', title: 'Week 1', items: [{ id: 'i1', track: 'dsa', title: 'A', tasks: [{ id: 't1', text: 'x' }] }] }] };
const THEME: Theme = { schema: 'sunrise.theme/v1', id: 'bonus', name: 'Bonus', version: '1.0.0', cssHref: 'themes/bonus.css' };

function makeTracker() {
  const store = new Map<string, Progress>();
  const progressStore: ProgressStore = { load: (id) => store.get(id) ?? Progress.empty(), save: (id, p) => void store.set(id, p) };
  let session: Session = {};
  const sessionStore: SessionStore = { load: () => session, save: (s) => void (session = s) };
  const packs: PackSource = { packs: () => [PACK] };
  const themes: ThemeSource = { themes: () => [THEME] };
  const clock: Clock = { today: () => '2026-05-30', hour: () => 14 };
  const random: Random = { next: () => 0.99 };
  const t = new Tracker({ packs, themes, progressStore, sessionStore, clock, random,
    streaks: new Streaks(), stats: new ProgressStats(), reviews: new ReviewSchedule(),
    badges: new BadgeEngine(new Streaks(), new ProgressStats()), defaultUi: DEFAULT_UI, genericBadges: GENERIC_BADGES,
    defaultDow: DEFAULT_DOW, defaultStreakWords: DEFAULT_STREAK_WORDS, defaultMonths: DEFAULT_MONTHS, defaultMottos: DEFAULT_MOTTOS });
  t.init();
  return { t, store };
}

test('completing the active item unlocks + persists first-light', () => {
  const { t, store } = makeTracker();
  const res = t.toggleTask('t1', true);
  assert.ok(res.unlockedBadges.includes('first-light'));
  assert.ok(store.get('p')!.isBadgeOwned('first-light'));
});
test('dashboard + today + trophies shapes', () => {
  const { t } = makeTracker();
  assert.equal(typeof t.dashboard().overall.pct, 'number');
  assert.equal(t.todayCard().itemId, 'i1');
  assert.equal(t.trophies().length, GENERIC_BADGES.length);
});
test('export → import round-trips', () => {
  const { t } = makeTracker();
  t.toggleTask('t1', true);
  const json = t.exportProgress();
  t.toggleTask('t1', false);
  t.importProgress(json);
  assert.equal(t.todayCard().tasks[0]!.done, true);
});
```

- [ ] **Step 3: Run → FAIL.**

- [ ] **Step 4: Write `src/domain/tracker.ts`.** Constructor takes a deps object:
```ts
export interface TrackerDeps {
  packs: PackSource; themes: ThemeSource; progressStore: ProgressStore; sessionStore: SessionStore;
  clock: Clock; random: Random; streaks: Streaks; stats: ProgressStats; reviews: ReviewSchedule;
  badges: BadgeEngine; defaultUi: Record<string, string>; genericBadges: readonly BadgeRule[];
  defaultDow: readonly string[]; defaultStreakWords: readonly string[];
  defaultMonths: readonly string[]; defaultMottos: readonly string[];
}
```
(`calendar()` uses `defaultDow`/`defaultMonths`, `dashboard()` uses `defaultStreakWords`, `mottos()` falls back to `defaultMottos`.)

Implement (porting orchestration from `app.js`): private fields for deps + `#pack`/`#progress`/`#theme`/`#currentItemId`/`#rules`; helpers `#ui(k)`, `#lbl(k,fallback)`, `#allItems()`, `#groupOf(id)`, `#itemOf(id)`, `#trackMeta(id)`. Methods:
- `init()` — `sessionStore.load()`; pick active pack (`packs().find(id) ?? packs()[0]`), theme (`?? themes()[0]`); `#progress = progressStore.load(pack.id)`; `#rules = [...genericBadges, ...(pack.badges ?? [])]`; `#currentItemId = ` first non-rest incomplete item id (else last). Throw if `packs().length === 0` (caught by root → stub).
- `toggleTask(taskId, done): CompleteResult` — `const item = #itemOf(#currentItemId)`; `wasComplete = #progress.isItemComplete(item)`; `#progress.setTaskDone(item, taskId, done, clock.today(), clock.hour())`; `save`; if `!wasComplete && #progress.isItemComplete(item)` → run completion: `const unlocked = badges.sync(pack, #progress, #rules, today)`; maybe surprise (`random.next() < 0.12` → pick from `pack.surprises`, `#progress.setLastSurprise(...)`); `save`; return `{ unlockedBadges: unlocked, surprise }`. Else `{ unlockedBadges: [] }`.
- `setReflection(text)`, `selectItem(id)`, `goToItem(delta)`, `selectPack(id)` (persist session, reload progress, reset currentItem), `selectTheme(id)` (persist), `scheduleReviewForCurrent()`.
- `importProgress(json)` — `#progress = new Progress(new ProgressValidator().parse(JSON.parse...))` → use `ProgressValidator.parseJson` (throws ImportError/ValidationError); `save`; reset currentItem.
- `exportProgress(): string` — `JSON.stringify(#progress.toJSON(), null, 2)`.
- Queries: `dashboard()`, `todayCard()`, `selectors()`, `calendar(monthOffset)`, `trophies()`, `trackColors(): TrackColor[]`, `motd()/mottos()`, `activeThemeHref()`, `activePackId()`, `locale()`. Build the DTOs from the services + pack data + `#ui/#lbl`. (Calendar math + phaseLabel `{p}`/`{w}` substitution + streakWord selection: port from `app.js` `renderCalendar`/`renderDashboard`/`renderToday`.)

The view-model construction is a mechanical port of the old `app.js` render functions, minus DOM — each old `renderX` becomes a `Tracker.xVM()` returning data. Keep field names matching `view-models.ts`.

- [ ] **Step 5: Typecheck + test → PASS.**
- [ ] **Step 6: Commit** `git add src/domain/view-models.ts src/domain/tracker.ts test/domain/tracker.test.ts && git commit -m "feat(domain): view-models + Tracker facade (intents + query DTOs)"`

### Task 14: Built-ins — `builtins.ts`

Port the app-level defaults + generic badges + theme manifests from the existing `data/app-defaults.js` (`SUNRISE.defaults.ui`, the 20 `badges`) and `data/builtin-themes.js` (the 5 themes), now as typed TS constants.

**Files:** Create `src/domain/builtins.ts`; Test `test/domain/builtins.test.ts`

- [ ] **Step 1: Write `test/domain/builtins.test.ts`**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_UI, GENERIC_BADGES, BUILTIN_THEMES } from '../../src/domain/builtins.ts';

test('20 generic badges, none referencing track/phase/item, all with id/title/icon', () => {
  assert.equal(GENERIC_BADGES.length, 20);
  for (const b of GENERIC_BADGES) {
    assert.ok(b.id && b.title && b.icon);
    assert.ok(!('track' in b) && !('phase' in b) && !('item' in b));
  }
});
test('5 builtin themes with cssHref; DEFAULT_UI has hint + daysOf', () => {
  assert.deepEqual(BUILTIN_THEMES.map((t) => t.id).sort(), ['bonus', 'dashboard', 'emerald', 'japanese', 'neon']);
  for (const t of BUILTIN_THEMES) assert.equal(t.schema, 'sunrise.theme/v1');
  assert.ok(DEFAULT_UI['hint'] && DEFAULT_UI['daysOf']);
});
```

- [ ] **Step 2: Write `src/domain/builtins.ts`** — port verbatim from `data/app-defaults.js` + `data/builtin-themes.js` into typed constants:
```ts
import type { BadgeRule } from './badge-rule.ts';
import type { Theme } from './entities.ts';

export const DEFAULT_UI: Record<string, string> = { /* …the exact ui object from data/app-defaults.js (incl. hint, daysOf, dow/streakWords/months as JSON-stringable — but dow/streakWords/months are arrays; keep them as a separate export) … */ };
export const DEFAULT_DOW: readonly string[] = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
export const DEFAULT_STREAK_WORDS: readonly string[] = ['день','дня','дней'];
export const DEFAULT_MONTHS: readonly string[] = [ /* 12 months from data/app-defaults.js */ ];
export const DEFAULT_MOTTOS: readonly string[] = ['一歩一歩 · шаг за шагом'];
export const GENERIC_BADGES: readonly BadgeRule[] = [ /* the 20 generic rules from data/app-defaults.js, typed */ ];
export const BUILTIN_THEMES: readonly Theme[] = [
  { schema: 'sunrise.theme/v1', id: 'bonus', name: 'Neo-Brutalist Riso', version: '1.0.0', cssHref: 'themes/bonus.css' },
  { schema: 'sunrise.theme/v1', id: 'neon', name: 'Neon · Кислота', version: '1.0.0', cssHref: 'themes/neon.css' },
  { schema: 'sunrise.theme/v1', id: 'japanese', name: 'Japanese · 和', version: '1.0.0', cssHref: 'themes/japanese.css' },
  { schema: 'sunrise.theme/v1', id: 'emerald', name: 'Emerald · Мрамор', version: '1.0.0', cssHref: 'themes/emerald.css' },
  { schema: 'sunrise.theme/v1', id: 'dashboard', name: 'Colorful Dashboard', version: '1.0.0', cssHref: 'themes/dashboard.css' },
];
```
(`DEFAULT_UI` holds the string-valued ui keys; the array-valued ones — dow/streakWords/months — are separate exports so `DEFAULT_UI` stays `Record<string,string>`. The `Tracker`/renderer read them accordingly. Keep the Russian text byte-identical to `data/app-defaults.js`.)

- [ ] **Step 3: Typecheck + test → PASS.** Then run the WHOLE domain suite: `npm test` → all green.
- [ ] **Step 4: Commit** `git add src/domain/builtins.ts test/domain/builtins.test.ts && git commit -m "feat(domain): builtins (default ui, 20 generic badges, 5 themes) — typed port"`

## Phase 3 — Ports & adapters

The outer ring. Simple adapters are full code; the DOM adapters port `app.js` (still in-repo) to consume the Tracker's view-models.

### Task 15: Ports — `src/ports/index.ts`

**Files:** Create `src/ports/index.ts` (no test — interfaces only; consumers test them)

- [ ] **Step 1: Create the file**

```ts
import type { Pack, Theme, Session } from '../domain/entities.ts';
import type { Progress } from '../domain/progress.ts';

export interface Clock { today(): string; hour(): number; }
export interface Random { next(): number; }
export interface ProgressStore { load(packId: string): Progress; save(packId: string, p: Progress): void; }
export interface SessionStore { load(): Session; save(s: Session): void; }
export interface PackSource { packs(): readonly Pack[]; }
export interface ThemeSource { themes(): readonly Theme[]; }
```

- [ ] **Step 2: Typecheck** `npm run typecheck` → passes. **Commit** `git add src/ports/index.ts && git commit -m "feat(ports): Clock/Random/ProgressStore/SessionStore/PackSource/ThemeSource"`

### Task 16: Trivial + storage adapters

**Files:** Create `src/adapters/system-clock.ts`, `math-random.ts`, `local-storage-store.ts`; Test `test/adapters/local-storage-store.test.ts`

- [ ] **Step 1: Create `system-clock.ts` + `math-random.ts`**

```ts
// system-clock.ts
import type { Clock } from '../ports/index.ts';
export class SystemClock implements Clock {
  today(): string { return new Date().toISOString().slice(0, 10); }   // UTC date (parity)
  hour(): number { return new Date().getHours(); }                     // local hour (parity)
}
// math-random.ts
import type { Random } from '../ports/index.ts';
export class MathRandom implements Random { next(): number { return Math.random(); } }
```

- [ ] **Step 2: Write `test/adapters/local-storage-store.test.ts`** using a fake `localStorage` (a `Map`-backed object assigned to `globalThis.localStorage`). Assert: `ProgressStore.load` returns `Progress.empty()` on missing/corrupt/null-item data (no throw); round-trips a saved progress; `SessionStore.load` returns `{}` for non-object JSON (`"null"`); `migrateLegacy()` copies a v2 blob (`days→items`) into `sunrise.progress.dev-roadmap`, sets `sunrise.session.activePackId='dev-roadmap'`, is idempotent, and swallows a throwing store. (Port the old `state.test.js`/`migration.test.js` cases.)

- [ ] **Step 3: Write `src/adapters/local-storage-store.ts`**

```ts
import type { ProgressStore, SessionStore } from '../ports/index.ts';
import type { Session } from '../domain/entities.ts';
import { Progress } from '../domain/progress.ts';
import { ProgressValidator } from '../domain/validators.ts';

const PREFIX = 'sunrise.progress.';
const SESSION = 'sunrise.session';
const LEGACY = 'devRoadmapState.v1';
const LEGACY_THEME = 'sunriseTheme';

export class LocalStorageProgressStore implements ProgressStore {
  #validator = new ProgressValidator();
  load(packId: string): Progress {
    try {
      const raw = localStorage.getItem(PREFIX + packId);
      if (!raw) return Progress.empty();
      return new Progress(this.#validator.parse(JSON.parse(raw)));
    } catch { return Progress.empty(); }
  }
  save(packId: string, p: Progress): void {
    try { localStorage.setItem(PREFIX + packId, JSON.stringify(p.toJSON(), null, 2)); } catch { /* quota */ }
  }
}

function readSession(): Session {
  try { const raw = localStorage.getItem(SESSION); const o: unknown = raw ? JSON.parse(raw) : {}; return o && typeof o === 'object' && !Array.isArray(o) ? (o as Session) : {}; }
  catch { return {}; }
}
export class LocalStorageSessionStore implements SessionStore {
  load(): Session { return readSession(); }
  save(s: Session): void { try { localStorage.setItem(SESSION, JSON.stringify(s)); } catch { /* quota */ } }
}

export function migrateLegacy(): void {
  try {
    const legacy = localStorage.getItem(LEGACY);
    if (!legacy || localStorage.getItem(PREFIX + 'dev-roadmap')) return;
    const data = new ProgressValidator().parse(JSON.parse(legacy)); // maps days→items
    localStorage.setItem(PREFIX + 'dev-roadmap', JSON.stringify(data, null, 2));
    const sess = readSession();
    if (!sess.activePackId) sess.activePackId = 'dev-roadmap';
    const th = localStorage.getItem(LEGACY_THEME);
    if (th && !sess.themeId) sess.themeId = th;
    localStorage.setItem(SESSION, JSON.stringify(sess));
  } catch { /* never block boot */ }
}
```

- [ ] **Step 4: Typecheck + test → PASS. Commit** `git add src/adapters/system-clock.ts src/adapters/math-random.ts src/adapters/local-storage-store.ts test/adapters/local-storage-store.test.ts && git commit -m "feat(adapters): SystemClock, MathRandom, LocalStorage stores + legacy migration"`

### Task 17: `WindowPluginRegistry` — `window-registry.ts`

**Files:** Create `src/adapters/window-registry.ts`; Test `test/adapters/window-registry.test.ts`

- [ ] **Step 1: Write the test** — valid pack/theme register and appear in `packs()`/`themes()`; an invalid pack is rejected (not in `packs()`, recorded in `rejected()` with its issues); `addBuiltinThemes` adds without validation.

- [ ] **Step 2: Write `src/adapters/window-registry.ts`**

```ts
import type { PackSource, ThemeSource } from '../ports/index.ts';
import type { Pack, Theme } from '../domain/entities.ts';
import { PackValidator, ThemeValidator } from '../domain/validators.ts';
import { ValidationError } from '../domain/errors.ts';

export interface Rejection { kind: 'pack' | 'theme'; id: string; issues: readonly { path: string; msg: string }[]; }

export class WindowPluginRegistry implements PackSource, ThemeSource {
  #packs: Pack[] = [];
  #themes: Theme[] = [];
  #rejected: Rejection[] = [];
  #packValidator = new PackValidator();
  #themeValidator = new ThemeValidator();
  packs(): readonly Pack[] { return this.#packs; }
  themes(): readonly Theme[] { return this.#themes; }
  rejected(): readonly Rejection[] { return this.#rejected; }
  addBuiltinThemes(themes: readonly Theme[]): void { this.#themes.push(...themes); }
  registerPack(raw: unknown): void {
    try { this.#packs.push(this.#packValidator.parse(raw)); } catch (e) { this.#reject('pack', raw, e); }
  }
  registerTheme(raw: unknown): void {
    try { this.#themes.push(this.#themeValidator.parse(raw)); } catch (e) { this.#reject('theme', raw, e); }
  }
  #reject(kind: 'pack' | 'theme', raw: unknown, e: unknown): void {
    const id = raw && typeof raw === 'object' && 'id' in raw && typeof (raw as { id: unknown }).id === 'string' ? (raw as { id: string }).id : '(no id)';
    const issues = e instanceof ValidationError ? e.issues : [{ path: '', msg: String(e) }];
    this.#rejected.push({ kind, id, issues });
    console.error(`[sunrise] ${kind} "${id}" rejected:`, issues);
  }
}
```

- [ ] **Step 3: Typecheck + test → PASS. Commit** `git add src/adapters/window-registry.ts test/adapters/window-registry.test.ts && git commit -m "feat(adapters): WindowPluginRegistry (validate-at-register)"`

### Task 18: DOM adapters — `dom-renderer.ts`, `dom-controller.ts`

These port `app.js` (in-repo) to consume the Tracker's view-models. The canonical DOM hook ids/classes are unchanged from today's `index.html`, so the rendered HTML is a near-copy of `app.js`'s — only the data SOURCE changes (read VM fields instead of recomputing).

**Files:** Create `src/adapters/dom-renderer.ts`, `src/adapters/dom-controller.ts`; Test `test/adapters/dom.test.ts` (vm + fake-DOM harness, ported from the old `app.test.js`)

- [ ] **Step 1: Write `src/adapters/dom-renderer.ts`** — a class with an `esc(s: string): string` helper (same as today's), `$(id)` via `document.getElementById`, and one method per region consuming a VM:
  - `renderSelectors(vm: SelectorsVM)` — fill `#packSelect`/`#themeSelect`/`#daySelect` options.
  - `renderToday(vm: TodayVM)` — port `app.js` `renderToday` (rest branch + work branch + the `.task-wrap`/`.task-hint` guidance spoiler), reading from `vm` (`vm.tasks[].done/guidance`, `vm.show.*`, `vm.dueReviews`, etc.); `esc()` all data; **`esc()` the badge/track icons**.
  - `renderDashboard(vm: DashboardVM)`, `renderComeback(...)`, `renderCalendar(vm: CalendarVM)`, `renderTrophies(vm: TrophyVM[])` — port the matching `app.js` functions, reading VM fields.
  - `applyTheme(href: string, id: string)` — set `#themeCss`.href + `data-theme`.
  - `applyTrackColors(colors: TrackColor[])` — `documentElement.style.setProperty('--track-'+id, color)`.
  - `setText(id, text)` for labels; effects `celebrate()`, `toast(cls, html)`, `badgeToast(title, icon)` — port from `app.js` (DOM spawning), `esc()` the dynamic bits.
  - `stub(message: string, reasons: string[])` — the no-packs fallback, reasons `esc()`-ed.
  Keep every canonical id/class identical to `index.html`. (This is a mechanical 1:1 port of `app.js`'s render functions; the only change is reading from `vm` instead of calling `L.*`/recomputing.)

- [ ] **Step 2: Write `src/adapters/dom-controller.ts`**

```ts
import type { Tracker } from '../domain/tracker.ts';
import type { DomRenderer } from './dom-renderer.ts';

export class DomController {
  #t: Tracker;
  #r: DomRenderer;
  #calOffset = 0;
  constructor(tracker: Tracker, renderer: DomRenderer) { this.#t = tracker; this.#r = renderer; }
  start(): void { this.#applyStaticLabels(); this.#wire(); this.#renderAll(); /* + theme + track colors + motd interval */ }
  #renderAll(): void {
    this.#r.renderSelectors(this.#t.selectors());
    this.#r.renderToday(this.#t.todayCard());
    this.#r.renderDashboard(this.#t.dashboard());
    this.#r.renderComeback(/* this.#t.comeback() */);
    this.#r.renderTrophies(this.#t.trophies());
  }
  #wire(): void { /* port app.js init(): selector onchange → tracker.selectPack/selectTheme/selectItem + applyTheme/renderAll;
    checkbox change → const res = tracker.toggleTask(id, checked); if completing → renderer.celebrate()/badgeToast(res)/toast(surprise); renderAll;
    #reflect oninput → tracker.setReflection; #markReview → tracker.scheduleReviewForCurrent + renderAll;
    prev/next + #nextDayCta → tracker.goToItem(±1) + renderAll; cal buttons (#calOffset) → renderer.renderCalendar(tracker.calendar(offset));
    trophies/cal modals open/close; ESC keydown closes .modal.open; export → download tracker.exportProgress(); import → try tracker.importProgress(text) catch → alert + keep */ }
  #applyStaticLabels(): void { /* set aria-labels on selects/buttons, summary/today titles, theme + track colors, motd, lang from tracker.locale() */ }
}
```
Port the elided wiring directly from `app.js` `init()`, replacing `L.*`/`state` calls with `this.#t.*` intents and re-rendering via `this.#r`. The import handler is a try/catch (the catch site for `ImportError`/`ValidationError`).

- [ ] **Step 3: Write `test/adapters/dom.test.ts`** — port the old `app.test.js` vm + fake-DOM harness, but boot from `dist/sunrise.js` is not available yet; instead instantiate `DomRenderer` + a real `Tracker` (with fake stores + the dev-roadmap pack registered via a fake `globalThis.SUNRISE`) directly, and assert: selectors render options, dashboard has `stat-card`, trophies render 30 tiles, completing the active item's checkboxes persists `first-light`, the guidance spoiler renders for a guidance task, a rest item renders the rest branch. (Use the fake-DOM `FakeEl`/`document` from the old harness; add `querySelector: () => null`.)

- [ ] **Step 4: Typecheck + test → PASS. Commit** `git add src/adapters/dom-renderer.ts src/adapters/dom-controller.ts test/adapters/dom.test.ts && git commit -m "feat(adapters): DomRenderer + DomController (port of app.js over view-models)"`

## Phase 4 — Composition root + bundle

### Task 19: `main.ts` + esbuild bundle

**Files:** Create `src/main.ts`; produce `dist/sunrise.js`

Note: `TrackerDeps` (Task 13) already declares `defaultDow`/`defaultStreakWords`/`defaultMonths`/`defaultMottos`; `main.ts` passes them from `builtins.ts`.

- [ ] **Step 1: Write `src/main.ts`**

```ts
import { Tracker } from './domain/tracker.ts';
import { Streaks } from './domain/streaks.ts';
import { ProgressStats } from './domain/progress-stats.ts';
import { ReviewSchedule } from './domain/review-schedule.ts';
import { BadgeEngine } from './domain/badge-engine.ts';
import {
  DEFAULT_UI, DEFAULT_DOW, DEFAULT_STREAK_WORDS, DEFAULT_MONTHS, DEFAULT_MOTTOS, GENERIC_BADGES, BUILTIN_THEMES,
} from './domain/builtins.ts';
import { SystemClock } from './adapters/system-clock.ts';
import { MathRandom } from './adapters/math-random.ts';
import { LocalStorageProgressStore, LocalStorageSessionStore, migrateLegacy } from './adapters/local-storage-store.ts';
import { WindowPluginRegistry } from './adapters/window-registry.ts';
import { DomRenderer } from './adapters/dom-renderer.ts';
import { DomController } from './adapters/dom-controller.ts';

declare global { interface Window { SUNRISE?: { registerPack(p: unknown): void; registerTheme(t: unknown): void }; } }

const registry = new WindowPluginRegistry();
registry.addBuiltinThemes(BUILTIN_THEMES);
window.SUNRISE = {
  registerPack: (p) => registry.registerPack(p),
  registerTheme: (t) => registry.registerTheme(t),
};

function boot(): void {
  const renderer = new DomRenderer();
  try {
    migrateLegacy();
    const streaks = new Streaks();
    const stats = new ProgressStats();
    const tracker = new Tracker({
      packs: registry, themes: registry,
      progressStore: new LocalStorageProgressStore(), sessionStore: new LocalStorageSessionStore(),
      clock: new SystemClock(), random: new MathRandom(),
      streaks, stats, reviews: new ReviewSchedule(), badges: new BadgeEngine(streaks, stats),
      defaultUi: DEFAULT_UI, genericBadges: GENERIC_BADGES,
      defaultDow: DEFAULT_DOW, defaultStreakWords: DEFAULT_STREAK_WORDS, defaultMonths: DEFAULT_MONTHS, defaultMottos: DEFAULT_MOTTOS,
    });
    tracker.init(); // throws if no packs registered
    new DomController(tracker, renderer).start();
  } catch (e) {
    renderer.stub('Failed to load plugins. Check that dist/sunrise.js and data/packs/* sit next to index.html.', registry.rejected().map((r) => `${r.kind} "${r.id}": ${r.issues.map((i) => `${i.path} ${i.msg}`).join(', ')}`));
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
```

- [ ] **Step 2: Build the bundle**

Run: `npm run build`
Expected: writes `dist/sunrise.js` (+ `.map`); no esbuild errors. Then `npm run typecheck` → 0 errors.

- [ ] **Step 3: Commit** `git add src/main.ts dist/sunrise.js dist/sunrise.js.map && git commit -m "feat: composition root (main.ts) + esbuild bundle (dist/sunrise.js)"`

## Phase 5 — The flip

### Task 20: Rewire `index.html`, add pack conformance test, delete old core

`dev-roadmap.js` needs **no** change — its `typeof module !== 'undefined'` guard already makes it safe as both a browser classic script (under `type:module`) and a Node side-effect import.

**Files:** Modify `index.html`; Create `test/domain/dev-roadmap-pack.test.ts`; Delete `logic.js`, `app.js`, `core/validate.js`, `core/registry.js`, `core/state.js`, `data/app-defaults.js`, `data/builtin-themes.js`

- [ ] **Step 1: Replace the `<script>` block in `index.html`**

Change the trailing script tags from the eight old files to:
```html
<script src="dist/sunrise.js"></script>
<script src="data/packs/dev-roadmap.js"></script>
```
Leave the rest of `index.html` unchanged (the canonical hooks, `#packSelect`, dialog roles, and `.task-hint` CSS are already present).

- [ ] **Step 2: Write `test/domain/dev-roadmap-pack.test.ts`** — side-effect-import the real pack with a fake registry, validate it, assert 13 groups / 91 items / 30 badge ids (generic + pack) / 9 non-rest tracks / `w13d6` exists / a task carries `guidance`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PackValidator } from '../../src/domain/validators.ts';
import { GENERIC_BADGES } from '../../src/domain/builtins.ts';

test('dev-roadmap pack is valid and complete', async () => {
  let captured: unknown;
  (globalThis as { SUNRISE?: unknown }).SUNRISE = { registerPack: (p: unknown) => { captured = p; }, registerTheme: () => {} };
  await import('../../data/packs/dev-roadmap.js');
  const pack = new PackValidator().parse(captured); // throws if invalid
  assert.equal(pack.groups.length, 13);
  assert.equal(pack.groups.flatMap((g) => g.items).length, 91);
  const ids = new Set([...GENERIC_BADGES, ...(pack.badges ?? [])].map((b) => b.id));
  assert.equal(ids.size, 30);
  assert.ok(pack.groups.flatMap((g) => g.items).some((i) => (i.tasks ?? []).some((t) => t.guidance)));
});
```

- [ ] **Step 3: Delete the old core**

```bash
git rm logic.js app.js core/validate.js core/registry.js core/state.js data/app-defaults.js data/builtin-themes.js
```

- [ ] **Step 4: Full suite + stale-ref check**

Run: `npm test` → all green. Run: `npm run typecheck && npm run lint` → 0 errors.
Run: `grep -rn -E "RoadmapLogic|require\(" app.js logic.js core data/app-defaults.js 2>/dev/null || echo CLEAN` → `CLEAN` (files gone).

- [ ] **Step 5: Commit** `git add -A && git commit -m "feat: flip index.html to the TS bundle; add pack conformance test; delete old core"`

## Phase 6 — Verification

### Task 21: Whole-suite + browser parity

- [ ] **Step 1:** `npm run build && npm run typecheck && npm run lint && npm test` — all pass.
- [ ] **Step 2: Manual browser parity** — open `index.html` by double-click. Verify: dashboard + today render; pack switcher shows "Dev Roadmap"; all 5 themes swap; checking all tasks fires confetti + a trophy toast; the guidance spoiler expands; calendar + trophies modals open and close via ✕, backdrop, **and Escape**; export downloads `dev-roadmap-progress.json`; reload preserves progress. If a legacy `devRoadmapState.v1` exists in `localStorage`, confirm the streak/badges migrated.
- [ ] **Step 3: Confirm `dist/` is current** — `npm run build` produces no diff (the committed bundle matches source).
- [ ] **Step 4:** branch ready for review (`git status` clean, `git log --oneline`).

The branch now delivers: a TypeScript SOLID 3-ring onion core, esbuild-bundled to a committed `dist/sunrise.js` that opens on `file://`, with packs/themes still runtime-pluggable, all behavior + the 30 badges + saved progress preserved.




