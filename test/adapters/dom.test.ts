import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Tracker } from '../../src/domain/tracker.ts';
import { Streaks } from '../../src/domain/streaks.ts';
import { ProgressStats } from '../../src/domain/progress-stats.ts';
import { BadgeEngine } from '../../src/domain/badge-engine.ts';
import {
  DEFAULT_UI,
  DEFAULT_STREAK_WORDS,
  DEFAULT_MOTTOS,
  GENERIC_BADGES,
  BUILTIN_THEMES,
  SUPPORTED_LANGS,
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
import { Projections } from '../../src/domain/projections.ts';
import { Importer } from '../../src/domain/plugins/importer.ts';
import { PackPlugin } from '../../src/domain/plugins/pack-plugin.ts';
import { ThemePlugin } from '../../src/domain/plugins/theme-plugin.ts';
import { ProgressPlugin } from '../../src/domain/plugins/progress-plugin.ts';

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
  styleProps: Record<string, string> = {};
  style = {
    setProperty: (k: string, v: string): void => void (this.styleProps[k] = v),
    removeProperty: (k: string): void => void delete this.styleProps[k],
  };
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
  onerror: (() => void) | null = null;
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
  projections: Projections;
  renderer: DomRenderer;
  controller?: DomController;
  registryPlugin: WindowPluginRegistry;
  importer: Importer;
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
  const clock = new SystemClock();
  const badges = new BadgeEngine(streaks, stats);
  const tracker = new Tracker({
    packs: registryPlugin,
    themes: registryPlugin,
    progressStore: new LocalStorageProgressStore(),
    sessionStore: new LocalStorageSessionStore(),
    clock,
    random: new MathRandom(),
    streaks,
    stats,
    badges,
    defaultUi: DEFAULT_UI,
    genericBadges: GENERIC_BADGES,
    defaultStreakWords: DEFAULT_STREAK_WORDS,
    defaultMottos: DEFAULT_MOTTOS,
    supportedLangs: SUPPORTED_LANGS,
  });
  const projections = new Projections(() => tracker.view(), {
    clock,
    streaks,
    stats,
    badges,
    packs: registryPlugin,
    themes: registryPlugin,
    defaultUi: DEFAULT_UI,
    defaultStreakWords: DEFAULT_STREAK_WORDS,
  });

  const renderer = new DomRenderer();
  const importer = new Importer(
    [new PackPlugin(registryPlugin), new ThemePlugin(registryPlugin), new ProgressPlugin(tracker)],
    { load: () => [], append: () => {} },
  );
  return { registry, store, tracker, projections, renderer, registryPlugin, importer };
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
  h.controller = new DomController(h.tracker, h.projections, h.renderer, h.importer);
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
  const { registry, projections } = await boot();
  registry['trophiesBtn']!.onclick!();
  const tiles = (registry['trophiesGrid']!.innerHTML.match(/data-tip/g) || []).length;
  assert.equal(tiles, projections.trophies().length, 'trophy tiles: ' + tiles);
});

test('card map: opens, renders cards, click navigates + closes modal', async () => {
  const { registry, projections } = await boot();
  registry['cardMapBtn']!.onclick!();
  assert.equal(
    registry['cardMapModal']!.classList.contains('open'),
    true,
    'modal open before navigate',
  );
  const grid = registry['cardMapGrid']!;
  assert.ok((grid.innerHTML || '').includes('cm-card'), 'cards rendered');

  const ids = projections.cardMap().groups.flatMap((g) => g.items.map((i) => i.id));
  const currentId = projections.todayCard().itemId;
  const targetId = ids.find((id) => id !== currentId)!;
  assert.ok(targetId, 'pack has more than one item');

  grid.onclick!({ target: { dataset: { id: targetId } } });
  assert.equal(projections.todayCard().itemId, targetId, 'navigated to clicked card');
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
  const { registry, tracker, projections } = await boot();
  const sel = projections.selectors();
  // find an item whose today-card carries a guidance task; switch to it
  let found = false;
  for (const opt of sel.items) {
    tracker.selectItem(opt.id);
    if (projections.todayCard().tasks.some((t) => t.guidance)) {
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
  const ctrl = new DomController(h.tracker, h.projections, h.renderer, h.importer);
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
  assert.equal(h.projections.todayCard().itemId, 'p2i1', 'tracker reflects pack 2 item');
});

test('rest-day item renders the rest branch', async () => {
  const { registry, tracker, projections } = await boot();
  const sel = projections.selectors();
  let restId: string | undefined;
  for (const opt of sel.items) {
    tracker.selectItem(opt.id);
    if (projections.todayCard().rest) {
      restId = opt.id;
      break;
    }
  }
  assert.ok(restId, 'fixture has a rest item');
  registry['daySelect']!.value = restId!;
  registry['daySelect']!.onchange!();
  // the rest branch is recognizable by its vertical label (dev-roadmap: 休 · REST)
  assert.ok((registry['todayCard']!.innerHTML || '').includes('休'), 'rest branch rendered');
});

test('today card renders copy + AI-copy tools on tasks and warmup', async () => {
  const { registry } = await boot();
  const tasks = registry['taskList']!.innerHTML || '';
  assert.ok(tasks.includes('id="copy_'), 'plain copy button per task');
  assert.ok(tasks.includes('id="copyai_'), 'AI copy button per task');
  assert.ok(tasks.includes('task-tools'), 'canonical .task-tools hook');
  const card = registry['todayCard']!.innerHTML || '';
  assert.ok(card.includes('id="copyWarm"'), 'warmup plain copy button');
  assert.ok(card.includes('id="copyaiWarm"'), 'warmup AI copy button');
  // the floated spacer reserves the tools' corner inside the text flow, so
  // text wraps around the buttons instead of running under them
  assert.ok(/class="task-text"><i class="tools-spacer"/.test(tasks), 'spacer leads each task text');
  assert.ok(/class="warm"><i class="tools-spacer"/.test(card), 'spacer leads the warmup block');
  // warmup is a stacked block: «Разминка» header line, then the text under it
  assert.ok(
    /<div class="warm-head"><span class="warm-i">✦<\/span> <span class="muted">/.test(card),
    'warmup header line (.warm-head > .warm-i + .muted)',
  );
  assert.ok(card.includes('<div class="warm-text">'), 'warmup text block under the header');
});

test('copy buttons copy text / AI prompt via the clipboard seam, never toggle the task', async () => {
  const h = await boot();
  const { registry, renderer, projections } = h;
  const copied: string[] = [];
  h.controller!.copyText = (s: string) => void copied.push(s);
  const toasts: string[] = [];
  renderer.toast = (cls: string) => void toasts.push(cls);
  const vm = projections.todayCard();
  const t1 = vm.tasks[0]!;
  registry['copy_' + t1.id]!.onclick!();
  assert.deepEqual(copied, [t1.text], 'plain copy = raw task text');
  registry['copyai_' + t1.id]!.onclick!();
  assert.equal(copied[1], projections.aiPrompt(t1.text, t1.guidance), 'AI copy = built prompt');
  registry['copyWarm']!.onclick!();
  assert.equal(copied[2], vm.warmup, 'warmup plain copy');
  registry['copyaiWarm']!.onclick!();
  assert.equal(copied[3], projections.aiPrompt(vm.warmup!), 'warmup AI copy');
  assert.equal(projections.todayCard().tasks[0]!.done, false, 'copying never ticks the task');
  assert.equal(toasts.length, 4, 'each copy confirms with a toast');
});

test('renderCardMap renders rows + cells with data-id', async () => {
  const { registry, renderer, projections } = await boot();
  renderer.renderCardMap(projections.cardMap(), 'Map');
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
  const { registry, renderer, projections } = await boot();
  const id = projections.todayCard().tasks[0]!.id;
  registry['cb_' + id]!.onchange!({ target: { checked: true } });
  assert.equal(renderer.activeTaskId(), id, 'focus restored to toggled tick');
});

test('ArrowLeft/Right navigate days and clamp at both ends', async () => {
  const { controller, tracker, projections } = await boot();
  const items = projections.selectors().items.map((o) => o.id);
  assert.ok(items.length > 1, 'pack has multiple items');

  tracker.selectItem(items[0]!);
  controller!.handleKeydown(ev('ArrowLeft'));
  assert.equal(projections.todayCard().itemId, items[0], 'clamps at start');

  controller!.handleKeydown(ev('ArrowRight'));
  assert.equal(projections.todayCard().itemId, items[1], 'right advances');

  tracker.selectItem(items[items.length - 1]!);
  controller!.handleKeydown(ev('ArrowRight'));
  assert.equal(projections.todayCard().itemId, items[items.length - 1], 'clamps at end');
});

test('Escape closes the open modal', async () => {
  const { registry, controller } = await boot();
  registry['cardMapBtn']!.onclick!();
  assert.equal(registry['cardMapModal']!.classList.contains('open'), true);
  controller!.handleKeydown(ev('Escape'));
  assert.equal(registry['cardMapModal']!.classList.contains('open'), false);
});

test('typing target and modifier keys suppress navigation', async () => {
  const { registry, controller, tracker, projections } = await boot();
  const items = projections.selectors().items.map((o) => o.id);
  tracker.selectItem(items[0]!);

  registry['daySelect']!.tagName = 'SELECT';
  registry['daySelect']!.focus();
  controller!.handleKeydown(ev('ArrowRight'));
  assert.equal(projections.todayCard().itemId, items[0], 'ignored while typing');

  (globalThis as { document?: { activeElement?: unknown } }).document!.activeElement = null;
  controller!.handleKeydown(ev('ArrowRight', { ctrlKey: true }));
  assert.equal(projections.todayCard().itemId, items[0], 'ignored with modifier');
});

test('ArrowDown/Up move tick focus and clamp at the ends', async () => {
  const { registry, controller, renderer, tracker, projections } = await boot();

  // Switch to an item with at least two ticks (rendered via the day-select path).
  let multi: string | undefined;
  for (const o of projections.selectors().items) {
    tracker.selectItem(o.id);
    if (projections.todayCard().tasks.length >= 2) {
      multi = o.id;
      break;
    }
  }
  assert.ok(multi, 'fixture has an item with >= 2 ticks');
  registry['daySelect']!.value = multi!;
  registry['daySelect']!.onchange!();

  const ids = projections.todayCard().tasks.map((t) => t.id);
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
  const { controller, renderer, projections } = await boot();
  const id = projections.todayCard().tasks[0]!.id;
  renderer.focusTask(id);
  controller!.handleKeydown(ev('Enter'));
  assert.equal(projections.todayCard().tasks.find((t) => t.id === id)!.done, true, 'tick marked');
  assert.equal(renderer.activeTaskId(), id, 'focus stays on the tick');
});

test('Enter through all ticks completes the item and persists', async () => {
  const { controller, renderer, tracker, store, projections } = await boot();
  const packId = tracker.activePackId();
  for (const t of projections.todayCard().tasks) {
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
  const { registry, controller, tracker, projections } = await boot();
  const items = projections.selectors().items.map((o) => o.id);
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
  new DomController(h.tracker, h.projections, h.renderer, h.importer).start();

  const today = h.registry['todayCard']!.innerHTML;
  const tasks = h.registry['taskList']!.innerHTML;
  assert.ok(today.includes('&lt;script&gt;'), 'title escaped');
  assert.ok(tasks.includes('&lt;script&gt;'), 'task text escaped');
  assert.ok(today.includes('&amp;') && tasks.includes('&amp;'), 'ampersand escaped');
  assert.ok(!today.includes('<script') && !tasks.includes('<script'), 'no raw script tag');
});

test('card map / trophies modal titles carry the real counters', async () => {
  const { registry, projections } = await boot();

  registry['cardMapBtn']!.onclick!();
  const cm = projections.cardMap();
  assert.ok(
    registry['cardMapTitle']!.textContent.includes(`${cm.done}/${cm.total}`),
    'card map title: ' + registry['cardMapTitle']!.textContent,
  );

  registry['trophiesBtn']!.onclick!();
  const trophies = projections.trophies();
  const got = trophies.filter((b) => b.unlocked).length;
  assert.ok(
    registry['trophiesTitle']!.textContent.includes(`${got}/${trophies.length}`),
    'trophies title: ' + registry['trophiesTitle']!.textContent,
  );
});

test('open modal suppresses day nav; Escape and backdrop click close it', async () => {
  const { registry, controller, tracker, projections } = await boot();
  const items = projections.selectors().items.map((o) => o.id);
  tracker.selectItem(items[0]!);

  controller!.handleKeydown(ev('m'));
  assert.equal(registry['cardMapModal']!.classList.contains('open'), true, 'modal open');
  controller!.handleKeydown(ev('ArrowRight'));
  assert.equal(projections.todayCard().itemId, items[0], 'nav suppressed while modal open');
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
  const { registry, controller, renderer, tracker, projections } = await boot();
  const doc = (globalThis as { document?: { activeElement?: unknown } }).document!;

  let multi: string | undefined;
  for (const o of projections.selectors().items) {
    tracker.selectItem(o.id);
    if (projections.todayCard().tasks.length >= 2) {
      multi = o.id;
      break;
    }
  }
  assert.ok(multi, 'fixture has an item with >= 2 ticks');
  registry['daySelect']!.value = multi!;
  registry['daySelect']!.onchange!();
  doc.activeElement = null;
  const ids = projections.todayCard().tasks.map((t) => t.id);
  controller!.handleKeydown(ev('ArrowUp'));
  assert.equal(renderer.activeTaskId(), ids[ids.length - 1], 'up with nothing focused -> last');

  let restId: string | undefined;
  for (const o of projections.selectors().items) {
    tracker.selectItem(o.id);
    if (projections.todayCard().rest) {
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
  const { registry, projections } = await boot();
  Object.keys(registry)
    .filter((id) => /^cb_/.test(id))
    .forEach((id) => {
      const el = registry[id]!;
      if (el.onchange) el.onchange({ target: { checked: true } });
    });
  const vm = projections.dashboard();
  assert.ok(vm.overall.done >= 1, 'at least one item done');
  const html = registry['dashboard']!.innerHTML;
  assert.ok(html.includes(`<small>${vm.overall.done}/${vm.overall.total}</small>`), 'done/total');
  assert.ok(html.includes(`<div class="streak-num">${vm.streak}</div>`), 'streak number');
});

test('icon-only controls carry data-tip tooltips and aria-labels from ui strings', async () => {
  const { registry, projections } = await boot();
  const u = (k: string): string => projections.ui(k);
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
  new DomController(h.tracker, h.projections, h.renderer, h.importer).start();

  const before = h.registry['summaryTitle']!.textContent;
  assert.notEqual(before, 'B Summary', 'pack A renders its own summary title');
  const sel = h.registry['packSelect']!;
  sel.value = 'pb';
  sel.onchange!();
  assert.equal(h.registry['summaryTitle']!.textContent, 'B Summary', 'summary title refreshed');
  assert.equal(h.registry['motd']!.textContent, 'B motto', 'motd shows pack B motto');
});

test('dock bars reflect progress and streak after a render', async () => {
  const { registry, projections } = await boot();
  Object.keys(registry)
    .filter((id) => /^cb_/.test(id))
    .forEach((id) => {
      const el = registry[id]!;
      if (el.onchange) el.onchange({ target: { checked: true } });
    });
  const vm = projections.dashboard();
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
  const { registry, projections } = await boot();
  registry['dockMenuBtn']!.onclick!();
  const items = projections.selectors().items.map((o) => o.id);
  registry['daySelect']!.value = items[1]!;
  registry['daySelect']!.onchange!();
  assert.equal(registry['toolbar']!.classList.contains('open'), false, 'day pick closes menu');
});

test('dock controls carry aria-labels from ui strings', async () => {
  const { registry, projections } = await boot();
  const u = (k: string): string => projections.ui(k);
  assert.equal(registry['dockMapBtn']!.attrs['aria-label'], u('cardMap'));
  assert.equal(registry['dockTrophiesBtn']!.attrs['aria-label'], u('trophies'));
  assert.equal(registry['dockMenuBtn']!.attrs['aria-label'], u('menu'));
  assert.equal(registry['dockBars']!.attrs['aria-label'], u('summaryTitle'));
});

test('stats sheet stays open across a keyboard-nav re-render', async () => {
  const { registry, controller } = await boot();
  registry['dockBars']!.onclick!();
  assert.equal(registry['dashboard']!.classList.contains('open'), true, 'stats sheet open');
  controller!.handleKeydown(ev('ArrowRight'));
  assert.equal(registry['dashboard']!.classList.contains('open'), true, 'sheet survives renderAll');
});

const touch = (x: number, y: number) => ({ changedTouches: [{ clientX: x, clientY: y }] });

test('horizontal swipe on the today card changes day (left=next, right=prev)', async () => {
  const { registry, tracker, projections } = await boot();
  const items = projections.selectors().items.map((o) => o.id);
  tracker.selectItem(items[0]!);
  const card = registry['todayCard']! as unknown as {
    ontouchstart?: (e: unknown) => void;
    ontouchend?: (e: unknown) => void;
  };
  card.ontouchstart!(touch(300, 100));
  card.ontouchend!(touch(180, 110)); // dx=-120 → next
  assert.equal(projections.todayCard().itemId, items[1], 'left swipe advances');
  card.ontouchstart!(touch(100, 100));
  card.ontouchend!(touch(260, 90)); // dx=+160 → prev
  assert.equal(projections.todayCard().itemId, items[0], 'right swipe goes back');
});

test('small, vertical, typing-target and modal-open swipes are ignored', async () => {
  const { registry, controller, tracker, projections } = await boot();
  const items = projections.selectors().items.map((o) => o.id);
  tracker.selectItem(items[0]!);
  const card = registry['todayCard']! as unknown as {
    ontouchstart?: (e: unknown) => void;
    ontouchend?: (e: unknown) => void;
  };
  card.ontouchstart!(touch(300, 100));
  card.ontouchend!(touch(270, 100)); // |dx|=30 < 50
  assert.equal(projections.todayCard().itemId, items[0], 'sub-threshold ignored');
  card.ontouchstart!(touch(300, 100));
  card.ontouchend!(touch(220, 260)); // dy dominates
  assert.equal(projections.todayCard().itemId, items[0], 'vertical scroll ignored');
  registry['daySelect']!.tagName = 'SELECT';
  registry['daySelect']!.focus();
  card.ontouchstart!(touch(300, 100));
  card.ontouchend!(touch(100, 100));
  assert.equal(projections.todayCard().itemId, items[0], 'typing target ignored');
  (globalThis as { document?: { activeElement?: unknown } }).document!.activeElement = null;
  controller!.handleKeydown(ev('m'));
  card.ontouchstart!(touch(300, 100));
  card.ontouchend!(touch(100, 100));
  assert.equal(projections.todayCard().itemId, items[0], 'modal-open ignored');
});

test('swipe still navigates while a sheet is open (by design)', async () => {
  const { registry, tracker, projections } = await boot();
  const items = projections.selectors().items.map((o) => o.id);
  tracker.selectItem(items[0]!);
  registry['dockBars']!.onclick!();
  assert.equal(registry['dashboard']!.classList.contains('open'), true, 'stats sheet open');
  const card = registry['todayCard']! as unknown as {
    ontouchstart?: (e: unknown) => void;
    ontouchend?: (e: unknown) => void;
  };
  card.ontouchstart!(touch(300, 100));
  card.ontouchend!(touch(150, 100));
  assert.equal(projections.todayCard().itemId, items[1], 'swipe navigates under an open sheet');
  assert.equal(registry['dashboard']!.classList.contains('open'), true, 'sheet stays open');
});

test('applyTheme: instant on first paint, cross-fades on a real switch', async () => {
  const h = harness();
  const doc = (
    globalThis as unknown as { document: { createElement: () => FakeEl; documentElement: FakeEl } }
  ).document;
  const created: FakeEl[] = [];
  const orig = doc.createElement;
  doc.createElement = (): FakeEl => {
    const el = orig();
    created.push(el);
    return el;
  };
  const html = doc.documentElement;

  // First application (boot): no dip, straight to swap once the sheet loads.
  h.renderer.applyTheme('themes/dawn.css', 'dawn');
  assert.equal(html.classList.contains('theme-switching'), false, 'no dip on first paint');
  created.at(-1)!.onload!();
  assert.equal(html.attrs['data-theme'], 'dawn', 'first theme applied instantly');

  // Second application (real switch): dips immediately, old theme stays visible
  // through the dip, new theme + dip-release land after the fade window.
  h.renderer.applyTheme('themes/neon.css', 'neon');
  assert.equal(html.classList.contains('theme-switching'), true, 'dips on switch');
  assert.equal(html.attrs['data-theme'], 'dawn', 'old theme stays during the dip');
  created.at(-1)!.onload!();
  await new Promise((r) => setTimeout(r, 260));
  assert.equal(html.attrs['data-theme'], 'neon', 'new theme applied after the dip');
  assert.equal(html.classList.contains('theme-switching'), false, 'dip released to fade up');
});

test('importing a theme JSON registers, selects and applies it', async () => {
  const h = await boot();
  const THEME_JSON = JSON.stringify({
    schema: 'sunrise.theme/v1',
    id: 'imported-x',
    name: 'Imported X',
    version: '1.0.0',
    css: ':root[data-theme="imported-x"]{--ink:#000}',
  });
  // Controllable FileReader: readAsText fires onload synchronously with the text.
  (globalThis as { FileReader: unknown }).FileReader = function (this: {
    result?: string;
    onload?: () => void;
    readAsText: (f: unknown) => void;
  }) {
    this.readAsText = (): void => {
      this.result = THEME_JSON;
      this.onload?.();
    };
  };
  const importFile = h.registry['importFile']!;
  importFile.files = [{}];
  importFile.onchange!({ target: importFile });

  assert.equal(h.tracker.activeThemeId(), 'imported-x', 'imported theme is active');
  assert.ok(
    h.registryPlugin.themes().some((t) => t.id === 'imported-x'),
    'imported theme is registered',
  );
});

test('importing an unrecognized JSON leaves state unchanged (no throw)', async () => {
  const h = await boot();
  const themeBefore = h.tracker.activeThemeId();
  const BAD = '{"schema":"sunrise.nope/v1","id":"x"}';
  (globalThis as { FileReader: unknown }).FileReader = function (this: {
    result?: string;
    onload?: () => void;
    readAsText: (f: unknown) => void;
  }) {
    this.readAsText = (): void => {
      this.result = BAD;
      this.onload?.();
    };
  };
  const importFile = h.registry['importFile']!;
  importFile.files = [{}];
  assert.doesNotThrow(() => importFile.onchange!({ target: importFile }));
  assert.equal(h.tracker.activeThemeId(), themeBefore, 'theme unchanged on unrecognized import');
});

test('a failed theme load reverts the selection to the previous theme', async () => {
  const h = await boot();
  const doc = (
    globalThis as unknown as { document: { createElement: () => FakeEl; documentElement: FakeEl } }
  ).document;
  const created: FakeEl[] = [];
  const orig = doc.createElement;
  doc.createElement = (): FakeEl => {
    const el = orig();
    created.push(el);
    return el;
  };
  const startId = h.tracker.activeThemeId();
  const target = h.registryPlugin
    .themes()
    .map((t) => t.id)
    .find((id) => id !== startId)!;
  const sel = h.registry['themeSelect']!;
  sel.value = target;
  sel.onchange!();
  created.at(-1)!.onerror!(); // simulate the <link> failing to load
  assert.equal(h.tracker.activeThemeId(), startId, 'broken theme is not left persisted');
});

test('applyAppState sets --sunrise-* on documentElement', () => {
  const h = harness();
  const html = (globalThis as unknown as { document: { documentElement: FakeEl } }).document
    .documentElement;
  h.renderer.applyAppState({ progress: 42, streak: 7, hour: 14, month: 11 });
  assert.equal(html.styleProps['--sunrise-progress'], '42');
  assert.equal(html.styleProps['--sunrise-streak'], '7');
  assert.equal(html.styleProps['--sunrise-hour'], '14');
  assert.equal(html.styleProps['--sunrise-month'], '11');
});

test('boot render writes the app-state vars onto documentElement', async () => {
  await boot();
  const html = (globalThis as unknown as { document: { documentElement: FakeEl } }).document
    .documentElement;
  assert.ok('--sunrise-progress' in html.styleProps, 'progress var set on render');
  assert.ok('--sunrise-streak' in html.styleProps, 'streak var set on render');
  assert.ok('--sunrise-hour' in html.styleProps, 'hour var set on render');
});
