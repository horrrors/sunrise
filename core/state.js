'use strict';
(function (root) {
  const V = (root.SUNRISE && root.SUNRISE._validate) || (typeof require !== 'undefined' ? require('./validate.js') : null);
  const SESSION = 'sunrise.session', PREFIX = 'sunrise.progress.', LEGACY = 'devRoadmapState.v1', LEGACY_THEME = 'sunriseTheme';

  function fresh(){ return { schema:'sunrise.progress/v1', items:{}, reviews:[], badges:{}, lastSurprise:null }; }
  function loadSession(store){ try { const raw = store.getItem(SESSION); return raw ? JSON.parse(raw) : {}; } catch (e) { return {}; } }
  function saveSession(store, s){ try { store.setItem(SESSION, JSON.stringify(s)); } catch (e) {} }
  function loadProgress(store, packId){ try { const raw = store.getItem(PREFIX + packId); if (!raw) return fresh(); const r = V.parseProgress(raw); return r.ok ? r.progress : fresh(); } catch (e) { return fresh(); } }
  function saveProgress(store, packId, progress){ try { store.setItem(PREFIX + packId, V.serializeProgress(progress)); } catch (e) {} }

  function migrate(store){
    if (store.getItem(LEGACY) && !store.getItem(PREFIX + 'dev-roadmap')){
      const r = V.parseProgress(store.getItem(LEGACY));        // parseProgress maps legacy days -> items
      if (r.ok){
        store.setItem(PREFIX + 'dev-roadmap', V.serializeProgress(r.progress));
        const sess = loadSession(store);
        if (!sess.activePackId) sess.activePackId = 'dev-roadmap';
        const th = store.getItem(LEGACY_THEME); if (th && !sess.themeId) sess.themeId = th;
        saveSession(store, sess);
        return true;
      }
    }
    return false;
  }

  const API = { SESSION, PREFIX, LEGACY, fresh, loadSession, saveSession, loadProgress, saveProgress, migrate };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (root){ root.SUNRISE = root.SUNRISE || {}; root.SUNRISE.state = API; }
})(typeof window !== 'undefined' ? window : globalThis);
