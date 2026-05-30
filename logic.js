'use strict';

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

const RoadmapLogic = {
  addDays, diffDays, phaseOfWeek, createInitialState,
  allDays, getDay, setTaskDone, setReflection, isDayComplete,
};

if (typeof module !== 'undefined' && module.exports) module.exports = RoadmapLogic;
if (typeof window !== 'undefined') window.RoadmapLogic = RoadmapLogic;
