'use strict';
(function (root) {
  const V = (root.SUNRISE && root.SUNRISE._validate) || (typeof require !== 'undefined' ? require('./core/validate.js') : null);

  // ---------- date helpers (UTC) ----------
  function _ms(s){ const a = s.split('-').map(Number); return Date.UTC(a[0], a[1] - 1, a[2]); }
  function addDays(s, n){ const dt = new Date(_ms(s)); dt.setUTCDate(dt.getUTCDate() + n); return dt.toISOString().slice(0, 10); }
  function diffDays(a, b){ return Math.round((_ms(b) - _ms(a)) / 86400000); }
  function weekdayMon(s){ return ((diffDays('2024-01-01', s)) % 7 + 7) % 7; } // 0=Mon..6=Sun

  // ---------- pack structure ----------
  function allItems(pack){ return pack.groups.flatMap((g) => g.items); }
  function getItem(pack, id){ return allItems(pack).find((i) => i.id === id) || null; }
  function _tasks(item){ return item.tasks || []; }
  function tracksOf(pack){ const s = new Set(); for (const it of allItems(pack)) if (!it.rest) s.add(it.track); return Array.from(s); }

  // ---------- progress ----------
  function createInitialProgress(){ return { schema:'sunrise.progress/v1', items:{}, reviews:[], badges:{}, lastSurprise:null }; }
  function _ensure(items, id){ return items[id] ? { ...items[id] } : { tasks:{}, reflection:'', completedAt:null, completedHour:null }; }
  function isItemComplete(pack, progress, id){
    const item = getItem(pack, id);
    if (!item || item.rest || _tasks(item).length === 0) return false;
    const st = progress.items[id]; if (!st) return false;
    return _tasks(item).every((t) => st.tasks[t.id]);
  }
  function setTaskDone(pack, progress, id, taskId, done, today, hour){
    const items = { ...progress.items }; const it = _ensure(items, id); it.tasks = { ...it.tasks };
    if (done) it.tasks[taskId] = true; else delete it.tasks[taskId];
    items[id] = it; const next = { ...progress, items };
    if (isItemComplete(pack, next, id)){ if (!it.completedAt){ it.completedAt = today; it.completedHour = (typeof hour === 'number' ? hour : null); } }
    else { it.completedAt = null; it.completedHour = null; }
    return next;
  }
  function setReflection(progress, id, text){ const items = { ...progress.items }; const it = _ensure(items, id); it.reflection = text; items[id] = it; return { ...progress, items }; }

  // ---------- streaks / dates ----------
  function _activeDates(p){ const s = new Set(); for (const id in p.items){ const c = p.items[id].completedAt; if (c) s.add(c); } return s; }
  function completedDates(p){ return Array.from(_activeDates(p)).sort(); }
  function computeStreak(p, today){ const set = _activeDates(p); if (!set.size) return 0; let cur; if (set.has(today)) cur = today; else if (set.has(addDays(today, -1))) cur = addDays(today, -1); else return 0; let n = 0; while (set.has(cur)){ n++; cur = addDays(cur, -1); } return n; }
  function longestStreak(p){ const d = completedDates(p); if (!d.length) return 0; let best = 1, cur = 1; for (let i = 1; i < d.length; i++){ if (diffDays(d[i - 1], d[i]) === 1) cur++; else cur = 1; if (cur > best) best = cur; } return best; }
  function _hasComeback(p){ const d = completedDates(p); for (let i = 1; i < d.length; i++) if (diffDays(d[i - 1], d[i]) >= 2) return true; return false; }
  function _hours(p){ const h = []; for (const id in p.items){ const it = p.items[id]; if (it.completedAt != null && typeof it.completedHour === 'number') h.push(it.completedHour); } return h; }

  // ---------- aggregation ----------
  function _bump(acc, k, done){ const a = acc[k] || (acc[k] = { done:0, total:0, pct:0 }); a.total++; if (done) a.done++; }
  function _fin(acc){ for (const k in acc) acc[k].pct = acc[k].total ? Math.round(acc[k].done / acc[k].total * 100) : 0; return acc; }
  function progressByTrack(pack, p){ const acc = {}; for (const it of allItems(pack)){ if (it.rest) continue; _bump(acc, it.track, isItemComplete(pack, p, it.id)); } return _fin(acc); }
  function progressByPhase(pack, p){ const acc = {}; for (const g of pack.groups){ if (g.phase == null) continue; for (const it of g.items){ if (it.rest) continue; _bump(acc, g.phase, isItemComplete(pack, p, it.id)); } } return _fin(acc); }
  function overallProgress(pack, p){ let done = 0, total = 0; for (const it of allItems(pack)){ if (it.rest) continue; total++; if (isItemComplete(pack, p, it.id)) done++; } return { done, total, pct: total ? Math.round(done / total * 100) : 0 }; }
  function countCompletedTasks(pack, p, track){ let n = 0; for (const it of allItems(pack)){ if (track && it.track !== track) continue; const st = p.items[it.id]; if (!st || !st.tasks) continue; for (const t of _tasks(it)) if (st.tasks[t.id]) n++; } return n; }
  function reflectionCount(p){ let n = 0; for (const id in p.items){ const r = p.items[id].reflection; if (r && r.trim()) n++; } return n; }
  function completedGroups(pack, p){ let n = 0; for (const g of pack.groups){ const work = g.items.filter((it) => !it.rest); if (work.length && work.every((it) => isItemComplete(pack, p, it.id))) n++; } return n; }

  // ---------- spaced repetition ----------
  const REVIEW_INTERVALS = [1, 3, 7, 16];
  function scheduleReview(p, itemId, today){ const reviews = p.reviews.filter((r) => r.itemId !== itemId); reviews.push({ itemId, lastDate:today, stage:0 }); return { ...p, reviews }; }
  function getDueReviews(p, today){ return p.reviews.filter((r) => { const stage = Math.min(Math.max(r.stage, 0), REVIEW_INTERVALS.length - 1); return diffDays(r.lastDate, today) >= REVIEW_INTERVALS[stage]; }).map((r) => r.itemId); }
  function completeReview(p, itemId, today){ const reviews = p.reviews.map((r) => r.itemId === itemId ? { ...r, lastDate:today, stage: Math.min(r.stage + 1, REVIEW_INTERVALS.length - 1) } : r); return { ...p, reviews }; }

  // ---------- badge interpreter ----------
  function badgeContext(pack, p, today){
    const overall = overallProgress(pack, p), byTrack = progressByTrack(pack, p), byPhase = progressByPhase(pack, p);
    return {
      longestStreak: longestStreak(p), daysDone: overall.done, total: overall.total, pct: overall.pct,
      reflections: reflectionCount(p), groupsComplete: completedGroups(pack, p), hasComeback: _hasComeback(p),
      tracks: tracksOf(pack), dates: completedDates(p), hours: _hours(p),
      tasks: (track) => countCompletedTasks(pack, p, track),
      trackDone: (track) => (byTrack[track] || { done:0 }).done,
      trackPct: (track) => (byTrack[track] || { pct:0 }).pct,
      phasePct: (phase) => (byPhase[phase] || { pct:0 }).pct,
      itemComplete: (id) => isItemComplete(pack, p, id),
      weekday: (d) => weekdayMon(d),
    };
  }
  function _dedupe(rules){ const idx = {}, out = []; for (const r of rules){ if (idx[r.id] != null) out[idx[r.id]] = r; else { idx[r.id] = out.length; out.push(r); } } return out; }
  function evaluateBadges(pack, p, today, rules){
    const owned = p.badges || {}, ctx = badgeContext(pack, p, today);
    return _dedupe(rules).map((r) => { const def = V.BADGE_RULES[r.type]; return { id:r.id, unlocked: !!owned[r.id] || (def ? !!def.test(r, ctx) : false), at: owned[r.id] ? owned[r.id].at : null }; });
  }
  function syncBadges(pack, p, today, rules){
    const badges = { ...(p.badges || {}) }, ctx = badgeContext(pack, p, today), unlocked = [];
    for (const r of _dedupe(rules)){ const def = V.BADGE_RULES[r.type]; if (!badges[r.id] && def && def.test(r, ctx)){ badges[r.id] = { at:today }; unlocked.push(r.id); } }
    return { progress: { ...p, badges }, unlocked };
  }

  const API = {
    addDays, diffDays, weekdayMon,
    allItems, getItem, tracksOf,
    createInitialProgress, isItemComplete, setTaskDone, setReflection,
    completedDates, computeStreak, longestStreak,
    progressByTrack, progressByPhase, overallProgress, countCompletedTasks, reflectionCount, completedGroups,
    REVIEW_INTERVALS, scheduleReview, getDueReviews, completeReview,
    badgeContext, evaluateBadges, syncBadges,
    // re-exported from core/validate.js:
    BADGE_RULES: V.BADGE_RULES, validatePack: V.validatePack, validateTheme: V.validateTheme,
    validateProgress: V.validateProgress, serializeProgress: V.serializeProgress, parseProgress: V.parseProgress,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (root){ root.SUNRISE = root.SUNRISE || {}; root.RoadmapLogic = API; }
})(typeof window !== 'undefined' ? window : globalThis);
