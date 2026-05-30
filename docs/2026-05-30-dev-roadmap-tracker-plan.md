# Dev Roadmap Tracker — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-contained, offline HTML tracker for a 13-week dev-growth roadmap, with pure testable logic, a separate curriculum data file, and exportable JSON progress ("memory in a file").

**Architecture:** Three plain files loaded via classic `<script>` (works on `file://`): `index.html` (DOM + styles + wiring), `logic.js` (pure functions, dual-mode for browser + Node tests), `curriculum.js` (program data). Progress autosaves to `localStorage` and exports/imports `progress.json`. Pure logic is unit-tested with Node's built-in `node:test` — zero dependencies.

**Tech Stack:** Vanilla HTML/CSS/JS (ES2020), `node --test` (built-in) for unit tests. No build step, no framework, no npm dependencies.

---

## File Structure

```
/Users/horrs/dev-roadmap/
├── index.html              # DOM, dark-theme CSS, rendering + wiring (uses globals RoadmapLogic, Curriculum)
├── logic.js                # pure functions, dual-mode (window.RoadmapLogic + module.exports)
├── curriculum.js           # program data, dual-mode (window.Curriculum + module.exports)
├── package.json            # minimal metadata; "test": "node --test"; NO dependencies, NO "type":"module"
├── .gitignore              # ignore progress.json (personal data), node_modules, .DS_Store
├── test/
│   ├── logic.test.js       # node:test unit tests for logic.js
│   └── curriculum.test.js  # structural integrity tests for curriculum.js
└── docs/
    ├── 2026-05-30-dev-roadmap-design.md
    └── 2026-05-30-dev-roadmap-tracker-plan.md
```

**Responsibilities (one per file):**
- `logic.js` — all pure state/transform logic. No DOM, no `localStorage`, no `Date.now()` inside pure functions (callers pass `today` as `"YYYY-MM-DD"`). This is what we unit-test.
- `curriculum.js` — data only. No logic.
- `index.html` — the only file that touches the DOM, `localStorage`, `Date`, and file download/upload. Thin glue over `RoadmapLogic`.

**Why dual-mode (`logic.js` / `curriculum.js`):** classic scripts work when opening `index.html` via `file://` (ES modules are CORS-blocked from `file://` in Chrome). The same files also `require()` cleanly in Node tests via a 3-line footer. This shim removes a concrete pain (unit-testing pure logic with zero tooling) for trivial cost.

---

## Data Contracts

These shapes are referenced by every task. Author/consume them exactly.

**Curriculum (in `curriculum.js`):**
```js
// Curriculum = {
//   phases: [{ id: 1|2|3, title: string, weeks: [number] }],
//   weeks:  [Week],   // 13 weeks
// }
// Week = { num: 1..13, phase: 1|2|3, theme: string, days: [Day] }   // exactly 7 days
// Day = {
//   id: string,            // "w{week}d{dow}", e.g. "w1d1" — unique across all days
//   week: 1..13,
//   dow: 1..7,             // 1=Mon ... 7=Sun
//   track: Track,          // see allowed set below; dow 7 is always "rest"
//   title: string,
//   warmup: string|null,   // daily algo warmup text; null only on rest day (dow 7)
//   tasks: [{ id: string, text: string }],   // 2-4 items; [] only on rest day
//   reflectPrompt: string, // short prompt; "" allowed
//   resources: [{ label: string, note: string }]   // text pointers; may be []
// }
// Track = "dsa" | "js" | "ts" | "node" | "sysdesign" | "patterns" | "distsys" | "db" | "cs" | "rest"
```

**Progress state (`localStorage` + `progress.json`):**
```js
// State = {
//   version: 1,
//   days: { [dayId]: { tasks: { [taskId]: true }, reflection: string, completedAt: string|null } },
//   reviews: [{ itemId: string, lastDate: "YYYY-MM-DD", stage: number }]
// }
```

**Weekly rotation (pin — removes the "which track on which day" ambiguity):**

| dow | track | meaning |
|---|---|---|
| 1 (Mon) | `dsa` | deep algo session (pattern of the week) |
| 2 (Tue) | core A | `js`/`ts`/`node` per week (see phase map) |
| 3 (Wed) | `sysdesign` | system design |
| 4 (Thu) | core B | `js`/`ts`/`node` per week |
| 5 (Fri) | foundation | `cs` (Phase 1) / `distsys`/`db` (Phase 2-3) |
| 6 (Sat) | `patterns` | patterns/architecture + weekly behavioral reflection in `reflectPrompt` |
| 7 (Sun) | `rest` | review / spaced-repetition; `warmup: null`, `tasks: []` |

**Per-week track assignment (pin for authoring tasks 8-11):**

```
Phase 1 — Foundation (w1-4):  Mon dsa | Sat patterns | Fri cs
  w1: A=js(execution/scope/closures)      B=node(runtime+libuv)        Mon=complexity+arrays+hashing   Fri=cs(networking base)   Sat=SOLID
  w2: A=js(prototypes/this/new)           B=node(event-loop phases)    Mon=two pointers+sliding window Fri=cs(OS: proc/threads)  Sat=creational GoF
  w3: A=js(event loop/microtasks)         B=ts(structural+generics)    Mon=prefix sums+binary search  Fri=cs(concurrency base)  Sat=structural GoF
  w4: A=js(promises/async internals)      B=node(streams intro)        Mon=stack/queue/linked/monotonic Fri=cs(I/O models→libuv) Sat=behavioral GoF

Phase 2 — Depth (w5-9):  Mon dsa | Sat patterns | Fri distsys/db | Wed sysdesign
  w5: A=ts(conditional+infer)      B=node(streams/backpressure)  Mon=recursion+backtracking  Wed=sd fundamentals+estimation  Fri=distsys(failure/8-fallacies/clocks)  Sat=DI+Repository/UoW
  w6: A=ts(mapped+template-literal) B=node(worker_threads/cluster) Mon=trees+BST              Wed=sd caching+CDN              Fri=distsys(consistency+CAP)             Sat=hexagonal+Clean
  w7: A=js(generators/iterators)    B=node(memory/GC/profiling)   Mon=graphs BFS/DFS+topo     Wed=sd queues+async            Fri=distsys(replication+quorums)         Sat=DDD tactical
  w8: A=ts(variance+utility deep)   B=js(proxy/reflect/weakref)   Mon=heaps+union-find+trie   Wed=sd sharding/consistent-hash Fri=db(MVCC+indexes)                    Sat=DDD strategic+CQRS
  w9: A=ts(declaration+module aug)  B=node(async_hooks/ALS)       Mon=DP intro (1D/2D)        Wed=sd case study (timeline/feed) Fri=db(planner/EXPLAIN/isolation/locks) Sat=Event Sourcing+Saga+Outbox

Phase 3 — Synthesis & Mastery (w10-13):  Mon dsa | Wed sysdesign | Fri db/distsys | Sat capstone+reflection
  w10: A=node(profiling/perf case)  B=js(deep edge-cases)   Mon=DP advanced       Wed=full design A (notifications)  Fri=db(replication/partitioning/sharding/pooling)  Sat=capstone#1 (design doc)
  w11: A=ts(type-level mini)        B=node(graceful shutdown/signals) Mon=graphs advanced (Dijkstra/UF apps) Wed=full design B (rate limiter/chat) Fri=distsys(consensus/Raft)        Sat=capstone#2
  w12: A=js(consolidation+quiz)     B=node(consolidation+quiz) Mon=mixed hard       Wed=write a real design doc         Fri=distsys(2PC/sagas/exactly-once)   Sat=capstone#3
  w13: A=ts(review)                 B=node(review)            Mon=spaced-rep consolidation Wed=design review/consolidation Fri=foundation consolidation          Sat=capstone wrap-up + retro
```

Rest days (dow 7) every week: `track:"rest"`, `warmup:null`, `tasks:[]`, `reflectPrompt:"Что закрепить из недели? Прогон due-повторов."`, `resources:[]`.

---

## Task 1: Project skeleton

**Files:**
- Create: `package.json`
- Create: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "dev-roadmap",
  "version": "1.0.0",
  "private": true,
  "description": "Personal dev-growth roadmap tracker",
  "scripts": {
    "test": "node --test"
  }
}
```

- [ ] **Step 2: Create `.gitignore`**

```
# personal progress export — not version-controlled by default
progress.json
*.local.json
node_modules/
.DS_Store
```

- [ ] **Step 3: Verify Node version supports `node --test`**

Run: `node --version`
Expected: `v18.x` or higher (built-in test runner). If lower, stop and report.

- [ ] **Step 4: Commit**

```bash
git add package.json .gitignore
git commit -m "chore: project skeleton"
```

---

## Task 2: logic.js — date helpers + initial state

**Files:**
- Create: `logic.js`
- Test: `test/logic.test.js`

- [ ] **Step 1: Write failing test** — create `test/logic.test.js`

```js
const test = require('node:test');
const assert = require('node:assert');
const L = require('../logic.js');

test('addDays handles month/year rollover (UTC, no TZ drift)', () => {
  assert.equal(L.addDays('2026-01-31', 1), '2026-02-01');
  assert.equal(L.addDays('2026-03-01', -1), '2026-02-28');
  assert.equal(L.addDays('2026-12-31', 1), '2027-01-01');
});

test('diffDays counts whole days b - a', () => {
  assert.equal(L.diffDays('2026-05-30', '2026-06-02'), 3);
  assert.equal(L.diffDays('2026-06-02', '2026-05-30'), -3);
  assert.equal(L.diffDays('2026-05-30', '2026-05-30'), 0);
});

test('createInitialState shape', () => {
  assert.deepEqual(L.createInitialState(), { version: 1, days: {}, reviews: [] });
});

test('phaseOfWeek maps weeks to phases', () => {
  assert.equal(L.phaseOfWeek(1), 1);
  assert.equal(L.phaseOfWeek(4), 1);
  assert.equal(L.phaseOfWeek(5), 2);
  assert.equal(L.phaseOfWeek(9), 2);
  assert.equal(L.phaseOfWeek(10), 3);
  assert.equal(L.phaseOfWeek(13), 3);
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `node --test`
Expected: FAIL — `Cannot find module '../logic.js'`.

- [ ] **Step 3: Create `logic.js` with date helpers + state + dual-mode footer**

```js
'use strict';

function _ms(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}
function addDays(dateStr, n) {
  const dt = new Date(_ms(dateStr));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}
function diffDays(a, b) {
  return Math.round((_ms(b) - _ms(a)) / 86400000);
}
function phaseOfWeek(week) {
  return week <= 4 ? 1 : week <= 9 ? 2 : 3;
}
function createInitialState() {
  return { version: 1, days: {}, reviews: [] };
}

const RoadmapLogic = { addDays, diffDays, phaseOfWeek, createInitialState };

if (typeof module !== 'undefined' && module.exports) module.exports = RoadmapLogic;
if (typeof window !== 'undefined') window.RoadmapLogic = RoadmapLogic;
```

- [ ] **Step 4: Run test, verify pass**

Run: `node --test`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add logic.js test/logic.test.js
git commit -m "feat(logic): date helpers and initial state"
```

---

## Task 3: logic.js — task completion, reflection, day completeness

**Files:**
- Modify: `logic.js`
- Test: `test/logic.test.js`

- [ ] **Step 1: Append failing tests to `test/logic.test.js`**

```js
const CURR = {
  phases: [{ id: 1, title: 'P1', weeks: [1] }],
  weeks: [{ num: 1, phase: 1, theme: 'x', days: [
    { id: 'w1d1', week: 1, dow: 1, track: 'dsa', title: 'A', warmup: 'w', tasks: [{ id: 't1', text: 'a' }, { id: 't2', text: 'b' }], reflectPrompt: '', resources: [] },
    { id: 'w1d7', week: 1, dow: 7, track: 'rest', title: 'Rest', warmup: null, tasks: [], reflectPrompt: '', resources: [] },
  ] }],
};

test('setTaskDone toggles a task and stamps completedAt on first activity', () => {
  let s = L.createInitialState();
  s = L.setTaskDone(s, 'w1d1', 't1', true, '2026-05-30');
  assert.equal(s.days['w1d1'].tasks['t1'], true);
  assert.equal(s.days['w1d1'].completedAt, '2026-05-30');
});

test('setTaskDone clearing all tasks resets completedAt to null', () => {
  let s = L.createInitialState();
  s = L.setTaskDone(s, 'w1d1', 't1', true, '2026-05-30');
  s = L.setTaskDone(s, 'w1d1', 't1', false, '2026-05-31');
  assert.equal(s.days['w1d1'].completedAt, null);
});

test('setTaskDone is immutable (does not mutate prior state)', () => {
  const s0 = L.createInitialState();
  const s1 = L.setTaskDone(s0, 'w1d1', 't1', true, '2026-05-30');
  assert.deepEqual(s0.days, {});
  assert.notEqual(s0, s1);
});

test('setReflection stores text', () => {
  let s = L.createInitialState();
  s = L.setReflection(s, 'w1d1', 'learned closures');
  assert.equal(s.days['w1d1'].reflection, 'learned closures');
});

test('isDayComplete true only when all tasks done', () => {
  let s = L.createInitialState();
  assert.equal(L.isDayComplete(CURR, s, 'w1d1'), false);
  s = L.setTaskDone(s, 'w1d1', 't1', true, '2026-05-30');
  assert.equal(L.isDayComplete(CURR, s, 'w1d1'), false);
  s = L.setTaskDone(s, 'w1d1', 't2', true, '2026-05-30');
  assert.equal(L.isDayComplete(CURR, s, 'w1d1'), true);
});

test('getDay finds a day or returns null', () => {
  assert.equal(L.getDay(CURR, 'w1d1').track, 'dsa');
  assert.equal(L.getDay(CURR, 'nope'), null);
});
```

- [ ] **Step 2: Run, verify fail**

Run: `node --test`
Expected: FAIL — `L.setTaskDone is not a function`.

- [ ] **Step 3: Add functions to `logic.js` (above the footer)**

```js
function allDays(curriculum) {
  return curriculum.weeks.flatMap((w) => w.days);
}
function getDay(curriculum, dayId) {
  return allDays(curriculum).find((d) => d.id === dayId) || null;
}
function _ensureDay(days, dayId) {
  return days[dayId] ? { ...days[dayId] } : { tasks: {}, reflection: '', completedAt: null };
}
function setTaskDone(state, dayId, taskId, done, today) {
  const days = { ...state.days };
  const day = _ensureDay(days, dayId);
  day.tasks = { ...day.tasks };
  if (done) day.tasks[taskId] = true;
  else delete day.tasks[taskId];
  const anyDone = Object.keys(day.tasks).length > 0;
  day.completedAt = anyDone ? day.completedAt || today : null;
  days[dayId] = day;
  return { ...state, days };
}
function setReflection(state, dayId, text) {
  const days = { ...state.days };
  const day = _ensureDay(days, dayId);
  day.reflection = text;
  days[dayId] = day;
  return { ...state, days };
}
function isDayComplete(curriculum, state, dayId) {
  const day = getDay(curriculum, dayId);
  if (!day || day.tasks.length === 0) return false;
  const st = state.days[dayId];
  if (!st) return false;
  return day.tasks.every((t) => st.tasks[t.id]);
}
```

Then extend the footer object:
```js
const RoadmapLogic = {
  addDays, diffDays, phaseOfWeek, createInitialState,
  allDays, getDay, setTaskDone, setReflection, isDayComplete,
};
```

- [ ] **Step 4: Run, verify pass**

Run: `node --test`
Expected: PASS (all tests).

- [ ] **Step 5: Commit**

```bash
git add logic.js test/logic.test.js
git commit -m "feat(logic): task completion, reflection, day completeness"
```

---

## Task 4: logic.js — streak

**Files:**
- Modify: `logic.js`
- Test: `test/logic.test.js`

- [ ] **Step 1: Append failing tests**

```js
function withDates(dates) {
  // build a state with completedAt set for each date
  let s = L.createInitialState();
  dates.forEach((d, i) => { s = L.setTaskDone(s, 'd' + i, 't', true, d); });
  return s;
}

test('computeStreak: 0 when no activity', () => {
  assert.equal(L.computeStreak(L.createInitialState(), '2026-05-30'), 0);
});

test('computeStreak: counts consecutive days ending today', () => {
  const s = withDates(['2026-05-28', '2026-05-29', '2026-05-30']);
  assert.equal(L.computeStreak(s, '2026-05-30'), 3);
});

test('computeStreak: still counts if last active day was yesterday', () => {
  const s = withDates(['2026-05-28', '2026-05-29']);
  assert.equal(L.computeStreak(s, '2026-05-30'), 2);
});

test('computeStreak: 0 if last active day older than yesterday', () => {
  const s = withDates(['2026-05-27']);
  assert.equal(L.computeStreak(s, '2026-05-30'), 0);
});

test('computeStreak: a gap breaks the run', () => {
  const s = withDates(['2026-05-26', '2026-05-29', '2026-05-30']);
  assert.equal(L.computeStreak(s, '2026-05-30'), 2);
});
```

- [ ] **Step 2: Run, verify fail**

Run: `node --test`
Expected: FAIL — `L.computeStreak is not a function`.

- [ ] **Step 3: Add to `logic.js`**

```js
function _activeDates(state) {
  const set = new Set();
  for (const id in state.days) {
    const c = state.days[id].completedAt;
    if (c) set.add(c);
  }
  return set;
}
function computeStreak(state, today) {
  const set = _activeDates(state);
  if (set.size === 0) return 0;
  let cursor;
  if (set.has(today)) cursor = today;
  else if (set.has(addDays(today, -1))) cursor = addDays(today, -1);
  else return 0;
  let streak = 0;
  while (set.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
```

Add `computeStreak` to the footer object.

- [ ] **Step 4: Run, verify pass**

Run: `node --test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add logic.js test/logic.test.js
git commit -m "feat(logic): streak computation"
```

---

## Task 5: logic.js — progress aggregation

**Files:**
- Modify: `logic.js`
- Test: `test/logic.test.js`

- [ ] **Step 1: Append failing tests** (reuses `CURR` from Task 3; add a 2-track fixture)

```js
const CURR2 = {
  phases: [{ id: 1, title: 'P1', weeks: [1] }, { id: 2, title: 'P2', weeks: [5] }],
  weeks: [
    { num: 1, phase: 1, theme: 'x', days: [
      { id: 'w1d1', week: 1, dow: 1, track: 'dsa', title: '', warmup: 'w', tasks: [{ id: 't1', text: '' }], reflectPrompt: '', resources: [] },
      { id: 'w1d2', week: 1, dow: 2, track: 'js', title: '', warmup: 'w', tasks: [{ id: 't1', text: '' }], reflectPrompt: '', resources: [] },
      { id: 'w1d7', week: 1, dow: 7, track: 'rest', title: '', warmup: null, tasks: [], reflectPrompt: '', resources: [] },
    ] },
    { num: 5, phase: 2, theme: 'y', days: [
      { id: 'w5d1', week: 5, dow: 1, track: 'dsa', title: '', warmup: 'w', tasks: [{ id: 't1', text: '' }], reflectPrompt: '', resources: [] },
    ] },
  ],
};

test('progressByTrack excludes rest and computes pct', () => {
  let s = L.createInitialState();
  s = L.setTaskDone(s, 'w1d1', 't1', true, '2026-05-30');
  const p = L.progressByTrack(CURR2, s);
  assert.deepEqual(p.dsa, { done: 1, total: 2, pct: 50 });
  assert.deepEqual(p.js, { done: 0, total: 1, pct: 0 });
  assert.equal(p.rest, undefined);
});

test('progressByPhase groups by phase', () => {
  let s = L.createInitialState();
  s = L.setTaskDone(s, 'w1d1', 't1', true, '2026-05-30');
  const p = L.progressByPhase(CURR2, s);
  assert.deepEqual(p[1], { done: 1, total: 2, pct: 50 });
  assert.deepEqual(p[2], { done: 0, total: 1, pct: 0 });
});

test('overallProgress totals non-rest days', () => {
  let s = L.createInitialState();
  s = L.setTaskDone(s, 'w1d1', 't1', true, '2026-05-30');
  assert.deepEqual(L.overallProgress(CURR2, s), { done: 1, total: 3, pct: 33 });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `node --test`
Expected: FAIL — `L.progressByTrack is not a function`.

- [ ] **Step 3: Add to `logic.js`**

```js
function _bump(acc, key, complete) {
  const a = acc[key] || (acc[key] = { done: 0, total: 0, pct: 0 });
  a.total++;
  if (complete) a.done++;
}
function _finalize(acc) {
  for (const k in acc) acc[k].pct = acc[k].total ? Math.round((acc[k].done / acc[k].total) * 100) : 0;
  return acc;
}
function progressByTrack(curriculum, state) {
  const acc = {};
  for (const day of allDays(curriculum)) {
    if (day.track === 'rest') continue;
    _bump(acc, day.track, isDayComplete(curriculum, state, day.id));
  }
  return _finalize(acc);
}
function progressByPhase(curriculum, state) {
  const acc = {};
  for (const day of allDays(curriculum)) {
    if (day.track === 'rest') continue;
    _bump(acc, phaseOfWeek(day.week), isDayComplete(curriculum, state, day.id));
  }
  return _finalize(acc);
}
function overallProgress(curriculum, state) {
  let done = 0, total = 0;
  for (const day of allDays(curriculum)) {
    if (day.track === 'rest') continue;
    total++;
    if (isDayComplete(curriculum, state, day.id)) done++;
  }
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}
```

Add `progressByTrack, progressByPhase, overallProgress` to footer.

- [ ] **Step 4: Run, verify pass** — Run: `node --test` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add logic.js test/logic.test.js
git commit -m "feat(logic): progress aggregation by track/phase/overall"
```

---

## Task 6: logic.js — spaced repetition

**Files:**
- Modify: `logic.js`
- Test: `test/logic.test.js`

- [ ] **Step 1: Append failing tests**

```js
test('scheduleReview adds a stage-0 entry, dedups by itemId', () => {
  let s = L.createInitialState();
  s = L.scheduleReview(s, 'two-pointers', '2026-05-30');
  s = L.scheduleReview(s, 'two-pointers', '2026-05-31'); // re-schedule same item
  assert.equal(s.reviews.length, 1);
  assert.deepEqual(s.reviews[0], { itemId: 'two-pointers', lastDate: '2026-05-31', stage: 0 });
});

test('getDueReviews returns items whose interval elapsed (stage 0 = 1 day)', () => {
  let s = L.scheduleReview(L.createInitialState(), 'bfs', '2026-05-30');
  assert.deepEqual(L.getDueReviews(s, '2026-05-30'), []);     // 0 days < 1
  assert.deepEqual(L.getDueReviews(s, '2026-05-31'), ['bfs']); // 1 day >= 1
});

test('completeReview advances stage and pushes next due out (1->3 days)', () => {
  let s = L.scheduleReview(L.createInitialState(), 'bfs', '2026-05-30');
  s = L.completeReview(s, 'bfs', '2026-05-31');
  assert.equal(s.reviews[0].stage, 1);
  assert.deepEqual(L.getDueReviews(s, '2026-06-02'), []);      // 2 days < 3
  assert.deepEqual(L.getDueReviews(s, '2026-06-03'), ['bfs']); // 3 days >= 3
});

test('stage caps at last interval', () => {
  let s = L.scheduleReview(L.createInitialState(), 'dp', '2026-01-01');
  for (let i = 0; i < 10; i++) s = L.completeReview(s, 'dp', '2026-01-01');
  assert.equal(s.reviews[0].stage, L.REVIEW_INTERVALS.length - 1);
});
```

- [ ] **Step 2: Run, verify fail** — Run: `node --test` — Expected: FAIL — `L.scheduleReview is not a function`.

- [ ] **Step 3: Add to `logic.js`**

```js
const REVIEW_INTERVALS = [1, 3, 7, 16]; // days between reviews by stage

function scheduleReview(state, itemId, today) {
  const reviews = state.reviews.filter((r) => r.itemId !== itemId);
  reviews.push({ itemId, lastDate: today, stage: 0 });
  return { ...state, reviews };
}
function getDueReviews(state, today) {
  return state.reviews
    .filter((r) => {
      const interval = REVIEW_INTERVALS[Math.min(r.stage, REVIEW_INTERVALS.length - 1)];
      return diffDays(r.lastDate, today) >= interval;
    })
    .map((r) => r.itemId);
}
function completeReview(state, itemId, today) {
  const reviews = state.reviews.map((r) =>
    r.itemId === itemId
      ? { ...r, lastDate: today, stage: Math.min(r.stage + 1, REVIEW_INTERVALS.length - 1) }
      : r
  );
  return { ...state, reviews };
}
```

Add `REVIEW_INTERVALS, scheduleReview, getDueReviews, completeReview` to footer.

- [ ] **Step 4: Run, verify pass** — Run: `node --test` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add logic.js test/logic.test.js
git commit -m "feat(logic): spaced-repetition scheduling"
```

---

## Task 7: logic.js — export/import

**Files:**
- Modify: `logic.js`
- Test: `test/logic.test.js`

- [ ] **Step 1: Append failing tests**

```js
test('serializeState produces pretty JSON round-trippable by parseImported', () => {
  let s = L.createInitialState();
  s = L.setTaskDone(s, 'w1d1', 't1', true, '2026-05-30');
  const json = L.serializeState(s);
  const res = L.parseImported(json);
  assert.equal(res.ok, true);
  assert.deepEqual(res.state, s);
});

test('parseImported rejects invalid JSON', () => {
  assert.deepEqual(L.parseImported('{not json'), { ok: false, error: 'Invalid JSON' });
});

test('parseImported rejects wrong version', () => {
  const r = L.parseImported(JSON.stringify({ version: 99, days: {}, reviews: [] }));
  assert.equal(r.ok, false);
});

test('parseImported rejects missing days/reviews', () => {
  assert.equal(L.parseImported(JSON.stringify({ version: 1, reviews: [] })).ok, false);
  assert.equal(L.parseImported(JSON.stringify({ version: 1, days: {} })).ok, false);
});
```

- [ ] **Step 2: Run, verify fail** — Run: `node --test` — Expected: FAIL — `L.serializeState is not a function`.

- [ ] **Step 3: Add to `logic.js`**

```js
function serializeState(state) {
  return JSON.stringify(state, null, 2);
}
function parseImported(jsonString) {
  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    return { ok: false, error: 'Invalid JSON' };
  }
  if (!data || typeof data !== 'object') return { ok: false, error: 'Not an object' };
  if (data.version !== 1) return { ok: false, error: 'Unsupported version' };
  if (typeof data.days !== 'object' || data.days === null || Array.isArray(data.days))
    return { ok: false, error: 'Missing days' };
  if (!Array.isArray(data.reviews)) return { ok: false, error: 'Missing reviews' };
  return { ok: true, state: { version: 1, days: data.days, reviews: data.reviews } };
}
```

Add `serializeState, parseImported` to footer.

- [ ] **Step 4: Run, verify pass** — Run: `node --test` — Expected: PASS (full logic suite green).

- [ ] **Step 5: Commit**

```bash
git add logic.js test/logic.test.js
git commit -m "feat(logic): export/import serialization with validation"
```

---

## Task 8: curriculum.js — schema, integrity test, and Week 1 (exemplar)

This task pins the data shape with an integrity test, then authors **Week 1 fully** as the quality exemplar for tasks 9-11.

**Files:**
- Create: `curriculum.js`
- Test: `test/curriculum.test.js`

- [ ] **Step 1: Write integrity test** — create `test/curriculum.test.js`

```js
const test = require('node:test');
const assert = require('node:assert');
const C = require('../curriculum.js');

const TRACKS = ['dsa','js','ts','node','sysdesign','patterns','distsys','db','cs','rest'];

test('has 13 weeks, numbered 1..13, with correct phase', () => {
  assert.equal(C.weeks.length, 13);
  C.weeks.forEach((w, i) => {
    assert.equal(w.num, i + 1);
    const expected = w.num <= 4 ? 1 : w.num <= 9 ? 2 : 3;
    assert.equal(w.phase, expected, `week ${w.num} phase`);
    assert.ok(typeof w.theme === 'string' && w.theme.length > 0);
  });
});

test('each week has 7 days, dow 1..7, dow7 is rest', () => {
  for (const w of C.weeks) {
    assert.equal(w.days.length, 7, `week ${w.num} day count`);
    w.days.forEach((d, i) => {
      assert.equal(d.dow, i + 1, `${d.id} dow`);
      assert.equal(d.week, w.num, `${d.id} week`);
      assert.equal(d.id, `w${w.num}d${i + 1}`, `${d.id} id format`);
      assert.ok(TRACKS.includes(d.track), `${d.id} track ${d.track}`);
      if (d.dow === 7) {
        assert.equal(d.track, 'rest', `${d.id} should be rest`);
        assert.equal(d.warmup, null, `${d.id} warmup null`);
        assert.deepEqual(d.tasks, [], `${d.id} tasks empty`);
      } else {
        assert.equal(d.track !== 'rest', true, `${d.id} not rest`);
        assert.ok(typeof d.warmup === 'string' && d.warmup.length > 0, `${d.id} warmup`);
        assert.ok(d.tasks.length >= 2 && d.tasks.length <= 4, `${d.id} tasks 2-4`);
      }
    });
  }
});

test('day ids are globally unique; task ids unique within a day', () => {
  const ids = new Set();
  for (const w of C.weeks) for (const d of w.days) {
    assert.equal(ids.has(d.id), false, `dup day ${d.id}`);
    ids.add(d.id);
    const tids = new Set();
    for (const t of d.tasks) {
      assert.equal(tids.has(t.id), false, `dup task ${d.id}/${t.id}`);
      tids.add(t.id);
      assert.ok(typeof t.text === 'string' && t.text.length > 0, `${d.id}/${t.id} text`);
    }
  }
});

test('rotation: dow1=dsa, dow3=sysdesign, dow6=patterns', () => {
  for (const w of C.weeks) {
    assert.equal(w.days[0].track, 'dsa', `w${w.num} Mon`);
    assert.equal(w.days[2].track, 'sysdesign', `w${w.num} Wed`);
    assert.equal(w.days[5].track, 'patterns', `w${w.num} Sat`);
  }
});

test('phases array references all 13 weeks', () => {
  const wk = C.phases.flatMap((p) => p.weeks).sort((a, b) => a - b);
  assert.deepEqual(wk, [1,2,3,4,5,6,7,8,9,10,11,12,13]);
});
```

- [ ] **Step 2: Run, verify fail** — Run: `node --test` — Expected: FAIL — `Cannot find module '../curriculum.js'`.

- [ ] **Step 3: Create `curriculum.js` with phases, Week 1 fully authored, dual-mode footer**

Authoring rules for every non-rest day: `tasks` = 2-4 concrete, doable-in-~40-min items (read X + do Y + write/notes Z); `warmup` = one short DSA reinforcement of the week's pattern; `reflectPrompt` = one question; `resources` = canonical text pointers (e.g., "MDN: Closures", "Node docs: Event Loop", "PostgreSQL docs: MVCC", book + chapter). Avoid volatile deep-links; prefer stable doc/section names.

```js
'use strict';

const phases = [
  { id: 1, title: 'Фундамент', weeks: [1, 2, 3, 4] },
  { id: 2, title: 'Глубина', weeks: [5, 6, 7, 8, 9] },
  { id: 3, title: 'Синтез и мастерство', weeks: [10, 11, 12, 13] },
];

const REST = (num) => ({
  id: `w${num}d7`, week: num, dow: 7, track: 'rest', title: 'Разгрузка / повторы',
  warmup: null, tasks: [], reflectPrompt: 'Что закрепить из недели? Прогон due-повторов.', resources: [],
});

const weeks = [
  {
    num: 1, phase: 1, theme: 'Сложность, базовые структуры, модель исполнения JS, рантайм Node',
    days: [
      { id: 'w1d1', week: 1, dow: 1, track: 'dsa', title: 'Сложность + массивы + хеш-таблицы',
        warmup: 'Оцени O() для 3 коротких сниппетов (вложенные циклы, hashmap-lookup, бинпоиск).',
        tasks: [
          { id: 't1', text: 'Теория: Big-O, амортизация, как растут O(1)/O(log n)/O(n)/O(n log n)/O(n^2). Записать «числа интуиции».' },
          { id: 't2', text: 'Решить 2 задачи на хеш-таблицы: Two Sum, Contains Duplicate. Проговорить вслух сложность.' },
          { id: 't3', text: 'Конспект: когда массив, когда set/map; стоимость операций каждой структуры.' },
        ],
        reflectPrompt: 'Где сегодня ошибся в оценке сложности и почему?',
        resources: [ { label: 'Big-O', note: 'bigocheatsheet.com — таблица сложностей' }, { label: 'MDN', note: 'Map vs Object, Set' } ] },
      { id: 'w1d2', week: 1, dow: 2, track: 'js', title: 'Модель исполнения: контексты, scope chain, замыкания',
        warmup: 'Two Sum повторить по памяти за 10 мин.',
        tasks: [
          { id: 't1', text: 'Теория: execution context, scope chain, hoisting, TDZ. Нарисовать стек контекстов для примера.' },
          { id: 't2', text: 'Практика: реализовать счётчик и memoize через замыкание; объяснить, что захватывается.' },
          { id: 't3', text: 'Написать 5 предложений «как я объясню замыкание на ревью джуну».' },
        ],
        reflectPrompt: 'Что в hoisting/TDZ оказалось не так, как я думал?',
        resources: [ { label: 'MDN', note: 'Closures; Scope; Hoisting' }, { label: 'Книга', note: "You Don't Know JS: Scope & Closures" } ] },
      { id: 'w1d3', week: 1, dow: 3, track: 'sysdesign', title: 'Введение в System Design: язык и метрики',
        warmup: 'Contains Duplicate повторить за 8 мин.',
        tasks: [
          { id: 't1', text: 'Теория: latency vs throughput, p50/p95/p99, числа латентности (RAM/SSD/сеть/датацентр).' },
          { id: 't2', text: 'Упражнение «на салфетке»: оценить QPS и хранилище для сервиса на 1M DAU.' },
          { id: 't3', text: 'Конспект: 4 шага разбора задачи (требования → оценки → high-level → узкие места).' },
        ],
        reflectPrompt: 'Какую оценку я бы не смог обосновать на интервью прямо сейчас?',
        resources: [ { label: 'Numbers', note: 'Latency numbers every programmer should know' } ] },
      { id: 'w1d4', week: 1, dow: 4, track: 'node', title: 'Рантайм Node: V8 + libuv + bindings',
        warmup: 'Оценить O() для двух решений Two Sum (brute vs hashmap).',
        tasks: [
          { id: 't1', text: 'Теория: из чего состоит Node (V8, libuv, C++ bindings, core JS). Что делает libuv.' },
          { id: 't2', text: 'Практика: запустить скрипт с sync vs async fs, объяснить, что блокирует event loop.' },
          { id: 't3', text: 'Конспект: чем Node-процесс отличается от «просто JS в браузере».' },
        ],
        reflectPrompt: 'Что именно делает libuv, чего не делает V8?',
        resources: [ { label: 'Node docs', note: 'The Node.js Event Loop (guide)' }, { label: 'libuv', note: 'docs.libuv.org — Design overview' } ] },
      { id: 'w1d5', week: 1, dow: 5, track: 'cs', title: 'Сети (база): TCP/IP, TCP-handshake, HTTP/1.1',
        warmup: 'Решить Valid Anagram (хеш-таблица).',
        tasks: [
          { id: 't1', text: 'Теория: стек TCP/IP, 3-way handshake, что такое порт/сокет, HTTP/1.1 поверх TCP.' },
          { id: 't2', text: 'Практика: `curl -v` к любому сайту — разобрать вывод (DNS→TCP→TLS→HTTP).' },
          { id: 't3', text: 'Конспект: почему keep-alive важен; head-of-line blocking в HTTP/1.1.' },
        ],
        reflectPrompt: 'Что происходит «по проводу» от ввода URL до первого байта ответа?',
        resources: [ { label: 'MDN', note: 'Overview of HTTP; Evolution of HTTP' } ] },
      { id: 'w1d6', week: 1, dow: 6, track: 'patterns', title: 'SOLID на TS + еженедельная рефлексия лидерства',
        warmup: 'Повторить любую задачу недели по памяти.',
        tasks: [
          { id: 't1', text: 'Теория: 5 принципов SOLID, по одному идиоматичному TS-примеру нарушения/исправления.' },
          { id: 't2', text: 'Практика: взять кусок своего кода из Atlas, найти нарушение SRP/DIP, отрефакторить мысленно/в блокноте.' },
          { id: 't3', text: 'Behavioral-рефлексия: вспомнить случай, где ты влиял на решение без формальной власти (staff-архетип). Записать в формате Ситуация→Действие→Результат.' },
        ],
        reflectPrompt: 'Какой принцип SOLID я чаще всего нарушаю в реальном коде?',
        resources: [ { label: 'Refactoring', note: 'refactoring.guru — SOLID' }, { label: 'Staff', note: 'StaffEng.com — архетипы' } ] },
      REST(1),
    ],
  },
  // weeks 2..13 authored in Tasks 9-11
];

const Curriculum = { phases, weeks };

if (typeof module !== 'undefined' && module.exports) module.exports = Curriculum;
if (typeof window !== 'undefined') window.Curriculum = Curriculum;
```

- [ ] **Step 4: Run integrity test (Week 1 + structure)**

Run: `node --test test/curriculum.test.js`
Expected: The "13 weeks" and "phases reference all 13" tests FAIL (only 1 week so far); all per-day checks for Week 1 PASS. This confirms Week 1 conforms. Do not proceed to make all green until tasks 9-11 add the remaining weeks.

- [ ] **Step 5: Commit**

```bash
git add curriculum.js test/curriculum.test.js
git commit -m "feat(curriculum): schema, integrity tests, Week 1 (exemplar)"
```

---

## Task 9: curriculum.js — Phase 1 remainder (weeks 2-4)

**Files:**
- Modify: `curriculum.js`

- [ ] **Step 1: Author weeks 2, 3, 4** following the Week-1 exemplar shape exactly and the per-week assignment table (Phase 1 rows). Insert the three `Week` objects into the `weeks` array (replace the `// weeks 2..13` comment region). Each non-rest day: 2-4 concrete tasks, a warmup reinforcing that week's DSA pattern, a reflectPrompt, and 1-2 resource pointers. End each week with `REST(n)`.

  Content anchors (titles per the assignment table):
  - **w2** (theme: «JS прототипы, фазы event loop Node, ОС-база, порождающие GoF»): Mon `dsa` two pointers + sliding window; Tue `js` prototypes/`this`/`new`/prototype chain; Wed `sysdesign` load balancers + horizontal scaling; Thu `node` event-loop phases (timers/poll/check/close) + microtasks vs phases; Fri `cs` процессы vs потоки, планировщик, контекст-свитчинг; Sat `patterns` Factory/Builder/Singleton (идиоматичный TS).
  - **w3** (theme: «JS event loop, TS-основы, конкурентность, структурные GoF»): Mon `dsa` prefix sums + binary search (incl. по ответу); Tue `js` event loop глубоко: call stack, microtask/macrotask порядок; Thu `ts` структурная типизация + generics (ограничения/дефолты/вывод); Wed `sysdesign` SQL vs NoSQL, индексация на уровне обзора; Fri `cs` гонки/мьютексы/семафоры/deadlock; Sat `patterns` Adapter/Decorator/Facade.
  - **w4** (theme: «JS async внутри, Node streams, I/O-модели, поведенческие GoF»): Mon `dsa` stack/queue/linked list + monotonic stack; Tue `js` промисы/async-await изнутри, микротаски; Thu `node` streams intro (readable/writable, pipe, backpressure idea); Wed `sysdesign` кэширование (cache-aside, TTL, инвалидация); Fri `cs` модели I/O (blocking/non-blocking/multiplexed epoll/kqueue → связь с libuv); Sat `patterns` Strategy/Observer/Command.

- [ ] **Step 2: Run integrity test**

Run: `node --test test/curriculum.test.js`
Expected: per-day checks for weeks 1-4 PASS; "13 weeks" still FAILS (4 of 13). This is expected until Task 11.

- [ ] **Step 3: Commit**

```bash
git add curriculum.js
git commit -m "feat(curriculum): Phase 1 weeks 2-4"
```

---

## Task 10: curriculum.js — Phase 2 (weeks 5-9)

**Files:**
- Modify: `curriculum.js`

- [ ] **Step 1: Author weeks 5-9** per the Phase 2 assignment table, same shape. Anchors:
  - **w5** «Рекурсия/backtracking; TS conditional+infer; Node streams/backpressure; distsys основы»: Mon `dsa` recursion+backtracking; Tue `ts` conditional types + `infer`; Wed `sysdesign` fundamentals/estimation deep + API design; Thu `node` streams/backpressure/pipeline/object mode; Fri `distsys` модели отказов, 8 заблуждений, логические/векторные часы; Sat `patterns` DI/IoC + Repository/Unit of Work.
  - **w6** «Деревья/BST; TS mapped/template-literal; Node worker_threads/cluster; CAP»: Mon `dsa` trees + BST (обходы, валидация, LCA); Tue `ts` mapped types + key remapping + template literal types; Wed `sysdesign` CDN + edge caching; Thu `node` worker_threads + cluster + child_process; Fri `distsys` модели согласованности + CAP/PACELC; Sat `patterns` hexagonal (ports/adapters) + Clean.
  - **w7** «Графы; JS generators; Node память/GC/профилирование; репликация»: Mon `dsa` graphs BFS/DFS + topo sort; Tue `js` генераторы/итераторы/protocol; Wed `sysdesign` очереди + асинхронная обработка (твой outbox как пример); Thu `node` память/GC/heap snapshots/flame graphs/поиск утечек; Fri `distsys` репликация (leader/follower, multi-leader, leaderless, кворумы); Sat `patterns` DDD тактический (entity/VO/aggregate/repository).
  - **w8** «Кучи/union-find/trie; TS variance/utility; JS proxy/reflect; БД MVCC/индексы»: Mon `dsa` heaps/priority queue + union-find + trie; Tue `ts` вариантность + продвинутые utility-типы + свои утилиты; Wed `sysdesign` шардирование/партиционирование + consistent hashing; Thu `js` Proxy/Reflect/WeakMap/WeakRef/Symbol; Fri `db` MVCC + типы индексов (B-tree/GIN/GiST/BRIN/частичные/покрывающие); Sat `patterns` DDD стратегический + CQRS.
  - **w9** «DP intro; TS declaration; Node async_hooks; БД планировщик»: Mon `dsa` DP intro (1D/2D, классика: climbing stairs, house robber, LCS); Tue `ts` declaration files + module augmentation + строгость компилятора; Wed `sysdesign` кейс целиком (лента/timeline — на базе твоего Atlas); Thu `node` async_hooks/AsyncLocalStorage + обработка ошибок; Fri `db` планировщик + `EXPLAIN (ANALYZE, BUFFERS)` + изоляция/блокировки (incl. `FOR UPDATE SKIP LOCKED`); Sat `patterns` Event Sourcing + Saga + Outbox (теория под твою практику).

- [ ] **Step 2: Run integrity test** — Run: `node --test test/curriculum.test.js` — Expected: per-day checks weeks 1-9 PASS; "13 weeks" still FAILS (9 of 13).

- [ ] **Step 3: Commit**

```bash
git add curriculum.js
git commit -m "feat(curriculum): Phase 2 weeks 5-9"
```

---

## Task 11: curriculum.js — Phase 3 (weeks 10-13)

**Files:**
- Modify: `curriculum.js`

- [ ] **Step 1: Author weeks 10-13** per the Phase 3 table. No timed/mock-interview framing (per spec out-of-scope). Capstone runs across Saturdays. Anchors:
  - **w10** «DP advanced; Node профилирование; БД репликация/шардинг; капстоун#1»: Mon `dsa` DP advanced (на интервалах/подпоследовательностях); Tue `node` профилирование/перф на реальном коде (perf_hooks, --inspect); Wed `sysdesign` полный дизайн A (нотификации) + написать design doc; Thu `js` глубокие edge-cases (coercion, equality, числа/точность); Fri `db` репликация (streaming/logical) + партиционирование + шардинг + пулинг (pgbouncer); Sat `patterns` капстоун#1: спроектировать event-driven сервис с outbox, начать design doc.
  - **w11** «Графы advanced; TS type-level; Raft; капстоун#2»: Mon `dsa` графы advanced (Dijkstra, применения union-find); Tue `ts` type-level мини-проект (например, типобезопасный билдер/парсер); Wed `sysdesign` полный дизайн B (rate limiter / чат); Thu `node` graceful shutdown + сигналы + надёжность воркеров; Fri `distsys` консенсус: Raft вглубь (+ интуиция Paxos); Sat `patterns` капстоун#2: реализовать ядро сервиса (outbox + drain worker + идемпотентность).
  - **w12** «Mixed hard; consolidation; 2PC/saga; капстоун#3»: Mon `dsa` смешанные hard (без таймера, ради глубины); Tue `js` консолидация + самопроверка (вопросы по внутренностям); Wed `sysdesign` написать настоящий design doc по своей системе; Thu `node` консолидация + самопроверка; Fri `distsys` распределённые транзакции: 2PC, саги, «иллюзия exactly-once», семантики доставки; Sat `patterns` капстоун#3: тесты + наблюдаемость сервиса (метрики/логи/трейсы).
  - **w13** «Консолидация и ретро; капстоун wrap-up»: Mon `dsa` прогон due-повторов + слабые паттерны; Tue `ts` ревью заметок фазы; Wed `sysdesign` ревью/консолидация дизайн-разборов; Thu `node` ревью заметок; Fri `distsys`/`db` консолидация фундамента; Sat `patterns` капстоун wrap-up + написать ретро «что вырос, куда дальше».

- [ ] **Step 2: Run full integrity suite** — Run: `node --test` — Expected: **ALL tests PASS** (logic + curriculum: 13 weeks, 91 days, structure valid).

- [ ] **Step 3: Commit**

```bash
git add curriculum.js
git commit -m "feat(curriculum): Phase 3 weeks 10-13 — curriculum complete"
```

---

## Task 12: index.html — skeleton + dark-theme CSS

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create `index.html` skeleton** (loads globals; no logic yet)

```html
<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Dev Roadmap</title>
<style>
  :root{
    --bg:#0f1115; --panel:#171a21; --panel2:#1f242e; --line:#2a3140;
    --text:#e6e9ef; --muted:#9aa4b2; --accent:#6ea8fe; --ok:#3fb950; --warn:#d29922;
    --radius:12px; font-synthesis:none;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--text);
    font:15px/1.5 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Inter,sans-serif}
  header{padding:20px 24px;border-bottom:1px solid var(--line);display:flex;
    align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
  h1{font-size:18px;margin:0;letter-spacing:.2px}
  .wrap{max-width:1080px;margin:0 auto;padding:24px}
  .grid{display:grid;gap:16px}
  .cards{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
  .card{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:16px}
  .card h2{font-size:13px;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin:0 0 12px}
  .bar{height:8px;background:var(--panel2);border-radius:999px;overflow:hidden}
  .bar>i{display:block;height:100%;background:var(--accent)}
  .row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 0}
  .pill{font-size:12px;color:var(--muted)}
  .streak{font-size:34px;font-weight:700}
  .today{margin-top:8px}
  .task{display:flex;gap:10px;align-items:flex-start;padding:10px;border:1px solid var(--line);
    border-radius:10px;margin-bottom:8px;background:var(--panel2)}
  .task input{margin-top:3px;width:18px;height:18px;accent-color:var(--accent)}
  .task.done label{text-decoration:line-through;color:var(--muted)}
  textarea{width:100%;min-height:70px;background:var(--panel2);color:var(--text);
    border:1px solid var(--line);border-radius:10px;padding:10px;resize:vertical;font:inherit}
  button{background:var(--accent);color:#0b1020;border:0;border-radius:10px;padding:9px 14px;
    font-weight:600;cursor:pointer}
  button.ghost{background:transparent;color:var(--text);border:1px solid var(--line)}
  select{background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:8px;padding:8px}
  .due{color:var(--warn)}
  .muted{color:var(--muted)}
  .toolbar{display:flex;gap:8px;flex-wrap:wrap}
  a.res{color:var(--accent);text-decoration:none}
  .track-tag{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--accent)}
</style>
</head>
<body>
<header>
  <h1>🚀 Dev Roadmap <span class="pill" id="phaseLabel"></span></h1>
  <div class="toolbar">
    <label class="pill">День: <select id="daySelect"></select></label>
    <button class="ghost" id="exportBtn">Экспорт</button>
    <button class="ghost" id="importBtn">Импорт</button>
    <input type="file" id="importFile" accept="application/json" hidden />
  </div>
</header>
<div class="wrap">
  <div class="grid cards" id="dashboard"></div>
  <div class="card today" id="todayCard"></div>
</div>

<script src="curriculum.js"></script>
<script src="logic.js"></script>
<script>
/* app wiring added in Tasks 13-15 */
</script>
</body>
</html>
```

- [ ] **Step 2: Verify it opens** — open `index.html` in a browser (double-click). Expected: dark page with header, empty dashboard, no console errors (`window.Curriculum` and `window.RoadmapLogic` defined — check in devtools console: `Curriculum.weeks.length` → 13).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(ui): html skeleton and dark theme"
```

---

## Task 13: index.html — state, persistence, today card

**Files:**
- Modify: `index.html` (the inline `<script>` block)

- [ ] **Step 1: Replace the wiring `<script>` block** with state + today rendering

```html
<script>
const L = window.RoadmapLogic, C = window.Curriculum;
const KEY = 'devRoadmapState.v1';
const allDays = L.allDays(C);

function todayStr(){ return new Date().toISOString().slice(0,10); }

function loadState(){
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return L.createInitialState();
    const res = L.parseImported(raw);
    return res.ok ? res.state : L.createInitialState();
  } catch(e){ return L.createInitialState(); }
}
function saveState(){
  try { localStorage.setItem(KEY, L.serializeState(state)); } catch(e){}
}

let state = loadState();

// pick the "current" day: first not-complete non-rest day, else last day
function defaultDayId(){
  const firstOpen = allDays.find(d => d.track!=='rest' && !L.isDayComplete(C, state, d.id));
  return (firstOpen || allDays[allDays.length-1]).id;
}
let currentDayId = defaultDayId();

function renderDaySelect(){
  const sel = document.getElementById('daySelect');
  sel.innerHTML = allDays.map(d =>
    `<option value="${d.id}" ${d.id===currentDayId?'selected':''}>Нед ${d.week} · ${dowName(d.dow)} · ${d.track}</option>`
  ).join('');
  sel.onchange = () => { currentDayId = sel.value; renderAll(); };
}
function dowName(dow){ return ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'][dow-1]; }

function renderToday(){
  const d = L.getDay(C, currentDayId);
  const el = document.getElementById('todayCard');
  document.getElementById('phaseLabel').textContent =
    `· Фаза ${L.phaseOfWeek(d.week)} · Неделя ${d.week}`;
  if (d.track === 'rest'){
    const due = L.getDueReviews(state, todayStr());
    el.innerHTML = `<span class="track-tag">rest</span><h2>${d.title}</h2>
      <p class="muted">${d.reflectPrompt}</p>
      <p>${due.length ? 'К повтору сегодня: <b class="due">'+due.join(', ')+'</b>' : 'Повторов на сегодня нет.'}</p>`;
    return;
  }
  const st = state.days[currentDayId] || { tasks:{}, reflection:'' };
  el.innerHTML = `
    <span class="track-tag">${d.track}</span>
    <h2 style="text-transform:none;font-size:18px;color:var(--text)">${d.title}</h2>
    <p class="muted">🔥 Разминка: ${d.warmup}</p>
    <div id="taskList"></div>
    <p class="muted" style="margin:14px 0 6px">Рефлексия: ${d.reflectPrompt}</p>
    <textarea id="reflect" placeholder="Короткая заметка...">${st.reflection||''}</textarea>
    ${d.resources.length ? '<p class="muted" style="margin-top:10px">Ресурсы: '+
      d.resources.map(r=>`<span class="res">${r.label}</span> — ${r.note}`).join(' · ')+'</p>' : ''}
    ${d.track==='dsa' ? `<p style="margin-top:10px"><button id="markReview">Запланировать повтор паттерна недели</button></p>`:''}
  `;
  const list = document.getElementById('taskList');
  list.innerHTML = d.tasks.map(t => {
    const done = !!(st.tasks && st.tasks[t.id]);
    return `<div class="task ${done?'done':''}">
      <input type="checkbox" id="cb_${t.id}" ${done?'checked':''}/>
      <label for="cb_${t.id}">${t.text}</label></div>`;
  }).join('');
  d.tasks.forEach(t => {
    document.getElementById('cb_'+t.id).onchange = (e) => {
      state = L.setTaskDone(state, currentDayId, t.id, e.target.checked, todayStr());
      saveState(); renderAll();
    };
  });
  document.getElementById('reflect').oninput = (e) => {
    state = L.setReflection(state, currentDayId, e.target.value); saveState();
  };
  if (d.track==='dsa'){
    document.getElementById('markReview').onclick = () => {
      const item = `w${d.week}-${d.title}`;
      state = L.scheduleReview(state, item, todayStr()); saveState(); renderAll();
    };
  }
}

function renderAll(){ renderDaySelect(); renderToday(); renderDashboard(); }
function renderDashboard(){ /* added in Task 14 */ }
renderAll();
</script>
```

- [ ] **Step 2: Verify in browser** — open `index.html`. Expected: today card shows the first incomplete day's tasks; checking a box strikes it through and persists across reload (localStorage); typing in reflection persists; changing the day dropdown switches content; no console errors.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(ui): state persistence and today card"
```

---

## Task 14: index.html — dashboard (overall, streak, phases, tracks, due reviews)

**Files:**
- Modify: `index.html` (replace the `renderDashboard` stub)

- [ ] **Step 1: Implement `renderDashboard`**

```js
function bar(pct){ return `<div class="bar"><i style="width:${pct}%"></i></div>`; }
const TRACK_LABEL = { dsa:'Алгоритмы', js:'JavaScript', ts:'TypeScript', node:'Node.js',
  sysdesign:'System Design', patterns:'Паттерны', distsys:'Распределённые', db:'Базы данных', cs:'CS-фундамент' };

function renderDashboard(){
  const overall = L.overallProgress(C, state);
  const streak = L.computeStreak(state, todayStr());
  const byPhase = L.progressByPhase(C, state);
  const byTrack = L.progressByTrack(C, state);
  const due = L.getDueReviews(state, todayStr());

  const phaseRows = [1,2,3].map(p => {
    const x = byPhase[p] || {done:0,total:0,pct:0};
    const title = C.phases.find(ph=>ph.id===p).title;
    return `<div class="row"><span>Фаза ${p}: ${title}</span><span class="pill">${x.done}/${x.total}</span></div>${bar(x.pct)}`;
  }).join('');

  const trackRows = Object.keys(TRACK_LABEL).filter(k=>byTrack[k]).map(k => {
    const x = byTrack[k];
    return `<div class="row"><span>${TRACK_LABEL[k]}</span><span class="pill">${x.pct}%</span></div>${bar(x.pct)}`;
  }).join('');

  document.getElementById('dashboard').innerHTML = `
    <div class="card"><h2>Общий прогресс</h2>
      <div class="row"><span>Пройдено дней</span><span class="pill">${overall.done}/${overall.total}</span></div>
      ${bar(overall.pct)}<p class="muted" style="margin-top:8px">${overall.pct}% за 13 недель</p></div>
    <div class="card"><h2>Серия</h2><div class="streak">🔥 ${streak}</div>
      <p class="muted">дней подряд</p></div>
    <div class="card"><h2>Фазы</h2>${phaseRows}</div>
    <div class="card"><h2>Треки</h2>${trackRows}</div>
    <div class="card"><h2>К повтору сегодня</h2>
      ${due.length ? '<p class="due">'+due.join('<br>')+'</p>' : '<p class="muted">Пусто — чисто 👌</p>'}</div>
  `;
}
```

- [ ] **Step 2: Verify in browser** — open `index.html`. Expected: 5 dashboard cards render; completing a day increments "Пройдено дней" and track/phase bars; streak shows a number; scheduling a review (on a dsa day) makes it appear under "К повтору сегодня" on/after the due date.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(ui): progress dashboard with streak and due reviews"
```

---

## Task 15: index.html — export/import wiring

**Files:**
- Modify: `index.html` (append to the wiring script, before `renderAll()`)

- [ ] **Step 1: Add export/import handlers**

```js
document.getElementById('exportBtn').onclick = () => {
  const blob = new Blob([L.serializeState(state)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
};
document.getElementById('importBtn').onclick = () => document.getElementById('importFile').click();
document.getElementById('importFile').onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const res = L.parseImported(String(reader.result));
    if (!res.ok){ alert('Импорт не удался: ' + res.error + '\nТекущий прогресс не изменён.'); return; }
    state = res.state; saveState(); currentDayId = defaultDayId(); renderAll();
    alert('Прогресс импортирован.');
  };
  reader.readAsText(file);
  e.target.value = '';
};
```

- [ ] **Step 2: Verify in browser** — open `index.html`. Expected: "Экспорт" downloads `progress.json` (open it: pretty JSON matching state); editing it / importing a valid file restores state; importing a malformed file shows an alert and leaves current progress intact.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(ui): progress export/import to progress.json"
```

---

## Task 16: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full test suite** — Run: `node --test` — Expected: ALL pass (logic + curriculum integrity; 13 weeks / 91 days valid).

- [ ] **Step 2: Manual smoke test** — open `index.html`, then confirm each:
  - Dashboard shows 0% / streak 0 on a fresh profile (clear localStorage first via devtools).
  - Complete all tasks of day 1 → "Пройдено дней" = 1, dsa track > 0%, streak = 1.
  - Reload page → progress persists.
  - On a dsa day, schedule a review → appears in "К повтору сегодня" once due.
  - Export → `progress.json` downloads and is valid JSON.
  - Clear localStorage, reload (everything 0) → Import the `progress.json` → state restored.
  - Import a deliberately broken JSON → alert shown, state untouched.

- [ ] **Step 3: Confirm `progress.json` is gitignored** — Run: `git status --porcelain` after an export — Expected: `progress.json` does NOT appear (ignored).

- [ ] **Step 4: Final commit (if any docs/tweaks)**

```bash
git add -A
git commit -m "chore: final verification pass"
```

---

## Self-Review (filled by author)

**1. Spec coverage:**
- Spec §4 tracks 1-9 → curriculum rotation table + Tasks 8-11 (every track appears in the per-week map). ✓
- Spec §4 thin threads (behavioral/SRE/security/English) → woven into Saturday `reflectPrompt`/tasks and relevant days (behavioral on every Sat; security/observability inside w12 capstone tasks). ✓
- Spec §5 three phases → `phases` + `phaseOfWeek` + Tasks 9-11. ✓
- Spec §6 daily engine (warmup + theme + reflection, 6+1) → Day schema (`warmup`, `tasks`, `reflectPrompt`) + dow7 REST. ✓
- Spec §6 spaced repetition → Task 6 + dsa "schedule review" button + due card. ✓
- Spec §7 app architecture (self-contained HTML, localStorage autosave, JSON export/import, dark, offline) → Tasks 12-15. ✓
- Spec §7 error handling (corrupt localStorage → fresh; bad import → message, no clobber) → Task 13 `loadState` + Task 15 import guard. ✓
- Spec §8 file layout → File Structure section + Task 1. ✓

**2. Placeholder scan:** No "TBD/TODO/handle edge cases". Curriculum-content tasks (9-11) specify exact per-day track/topic anchors + the Week-1 exemplar shape + the integrity test as the objective gate — this is data authored to a pinned contract, not a code placeholder. ✓

**3. Type consistency:** State shape `{version,days,reviews}` and Day/Curriculum shapes used identically across logic tasks (2-7), curriculum tasks (8-11), and UI tasks (12-15). Function names (`setTaskDone`, `isDayComplete`, `progressByTrack`, `getDueReviews`, `parseImported`, `serializeState`, `allDays`, `getDay`, `computeStreak`, `phaseOfWeek`) are defined in logic.js and called consistently in index.html. ✓
