import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Tracker } from '../../src/domain/tracker.ts';
import { Streaks } from '../../src/domain/streaks.ts';
import { ProgressStats } from '../../src/domain/progress-stats.ts';
import { ReviewSchedule } from '../../src/domain/review-schedule.ts';
import { BadgeEngine } from '../../src/domain/badge-engine.ts';
import {
  DEFAULT_UI,
  DEFAULT_DOW,
  DEFAULT_STREAK_WORDS,
  DEFAULT_MONTHS,
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
  _html = '';
  value = '';
  files: unknown[] = [];
  disabled = false;
  href = '';
  lang = '';
  checked = false;
  style = { setProperty(): void {}, removeProperty(): void {} };
  dataset: Record<string, string> = {};
  classList = {
    add(): void {},
    remove(): void {},
    toggle(): void {},
    contains(): boolean {
      return false;
    },
  };
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
    const re = /id="([^"$]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(v))) {
      const id = m[1]!;
      this.#registry[id] = this.#registry[id] || new FakeEl(id, this.#registry);
    }
  }
  get textContent(): string {
    return '';
  }
  set textContent(_v: string) {
    /* no-op */
  }
  appendChild(c: unknown): unknown {
    return c;
  }
  removeChild(c: unknown): unknown {
    return c;
  }
  append(): void {}
  remove(): void {}
  setAttribute(k: string, v: string): void {
    if (k.indexOf('data-') === 0) this.dataset[k.slice(5)] = v;
  }
  getAttribute(): null {
    return null;
  }
  addEventListener(): void {}
  click(): void {}
}

interface Harness {
  registry: Registry;
  store: Record<string, string>;
  tracker: Tracker;
  renderer: DomRenderer;
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
    'calBtn',
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
    'calModal',
    'calPrev',
    'calTitle',
    'calNext',
    'calClose',
    'calDow',
    'calGrid',
    'cardMapGrid',
    'cardMapTitle',
    'trophiesModal',
    'trophiesTitle',
    'trophiesClose',
    'trophiesGrid',
    'fx',
    'themeCss',
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
    body: new FakeEl('body', registry),
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
    defaultDow: DEFAULT_DOW,
    defaultStreakWords: DEFAULT_STREAK_WORDS,
    defaultMonths: DEFAULT_MONTHS,
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
  new DomController(h.tracker, h.renderer).start();
  return h;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

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

test('trophies render 30 tiles', async () => {
  const { registry } = await boot();
  registry['trophiesBtn']!.onclick!();
  const tiles = (registry['trophiesGrid']!.innerHTML.match(/data-tip/g) || []).length;
  assert.equal(tiles, 30, 'trophy tiles: ' + tiles);
});

test('calendar renders cday cells', async () => {
  const { registry } = await boot();
  registry['calBtn']!.onclick!();
  assert.ok((registry['calGrid']!.innerHTML || '').includes('cday'), 'calendar grid');
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
        items: [
          { id: 'p2i1', track: 'x', title: 'B', tasks: [{ id: 't1', text: 'y' }] },
        ],
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
  (h.renderer as unknown as Record<string, unknown>).applyTrackColors = () => { colors++; };
  (h.renderer as unknown as Record<string, unknown>).setLang = () => { langs++; };

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
