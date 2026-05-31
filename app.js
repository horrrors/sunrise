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

  var M = (CT.mottos && CT.mottos.length) ? CT.mottos : ['継続は力なり · постоянство — это сила'], _motdI = 0;
  function _rotateMotd(){ var el = $('motd'); if (!el) return; el.classList.add('motd-out'); setTimeout(function (){ _motdI = (_motdI + 1) % M.length; el.textContent = M[_motdI]; el.classList.remove('motd-out'); }, 600); }

  function celebrate(){
    var fx = $('fx'); if (!fx) return;
    var flash = document.createElement('div'); flash.className = 'fx-flash'; fx.appendChild(flash);
    setTimeout(function (){ if (flash.parentNode) flash.parentNode.removeChild(flash); }, 650);
    for (var k = 0; k < 30; k++){
      var p = document.createElement('span'); p.className = 'confetti-piece';
      p.style.left = (Math.random() * 100) + '%';
      p.style.setProperty('--i', k);
      p.style.setProperty('--dx', (Math.random() * 2 - 1).toFixed(2));   // -1..1 horizontal spread
      p.style.setProperty('--dy', Math.random().toFixed(2));             // 0..1 vertical bias
      p.style.setProperty('--rot', Math.floor(Math.random() * 720 - 360) + 'deg');
      p.style.animationDelay = (Math.random() * 0.2) + 's';
      fx.appendChild(p);
      setTimeout((function (n){ return function (){ if (n.parentNode) n.parentNode.removeChild(n); }; })(p), 1900);
    }
  }
  function _toast(cls, html){ var fx = $('fx'); if (!fx) return; var el = document.createElement('div'); el.className = cls; el.innerHTML = html; fx.appendChild(el); setTimeout(function (){ el.classList.add('show'); }, 20); setTimeout(function (){ el.classList.remove('show'); setTimeout(function (){ if (el.parentNode) el.parentNode.removeChild(el); }, 400); }, 3500); }
  function showBadgeToast(ids){ var first = badgeText(ids[0]); _toast('badge-toast', '<span class="bt-i">' + first.icon + '</span><span>' + esc(ui('newTrophy')) + ' <b>' + esc(first.title) + '</b></span>'); }
  function showSurprise(text){ _toast('toast', esc(text)); }
  function onDayCompleted(){ celebrate(); var r = L.syncBadges(C, state, todayStr()); state = r.state; if (r.unlocked.length) showBadgeToast(r.unlocked); if (Math.random() < 0.12){ var pool = CT.surprises || []; var msg = pool[Math.floor(Math.random() * (pool.length || 1))] || ''; if (msg){ state.lastSurprise = { text: msg, at: todayStr() }; showSurprise(msg); } } }

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
    if ($('summaryTitle')) $('summaryTitle').textContent = ui('summaryTitle');
    if ($('todayTitle')) $('todayTitle').textContent = ui('todayTitle');
    setInterval(_rotateMotd, 6000);
    renderAll();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}());
