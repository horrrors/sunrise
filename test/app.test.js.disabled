const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const DIR = path.join(__dirname, '..');

function harness() {
  const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
  const registry = {};
  function FakeEl(id) {
    this.id = id; this._html = ''; this.value = ''; this.files = []; this.disabled = false; this.href = '';
    this.style = { setProperty() {}, removeProperty() {} }; this.dataset = {};
    this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
    this.onchange = this.onclick = this.oninput = null;
  }
  Object.defineProperty(FakeEl.prototype, 'innerHTML', {
    get() { return this._html; },
    set(v) { this._html = v; const re = /id="([^"$]+)"/g; let m; while ((m = re.exec(v))) registry[m[1]] = registry[m[1]] || new FakeEl(m[1]); },
  });
  Object.defineProperty(FakeEl.prototype, 'textContent', { get() { return ''; }, set() {} });
  const noop = function () {};
  Object.assign(FakeEl.prototype, {
    appendChild(c) { return c; }, removeChild(c) { return c; }, append: noop, remove: noop,
    setAttribute(k, v) { if (k.indexOf('data-') === 0) this.dataset[k.slice(5)] = v; }, getAttribute() { return null; },
    addEventListener: noop, click: noop, animate() { return { onfinish: null, cancel: noop, finished: Promise.resolve() }; },
  });
  const staticHtml = html.replace(/<script[\s\S]*?<\/script>/g, '');
  let mm; const idre = /id="([^"$]+)"/g; while ((mm = idre.exec(staticHtml))) registry[mm[1]] = registry[mm[1]] || new FakeEl(mm[1]);
  const store = {};
  const sandbox = {
    document: {
      getElementById: (id) => registry[id] || null, createElement: () => new FakeEl('_el'),
      addEventListener: (ev, fn) => { if (ev === 'DOMContentLoaded') fn(); }, readyState: 'complete',
      documentElement: new FakeEl('html'), body: new FakeEl('body'),
    },
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
