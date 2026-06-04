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
test('per-task guidance carries through into pack #1', () => {
  const withGuidance = L.allItems(pack).some((it) => (it.tasks || []).some((t) => typeof t.guidance === 'string' && t.guidance.length));
  assert.ok(withGuidance, 'at least one task should carry guidance');
});
