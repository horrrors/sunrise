import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Tracker } from '../../src/domain/tracker.ts';
import { Streaks } from '../../src/domain/streaks.ts';
import { ProgressStats } from '../../src/domain/progress-stats.ts';
import { ReviewSchedule } from '../../src/domain/review-schedule.ts';
import { BadgeEngine } from '../../src/domain/badge-engine.ts';
import {
  DEFAULT_UI,
  DEFAULT_STREAK_WORDS,
  DEFAULT_MOTTOS,
  GENERIC_BADGES,
  BUILTIN_THEMES,
} from '../../src/domain/builtins.ts';
import { SystemClock } from '../../src/adapters/system-clock.ts';
import { MathRandom } from '../../src/adapters/math-random.ts';
import {
  LocalStorageProgressStore,
  LocalStorageSessionStore,
} from '../../src/adapters/local-storage-store.ts';
import { WindowPluginRegistry } from '../../src/adapters/window-registry.ts';
import { DomRenderer } from '../../src/adapters/dom-renderer.ts';
import { DomController } from '../../src/adapters/dom-controller.ts';

// ---------------------------------------------------------------------------
// Fake DOM + localStorage harness (ported from the old app.test.js)
// ---------------------------------------------------------------------------

interface Registry {
  [id: string]: FakeEl;
}

class FakeEl {
  id: string;
  tagName = 'DIV';
  type = '';
  _html = '';
  value = '';
  files: unknown[] = [];
  disabled = false;
  href = '';
  lang = '';
  checked = false;
  style = { setProperty(): void {}, removeProperty(): void {} };
  dataset: Record<string, string> = {};
  classList = (() => {
    const s = new Set<string>();
    return {
      add: (c: string): void => void s.add(c),
      remove: (c: string): void => void s.delete(c),
      toggle: (c: string): void => void (s.has(c) ? s.delete(c) : s.add(c)),
      contains: (c: string): boolean => s.has(c),
    };
  })();
  onchange: ((e?: unknown) => void) | null = null;
  onclick: ((e?: unknown) => void) | null = null;
  oninput: ((e?: unknown) => void) | null = null;
  onload: (() => void) | null = null;
  #registry: Registry;

  constructor(id: string, registry: Registry) {
    this.id = id;
    this.#registry = registry;
  }

  get innerHTML(): string {
    return this._html;
  }
  set innerHTML(v: string) {
    this._html = v;
    // Register id-carrying elements, mirroring tagName/type from the markup so
    // activeTaskId()/isTypingTarget() see INPUT[type=checkbox] like a real DOM.
    const tagRe = /<(\w+)([^>]*)>/g;
    let m: RegExpExecArray | null;
    while ((m = tagRe.exec(v))) {
      const attrs = m[2]!;
      const idm = /\bid="([^"$]+)"/.exec(attrs);
      if (!idm) continue;
      const id = idm[1]!;
      const el = (this.#registry[id] = this.#registry[id] || new FakeEl(id, this.#registry));
      el.tagName = m[1]!.toUpperCase();
      const tm = /\btype="([^"]+)"/.exec(attrs);
      if (tm) el.type = tm[1]!;
    }
  }
  textContent = '';
  appendChild(c: unknown): unknown {
    return c;
  }
  removeChild(c: unknown): unknown {
    return c;
  }
  append(): void {}
  remove(): void {}
  attrs: Record<string, string> = {};
  setAttribute(k: string, v: string): void {
    this.attrs[k] = v;
    if (k.indexOf('data-') === 0) this.dataset[k.slice(5)] = v;
  }
  getAttribute(): null {
    return null;
  }
  addEventListener(): void {}
  click(): void {}
  focus(): void {
    (globalThis as { document?: { activeElement?: unknown } }).document!.activeElement = this;
  }
}

interface Harness {
  registry: Registry;
  store: Record<string, string>;
  tracker: Tracker;
  renderer: DomRenderer;
  controller?: DomController;
  registryPlugin: WindowPluginRegistry;
}

function harness(seed?: { store?: Record<string, string> }): Harness {
  const registry: Registry = {};
  // Seed the canonical hook ids from index.html (so getElementById finds them
  // before anything is rendered).
  const STATIC_IDS = [
    'phaseLabel',
    'packSelect',
    'themeSelect',
    'daySelect',
    'trophiesBtn',
    'exportBtn',
    'importBtn',
    'importFile',
    'summaryTitle',
    'dashboard',
    'comeback',
    'todayTitle',
    'prevDay',
    'todayCard',
    'nextDay',
    'motd',
    'cardMapBtn',
    'cardMapModal',
    'cardMapClose',
    'cardMapGrid',
    'cardMapTitle',
    'trophiesModal',
    'trophiesTitle',
    'trophiesClose',
    'trophiesGrid',
    'shortcutsModal',
    'shortcutsTitle',
    'shortcutsClose',
    'shortcutsGrid',
    'fx',
    'themeCss',
    'toolbar',
    'dock',
    'dockBars',
    'dockMapBtn',
    'dockTrophiesBtn',
    'dockMenuBtn',
    'dockStreakFill',
    'dockStreakVal',
    'dockProgressFill',
    'dockProgressVal',
  ];
  for (const id of STATIC_IDS) registry[id] = new FakeEl(id, registry);

  const store: Record<string, string> = seed?.store ?? {};
  const g = globalThis as Record<string, unknown>;
  g['document'] = {
    getElementById: (id: string): FakeEl | null => registry[id] || null,
    createElement: (): FakeEl => new FakeEl('_el', registry),
    querySelector: (): null => null,
    addEventListener: (): void => {},
    documentElement: new FakeEl('html', registry),
    head: new FakeEl('head', registry),
    body: new FakeEl('body', registry),
    activeElement: null as FakeEl | null,
  };
  g['localStorage'] = {
    getItem: (k: string): string | null => (k in store ? store[k]! : null),
    setItem: (k: string, v: string): void => {
      store[k] = String(v);
    },
    removeItem: (k: string): void => {
      delete store[k];
    },
  };
  g['window'] = { scrollTo: (): void => {} };
  g['alert'] = (): void => {};
  g['setInterval'] = (): number => 0;
  g['Blob'] = function (): void {};
  g['URL'] = { createObjectURL: (): string => 'b', revokeObjectURL: (): void => {} };
  g['FileReader'] = function (): void {};

  // Register the real dev-roadmap pack via a fake SUNRISE registry.
  const registryPlugin = new WindowPluginRegistry();
  registryPlugin.addBuiltinThemes(BUILTIN_THEMES);

  const streaks = new Streaks();
  const stats = new ProgressStats();
  const tracker = new Tracker({
    packs: registryPlugin,
    themes: registryPlugin,
    progressStore: new LocalStorageProgressStore(),
    sessionStore: new LocalStorageSessionStore(),
    clock: new SystemClock(),
    random: new MathRandom(),
    streaks,
    stats,
    reviews: new ReviewSchedule(),
    badges: new BadgeEngine(streaks, stats),
    defaultUi: DEFAULT_UI,
    genericBadges: GENERIC_BADGES,
    defaultStreakWords: DEFAULT_STREAK_WORDS,
    defaultMottos: DEFAULT_MOTTOS,
  });

  const renderer = new DomRenderer();
  return { registry, store, tracker, renderer, registryPlugin };
}

// The dev-roadmap pack registers via `root.SUNRISE.registerPack(pack)`, where
// `root = (typeof window !== 'undefined') ? window : globalThis`. Its IIFE runs
// only once per process (ESM module cache), so we capture the pack on first
// import and re-register it into each test's fresh registry.
let CAPTURED_PACK: unknown;
async function registerDevRoadmap(registryPlugin: WindowPluginRegistry): Promise<void> {
  if (CAPTURED_PACK === undefined) {
    const sunrise = {
      registerPack: (p: unknown): void => {
        CAPTURED_PACK = p;
      },
      registerTheme: (): void => {},
    };
    (globalThis as { SUNRISE?: unknown }).SUNRISE = sunrise;
    (globalThis as { window?: { SUNRISE?: unknown } }).window!.SUNRISE = sunrise;
    // Untyped runtime pack (classic-IIFE .js); a string specifier sidesteps the
    // implicit-any on importing a .js module that has no declaration.
    const packPath = '../../data/packs/dev-roadmap.js';
    await import(packPath);
  }
  registryPlugin.registerPack(CAPTURED_PACK);
}

async function boot(seed?: { store?: Record<string, string> }): Promise<Harness> {
  const h = harness(seed);
  await registerDevRoadmap(h.registryPlugin);
  h.tracker.init();
  h.controller = new DomController(h.tracker, h.renderer);
  h.controller.start();
  return h;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const ev = (key: string, extra: Record<string, unknown> = {}): KeyboardEvent =>
  ({ key, preventDefault() {}, ...extra }) as unknown as KeyboardEvent;

test('boots: selectors render <option>s', async () => {
  const { registry, tracker } = await boot();
  assert.ok(tracker.activePackId().length > 0, 'a pack active');
  assert.ok((registry['packSelect']!.innerHTML || '').includes('<option'), 'packSelect options');
  assert.ok((registry['themeSelect']!.innerHTML || '').includes('<option'), 'themeSelect options');
  assert.ok((registry['daySelect']!.innerHTML || '').includes('<option'), 'daySelect options');
});

test('dashboard renders stat-cards', async () => {
  const { registry } = await boot();
  assert.ok((registry['dashboard']!.innerHTML || '').includes('stat-card'), 'dashboard');
});

test('trophies render one tile per trophy', async () => {
  const { registry, tracker } = await boot();
  registry['trophiesBtn']!.onclick!();
  const tiles = (registry['trophiesGrid']!.innerHTML.match(/data-tip/g) || []).length;
  assert.equal(tiles, tracker.trophies().length, 'trophy tiles: ' + tiles);
});

test('card map: opens, renders cards, click navigates + closes modal', async () => {
  const { registry, tracker } = await boot();
  registry['cardMapBtn']!.onclick!();
  assert.equal(
    registry['cardMapModal']!.classList.contains('open'),
    true,
    'modal open before navigate',
  );
  const grid = registry['cardMapGrid']!;
  assert.ok((grid.innerHTML || '').includes('cm-card'), 'cards rendered');

  const ids = tracker.cardMap().groups.flatMap((g) => g.items.map((i) => i.id));
  const currentId = tracker.todayCard().itemId;
  const targetId = ids.find((id) => id !== currentId)!;
  assert.ok(targetId, 'pack has more than one item');

  grid.onclick!({ target: { dataset: { id: targetId } } });
  assert.equal(tracker.todayCard().itemId, targetId, 'navigated to clicked card');
  assert.equal(
    registry['cardMapModal']!.classList.contains('open'),
    false,
    'modal closed on navigate',
  );
});

test('completing the active item persists first-light', async () => {
  const { registry, store, tracker } = await boot();
  const packId = tracker.activePackId();
  Object.keys(registry)
    .filter((id) => /^cb_/.test(id))
    .forEach((id) => {
      const el = registry[id]!;
      if (el.onchange) el.onchange({ target: { checked: true } });
    });
  const saved = JSON.parse(store['sunrise.progress.' + packId]!);
  assert.ok(saved.badges && saved.badges['first-light'], 'first-light persisted');
});

test('guidance spoiler (task-hint) renders for a guidance task', async () => {
  const { registry, tracker } = await boot();
  const sel = tracker.selectors();
  // find an item whose today-card carries a guidance task; switch to it
  let found = false;
  for (const opt of sel.items) {
    tracker.selectItem(opt.id);
    if (tracker.todayCard().tasks.some((t) => t.guidance)) {
      registry['daySelect']!.value = opt.id;
      registry['daySelect']!.onchange!();
      found = true;
      break;
    }
  }
  assert.ok(found, 'fixture has at least one guidance task');
  assert.ok((registry['taskList']!.innerHTML || '').includes('task-hint'), 'task-hint rendered');
});

test('pack switch re-applies track colors and lang', async () => {
  const h = harness();
  await registerDevRoadmap(h.registryPlugin);

  // Register a second minimal pack with a distinct locale and a track with color.
  const pack2 = {
    schema: 'sunrise.pack/v1',
    id: 'p2',
    name: 'Pack 2',
    version: '1.0.0',
    locale: 'en',
    tracks: [{ id: 'x', label: 'X', color: '#0a0' }],
    groups: [
      {
        id: 'g',
        title: 'W',
        items: [{ id: 'p2i1', track: 'x', title: 'B', tasks: [{ id: 't1', text: 'y' }] }],
      },
    ],
  };
  h.registryPlugin.registerPack(pack2);

  h.tracker.init();
  const ctrl = new DomController(h.tracker, h.renderer);
  ctrl.start();

  // Install spies after start() so initial apply doesn't inflate counts.
  let colors = 0;
  let langs = 0;
  (h.renderer as unknown as Record<string, unknown>).applyTrackColors = () => {
    colors++;
  };
  (h.renderer as unknown as Record<string, unknown>).setLang = () => {
    langs++;
  };

  // Fire pack switch to p2.
  const packSel = h.registry['packSelect']!;
  packSel.value = 'p2';
  packSel.onchange!();

  assert.ok(colors >= 1, 'applyTrackColors called on pack switch');
  assert.ok(langs >= 1, 'setLang called on pack switch');
  assert.equal(h.tracker.todayCard().itemId, 'p2i1', 'tracker reflects pack 2 item');
});

test('rest-day item renders the rest branch', async () => {
  const { registry, tracker } = await boot();
  const sel = tracker.selectors();
  let restId: string | undefined;
  for (const opt of sel.items) {
    tracker.selectItem(opt.id);
    if (tracker.todayCard().rest) {
      restId = opt.id;
      break;
    }
  }
  assert.ok(restId, 'fixture has a rest item');
  registry['daySelect']!.value = restId!;
  registry['daySelect']!.onchange!();
  assert.ok((registry['todayCard']!.innerHTML || '').includes('rest-due'), 'rest branch rendered');
});

test('renderCardMap renders rows + cells with data-id', async () => {
  const { registry, tracker, renderer } = await boot();
  renderer.renderCardMap(tracker.cardMap(), 'Map');
  const html = registry['cardMapGrid']!.innerHTML || '';
  assert.ok(html.includes('cm-card'), 'cells render: ' + html.slice(0, 80));
  assert.ok(html.includes('data-id="'), 'cells carry data-id');
  assert.ok(html.includes('cm-row'), 'group rows render');
  assert.ok(html.includes('current'), 'current card flagged');
});

test('renderer: focusTask / activeTaskId round-trip', async () => {
  const { registry, renderer } = await boot();
  const cbId = Object.keys(registry).find((id) => /^cb_/.test(id));
  assert.ok(cbId, 'today card rendered at least one tick');
  const taskId = cbId!.slice(3);
  renderer.focusTask(taskId);
  assert.equal(renderer.activeTaskId(), taskId, 'activeTaskId reflects focused tick');
});

test('renderer: isTypingTarget true for select, false when nothing focused', async () => {
  const { registry, renderer } = await boot();
  assert.equal(renderer.isTypingTarget(), false, 'nothing focused -> not typing');
  registry['daySelect']!.tagName = 'SELECT';
  registry['daySelect']!.focus();
  assert.equal(renderer.isTypingTarget(), true, 'select focused -> typing');
});

test('toggling a tick via onchange restores focus to it', async () => {
  const { registry, tracker, renderer } = await boot();
  const id = tracker.todayCard().tasks[0]!.id;
  registry['cb_' + id]!.onchange!({ target: { checked: true } });
  assert.equal(renderer.activeTaskId(), id, 'focus restored to toggled tick');
});

test('ArrowLeft/Right navigate days and clamp at both ends', async () => {
  const { controller, tracker } = await boot();
  const items = tracker.selectors().items.map((o) => o.id);
  assert.ok(items.length > 1, 'pack has multiple items');

  tracker.selectItem(items[0]!);
  controller!.handleKeydown(ev('ArrowLeft'));
  assert.equal(tracker.todayCard().itemId, items[0], 'clamps at start');

  controller!.handleKeydown(ev('ArrowRight'));
  assert.equal(tracker.todayCard().itemId, items[1], 'right advances');

  tracker.selectItem(items[items.length - 1]!);
  controller!.handleKeydown(ev('ArrowRight'));
  assert.equal(tracker.todayCard().itemId, items[items.length - 1], 'clamps at end');
});

test('Escape closes the open modal', async () => {
  const { registry, controller } = await boot();
  registry['cardMapBtn']!.onclick!();
  assert.equal(registry['cardMapModal']!.classList.contains('open'), true);
  controller!.handleKeydown(ev('Escape'));
  assert.equal(registry['cardMapModal']!.classList.contains('open'), false);
});

test('typing target and modifier keys suppress navigation', async () => {
  const { registry, controller, tracker } = await boot();
  const items = tracker.selectors().items.map((o) => o.id);
  tracker.selectItem(items[0]!);

  registry['daySelect']!.tagName = 'SELECT';
  registry['daySelect']!.focus();
  controller!.handleKeydown(ev('ArrowRight'));
  assert.equal(tracker.todayCard().itemId, items[0], 'ignored while typing');

  (globalThis as { document?: { activeElement?: unknown } }).document!.activeElement = null;
  controller!.handleKeydown(ev('ArrowRight', { ctrlKey: true }));
  assert.equal(tracker.todayCard().itemId, items[0], 'ignored with modifier');
});

test('ArrowDown/Up move tick focus and clamp at the ends', async () => {
  const { registry, controller, renderer, tracker } = await boot();

  // Switch to an item with at least two ticks (rendered via the day-select path).
  let multi: string | undefined;
  for (const o of tracker.selectors().items) {
    tracker.selectItem(o.id);
    if (tracker.todayCard().tasks.length >= 2) {
      multi = o.id;
      break;
    }
  }
  assert.ok(multi, 'fixture has an item with >= 2 ticks');
  registry['daySelect']!.value = multi!;
  registry['daySelect']!.onchange!();

  const ids = tracker.todayCard().tasks.map((t) => t.id);
  controller!.handleKeydown(ev('ArrowDown'));
  assert.equal(renderer.activeTaskId(), ids[0], 'down with nothing focused -> first');
  controller!.handleKeydown(ev('ArrowDown'));
  assert.equal(renderer.activeTaskId(), ids[1], 'down -> second');
  controller!.handleKeydown(ev('ArrowUp'));
  assert.equal(renderer.activeTaskId(), ids[0], 'up -> first');
  controller!.handleKeydown(ev('ArrowUp'));
  assert.equal(renderer.activeTaskId(), ids[0], 'up clamps at top');
});

test('Enter toggles the focused tick and keeps focus', async () => {
  const { controller, renderer, tracker } = await boot();
  const id = tracker.todayCard().tasks[0]!.id;
  renderer.focusTask(id);
  controller!.handleKeydown(ev('Enter'));
  assert.equal(tracker.todayCard().tasks.find((t) => t.id === id)!.done, true, 'tick marked');
  assert.equal(renderer.activeTaskId(), id, 'focus stays on the tick');
});

test('Enter through all ticks completes the item and persists', async () => {
  const { controller, renderer, tracker, store } = await boot();
  const packId = tracker.activePackId();
  for (const t of tracker.todayCard().tasks) {
    renderer.focusTask(t.id);
    controller!.handleKeydown(ev('Enter'));
  }
  const saved = JSON.parse(store['sunrise.progress.' + packId]!);
  assert.ok(saved.badges && saved.badges['first-light'], 'first-light persisted via Enter');
});

test('single-key shortcuts open the right modals', async () => {
  const { registry, controller } = await boot();

  controller!.handleKeydown(ev('m'));
  assert.equal(registry['cardMapModal']!.classList.contains('open'), true, 'm opens card map');
  controller!.handleKeydown(ev('Escape'));

  controller!.handleKeydown(ev('t'));
  assert.equal(registry['trophiesModal']!.classList.contains('open'), true, 't opens trophies');
  controller!.handleKeydown(ev('Escape'));

  controller!.handleKeydown(ev('?'));
  assert.equal(registry['shortcutsModal']!.classList.contains('open'), true, '? opens help');
  assert.ok((registry['shortcutsGrid']!.innerHTML || '').includes('sc-row'), 'help rows render');
});

test('keyboard day-nav keeps scroll position; buttons still scroll to top', async () => {
  const { registry, controller, tracker } = await boot();
  const items = tracker.selectors().items.map((o) => o.id);
  tracker.selectItem(items[0]!);

  let scrolls = 0;
  (globalThis as { window?: { scrollTo: () => void } }).window!.scrollTo = () => {
    scrolls++;
  };

  controller!.handleKeydown(ev('ArrowRight'));
  assert.equal(scrolls, 0, 'arrow nav does not scroll the page');

  registry['nextDay']!.onclick!();
  assert.equal(scrolls, 1, 'the prev/next button still scrolls to top');
});

test('item title and task text are HTML-escaped in the rendered card', async () => {
  const h = harness();
  const evil = '<script>alert(1)</script> & co';
  h.registryPlugin.registerPack({
    schema: 'sunrise.pack/v1',
    id: 'evil',
    name: 'Evil',
    version: '1.0.0',
    locale: 'en',
    tracks: [{ id: 'x', label: 'X' }],
    groups: [
      {
        id: 'g',
        title: 'G',
        items: [{ id: 'i1', track: 'x', title: evil, tasks: [{ id: 't1', text: evil }] }],
      },
    ],
  });
  h.tracker.init();
  new DomController(h.tracker, h.renderer).start();

  const today = h.registry['todayCard']!.innerHTML;
  const tasks = h.registry['taskList']!.innerHTML;
  assert.ok(today.includes('&lt;script&gt;'), 'title escaped');
  assert.ok(tasks.includes('&lt;script&gt;'), 'task text escaped');
  assert.ok(today.includes('&amp;') && tasks.includes('&amp;'), 'ampersand escaped');
  assert.ok(!today.includes('<script') && !tasks.includes('<script'), 'no raw script tag');
});

test('card map / trophies modal titles carry the real counters', async () => {
  const { registry, tracker } = await boot();

  registry['cardMapBtn']!.onclick!();
  const cm = tracker.cardMap();
  assert.ok(
    registry['cardMapTitle']!.textContent.includes(`${cm.done}/${cm.total}`),
    'card map title: ' + registry['cardMapTitle']!.textContent,
  );

  registry['trophiesBtn']!.onclick!();
  const trophies = tracker.trophies();
  const got = trophies.filter((b) => b.unlocked).length;
  assert.ok(
    registry['trophiesTitle']!.textContent.includes(`${got}/${trophies.length}`),
    'trophies title: ' + registry['trophiesTitle']!.textContent,
  );
});

test('open modal suppresses day nav; Escape and backdrop click close it', async () => {
  const { registry, controller, tracker } = await boot();
  const items = tracker.selectors().items.map((o) => o.id);
  tracker.selectItem(items[0]!);

  controller!.handleKeydown(ev('m'));
  assert.equal(registry['cardMapModal']!.classList.contains('open'), true, 'modal open');
  controller!.handleKeydown(ev('ArrowRight'));
  assert.equal(tracker.todayCard().itemId, items[0], 'nav suppressed while modal open');
  controller!.handleKeydown(ev('Escape'));
  assert.equal(registry['cardMapModal']!.classList.contains('open'), false, 'Escape closes');

  controller!.handleKeydown(ev('m'));
  registry['cardMapModal']!.onclick!({ target: { id: 'cardMapModal' } });
  assert.equal(registry['cardMapModal']!.classList.contains('open'), false, 'backdrop closes');
});

test('M via e.code opens the card map on non-Latin layouts', async () => {
  const { registry, controller } = await boot();
  controller!.handleKeydown(ev('ь', { code: 'KeyM' }));
  assert.equal(registry['cardMapModal']!.classList.contains('open'), true, 'ь/KeyM opens map');
});

test('ArrowUp with nothing focused enters at the last tick; rest card ignores arrows', async () => {
  const { registry, controller, renderer, tracker } = await boot();
  const doc = (globalThis as { document?: { activeElement?: unknown } }).document!;

  let multi: string | undefined;
  for (const o of tracker.selectors().items) {
    tracker.selectItem(o.id);
    if (tracker.todayCard().tasks.length >= 2) {
      multi = o.id;
      break;
    }
  }
  assert.ok(multi, 'fixture has an item with >= 2 ticks');
  registry['daySelect']!.value = multi!;
  registry['daySelect']!.onchange!();
  doc.activeElement = null;
  const ids = tracker.todayCard().tasks.map((t) => t.id);
  controller!.handleKeydown(ev('ArrowUp'));
  assert.equal(renderer.activeTaskId(), ids[ids.length - 1], 'up with nothing focused -> last');

  let restId: string | undefined;
  for (const o of tracker.selectors().items) {
    tracker.selectItem(o.id);
    if (tracker.todayCard().rest) {
      restId = o.id;
      break;
    }
  }
  assert.ok(restId, 'fixture has a rest item');
  registry['daySelect']!.value = restId!;
  registry['daySelect']!.onchange!();
  doc.activeElement = null;
  controller!.handleKeydown(ev('ArrowDown'));
  controller!.handleKeydown(ev('ArrowUp'));
  assert.equal(renderer.activeTaskId(), null, 'rest card: arrows do nothing');
});

test('dashboard shows the exact done/total and streak numbers', async () => {
  const { registry, tracker } = await boot();
  Object.keys(registry)
    .filter((id) => /^cb_/.test(id))
    .forEach((id) => {
      const el = registry[id]!;
      if (el.onchange) el.onchange({ target: { checked: true } });
    });
  const vm = tracker.dashboard();
  assert.ok(vm.overall.done >= 1, 'at least one item done');
  const html = registry['dashboard']!.innerHTML;
  assert.ok(html.includes(`<small>${vm.overall.done}/${vm.overall.total}</small>`), 'done/total');
  assert.ok(html.includes(`<div class="streak-num">${vm.streak}</div>`), 'streak number');
});

test('icon-only controls carry data-tip tooltips and aria-labels from ui strings', async () => {
  const { registry, tracker } = await boot();
  const u = (k: string): string => tracker.ui(k);
  const expected: [string, string][] = [
    ['cardMapBtn', u('cardMap')],
    ['trophiesBtn', u('trophies')],
    ['exportBtn', u('export')],
    ['importBtn', u('import')],
    ['prevDay', u('prevDayAria')],
    ['nextDay', u('nextDayAria')],
    ['cardMapClose', u('scClose')],
    ['trophiesClose', u('scClose')],
    ['shortcutsClose', u('scClose')],
  ];
  for (const [id, label] of expected) {
    assert.equal(registry[id]!.dataset['tip'], label, `${id} data-tip`);
    assert.equal(registry[id]!.attrs['aria-label'], label, `${id} aria-label`);
  }
});

test('pack switch refreshes static labels and the motd', async () => {
  const h = harness();
  await registerDevRoadmap(h.registryPlugin);
  h.registryPlugin.registerPack({
    schema: 'sunrise.pack/v1',
    id: 'pb',
    name: 'Pack B',
    version: '1.0.0',
    locale: 'en',
    ui: { summaryTitle: 'B Summary' },
    mottos: ['B motto'],
    tracks: [{ id: 'x', label: 'X' }],
    groups: [
      {
        id: 'g',
        title: 'G',
        items: [{ id: 'pbi1', track: 'x', title: 'B1', tasks: [{ id: 't1', text: 'do' }] }],
      },
    ],
  });
  h.tracker.init();
  new DomController(h.tracker, h.renderer).start();

  const before = h.registry['summaryTitle']!.textContent;
  assert.notEqual(before, 'B Summary', 'pack A renders its own summary title');
  const sel = h.registry['packSelect']!;
  sel.value = 'pb';
  sel.onchange!();
  assert.equal(h.registry['summaryTitle']!.textContent, 'B Summary', 'summary title refreshed');
  assert.equal(h.registry['motd']!.textContent, 'B motto', 'motd shows pack B motto');
});

test('dock bars reflect progress and streak after a render', async () => {
  const { registry, tracker } = await boot();
  Object.keys(registry)
    .filter((id) => /^cb_/.test(id))
    .forEach((id) => {
      const el = registry[id]!;
      if (el.onchange) el.onchange({ target: { checked: true } });
    });
  const vm = tracker.dashboard();
  const fillW = (id: string): string =>
    (registry[id]!.style as unknown as { width?: string }).width ?? '';
  assert.equal(registry['dockProgressVal']!.textContent, `${vm.overall.done}/${vm.overall.total}`);
  assert.equal(fillW('dockProgressFill'), `${vm.overall.pct}%`);
  assert.equal(registry['dockStreakVal']!.textContent, `${vm.streak}d`);
  assert.equal(fillW('dockStreakFill'), `${Math.round(Math.min(vm.streak / 30, 1) * 100)}%`);
});

test('dock map/trophies buttons open their modals (closing any sheet first)', async () => {
  const { registry } = await boot();
  registry['dockMenuBtn']!.onclick!();
  assert.equal(registry['toolbar']!.classList.contains('open'), true, 'menu sheet opens');
  registry['dockMapBtn']!.onclick!();
  assert.equal(registry['cardMapModal']!.classList.contains('open'), true, 'map modal opens');
  assert.equal(registry['toolbar']!.classList.contains('open'), false, 'sheet closed by modal');
  registry['cardMapModal']!.onclick!({ target: { id: 'cardMapModal' } });
  registry['dockTrophiesBtn']!.onclick!();
  assert.equal(registry['trophiesModal']!.classList.contains('open'), true, 'trophies modal opens');
});

test('menu and stats sheets toggle and are mutually exclusive; Esc closes', async () => {
  const { registry, controller } = await boot();
  registry['dockMenuBtn']!.onclick!();
  assert.equal(registry['toolbar']!.classList.contains('open'), true, 'menu opens');
  registry['dockBars']!.onclick!();
  assert.equal(registry['dashboard']!.classList.contains('open'), true, 'stats opens');
  assert.equal(registry['toolbar']!.classList.contains('open'), false, 'menu closed by stats');
  registry['dockBars']!.onclick!();
  assert.equal(registry['dashboard']!.classList.contains('open'), false, 'stats toggles closed');
  registry['dockMenuBtn']!.onclick!();
  controller!.handleKeydown(ev('Escape'));
  assert.equal(registry['toolbar']!.classList.contains('open'), false, 'Esc closes the sheet');
});

test('a toolbar action closes the menu sheet', async () => {
  const { registry, tracker } = await boot();
  registry['dockMenuBtn']!.onclick!();
  const items = tracker.selectors().items.map((o) => o.id);
  registry['daySelect']!.value = items[1]!;
  registry['daySelect']!.onchange!();
  assert.equal(registry['toolbar']!.classList.contains('open'), false, 'day pick closes menu');
});

test('dock controls carry aria-labels from ui strings', async () => {
  const { registry, tracker } = await boot();
  const u = (k: string): string => tracker.ui(k);
  assert.equal(registry['dockMapBtn']!.attrs['aria-label'], u('cardMap'));
  assert.equal(registry['dockTrophiesBtn']!.attrs['aria-label'], u('trophies'));
  assert.equal(registry['dockMenuBtn']!.attrs['aria-label'], u('menu'));
  assert.equal(registry['dockBars']!.attrs['aria-label'], u('summaryTitle'));
});
