# Modular App Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace 5 duplicated theme HTML files with one modular app: a single HTML skeleton + one `app.js` controller + CSS-only swappable themes + JS-wrapped JSON data/content — preserving all current behavior, runnable by double-click (`file://`).

**Architecture:** `logic.js` (pure core, tested) ← `app.js` (the only DOM controller: renders canonical markup, wires events, generic effects, theme switch) ← data in `data/curriculum.js` + `data/content.js` (`window.SUNRISE.*`) ← themes in `themes/*.css` styling canonical hooks. No server, no build, vanilla.

**Tech Stack:** Vanilla HTML/CSS/JS (ES2018, classic scripts for `file://`), `node --test` for logic + app contract test (vm + fake DOM). Reference: `docs/2026-06-01-modular-refactor-design.md` (canonical markup §5, theme CSS contract §6).

---

## File Structure
```
index.html         — single skeleton; <link id="themeCss">; #themeSelect; loads data/* → logic.js → app.js
app.js             — controller/view (the ONLY behavior file)
logic.js           — pure core (state, badge predicates, streak, calendar math, progress, import/export) + tests
data/curriculum.js — window.SUNRISE.curriculum = {phases,weeks} (+ module.exports for tests)
data/content.js    — window.SUNRISE.content = {ui,tracks,badges,mottos,surprises,themes} (+ module.exports)
themes/bonus.css · neon.css · japanese.css · emerald.css · dashboard.css
test/logic.test.js — pure-logic tests (adjusted)
test/app.test.js   — app contract test (vm + fake DOM)
docs/…
DELETE at end: theme-neon.html, theme-japanese.html, theme-emerald.html, theme-dashboard.html, theme-bonus.html, old curriculum.js (root)
```
Work on branch `build-tracker` (current). Commit per task.

---

## Task 1: logic.js — decouple badge TEXT from predicates

**Files:** Modify `logic.js`; Modify `test/logic.test.js`

- [ ] **Step 1: Update tests** — in `test/logic.test.js`, the badges tests must no longer assert title/desc/icon (text moves to content). Replace the `BADGES has 30 achievements` test body with:

```js
test('BADGES has 30 achievements with unique ids and predicates', () => {
  assert.equal(L.BADGES.length, 30);
  assert.equal(new Set(L.BADGES.map((b) => b.id)).size, 30);
  L.BADGES.forEach((b) => { assert.equal(typeof b.predicate, 'function'); });
});

test('evaluateBadges returns {id, unlocked, at} (no text)', () => {
  const e = L.evaluateBadges(CURR2, L.createInitialState(), '2026-05-30');
  assert.equal(e.length, 30);
  assert.deepEqual(Object.keys(e[0]).sort(), ['at', 'id', 'unlocked']);
});
```
Keep all other logic tests (streak, completedDates, syncBadges, parseImported, etc.) unchanged — they reference badges by `id` only.

- [ ] **Step 2: Run tests, expect fail**

Run: `cd /Users/horrs/Documents/sunrise && node --test`
Expected: FAIL — evaluateBadges still returns title/desc/icon keys.

- [ ] **Step 3: Edit `logic.js`** — strip text from `BADGES` entries (keep only `id` + `predicate`) and from `evaluateBadges`. Each BADGES entry becomes e.g. `{ id: 'first-light', predicate: (c, s) => _activeDates(s).size >= 1 }` (drop `title/desc/icon`). Replace `evaluateBadges`:

```js
function evaluateBadges(curriculum, state, today) {
  const owned = state.badges || {};
  return BADGES.map((b) => ({
    id: b.id,
    unlocked: !!owned[b.id] || b.predicate(curriculum, state, today),
    at: owned[b.id] ? owned[b.id].at : null,
  }));
}
```
`syncBadges` unchanged. The 30 predicates unchanged (only their `title/desc/icon` keys removed).

- [ ] **Step 4: Run tests, expect pass** — Run: `node --test` — Expected: PASS (count unchanged, ~37).

- [ ] **Step 5: Commit**
```bash
git add logic.js test/logic.test.js
git commit -m "refactor(logic): decouple badge text from predicates (BADGES = id+predicate)"
```

---

## Task 2: data/content.js — all UI text + badge text + mottos + surprises + tracks + themes

**Files:** Create `data/content.js`

- [ ] **Step 1: Create `data/content.js`** — JS-wrapped JSON, dual-mode (browser global + Node require). Extract ALL text from current themes/logic into here. Track colors stay in CSS (only `label`+`kanji` here). The 30 badge texts come from the design's badge list + current descriptions (incl. precise owl/lark hours). Mottos = the 10 footer phrases; surprises = `logic` `SURPRISES` content (moved here).

```js
'use strict';
(function (root) {
  var content = {
    ui: {
      brandSub: 'dev growth tracker',
      day: 'День', warmup: 'Разминка', reflect: 'Рефлексия',
      export: 'Экспорт', import: 'Импорт', calendar: 'Календарь', trophies: 'Трофеи',
      nextDay: 'Следующий день →', daysInARow: 'дней подряд', scheduleReview: '＋ Запланировать повтор паттерна недели',
      restTitle: 'Разгрузка / повторы', restToday: 'Повторов на сегодня нет. Отдых заслужен 🌙',
      dueToday: 'К повтору сегодня', overallTitle: 'Общий прогресс', streakTitle: 'Серия',
      phasesTitle: 'Фазы', tracksTitle: 'Треки', daysOf91: 'пройдено дней из 91',
      newTrophy: '🏆 Новый трофей!', comeback: 'С возвращением — всего пройдено {n} дней. Продолжаем.',
      importOk: 'Прогресс импортирован.', importFail: 'Импорт не удался: {e}\nТекущий прогресс не изменён.',
    },
    tracks: {
      dsa: { label: 'Алгоритмы', kanji: '算' }, js: { label: 'JavaScript', kanji: 'JS' },
      ts: { label: 'TypeScript', kanji: 'TS' }, node: { label: 'Node.js', kanji: '動' },
      sysdesign: { label: 'System Design', kanji: '設' }, patterns: { label: 'Паттерны', kanji: '匠' },
      distsys: { label: 'Распределённые', kanji: '分' }, db: { label: 'Базы данных', kanji: '庫' },
      cs: { label: 'CS-фундамент', kanji: '基' }, rest: { label: 'Отдых', kanji: '休' },
    },
    badges: {
      'first-light': { title: 'First Light', desc: 'Первый полностью закрытый день', icon: '🌅' },
      'streak-3': { title: 'Разогрев', desc: 'Серия 3 дня подряд', icon: '🌱' },
      'streak-7': { title: '7 дней', desc: 'Серия 7 дней подряд', icon: '🔥' },
      'streak-14': { title: '14 дней', desc: 'Серия 14 дней подряд', icon: '🌋' },
      'streak-30': { title: '30 дней', desc: 'Серия 30 дней подряд', icon: '⚡' },
      'streak-100': { title: '100 дней', desc: 'Серия 100 дней подряд', icon: '💯' },
      'days-10': { title: '10 дней', desc: '10 дней программы пройдено', icon: '📅' },
      'days-25': { title: '25 дней', desc: '25 дней программы пройдено', icon: '🗓️' },
      'days-50': { title: '50 дней', desc: '50 дней программы пройдено', icon: '📆' },
      'halfway': { title: 'Экватор', desc: 'Пройдена половина программы', icon: '🌗' },
      'finisher': { title: 'Финишер', desc: 'Пройдены все дни программы', icon: '🎓' },
      'tasks-100': { title: '100 задач', desc: '100 задач выполнено', icon: '✅' },
      'scribe-10': { title: 'Летописец', desc: '10 рефлексий написано', icon: '✍️' },
      'scribe-30': { title: 'Хронист', desc: '30 рефлексий написано', icon: '📜' },
      'perfect-week': { title: 'Идеальная неделя', desc: 'Неделя пройдена целиком', icon: '🌟' },
      'weeks-4': { title: 'Месяц в деле', desc: '4 недели пройдены целиком', icon: '📈' },
      'polyglot': { title: 'Полиглот', desc: 'Хотя бы один день в каждом треке', icon: '🌐' },
      'dsa-master': { title: 'Магистр алгоритмов', desc: 'Все дни алгоритмов пройдены', icon: '🧠' },
      'node-master': { title: 'Магистр Node', desc: 'Все дни Node.js пройдены', icon: '🟢' },
      'ts-master': { title: 'Магистр TS', desc: 'Все дни TypeScript пройдены', icon: '🔷' },
      'sysdesign-master': { title: 'Магистр System Design', desc: 'Все дни System Design пройдены', icon: '🏗️' },
      'phase-1': { title: 'Фаза I', desc: 'Фаза 1 пройдена', icon: '①' },
      'phase-2': { title: 'Фаза II', desc: 'Фаза 2 пройдена', icon: '②' },
      'phase-3': { title: 'Фаза III', desc: 'Фаза 3 пройдена', icon: '③' },
      'algorithmist': { title: 'Algorithmist', desc: '50 задач по алгоритмам', icon: '🧮' },
      'comeback': { title: 'Comeback', desc: 'Вернулся после пропуска', icon: '🩹' },
      'night-owl': { title: 'Night Owl', desc: 'Закрыл день после 22:00 или до 5:00', icon: '🦉' },
      'early-lark': { title: 'Early Lark', desc: 'Закрыл день до 8:00 утра', icon: '🐦' },
      'capstone': { title: 'Capstone', desc: 'Капстоун завершён', icon: '🏛️' },
      'weekend': { title: 'Воин выходного', desc: 'Закрыл день в субботу или воскресенье', icon: '🌴' },
    },
    mottos: [
      '継続は力なり · постоянство — это сила', '七転び八起き · упал семь раз — встань восемь',
      '千里の道も一歩から · путь в тысячу ли начинается с одного шага',
      '塵も積もれば山となる · и пылинки, накапливаясь, становятся горой',
      '石の上にも三年 · посиди на камне три года — и камень нагреется',
      '為せば成る · возьмёшься — выйдет', '初心忘るべからず · не забывай дух начинающего',
      '雨垂れ石を穿つ · капля камень точит', '急がば回れ · спешишь — иди в обход', '一歩一歩 · шаг за шагом',
    ],
    surprises: [
      'Маленькие шаги каждый день обгоняют рывки раз в месяц.', 'Ты только что стал чуть лучшим инженером, чем вчера.',
      'Сложный процент работает и для навыков — продолжай.', 'День закрыт. Будущий ты благодарит настоящего тебя.',
      'Глубина приходит к тем, кто приходит каждый день.', 'Это не дедлайн — это путь. И ты на нём.',
      '1% в день — это примерно 37× за год.', 'Дисциплина — это свобода будущего тебя.',
    ],
    themes: [
      { id: 'bonus', name: 'Neo-Brutalist Riso' }, { id: 'neon', name: 'Neon · Кислота' },
      { id: 'japanese', name: 'Japanese · 和' }, { id: 'emerald', name: 'Emerald · Мрамор' },
      { id: 'dashboard', name: 'Colorful Dashboard' },
    ],
  };
  root.SUNRISE = root.SUNRISE || {};
  root.SUNRISE.content = content;
  if (typeof module !== 'undefined' && module.exports) module.exports = content;
})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 2: Verify it loads** — Run: `node -e "const c=require('./data/content.js'); console.log(Object.keys(c.badges).length, c.mottos.length, c.themes.length)"` — Expected: `30 10 5`.

- [ ] **Step 3: Commit**
```bash
git add data/content.js
git commit -m "feat(data): content.js — all UI text, badge text, mottos, surprises, tracks, themes"
```

---

## Task 3: data/curriculum.js — reshape to window.SUNRISE.curriculum

**Files:** Create `data/curriculum.js` (from current root `curriculum.js`)

- [ ] **Step 1: Generate `data/curriculum.js`** from the existing root `curriculum.js` data, wrapped as SUNRISE + dual-mode. Run:
```bash
cd /Users/horrs/Documents/sunrise
node -e '
const cur = require("./curriculum.js");
const fs = require("fs");
const body = JSON.stringify({ phases: cur.phases, weeks: cur.weeks }, null, 2);
const out = "\x27use strict\x27;\n(function (root) {\n  var curriculum = " + body +
  ";\n  root.SUNRISE = root.SUNRISE || {};\n  root.SUNRISE.curriculum = curriculum;\n" +
  "  if (typeof module !== \x27undefined\x27 && module.exports) module.exports = curriculum;\n})(typeof window !== \x27undefined\x27 ? window : globalThis);\n";
fs.writeFileSync("data/curriculum.js", out);
console.log("wrote data/curriculum.js");
'
```

- [ ] **Step 2: Update `test/curriculum.test.js`** require path to `../data/curriculum.js` (module.exports is the curriculum object → tests reference `C.weeks`/`C.phases` unchanged).

- [ ] **Step 3: Run tests** — Run: `node --test test/curriculum.test.js` — Expected: PASS (13 weeks / 91 days integrity unchanged).

- [ ] **Step 4: Commit**
```bash
git add data/curriculum.js test/curriculum.test.js
git commit -m "feat(data): curriculum.js -> data/curriculum.js (window.SUNRISE.curriculum)"
```

---

## Task 4: index.html — single skeleton + canonical hooks + theme link + load order

**Files:** Create `index.html` (overwrite the launcher)

- [ ] **Step 1: Write `index.html`** — static skeleton with the canonical ids/classes from spec §5, a `<link id="themeCss">` (default theme), `#themeSelect`, and script load order `data/curriculum.js → data/content.js → logic.js → app.js`. No inline behavior (only app.js). Includes empty containers app.js fills + the two modals + footer + an `#fx` layer for effects.

```html
<!doctype html>
<html lang="ru" data-theme="bonus">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sunrise · 日の出</title>
<link id="themeCss" rel="stylesheet" href="themes/bonus.css" />
</head>
<body>
<header class="app-header">
  <div class="brand"><span class="brand-mark">日の出</span><span class="brand-name">SUNRISE</span><span class="brand-sub" id="phaseLabel"></span></div>
  <div class="toolbar">
    <label class="field"><select id="themeSelect"></select></label>
    <label class="field"><select id="daySelect"></select></label>
    <button class="btn ghost" id="calBtn" type="button" aria-label="Календарь">📅</button>
    <button class="btn ghost" id="trophiesBtn" type="button" aria-label="Трофеи">🏆</button>
    <button class="btn ghost" id="exportBtn" type="button">Экспорт</button>
    <button class="btn ghost" id="importBtn" type="button">Импорт</button>
    <input type="file" id="importFile" accept="application/json" hidden />
  </div>
</header>
<main class="wrap">
  <section class="dash" id="dashboard"></section>
  <div id="comeback" style="display:none"></div>
  <section class="day-rail">
    <button class="day-nav day-prev" id="prevDay" type="button" aria-label="Предыдущий день">‹</button>
    <section class="today-wrap"><article class="today" id="todayCard"></article></section>
    <button class="day-nav day-next" id="nextDay" type="button" aria-label="Следующий день">›</button>
  </section>
</main>
<div class="foot"><span id="motd"></span></div>

<div class="modal" id="calModal">
  <div class="modal-panel cal-panel">
    <div class="cal-head"><button id="calPrev" type="button">‹</button><div id="calTitle"></div><button id="calNext" type="button">›</button><button id="calClose" type="button">✕</button></div>
    <div class="cal-dow"><span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span></div>
    <div class="cal-grid" id="calGrid"></div>
  </div>
</div>
<div class="modal" id="trophiesModal">
  <div class="modal-panel tr-panel">
    <div class="tr-head"><div id="trophiesTitle"></div><button id="trophiesClose" type="button">✕</button></div>
    <div class="tr-grid" id="trophiesGrid"></div>
  </div>
</div>
<div id="fx" aria-hidden="true"></div>

<script src="data/curriculum.js"></script>
<script src="data/content.js"></script>
<script src="logic.js"></script>
<script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit** (page is inert until app.js exists)
```bash
git add index.html
git commit -m "feat(ui): single app skeleton with canonical hooks + theme link"
```

---

## Task 5: app.js — the one controller (unify behavior, generic effects, theme switch)

**Files:** Create `app.js`

- [ ] **Step 1: Write `app.js`** — IIFE; reads `window.RoadmapLogic` + `window.SUNRISE.{curriculum,content}`; renders canonical markup (spec §5) using content text + `esc()`; sets `data-track` (colors come from CSS); generic effects; theme switch + persist; day nav; calendar; trophies (text from `content.badges`); motd from `content.mottos`; export/import. Full file:

```js
'use strict';
(function () {
  var L = window.RoadmapLogic, S = window.SUNRISE || {}, C = S.curriculum, CT = S.content || {};
  var KEY = 'devRoadmapState.v1', THEME_KEY = 'sunriseTheme';
  var $ = function (id) { return document.getElementById(id); };
  var allDays = L.allDays(C);
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function todayStr(){ return new Date().toISOString().slice(0,10); }
  function dowName(d){ return ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'][d-1]; }
  function ui(k){ return (CT.ui && CT.ui[k]) || ''; }
  function trackMeta(t){ return (CT.tracks && CT.tracks[t]) || { label: t, kanji: '' }; }
  function badgeText(id){ return (CT.badges && CT.badges[id]) || { title: id, desc: '', icon: '•' }; }

  function loadState(){ try { var raw = localStorage.getItem(KEY); if (!raw) return L.createInitialState(); var r = L.parseImported(raw); return r.ok ? r.state : L.createInitialState(); } catch (e) { return L.createInitialState(); } }
  function saveState(){ try { localStorage.setItem(KEY, L.serializeState(state)); } catch (e) {} }
  var state = loadState();
  function defaultDayId(){ var o = allDays.find(function (d){ return d.track !== 'rest' && !L.isDayComplete(C, state, d.id); }); return (o || allDays[allDays.length - 1]).id; }
  var currentDayId = defaultDayId();

  function dayIndex(){ return allDays.findIndex(function (d){ return d.id === currentDayId; }); }
  function goToDay(delta){ var i = dayIndex(), j = Math.min(Math.max(i + delta, 0), allDays.length - 1); if (j !== i){ currentDayId = allDays[j].id; renderAll(); if (window.scrollTo){ try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {} } } }
  function completedCount(){ return Object.keys(state.days).filter(function (id){ return state.days[id].completedAt; }).length; }

  function renderDaySelect(){
    var sel = $('daySelect');
    sel.innerHTML = allDays.map(function (d){ return '<option value="' + d.id + '"' + (d.id === currentDayId ? ' selected' : '') + '>Нед ' + d.week + ' · ' + dowName(d.dow) + ' · ' + esc(trackMeta(d.track).label) + '</option>'; }).join('');
    sel.onchange = function (){ currentDayId = sel.value; renderAll(); };
  }

  function renderToday(){
    var d = L.getDay(C, currentDayId), el = $('todayCard'), m = trackMeta(d.track);
    el.setAttribute('data-track', d.track);
    $('phaseLabel').textContent = 'フェーズ ' + L.phaseOfWeek(d.week) + ' · 第' + d.week + '週';
    var i = dayIndex(), notLast = i < allDays.length - 1;
    if (d.track === 'rest'){
      var due = L.getDueReviews(state, todayStr());
      el.innerHTML = '<div class="today-side"><span class="vert">休 · REST</span></div><div class="today-main">' +
        '<span class="trackpill"><span class="k">休</span> ' + esc(m.label) + '</span>' +
        '<h2 class="today-title">' + esc(ui('restTitle')) + '</h2>' +
        '<p class="warm"><span class="warm-i">☾</span> ' + esc(d.reflectPrompt) + '</p>' +
        '<div class="rest-due">' + (due.length ? esc(ui('dueToday')) + ' — <b>' + esc(due.join(' · ')) + '</b>' : esc(ui('restToday'))) + '</div>' +
        (notLast ? '<button class="next-day-cta" id="nextDayCta" type="button">' + esc(ui('nextDay')) + '</button>' : '') +
        '</div>';
      syncDayNav(); return;
    }
    var st = state.days[currentDayId] || { tasks: {}, reflection: '' };
    var dayComplete = L.isDayComplete(C, state, currentDayId);
    el.innerHTML = '<div class="today-side"><span class="vert">今日 · TODAY</span></div><div class="today-main">' +
      '<span class="trackpill"><span class="k">' + esc(m.kanji) + '</span> ' + esc(m.label) + '</span>' +
      '<h2 class="today-title">' + esc(d.title) + '</h2>' +
      '<div class="warm"><span class="warm-i">✦</span> <span class="muted">' + esc(ui('warmup')) + '</span> ' + esc(d.warmup) + '</div>' +
      '<div class="tasks" id="taskList"></div>' +
      '<div class="reflect-block"><label class="reflect-label" for="reflect"><span class="kanji">省</span> ' + esc(ui('reflect')) + ' — ' + esc(d.reflectPrompt) + '</label>' +
      '<textarea id="reflect" placeholder="Короткая заметка...">' + esc(st.reflection || '') + '</textarea></div>' +
      (d.resources.length ? '<div class="res-row">' + d.resources.map(function (r){ return '<span class="chip"><b>' + esc(r.label) + '</b> ' + esc(r.note) + '</span>'; }).join('') + '</div>' : '') +
      (d.track === 'dsa' ? '<button class="btn gold" id="markReview" type="button">' + esc(ui('scheduleReview')) + '</button>' : '') +
      ((dayComplete && notLast) ? '<button class="next-day-cta" id="nextDayCta" type="button">' + esc(ui('nextDay')) + '</button>' : '') +
      '</div>';
    $('taskList').innerHTML = d.tasks.map(function (t, k){ var done = !!(st.tasks && st.tasks[t.id]); return '<label class="task ' + (done ? 'done' : '') + '" style="animation-delay:' + (k * 55) + 'ms"><input type="checkbox" id="cb_' + t.id + '"' + (done ? ' checked' : '') + '/><span class="box"></span><span class="task-text">' + esc(t.text) + '</span></label>'; }).join('');
    d.tasks.forEach(function (t){ $('cb_' + t.id).onchange = function (e){ var was = L.isDayComplete(C, state, currentDayId); state = L.setTaskDone(C, state, currentDayId, t.id, e.target.checked, todayStr(), new Date().getHours()); if (!was && L.isDayComplete(C, state, currentDayId)) onDayCompleted(); saveState(); renderAll(); }; });
    $('reflect').oninput = function (e){ state = L.setReflection(state, currentDayId, e.target.value); saveState(); };
    if (d.track === 'dsa') $('markReview').onclick = function (){ state = L.scheduleReview(state, 'w' + d.week + '-' + d.title, todayStr()); saveState(); renderAll(); };
    syncDayNav();
  }

  function syncDayNav(){
    var i = dayIndex(); if ($('prevDay')) $('prevDay').disabled = i <= 0; if ($('nextDay')) $('nextDay').disabled = i >= allDays.length - 1;
    if ($('nextDayCta')) $('nextDayCta').onclick = function (){ goToDay(1); };
  }

  function bar(p){ return '<div class="bar"><i style="width:' + p + '%"></i></div>'; }
  function renderDashboard(){
    var o = L.overallProgress(C, state), streak = L.computeStreak(state, todayStr()), bp = L.progressByPhase(C, state), bt = L.progressByTrack(C, state);
    var phaseRows = [1,2,3].map(function (p){ var x = bp[p] || { done:0,total:0,pct:0 }; return '<div class="prow"><span class="lbl"><i></i>Фаза ' + p + '</span><span class="val">' + x.done + '/' + x.total + '</span></div>' + bar(x.pct); }).join('');
    var trackKeys = Object.keys(CT.tracks || {}).filter(function (k){ return k !== 'rest' && bt[k]; });
    var trackRows = trackKeys.map(function (k){ var x = bt[k]; return '<div class="prow" data-track="' + k + '"><span class="lbl"><i></i>' + esc(trackMeta(k).label) + '</span><span class="val">' + x.pct + '%</span></div><div class="bar" data-track="' + k + '"><i style="width:' + x.pct + '%"></i></div>'; }).join('');
    var streakWord = (streak === 1 ? 'день' : (streak >= 2 && streak <= 4 ? 'дня' : 'дней'));
    $('dashboard').innerHTML =
      '<div class="stat-card" data-kind="progress"><div class="eyebrow">' + esc(ui('overallTitle')) + '</div><div class="ring" style="--p:' + o.pct + '"><div><b>' + o.pct + '%</b><small>' + o.done + '/' + o.total + '</small></div></div><div class="stat-sub" style="text-align:center">' + esc(ui('daysOf91')) + '</div></div>' +
      '<div class="stat-card" data-kind="streak"><div class="eyebrow">' + esc(ui('streakTitle')) + '</div><div class="flame">🔥</div><div class="streak-num">' + streak + '</div><div class="stat-sub">' + streakWord + ' подряд</div></div>' +
      '<div class="stat-card" data-kind="phases"><div class="eyebrow">' + esc(ui('phasesTitle')) + '</div>' + phaseRows + '</div>' +
      '<div class="stat-card" data-kind="tracks"><div class="eyebrow">' + esc(ui('tracksTitle')) + '</div>' + (trackRows || '<div class="muted">—</div>') + '</div>';
  }

  function renderComeback(){
    var cb = $('comeback'); if (!cb) return;
    var unlocked = L.evaluateBadges(C, state, todayStr()).find(function (b){ return b.id === 'comeback'; }).unlocked;
    if (unlocked && L.computeStreak(state, todayStr()) <= 2){ cb.style.display = ''; cb.innerHTML = '🩹 ' + esc(ui('comeback').replace('{n}', completedCount())); }
    else cb.style.display = 'none';
  }

  // calendar
  var calOffset = 0;
  function _weekdayMon(ds){ return ((L.diffDays('2024-01-01', ds)) % 7 + 7) % 7; }
  function renderCalendar(){
    var grid = $('calGrid'); if (!grid) return;
    var done = {}; L.completedDates(state).forEach(function (d){ done[d] = 1; });
    var t = todayStr().split('-'), y = +t[0], m = +t[1]; m += calOffset; while (m < 1){ m += 12; y--; } while (m > 12){ m -= 12; y++; }
    var first = y + '-' + (m < 10 ? '0' : '') + m + '-01', start = L.addDays(first, -_weekdayMon(first)), cells = '';
    for (var k = 0; k < 42; k++){ var dd = L.addDays(start, k), cls = 'cday'; if (dd.slice(0,7) !== first.slice(0,7)) cls += ' other'; if (done[dd]) cls += ' done'; if (dd === todayStr()) cls += ' today'; cells += '<span class="' + cls + '">' + (+dd.slice(8,10)) + '</span>'; }
    grid.innerHTML = cells;
    var MN = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
    if ($('calTitle')) $('calTitle').textContent = MN[m-1] + ' ' + y;
  }

  function renderTrophies(){
    var host = $('trophiesGrid'); if (!host) return;
    var all = L.evaluateBadges(C, state, todayStr()), got = all.filter(function (b){ return b.unlocked; }).length;
    if ($('trophiesTitle')) $('trophiesTitle').textContent = (ui('trophies') || 'Трофеи') + ' · ' + got + '/' + all.length;
    host.innerHTML = all.map(function (b){ var t = badgeText(b.id); return '<div class="badge ' + (b.unlocked ? 'on' : 'off') + '" data-tip="' + esc(t.title + ' — ' + t.desc) + '"><span class="bi">' + t.icon + '</span><span class="bt">' + esc(t.title) + '</span></div>'; }).join('');
  }

  function _rotateMotd(){ var el = $('motd'); if (!el) return; el.classList.add('motd-out'); setTimeout(function (){ _motdI = (_motdI + 1) % M.length; el.textContent = M[_motdI]; el.classList.remove('motd-out'); }, 600); }
  var M = (CT.mottos && CT.mottos.length) ? CT.mottos : ['継続は力なり · постоянство — это сила'], _motdI = 0;

  // effects (generic DOM; CSS themes style .confetti-piece/.toast/.badge-toast)
  function celebrate(){ var fx = $('fx'); if (!fx) return; for (var k = 0; k < 28; k++){ var p = document.createElement('span'); p.className = 'confetti-piece'; p.style.left = (Math.random()*100) + '%'; p.style.setProperty('--i', k); p.style.animationDelay = (Math.random()*0.25) + 's'; fx.appendChild(p); setTimeout((function (n){ return function (){ if (n.parentNode) n.parentNode.removeChild(n); }; })(p), 1800); } }
  function _toast(cls, html){ var fx = $('fx'); if (!fx) return; var t = document.createElement('div'); t.className = cls; t.innerHTML = html; fx.appendChild(t); setTimeout(function (){ t.classList.add('show'); }, 20); setTimeout(function (){ t.classList.remove('show'); setTimeout(function (){ if (t.parentNode) t.parentNode.removeChild(t); }, 400); }, 3500); }
  function showBadgeToast(ids){ var first = badgeText(ids[0]); _toast('badge-toast', '<span class="bt-i">' + first.icon + '</span><span>' + esc(ui('newTrophy')) + ' <b>' + esc(first.title) + '</b></span>'); }
  function showSurprise(text){ _toast('toast', esc(text)); }
  function onDayCompleted(){ celebrate(); var r = L.syncBadges(C, state, todayStr()); state = r.state; if (r.unlocked.length) showBadgeToast(r.unlocked); if (Math.random() < 0.12){ var msg = (CT.surprises || [])[Math.floor(Math.random() * (CT.surprises || ['']).length)] || ''; state.lastSurprise = { text: msg, at: todayStr() }; if (msg) showSurprise(msg); } }

  // theme switching
  function applyTheme(id){ var link = $('themeCss'); if (link) link.href = 'themes/' + id + '.css'; document.documentElement.setAttribute('data-theme', id); try { localStorage.setItem(THEME_KEY, id); } catch (e) {} }
  function initThemeSelect(){
    var sel = $('themeSelect'), themes = CT.themes || [{ id: 'bonus', name: 'Default' }];
    var saved = (function (){ try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } })();
    var active = themes.some(function (t){ return t.id === saved; }) ? saved : themes[0].id;
    sel.innerHTML = themes.map(function (t){ return '<option value="' + t.id + '"' + (t.id === active ? ' selected' : '') + '>' + esc(t.name) + '</option>'; }).join('');
    sel.onchange = function (){ applyTheme(sel.value); };
    applyTheme(active);
  }

  function renderAll(){ renderDaySelect(); renderToday(); renderDashboard(); renderComeback(); renderTrophies(); }

  function init(){
    if (!L || !C){ document.body.innerHTML = '<p style="padding:24px;font:16px system-ui">Не загрузились данные. Проверьте, что рядом лежат logic.js и data/*.js.</p>'; return; }
    initThemeSelect();
    $('calBtn').onclick = function (){ calOffset = 0; renderCalendar(); $('calModal').classList.add('open'); };
    $('calClose').onclick = function (){ $('calModal').classList.remove('open'); };
    $('calPrev').onclick = function (){ calOffset--; renderCalendar(); };
    $('calNext').onclick = function (){ calOffset++; renderCalendar(); };
    $('calModal').onclick = function (e){ if (e.target.id === 'calModal') $('calModal').classList.remove('open'); };
    $('trophiesBtn').onclick = function (){ renderTrophies(); $('trophiesModal').classList.add('open'); };
    $('trophiesClose').onclick = function (){ $('trophiesModal').classList.remove('open'); };
    $('trophiesModal').onclick = function (e){ if (e.target.id === 'trophiesModal') $('trophiesModal').classList.remove('open'); };
    $('prevDay').onclick = function (){ goToDay(-1); };
    $('nextDay').onclick = function (){ goToDay(1); };
    $('exportBtn').onclick = function (){ var b = new Blob([L.serializeState(state)], { type: 'application/json' }); var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'progress.json'; a.click(); URL.revokeObjectURL(a.href); };
    $('importBtn').onclick = function (){ $('importFile').click(); };
    $('importFile').onchange = function (e){ var f = e.target.files[0]; if (!f) return; var rd = new FileReader(); rd.onload = function (){ var r = L.parseImported(String(rd.result)); if (!r.ok){ alert(ui('importFail').replace('{e}', r.error)); return; } state = r.state; saveState(); currentDayId = defaultDayId(); renderAll(); alert(ui('importOk')); }; rd.readAsText(f); e.target.value = ''; };
    if ($('motd')) $('motd').textContent = M[0];
    setInterval(_rotateMotd, 6000);
    renderAll();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}());
```

- [ ] **Step 2: Syntax check** — Run: `node -e "new Function(require('fs').readFileSync('app.js','utf8'))"` — Expected: no error.

- [ ] **Step 3: Commit**
```bash
git add app.js
git commit -m "feat(app): single controller (render, nav, calendar, trophies, effects, theme switch)"
```

---

## Task 6: test/app.test.js — permanent app contract test (vm + fake DOM)

**Files:** Create `test/app.test.js`

- [ ] **Step 1: Write `test/app.test.js`** — loads `index.html`, runs `data/curriculum.js`, `data/content.js`, `logic.js`, `app.js` in document order in a vm with a fake DOM (window === sandbox; getElementById faithful to static ids + ids created via innerHTML; setTimeout/rAF no-op; benign element methods incl. animate). Asserts: globals set; daySelect/today/dashboard rendered; prev/next present; calBtn opens calendar (calGrid has `cday`); trophiesBtn renders 30 tiles (count `data-tip` >= 25); completing a day persists `badges['first-light']`; themeSelect populated and `applyTheme` sets `themeCss.href` + localStorage; motd set. (Use the same harness shape proven in prior verify scripts — scripts in document order, FakeEl with innerHTML id-registration, static-body id pre-registration.)

```js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const DIR = path.join(__dirname, '..');

function harness() {
  const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
  const registry = {};
  function FakeEl(id) { this.id = id; this._html = ''; this.value = ''; this.files = []; this.disabled = false; this.href = '';
    this.style = { setProperty() {}, removeProperty() {} }; this.dataset = {};
    this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
    this.onchange = this.onclick = this.oninput = null; }
  Object.defineProperty(FakeEl.prototype, 'innerHTML', { get() { return this._html; },
    set(v) { this._html = v; const re = /id="([^"$]+)"/g; let m; while ((m = re.exec(v))) registry[m[1]] = registry[m[1]] || new FakeEl(m[1]); } });
  Object.defineProperty(FakeEl.prototype, 'textContent', { get() { return ''; }, set() {} });
  const noop = function () {};
  Object.assign(FakeEl.prototype, { appendChild(c){ return c; }, removeChild(c){ return c; }, append: noop, remove: noop,
    setAttribute(k, v){ if (k.indexOf('data-') === 0) this.dataset[k.slice(5)] = v; }, getAttribute(){ return null; },
    addEventListener: noop, click: noop, animate(){ return { onfinish: null, cancel: noop, finished: Promise.resolve() }; } });
  const staticHtml = html.replace(/<script[\s\S]*?<\/script>/g, '');
  let mm; const idre = /id="([^"$]+)"/g; while ((mm = idre.exec(staticHtml))) registry[mm[1]] = registry[mm[1]] || new FakeEl(mm[1]);
  let store = {};
  const sandbox = {
    document: { getElementById: (id) => registry[id] || null, createElement: () => new FakeEl('_el'),
      addEventListener: (ev, fn) => { if (ev === 'DOMContentLoaded') fn(); }, readyState: 'complete',
      documentElement: new FakeEl('html'), body: new FakeEl('body') },
    localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
    Blob: function () {}, URL: { createObjectURL: () => 'b', revokeObjectURL() {} }, FileReader: function () {},
    alert: noop, setTimeout: () => 0, clearTimeout: noop, setInterval: () => 0, clearInterval: noop, requestAnimationFrame: () => 0,
    console: { log() {}, warn() {}, error() {} }, Date, Math, JSON, Object, Array, String, Number, Set, Map, Symbol, RegExp, Error, Promise, parseInt, parseFloat, isNaN,
  };
  sandbox.window = sandbox;
  const ctx = vm.createContext(sandbox);
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/g; let s;
  while ((s = re.exec(html))) {
    const src = (s[1] || '').match(/src="([^"]+)"/);
    const code = src ? fs.readFileSync(path.join(DIR, src[1]), 'utf8') : s[2];
    vm.runInContext(code, ctx, { filename: src ? src[1] : 'inline' });
  }
  return { registry, sandbox, store };
}

test('app boots and renders canonical regions', () => {
  const { registry, sandbox } = harness();
  assert.ok(sandbox.RoadmapLogic && sandbox.SUNRISE && sandbox.SUNRISE.curriculum, 'globals');
  assert.ok((registry.daySelect.innerHTML || '').includes('<option'), 'daySelect');
  assert.ok((registry.todayCard.innerHTML || '').length > 50, 'todayCard');
  assert.ok((registry.dashboard.innerHTML || '').includes('stat-card'), 'dashboard');
  assert.ok(registry.prevDay && registry.nextDay, 'day nav');
});

test('theme selector populated and applyTheme swaps link + persists', () => {
  const { registry, store } = harness();
  assert.ok((registry.themeSelect.innerHTML || '').includes('<option'), 'themeSelect options');
  assert.ok(/themes\//.test(registry.themeCss.href), 'themeCss href set');
  assert.ok(store['sunriseTheme'], 'theme persisted');
  registry.themeSelect.value = 'neon'; registry.themeSelect.onchange();
  assert.ok(/neon\.css$/.test(registry.themeCss.href), 'theme switched');
  assert.equal(store['sunriseTheme'], 'neon');
});

test('calendar opens and renders; trophies render 30 tiles', () => {
  const { registry } = harness();
  registry.calBtn.onclick();
  assert.ok((registry.calGrid.innerHTML || '').includes('cday'), 'calendar grid');
  registry.trophiesBtn.onclick();
  const tiles = (registry.trophiesGrid.innerHTML.match(/data-tip/g) || []).length;
  assert.ok(tiles >= 25, 'trophies tiles: ' + tiles);
});

test('completing a day persists first-light badge', () => {
  const { registry, store } = harness();
  Object.keys(registry).filter((id) => /^cb_/.test(id)).forEach((id) => { if (registry[id].onchange) registry[id].onchange({ target: { checked: true } }); });
  const saved = JSON.parse(store['devRoadmapState.v1']);
  assert.ok(saved.badges && saved.badges['first-light'], 'first-light persisted');
});
```

- [ ] **Step 2: Run** — Run: `node --test test/app.test.js` — Expected: PASS (4 tests). Fix app.js/index.html if any fail.

- [ ] **Step 3: Commit**
```bash
git add test/app.test.js
git commit -m "test(app): permanent contract test (vm + fake DOM)"
```

---

## Task 7: themes/bonus.css — first CSS-only theme (exemplar)

**Files:** Create `themes/bonus.css`

- [ ] **Step 1: Author `themes/bonus.css`** — pure CSS over the canonical hooks (spec §5/§6). Recreate the neo-brutalist riso look (cream paper, thick black borders, hard offset shadows, Archivo Black/Space Grotesk via `@import` with system fallback, no bespoke DOM). Define `:root` variables (`--bg,--panel,--ink,--ink-dim,--line,--accent,--font-display,--font-body,--font-mono`, track colors `--track-dsa…--track-cs`, confetti colors), and style every hook: `.app-header`, `.btn`, `select`, `.stat-card[data-kind]`, `.ring`, `.bar`/`[data-track] .bar>i` (track color via `var(--track-<k>)`), `.day-rail`, `.day-nav[:disabled]`, `.today`, `.trackpill`, `.task`/`.box`/`.done`, `.next-day-cta`, `#comeback`, `.modal`/`.modal-panel` (whole-modal scroll: `.modal{display:none;position:fixed;inset:0;overflow-y:auto;align-items:flex-start;justify-content:center;padding:32px 16px}`, `.modal.open{display:flex}`, panel `overflow:visible`), `.cal-grid`/`.cday[.done/.today/.other]`, `.tr-grid`/`.badge[.on/.off]` + tooltip `.badge[data-tip]:hover::after`, `.confetti-piece`, `.toast`, `.badge-toast`, `#motd`/`.motd-out`. `[data-track]` selectors set the accent per track.

- [ ] **Step 2: Verify hooks present** — Run:
```bash
cd /Users/horrs/Documents/sunrise && node -e '
const css = require("fs").readFileSync("themes/bonus.css","utf8");
const need = [".stat-card",".modal",".badge",".cday",".task",".confetti-piece",".badge-toast","#motd","--track-dsa","--accent",".day-nav"];
const miss = need.filter(h => !css.includes(h));
console.log(miss.length ? "MISSING: "+miss.join(", ") : "all hooks present");
process.exit(miss.length?1:0);
'
```
Expected: `all hooks present`.

- [ ] **Step 3: Open `index.html` in a browser** (default theme=bonus) and confirm: dashboard (4 cards), day card with tasks, day nav, 📅 calendar opens, 🏆 trophies (30 tiles, tooltips), completing day → confetti + toast, motd rotates, theme select present.

- [ ] **Step 4: Commit**
```bash
git add themes/bonus.css
git commit -m "feat(theme): bonus.css — neo-brutalist riso, CSS-only over canonical hooks"
```

---

## Task 8: themes/{neon,japanese,emerald,dashboard}.css — remaining 4 themes

**Files:** Create `themes/neon.css`, `themes/japanese.css`, `themes/emerald.css`, `themes/dashboard.css`

- [ ] **Step 1: Author each** as a CSS-only theme over the SAME canonical hooks (use `themes/bonus.css` as the structural reference for which selectors to cover; spec §6 lists the variable contract). Recreate each aesthetic (neon = synthwave acid neon glow on black; japanese = washi + mincho + hanko-as-CSS; emerald = marble + brass; dashboard = light fuchsia modern) using only color/type/shadow/animation + `::before/::after` (no bespoke DOM). Each must define all `:root` variables and style every hook from Task 7 Step 1, including effects + tooltip + whole-modal scroll.

- [ ] **Step 2: Verify hooks present (all 4)** — Run:
```bash
cd /Users/horrs/Documents/sunrise && node -e '
const fs=require("fs"); const need=[".stat-card",".modal",".badge",".cday",".task",".confetti-piece",".badge-toast","#motd","--track-dsa","--accent",".day-nav",".tr-grid",".cal-grid"];
for (const f of ["neon","japanese","emerald","dashboard"]){ const css=fs.readFileSync("themes/"+f+".css","utf8"); const miss=need.filter(h=>!css.includes(h)); console.log(f.padEnd(10), miss.length?"MISSING: "+miss.join(", "):"ok"); }
'
```
Expected: each `ok`.

- [ ] **Step 3: Browser smoke** — open `index.html`, switch each theme via `#themeSelect`; confirm each renders correctly (dashboard, day, calendar, trophies+tooltips, effects).

- [ ] **Step 4: Commit**
```bash
git add themes/neon.css themes/japanese.css themes/emerald.css themes/dashboard.css
git commit -m "feat(theme): neon, japanese, emerald, dashboard — CSS-only over canonical hooks"
```

---

## Task 9: Cleanup + final verification

**Files:** Delete old `theme-*.html`, root `curriculum.js`

- [ ] **Step 1: Remove obsolete files**
```bash
cd /Users/horrs/Documents/sunrise
git rm theme-neon.html theme-japanese.html theme-emerald.html theme-dashboard.html theme-bonus.html curriculum.js
```
(Old launcher `index.html` already overwritten in Task 4.)

- [ ] **Step 2: Full test suite** — Run: `node --test` — Expected: ALL pass (logic + curriculum + app contract).

- [ ] **Step 3: Manual smoke** — open `index.html`: switch all 5 themes; verify day nav, completion (confetti+badge toast+CTA), calendar, trophies (30 + tooltips + scroll), comeback (after a simulated miss), motd rotation, export downloads `progress.json`, import restores, text selectable, progress persists across reload.

- [ ] **Step 4: Confirm `progress.json` still gitignored** — Run: `git check-ignore progress.json` — Expected: `progress.json`.

- [ ] **Step 5: Commit**
```bash
git add -A
git commit -m "chore: remove old theme HTML files; modular refactor complete"
```

---

## Self-Review

**1. Spec coverage:**
- §3 layers (logic/app/data/themes) → Tasks 1–8. ✓
- §4 file structure → Tasks 2,3,4,5,7,8 + Task 9 deletes. ✓
- §5 canonical markup → index.html (Task 4) + app.js render templates (Task 5) use the exact ids/classes. ✓
- §6 theme CSS contract + switching → Tasks 7,8 (hooks) + app.js `applyTheme/initThemeSelect` (Task 5) + app.test theme test (Task 6). ✓
- §7 data/content → Tasks 2,3. ✓
- §8 badge-text decoupling → Task 1. ✓
- §9 app.js surface → Task 5 (all functions present). ✓
- §10 load order → index.html script order (Task 4). ✓
- §11 testing → Task 1 (logic) + Task 6 (app contract). ✓
- §12 migration → Task 9. ✓
- §13 error handling → app.js `init` guard, `loadState` try/catch, import alert, missing-theme fallback to first (Task 5). ✓

**2. Placeholder scan:** Themes (Tasks 7–8) are authored to a concrete hook checklist + variable contract + verification command (not "implement later") — CSS is design content, like curriculum authoring. No TBD/TODO. Backbone (logic diff, content.js, curriculum gen, index.html, app.js, app.test.js) has complete code. ✓

**3. Type consistency:** Canonical ids/classes identical across index.html (Task 4), app.js render (Task 5), app.test.js (Task 6), and theme hook checklists (Tasks 7–8): `daySelect, themeSelect, themeCss, dashboard, todayCard, prevDay, nextDay, comeback, calBtn/calModal/calGrid/calTitle/calPrev/calNext/calClose, trophiesBtn/trophiesModal/trophiesGrid/trophiesTitle/trophiesClose, taskList, cb_<id>, reflect, markReview, nextDayCta, motd, fx`. `window.SUNRISE.{curriculum,content}` + `window.RoadmapLogic` consistent. `evaluateBadges → {id,unlocked,at}` consistent between Task 1 and Task 5 (`renderComeback`, `renderTrophies` use only `id/unlocked`). ✓
