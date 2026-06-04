import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ProgressStats } from '../../src/domain/progress-stats.ts';
import { Progress } from '../../src/domain/progress.ts';
import type { Pack, Item } from '../../src/domain/types/entities.ts';

const PACK: Pack = {
  schema: 'sunrise.pack/v1', id: 't', name: 'T', version: '1.0.0',
  tracks: [{ id: 'dsa', label: 'DSA' }, { id: 'js', label: 'JS' }],
  phases: [{ id: 'p1', title: 'P1' }, { id: 'p2', title: 'P2' }],
  groups: [
    { id: 'g1', title: 'G1', phase: 'p1', items: [
      { id: 'g1i1', track: 'dsa', tasks: [{ id: 't1', text: 'x' }, { id: 't2', text: 'y' }] },
      { id: 'g1i2', track: 'js', tasks: [{ id: 't1', text: 'x' }] },
      { id: 'g1r', track: 'rest', rest: true },
    ] },
    { id: 'g2', title: 'G2', phase: 'p2', items: [{ id: 'g2i1', track: 'dsa', tasks: [{ id: 't1', text: 'x' }] }] },
  ],
};
function complete(p: Progress, item: Item): void { for (const t of item.tasks ?? []) p.setTaskDone(item, t.id, true, '2026-05-30', 10); }
const itemOf = (id: string): Item => PACK.groups.flatMap((g) => g.items).find((i) => i.id === id)! as Item;

test('overall/byTrack/byPhase exclude rest; tracks lists non-rest', () => {
  const s = new ProgressStats(); const p = Progress.empty();
  complete(p, itemOf('g1i1'));
  assert.deepEqual(s.overall(PACK, p), { done: 1, total: 3, pct: 33 });
  assert.deepEqual(s.byTrack(PACK, p)['dsa'], { done: 1, total: 2, pct: 50 });
  assert.deepEqual(s.byPhase(PACK, p)['p1'], { done: 1, total: 2, pct: 50 });
  assert.deepEqual(s.tracks(PACK).sort(), ['dsa', 'js']);
});
test('countTasks (optionally by track), completedGroups', () => {
  const s = new ProgressStats(); const p = Progress.empty();
  complete(p, itemOf('g1i1'));
  assert.equal(s.countTasks(PACK, p), 2);
  assert.equal(s.countTasks(PACK, p, 'js'), 0);
  assert.equal(s.completedGroups(PACK, p), 0);
});
test('completedGroups counts a fully-complete non-rest group; byPhase skips phaseless groups; countTasks by track is positive', () => {
  const s = new ProgressStats();
  const p = Progress.empty();
  complete(p, itemOf('g1i1')); complete(p, itemOf('g1i2')); // all non-rest items of g1
  assert.equal(s.completedGroups(PACK, p), 1);
  assert.equal(s.countTasks(PACK, p, 'dsa'), 2);
  // a pack whose group has no phase → excluded from byPhase
  const noPhase = { ...PACK, groups: [{ id: 'gx', title: 'GX', items: [{ id: 'gxi', track: 'dsa', tasks: [{ id: 't1', text: 'x' }] }] }] };
  assert.deepEqual(s.byPhase(noPhase, Progress.empty()), {});
});
