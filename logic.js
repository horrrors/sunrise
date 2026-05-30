'use strict';

// UMD wrapper: keeps all internals out of the global scope (browser classic-script
// scripts share one global lexical scope, so leaking these names collides with
// index.html's inline script). Exposes only module.exports (Node) / window.RoadmapLogic (browser).
(function (root) {
function _ms(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}
function addDays(dateStr, n) {
  const dt = new Date(_ms(dateStr));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}
function diffDays(a, b) {
  return Math.round((_ms(b) - _ms(a)) / 86400000);
}
function phaseOfWeek(week) {
  return week <= 4 ? 1 : week <= 9 ? 2 : 3;
}
function createInitialState() {
  return { version: 1, days: {}, reviews: [] };
}

function allDays(curriculum) {
  return curriculum.weeks.flatMap((w) => w.days);
}
function getDay(curriculum, dayId) {
  return allDays(curriculum).find((d) => d.id === dayId) || null;
}
function _ensureDay(days, dayId) {
  return days[dayId] ? { ...days[dayId] } : { tasks: {}, reflection: '', completedAt: null };
}
function setTaskDone(state, dayId, taskId, done, today) {
  const days = { ...state.days };
  const day = _ensureDay(days, dayId);
  day.tasks = { ...day.tasks };
  if (done) day.tasks[taskId] = true;
  else delete day.tasks[taskId];
  const anyDone = Object.keys(day.tasks).length > 0;
  day.completedAt = anyDone ? day.completedAt || today : null;
  days[dayId] = day;
  return { ...state, days };
}
function setReflection(state, dayId, text) {
  const days = { ...state.days };
  const day = _ensureDay(days, dayId);
  day.reflection = text;
  days[dayId] = day;
  return { ...state, days };
}
function isDayComplete(curriculum, state, dayId) {
  const day = getDay(curriculum, dayId);
  if (!day || day.tasks.length === 0) return false;
  const st = state.days[dayId];
  if (!st) return false;
  return day.tasks.every((t) => st.tasks[t.id]);
}

function _activeDates(state) {
  const set = new Set();
  for (const id in state.days) {
    const c = state.days[id].completedAt;
    if (c) set.add(c);
  }
  return set;
}
function computeStreak(state, today) {
  const set = _activeDates(state);
  if (set.size === 0) return 0;
  let cursor;
  if (set.has(today)) cursor = today;
  else if (set.has(addDays(today, -1))) cursor = addDays(today, -1);
  else return 0;
  let streak = 0;
  while (set.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function _bump(acc, key, complete) {
  const a = acc[key] || (acc[key] = { done: 0, total: 0, pct: 0 });
  a.total++;
  if (complete) a.done++;
}
function _finalize(acc) {
  for (const k in acc) acc[k].pct = acc[k].total ? Math.round((acc[k].done / acc[k].total) * 100) : 0;
  return acc;
}
function progressByTrack(curriculum, state) {
  const acc = {};
  for (const day of allDays(curriculum)) {
    if (day.track === 'rest') continue;
    _bump(acc, day.track, isDayComplete(curriculum, state, day.id));
  }
  return _finalize(acc);
}
function progressByPhase(curriculum, state) {
  const acc = {};
  for (const day of allDays(curriculum)) {
    if (day.track === 'rest') continue;
    _bump(acc, phaseOfWeek(day.week), isDayComplete(curriculum, state, day.id));
  }
  return _finalize(acc);
}
function overallProgress(curriculum, state) {
  let done = 0, total = 0;
  for (const day of allDays(curriculum)) {
    if (day.track === 'rest') continue;
    total++;
    if (isDayComplete(curriculum, state, day.id)) done++;
  }
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

const REVIEW_INTERVALS = [1, 3, 7, 16]; // days between reviews by stage

function scheduleReview(state, itemId, today) {
  const reviews = state.reviews.filter((r) => r.itemId !== itemId);
  reviews.push({ itemId, lastDate: today, stage: 0 });
  return { ...state, reviews };
}
function getDueReviews(state, today) {
  return state.reviews
    .filter((r) => {
      const interval = REVIEW_INTERVALS[Math.min(r.stage, REVIEW_INTERVALS.length - 1)];
      return diffDays(r.lastDate, today) >= interval;
    })
    .map((r) => r.itemId);
}
function completeReview(state, itemId, today) {
  const reviews = state.reviews.map((r) =>
    r.itemId === itemId
      ? { ...r, lastDate: today, stage: Math.min(r.stage + 1, REVIEW_INTERVALS.length - 1) }
      : r
  );
  return { ...state, reviews };
}

function serializeState(state) {
  return JSON.stringify(state, null, 2);
}
function parseImported(jsonString) {
  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    return { ok: false, error: 'Invalid JSON' };
  }
  if (!data || typeof data !== 'object') return { ok: false, error: 'Not an object' };
  if (data.version !== 1) return { ok: false, error: 'Unsupported version' };
  if (typeof data.days !== 'object' || data.days === null || Array.isArray(data.days))
    return { ok: false, error: 'Missing days' };
  if (!Array.isArray(data.reviews)) return { ok: false, error: 'Missing reviews' };
  return { ok: true, state: { version: 1, days: data.days, reviews: data.reviews } };
}

const RoadmapLogic = {
  addDays, diffDays, phaseOfWeek, createInitialState,
  allDays, getDay, setTaskDone, setReflection, isDayComplete,
  computeStreak, progressByTrack, progressByPhase, overallProgress,
  REVIEW_INTERVALS, scheduleReview, getDueReviews, completeReview,
  serializeState, parseImported,
};

if (typeof module !== 'undefined' && module.exports) module.exports = RoadmapLogic;
if (root) root.RoadmapLogic = RoadmapLogic;
})(typeof window !== 'undefined' ? window : undefined);
