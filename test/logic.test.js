const test = require('node:test');
const assert = require('node:assert');
const L = require('../logic.js');

// ---------- date helpers ----------
test('addDays handles month/year rollover (UTC)', () => {
  assert.equal(L.addDays('2026-01-31', 1), '2026-02-01');
  assert.equal(L.addDays('2026-03-01', -1), '2026-02-28');
  assert.equal(L.addDays('2026-12-31', 1), '2027-01-01');
});
test('diffDays counts whole days b - a', () => {
  assert.equal(L.diffDays('2026-05-30', '2026-06-02'), 3);
  assert.equal(L.diffDays('2026-06-02', '2026-05-30'), -3);
});
test('phaseOfWeek maps weeks to phases', () => {
  assert.equal(L.phaseOfWeek(1), 1); assert.equal(L.phaseOfWeek(4), 1);
  assert.equal(L.phaseOfWeek(5), 2); assert.equal(L.phaseOfWeek(9), 2);
  assert.equal(L.phaseOfWeek(10), 3); assert.equal(L.phaseOfWeek(13), 3);
});

test('createInitialState is v2 with badges + lastSurprise', () => {
  assert.deepEqual(L.createInitialState(), { version: 2, days: {}, reviews: [], badges: {}, lastSurprise: null });
});

// ---------- fixtures ----------
const CURR = { phases: [{ id: 1, title: 'P1', weeks: [1] }], weeks: [{ num: 1, phase: 1, theme: 'x', days: [
  { id: 'w1d1', week: 1, dow: 1, track: 'dsa', title: 'A', warmup: 'w', tasks: [{ id: 't1', text: 'a' }, { id: 't2', text: 'b' }], reflectPrompt: '', resources: [] },
  { id: 'w1d7', week: 1, dow: 7, track: 'rest', title: 'Rest', warmup: null, tasks: [], reflectPrompt: '', resources: [] },
] }] };

// ---------- strict completion ----------
test('setTaskDone: partial day is NOT complete (completedAt null)', () => {
  let s = L.createInitialState();
  s = L.setTaskDone(CURR, s, 'w1d1', 't1', true, '2026-05-30', 14);
  assert.equal(s.days['w1d1'].completedAt, null);
  assert.equal(L.isDayComplete(CURR, s, 'w1d1'), false);
});
test('setTaskDone: all tasks done -> completedAt + completedHour set', () => {
  let s = L.createInitialState();
  s = L.setTaskDone(CURR, s, 'w1d1', 't1', true, '2026-05-30', 14);
  s = L.setTaskDone(CURR, s, 'w1d1', 't2', true, '2026-05-30', 14);
  assert.equal(s.days['w1d1'].completedAt, '2026-05-30');
  assert.equal(s.days['w1d1'].completedHour, 14);
  assert.equal(L.isDayComplete(CURR, s, 'w1d1'), true);
});
test('setTaskDone: un-completing clears completedAt/hour', () => {
  let s = L.createInitialState();
  s = L.setTaskDone(CURR, s, 'w1d1', 't1', true, '2026-05-30', 14);
  s = L.setTaskDone(CURR, s, 'w1d1', 't2', true, '2026-05-30', 14);
  s = L.setTaskDone(CURR, s, 'w1d1', 't2', false, '2026-05-31', 9);
  assert.equal(s.days['w1d1'].completedAt, null);
  assert.equal(s.days['w1d1'].completedHour, null);
});
test('setTaskDone: re-completing later sets the new date', () => {
  let s = L.createInitialState();
  s = L.setTaskDone(CURR, s, 'w1d1', 't1', true, '2026-05-30', 14);
  s = L.setTaskDone(CURR, s, 'w1d1', 't2', true, '2026-05-30', 14);
  s = L.setTaskDone(CURR, s, 'w1d1', 't2', false, '2026-05-30', 14);
  s = L.setTaskDone(CURR, s, 'w1d1', 't2', true, '2026-06-02', 8);
  assert.equal(s.days['w1d1'].completedAt, '2026-06-02');
  assert.equal(s.days['w1d1'].completedHour, 8);
});
test('setTaskDone immutable', () => {
  const s0 = L.createInitialState();
  const s1 = L.setTaskDone(CURR, s0, 'w1d1', 't1', true, '2026-05-30', 14);
  assert.deepEqual(s0.days, {});
  assert.notEqual(s0, s1);
});
test('setReflection stores text', () => {
  let s = L.setReflection(L.createInitialState(), 'w1d1', 'hi');
  assert.equal(s.days['w1d1'].reflection, 'hi');
});
test('getDay finds or null', () => {
  assert.equal(L.getDay(CURR, 'w1d1').track, 'dsa');
  assert.equal(L.getDay(CURR, 'nope'), null);
});

// ---------- streak (strict, via direct state) ----------
function st(dates, hours) {
  const days = {};
  dates.forEach((d, i) => { days['x' + i] = { tasks: {}, reflection: '', completedAt: d, completedHour: hours ? hours[i] : 12 }; });
  return { version: 2, days, reviews: [], badges: {}, lastSurprise: null };
}
test('computeStreak: 0 when empty', () => { assert.equal(L.computeStreak(st([]), '2026-05-30'), 0); });
test('computeStreak: consecutive ending today', () => {
  assert.equal(L.computeStreak(st(['2026-05-28', '2026-05-29', '2026-05-30']), '2026-05-30'), 3);
});
test('computeStreak: anchors to yesterday', () => {
  assert.equal(L.computeStreak(st(['2026-05-28', '2026-05-29']), '2026-05-30'), 2);
});
test('computeStreak: older than yesterday -> 0', () => {
  assert.equal(L.computeStreak(st(['2026-05-27']), '2026-05-30'), 0);
});
test('completedDates returns sorted completion dates', () => {
  assert.deepEqual(L.completedDates(st([])), []);
  assert.deepEqual(L.completedDates(st(['2026-05-30', '2026-05-28', '2026-05-29'])), ['2026-05-28', '2026-05-29', '2026-05-30']);
});
test('longestStreak', () => {
  assert.equal(L.longestStreak(st([])), 0);
  assert.equal(L.longestStreak(st(['2026-05-30'])), 1);
  assert.equal(L.longestStreak(st(['2026-05-26', '2026-05-27', '2026-05-28', '2026-05-29', '2026-05-30'])), 5);
  assert.equal(L.longestStreak(st(['2026-05-20', '2026-05-21', '2026-05-29', '2026-05-30', '2026-05-31'])), 3);
});

// ---------- aggregation + countCompletedTasks ----------
const CURR2 = { phases: [{ id: 1, title: 'P1', weeks: [1] }, { id: 2, title: 'P2', weeks: [5] }], weeks: [
  { num: 1, phase: 1, theme: 'x', days: [
    { id: 'w1d1', week: 1, dow: 1, track: 'dsa', title: '', warmup: 'w', tasks: [{ id: 't1', text: 'x' }], reflectPrompt: '', resources: [] },
    { id: 'w1d2', week: 1, dow: 2, track: 'js', title: '', warmup: 'w', tasks: [{ id: 't1', text: 'x' }], reflectPrompt: '', resources: [] },
    { id: 'w1d7', week: 1, dow: 7, track: 'rest', title: '', warmup: null, tasks: [], reflectPrompt: '', resources: [] },
  ] },
  { num: 5, phase: 2, theme: 'y', days: [
    { id: 'w5d1', week: 5, dow: 1, track: 'dsa', title: '', warmup: 'w', tasks: [{ id: 't1', text: 'x' }], reflectPrompt: '', resources: [] },
  ] },
] };
test('progressByTrack/Phase/overall with strict completion', () => {
  let s = L.createInitialState();
  s = L.setTaskDone(CURR2, s, 'w1d1', 't1', true, '2026-05-30', 10);
  assert.deepEqual(L.progressByTrack(CURR2, s).dsa, { done: 1, total: 2, pct: 50 });
  assert.deepEqual(L.progressByPhase(CURR2, s)[1], { done: 1, total: 2, pct: 50 });
  assert.deepEqual(L.overallProgress(CURR2, s), { done: 1, total: 3, pct: 33 });
});
test('countCompletedTasks by track', () => {
  let s = L.createInitialState();
  s = L.setTaskDone(CURR2, s, 'w1d1', 't1', true, '2026-05-30', 10);
  assert.equal(L.countCompletedTasks(CURR2, s, 'dsa'), 1);
  assert.equal(L.countCompletedTasks(CURR2, s, 'js'), 0);
});

// ---------- spaced repetition (unchanged) ----------
test('spaced repetition basic flow', () => {
  let s = L.scheduleReview(L.createInitialState(), 'bfs', '2026-05-30');
  assert.deepEqual(L.getDueReviews(s, '2026-05-30'), []);
  assert.deepEqual(L.getDueReviews(s, '2026-05-31'), ['bfs']);
  s = L.completeReview(s, 'bfs', '2026-05-31');
  assert.equal(s.reviews[0].stage, 1);
});

// ---------- badges ----------
test('evaluateBadges: first-light + streak-7 + comeback + owl + lark', () => {
  const empty = L.createInitialState();
  const e0 = L.evaluateBadges(CURR2, empty, '2026-05-30');
  assert.equal(e0.find((b) => b.id === 'first-light').unlocked, false);

  const one = st(['2026-05-30'], [14]);
  assert.equal(L.evaluateBadges(CURR2, one, '2026-05-30').find((b) => b.id === 'first-light').unlocked, true);

  const seven = st(['2026-05-24', '2026-05-25', '2026-05-26', '2026-05-27', '2026-05-28', '2026-05-29', '2026-05-30']);
  const e7 = L.evaluateBadges(CURR2, seven, '2026-05-30');
  assert.equal(e7.find((b) => b.id === 'streak-7').unlocked, true);
  assert.equal(e7.find((b) => b.id === 'streak-30').unlocked, false);

  const gap = st(['2026-05-20', '2026-05-21', '2026-05-28', '2026-05-29']);
  assert.equal(L.evaluateBadges(CURR2, gap, '2026-05-30').find((b) => b.id === 'comeback').unlocked, true);

  const owl = st(['2026-05-30'], [23]);
  assert.equal(L.evaluateBadges(CURR2, owl, '2026-05-30').find((b) => b.id === 'night-owl').unlocked, true);
  const lark = st(['2026-05-30'], [6]);
  assert.equal(L.evaluateBadges(CURR2, lark, '2026-05-30').find((b) => b.id === 'early-lark').unlocked, true);
});
test('badges: phase-1 unlocks when phase complete; algorithmist locked under 50', () => {
  let s = L.createInitialState();
  s = L.setTaskDone(CURR2, s, 'w1d1', 't1', true, '2026-05-30', 10);
  s = L.setTaskDone(CURR2, s, 'w1d2', 't1', true, '2026-05-30', 10);
  const e = L.evaluateBadges(CURR2, s, '2026-05-30');
  assert.equal(e.find((b) => b.id === 'phase-1').unlocked, true);
  assert.equal(e.find((b) => b.id === 'algorithmist').unlocked, false);
});
test('badges: capstone on w13d6 completion', () => {
  const CURRCAP = { phases: [{ id: 3, title: 'P3', weeks: [13] }], weeks: [{ num: 13, phase: 3, theme: 'z', days: [
    { id: 'w13d6', week: 13, dow: 6, track: 'patterns', title: '', warmup: 'w', tasks: [{ id: 't1', text: 'x' }], reflectPrompt: '', resources: [] },
    { id: 'w13d7', week: 13, dow: 7, track: 'rest', title: '', warmup: null, tasks: [], reflectPrompt: '', resources: [] },
  ] }] };
  let s = L.createInitialState();
  assert.equal(L.evaluateBadges(CURRCAP, s, '2026-05-30').find((b) => b.id === 'capstone').unlocked, false);
  s = L.setTaskDone(CURRCAP, s, 'w13d6', 't1', true, '2026-05-30', 10);
  assert.equal(L.evaluateBadges(CURRCAP, s, '2026-05-30').find((b) => b.id === 'capstone').unlocked, true);
});
test('syncBadges records new unlocks with date, idempotent', () => {
  const one = st(['2026-05-30'], [14]);
  const r1 = L.syncBadges(CURR2, one, '2026-05-30');
  assert.ok(r1.unlocked.includes('first-light'));
  assert.equal(r1.state.badges['first-light'].at, '2026-05-30');
  const r2 = L.syncBadges(CURR2, r1.state, '2026-05-31');
  assert.equal(r2.unlocked.includes('first-light'), false);
});
test('SURPRISES is a non-empty array of strings', () => {
  assert.ok(Array.isArray(L.SURPRISES) && L.SURPRISES.length >= 3);
  assert.equal(typeof L.SURPRISES[0], 'string');
});

test('BADGES has 30 achievements with unique ids', () => {
  assert.equal(L.BADGES.length, 30);
  assert.equal(new Set(L.BADGES.map((b) => b.id)).size, 30);
});

test('reflectionCount counts non-empty reflections', () => {
  let s = L.createInitialState();
  s = L.setReflection(s, 'a', 'note one');
  s = L.setReflection(s, 'b', '   ');
  s = L.setReflection(s, 'c', 'note two');
  assert.equal(L.reflectionCount(s), 2);
});

test('completedWeeks counts fully-complete weeks', () => {
  let s = L.createInitialState();
  assert.equal(L.completedWeeks(CURR2, s), 0);
  s = L.setTaskDone(CURR2, s, 'w1d1', 't1', true, '2026-05-30', 10);
  s = L.setTaskDone(CURR2, s, 'w1d2', 't1', true, '2026-05-30', 10);
  assert.equal(L.completedWeeks(CURR2, s), 1);
});

test('new badges: streak-3, weekend, dsa-master, halfway, finisher', () => {
  assert.equal(L.evaluateBadges(CURR2, st(['2026-05-28', '2026-05-29', '2026-05-30']), '2026-05-30').find((b) => b.id === 'streak-3').unlocked, true);
  // 2024-01-06 is a Saturday
  assert.equal(L.evaluateBadges(CURR2, st(['2024-01-06']), '2024-01-06').find((b) => b.id === 'weekend').unlocked, true);
  let s = L.createInitialState();
  s = L.setTaskDone(CURR2, s, 'w1d1', 't1', true, '2026-05-30', 10);
  s = L.setTaskDone(CURR2, s, 'w5d1', 't1', true, '2026-05-30', 10);
  let e = L.evaluateBadges(CURR2, s, '2026-05-30');
  assert.equal(e.find((b) => b.id === 'dsa-master').unlocked, true);
  assert.equal(e.find((b) => b.id === 'halfway').unlocked, true);
  assert.equal(e.find((b) => b.id === 'finisher').unlocked, false);
  s = L.setTaskDone(CURR2, s, 'w1d2', 't1', true, '2026-05-30', 10);
  assert.equal(L.evaluateBadges(CURR2, s, '2026-05-30').find((b) => b.id === 'finisher').unlocked, true);
});

// ---------- export / import + migration ----------
test('serialize round-trips through parseImported (v2)', () => {
  let s = L.createInitialState();
  s = L.setTaskDone(CURR, s, 'w1d1', 't1', true, '2026-05-30', 14);
  s = L.setTaskDone(CURR, s, 'w1d1', 't2', true, '2026-05-30', 14);
  const res = L.parseImported(L.serializeState(s));
  assert.equal(res.ok, true);
  assert.deepEqual(res.state, s);
});
test('parseImported rejects invalid / wrong version', () => {
  assert.deepEqual(L.parseImported('{x'), { ok: false, error: 'Invalid JSON' });
  assert.equal(L.parseImported(JSON.stringify({ version: 99, days: {}, reviews: [] })).ok, false);
});
test('parseImported migrates v1 -> v2 (adds badges/lastSurprise)', () => {
  const v1 = JSON.stringify({ version: 1, days: { w1d1: { tasks: { t1: true }, reflection: '', completedAt: '2026-05-30' } }, reviews: [] });
  const res = L.parseImported(v1);
  assert.equal(res.ok, true);
  assert.equal(res.state.version, 2);
  assert.deepEqual(res.state.badges, {});
  assert.equal(res.state.lastSurprise, null);
  assert.ok(res.state.days.w1d1);
});
