// core/registry.js
'use strict';
(function (root) {
  const S = root.SUNRISE = root.SUNRISE || {};
  const V = S._validate || (typeof require !== 'undefined' ? require('./validate.js') : null);
  const _packs = [], _themes = [], _rejected = [];

  function _register(kind, list, validateFn, obj){
    const r = validateFn(obj);
    if (!r.ok){
      const id = obj && obj.id ? obj.id : '(no id)';
      _rejected.push({ kind, id, errors:r.errors });
      if (typeof console !== 'undefined') console.error(`[sunrise] ${kind} "${id}" rejected:`, r.errors);
      return false;
    }
    list.push(obj); return true;
  }
  S.registerPack  = (p) => _register('pack',  _packs,  V.validatePack,  p);
  S.registerTheme = (t) => _register('theme', _themes, V.validateTheme, t);
  S.packs  = () => _packs.slice();
  S.themes = () => _themes.slice();
  S._rejected = _rejected;
})(typeof window !== 'undefined' ? window : globalThis);
