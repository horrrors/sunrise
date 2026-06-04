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
