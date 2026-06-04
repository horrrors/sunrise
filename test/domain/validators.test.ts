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
    { id: 'g1', title: 'G1', items: [{ id: 'g1i1', track: 'dsa', tasks: [{ id: 't1', text: 'x' }] }] },
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
    (e: unknown) => e instanceof ValidationError && e.issues.some((i) => i.path === 'badges[0].item'),
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
  assert.throws(() => new ThemeValidator().parse({ ...t, schema: 'sunrise.theme/v2' }), ValidationError);
});
test('progress parse: valid passes; null item rejected; legacy days→items', () => {
  const v = new ProgressValidator();
  const ok = {
    schema: 'sunrise.progress/v1',
    items: { a: { tasks: {}, reflection: '', completedAt: null, completedHour: null } },
    reviews: [],
    badges: {},
    lastSurprise: null,
  };
  assert.deepEqual(v.parse(ok).items['a']?.reflection, '');
  assert.throws(() => v.parse({ items: { x: null }, reviews: [] }), ValidationError);
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
test('parse rejects bad JSON via parseProgressJson', () => {
  assert.throws(
    () => new ProgressValidator().parseJson('{bad'),
    (e: unknown) => e instanceof ValidationError || (e as Error).name === 'ImportError',
  );
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

test('ProgressValidator: reviews entry with wrong shape → issue path reviews[0]', () => {
  const v = new ProgressValidator();
  assert.throws(
    () => v.parse({ items: {}, reviews: ['oops'] }),
    (e: unknown) =>
      e instanceof ValidationError && e.issues.some((i) => i.path === 'reviews[0]'),
  );
});
