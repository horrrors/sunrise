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
