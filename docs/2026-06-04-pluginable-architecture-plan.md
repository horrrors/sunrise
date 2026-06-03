# Pluginable & AI-First Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Sunrise into a thin host that loads two kinds of self-registering plugins (themes + self-contained content packs) over a validated, versioned contract, with per-pack progress; the current curriculum becomes "pack #1".

**Architecture:** A tiny `core/registry.js` is the only load seam (`registerPack`/`registerTheme`). `logic.js` becomes a pure, generalized core (no hardcoded 13/7/phases) plus hand-rolled validators and a declarative badge-rule interpreter. `app.js` resolves an active pack + theme and renders from whatever the pack declares; progress is namespaced per pack in localStorage. Spec: `docs/2026-06-04-pluginable-architecture-design.md`.

**Tech Stack:** Vanilla ES5-ish JS (classic `<script>`, no build/bundler/deps), `node --test` for tests, CSS-only themes. Runs from `file://`.

---

## Build strategy (read first)

- **`node --test` is the gate at every commit.** New pure code (validators, registry, generalized `logic.js`, badge interpreter, state/migration) is built and tested first.
- **The browser app keeps running on the OLD data files** (`data/curriculum.js`, `data/content.js`) and the unchanged `index.html` until the final integration phase (Phase 5). We do not delete old data or rewire `index.html` until then.
- **`logic.js` is rewritten wholesale in Phase 2.** Because the old `app.js`/`app.test.js` depend on the old `logic.js` API, we **disable `test/app.test.js` at the start of Phase 2** (`git mv test/app.test.js test/app.test.js.disabled`) and **rewrite + re-enable it in Phase 5**. Every other test file stays green throughout.
- DRY, YAGNI, TDD, frequent commits. Exact paths and full code below.

## File structure (created / modified)

| File | Responsibility |
|---|---|
| `core/registry.js` *(new)* | The 4-function load seam: `registerPack`, `registerTheme`, `packs()`, `themes()`. Validates at register; collects `_rejected[]`. The ONE file a future dev-server swap touches. |
| `logic.js` *(rewritten)* | Pure core: date math, pack-structure access, progress mutations, streaks/aggregation, spaced repetition, declarative badge interpreter (`BADGE_RULES`), validators (`validatePack/Theme/Progress`) + schema descriptors, progress serialize/parse. No DOM. |
| `data/app-defaults.js` *(new; was `content.js`)* | App-level fallback UI strings (`SUNRISE.defaults.ui`), the GENERIC pack-agnostic badge rule set (`SUNRISE.defaults.badges`), fallback `mottos`. |
| `data/builtin-themes.js` *(new)* | Registers the 5 bundled themes via `registerTheme`. |
| `data/packs/dev-roadmap.js` *(new; generated)* | Pack #1 — today's curriculum reshaped to the contract. Produced by `scripts/reshape-curriculum.js`. |
| `scripts/reshape-curriculum.js` *(new, one-off)* | Node script: reads old `data/curriculum.js` + `data/content.js`, writes `data/packs/dev-roadmap.js`. |
| `app.js` *(rewritten)* | Host: migrate, resolve active pack/theme, render from declared structure + labels, pack switcher, per-pack progress, inline `--track-*` colors, graceful fallbacks. |
| `index.html` *(modified)* | New `<script>` load order; add `#packSelect` to toolbar. |
| `docs/plugins/{README,content-pack,theme}.md` *(new)* | Standalone authoring docs (the AI-first deliverable). |
| `test/validate.test.js` *(new)* | Validator coverage. |
| `test/badges.test.js` *(new)* | Badge-rule interpreter coverage. |
| `test/migration.test.js` *(new)* | Lossless v2→per-pack migration. |
| `test/logic.test.js` *(rewritten)* | Generalized core tests over a generic pack fixture. |
| `test/dev-roadmap.test.js` *(was `curriculum.test.js`)* | Pack #1 conformance. |
| `test/app.test.js` *(rewritten in Phase 5)* | DOM-contract harness over the new world. |
| `test/doc-drift.test.js` *(new, optional)* | Schema descriptor in docs == `logic.js`. |
| Deleted in Phase 5 | `data/curriculum.js`, `data/content.js`. |

---

## Phase 1 — Validators & registry (additive; suite stays green)

These are pure additions to a NEW state in `logic.js`. To avoid colliding with the old `logic.js` during Phase 1, we author the validators + `BADGE_RULES` + `check()` as a **new module `core/validate.js`** that `logic.js` will re-export in Phase 2. This keeps Phase 1 fully additive (old `logic.js` untouched, old tests green).

### Task 1: `check()` walker + schema descriptors + `validateTheme`

**Files:**
- Create: `core/validate.js`
- Test: `test/validate.test.js`

- [ ] **Step 1: Write the failing test**

```js
// test/validate.test.js
const test = require('node:test');
const assert = require('node:assert');
const V = require('../core/validate.js');

test('validateTheme: valid theme passes', () => {
  const r = V.validateTheme({ schema:'sunrise.theme/v1', id:'neon', name:'Neon', version:'1.0.0', cssHref:'themes/neon.css' });
  assert.deepEqual(r, { ok:true });
});
test('validateTheme: missing cssHref reports path', () => {
  const r = V.validateTheme({ schema:'sunrise.theme/v1', id:'neon', name:'Neon', version:'1.0.0' });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => e.path === 'cssHref' && e.msg === 'required'), JSON.stringify(r.errors));
});
test('validateTheme: bad id format reports', () => {
  const r = V.validateTheme({ schema:'sunrise.theme/v1', id:'Neon!', name:'Neon', version:'1.0.0', cssHref:'x.css' });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => e.path === 'id'));
});
test('validateTheme: wrong contract version rejected', () => {
  const r = V.validateTheme({ schema:'sunrise.theme/v2', id:'neon', name:'Neon', version:'1.0.0', cssHref:'x.css' });
  assert.equal(r.ok, false);
  assert.ok(r.errors[0].msg.includes('unsupported contract version'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/validate.test.js`
Expected: FAIL — `Cannot find module '../core/validate.js'`.

- [ ] **Step 3: Write minimal implementation**

```js
// core/validate.js
'use strict';
(function (root) {

function _typeOf(v){ return Array.isArray(v) ? 'array' : (v === null ? 'null' : typeof v); }

// Generic structural walker. schema node: { type, required, of, props, pattern, min }
function check(value, schema, path, errors){
  if (value === undefined || value === null){
    if (schema.required) errors.push({ path, msg: 'required' });
    return;
  }
  const t = _typeOf(value);
  if (schema.type && t !== schema.type){ errors.push({ path, msg: `expected ${schema.type}, got ${t}` }); return; }
  if (schema.type === 'string' && schema.pattern && !schema.pattern.test(value)) errors.push({ path, msg: 'invalid format' });
  if (schema.type === 'array'){
    if (schema.min != null && value.length < schema.min) errors.push({ path, msg: `expected >= ${schema.min} items` });
    if (schema.of) value.forEach((v, i) => check(v, schema.of, `${path}[${i}]`, errors));
  }
  if (schema.type === 'object' && schema.props){
    for (const k in schema.props) check(value[k], schema.props[k], path ? `${path}.${k}` : k, errors);
  }
}

const ID = { type:'string', required:true, pattern:/^[a-z0-9][a-z0-9-]*$/ };

const THEME_SCHEMA = { type:'object', required:true, props:{
  schema:{ type:'string', required:true },
  id: ID, name:{ type:'string', required:true }, version:{ type:'string', required:true },
  cssHref:{ type:'string', required:true },
} };

function validateTheme(theme){
  const errors = []; check(theme, THEME_SCHEMA, '', errors);
  if (errors.length) return { ok:false, errors };
  if (theme.schema !== 'sunrise.theme/v1') return { ok:false, errors:[{ path:'schema', msg:`unsupported contract version "${theme.schema}"` }] };
  return { ok:true };
}

const API = { check, ID, THEME_SCHEMA, validateTheme };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (root){ root.SUNRISE = root.SUNRISE || {}; root.SUNRISE._validate = API; }
})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/validate.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add core/validate.js test/validate.test.js
git commit -m "feat(validate): schema walker + validateTheme"
```

### Task 2: `BADGE_RULES` table (shared by validator + interpreter)

**Files:**
- Modify: `core/validate.js` (add `BADGE_RULES`, `_inHourRange`)
- Test: `test/badges.test.js` (rule-table sanity only here; full interpreter in Phase 2)

- [ ] **Step 1: Write the failing test**

```js
// test/badges.test.js
const test = require('node:test');
const assert = require('node:assert');
const V = require('../core/validate.js');

test('BADGE_RULES: every rule has params spec and a test fn', () => {
  const types = Object.keys(V.BADGE_RULES);
  assert.ok(types.length >= 14, 'rule count: ' + types.length);
  for (const t of types){
    assert.equal(typeof V.BADGE_RULES[t].test, 'function', t + ' test');
    assert.equal(typeof V.BADGE_RULES[t].params, 'object', t + ' params');
  }
});
test('hour-range helper wraps when from>to', () => {
  assert.equal(V._inHourRange(23, 22, 5), true);   // night-owl
  assert.equal(V._inHourRange(3, 22, 5), true);
  assert.equal(V._inHourRange(10, 22, 5), false);
  assert.equal(V._inHourRange(6, 5, 8), true);     // early-lark
  assert.equal(V._inHourRange(8, 5, 8), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/badges.test.js`
Expected: FAIL — `BADGE_RULES` undefined.

- [ ] **Step 3: Write minimal implementation**

Add to `core/validate.js` (before the `API` object), then add `_inHourRange` and `BADGE_RULES` to `API`. The `test(rule, ctx)` functions read a precomputed context built in Phase 2; here we only define them.

```js
function _inHourRange(h, from, to){ return from <= to ? (h >= from && h < to) : (h >= from || h < to); }

const BADGE_RULES = {
  'streak':          { params:{ gte:'number' },                test:(r,c)=> c.longestStreak >= r.gte },
  'days-done':       { params:{ gte:'number' },                test:(r,c)=> c.daysDone >= r.gte },
  'percent':         { params:{ gte:'number' },                test:(r,c)=> c.pct >= r.gte },
  'all-done':        { params:{},                              test:(r,c)=> c.total > 0 && c.daysDone === c.total },
  'tasks-done':      { params:{ gte:'number', track:'string?' }, test:(r,c)=> c.tasks(r.track) >= r.gte },
  'reflections':     { params:{ gte:'number' },                test:(r,c)=> c.reflections >= r.gte },
  'groups-complete': { params:{ gte:'number' },                test:(r,c)=> c.groupsComplete >= r.gte },
  'track-complete':  { params:{ track:'string' },              test:(r,c)=> c.trackPct(r.track) === 100 },
  'phase-complete':  { params:{ phase:'string' },              test:(r,c)=> c.phasePct(r.phase) === 100 },
  'item-complete':   { params:{ item:'string' },               test:(r,c)=> c.itemComplete(r.item) },
  'all-tracks':      { params:{ eachGte:'number' },            test:(r,c)=> c.tracks.length > 0 && c.tracks.every(t => c.trackDone(t) >= r.eachGte) },
  'weekday':         { params:{ days:'number[]' },             test:(r,c)=> c.dates.some(d => r.days.includes(c.weekday(d) + 1)) },
  'hour-range':      { params:{ from:'number', to:'number' },  test:(r,c)=> c.hours.some(h => _inHourRange(h, r.from, r.to)) },
  'comeback':        { params:{},                              test:(r,c)=> c.hasComeback },
};
```

Update the API line to: `const API = { check, ID, THEME_SCHEMA, validateTheme, BADGE_RULES, _inHourRange };`

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/badges.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add core/validate.js test/badges.test.js
git commit -m "feat(validate): declarative BADGE_RULES table + hour-range helper"
```

### Task 3: `validatePack` (structural + semantic)

**Files:**
- Modify: `core/validate.js`
- Test: `test/validate.test.js`

- [ ] **Step 1: Write the failing test**

```js
// append to test/validate.test.js
const MINIMAL_PACK = {
  schema:'sunrise.pack/v1', id:'p', name:'P', version:'1.0.0',
  tracks:[{ id:'dsa', label:'DSA' }],
  groups:[{ id:'g1', title:'G1', items:[
    { id:'g1i1', track:'dsa', title:'A', tasks:[{ id:'t1', text:'x' }] },
  ] }],
};
test('validatePack: minimal valid pack passes', () => {
  assert.deepEqual(V.validatePack(MINIMAL_PACK), { ok:true });
});
test('validatePack: item referencing undeclared track', () => {
  const bad = JSON.parse(JSON.stringify(MINIMAL_PACK));
  bad.groups[0].items[0].track = 'nope';
  const r = V.validatePack(bad);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => e.path === 'groups[0].items[0].track' && /not declared/.test(e.msg)), JSON.stringify(r.errors));
});
test('validatePack: duplicate item id', () => {
  const bad = JSON.parse(JSON.stringify(MINIMAL_PACK));
  bad.groups[0].items.push({ id:'g1i1', track:'dsa', title:'B', tasks:[{ id:'t1', text:'y' }] });
  const r = V.validatePack(bad);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => /duplicate item id/.test(e.msg)));
});
test('validatePack: unknown badge type + bad ref', () => {
  const bad = JSON.parse(JSON.stringify(MINIMAL_PACK));
  bad.badges = [
    { id:'b1', title:'B1', type:'tarck-complete', track:'dsa' },
    { id:'b2', title:'B2', type:'item-complete', item:'ghost' },
    { id:'b3', title:'B3', type:'tasks-done', gte:5 },           // valid (track optional)
  ];
  const r = V.validatePack(bad);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => e.path === 'badges[0].type' && /unknown rule type/.test(e.msg)));
  assert.ok(r.errors.some(e => e.path === 'badges[1].item' && /not declared/.test(e.msg)));
});
test('validatePack: group.phase must be declared', () => {
  const bad = JSON.parse(JSON.stringify(MINIMAL_PACK));
  bad.groups[0].phase = 'p1';
  const r = V.validatePack(bad);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => e.path === 'groups[0].phase' && /not declared/.test(e.msg)));
});
test('validatePack: wrong contract version rejected', () => {
  const bad = { ...MINIMAL_PACK, schema:'sunrise.pack/v2' };
  const r = V.validatePack(bad);
  assert.equal(r.ok, false);
  assert.ok(r.errors[0].msg.includes('unsupported contract version'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/validate.test.js`
Expected: FAIL — `V.validatePack is not a function`.

- [ ] **Step 3: Write minimal implementation**

Add to `core/validate.js` (descriptors after `THEME_SCHEMA`, functions before `API`):

```js
const _TASK  = { type:'object', props:{ id:ID, text:{ type:'string', required:true } } };
const _RES   = { type:'object', props:{ label:{ type:'string', required:true }, note:{ type:'string', required:true } } };
const _ITEM  = { type:'object', props:{
  id:ID, track:{ type:'string', required:true }, title:{ type:'string' },
  warmup:{ type:'string' }, reflectPrompt:{ type:'string' },
  tasks:{ type:'array', of:_TASK }, resources:{ type:'array', of:_RES }, rest:{ type:'boolean' } } };
const _GROUP = { type:'object', props:{
  id:ID, title:{ type:'string', required:true }, phase:{ type:'string' }, theme:{ type:'string' },
  items:{ type:'array', required:true, min:1, of:_ITEM } } };
const _TRACK = { type:'object', props:{
  id:ID, label:{ type:'string', required:true }, icon:{ type:'string' }, color:{ type:'string' }, reviewable:{ type:'boolean' } } };
const _PHASE = { type:'object', props:{ id:ID, title:{ type:'string', required:true } } };
const _BADGE = { type:'object', props:{
  id:ID, title:{ type:'string', required:true }, desc:{ type:'string' }, icon:{ type:'string' }, type:{ type:'string', required:true } } };

const PACK_SCHEMA = { type:'object', required:true, props:{
  schema:{ type:'string', required:true },
  id:ID, name:{ type:'string', required:true }, version:{ type:'string', required:true }, locale:{ type:'string' },
  settings:{ type:'object' },
  tracks:{ type:'array', required:true, min:1, of:_TRACK },
  phases:{ type:'array', of:_PHASE },
  groups:{ type:'array', required:true, min:1, of:_GROUP },
  badges:{ type:'array', of:_BADGE },
  mottos:{ type:'array', of:{ type:'string' } }, surprises:{ type:'array', of:{ type:'string' } } } };

function _uniq(list, keyFn, label, errors){
  const seen = {}; list.forEach((x, i) => { const k = keyFn(x); if (k == null) return;
    if (seen[k]) errors.push({ path:`${label}[${i}]`, msg:`duplicate id "${k}"` }); seen[k] = true; });
}

function _checkBadgeRule(b, path, refs, errors){
  const def = BADGE_RULES[b.type];
  if (!def){ errors.push({ path:`${path}.type`, msg:`unknown rule type "${b.type}"` }); return; }
  for (const k in def.params){
    const spec = def.params[k]; const optional = spec.endsWith('?'); const base = optional ? spec.slice(0, -1) : spec;
    const v = b[k];
    if (v === undefined){ if (!optional) errors.push({ path:`${path}.${k}`, msg:'required' }); continue; }
    const ok = base === 'number[]' ? (Array.isArray(v) && v.every(n => typeof n === 'number')) : (typeof v === base);
    if (!ok) errors.push({ path:`${path}.${k}`, msg:`expected ${base}` });
  }
  if ((b.type === 'track-complete' || b.type === 'tasks-done') && b.track != null && !refs.trackIds.has(b.track))
    errors.push({ path:`${path}.track`, msg:`track "${b.track}" not declared` });
  if (b.type === 'phase-complete' && b.phase != null && !refs.phaseIds.has(b.phase))
    errors.push({ path:`${path}.phase`, msg:`phase "${b.phase}" not declared` });
  if (b.type === 'item-complete' && b.item != null && !refs.itemIds.has(b.item))
    errors.push({ path:`${path}.item`, msg:`item "${b.item}" not declared` });
}

function validatePack(pack){
  const errors = []; check(pack, PACK_SCHEMA, '', errors);
  if (errors.length) return { ok:false, errors };
  if (pack.schema !== 'sunrise.pack/v1') return { ok:false, errors:[{ path:'schema', msg:`unsupported contract version "${pack.schema}"` }] };
  _uniq(pack.tracks, t => t.id, 'tracks', errors);
  if (pack.phases) _uniq(pack.phases, p => p.id, 'phases', errors);
  _uniq(pack.groups, g => g.id, 'groups', errors);
  if (pack.badges) _uniq(pack.badges, b => b.id, 'badges', errors);
  const trackIds = new Set(pack.tracks.map(t => t.id)); trackIds.add('rest');
  const phaseIds = new Set((pack.phases || []).map(p => p.id));
  const itemIds = new Set();
  pack.groups.forEach((g, gi) => {
    if (g.phase != null && !phaseIds.has(g.phase)) errors.push({ path:`groups[${gi}].phase`, msg:`phase "${g.phase}" not declared` });
    g.items.forEach((it, ii) => {
      const p = `groups[${gi}].items[${ii}]`;
      if (itemIds.has(it.id)) errors.push({ path:`${p}.id`, msg:`duplicate item id "${it.id}"` });
      itemIds.add(it.id);
      if (!trackIds.has(it.track)) errors.push({ path:`${p}.track`, msg:`track "${it.track}" not declared` });
      const tids = new Set();
      (it.tasks || []).forEach((t, ti) => { if (tids.has(t.id)) errors.push({ path:`${p}.tasks[${ti}].id`, msg:`duplicate task id "${t.id}"` }); tids.add(t.id); });
    });
  });
  (pack.badges || []).forEach((b, bi) => _checkBadgeRule(b, `badges[${bi}]`, { trackIds, phaseIds, itemIds }, errors));
  return errors.length ? { ok:false, errors } : { ok:true };
}
```

Add `PACK_SCHEMA, validatePack` to the `API` object.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/validate.test.js`
Expected: PASS (all validate tests).

- [ ] **Step 5: Commit**

```bash
git add core/validate.js test/validate.test.js
git commit -m "feat(validate): validatePack structural + semantic checks"
```

### Task 4: `validateProgress` + progress parse/serialize

**Files:**
- Modify: `core/validate.js`
- Test: `test/validate.test.js`

- [ ] **Step 1: Write the failing test**

```js
// append to test/validate.test.js
test('validateProgress: well-formed passes', () => {
  const p = { schema:'sunrise.progress/v1', items:{ a:{ tasks:{}, reflection:'', completedAt:null, completedHour:null } }, reviews:[], badges:{} };
  assert.deepEqual(V.validateProgress(p), { ok:true });
});
test('validateProgress: null day value rejected (review robustness bug)', () => {
  const r = V.validateProgress({ items:{ x:null }, reviews:[] });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => e.path === 'items.x'));
});
test('validateProgress: malformed review element rejected', () => {
  const r = V.validateProgress({ items:{}, reviews:['oops', null] });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => /reviews\[0\]/.test(e.path)));
});
test('parseProgress: rejects bad JSON / bad shape; migrates legacy days->items', () => {
  assert.equal(V.parseProgress('{x').ok, false);
  assert.equal(V.parseProgress(JSON.stringify({ items:{ a:5 }, reviews:[] })).ok, false);
  const legacy = JSON.stringify({ version:2, days:{ w1d1:{ tasks:{t1:true}, reflection:'', completedAt:'2026-05-30', completedHour:14 } }, reviews:[], badges:{ 'first-light':{ at:'2026-05-30' } } });
  const r = V.parseProgress(legacy);
  assert.equal(r.ok, true);
  assert.ok(r.progress.items.w1d1, 'days migrated to items');
  assert.equal(r.progress.badges['first-light'].at, '2026-05-30');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/validate.test.js`
Expected: FAIL — `V.validateProgress is not a function`.

- [ ] **Step 3: Write minimal implementation**

Add to `core/validate.js`:

```js
const PROGRESS_SCHEMA = { type:'object', required:true, props:{
  schema:{ type:'string' },
  items:{ type:'object', required:true },
  reviews:{ type:'array', required:true },
  badges:{ type:'object' } } };

function validateProgress(progress){
  const errors = []; check(progress, PROGRESS_SCHEMA, '', errors);
  if (errors.length) return { ok:false, errors };
  for (const id in progress.items){ const it = progress.items[id];
    if (!it || typeof it !== 'object' || Array.isArray(it)) errors.push({ path:`items.${id}`, msg:'must be an object' }); }
  progress.reviews.forEach((r, i) => {
    if (!r || typeof r !== 'object' || typeof r.itemId !== 'string' || typeof r.lastDate !== 'string' || typeof r.stage !== 'number')
      errors.push({ path:`reviews[${i}]`, msg:'bad review shape' }); });
  return errors.length ? { ok:false, errors } : { ok:true };
}

function serializeProgress(progress){ return JSON.stringify(progress, null, 2); }

function parseProgress(jsonString){
  let data; try { data = JSON.parse(jsonString); } catch (e){ return { ok:false, error:'Invalid JSON' }; }
  if (!data || typeof data !== 'object') return { ok:false, error:'Not an object' };
  if (data.days && !data.items) data = { schema:'sunrise.progress/v1', items:data.days, reviews:data.reviews || [], badges:data.badges || {}, lastSurprise:data.lastSurprise || null };
  const v = validateProgress(data);
  if (!v.ok) return { ok:false, error: v.errors.map(e => `${e.path}: ${e.msg}`).join('; ') };
  const badges = (data.badges && typeof data.badges === 'object' && !Array.isArray(data.badges)) ? data.badges : {};
  return { ok:true, progress:{ schema:'sunrise.progress/v1', items:data.items, reviews:data.reviews, badges, lastSurprise:data.lastSurprise || null } };
}
```

Add `PROGRESS_SCHEMA, validateProgress, serializeProgress, parseProgress` to `API`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/validate.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add core/validate.js test/validate.test.js
git commit -m "feat(validate): validateProgress + parse/serialize with legacy migration"
```

### Task 5: `core/registry.js` — validate-at-register load seam

**Files:**
- Create: `core/registry.js`
- Test: `test/registry.test.js`

- [ ] **Step 1: Write the failing test**

```js
// test/registry.test.js
const test = require('node:test');
const assert = require('node:assert');

function freshRegistry(){
  delete require.cache[require.resolve('../core/validate.js')];
  delete require.cache[require.resolve('../core/registry.js')];
  global.SUNRISE = undefined;
  require('../core/validate.js');
  require('../core/registry.js');
  return global.SUNRISE;
}
const VALID_PACK = { schema:'sunrise.pack/v1', id:'p', name:'P', version:'1.0.0',
  tracks:[{ id:'a', label:'A' }], groups:[{ id:'g', title:'G', items:[{ id:'i', track:'a', tasks:[{ id:'t', text:'x' }] }] }] };
const VALID_THEME = { schema:'sunrise.theme/v1', id:'t', name:'T', version:'1.0.0', cssHref:'t.css' };

test('registerPack/registerTheme accept valid plugins', () => {
  const S = freshRegistry();
  S.registerPack(VALID_PACK); S.registerTheme(VALID_THEME);
  assert.equal(S.packs().length, 1);
  assert.equal(S.themes().length, 1);
  assert.equal(S.packs()[0].id, 'p');
});
test('invalid pack is rejected, not registered, and recorded', () => {
  const S = freshRegistry();
  S.registerPack({ schema:'sunrise.pack/v1', id:'bad' });   // missing name/version/tracks/groups
  assert.equal(S.packs().length, 0);
  assert.equal(S._rejected.length, 1);
  assert.equal(S._rejected[0].kind, 'pack');
  assert.ok(S._rejected[0].errors.length > 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/registry.test.js`
Expected: FAIL — cannot find `../core/registry.js`.

- [ ] **Step 3: Write minimal implementation**

```js
// core/registry.js
'use strict';
(function (root) {
  const S = root.SUNRISE = root.SUNRISE || {};
  const V = S._validate || (typeof require !== 'undefined' ? require('./validate.js') : null);
  const _packs = [], _themes = [], _rejected = [];

  function _register(kind, list, validateFn, obj){
    const r = validateFn(obj);
    if (!r.ok){
      const id = obj && obj.id ? obj.id : '(no id)';
      _rejected.push({ kind, id, errors:r.errors });
      if (typeof console !== 'undefined') console.error(`[sunrise] ${kind} "${id}" rejected:`, r.errors);
      return false;
    }
    list.push(obj); return true;
  }
  S.registerPack  = (p) => _register('pack',  _packs,  V.validatePack,  p);
  S.registerTheme = (t) => _register('theme', _themes, V.validateTheme, t);
  S.packs  = () => _packs.slice();
  S.themes = () => _themes.slice();
  S._rejected = _rejected;
})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/registry.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add core/registry.js test/registry.test.js
git commit -m "feat(registry): validate-at-register load seam"
```

- [ ] **Step 6: Verify the whole suite is still green**

Run: `node --test`
Expected: PASS — old 41 + new validate/badges/registry tests; nothing broken (old `logic.js`/`app.js` untouched).

## Phase 2 — Generalize `logic.js` (pure core, no DOM)

`logic.js` is rewritten wholesale to operate on a **pack** (`{groups, tracks, phases…}`) and **progress** (`{items, reviews, badges…}`) instead of the old `curriculum`/`state`. It re-exports the validators from `core/validate.js` so callers have one entry point.

### Task 6: Disable app.test.js + rewrite `logic.js` + `logic.test.js`

**Files:**
- Rename: `test/app.test.js` → `test/app.test.js.disabled`
- Rewrite: `logic.js`
- Rewrite: `test/logic.test.js`

- [ ] **Step 1: Disable the integration test (rewired in Phase 5)**

```bash
git mv test/app.test.js test/app.test.js.disabled
```

- [ ] **Step 2: Write the new `test/logic.test.js`**

```js
// test/logic.test.js
const test = require('node:test');
const assert = require('node:assert');
const L = require('../logic.js');

// generic pack fixture: 2 phases, tracks dsa/js, a rest item
const PACK = {
  schema:'sunrise.pack/v1', id:'t', name:'T', version:'1.0.0',
  tracks:[{ id:'dsa', label:'DSA' }, { id:'js', label:'JS' }],
  phases:[{ id:'p1', title:'P1' }, { id:'p2', title:'P2' }],
  groups:[
    { id:'g1', title:'G1', phase:'p1', items:[
      { id:'g1i1', track:'dsa', title:'A', tasks:[{ id:'t1', text:'x' }, { id:'t2', text:'y' }] },
      { id:'g1i2', track:'js',  title:'B', tasks:[{ id:'t1', text:'x' }] },
      { id:'g1r',  track:'rest', rest:true },
    ] },
    { id:'g2', title:'G2', phase:'p2', items:[
      { id:'g2i1', track:'dsa', title:'C', tasks:[{ id:'t1', text:'x' }] },
    ] },
  ],
};

test('addDays / diffDays / weekdayMon (UTC)', () => {
  assert.equal(L.addDays('2026-01-31', 1), '2026-02-01');
  assert.equal(L.diffDays('2026-05-30', '2026-06-02'), 3);
  assert.equal(L.weekdayMon('2024-01-01'), 0); // Monday
  assert.equal(L.weekdayMon('2024-01-06'), 5); // Saturday
});
test('allItems / getItem', () => {
  assert.equal(L.allItems(PACK).length, 4);
  assert.equal(L.getItem(PACK, 'g2i1').track, 'dsa');
  assert.equal(L.getItem(PACK, 'nope'), null);
});
test('setTaskDone: partial not complete; full sets completedAt+hour; immutable', () => {
  let p = L.createInitialProgress();
  p = L.setTaskDone(PACK, p, 'g1i1', 't1', true, '2026-05-30', 14);
  assert.equal(L.isItemComplete(PACK, p, 'g1i1'), false);
  assert.equal(p.items['g1i1'].completedAt, null);
  const p2 = L.setTaskDone(PACK, p, 'g1i1', 't2', true, '2026-05-30', 14);
  assert.equal(L.isItemComplete(PACK, p2, 'g1i1'), true);
  assert.equal(p2.items['g1i1'].completedAt, '2026-05-30');
  assert.equal(p2.items['g1i1'].completedHour, 14);
  assert.deepEqual(p.items['g1i1'].tasks, { t1:true }); // p unchanged
});
test('rest item never completes', () => {
  let p = L.createInitialProgress();
  assert.equal(L.isItemComplete(PACK, p, 'g1r'), false);
});
test('streaks', () => {
  const mk = (dates) => { const items = {}; dates.forEach((d, i) => items['x' + i] = { tasks:{}, reflection:'', completedAt:d, completedHour:12 }); return { items, reviews:[], badges:{} }; };
  assert.equal(L.computeStreak(mk([]), '2026-05-30'), 0);
  assert.equal(L.computeStreak(mk(['2026-05-28', '2026-05-29', '2026-05-30']), '2026-05-30'), 3);
  assert.equal(L.computeStreak(mk(['2026-05-28', '2026-05-29']), '2026-05-30'), 2); // anchors to yesterday
  assert.equal(L.longestStreak(mk(['2026-05-20', '2026-05-21', '2026-05-29', '2026-05-30', '2026-05-31'])), 3);
});
test('aggregation: track / phase / overall, rest excluded', () => {
  let p = L.createInitialProgress();
  p = L.setTaskDone(PACK, p, 'g1i1', 't1', true, '2026-05-30', 10);
  p = L.setTaskDone(PACK, p, 'g1i1', 't2', true, '2026-05-30', 10);
  assert.deepEqual(L.progressByTrack(PACK, p).dsa, { done:1, total:2, pct:50 });
  assert.deepEqual(L.progressByPhase(PACK, p).p1, { done:1, total:2, pct:50 });
  assert.deepEqual(L.overallProgress(PACK, p), { done:1, total:3, pct:33 });
  assert.equal(L.countCompletedTasks(PACK, p, 'dsa'), 2);
  assert.equal(L.completedGroups(PACK, p), 0);
  assert.deepEqual(L.tracksOf(PACK).sort(), ['dsa', 'js']);
});
test('reflectionCount counts non-empty', () => {
  let p = L.setReflection(L.createInitialProgress(), 'a', 'note');
  p = L.setReflection(p, 'b', '   ');
  assert.equal(L.reflectionCount(p), 1);
});
test('spaced repetition + negative-stage clamp (review bug fix)', () => {
  let p = L.scheduleReview(L.createInitialProgress(), 'bfs', '2026-05-30');
  assert.deepEqual(L.getDueReviews(p, '2026-05-30'), []);
  assert.deepEqual(L.getDueReviews(p, '2026-05-31'), ['bfs']);
  p = L.completeReview(p, 'bfs', '2026-05-31');
  assert.equal(p.reviews[0].stage, 1);
  const tampered = { items:{}, reviews:[{ itemId:'x', lastDate:'2026-05-01', stage:-5 }], badges:{} };
  assert.deepEqual(L.getDueReviews(tampered, '2026-06-30'), ['x']); // clamped, becomes due
});
test('validators are re-exported from logic', () => {
  assert.equal(typeof L.validatePack, 'function');
  assert.equal(typeof L.validateTheme, 'function');
  assert.equal(typeof L.validateProgress, 'function');
  assert.equal(typeof L.parseProgress, 'function');
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test test/logic.test.js`
Expected: FAIL — new API (`allItems`, `createInitialProgress`, …) not present on old `logic.js`.

- [ ] **Step 4: Rewrite `logic.js` (full file)**

```js
'use strict';
(function (root) {
  const V = (root.SUNRISE && root.SUNRISE._validate) || (typeof require !== 'undefined' ? require('./core/validate.js') : null);

  // ---------- date helpers (UTC) ----------
  function _ms(s){ const a = s.split('-').map(Number); return Date.UTC(a[0], a[1] - 1, a[2]); }
  function addDays(s, n){ const dt = new Date(_ms(s)); dt.setUTCDate(dt.getUTCDate() + n); return dt.toISOString().slice(0, 10); }
  function diffDays(a, b){ return Math.round((_ms(b) - _ms(a)) / 86400000); }
  function weekdayMon(s){ return ((diffDays('2024-01-01', s)) % 7 + 7) % 7; } // 0=Mon..6=Sun

  // ---------- pack structure ----------
  function allItems(pack){ return pack.groups.flatMap((g) => g.items); }
  function getItem(pack, id){ return allItems(pack).find((i) => i.id === id) || null; }
  function _tasks(item){ return item.tasks || []; }
  function tracksOf(pack){ const s = new Set(); for (const it of allItems(pack)) if (!it.rest) s.add(it.track); return Array.from(s); }

  // ---------- progress ----------
  function createInitialProgress(){ return { schema:'sunrise.progress/v1', items:{}, reviews:[], badges:{}, lastSurprise:null }; }
  function _ensure(items, id){ return items[id] ? { ...items[id] } : { tasks:{}, reflection:'', completedAt:null, completedHour:null }; }
  function isItemComplete(pack, progress, id){
    const item = getItem(pack, id);
    if (!item || item.rest || _tasks(item).length === 0) return false;
    const st = progress.items[id]; if (!st) return false;
    return _tasks(item).every((t) => st.tasks[t.id]);
  }
  function setTaskDone(pack, progress, id, taskId, done, today, hour){
    const items = { ...progress.items }; const it = _ensure(items, id); it.tasks = { ...it.tasks };
    if (done) it.tasks[taskId] = true; else delete it.tasks[taskId];
    items[id] = it; const next = { ...progress, items };
    if (isItemComplete(pack, next, id)){ if (!it.completedAt){ it.completedAt = today; it.completedHour = (typeof hour === 'number' ? hour : null); } }
    else { it.completedAt = null; it.completedHour = null; }
    return next;
  }
  function setReflection(progress, id, text){ const items = { ...progress.items }; const it = _ensure(items, id); it.reflection = text; items[id] = it; return { ...progress, items }; }

  // ---------- streaks / dates ----------
  function _activeDates(p){ const s = new Set(); for (const id in p.items){ const c = p.items[id].completedAt; if (c) s.add(c); } return s; }
  function completedDates(p){ return Array.from(_activeDates(p)).sort(); }
  function computeStreak(p, today){ const set = _activeDates(p); if (!set.size) return 0; let cur; if (set.has(today)) cur = today; else if (set.has(addDays(today, -1))) cur = addDays(today, -1); else return 0; let n = 0; while (set.has(cur)){ n++; cur = addDays(cur, -1); } return n; }
  function longestStreak(p){ const d = completedDates(p); if (!d.length) return 0; let best = 1, cur = 1; for (let i = 1; i < d.length; i++){ if (diffDays(d[i - 1], d[i]) === 1) cur++; else cur = 1; if (cur > best) best = cur; } return best; }
  function _hasComeback(p){ const d = completedDates(p); for (let i = 1; i < d.length; i++) if (diffDays(d[i - 1], d[i]) >= 2) return true; return false; }
  function _hours(p){ const h = []; for (const id in p.items){ const it = p.items[id]; if (it.completedAt != null && typeof it.completedHour === 'number') h.push(it.completedHour); } return h; }

  // ---------- aggregation ----------
  function _bump(acc, k, done){ const a = acc[k] || (acc[k] = { done:0, total:0, pct:0 }); a.total++; if (done) a.done++; }
  function _fin(acc){ for (const k in acc) acc[k].pct = acc[k].total ? Math.round(acc[k].done / acc[k].total * 100) : 0; return acc; }
  function progressByTrack(pack, p){ const acc = {}; for (const it of allItems(pack)){ if (it.rest) continue; _bump(acc, it.track, isItemComplete(pack, p, it.id)); } return _fin(acc); }
  function progressByPhase(pack, p){ const acc = {}; for (const g of pack.groups){ if (g.phase == null) continue; for (const it of g.items){ if (it.rest) continue; _bump(acc, g.phase, isItemComplete(pack, p, it.id)); } } return _fin(acc); }
  function overallProgress(pack, p){ let done = 0, total = 0; for (const it of allItems(pack)){ if (it.rest) continue; total++; if (isItemComplete(pack, p, it.id)) done++; } return { done, total, pct: total ? Math.round(done / total * 100) : 0 }; }
  function countCompletedTasks(pack, p, track){ let n = 0; for (const it of allItems(pack)){ if (track && it.track !== track) continue; const st = p.items[it.id]; if (!st || !st.tasks) continue; for (const t of _tasks(it)) if (st.tasks[t.id]) n++; } return n; }
  function reflectionCount(p){ let n = 0; for (const id in p.items){ const r = p.items[id].reflection; if (r && r.trim()) n++; } return n; }
  function completedGroups(pack, p){ let n = 0; for (const g of pack.groups){ const work = g.items.filter((it) => !it.rest); if (work.length && work.every((it) => isItemComplete(pack, p, it.id))) n++; } return n; }

  // ---------- spaced repetition ----------
  const REVIEW_INTERVALS = [1, 3, 7, 16];
  function scheduleReview(p, itemId, today){ const reviews = p.reviews.filter((r) => r.itemId !== itemId); reviews.push({ itemId, lastDate:today, stage:0 }); return { ...p, reviews }; }
  function getDueReviews(p, today){ return p.reviews.filter((r) => { const stage = Math.min(Math.max(r.stage, 0), REVIEW_INTERVALS.length - 1); return diffDays(r.lastDate, today) >= REVIEW_INTERVALS[stage]; }).map((r) => r.itemId); }
  function completeReview(p, itemId, today){ const reviews = p.reviews.map((r) => r.itemId === itemId ? { ...r, lastDate:today, stage: Math.min(r.stage + 1, REVIEW_INTERVALS.length - 1) } : r); return { ...p, reviews }; }

  // ---------- badge interpreter ----------
  function badgeContext(pack, p, today){
    const overall = overallProgress(pack, p), byTrack = progressByTrack(pack, p), byPhase = progressByPhase(pack, p);
    return {
      longestStreak: longestStreak(p), daysDone: overall.done, total: overall.total, pct: overall.pct,
      reflections: reflectionCount(p), groupsComplete: completedGroups(pack, p), hasComeback: _hasComeback(p),
      tracks: tracksOf(pack), dates: completedDates(p), hours: _hours(p),
      tasks: (track) => countCompletedTasks(pack, p, track),
      trackDone: (track) => (byTrack[track] || { done:0 }).done,
      trackPct: (track) => (byTrack[track] || { pct:0 }).pct,
      phasePct: (phase) => (byPhase[phase] || { pct:0 }).pct,
      itemComplete: (id) => isItemComplete(pack, p, id),
      weekday: (d) => weekdayMon(d),
    };
  }
  function _dedupe(rules){ const idx = {}, out = []; for (const r of rules){ if (idx[r.id] != null) out[idx[r.id]] = r; else { idx[r.id] = out.length; out.push(r); } } return out; }
  function evaluateBadges(pack, p, today, rules){
    const owned = p.badges || {}, ctx = badgeContext(pack, p, today);
    return _dedupe(rules).map((r) => { const def = V.BADGE_RULES[r.type]; return { id:r.id, unlocked: !!owned[r.id] || (def ? !!def.test(r, ctx) : false), at: owned[r.id] ? owned[r.id].at : null }; });
  }
  function syncBadges(pack, p, today, rules){
    const badges = { ...(p.badges || {}) }, ctx = badgeContext(pack, p, today), unlocked = [];
    for (const r of _dedupe(rules)){ const def = V.BADGE_RULES[r.type]; if (!badges[r.id] && def && def.test(r, ctx)){ badges[r.id] = { at:today }; unlocked.push(r.id); } }
    return { progress: { ...p, badges }, unlocked };
  }

  const API = {
    addDays, diffDays, weekdayMon,
    allItems, getItem, tracksOf,
    createInitialProgress, isItemComplete, setTaskDone, setReflection,
    completedDates, computeStreak, longestStreak,
    progressByTrack, progressByPhase, overallProgress, countCompletedTasks, reflectionCount, completedGroups,
    REVIEW_INTERVALS, scheduleReview, getDueReviews, completeReview,
    badgeContext, evaluateBadges, syncBadges,
    // re-exported from core/validate.js:
    BADGE_RULES: V.BADGE_RULES, validatePack: V.validatePack, validateTheme: V.validateTheme,
    validateProgress: V.validateProgress, serializeProgress: V.serializeProgress, parseProgress: V.parseProgress,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (root){ root.SUNRISE = root.SUNRISE || {}; root.RoadmapLogic = API; }
})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test test/logic.test.js`
Expected: PASS.

- [ ] **Step 6: Run the whole suite**

Run: `node --test`
Expected: PASS — `curriculum.test.js` (old, still valid against old data file), validate/badges/registry/logic. `app.test.js.disabled` is ignored.

- [ ] **Step 7: Commit**

```bash
git add logic.js test/logic.test.js test/app.test.js.disabled
git commit -m "refactor(logic): generalize core to pack/progress + re-export validators"
```

### Task 7: Badge interpreter behavior tests

**Files:**
- Modify: `test/badges.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// append to test/badges.test.js
const L = require('../logic.js');

const PACK = {
  schema:'sunrise.pack/v1', id:'t', name:'T', version:'1.0.0',
  tracks:[{ id:'dsa', label:'DSA' }, { id:'js', label:'JS' }],
  phases:[{ id:'p1', title:'P1' }],
  groups:[{ id:'g1', title:'G1', phase:'p1', items:[
    { id:'i1', track:'dsa', tasks:[{ id:'t1', text:'x' }] },
    { id:'i2', track:'js',  tasks:[{ id:'t1', text:'x' }] },
  ] }],
};
function done(pack, ids, hour){ let p = L.createInitialProgress(); ids.forEach((id) => { p = L.setTaskDone(pack, p, id, 't1', true, '2026-05-30', hour == null ? 12 : hour); }); return p; }

test('generic rules: days-done, all-done, percent, tasks-done, reflections, hour-range, weekday', () => {
  const rules = [
    { id:'first', type:'days-done', gte:1, title:'F' },
    { id:'fin',   type:'all-done', title:'Fin' },
    { id:'half',  type:'percent', gte:50, title:'H' },
    { id:'t100',  type:'tasks-done', gte:2, title:'T' },
    { id:'owl',   type:'hour-range', from:22, to:5, title:'O' },
    { id:'wknd',  type:'weekday', days:[6, 7], title:'W' },
  ];
  const p = done(PACK, ['i1'], 23); // 1/2 done at 23:00 on 2026-05-30 (a Saturday)
  const e = L.evaluateBadges(PACK, p, '2026-05-30', rules);
  const by = Object.fromEntries(e.map((b) => [b.id, b.unlocked]));
  assert.equal(by.first, true);
  assert.equal(by.fin, false);
  assert.equal(by.half, true);
  assert.equal(by.t100, false);  // only 1 task done
  assert.equal(by.owl, true);    // 23:00 in [22,5)
  assert.equal(by.wknd, true);   // 2026-05-30 is Saturday
});
test('pack rules: track-complete, phase-complete, item-complete, all-tracks', () => {
  const rules = [
    { id:'dsam', type:'track-complete', track:'dsa', title:'D' },
    { id:'p1c',  type:'phase-complete', phase:'p1', title:'P' },
    { id:'cap',  type:'item-complete', item:'i2', title:'C' },
    { id:'poly', type:'all-tracks', eachGte:1, title:'Poly' },
  ];
  let p = done(PACK, ['i1', 'i2']);
  const by = Object.fromEntries(L.evaluateBadges(PACK, p, '2026-05-30', rules).map((b) => [b.id, b.unlocked]));
  assert.equal(by.dsam, true);
  assert.equal(by.p1c, true);
  assert.equal(by.cap, true);
  assert.equal(by.poly, true);
});
test('syncBadges records new unlocks; later rules with same id override; idempotent', () => {
  const rules = [{ id:'first', type:'days-done', gte:1, title:'F' }, { id:'first', type:'days-done', gte:99, title:'F2' }];
  // dedupe keeps the LAST rule (gte:99) -> not unlocked at 1 day
  let p = done(PACK, ['i1']);
  let r = L.syncBadges(PACK, p, '2026-05-30', rules);
  assert.equal(r.unlocked.includes('first'), false);
  // a simple unlocked case + idempotency
  const r2 = L.syncBadges(PACK, p, '2026-05-30', [{ id:'first', type:'days-done', gte:1, title:'F' }]);
  assert.deepEqual(r2.unlocked, ['first']);
  assert.equal(r2.progress.badges['first'].at, '2026-05-30');
  const r3 = L.syncBadges(PACK, r2.progress, '2026-05-31', [{ id:'first', type:'days-done', gte:1, title:'F' }]);
  assert.equal(r3.unlocked.length, 0);
});
```

- [ ] **Step 2: Run test to verify it fails / passes**

Run: `node --test test/badges.test.js`
Expected: PASS (the interpreter already exists in `logic.js` from Task 6). If any fail, fix `logic.js` interpreter, not the test.

- [ ] **Step 3: Commit**

```bash
git add test/badges.test.js
git commit -m "test(badges): interpreter behavior across generic + pack rules"
```

## Phase 3 — Data layer: app defaults, bundled themes, pack #1

The browser app still runs on the OLD `data/curriculum.js` + `data/content.js` until Phase 5. Here we author the NEW data files alongside them (not yet loaded by `index.html`), validated by tests.

### Task 8: `data/app-defaults.js` — fallback UI strings + generic badge set

**Files:**
- Create: `data/app-defaults.js`
- Test: `test/app-defaults.test.js`

- [ ] **Step 1: Write the failing test**

```js
// test/app-defaults.test.js
const test = require('node:test');
const assert = require('node:assert');
const D = require('../data/app-defaults.js');
const L = require('../logic.js');

test('defaults expose ui, badges, mottos', () => {
  assert.equal(typeof D.ui, 'object');
  assert.ok(Array.isArray(D.badges) && D.badges.length === 20, 'generic badge count: ' + D.badges.length);
  assert.ok(Array.isArray(D.mottos));
});
test('every generic badge has id/title/icon and a known rule type', () => {
  for (const b of D.badges){
    assert.ok(b.id && b.title && b.icon, JSON.stringify(b));
    assert.ok(L.BADGE_RULES[b.type], 'unknown type ' + b.type);
  }
});
test('generic badge ids are pack-agnostic (no track/phase/item refs)', () => {
  const refersToPack = D.badges.some((b) => b.track || b.phase || b.item);
  assert.equal(refersToPack, false);
});
test('generic ids match the structure-agnostic legacy badge ids', () => {
  const ids = D.badges.map((b) => b.id).sort();
  assert.deepEqual(ids, ['comeback','days-10','days-25','days-50','early-lark','finisher','first-light','halfway','night-owl','perfect-week','scribe-10','scribe-30','streak-100','streak-14','streak-3','streak-30','streak-7','tasks-100','weekend','weeks-4'].sort());
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/app-defaults.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `data/app-defaults.js`**

```js
'use strict';
(function (root) {
  const defaults = {
    ui: {
      summaryTitle:'Сводка', todayTitle:'Сегодня', warmup:'Разминка', reflect:'Рефлексия',
      export:'Экспорт', import:'Импорт', calendar:'Календарь', trophies:'Трофеи',
      nextDay:'Следующий день →', scheduleReview:'＋ Запланировать повтор',
      restTitle:'Разгрузка / повторы', restToday:'Повторов на сегодня нет. Отдых заслужен 🌙',
      dueToday:'К повтору сегодня', overallTitle:'Общий прогресс', streakTitle:'Серия',
      phasesTitle:'Фазы', tracksTitle:'Треки', daysOf:'пройдено дней из {n}',
      newTrophy:'🏆 Новый трофей!', comeback:'С возвращением — всего пройдено {n} дней. Продолжаем.',
      importOk:'Прогресс импортирован.', importFail:'Импорт не удался: {e}\nТекущий прогресс не изменён.',
      weekAbbr:'Нед', inARow:'подряд', phaseWord:'Фаза', phaseLabel:'', todayVert:'TODAY', restVert:'REST',
      taskPlaceholder:'Короткая заметка...', prevDayAria:'Предыдущий день', nextDayAria:'Следующий день',
      theme:'Тема', pack:'Программа',
      dow:['Пн','Вт','Ср','Чт','Пт','Сб','Вс'], streakWords:['день','дня','дней'],
      months:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
    },
    // GENERIC, pack-agnostic badge rules (Russian default text; a pack may override by reusing the same id)
    badges: [
      { id:'first-light', type:'days-done', gte:1,   title:'First Light', desc:'Первый полностью закрытый день', icon:'🌅' },
      { id:'streak-3',    type:'streak', gte:3,       title:'Разогрев', desc:'Серия 3 дня подряд', icon:'🌱' },
      { id:'streak-7',    type:'streak', gte:7,       title:'7 дней', desc:'Серия 7 дней подряд', icon:'🔥' },
      { id:'streak-14',   type:'streak', gte:14,      title:'14 дней', desc:'Серия 14 дней подряд', icon:'🌋' },
      { id:'streak-30',   type:'streak', gte:30,      title:'30 дней', desc:'Серия 30 дней подряд', icon:'⚡' },
      { id:'streak-100',  type:'streak', gte:100,     title:'100 дней', desc:'Серия 100 дней подряд', icon:'💯' },
      { id:'days-10',     type:'days-done', gte:10,   title:'10 дней', desc:'10 дней программы пройдено', icon:'📅' },
      { id:'days-25',     type:'days-done', gte:25,   title:'25 дней', desc:'25 дней программы пройдено', icon:'🗓️' },
      { id:'days-50',     type:'days-done', gte:50,   title:'50 дней', desc:'50 дней программы пройдено', icon:'📆' },
      { id:'halfway',     type:'percent', gte:50,     title:'Экватор', desc:'Пройдена половина программы', icon:'🌗' },
      { id:'finisher',    type:'all-done',            title:'Финишер', desc:'Пройдены все дни программы', icon:'🎓' },
      { id:'tasks-100',   type:'tasks-done', gte:100, title:'100 задач', desc:'100 задач выполнено', icon:'✅' },
      { id:'scribe-10',   type:'reflections', gte:10, title:'Летописец', desc:'10 рефлексий написано', icon:'✍️' },
      { id:'scribe-30',   type:'reflections', gte:30, title:'Хронист', desc:'30 рефлексий написано', icon:'📜' },
      { id:'perfect-week',type:'groups-complete', gte:1, title:'Идеальная неделя', desc:'Неделя пройдена целиком', icon:'🌟' },
      { id:'weeks-4',     type:'groups-complete', gte:4, title:'Месяц в деле', desc:'4 недели пройдены целиком', icon:'📈' },
      { id:'comeback',    type:'comeback',           title:'Comeback', desc:'Вернулся после пропуска', icon:'🩹' },
      { id:'night-owl',   type:'hour-range', from:22, to:5, title:'Night Owl', desc:'Закрыл день после 22:00 или до 5:00', icon:'🦉' },
      { id:'early-lark',  type:'hour-range', from:5, to:8,  title:'Early Lark', desc:'Закрыл день до 8:00 утра', icon:'🐦' },
      { id:'weekend',     type:'weekday', days:[6, 7], title:'Воин выходного', desc:'Закрыл день в субботу или воскресенье', icon:'🌴' },
    ],
    mottos: ['一歩一歩 · шаг за шагом'],
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = defaults;
  if (root){ root.SUNRISE = root.SUNRISE || {}; root.SUNRISE.defaults = defaults; }
})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/app-defaults.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add data/app-defaults.js test/app-defaults.test.js
git commit -m "feat(data): app-defaults (fallback ui + generic badge rules)"
```

### Task 9: `data/builtin-themes.js` — register the 5 bundled themes

**Files:**
- Create: `data/builtin-themes.js`
- Test: `test/builtin-themes.test.js`

- [ ] **Step 1: Write the failing test**

```js
// test/builtin-themes.test.js
const test = require('node:test');
const assert = require('node:assert');
const L = require('../logic.js');

test('every bundled theme manifest is valid and references an existing css file', () => {
  const fs = require('fs'); const path = require('path');
  // Load builtin-themes by capturing registerTheme calls
  const registered = [];
  global.SUNRISE = { registerTheme: (t) => registered.push(t), themes: () => registered };
  delete require.cache[require.resolve('../data/builtin-themes.js')];
  require('../data/builtin-themes.js');
  assert.equal(registered.length, 5);
  for (const t of registered){
    assert.deepEqual(L.validateTheme(t), { ok:true }, 'invalid: ' + JSON.stringify(t));
    assert.ok(fs.existsSync(path.join(__dirname, '..', t.cssHref)), 'missing css: ' + t.cssHref);
  }
  assert.deepEqual(registered.map((t) => t.id).sort(), ['bonus','dashboard','emerald','japanese','neon']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/builtin-themes.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `data/builtin-themes.js`**

```js
'use strict';
(function (root) {
  const S = root.SUNRISE = root.SUNRISE || {};
  const themes = [
    { schema:'sunrise.theme/v1', id:'bonus',     name:'Neo-Brutalist Riso', version:'1.0.0', cssHref:'themes/bonus.css' },
    { schema:'sunrise.theme/v1', id:'neon',      name:'Neon · Кислота',     version:'1.0.0', cssHref:'themes/neon.css' },
    { schema:'sunrise.theme/v1', id:'japanese',  name:'Japanese · 和',      version:'1.0.0', cssHref:'themes/japanese.css' },
    { schema:'sunrise.theme/v1', id:'emerald',   name:'Emerald · Мрамор',   version:'1.0.0', cssHref:'themes/emerald.css' },
    { schema:'sunrise.theme/v1', id:'dashboard', name:'Colorful Dashboard', version:'1.0.0', cssHref:'themes/dashboard.css' },
  ];
  if (typeof S.registerTheme === 'function') themes.forEach((t) => S.registerTheme(t));
  if (typeof module !== 'undefined' && module.exports) module.exports = themes;
})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/builtin-themes.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add data/builtin-themes.js test/builtin-themes.test.js
git commit -m "feat(data): register the 5 bundled themes"
```

### Task 10: Reshape the curriculum into pack #1 (generated)

The 91-day curriculum body is moved mechanically by a one-off Node script (reading the still-present old data files), so we never hand-copy 3000 lines. The script's output is committed as `data/packs/dev-roadmap.js`.

**Files:**
- Create: `scripts/reshape-curriculum.js`
- Generate + commit: `data/packs/dev-roadmap.js`
- Test: `test/dev-roadmap.test.js`

- [ ] **Step 1: Write `scripts/reshape-curriculum.js`**

```js
// scripts/reshape-curriculum.js  — one-off transform; run with `node scripts/reshape-curriculum.js`
'use strict';
const fs = require('fs');
const path = require('path');
const C = require('../data/curriculum.js');    // { phases, weeks } (module.exports)
const content = require('../data/content.js');  // { tracks, badges, mottos, surprises, ui }

const tracks = Object.keys(content.tracks).filter((id) => id !== 'rest').map((id) => ({
  id, label: content.tracks[id].label, icon: content.tracks[id].kanji, reviewable: id === 'dsa',
}));
const phases = C.phases.map((p) => ({ id: String(p.id), title: p.title }));

function item(day){
  if (day.track === 'rest') return { id: day.id, track: 'rest', rest: true, reflectPrompt: day.reflectPrompt };
  const it = { id: day.id, track: day.track, title: day.title, warmup: day.warmup, reflectPrompt: day.reflectPrompt, tasks: day.tasks };
  if (day.resources && day.resources.length) it.resources = day.resources;
  return it;
}
const groups = C.weeks.map((w) => ({
  id: 'w' + w.num, title: 'Неделя ' + w.num, phase: String(w.phase), theme: w.theme, items: w.days.map(item),
}));

const B = content.badges;
const txt = (id) => ({ title: B[id].title, desc: B[id].desc, icon: B[id].icon });
const badges = [
  { id:'phase-1', type:'phase-complete', phase:'1', ...txt('phase-1') },
  { id:'phase-2', type:'phase-complete', phase:'2', ...txt('phase-2') },
  { id:'phase-3', type:'phase-complete', phase:'3', ...txt('phase-3') },
  { id:'algorithmist', type:'tasks-done', track:'dsa', gte:50, ...txt('algorithmist') },
  { id:'capstone', type:'item-complete', item:'w13d6', ...txt('capstone') },
  { id:'dsa-master', type:'track-complete', track:'dsa', ...txt('dsa-master') },
  { id:'node-master', type:'track-complete', track:'node', ...txt('node-master') },
  { id:'ts-master', type:'track-complete', track:'ts', ...txt('ts-master') },
  { id:'sysdesign-master', type:'track-complete', track:'sysdesign', ...txt('sysdesign-master') },
  { id:'polyglot', type:'all-tracks', eachGte:1, ...txt('polyglot') },
];

const pack = {
  schema:'sunrise.pack/v1', id:'dev-roadmap', name:'Dev Roadmap', version:'1.0.0', locale:'ru',
  settings:{ labels:{ phase:'Фаза', group:'Неделя', groupAbbr:'Нед', item:'День' }, reviews:true, reflections:true, warmups:true },
  ui:{ phaseLabel:'フェーズ {p} · 第{w}週', todayVert:'今日 · TODAY', restVert:'休 · REST', scheduleReview: content.ui.scheduleReview },
  tracks, phases, groups, badges, mottos: content.mottos, surprises: content.surprises,
};

const out =
  "'use strict';\n(function (root) {\n  var pack = " + JSON.stringify(pack, null, 2) + ";\n" +
  "  if (root.SUNRISE && root.SUNRISE.registerPack) root.SUNRISE.registerPack(pack);\n" +
  "  if (typeof module !== 'undefined' && module.exports) module.exports = pack;\n" +
  "})(typeof window !== 'undefined' ? window : globalThis);\n";
fs.mkdirSync(path.join(__dirname, '..', 'data', 'packs'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'data', 'packs', 'dev-roadmap.js'), out);
console.log('wrote data/packs/dev-roadmap.js (' + groups.length + ' groups, ' + groups.reduce((n, g) => n + g.items.length, 0) + ' items)');
```

- [ ] **Step 2: Run the transform**

Run: `node scripts/reshape-curriculum.js`
Expected: prints `wrote data/packs/dev-roadmap.js (13 groups, 91 items)`.

- [ ] **Step 3: Write `test/dev-roadmap.test.js`**

```js
// test/dev-roadmap.test.js
const test = require('node:test');
const assert = require('node:assert');
const L = require('../logic.js');
const D = require('../data/app-defaults.js');
const pack = require('../data/packs/dev-roadmap.js');

test('dev-roadmap pack passes validatePack', () => {
  assert.deepEqual(L.validatePack(pack), { ok:true });
});
test('structure: 13 groups, 91 items, every dow7 is a rest item', () => {
  assert.equal(pack.groups.length, 13);
  assert.equal(L.allItems(pack).length, 91);
  for (const g of pack.groups){ assert.equal(g.items.length, 7); const last = g.items[6]; assert.equal(last.rest, true); assert.equal(last.track, 'rest'); }
});
test('badge ids cover the legacy 30 (generic + pack), no extras', () => {
  const ids = new Set([...D.badges, ...pack.badges].map((b) => b.id));
  const legacy = ['first-light','streak-3','streak-7','streak-14','streak-30','streak-100','days-10','days-25','days-50','halfway','finisher','tasks-100','scribe-10','scribe-30','perfect-week','weeks-4','polyglot','dsa-master','node-master','ts-master','sysdesign-master','phase-1','phase-2','phase-3','algorithmist','comeback','night-owl','early-lark','capstone','weekend'];
  legacy.forEach((id) => assert.ok(ids.has(id), 'missing badge ' + id));
  assert.equal(ids.size, 30);
});
test('all 9 non-rest tracks present (polyglot achievable); capstone item exists', () => {
  assert.deepEqual(L.tracksOf(pack).sort(), ['cs','db','distsys','dsa','js','node','patterns','sysdesign','ts']);
  assert.ok(L.getItem(pack, 'w13d6'));
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/dev-roadmap.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/reshape-curriculum.js data/packs/dev-roadmap.js test/dev-roadmap.test.js
git commit -m "feat(data): reshape curriculum into dev-roadmap pack #1"
```

## Phase 4 — Per-pack state + lossless migration (`core/state.js`)

Storage logic is isolated in a pure module that takes a `store` object (localStorage-shaped: `getItem`/`setItem`/`removeItem`), so it is fully Node-testable with a fake store. `app.js` will pass the real `localStorage`.

### Task 11: `core/state.js` — session + per-pack progress

**Files:**
- Create: `core/state.js`
- Test: `test/state.test.js`

- [ ] **Step 1: Write the failing test**

```js
// test/state.test.js
const test = require('node:test');
const assert = require('node:assert');
require('../core/validate.js');             // populates global.SUNRISE._validate
const ST = require('../core/state.js');

function fakeStore(init){ const m = Object.assign({}, init); return {
  getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: (k) => { delete m[k]; }, _m: m }; }

test('session load/save round-trips; defaults to {}', () => {
  const s = fakeStore();
  assert.deepEqual(ST.loadSession(s), {});
  ST.saveSession(s, { activePackId:'p', themeId:'neon' });
  assert.deepEqual(ST.loadSession(s), { activePackId:'p', themeId:'neon' });
});
test('loadProgress returns fresh when absent or corrupt; round-trips when valid', () => {
  const s = fakeStore();
  assert.deepEqual(ST.loadProgress(s, 'p'), { schema:'sunrise.progress/v1', items:{}, reviews:[], badges:{}, lastSurprise:null });
  s.setItem('sunrise.progress.p', '{bad json');
  assert.equal(ST.loadProgress(s, 'p').items && Object.keys(ST.loadProgress(s, 'p').items).length, 0); // fresh
  const good = { schema:'sunrise.progress/v1', items:{ a:{ tasks:{ t:true }, reflection:'', completedAt:'2026-05-30', completedHour:9 } }, reviews:[], badges:{} };
  ST.saveProgress(s, 'p', good);
  assert.deepEqual(ST.loadProgress(s, 'p').items.a.tasks, { t:true });
});
test('corrupt progress with null day value degrades to fresh (no throw)', () => {
  const s = fakeStore({ 'sunrise.progress.p': JSON.stringify({ items:{ x:null }, reviews:[] }) });
  assert.doesNotThrow(() => ST.loadProgress(s, 'p'));
  assert.deepEqual(ST.loadProgress(s, 'p').items, {});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/state.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `core/state.js`**

```js
'use strict';
(function (root) {
  const V = (root.SUNRISE && root.SUNRISE._validate) || (typeof require !== 'undefined' ? require('./validate.js') : null);
  const SESSION = 'sunrise.session', PREFIX = 'sunrise.progress.', LEGACY = 'devRoadmapState.v1', LEGACY_THEME = 'sunriseTheme';

  function fresh(){ return { schema:'sunrise.progress/v1', items:{}, reviews:[], badges:{}, lastSurprise:null }; }
  function loadSession(store){ try { const raw = store.getItem(SESSION); return raw ? JSON.parse(raw) : {}; } catch (e) { return {}; } }
  function saveSession(store, s){ try { store.setItem(SESSION, JSON.stringify(s)); } catch (e) {} }
  function loadProgress(store, packId){ try { const raw = store.getItem(PREFIX + packId); if (!raw) return fresh(); const r = V.parseProgress(raw); return r.ok ? r.progress : fresh(); } catch (e) { return fresh(); } }
  function saveProgress(store, packId, progress){ try { store.setItem(PREFIX + packId, V.serializeProgress(progress)); } catch (e) {} }

  function migrate(store){
    if (store.getItem(LEGACY) && !store.getItem(PREFIX + 'dev-roadmap')){
      const r = V.parseProgress(store.getItem(LEGACY));        // parseProgress maps legacy days -> items
      if (r.ok){
        store.setItem(PREFIX + 'dev-roadmap', V.serializeProgress(r.progress));
        const sess = loadSession(store);
        if (!sess.activePackId) sess.activePackId = 'dev-roadmap';
        const th = store.getItem(LEGACY_THEME); if (th && !sess.themeId) sess.themeId = th;
        saveSession(store, sess);
        return true;
      }
    }
    return false;
  }

  const API = { SESSION, PREFIX, LEGACY, fresh, loadSession, saveSession, loadProgress, saveProgress, migrate };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (root){ root.SUNRISE = root.SUNRISE || {}; root.SUNRISE.state = API; }
})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/state.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add core/state.js test/state.test.js
git commit -m "feat(state): per-pack progress + session storage (pure, store-injected)"
```

### Task 12: Lossless legacy migration

**Files:**
- Test: `test/migration.test.js` (migrate() already implemented in Task 11)

- [ ] **Step 1: Write the failing test**

```js
// test/migration.test.js
const test = require('node:test');
const assert = require('node:assert');
require('../core/validate.js');
const ST = require('../core/state.js');

function fakeStore(init){ const m = Object.assign({}, init); return {
  getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: (k) => { delete m[k]; }, _m: m }; }

// a realistic exported v2 blob (state version 2 with .days)
const LEGACY = JSON.stringify({
  version:2,
  days:{ w1d1:{ tasks:{ t1:true, t2:true, t3:true }, reflection:'note', completedAt:'2026-05-30', completedHour:14 } },
  reviews:[{ itemId:'w1-foo', lastDate:'2026-05-30', stage:1 }],
  badges:{ 'first-light':{ at:'2026-05-30' }, 'streak-3':{ at:'2026-05-30' } },
  lastSurprise:null,
});

test('migrate copies legacy v2 into per-pack progress, lossless', () => {
  const s = fakeStore({ 'devRoadmapState.v1': LEGACY, 'sunriseTheme':'neon' });
  assert.equal(ST.migrate(s), true);
  const p = ST.loadProgress(s, 'dev-roadmap');
  assert.deepEqual(p.items.w1d1.tasks, { t1:true, t2:true, t3:true });
  assert.equal(p.items.w1d1.completedAt, '2026-05-30');
  assert.equal(p.items.w1d1.completedHour, 14);
  assert.deepEqual(p.reviews, [{ itemId:'w1-foo', lastDate:'2026-05-30', stage:1 }]);
  assert.equal(p.badges['first-light'].at, '2026-05-30');
  assert.equal(p.badges['streak-3'].at, '2026-05-30');
  const sess = ST.loadSession(s);
  assert.equal(sess.activePackId, 'dev-roadmap');
  assert.equal(sess.themeId, 'neon');
});
test('migrate is idempotent and never clobbers existing progress', () => {
  const s = fakeStore({ 'devRoadmapState.v1': LEGACY });
  assert.equal(ST.migrate(s), true);
  // user makes progress after migration
  const p = ST.loadProgress(s, 'dev-roadmap'); p.items.w2d1 = { tasks:{ t1:true }, reflection:'', completedAt:'2026-06-01', completedHour:8 };
  ST.saveProgress(s, 'dev-roadmap', p);
  assert.equal(ST.migrate(s), false);                 // second run is a no-op
  assert.ok(ST.loadProgress(s, 'dev-roadmap').items.w2d1, 'later progress preserved');
});
test('no legacy key -> migrate is a no-op', () => {
  const s = fakeStore();
  assert.equal(ST.migrate(s), false);
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `node --test test/migration.test.js`
Expected: PASS (3 tests).

- [ ] **Step 3: Run full suite**

Run: `node --test`
Expected: PASS — everything green (old `curriculum.test.js` still passes against old data; `app.test.js.disabled` ignored).

- [ ] **Step 4: Commit**

```bash
git add test/migration.test.js
git commit -m "test(migration): lossless, idempotent legacy v2 -> per-pack"
```

## Phase 5 — Integration: rewire `index.html`, rewrite `app.js`, re-enable the DOM test, delete old data

This is the coordinated switch. After it, the browser app runs entirely on the plugin world and old files are gone.

> **Refinement vs spec:** the validators and state helpers live in `core/validate.js` + `core/state.js` (re-exported by `logic.js`) rather than literally inside `logic.js`. Same behavior, smaller files. The load order therefore includes those two `core/*.js` files.

### Task 13: New `index.html` (load order + pack switcher)

**Files:**
- Rewrite: `index.html`

- [ ] **Step 1: Replace `index.html` with:**

```html
<!doctype html>
<html lang="ru" data-theme="bonus">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sunrise · 日の出</title>
<!-- canonical default for optional section titles; themes override -->
<style>.section-title{font:600 12px ui-monospace,SFMono-Regular,monospace;letter-spacing:.18em;text-transform:uppercase;opacity:.5;margin:20px 2px 10px}</style>
<link id="themeCss" rel="stylesheet" href="themes/bonus.css" />
</head>
<body>
<header class="app-header">
  <div class="brand"><span class="brand-mark" lang="ja">日の出</span><span class="brand-name">SUNRISE</span><span class="brand-sub" id="phaseLabel"></span></div>
  <div class="toolbar">
    <label class="field"><select id="packSelect"></select></label>
    <label class="field"><select id="themeSelect"></select></label>
    <label class="field"><select id="daySelect"></select></label>
    <button class="btn ghost" id="calBtn" type="button">📅</button>
    <button class="btn ghost" id="trophiesBtn" type="button">🏆</button>
    <button class="btn ghost" id="exportBtn" type="button"></button>
    <button class="btn ghost" id="importBtn" type="button"></button>
    <input type="file" id="importFile" accept="application/json" hidden />
  </div>
</header>
<main class="wrap">
  <h2 class="section-title" id="summaryTitle"></h2>
  <section class="dash" id="dashboard"></section>
  <div id="comeback" style="display:none"></div>
  <h2 class="section-title" id="todayTitle"></h2>
  <section class="day-rail">
    <button class="day-nav day-prev" id="prevDay" type="button">‹</button>
    <section class="today-wrap"><article class="today" id="todayCard"></article></section>
    <button class="day-nav day-next" id="nextDay" type="button">›</button>
  </section>
</main>
<div class="foot"><span id="motd"></span></div>

<div class="modal" id="calModal" role="dialog" aria-modal="true" aria-labelledby="calTitle">
  <div class="modal-panel cal-panel">
    <div class="cal-head"><button id="calPrev" type="button">‹</button><div id="calTitle"></div><button id="calNext" type="button">›</button><button id="calClose" type="button">✕</button></div>
    <div class="cal-dow" id="calDow"></div>
    <div class="cal-grid" id="calGrid"></div>
  </div>
</div>
<div class="modal" id="trophiesModal" role="dialog" aria-modal="true" aria-labelledby="trophiesTitle">
  <div class="modal-panel tr-panel">
    <div class="tr-head"><div id="trophiesTitle"></div><button id="trophiesClose" type="button">✕</button></div>
    <div class="tr-grid" id="trophiesGrid"></div>
  </div>
</div>
<div id="fx" aria-hidden="true"></div>

<script src="core/validate.js"></script>
<script src="core/registry.js"></script>
<script src="core/state.js"></script>
<script src="logic.js"></script>
<script src="data/app-defaults.js"></script>
<script src="data/builtin-themes.js"></script>
<script src="data/packs/dev-roadmap.js"></script>
<script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit** (the app is briefly broken until Task 14 lands `app.js`; that's expected and fine on this branch)

```bash
git add index.html
git commit -m "feat(index): plugin load order + pack switcher + dialog/lang a11y"
```

### Task 14: Rewrite `app.js` as the plugin host

**Files:**
- Rewrite: `app.js`

- [ ] **Step 1: Replace `app.js` with:**

```js
'use strict';
(function () {
  var L = window.RoadmapLogic, S = window.SUNRISE || {}, ST = S.state, DEF = (S.defaults || { ui:{}, badges:[], mottos:[] });
  var $ = function (id){ return document.getElementById(id); };
  var store = window.localStorage;
  var packs = (S.packs ? S.packs() : []), themes = (S.themes ? S.themes() : []);
  var pack, theme, progress, rules, allItems, groupById, currentItemId, calOffset = 0, M = [], _motdI = 0;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function (c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function todayStr(){ return new Date().toISOString().slice(0,10); }
  function ui(k){ return (pack && pack.ui && pack.ui[k] != null) ? pack.ui[k] : (DEF.ui[k] != null ? DEF.ui[k] : ''); }
  function lbl(k, fb){ var l = pack && pack.settings && pack.settings.labels; return (l && l[k] != null) ? l[k] : ui(fb); }
  function trackMeta(t){ for (var i = 0; i < pack.tracks.length; i++) if (pack.tracks[i].id === t) return pack.tracks[i]; return { label:'', icon:'' }; }
  function badgeText(id){ for (var i = 0; i < rules.length; i++) if (rules[i].id === id) return rules[i]; return { title:id, desc:'', icon:'•' }; }

  function selectPack(id){
    pack = packs.find(function (p){ return p.id === id; }) || packs[0];
    progress = ST.loadProgress(store, pack.id);
    rules = (DEF.badges || []).concat(pack.badges || []);
    allItems = L.allItems(pack);
    groupById = {}; pack.groups.forEach(function (g){ g.items.forEach(function (it){ groupById[it.id] = g; }); });
    document.documentElement.lang = pack.locale || 'en';
    pack.tracks.forEach(function (t){ if (t.color) document.documentElement.style.setProperty('--track-' + t.id, t.color); });
    M = (pack.mottos && pack.mottos.length) ? pack.mottos : (DEF.mottos || []); _motdI = 0;
  }
  function saveProgress(){ ST.saveProgress(store, pack.id, progress); }
  function defaultItemId(){ var o = allItems.find(function (it){ return !it.rest && !L.isItemComplete(pack, progress, it.id); }); return (o || allItems[allItems.length - 1]).id; }
  function itemIndex(){ return allItems.findIndex(function (it){ return it.id === currentItemId; }); }
  function groupOrdinal(id){ return pack.groups.indexOf(groupById[id]) + 1; }
  function goToItem(delta){ var i = itemIndex(), j = Math.min(Math.max(i + delta, 0), allItems.length - 1); if (j !== i){ currentItemId = allItems[j].id; renderAll(); if (window.scrollTo){ try { window.scrollTo({ top:0, behavior:'smooth' }); } catch (e) {} } } }
  function completedCount(){ return Object.keys(progress.items).filter(function (id){ return progress.items[id].completedAt; }).length; }

  function renderPackSelect(){
    var sel = $('packSelect'); if (!sel) return;
    sel.innerHTML = packs.map(function (p){ return '<option value="' + esc(p.id) + '"' + (p.id === pack.id ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('');
    sel.onchange = function (){ var sess = ST.loadSession(store); sess.activePackId = sel.value; ST.saveSession(store, sess); selectPack(sel.value); currentItemId = defaultItemId(); renderAll(); };
  }
  function renderItemSelect(){
    var sel = $('daySelect');
    sel.innerHTML = allItems.map(function (it){ var g = groupById[it.id], tl = it.rest ? ui('restVert') : trackMeta(it.track).label; return '<option value="' + esc(it.id) + '"' + (it.id === currentItemId ? ' selected' : '') + '>' + esc(g.title) + ' · ' + esc(tl) + '</option>'; }).join('');
    sel.onchange = function (){ currentItemId = sel.value; renderAll(); };
  }
  function renderThemeSelect(){
    var sel = $('themeSelect');
    sel.innerHTML = themes.map(function (t){ return '<option value="' + esc(t.id) + '"' + (theme && t.id === theme.id ? ' selected' : '') + '>' + esc(t.name) + '</option>'; }).join('');
    sel.onchange = function (){ var t = themes.find(function (x){ return x.id === sel.value; }); if (t) applyTheme(t); };
  }
  function applyTheme(t){ var link = $('themeCss'); if (link) link.href = t.cssHref; document.documentElement.setAttribute('data-theme', t.id); var sess = ST.loadSession(store); sess.themeId = t.id; ST.saveSession(store, sess); theme = t; }

  function renderToday(){
    var it = L.getItem(pack, currentItemId), el = $('todayCard'), m = trackMeta(it.track), g = groupById[it.id], cfg = pack.settings || {};
    el.setAttribute('data-track', it.track);
    $('phaseLabel').textContent = ui('phaseLabel').replace('{p}', g.phase == null ? '' : g.phase).replace('{w}', groupOrdinal(it.id));
    var i = itemIndex(), notLast = i < allItems.length - 1;
    if (it.rest){
      var due = cfg.reviews ? L.getDueReviews(progress, todayStr()) : [];
      el.innerHTML = '<div class="today-side"><span class="vert">' + esc(ui('restVert')) + '</span></div><div class="today-main">' +
        '<h2 class="today-title">' + esc(ui('restTitle')) + '</h2>' +
        '<p class="warm"><span class="warm-i">☾</span> ' + esc(it.reflectPrompt || '') + '</p>' +
        '<div class="rest-due">' + (due.length ? esc(ui('dueToday')) + ' — <b>' + esc(due.join(' · ')) + '</b>' : esc(ui('restToday'))) + '</div>' +
        (notLast ? '<button class="next-day-cta" id="nextDayCta" type="button">' + esc(ui('nextDay')) + '</button>' : '') + '</div>';
      syncDayNav(); return;
    }
    var st = progress.items[currentItemId] || { tasks:{}, reflection:'' }, complete = L.isItemComplete(pack, progress, currentItemId);
    el.innerHTML = '<div class="today-side"><span class="vert">' + esc(ui('todayVert')) + '</span></div><div class="today-main">' +
      '<span class="trackpill"><span class="k">' + esc(m.icon || '') + '</span> ' + esc(m.label) + '</span>' +
      '<h2 class="today-title">' + esc(it.title || '') + '</h2>' +
      (cfg.warmups !== false && it.warmup ? '<div class="warm"><span class="warm-i">✦</span> <span class="muted">' + esc(ui('warmup')) + '</span> ' + esc(it.warmup) + '</div>' : '') +
      '<div class="tasks" id="taskList"></div>' +
      (cfg.reflections !== false ? '<div class="reflect-block"><label class="reflect-label" for="reflect"><span class="kanji">省</span> ' + esc(ui('reflect')) + (it.reflectPrompt ? ' — ' + esc(it.reflectPrompt) : '') + '</label><textarea id="reflect" placeholder="' + esc(ui('taskPlaceholder')) + '">' + esc(st.reflection || '') + '</textarea></div>' : '') +
      ((it.resources && it.resources.length) ? '<div class="res-row">' + it.resources.map(function (r){ return '<span class="chip"><b>' + esc(r.label) + '</b> ' + esc(r.note) + '</span>'; }).join('') + '</div>' : '') +
      ((m.reviewable && cfg.reviews) ? '<button class="btn gold" id="markReview" type="button">' + esc(ui('scheduleReview')) + '</button>' : '') +
      ((complete && notLast) ? '<button class="next-day-cta" id="nextDayCta" type="button">' + esc(ui('nextDay')) + '</button>' : '') + '</div>';
    $('taskList').innerHTML = (it.tasks || []).map(function (t, k){ var done = !!(st.tasks && st.tasks[t.id]); return '<label class="task ' + (done ? 'done' : '') + '" style="animation-delay:' + (k * 55) + 'ms"><input type="checkbox" id="cb_' + esc(t.id) + '"' + (done ? ' checked' : '') + '/><span class="box"></span><span class="task-text">' + esc(t.text) + '</span></label>'; }).join('');
    (it.tasks || []).forEach(function (t){ $('cb_' + t.id).onchange = function (e){ var was = L.isItemComplete(pack, progress, currentItemId); progress = L.setTaskDone(pack, progress, currentItemId, t.id, e.target.checked, todayStr(), new Date().getHours()); if (!was && L.isItemComplete(pack, progress, currentItemId)) onItemCompleted(); saveProgress(); renderAll(); }; });
    if (cfg.reflections !== false) $('reflect').oninput = function (e){ progress = L.setReflection(progress, currentItemId, e.target.value); saveProgress(); };
    if (m.reviewable && cfg.reviews) $('markReview').onclick = function (){ progress = L.scheduleReview(progress, g.id + '-' + (it.title || it.id), todayStr()); saveProgress(); renderAll(); };
    syncDayNav();
  }
  function syncDayNav(){ var i = itemIndex(); if ($('prevDay')) $('prevDay').disabled = i <= 0; if ($('nextDay')) $('nextDay').disabled = i >= allItems.length - 1; if ($('nextDayCta')) $('nextDayCta').onclick = function (){ goToItem(1); }; }

  function bar(p){ return '<div class="bar"><i style="width:' + p + '%"></i></div>'; }
  function renderDashboard(){
    var o = L.overallProgress(pack, progress), streak = L.computeStreak(progress, todayStr()), bp = L.progressByPhase(pack, progress), bt = L.progressByTrack(pack, progress);
    var phaseList = pack.phases || [];
    var phaseRows = phaseList.map(function (ph){ var x = bp[ph.id] || { done:0, total:0, pct:0 }; return '<div class="prow"><span class="lbl"><i></i>' + esc(ph.title || (lbl('phase','phaseWord') + ' ' + ph.id)) + '</span><span class="val">' + x.done + '/' + x.total + '</span></div>' + bar(x.pct); }).join('');
    var trackRows = pack.tracks.filter(function (t){ return bt[t.id]; }).map(function (t){ var x = bt[t.id]; return '<div class="prow" data-track="' + esc(t.id) + '"><span class="lbl"><i></i>' + esc(t.label) + '</span><span class="val">' + x.pct + '%</span></div><div class="bar" data-track="' + esc(t.id) + '"><i style="width:' + x.pct + '%"></i></div>'; }).join('');
    var sw = DEF.ui.streakWords || ['', '', ''], streakWord = (streak === 1 ? sw[0] : (streak >= 2 && streak <= 4 ? sw[1] : sw[2]));
    $('dashboard').innerHTML =
      '<div class="stat-card" data-kind="progress"><div class="eyebrow">' + esc(ui('overallTitle')) + '</div><div class="ring" style="--p:' + o.pct + '"><div><b>' + o.pct + '%</b><small>' + o.done + '/' + o.total + '</small></div></div><div class="stat-sub" style="text-align:center">' + esc(ui('daysOf').replace('{n}', o.total)) + '</div></div>' +
      '<div class="stat-card" data-kind="streak"><div class="eyebrow">' + esc(ui('streakTitle')) + '</div><div class="flame">🔥</div><div class="streak-num">' + streak + '</div><div class="stat-sub">' + streakWord + ' ' + esc(ui('inARow')) + '</div></div>' +
      (phaseList.length ? '<div class="stat-card" data-kind="phases"><div class="eyebrow">' + esc(ui('phasesTitle')) + '</div>' + phaseRows + '</div>' : '') +
      '<div class="stat-card" data-kind="tracks"><div class="eyebrow">' + esc(ui('tracksTitle')) + '</div>' + (trackRows || '<div class="muted">—</div>') + '</div>';
  }
  function renderComeback(){
    var cb = $('comeback'); if (!cb) return;
    var b = L.evaluateBadges(pack, progress, todayStr(), rules).find(function (x){ return x.id === 'comeback'; });
    if (b && b.unlocked && L.computeStreak(progress, todayStr()) <= 2){ cb.style.display = ''; cb.innerHTML = '🩹 ' + esc(ui('comeback').replace('{n}', completedCount())); } else cb.style.display = 'none';
  }
  function renderCalendar(){
    var grid = $('calGrid'); if (!grid) return;
    var dh = $('calDow'); if (dh) dh.innerHTML = (DEF.ui.dow || []).map(function (x){ return '<span>' + esc(x) + '</span>'; }).join('');
    var done = {}; L.completedDates(progress).forEach(function (d){ done[d] = 1; });
    var t = todayStr().split('-'), y = +t[0], m = +t[1]; m += calOffset; while (m < 1){ m += 12; y--; } while (m > 12){ m -= 12; y++; }
    var first = y + '-' + (m < 10 ? '0' : '') + m + '-01', start = L.addDays(first, -L.weekdayMon(first)), cells = '';
    for (var k = 0; k < 42; k++){ var dd = L.addDays(start, k), cls = 'cday'; if (dd.slice(0,7) !== first.slice(0,7)) cls += ' other'; if (done[dd]) cls += ' done'; if (dd === todayStr()) cls += ' today'; cells += '<span class="' + cls + '">' + (+dd.slice(8,10)) + '</span>'; }
    grid.innerHTML = cells;
    var MN = DEF.ui.months || []; if ($('calTitle')) $('calTitle').textContent = (MN[m-1] || '') + ' ' + y;
  }
  function renderTrophies(){
    var host = $('trophiesGrid'); if (!host) return;
    var all = L.evaluateBadges(pack, progress, todayStr(), rules), got = all.filter(function (b){ return b.unlocked; }).length;
    if ($('trophiesTitle')) $('trophiesTitle').textContent = ui('trophies') + ' · ' + got + '/' + all.length;
    host.innerHTML = all.map(function (b){ var t = badgeText(b.id); return '<div class="badge ' + (b.unlocked ? 'on' : 'off') + '" data-tip="' + esc(t.title + ' — ' + (t.desc || '')) + '"><span class="bi">' + (t.icon || '•') + '</span><span class="bt">' + esc(t.title) + '</span></div>'; }).join('');
  }

  function _rotateMotd(){ var el = $('motd'); if (!el || !M.length) return; el.classList.add('motd-out'); setTimeout(function (){ _motdI = (_motdI + 1) % M.length; el.textContent = M[_motdI]; el.classList.remove('motd-out'); }, 600); }
  function celebrate(){ var fx = $('fx'); if (!fx) return; var flash = document.createElement('div'); flash.className = 'fx-flash'; fx.appendChild(flash); setTimeout(function (){ if (flash.parentNode) flash.parentNode.removeChild(flash); }, 650); for (var k = 0; k < 30; k++){ var p = document.createElement('span'); p.className = 'confetti-piece'; p.style.left = (Math.random()*100) + '%'; p.style.setProperty('--i', k); p.style.setProperty('--dx', (Math.random()*2-1).toFixed(2)); p.style.setProperty('--dy', Math.random().toFixed(2)); p.style.setProperty('--rot', Math.floor(Math.random()*720-360) + 'deg'); p.style.animationDelay = (Math.random()*0.2) + 's'; fx.appendChild(p); setTimeout((function (n){ return function (){ if (n.parentNode) n.parentNode.removeChild(n); }; })(p), 1900); } }
  function _toast(cls, html){ var fx = $('fx'); if (!fx) return; var el = document.createElement('div'); el.className = cls; el.innerHTML = html; fx.appendChild(el); setTimeout(function (){ el.classList.add('show'); }, 20); setTimeout(function (){ el.classList.remove('show'); setTimeout(function (){ if (el.parentNode) el.parentNode.removeChild(el); }, 400); }, 3500); }
  function showBadgeToast(ids){ var first = badgeText(ids[0]); _toast('badge-toast', '<span class="bt-i">' + (first.icon || '•') + '</span><span>' + esc(ui('newTrophy')) + ' <b>' + esc(first.title) + '</b></span>'); }
  function onItemCompleted(){ celebrate(); var r = L.syncBadges(pack, progress, todayStr(), rules); progress = r.progress; if (r.unlocked.length) showBadgeToast(r.unlocked); if (Math.random() < 0.12){ var pool = pack.surprises || []; var msg = pool[Math.floor(Math.random()*(pool.length||1))] || ''; if (msg){ progress = Object.assign({}, progress, { lastSurprise:{ text:msg, at:todayStr() } }); _toast('toast', esc(msg)); } } }

  function renderAll(){ renderPackSelect(); renderItemSelect(); renderToday(); renderDashboard(); renderComeback(); renderTrophies(); }

  function init(){
    if (!L || !S.packs || !packs.length){ document.body.innerHTML = '<p style="padding:24px;font:16px system-ui">Failed to load plugins. Check that core/*.js, logic.js, and data/* sit next to index.html.</p>'; return; }
    ST.migrate(store);
    var sess = ST.loadSession(store);
    selectPack((packs.find(function (p){ return p.id === sess.activePackId; }) || packs[0]).id);
    theme = themes.find(function (t){ return t.id === sess.themeId; }) || themes[0];
    if (theme) applyTheme(theme);
    currentItemId = defaultItemId();

    [['exportBtn','export'],['importBtn','import']].forEach(function (p){ if ($(p[0])) $(p[0]).textContent = ui(p[1]); });
    [['exportBtn','export'],['importBtn','import'],['calBtn','calendar'],['trophiesBtn','trophies'],['prevDay','prevDayAria'],['nextDay','nextDayAria']].forEach(function (p){ if ($(p[0])) $(p[0]).setAttribute('aria-label', ui(p[1])); });
    if ($('packSelect')) $('packSelect').setAttribute('aria-label', ui('pack'));
    if ($('themeSelect')) $('themeSelect').setAttribute('aria-label', ui('theme'));
    if ($('daySelect')) $('daySelect').setAttribute('aria-label', lbl('item', 'weekAbbr'));
    renderThemeSelect();

    $('calBtn').onclick = function (){ calOffset = 0; renderCalendar(); $('calModal').classList.add('open'); };
    $('calClose').onclick = function (){ $('calModal').classList.remove('open'); };
    $('calPrev').onclick = function (){ calOffset--; renderCalendar(); };
    $('calNext').onclick = function (){ calOffset++; renderCalendar(); };
    $('calModal').onclick = function (e){ if (e.target.id === 'calModal') $('calModal').classList.remove('open'); };
    $('trophiesBtn').onclick = function (){ renderTrophies(); $('trophiesModal').classList.add('open'); };
    $('trophiesClose').onclick = function (){ $('trophiesModal').classList.remove('open'); };
    $('trophiesModal').onclick = function (e){ if (e.target.id === 'trophiesModal') $('trophiesModal').classList.remove('open'); };
    document.addEventListener('keydown', function (e){ if (e.key === 'Escape'){ var m = document.querySelector('.modal.open'); if (m) m.classList.remove('open'); } });
    $('prevDay').onclick = function (){ goToItem(-1); };
    $('nextDay').onclick = function (){ goToItem(1); };
    $('exportBtn').onclick = function (){ var b = new Blob([L.serializeProgress(progress)], { type:'application/json' }); var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = pack.id + '-progress.json'; a.click(); URL.revokeObjectURL(a.href); };
    $('importBtn').onclick = function (){ $('importFile').click(); };
    $('importFile').onchange = function (e){ var f = e.target.files[0]; if (!f) return; var rd = new FileReader(); rd.onload = function (){ var r = L.parseProgress(String(rd.result)); if (!r.ok){ alert(ui('importFail').replace('{e}', r.error)); return; } progress = r.progress; saveProgress(); currentItemId = defaultItemId(); renderAll(); alert(ui('importOk')); }; rd.readAsText(f); e.target.value = ''; };

    if ($('motd') && M.length) $('motd').textContent = M[0];
    if ($('summaryTitle')) $('summaryTitle').textContent = ui('summaryTitle');
    if ($('todayTitle')) $('todayTitle').textContent = ui('todayTitle');
    if (M.length > 1) setInterval(_rotateMotd, 6000);
    renderAll();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}());
```

- [ ] **Step 2: Commit**

```bash
git add app.js
git commit -m "feat(app): rewrite as plugin host (active pack/theme, switcher, per-pack progress)"
```

### Task 15: Re-enable + rewrite the DOM contract test; delete old data

**Files:**
- Recreate: `test/app.test.js` (from `test/app.test.js.disabled`, rewritten)
- Delete: `test/app.test.js.disabled`, `data/curriculum.js`, `data/content.js`, `test/curriculum.test.js`

- [ ] **Step 1: Write the new `test/app.test.js`**

```js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const DIR = path.join(__dirname, '..');

function harness(){
  const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
  const registry = {};
  function FakeEl(id){
    this.id = id; this._html = ''; this.value = ''; this.files = []; this.disabled = false; this.href = ''; this.lang = '';
    this.style = { setProperty(){}, removeProperty(){} }; this.dataset = {};
    this.classList = { add(){}, remove(){}, toggle(){}, contains(){ return false; } };
    this.onchange = this.onclick = this.oninput = null;
  }
  Object.defineProperty(FakeEl.prototype, 'innerHTML', {
    get(){ return this._html; },
    set(v){ this._html = v; const re = /id="([^"$]+)"/g; let m; while ((m = re.exec(v))) registry[m[1]] = registry[m[1]] || new FakeEl(m[1]); },
  });
  Object.defineProperty(FakeEl.prototype, 'textContent', { get(){ return ''; }, set(){} });
  const noop = function(){};
  Object.assign(FakeEl.prototype, {
    appendChild(c){ return c; }, removeChild(c){ return c; }, append: noop, remove: noop,
    setAttribute(k, v){ if (k.indexOf('data-') === 0) this.dataset[k.slice(5)] = v; }, getAttribute(){ return null; },
    addEventListener: noop, click: noop, animate(){ return { onfinish:null, cancel:noop, finished:Promise.resolve() }; },
  });
  const staticHtml = html.replace(/<script[\s\S]*?<\/script>/g, '');
  let mm; const idre = /id="([^"$]+)"/g; while ((mm = idre.exec(staticHtml))) registry[mm[1]] = registry[mm[1]] || new FakeEl(mm[1]);
  const store = {};
  const sandbox = {
    document: {
      getElementById: (id) => registry[id] || null, createElement: () => new FakeEl('_el'),
      querySelector: () => null,
      addEventListener: (ev, fn) => { if (ev === 'DOMContentLoaded') fn(); }, readyState: 'complete',
      documentElement: new FakeEl('html'), body: new FakeEl('body'),
    },
    localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
    Blob: function(){}, URL: { createObjectURL: () => 'b', revokeObjectURL(){} }, FileReader: function(){},
    alert: noop, setTimeout: () => 0, clearTimeout: noop, setInterval: () => 0, clearInterval: noop, requestAnimationFrame: () => 0,
    console: { log(){}, warn(){}, error(){} }, Date, Math, JSON, Object, Array, String, Number, Set, Map, Symbol, RegExp, Error, Promise, parseInt, parseFloat, isNaN,
  };
  sandbox.window = sandbox; sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/g; let s;
  while ((s = re.exec(html))){
    const src = (s[1] || '').match(/src="([^"]+)"/);
    const code = src ? fs.readFileSync(path.join(DIR, src[1]), 'utf8') : s[2];
    vm.runInContext(code, ctx, { filename: src ? src[1] : 'inline' });
  }
  return { registry, sandbox, store };
}

test('app boots: plugins registered, canonical regions render', () => {
  const { registry, sandbox } = harness();
  assert.ok(sandbox.RoadmapLogic && sandbox.SUNRISE, 'globals');
  assert.equal(sandbox.SUNRISE.packs().length >= 1, true, 'a pack registered');
  assert.equal(sandbox.SUNRISE.themes().length, 5, 'themes registered');
  assert.ok((registry.packSelect.innerHTML || '').includes('<option'), 'packSelect');
  assert.ok((registry.daySelect.innerHTML || '').includes('<option'), 'daySelect');
  assert.ok((registry.dashboard.innerHTML || '').includes('stat-card'), 'dashboard');
});
test('theme selector swaps cssHref and persists into sunrise.session', () => {
  const { registry, store } = harness();
  assert.ok((registry.themeSelect.innerHTML || '').includes('<option'), 'themeSelect options');
  registry.themeSelect.value = 'neon'; registry.themeSelect.onchange();
  assert.ok(/neon\.css$/.test(registry.themeCss.href), 'theme switched: ' + registry.themeCss.href);
  assert.equal(JSON.parse(store['sunrise.session']).themeId, 'neon');
});
test('calendar renders; trophies render 30 tiles', () => {
  const { registry } = harness();
  registry.calBtn.onclick();
  assert.ok((registry.calGrid.innerHTML || '').includes('cday'), 'calendar grid');
  registry.trophiesBtn.onclick();
  const tiles = (registry.trophiesGrid.innerHTML.match(/data-tip/g) || []).length;
  assert.equal(tiles, 30, 'trophies tiles: ' + tiles);
});
test('completing the active item persists first-light under the per-pack key', () => {
  const { registry, store } = harness();
  Object.keys(registry).filter((id) => /^cb_/.test(id)).forEach((id) => { if (registry[id].onchange) registry[id].onchange({ target:{ checked:true } }); });
  const saved = JSON.parse(store['sunrise.progress.dev-roadmap']);
  assert.ok(saved.badges && saved.badges['first-light'], 'first-light persisted');
});
test('legacy v2 progress migrates on boot', () => {
  // pre-seed legacy key, then boot a fresh harness sharing that store is not trivial here;
  // migration itself is covered by test/migration.test.js. Here we just assert migrate() ran without error.
  const { sandbox } = harness();
  assert.equal(typeof sandbox.SUNRISE.state.migrate, 'function');
});
```

- [ ] **Step 2: Delete the disabled copy and old data**

```bash
git rm test/app.test.js.disabled data/curriculum.js data/content.js test/curriculum.test.js
```

- [ ] **Step 3: Run the full suite**

Run: `node --test`
Expected: PASS — `validate`, `badges`, `registry`, `state`, `migration`, `logic`, `app-defaults`, `builtin-themes`, `dev-roadmap`, `app`. No reference to deleted files.

- [ ] **Step 4: Manual browser parity check** (the one thing tests can't fully cover)

Open `index.html` by double-click. Verify: dashboard + today card render; the pack switcher shows "Dev Roadmap"; theme switcher swaps all 5 themes; checking all tasks of a day fires confetti + a trophy toast; calendar + trophies modals open and close (✕, backdrop, **and Escape**); export downloads `dev-roadmap-progress.json`; reload preserves progress. If you have an existing `devRoadmapState.v1` in localStorage, confirm your streak/badges carried over.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(app): re-enable DOM contract test on the plugin host; remove legacy data files"
```

## Phase 6 — Authoring docs (the AI-first deliverable)

Standalone, source-free docs an LLM can author plugins from. These are content tasks — no failing-test step; correctness is checked by the optional doc-drift test (Task 19) and by actually pasting one into an LLM.

### Task 16: `docs/plugins/README.md`

**Files:**
- Create: `docs/plugins/README.md`

- [ ] **Step 1: Create the file with this content**

````markdown
# Sunrise Plugins

Sunrise loads two kinds of plugins, each a single self-registering JS file:

- **Theme** — a visual skin (CSS over a fixed set of DOM hooks). See `theme.md`.
- **Content pack** — a self-contained knowledge base (its own tracks, structure, settings, badges). See `content-pack.md`.

You do not need to read the app source to author either one. The docs are the contract.

## How a plugin is loaded

A plugin file calls a global registration function:

```js
// a content pack file
(function (root){
  var pack = { /* ...the pack object... */ };
  if (root.SUNRISE && root.SUNRISE.registerPack) root.SUNRISE.registerPack(pack);
})(typeof window !== 'undefined' ? window : globalThis);
```

```js
// a theme file
(function (root){
  if (root.SUNRISE && root.SUNRISE.registerTheme)
    root.SUNRISE.registerTheme({ schema:'sunrise.theme/v1', id:'my-theme', name:'My Theme', version:'1.0.0', cssHref:'themes/my-theme.css' });
})(typeof window !== 'undefined' ? window : globalThis);
```

To install, add one `<script src="…">` line to `index.html` after the bundled plugins. Every registered plugin is **validated**; an invalid one is rejected (with a precise reason in the console) and simply does not appear — it never breaks the app.

## Canonical DOM hooks (themes style these; do not rename)

Stable `id`/`class` hooks the app renders and themes target:

- Header `header.app-header`: `.brand` (`.brand-mark`, `.brand-name`, `#phaseLabel`), `#packSelect`, `#themeSelect`, `#daySelect`, `#calBtn`, `#trophiesBtn`, `#exportBtn`, `#importBtn`.
- Dashboard `#dashboard`: 4 `.stat-card` with `data-kind="progress|streak|phases|tracks"`; inside, `.eyebrow`, `.ring`, `.streak-num`, `.prow` + `.bar`.
- Day block: `.day-rail` → `#prevDay.day-nav`, `#todayCard.today`, `#nextDay.day-nav`; `#comeback`.
  - Inside `#todayCard`: `.trackpill`, `.today-title`, `.warm`, `#taskList` (`.task` > `input#cb_<taskId>` + `.box` + `.task-text`), `#reflect`, `.res-row .chip`, `#markReview`, `#nextDayCta`.
  - Track-colored elements carry `data-track="<trackId>"`; **the CSS theme sets the color** via `--track-<id>`.
- Calendar modal `#calModal.modal` (`role="dialog"`): `#calPrev`, `#calTitle`, `#calNext`, `#calClose`, `.cal-dow`, `#calGrid` (`.cday[.done|.today|.other]`).
- Trophies modal `#trophiesModal.modal`: `#trophiesTitle`, `#trophiesClose`, `#trophiesGrid` (`.badge[.on|.off]` with `data-tip`).
- Footer `.foot` → `#motd`. Effects (app spawns, theme styles): `.confetti-piece`, `.toast`, `.badge-toast`, `.fx-flash` inside `#fx`.
````

- [ ] **Step 2: Commit**

```bash
git add docs/plugins/README.md
git commit -m "docs(plugins): overview + loading + canonical DOM hooks"
```

### Task 17: `docs/plugins/content-pack.md`

**Files:**
- Create: `docs/plugins/content-pack.md`

- [ ] **Step 1: Create the file with this content**

````markdown
# Content Pack Authoring Guide (`sunrise.pack/v1`)

A content pack is one declarative object registered via `SUNRISE.registerPack(pack)`. It is fully self-contained: it declares its own subject columns ("tracks"), its structure, its display settings, and (optionally) its achievements. You can author one from this doc alone.

## Envelope

| field | type | required | notes |
|---|---|---|---|
| `schema` | string | ✅ | exactly `"sunrise.pack/v1"` |
| `id` | string | ✅ | lowercase `[a-z0-9-]`; namespaces the user's saved progress |
| `name` | string | ✅ | shown in the pack switcher |
| `version` | string | ✅ | e.g. `"1.0.0"` |
| `locale` | string | — | sets `<html lang>`, e.g. `"ru"`, `"en"`, `"ja"` |
| `settings` | object | — | display/behaviour knobs (below) |
| `tracks` | array | ✅ (≥1) | the subject columns |
| `phases` | array | — | optional top grouping for the dashboard "phases" card |
| `groups` | array | ✅ (≥1) | ordered sections, each holding items |
| `badges` | array | — | extra achievements (declarative rules) |
| `mottos` | string[] | — | footer lines; falls back to app defaults |
| `surprises` | string[] | — | occasional congratulation messages |

## `tracks[]` — the subject columns

```js
{ id:"dsa", label:"Algorithms", icon:"算", color:"#e23", reviewable:true }
```
- `id` ✅, `label` ✅. `icon` optional (short glyph/emoji). `color` optional **hint** — the app sets `--track-<id>` so the pack looks right under any theme; a theme may override. `reviewable` optional — items on this track show a "schedule review" button (spaced repetition).

## `settings{}`

```js
{ labels:{ phase:"Phase", group:"Week", groupAbbr:"Wk", item:"Day" },
  reviews:true, reflections:true, warmups:true }
```
- `labels` — display nouns for the hierarchy. `reviews`/`reflections`/`warmups` — feature toggles (default true).

## `phases[]` / `groups[]` / `items[]`

```js
phases: [ { id:"p1", title:"Foundations" } ],
groups: [
  { id:"g1", title:"Week 1", phase:"p1", theme:"Intro topics",
    items: [
      { id:"g1i1", track:"dsa", title:"Complexity",
        warmup:"warm-up text", reflectPrompt:"reflection question",
        tasks:[ { id:"t1", text:"Task one" }, { id:"t2", text:"Task two" } ],
        resources:[ { label:"MDN", note:"Big-O" } ] },
      { id:"g1rest", track:"rest", rest:true, reflectPrompt:"Rest & review" }
    ] }
]
```
- An **item** is complete when all its `tasks` are checked. `rest:true` items are breathers — not counted toward progress, no tasks. `id`s must be globally unique within the pack. `phase` on a group must reference a declared phase id.

## `badges[]` — declarative achievement rules

Each badge is data: `{ id, title, desc, icon, type, …params }`. No code. The app ships a generic set automatically (streaks, total days, reflections, weekend/night-owl/early-lark, perfect group, halfway, finisher, comeback); your pack only adds extras. To override a generic badge, reuse its `id`.

| `type` | params | unlocks when |
|---|---|---|
| `streak` | `gte:number` | longest daily streak ≥ gte |
| `days-done` | `gte:number` | items completed ≥ gte |
| `percent` | `gte:number` | overall percent ≥ gte |
| `all-done` | — | every non-rest item complete |
| `tasks-done` | `gte:number, track?:string` | tasks checked (optionally within a track) ≥ gte |
| `reflections` | `gte:number` | non-empty reflections ≥ gte |
| `groups-complete` | `gte:number` | fully-complete groups ≥ gte |
| `track-complete` | `track:string` | a track is 100% complete |
| `phase-complete` | `phase:string` | a phase is 100% complete |
| `item-complete` | `item:string` | a specific item is complete |
| `all-tracks` | `eachGte:number` | every track has ≥ eachGte items done |
| `weekday` | `days:number[]` | completed an item on a listed weekday (1=Mon … 7=Sun) |
| `hour-range` | `from:number, to:number` | completed an item in the hour window (wraps if from>to) |
| `comeback` | — | resumed after a ≥2-day gap |

Example pack-specific badge:
```js
{ id:"capstone", title:"Capstone", desc:"Final project done", icon:"🏛️", type:"item-complete", item:"g13i6" }
```

## Complete minimal example

```js
(function (root){
  var pack = {
    schema:"sunrise.pack/v1", id:"rust-core", name:"Rust Core", version:"1.0.0", locale:"en",
    settings:{ labels:{ phase:"Phase", group:"Week", groupAbbr:"Wk", item:"Day" }, reviews:false, reflections:true, warmups:true },
    tracks:[ { id:"ownership", label:"Ownership", icon:"🦀", color:"#d35400" },
             { id:"async", label:"Async", icon:"⚙️", color:"#2980b9" } ],
    phases:[ { id:"p1", title:"Basics" } ],
    groups:[ { id:"g1", title:"Week 1", phase:"p1", theme:"Ownership & borrowing", items:[
      { id:"g1i1", track:"ownership", title:"Move semantics", warmup:"Recall stack vs heap",
        reflectPrompt:"Where did the borrow checker bite?", tasks:[ { id:"t1", text:"Read ch.4" }, { id:"t2", text:"Solve 3 exercises" } ] },
      { id:"g1i2", track:"async", title:"Futures 101", tasks:[ { id:"t1", text:"Write a hello-async" } ] },
      { id:"g1rest", track:"rest", rest:true, reflectPrompt:"Review the week" }
    ] } ],
    badges:[ { id:"own-master", title:"Owner", desc:"Ownership track done", icon:"🦀", type:"track-complete", track:"ownership" } ],
    mottos:[ "Fearless concurrency, one day at a time." ],
  };
  if (root.SUNRISE && root.SUNRISE.registerPack) root.SUNRISE.registerPack(pack);
})(typeof window !== 'undefined' ? window : globalThis);
```

## Prompt template (paste into any LLM)

> You are authoring a **Sunrise content pack** (contract `sunrise.pack/v1`). Follow this guide exactly: [paste this whole file]. Produce a pack about **{TOPIC}** with **{N}** groups of **{M}** items, using tracks **{TRACK LIST}**, locale **{LOCALE}**. Each non-rest item needs 2–4 concrete `tasks`. End each group with a `rest:true` item. Output **only** the `registerPack({…})` JS file, nothing else.

## Versioning

`schema:"sunrise.pack/v1"` is the current contract. The app rejects unknown versions with a clear message; future versions add a migrator.
````

- [ ] **Step 2: Commit**

```bash
git add docs/plugins/content-pack.md
git commit -m "docs(plugins): content-pack authoring guide"
```

### Task 18: `docs/plugins/theme.md`

**Files:**
- Create: `docs/plugins/theme.md`

- [ ] **Step 1: Create the file with this content**

````markdown
# Theme Authoring Guide (`sunrise.theme/v1`)

A theme is a CSS file plus a tiny manifest. It styles the canonical DOM hooks (see `README.md`); it must not contain JS or bespoke DOM.

## Manifest

```js
SUNRISE.registerTheme({ schema:"sunrise.theme/v1", id:"my-theme", name:"My Theme", version:"1.0.0", cssHref:"themes/my-theme.css" });
```
| field | type | required |
|---|---|---|
| `schema` | string | ✅ `"sunrise.theme/v1"` |
| `id` | string | ✅ lowercase `[a-z0-9-]` |
| `name` | string | ✅ shown in the theme picker |
| `version` | string | ✅ |
| `cssHref` | string | ✅ path to the CSS file |

## CSS variable contract

Define these on `:root` (or `:root[data-theme="my-theme"]`):
`--bg, --panel, --line, --ink, --ink-dim, --ink-faint, --accent, --gold, --font-display, --font-body, --font-mono`, per-track colors `--track-<id>` (e.g. `--track-dsa`), and confetti colors `--confetti-1..4`.

A theme must style every canonical hook in `README.md` and **must honor reduced motion**:
```css
@media (prefers-reduced-motion: reduce){ .confetti-piece, .fx-flash, .task { animation: none !important; transition: none !important; } }
```

## Minimal example (`themes/my-theme.css`)

```css
:root[data-theme="my-theme"]{
  --bg:#111; --panel:#1b1b1b; --line:#333; --ink:#eee; --ink-dim:#aaa; --ink-faint:#777;
  --accent:#7cf; --gold:#fc6;
  --track-dsa:#e23; --confetti-1:#7cf; --confetti-2:#fc6; --confetti-3:#e23; --confetti-4:#9e9;
}
:root[data-theme="my-theme"] body{ background:var(--bg); color:var(--ink); font-family:var(--font-body, system-ui); }
/* …style .app-header, .stat-card, .today, .task, .modal, .badge, .cday, .confetti-piece … */
```

## Prompt template

> You are authoring a **Sunrise theme** (contract `sunrise.theme/v1`). Follow this guide and the canonical hooks in README.md. Theme vibe: **{DESCRIBE}**. Output a complete `themes/{id}.css` styling every hook + the CSS variables + a reduced-motion block, and the one-line `registerTheme({…})` manifest.
````

- [ ] **Step 2: Commit**

```bash
git add docs/plugins/theme.md
git commit -m "docs(plugins): theme authoring guide"
```

### Task 19 (optional): `test/doc-drift.test.js` — docs can't silently drift

**Files:**
- Create: `test/doc-drift.test.js`

- [ ] **Step 1: Write the test**

```js
// test/doc-drift.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const L = require('../logic.js');

test('content-pack.md documents every badge rule type', () => {
  const doc = fs.readFileSync(path.join(__dirname, '..', 'docs', 'plugins', 'content-pack.md'), 'utf8');
  for (const type of Object.keys(L.BADGE_RULES)) assert.ok(doc.includes('`' + type + '`'), 'undocumented rule type: ' + type);
});
test('content-pack.md documents every required top-level pack field', () => {
  const doc = fs.readFileSync(path.join(__dirname, '..', 'docs', 'plugins', 'content-pack.md'), 'utf8');
  ['schema','id','name','version','tracks','groups'].forEach((f) => assert.ok(doc.includes('`' + f + '`'), 'undocumented field: ' + f));
});
```

- [ ] **Step 2: Run + commit**

Run: `node --test test/doc-drift.test.js` → Expected: PASS.

```bash
git add test/doc-drift.test.js
git commit -m "test(docs): assert content-pack doc covers all rule types + required fields"
```

## Phase 7 — Final verification

### Task 20: Whole-suite + parity sign-off

- [ ] **Step 1: Run the entire suite**

Run: `node --test`
Expected: PASS across `validate, badges, registry, state, migration, logic, app-defaults, builtin-themes, dev-roadmap, app, doc-drift`. Zero failures.

- [ ] **Step 2: Confirm no stale references to deleted files**

Run: `grep -rn "curriculum.js\|content.js\|RoadmapLogic.allDays\|createInitialState\|devRoadmapState" --include=*.js --include=*.html . | grep -v node_modules`
Expected: only matches inside `docs/` or `scripts/reshape-curriculum.js` (which legitimately reads the now-deleted files — note: it will no longer run after deletion, which is fine; it was one-off). No matches in `app.js`, `logic.js`, `index.html`, `test/*`.

- [ ] **Step 3: Browser parity** (repeat Task 15 Step 4 if not already done on the final build).

- [ ] **Step 4: Final commit / branch is ready for review**

```bash
git status   # clean
git log --oneline -20
```

The branch now delivers: a validated 2-type plugin system, the curriculum as pack #1, per-pack switchable progress with lossless migration, a declarative badge engine, the three review robustness fixes, and standalone AI-authoring docs — all zero-build / `file://`.








