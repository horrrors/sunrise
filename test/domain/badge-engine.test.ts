import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BadgeEngine } from '../../src/domain/badge-engine.ts';
import { Streaks } from '../../src/domain/streaks.ts';
import { ProgressStats } from '../../src/domain/progress-stats.ts';
import { Progress } from '../../src/domain/progress.ts';
import type { Pack, Item } from '../../src/domain/types/entities.ts';
import type { BadgeRule } from '../../src/domain/types/badge-rule.ts';
import type { ProgressData } from '../../src/domain/types/progress.ts';

const PACK: Pack = {
  schema: 'sunrise.pack/v1',
  id: 't',
  name: 'T',
  version: '1.0.0',
  tracks: [
    { id: 'dsa', label: 'DSA' },
    { id: 'js', label: 'JS' },
  ],
  phases: [{ id: 'p1', title: 'P1' }],
  groups: [
    {
      id: 'g1',
      title: 'G1',
      phase: 'p1',
      items: [
        { id: 'i1', track: 'dsa', tasks: [{ id: 't1', text: 'x' }] },
        { id: 'i2', track: 'js', tasks: [{ id: 't1', text: 'x' }] },
      ],
    },
  ],
};
const itemOf = (id: string): Item => PACK.groups.flatMap((g) => g.items).find((i) => i.id === id)!;
function engine(): BadgeEngine {
  return new BadgeEngine(new Streaks(), new ProgressStats());
}
function done(ids: string[], hour = 12): Progress {
  const p = Progress.empty();
  for (const id of ids) {
    const it = itemOf(id);
    p.setTaskDone(it, 't1', true, '2026-05-30', hour);
  }
  return p;
}

test('generic + pack rules evaluate', () => {
  const rules: BadgeRule[] = [
    { id: 'first', type: 'days-done', gte: 1, title: 'F' },
    { id: 'fin', type: 'all-done', title: 'Fin' },
    { id: 'owl', type: 'hour-range', from: 22, to: 5, title: 'O' },
    { id: 'wknd', type: 'weekday', days: [6, 7], title: 'W' },
    { id: 'poly', type: 'all-tracks', eachGte: 1, title: 'P' },
    { id: 'dsam', type: 'track-complete', track: 'dsa', title: 'D' },
    { id: 'cap', type: 'item-complete', item: 'i2', title: 'C' },
  ];
  const p = done(['i1'], 23); // Saturday 2026-05-30, 23:00, dsa done
  const by = Object.fromEntries(
    engine()
      .evaluate(PACK, p, rules)
      .map((b) => [b.id, b.unlocked]),
  );
  assert.equal(by['first'], true);
  assert.equal(by['fin'], false); // i2 not done
  assert.equal(by['owl'], true); // 23 in [22,5)
  assert.equal(by['wknd'], true); // Saturday
  assert.equal(by['poly'], false); // js track not touched
  assert.equal(by['dsam'], true); // dsa 100%
  assert.equal(by['cap'], false); // i2 not complete
});
test('sync awards once; evaluate keeps owned badges unlocked after work undone', () => {
  const e = engine();
  const rules: BadgeRule[] = [{ id: 'first', type: 'days-done', gte: 1, title: 'F' }];
  const p = done(['i1']);
  assert.deepEqual(e.sync(PACK, p, rules, '2026-05-30'), ['first']);
  assert.deepEqual(e.sync(PACK, p, rules, '2026-05-31'), []); // idempotent
  const undone = new Progress({
    schema: 'sunrise.progress/v1',
    items: {},
    badges: p.toJSON().badges,
  });
  const b = e.evaluate(PACK, undone, rules).find((x) => x.id === 'first')!;
  assert.equal(b.unlocked, true); // sticky
});
test('track-complete needs every item done, not a rounded 100% (199/200 must not award)', () => {
  const big: Pack = {
    schema: 'sunrise.pack/v1',
    id: 'big',
    name: 'Big',
    version: '1.0.0',
    tracks: [{ id: 'dsa', label: 'DSA' }],
    groups: [
      {
        id: 'g1',
        title: 'G',
        items: Array.from({ length: 200 }, (_, i) => ({
          id: `i${i}`,
          track: 'dsa',
          title: `I${i}`,
          tasks: [{ id: 't', text: 'x' }],
        })),
      },
    ],
  };
  const items: ProgressData['items'] = {};
  for (let i = 0; i < 199; i++) {
    items[`i${i}`] = {
      tasks: { t: true },
      reflection: '',
      completedAt: '2026-05-30',
      completedHour: 12,
    };
  }
  const p = new Progress({ schema: 'sunrise.progress/v1', items, badges: {} });
  const rules: BadgeRule[] = [
    { id: 'tc', type: 'track-complete', track: 'dsa', title: 'T' },
    { id: 'pc', type: 'percent', gte: 100, title: 'P' },
  ];
  const by = Object.fromEntries(
    engine()
      .evaluate(big, p, rules)
      .map((b) => [b.id, b.unlocked]),
  );
  assert.equal(by['tc'], false); // Math.round(199/200*100) === 100, but one item is open
  assert.equal(by['pc'], false);
  items['i199'] = {
    tasks: { t: true },
    reflection: '',
    completedAt: '2026-05-30',
    completedHour: 12,
  };
  const all = new Progress({ schema: 'sunrise.progress/v1', items, badges: {} });
  const by2 = Object.fromEntries(
    engine()
      .evaluate(big, all, rules)
      .map((b) => [b.id, b.unlocked]),
  );
  assert.equal(by2['tc'], true);
  assert.equal(by2['pc'], true);
});
test('true paths: phase-complete, all-tracks, item-complete, streak', () => {
  const rules: BadgeRule[] = [
    { id: 'p1c', type: 'phase-complete', phase: 'p1', title: 'P' },
    { id: 'poly', type: 'all-tracks', eachGte: 1, title: 'Poly' },
    { id: 'cap', type: 'item-complete', item: 'i2', title: 'C' },
    { id: 'st', type: 'streak', gte: 1, title: 'S' },
  ];
  const p = done(['i1', 'i2']); // both tracks + both items + phase p1 complete
  const by = Object.fromEntries(
    engine()
      .evaluate(PACK, p, rules)
      .map((b) => [b.id, b.unlocked]),
  );
  assert.equal(by['p1c'], true);
  assert.equal(by['poly'], true);
  assert.equal(by['cap'], true);
  assert.equal(by['st'], true);
});
