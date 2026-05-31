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
  return { version: 2, days: {}, reviews: [], badges: {}, lastSurprise: null };
}

function allDays(curriculum) {
  return curriculum.weeks.flatMap((w) => w.days);
}
function getDay(curriculum, dayId) {
  return allDays(curriculum).find((d) => d.id === dayId) || null;
}
function _ensureDay(days, dayId) {
  return days[dayId] ? { ...days[dayId] } : { tasks: {}, reflection: '', completedAt: null, completedHour: null };
}
function setTaskDone(curriculum, state, dayId, taskId, done, today, hour) {
  const days = { ...state.days };
  const day = _ensureDay(days, dayId);
  day.tasks = { ...day.tasks };
  if (done) day.tasks[taskId] = true;
  else delete day.tasks[taskId];
  days[dayId] = day;
  const next = { ...state, days };
  if (isDayComplete(curriculum, next, dayId)) {
    if (!day.completedAt) { day.completedAt = today; day.completedHour = (typeof hour === 'number' ? hour : null); }
  } else {
    day.completedAt = null; day.completedHour = null;
  }
  return next;
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
function longestStreak(state) {
  const dates = Array.from(_activeDates(state)).sort();
  if (!dates.length) return 0;
  let best = 1, cur = 1;
  for (let i = 1; i < dates.length; i++) {
    if (diffDays(dates[i - 1], dates[i]) === 1) cur++; else cur = 1;
    if (cur > best) best = cur;
  }
  return best;
}
function countCompletedTasks(curriculum, state, track) {
  let n = 0;
  for (const day of allDays(curriculum)) {
    if (track && day.track !== track) continue;
    const stDay = state.days[day.id];
    if (!stDay || !stDay.tasks) continue;
    for (const t of day.tasks) if (stDay.tasks[t.id]) n++;
  }
  return n;
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

const SURPRISES = [
  'Маленькие шаги каждый день обгоняют рывки раз в месяц.',
  'Ты только что стал чуть лучшим инженером, чем вчера.',
  'Сложный процент работает и для навыков — продолжай.',
  'День закрыт. Будущий ты благодарит настоящего тебя.',
  'Глубина приходит к тем, кто приходит каждый день.',
  'Это не дедлайн — это путь. И ты на нём.',
  '1% в день — это примерно 37× за год.',
  'Дисциплина — это свобода будущего тебя.',
];

function _completedHours(state) {
  const hrs = [];
  for (const id in state.days) {
    const d = state.days[id];
    if (d.completedAt != null && typeof d.completedHour === 'number') hrs.push(d.completedHour);
  }
  return hrs;
}
function _hasComeback(state) {
  const dates = Array.from(_activeDates(state)).sort();
  for (let i = 1; i < dates.length; i++) if (diffDays(dates[i - 1], dates[i]) >= 2) return true;
  return false;
}
const BADGES = [
  { id: 'first-light', title: 'First Light', desc: 'Первый полностью закрытый день', icon: '🌅', predicate: (c, s) => _activeDates(s).size >= 1 },
  { id: 'streak-7', title: '7 дней', desc: 'Серия 7 дней подряд', icon: '🔥', predicate: (c, s) => longestStreak(s) >= 7 },
  { id: 'streak-30', title: '30 дней', desc: 'Серия 30 дней подряд', icon: '⚡', predicate: (c, s) => longestStreak(s) >= 30 },
  { id: 'streak-100', title: '100 дней', desc: 'Серия 100 дней подряд', icon: '💯', predicate: (c, s) => longestStreak(s) >= 100 },
  { id: 'phase-1', title: 'Фаза I', desc: 'Фаза 1 пройдена', icon: '①', predicate: (c, s) => (progressByPhase(c, s)[1] || {}).pct === 100 },
  { id: 'phase-2', title: 'Фаза II', desc: 'Фаза 2 пройдена', icon: '②', predicate: (c, s) => (progressByPhase(c, s)[2] || {}).pct === 100 },
  { id: 'phase-3', title: 'Фаза III', desc: 'Фаза 3 пройдена', icon: '③', predicate: (c, s) => (progressByPhase(c, s)[3] || {}).pct === 100 },
  { id: 'algorithmist', title: 'Algorithmist', desc: '50 задач по алгоритмам', icon: '🧮', predicate: (c, s) => countCompletedTasks(c, s, 'dsa') >= 50 },
  { id: 'comeback', title: 'Comeback', desc: 'Вернулся после пропуска', icon: '🩹', predicate: (c, s) => _hasComeback(s) },
  { id: 'night-owl', title: 'Night Owl', desc: 'Закрыл день поздней ночью', icon: '🦉', predicate: (c, s) => _completedHours(s).some((h) => h >= 22 || h < 5) },
  { id: 'early-lark', title: 'Early Lark', desc: 'Закрыл день ранним утром', icon: '🐦', predicate: (c, s) => _completedHours(s).some((h) => h >= 5 && h < 8) },
  { id: 'capstone', title: 'Capstone', desc: 'Капстоун завершён', icon: '🏛️', predicate: (c, s) => isDayComplete(c, s, 'w13d6') },
];
function evaluateBadges(curriculum, state, today) {
  const owned = state.badges || {};
  return BADGES.map((b) => {
    const persisted = owned[b.id];
    return { id: b.id, title: b.title, desc: b.desc, icon: b.icon,
      unlocked: !!persisted || b.predicate(curriculum, state, today), at: persisted ? persisted.at : null };
  });
}
function syncBadges(curriculum, state, today) {
  const badges = { ...(state.badges || {}) };
  const unlocked = [];
  for (const b of BADGES) {
    if (!badges[b.id] && b.predicate(curriculum, state, today)) { badges[b.id] = { at: today }; unlocked.push(b.id); }
  }
  return { state: { ...state, badges }, unlocked };
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
  if (data.version !== 1 && data.version !== 2) return { ok: false, error: 'Unsupported version' };
  if (typeof data.days !== 'object' || data.days === null || Array.isArray(data.days))
    return { ok: false, error: 'Missing days' };
  if (!Array.isArray(data.reviews)) return { ok: false, error: 'Missing reviews' };
  const badges = (data.badges && typeof data.badges === 'object' && !Array.isArray(data.badges)) ? data.badges : {};
  const lastSurprise = data.lastSurprise || null;
  return { ok: true, state: { version: 2, days: data.days, reviews: data.reviews, badges, lastSurprise } };
}

const RoadmapLogic = {
  addDays, diffDays, phaseOfWeek, createInitialState,
  allDays, getDay, setTaskDone, setReflection, isDayComplete,
  computeStreak, longestStreak, countCompletedTasks,
  progressByTrack, progressByPhase, overallProgress,
  REVIEW_INTERVALS, scheduleReview, getDueReviews, completeReview,
  BADGES, evaluateBadges, syncBadges, SURPRISES,
  serializeState, parseImported,
};

if (typeof module !== 'undefined' && module.exports) module.exports = RoadmapLogic;
if (root) root.RoadmapLogic = RoadmapLogic;
})(typeof window !== 'undefined' ? window : undefined);
