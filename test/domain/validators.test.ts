import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PackValidator, ThemeValidator, ProgressValidator } from '../../src/domain/validators.ts';
import { ValidationError } from '../../src/domain/errors.ts';

const PACK = {
  schema: 'sunrise.pack/v1',
  id: 'p',
  name: 'P',
  version: '1.0.0',
  tracks: [{ id: 'dsa', label: 'DSA' }],
  groups: [
    {
      id: 'g1',
      title: 'G1',
      items: [{ id: 'g1i1', track: 'dsa', tasks: [{ id: 't1', text: 'x' }] }],
    },
  ],
};
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

test('valid pack parses to itself', () => {
  assert.deepEqual(new PackValidator().parse(clone(PACK)), PACK);
});
test('issues: bad track ref, dup item id, unknown badge type, bad item-complete ref, leading-hyphen id, empty tracks', () => {
  const v = new PackValidator();
  const undeclared = clone(PACK);
  undeclared.groups[0]!.items[0]!.track = 'nope';
  assert.throws(
    () => v.parse(undeclared),
    (e: unknown) =>
      e instanceof ValidationError && e.issues.some((i) => i.path === 'groups[0].items[0].track'),
  );
  const dup = clone(PACK);
  dup.groups[0]!.items.push({ id: 'g1i1', track: 'dsa', tasks: [{ id: 't1', text: 'y' }] });
  assert.throws(
    () => v.parse(dup),
    (e: unknown) =>
      e instanceof ValidationError && e.issues.some((i) => /duplicate item id/.test(i.msg)),
  );
  const badge = clone(PACK) as Record<string, unknown>;
  badge.badges = [{ id: 'b', title: 'B', type: 'tarck-complete', track: 'dsa' }];
  assert.throws(
    () => v.parse(badge),
    (e: unknown) =>
      e instanceof ValidationError && e.issues.some((i) => /unknown rule type/.test(i.msg)),
  );
  const cap = clone(PACK) as Record<string, unknown>;
  cap.badges = [{ id: 'c', title: 'C', type: 'item-complete', item: 'ghost' }];
  assert.throws(
    () => v.parse(cap),
    (e: unknown) =>
      e instanceof ValidationError && e.issues.some((i) => i.path === 'badges[0].item'),
  );
  const ctor = clone(PACK);
  ctor.tracks = [{ id: 'constructor', label: 'C' }];
  ctor.groups[0]!.items[0]!.track = 'constructor';
  assert.deepEqual(new PackValidator().parse(ctor).tracks[0]!.id, 'constructor'); // proto-chain regression
  const empty = clone(PACK);
  empty.tracks = [];
  assert.throws(() => v.parse(empty), ValidationError);
});
test('theme parse: valid passes; wrong version throws', () => {
  const t = {
    schema: 'sunrise.theme/v1',
    id: 'neon',
    name: 'Neon',
    version: '1.0.0',
    cssHref: 'themes/neon.css',
  };
  assert.deepEqual(new ThemeValidator().parse(t), t);
  assert.throws(
    () => new ThemeValidator().parse({ ...t, schema: 'sunrise.theme/v2' }),
    ValidationError,
  );
});
test('progress parse: valid passes; null item rejected; legacy days→items', () => {
  const v = new ProgressValidator();
  const ok = {
    schema: 'sunrise.progress/v1',
    items: { a: { tasks: {}, reflection: '', completedAt: null, completedHour: null } },
    badges: {},
    lastSurprise: null,
  };
  assert.deepEqual(v.parse(ok).items['a']?.reflection, '');
  assert.throws(() => v.parse({ items: { x: null } }), ValidationError);
  const legacy = {
    version: 2,
    days: {
      w1d1: { tasks: { t1: true }, reflection: '', completedAt: '2026-05-30', completedHour: 14 },
    },
    reviews: [],
    badges: { 'first-light': { at: '2026-05-30' } },
  };
  const out = v.parse(legacy);
  assert.equal(out.items['w1d1']?.completedHour, 14);
  assert.equal(out.badges['first-light']?.at, '2026-05-30');
});
test('badge missing required param: streak without gte → issue path badges[0].gte', () => {
  const v = new PackValidator();
  const bad = clone(PACK) as Record<string, unknown>;
  bad.badges = [{ id: 'b', title: 'B', type: 'streak' }]; // missing gte
  assert.throws(
    () => v.parse(bad),
    (e: unknown) =>
      e instanceof ValidationError && e.issues.some((i) => i.path === 'badges[0].gte'),
  );
});

test('weekday badge with non-number[] days → issue path badges[0].days', () => {
  const v = new PackValidator();
  const bad = clone(PACK) as Record<string, unknown>;
  bad.badges = [{ id: 'b', title: 'B', type: 'weekday', days: 'sat' }]; // should be number[]
  assert.throws(
    () => v.parse(bad),
    (e: unknown) =>
      e instanceof ValidationError && e.issues.some((i) => i.path === 'badges[0].days'),
  );
});

test('duplicate task id within an item → issue mentioning duplicate task id', () => {
  const v = new PackValidator();
  const bad = clone(PACK);
  bad.groups[0]!.items[0]!.tasks.push({ id: 't1', text: 'y' });
  assert.throws(
    () => v.parse(bad),
    (e: unknown) =>
      e instanceof ValidationError && e.issues.some((i) => /duplicate task id/.test(i.msg)),
  );
});

// The review feature was removed; stored blobs (and old exports) still carry a
// `reviews` key in any shape. It must be silently dropped, never rejected.
test('ProgressValidator: legacy reviews key is ignored and not round-tripped', () => {
  const v = new ProgressValidator();
  const out = v.parse({
    items: {},
    reviews: [{ itemId: 'a', lastDate: '2026-01-02' }, 'garbage'],
  });
  assert.ok(!('reviews' in out), 'parsed data must not carry reviews');
  assert.ok(!('reviews' in v.parse({ items: {} })), 'missing reviews key is fine too');
});

const hasIssue = (e: unknown, path: string, re?: RegExp): boolean =>
  e instanceof ValidationError && e.issues.some((i) => i.path === path && (!re || re.test(i.msg)));

test('null array elements → ValidationError with precise paths, not TypeErrors', () => {
  const v = new PackValidator();
  const base = clone(PACK);
  const g = base.groups[0]!;
  const it = g.items[0]!;
  assert.throws(
    () => v.parse({ ...base, tracks: [...base.tracks, null] }),
    (e: unknown) => hasIssue(e, 'tracks[1]'),
  );
  assert.throws(
    () => v.parse({ ...base, groups: [{ ...g, items: [...g.items, null] }] }),
    (e: unknown) => hasIssue(e, 'groups[0].items[1]'),
  );
  assert.throws(
    () => v.parse({ ...base, groups: [{ ...g, items: [{ ...it, tasks: [...it.tasks, null] }] }] }),
    (e: unknown) => hasIssue(e, 'groups[0].items[0].tasks[1]'),
  );
  assert.throws(
    () => v.parse({ ...base, groups: [{ ...g, items: [{ ...it, resources: [null] }] }] }),
    (e: unknown) => hasIssue(e, 'groups[0].items[0].resources[0]'),
  );
  assert.throws(
    () => v.parse({ ...base, mottos: [null] }),
    (e: unknown) => hasIssue(e, 'mottos[0]'),
  );
});

test('non-rest item needs tasks; rest item without tasks is fine', () => {
  const v = new PackValidator();
  const base = clone(PACK);
  const g = base.groups[0]!;
  assert.throws(
    () => v.parse({ ...base, groups: [{ ...g, items: [{ id: 'x1', track: 'dsa' }] }] }),
    (e: unknown) => hasIssue(e, 'groups[0].items[0].tasks', /at least one task/),
  );
  assert.throws(
    () => v.parse({ ...base, groups: [{ ...g, items: [{ id: 'x1', track: 'dsa', tasks: [] }] }] }),
    (e: unknown) => hasIssue(e, 'groups[0].items[0].tasks'),
  );
  const rest = v.parse({
    ...base,
    groups: [{ ...g, items: [{ id: 'r1', track: 'rest', rest: true }] }],
  });
  assert.equal(rest.groups[0]!.items[0]!.rest, true);
});

test('ui and settings.labels values must be strings', () => {
  const v = new PackValidator();
  assert.throws(
    () => v.parse({ ...clone(PACK), ui: { phaseLabel: 123 } }),
    (e: unknown) => hasIssue(e, 'ui.phaseLabel'),
  );
  assert.throws(
    () => v.parse({ ...clone(PACK), settings: { labels: { item: 5 } } }),
    (e: unknown) => hasIssue(e, 'settings.labels.item'),
  );
  const ok = v.parse({
    ...clone(PACK),
    ui: { phaseLabel: 'Phase' },
    settings: { labels: { item: 'Day' } },
  });
  assert.equal(ok.ui?.['phaseLabel'], 'Phase');
});

test('weekday days outside 1..7 and hour-range outside 0..23 are rejected', () => {
  const v = new PackValidator();
  assert.throws(
    () =>
      v.parse({ ...clone(PACK), badges: [{ id: 'b', title: 'B', type: 'weekday', days: [0, 6] }] }),
    (e: unknown) => hasIssue(e, 'badges[0].days', /1=Mon\.\.7=Sun/),
  );
  v.parse({ ...clone(PACK), badges: [{ id: 'b', title: 'B', type: 'weekday', days: [6, 7] }] });
  assert.throws(
    () =>
      v.parse({
        ...clone(PACK),
        badges: [{ id: 'b', title: 'B', type: 'hour-range', from: 25, to: 5 }],
      }),
    (e: unknown) => hasIssue(e, 'badges[0].from'),
  );
  v.parse({
    ...clone(PACK),
    badges: [{ id: 'b', title: 'B', type: 'hour-range', from: 22, to: 5 }],
  });
});

test('progress: wrong schema version rejected; absent schema accepted', () => {
  const v = new ProgressValidator();
  assert.throws(
    () => v.parse({ schema: 'sunrise.progress/v99', items: {} }),
    (e: unknown) => hasIssue(e, 'schema', /unsupported progress version/),
  );
  assert.equal(v.parse({ items: {} }).schema, 'sunrise.progress/v1');
});

test('progress: item entry internals normalized or rejected', () => {
  const v = new ProgressValidator();
  const empty = v.parse({ items: { a: {} } });
  assert.deepEqual(empty.items['a'], {
    tasks: {},
    reflection: '',
    completedAt: null,
    completedHour: null,
  });
  assert.throws(
    () => v.parse({ items: { a: { completedAt: 42 } } }),
    (e: unknown) => hasIssue(e, 'items.a.completedAt'),
  );
  // completedAt is shape-checked only (\d{4}-\d{2}-\d{2}); impossible-but-shaped dates pass through.
  const shaped = v.parse({ items: { a: { completedAt: '2026-13-99' } } });
  assert.equal(shaped.items['a']?.completedAt, '2026-13-99');
  const tasks = v.parse({
    items: { a: { tasks: { t1: true, t2: false, t3: 1, t4: 'x' } } },
  }).items['a']!.tasks;
  assert.deepEqual(tasks, { t1: true });
});

test('progress: legacy days blob migrates to items', () => {
  const out = new ProgressValidator().parse({
    days: { a: { tasks: { t: true } } },
    reviews: [{ itemId: 'a', lastDate: '2026-01-01', stage: 2 }],
  });
  assert.deepEqual(out.items['a'], {
    tasks: { t: true },
    reflection: '',
    completedAt: null,
    completedHour: null,
  });
  assert.ok(!('reviews' in out));
});
