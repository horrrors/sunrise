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
