import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  LocalStorageProgressStore,
  LocalStorageSessionStore,
  LocalStoragePluginStore,
  migrateLegacy,
} from '../../src/adapters/local-storage-store.ts';
import { Progress } from '../../src/domain/progress.ts';
import type { Item } from '../../src/domain/types/entities.ts';

// ---------------------------------------------------------------------------
// Fake localStorage: Map-backed stub assigned to globalThis
// ---------------------------------------------------------------------------

function makeFakeStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length(): number {
      return store.size;
    },
    key(index: number): string | null {
      return [...store.keys()][index] ?? null;
    },
    getItem(key: string): string | null {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      store.set(key, value);
    },
    removeItem(key: string): void {
      store.delete(key);
    },
    clear(): void {
      store.clear();
    },
  };
}

beforeEach(() => {
  // Fresh localStorage for every test — no cross-test leakage
  (globalThis as unknown as { localStorage: Storage }).localStorage = makeFakeStorage();
});

// ---------------------------------------------------------------------------
// LocalStorageProgressStore
// ---------------------------------------------------------------------------

test('load returns Progress.empty() when key is missing', () => {
  const store = new LocalStorageProgressStore();
  const p = store.load('no-such-pack');
  assert.deepEqual(p.toJSON(), Progress.empty().toJSON());
});

test('load returns Progress.empty() on corrupt JSON and backs up the raw blob', () => {
  localStorage.setItem('sunrise.progress.bad', '{not json}}');
  const store = new LocalStorageProgressStore();
  const p = store.load('bad');
  assert.deepEqual(p.toJSON(), Progress.empty().toJSON());
  assert.equal(localStorage.getItem('sunrise.progress.bad.corrupt'), '{not json}}');
});

test('load returns Progress.empty() when localStorage.getItem throws (privacy mode)', () => {
  const broken = makeFakeStorage();
  broken.getItem = () => {
    throw new Error('SecurityError');
  };
  (globalThis as unknown as { localStorage: Storage }).localStorage = broken;
  const store = new LocalStorageProgressStore();
  const p = store.load('mypkg');
  assert.deepEqual(p.toJSON(), Progress.empty().toJSON());
});

test('load backs up a blob with an unknown schema version and starts empty', () => {
  const raw = JSON.stringify({
    schema: 'sunrise.progress/v99',
    items: {},
    reviews: [],
    badges: {},
  });
  localStorage.setItem('sunrise.progress.future', raw);
  const store = new LocalStorageProgressStore();
  const p = store.load('future');
  assert.deepEqual(p.toJSON(), Progress.empty().toJSON());
  assert.equal(localStorage.getItem('sunrise.progress.future.corrupt'), raw);
});

test('load returns Progress.empty() on null item in stored progress', () => {
  // A stored blob where an item value is null — ProgressValidator rejects it
  const corrupt = JSON.stringify({
    schema: 'sunrise.progress/v1',
    items: { i1: null },
    reviews: [],
    badges: {},
    lastSurprise: null,
  });
  localStorage.setItem('sunrise.progress.mypkg', corrupt);
  const store = new LocalStorageProgressStore();
  const p = store.load('mypkg');
  assert.deepEqual(p.toJSON(), Progress.empty().toJSON());
});

test('save → load round-trips progress', () => {
  const item: Item = { id: 'i1', track: 'dsa', tasks: [{ id: 't1', text: 'x' }] };
  const store = new LocalStorageProgressStore();
  const p = Progress.empty();
  p.setTaskDone(item, 't1', true, '2026-05-30', 12);
  store.save('mypkg', p);
  const loaded = store.load('mypkg');
  assert.equal(loaded.isItemComplete(item), true);
  assert.equal(loaded.toJSON().items['i1']?.completedAt, '2026-05-30');
});

test('save is a no-op when localStorage throws (quota)', () => {
  // Override setItem to throw
  const throwing = makeFakeStorage();
  throwing.setItem = () => {
    throw new Error('QuotaExceededError');
  };
  (globalThis as unknown as { localStorage: Storage }).localStorage = throwing;
  const store = new LocalStorageProgressStore();
  // Should not throw
  assert.doesNotThrow(() => store.save('pack', Progress.empty()));
});

// ---------------------------------------------------------------------------
// LocalStorageSessionStore
// ---------------------------------------------------------------------------

test('session load returns {} when key is missing', () => {
  const store = new LocalStorageSessionStore();
  assert.deepEqual(store.load(), {});
});

test('session load returns {} for stored "null" JSON', () => {
  localStorage.setItem('sunrise.session', 'null');
  const store = new LocalStorageSessionStore();
  assert.deepEqual(store.load(), {});
});

test('session load returns {} for stored array JSON', () => {
  localStorage.setItem('sunrise.session', '[]');
  const store = new LocalStorageSessionStore();
  assert.deepEqual(store.load(), {});
});

test('session save → load round-trips', () => {
  const store = new LocalStorageSessionStore();
  store.save({ activePackId: 'dev-roadmap', themeId: 'neon' });
  const s = store.load();
  assert.equal(s.activePackId, 'dev-roadmap');
  assert.equal(s.themeId, 'neon');
});

// ---------------------------------------------------------------------------
// migrateLegacy
// ---------------------------------------------------------------------------

const LEGACY_KEY = 'devRoadmapState.v1';
const LEGACY_BLOB = JSON.stringify({
  version: 2,
  days: {
    w1d1: { tasks: { t1: true }, reflection: 'good', completedAt: '2026-05-30', completedHour: 14 },
  },
  reviews: [],
  badges: { 'first-light': { at: '2026-05-30' } },
});

test('migrateLegacy copies v2 blob to sunrise.progress.dev-roadmap', () => {
  localStorage.setItem(LEGACY_KEY, LEGACY_BLOB);
  migrateLegacy();
  const raw = localStorage.getItem('sunrise.progress.dev-roadmap');
  assert.ok(raw, 'progress key should be set');
  const parsed = JSON.parse(raw);
  // days → items mapping
  assert.ok(parsed.items?.['w1d1'], 'w1d1 item should exist');
  assert.equal(parsed.items['w1d1'].completedAt, '2026-05-30');
  assert.equal(parsed.badges['first-light']?.at, '2026-05-30');
});

test('migrateLegacy sets activePackId=dev-roadmap in session', () => {
  localStorage.setItem(LEGACY_KEY, LEGACY_BLOB);
  migrateLegacy();
  const raw = localStorage.getItem('sunrise.session');
  assert.ok(raw);
  const sess = JSON.parse(raw);
  assert.equal(sess.activePackId, 'dev-roadmap');
});

test('migrateLegacy copies legacy theme to session', () => {
  localStorage.setItem(LEGACY_KEY, LEGACY_BLOB);
  localStorage.setItem('sunriseTheme', 'neon');
  migrateLegacy();
  const sess = JSON.parse(localStorage.getItem('sunrise.session')!);
  assert.equal(sess.themeId, 'neon');
});

test('migrateLegacy is idempotent: does not overwrite existing progress', () => {
  localStorage.setItem(LEGACY_KEY, LEGACY_BLOB);
  const alreadyMigrated = JSON.stringify(Progress.empty().toJSON());
  localStorage.setItem('sunrise.progress.dev-roadmap', alreadyMigrated);
  migrateLegacy();
  // Progress key should still be the pre-existing empty one
  const raw = localStorage.getItem('sunrise.progress.dev-roadmap')!;
  const parsed = JSON.parse(raw);
  assert.deepEqual(parsed.items, {});
});

test('migrateLegacy does nothing when legacy key is absent', () => {
  migrateLegacy();
  assert.equal(localStorage.getItem('sunrise.progress.dev-roadmap'), null);
  assert.equal(localStorage.getItem('sunrise.session'), null);
});

test('migrateLegacy swallows a throwing localStorage (never blocks boot)', () => {
  const broken = makeFakeStorage();
  // getItem throws for LEGACY key lookup
  broken.getItem = (key: string) => {
    if (key === LEGACY_KEY) throw new Error('storage error');
    return null;
  };
  (globalThis as unknown as { localStorage: Storage }).localStorage = broken;
  assert.doesNotThrow(() => migrateLegacy());
});

// ---------------------------------------------------------------------------
// LocalStoragePluginStore
// ---------------------------------------------------------------------------

test('LocalStoragePluginStore round-trips appended raws', () => {
  const store = new LocalStoragePluginStore();
  assert.deepEqual(store.load(), []);
  store.append({ schema: 'sunrise.theme/v1', id: 'x' });
  store.append({ schema: 'sunrise.pack/v1', id: 'p' });
  assert.equal(store.load().length, 2);
  assert.equal((store.load()[0] as { id: string }).id, 'x');
});

test('LocalStoragePluginStore.load tolerates a corrupt blob', () => {
  localStorage.setItem('sunrise.plugins', '{not json');
  assert.deepEqual(new LocalStoragePluginStore().load(), []);
});

test('LocalStoragePluginStore.load tolerates a non-array blob', () => {
  localStorage.setItem('sunrise.plugins', '{"id":"x"}');
  assert.deepEqual(new LocalStoragePluginStore().load(), []);
});
