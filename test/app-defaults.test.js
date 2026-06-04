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
