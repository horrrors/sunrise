// scripts/reshape-curriculum.js  — one-off transform; run with `node scripts/reshape-curriculum.js`
// NOTE: one-off generator — NO LONGER RUNNABLE. Its inputs (data/curriculum.js,
// data/content.js) were removed once the curriculum became data/packs/dev-roadmap.js.
// Kept for provenance only; the pack is now maintained directly. Do not re-run.
'use strict';
const fs = require('fs');
const path = require('path');
const C = require('../data/curriculum.js'); // { phases, weeks } (module.exports)
const content = require('../data/content.js'); // { tracks, badges, mottos, surprises, ui }

const tracks = Object.keys(content.tracks)
  .filter((id) => id !== 'rest')
  .map((id) => ({
    id,
    label: content.tracks[id].label,
    icon: content.tracks[id].kanji,
    reviewable: id === 'dsa',
  }));
const phases = C.phases.map((p) => ({ id: String(p.id), title: p.title }));

function item(day) {
  if (day.track === 'rest')
    return { id: day.id, track: 'rest', rest: true, reflectPrompt: day.reflectPrompt };
  const it = {
    id: day.id,
    track: day.track,
    title: day.title,
    warmup: day.warmup,
    reflectPrompt: day.reflectPrompt,
    tasks: day.tasks,
  };
  if (day.resources && day.resources.length) it.resources = day.resources;
  return it;
}
const groups = C.weeks.map((w) => ({
  id: 'w' + w.num,
  title: 'Неделя ' + w.num,
  phase: String(w.phase),
  theme: w.theme,
  items: w.days.map(item),
}));

const B = content.badges;
const txt = (id) => ({ title: B[id].title, desc: B[id].desc, icon: B[id].icon });
const badges = [
  { id: 'phase-1', type: 'phase-complete', phase: '1', ...txt('phase-1') },
  { id: 'phase-2', type: 'phase-complete', phase: '2', ...txt('phase-2') },
  { id: 'phase-3', type: 'phase-complete', phase: '3', ...txt('phase-3') },
  { id: 'algorithmist', type: 'tasks-done', track: 'dsa', gte: 50, ...txt('algorithmist') },
  { id: 'capstone', type: 'item-complete', item: 'w13d6', ...txt('capstone') },
  { id: 'dsa-master', type: 'track-complete', track: 'dsa', ...txt('dsa-master') },
  { id: 'node-master', type: 'track-complete', track: 'node', ...txt('node-master') },
  { id: 'ts-master', type: 'track-complete', track: 'ts', ...txt('ts-master') },
  {
    id: 'sysdesign-master',
    type: 'track-complete',
    track: 'sysdesign',
    ...txt('sysdesign-master'),
  },
  { id: 'polyglot', type: 'all-tracks', eachGte: 1, ...txt('polyglot') },
];

const pack = {
  schema: 'sunrise.pack/v1',
  id: 'dev-roadmap',
  name: 'Dev Roadmap',
  version: '1.0.0',
  locale: 'ru',
  settings: {
    labels: { phase: 'Фаза', group: 'Неделя', groupAbbr: 'Нед', item: 'День' },
    reviews: true,
    reflections: true,
    warmups: true,
  },
  ui: {
    phaseLabel: 'フェーズ {p} · 第{w}週',
    todayVert: '今日 · TODAY',
    restVert: '休 · REST',
    scheduleReview: content.ui.scheduleReview,
  },
  tracks,
  phases,
  groups,
  badges,
  mottos: content.mottos,
  surprises: content.surprises,
};

const out =
  "'use strict';\n(function (root) {\n  var pack = " +
  JSON.stringify(pack, null, 2) +
  ';\n' +
  '  if (root.SUNRISE && root.SUNRISE.registerPack) root.SUNRISE.registerPack(pack);\n' +
  "  if (typeof module !== 'undefined' && module.exports) module.exports = pack;\n" +
  "})(typeof window !== 'undefined' ? window : globalThis);\n";
fs.mkdirSync(path.join(__dirname, '..', 'data', 'packs'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'data', 'packs', 'dev-roadmap.js'), out);
console.log(
  'wrote data/packs/dev-roadmap.js (' +
    groups.length +
    ' groups, ' +
    groups.reduce((n, g) => n + g.items.length, 0) +
    ' items)',
);
