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

const RoadmapLogic = { addDays, diffDays, phaseOfWeek, createInitialState };

if (typeof module !== 'undefined' && module.exports) module.exports = RoadmapLogic;
if (typeof window !== 'undefined') window.RoadmapLogic = RoadmapLogic;
