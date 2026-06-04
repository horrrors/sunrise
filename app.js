'use strict';
(function () {
  var L = window.RoadmapLogic, S = window.SUNRISE || {}, ST = S.state, DEF = (S.defaults || { ui:{}, badges:[], mottos:[] });
  var $ = function (id){ return document.getElementById(id); };
  var store = window.localStorage;
  var packs = (S.packs ? S.packs() : []), themes = (S.themes ? S.themes() : []);
  var pack, theme, progress, rules, allItems, groupById, currentItemId, calOffset = 0, M = [], _motdI = 0;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function (c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function todayStr(){ return new Date().toISOString().slice(0,10); }
  function ui(k){ return (pack && pack.ui && pack.ui[k] != null) ? pack.ui[k] : (DEF.ui[k] != null ? DEF.ui[k] : ''); }
  function lbl(k, fb){ var l = pack && pack.settings && pack.settings.labels; return (l && l[k] != null) ? l[k] : ui(fb); }
  function trackMeta(t){ for (var i = 0; i < pack.tracks.length; i++) if (pack.tracks[i].id === t) return pack.tracks[i]; return { label:'', icon:'' }; }
  function badgeText(id){ for (var i = 0; i < rules.length; i++) if (rules[i].id === id) return rules[i]; return { title:id, desc:'', icon:'•' }; }

  function selectPack(id){
    pack = packs.find(function (p){ return p.id === id; }) || packs[0];
    progress = ST.loadProgress(store, pack.id);
    rules = (DEF.badges || []).concat(pack.badges || []);
    allItems = L.allItems(pack);
    groupById = {}; pack.groups.forEach(function (g){ g.items.forEach(function (it){ groupById[it.id] = g; }); });
    document.documentElement.lang = pack.locale || 'en';
    pack.tracks.forEach(function (t){ if (t.color) document.documentElement.style.setProperty('--track-' + t.id, t.color); });
    M = (pack.mottos && pack.mottos.length) ? pack.mottos : (DEF.mottos || []); _motdI = 0;
  }
  function saveProgress(){ ST.saveProgress(store, pack.id, progress); }
  function defaultItemId(){ var o = allItems.find(function (it){ return !it.rest && !L.isItemComplete(pack, progress, it.id); }); return (o || allItems[allItems.length - 1]).id; }
  function itemIndex(){ return allItems.findIndex(function (it){ return it.id === currentItemId; }); }
  function groupOrdinal(id){ return pack.groups.indexOf(groupById[id]) + 1; }
  function goToItem(delta){ var i = itemIndex(), j = Math.min(Math.max(i + delta, 0), allItems.length - 1); if (j !== i){ currentItemId = allItems[j].id; renderAll(); if (window.scrollTo){ try { window.scrollTo({ top:0, behavior:'smooth' }); } catch (e) {} } } }
  function completedCount(){ return Object.keys(progress.items).filter(function (id){ return progress.items[id].completedAt; }).length; }

  function renderPackSelect(){
    var sel = $('packSelect'); if (!sel) return;
    sel.innerHTML = packs.map(function (p){ return '<option value="' + esc(p.id) + '"' + (p.id === pack.id ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('');
    sel.onchange = function (){ var sess = ST.loadSession(store); sess.activePackId = sel.value; ST.saveSession(store, sess); selectPack(sel.value); currentItemId = defaultItemId(); renderAll(); };
  }
  function renderItemSelect(){
    var sel = $('daySelect');
    sel.innerHTML = allItems.map(function (it){ var g = groupById[it.id], tl = it.rest ? ui('restVert') : trackMeta(it.track).label; return '<option value="' + esc(it.id) + '"' + (it.id === currentItemId ? ' selected' : '') + '>' + esc(g.title) + ' · ' + esc(tl) + '</option>'; }).join('');
    sel.onchange = function (){ currentItemId = sel.value; renderAll(); };
  }
  function renderThemeSelect(){
    var sel = $('themeSelect');
    sel.innerHTML = themes.map(function (t){ return '<option value="' + esc(t.id) + '"' + (theme && t.id === theme.id ? ' selected' : '') + '>' + esc(t.name) + '</option>'; }).join('');
    sel.onchange = function (){ var t = themes.find(function (x){ return x.id === sel.value; }); if (t) applyTheme(t); };
  }
  function applyTheme(t){ var link = $('themeCss'); if (link) link.href = t.cssHref; document.documentElement.setAttribute('data-theme', t.id); var sess = ST.loadSession(store); sess.themeId = t.id; ST.saveSession(store, sess); theme = t; }

  function renderToday(){
    var it = L.getItem(pack, currentItemId), el = $('todayCard'), m = trackMeta(it.track), g = groupById[it.id], cfg = pack.settings || {};
    el.setAttribute('data-track', it.track);
    $('phaseLabel').textContent = ui('phaseLabel').replace('{p}', g.phase == null ? '' : g.phase).replace('{w}', groupOrdinal(it.id));
    var i = itemIndex(), notLast = i < allItems.length - 1;
    if (it.rest){
      var due = cfg.reviews ? L.getDueReviews(progress, todayStr()) : [];
      el.innerHTML = '<div class="today-side"><span class="vert">' + esc(ui('restVert')) + '</span></div><div class="today-main">' +
        '<h2 class="today-title">' + esc(ui('restTitle')) + '</h2>' +
        '<p class="warm"><span class="warm-i">☾</span> ' + esc(it.reflectPrompt || '') + '</p>' +
        '<div class="rest-due">' + (due.length ? esc(ui('dueToday')) + ' — <b>' + esc(due.join(' · ')) + '</b>' : esc(ui('restToday'))) + '</div>' +
        (notLast ? '<button class="next-day-cta" id="nextDayCta" type="button">' + esc(ui('nextDay')) + '</button>' : '') + '</div>';
      syncDayNav(); return;
    }
    var st = progress.items[currentItemId] || { tasks:{}, reflection:'' }, complete = L.isItemComplete(pack, progress, currentItemId);
    el.innerHTML = '<div class="today-side"><span class="vert">' + esc(ui('todayVert')) + '</span></div><div class="today-main">' +
      '<span class="trackpill"><span class="k">' + esc(m.icon || '') + '</span> ' + esc(m.label) + '</span>' +
      '<h2 class="today-title">' + esc(it.title || '') + '</h2>' +
      (cfg.warmups !== false && it.warmup ? '<div class="warm"><span class="warm-i">✦</span> <span class="muted">' + esc(ui('warmup')) + '</span> ' + esc(it.warmup) + '</div>' : '') +
      '<div class="tasks" id="taskList"></div>' +
      (cfg.reflections !== false ? '<div class="reflect-block"><label class="reflect-label" for="reflect"><span class="kanji">省</span> ' + esc(ui('reflect')) + (it.reflectPrompt ? ' — ' + esc(it.reflectPrompt) : '') + '</label><textarea id="reflect" placeholder="' + esc(ui('taskPlaceholder')) + '">' + esc(st.reflection || '') + '</textarea></div>' : '') +
      ((it.resources && it.resources.length) ? '<div class="res-row">' + it.resources.map(function (r){ return '<span class="chip"><b>' + esc(r.label) + '</b> ' + esc(r.note) + '</span>'; }).join('') + '</div>' : '') +
      ((m.reviewable && cfg.reviews) ? '<button class="btn gold" id="markReview" type="button">' + esc(ui('scheduleReview')) + '</button>' : '') +
      ((complete && notLast) ? '<button class="next-day-cta" id="nextDayCta" type="button">' + esc(ui('nextDay')) + '</button>' : '') + '</div>';
    $('taskList').innerHTML = (it.tasks || []).map(function (t, k){ var done = !!(st.tasks && st.tasks[t.id]); var label = '<label class="task ' + (done ? 'done' : '') + '" style="animation-delay:' + (k * 55) + 'ms"><input type="checkbox" id="cb_' + esc(t.id) + '"' + (done ? ' checked' : '') + '/><span class="box"></span><span class="task-text">' + esc(t.text) + '</span></label>'; if (!t.guidance) return label; return '<div class="task-wrap">' + label + '<details class="task-hint"><summary>' + esc(ui('hint')) + '</summary><div class="task-hint-body">' + esc(t.guidance) + '</div></details></div>'; }).join('');
    (it.tasks || []).forEach(function (t){ $('cb_' + t.id).onchange = function (e){ var was = L.isItemComplete(pack, progress, currentItemId); progress = L.setTaskDone(pack, progress, currentItemId, t.id, e.target.checked, todayStr(), new Date().getHours()); if (!was && L.isItemComplete(pack, progress, currentItemId)) onItemCompleted(); saveProgress(); renderAll(); }; });
    if (cfg.reflections !== false) $('reflect').oninput = function (e){ progress = L.setReflection(progress, currentItemId, e.target.value); saveProgress(); };
    if (m.reviewable && cfg.reviews) $('markReview').onclick = function (){ progress = L.scheduleReview(progress, g.id + '-' + (it.title || it.id), todayStr()); saveProgress(); renderAll(); };
    syncDayNav();
  }
  function syncDayNav(){ var i = itemIndex(); if ($('prevDay')) $('prevDay').disabled = i <= 0; if ($('nextDay')) $('nextDay').disabled = i >= allItems.length - 1; if ($('nextDayCta')) $('nextDayCta').onclick = function (){ goToItem(1); }; }

  function bar(p){ return '<div class="bar"><i style="width:' + p + '%"></i></div>'; }
  function renderDashboard(){
    var o = L.overallProgress(pack, progress), streak = L.computeStreak(progress, todayStr()), bp = L.progressByPhase(pack, progress), bt = L.progressByTrack(pack, progress);
    var phaseList = pack.phases || [];
    var phaseRows = phaseList.map(function (ph){ var x = bp[ph.id] || { done:0, total:0, pct:0 }; return '<div class="prow"><span class="lbl"><i></i>' + esc(ph.title || (lbl('phase','phaseWord') + ' ' + ph.id)) + '</span><span class="val">' + x.done + '/' + x.total + '</span></div>' + bar(x.pct); }).join('');
    var trackRows = pack.tracks.filter(function (t){ return bt[t.id]; }).map(function (t){ var x = bt[t.id]; return '<div class="prow" data-track="' + esc(t.id) + '"><span class="lbl"><i></i>' + esc(t.label) + '</span><span class="val">' + x.pct + '%</span></div><div class="bar" data-track="' + esc(t.id) + '"><i style="width:' + x.pct + '%"></i></div>'; }).join('');
    var sw = DEF.ui.streakWords || ['', '', ''], streakWord = (streak === 1 ? sw[0] : (streak >= 2 && streak <= 4 ? sw[1] : sw[2]));
    $('dashboard').innerHTML =
      '<div class="stat-card" data-kind="progress"><div class="eyebrow">' + esc(ui('overallTitle')) + '</div><div class="ring" style="--p:' + o.pct + '"><div><b>' + o.pct + '%</b><small>' + o.done + '/' + o.total + '</small></div></div><div class="stat-sub" style="text-align:center">' + esc(ui('daysOf').replace('{n}', o.total)) + '</div></div>' +
      '<div class="stat-card" data-kind="streak"><div class="eyebrow">' + esc(ui('streakTitle')) + '</div><div class="flame">🔥</div><div class="streak-num">' + streak + '</div><div class="stat-sub">' + streakWord + ' ' + esc(ui('inARow')) + '</div></div>' +
      (phaseList.length ? '<div class="stat-card" data-kind="phases"><div class="eyebrow">' + esc(ui('phasesTitle')) + '</div>' + phaseRows + '</div>' : '') +
      '<div class="stat-card" data-kind="tracks"><div class="eyebrow">' + esc(ui('tracksTitle')) + '</div>' + (trackRows || '<div class="muted">—</div>') + '</div>';
  }
  function renderComeback(){
    var cb = $('comeback'); if (!cb) return;
    var b = L.evaluateBadges(pack, progress, todayStr(), rules).find(function (x){ return x.id === 'comeback'; });
    if (b && b.unlocked && L.computeStreak(progress, todayStr()) <= 2){ cb.style.display = ''; cb.innerHTML = '🩹 ' + esc(ui('comeback').replace('{n}', completedCount())); } else cb.style.display = 'none';
  }
  function renderCalendar(){
    var grid = $('calGrid'); if (!grid) return;
    var dh = $('calDow'); if (dh) dh.innerHTML = (DEF.ui.dow || []).map(function (x){ return '<span>' + esc(x) + '</span>'; }).join('');
    var done = {}; L.completedDates(progress).forEach(function (d){ done[d] = 1; });
    var t = todayStr().split('-'), y = +t[0], m = +t[1]; m += calOffset; while (m < 1){ m += 12; y--; } while (m > 12){ m -= 12; y++; }
    var first = y + '-' + (m < 10 ? '0' : '') + m + '-01', start = L.addDays(first, -L.weekdayMon(first)), cells = '';
    for (var k = 0; k < 42; k++){ var dd = L.addDays(start, k), cls = 'cday'; if (dd.slice(0,7) !== first.slice(0,7)) cls += ' other'; if (done[dd]) cls += ' done'; if (dd === todayStr()) cls += ' today'; cells += '<span class="' + cls + '">' + (+dd.slice(8,10)) + '</span>'; }
    grid.innerHTML = cells;
    var MN = DEF.ui.months || []; if ($('calTitle')) $('calTitle').textContent = (MN[m-1] || '') + ' ' + y;
  }
  function renderTrophies(){
    var host = $('trophiesGrid'); if (!host) return;
    var all = L.evaluateBadges(pack, progress, todayStr(), rules), got = all.filter(function (b){ return b.unlocked; }).length;
    if ($('trophiesTitle')) $('trophiesTitle').textContent = ui('trophies') + ' · ' + got + '/' + all.length;
    host.innerHTML = all.map(function (b){ var t = badgeText(b.id); return '<div class="badge ' + (b.unlocked ? 'on' : 'off') + '" data-tip="' + esc(t.title + ' — ' + (t.desc || '')) + '"><span class="bi">' + esc(t.icon || '•') + '</span><span class="bt">' + esc(t.title) + '</span></div>'; }).join('');
  }

  function _rotateMotd(){ var el = $('motd'); if (!el || !M.length) return; el.classList.add('motd-out'); setTimeout(function (){ _motdI = (_motdI + 1) % M.length; el.textContent = M[_motdI]; el.classList.remove('motd-out'); }, 600); }
  function celebrate(){ var fx = $('fx'); if (!fx) return; var flash = document.createElement('div'); flash.className = 'fx-flash'; fx.appendChild(flash); setTimeout(function (){ if (flash.parentNode) flash.parentNode.removeChild(flash); }, 650); for (var k = 0; k < 30; k++){ var p = document.createElement('span'); p.className = 'confetti-piece'; p.style.left = (Math.random()*100) + '%'; p.style.setProperty('--i', k); p.style.setProperty('--dx', (Math.random()*2-1).toFixed(2)); p.style.setProperty('--dy', Math.random().toFixed(2)); p.style.setProperty('--rot', Math.floor(Math.random()*720-360) + 'deg'); p.style.animationDelay = (Math.random()*0.2) + 's'; fx.appendChild(p); setTimeout((function (n){ return function (){ if (n.parentNode) n.parentNode.removeChild(n); }; })(p), 1900); } }
  function _toast(cls, html){ var fx = $('fx'); if (!fx) return; var el = document.createElement('div'); el.className = cls; el.innerHTML = html; fx.appendChild(el); setTimeout(function (){ el.classList.add('show'); }, 20); setTimeout(function (){ el.classList.remove('show'); setTimeout(function (){ if (el.parentNode) el.parentNode.removeChild(el); }, 400); }, 3500); }
  function showBadgeToast(ids){ var first = badgeText(ids[0]); _toast('badge-toast', '<span class="bt-i">' + esc(first.icon || '•') + '</span><span>' + esc(ui('newTrophy')) + ' <b>' + esc(first.title) + '</b></span>'); }
  function onItemCompleted(){ celebrate(); var r = L.syncBadges(pack, progress, todayStr(), rules); progress = r.progress; if (r.unlocked.length) showBadgeToast(r.unlocked); if (Math.random() < 0.12){ var pool = pack.surprises || []; var msg = pool[Math.floor(Math.random()*(pool.length||1))] || ''; if (msg){ progress = Object.assign({}, progress, { lastSurprise:{ text:msg, at:todayStr() } }); _toast('toast', esc(msg)); } } }

  function renderAll(){ renderPackSelect(); renderItemSelect(); renderToday(); renderDashboard(); renderComeback(); renderTrophies(); }

  function init(){
    if (!L || !S.packs || !packs.length){ document.body.innerHTML = '<p style="padding:24px;font:16px system-ui">Failed to load plugins. Check that core/*.js, logic.js, and data/* sit next to index.html.</p>'; return; }
    ST.migrate(store);
    var sess = ST.loadSession(store);
    selectPack((packs.find(function (p){ return p.id === sess.activePackId; }) || packs[0]).id);
    theme = themes.find(function (t){ return t.id === sess.themeId; }) || themes[0];
    if (theme) applyTheme(theme);
    currentItemId = defaultItemId();

    [['exportBtn','export'],['importBtn','import']].forEach(function (p){ if ($(p[0])) $(p[0]).textContent = ui(p[1]); });
    [['exportBtn','export'],['importBtn','import'],['calBtn','calendar'],['trophiesBtn','trophies'],['prevDay','prevDayAria'],['nextDay','nextDayAria']].forEach(function (p){ if ($(p[0])) $(p[0]).setAttribute('aria-label', ui(p[1])); });
    if ($('packSelect')) $('packSelect').setAttribute('aria-label', ui('pack'));
    if ($('themeSelect')) $('themeSelect').setAttribute('aria-label', ui('theme'));
    if ($('daySelect')) $('daySelect').setAttribute('aria-label', lbl('item', 'weekAbbr'));
    renderThemeSelect();

    $('calBtn').onclick = function (){ calOffset = 0; renderCalendar(); $('calModal').classList.add('open'); };
    $('calClose').onclick = function (){ $('calModal').classList.remove('open'); };
    $('calPrev').onclick = function (){ calOffset--; renderCalendar(); };
    $('calNext').onclick = function (){ calOffset++; renderCalendar(); };
    $('calModal').onclick = function (e){ if (e.target.id === 'calModal') $('calModal').classList.remove('open'); };
    $('trophiesBtn').onclick = function (){ renderTrophies(); $('trophiesModal').classList.add('open'); };
    $('trophiesClose').onclick = function (){ $('trophiesModal').classList.remove('open'); };
    $('trophiesModal').onclick = function (e){ if (e.target.id === 'trophiesModal') $('trophiesModal').classList.remove('open'); };
    document.addEventListener('keydown', function (e){ if (e.key === 'Escape'){ var m = document.querySelector('.modal.open'); if (m) m.classList.remove('open'); } });
    $('prevDay').onclick = function (){ goToItem(-1); };
    $('nextDay').onclick = function (){ goToItem(1); };
    $('exportBtn').onclick = function (){ var b = new Blob([L.serializeProgress(progress)], { type:'application/json' }); var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = pack.id + '-progress.json'; a.click(); URL.revokeObjectURL(a.href); };
    $('importBtn').onclick = function (){ $('importFile').click(); };
    $('importFile').onchange = function (e){ var f = e.target.files[0]; if (!f) return; var rd = new FileReader(); rd.onload = function (){ var r = L.parseProgress(String(rd.result)); if (!r.ok){ alert(ui('importFail').replace('{e}', r.error)); return; } progress = r.progress; saveProgress(); currentItemId = defaultItemId(); renderAll(); alert(ui('importOk')); }; rd.readAsText(f); e.target.value = ''; };

    if ($('motd') && M.length) $('motd').textContent = M[0];
    if ($('summaryTitle')) $('summaryTitle').textContent = ui('summaryTitle');
    if ($('todayTitle')) $('todayTitle').textContent = ui('todayTitle');
    if (M.length > 1) setInterval(_rotateMotd, 6000);
    renderAll();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}());
