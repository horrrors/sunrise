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
