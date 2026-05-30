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

function withDates(dates) {
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
