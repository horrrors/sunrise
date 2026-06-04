'use strict';
(function (root) {
  const S = root.SUNRISE = root.SUNRISE || {};
  const themes = [
    { schema:'sunrise.theme/v1', id:'bonus',     name:'Neo-Brutalist Riso', version:'1.0.0', cssHref:'themes/bonus.css' },
    { schema:'sunrise.theme/v1', id:'neon',      name:'Neon · Кислота',     version:'1.0.0', cssHref:'themes/neon.css' },
    { schema:'sunrise.theme/v1', id:'japanese',  name:'Japanese · 和',      version:'1.0.0', cssHref:'themes/japanese.css' },
    { schema:'sunrise.theme/v1', id:'emerald',   name:'Emerald · Мрамор',   version:'1.0.0', cssHref:'themes/emerald.css' },
    { schema:'sunrise.theme/v1', id:'dashboard', name:'Colorful Dashboard', version:'1.0.0', cssHref:'themes/dashboard.css' },
  ];
  if (typeof S.registerTheme === 'function') themes.forEach((t) => S.registerTheme(t));
  if (typeof module !== 'undefined' && module.exports) module.exports = themes;
})(typeof window !== 'undefined' ? window : globalThis);
