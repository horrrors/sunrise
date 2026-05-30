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
