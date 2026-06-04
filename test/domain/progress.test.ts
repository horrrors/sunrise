import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Progress } from '../../src/domain/progress.ts';
import type { ProgressData } from '../../src/domain/progress.ts';
import type { Item } from '../../src/domain/entities.ts';

const item: Item = { id: 'i1', track: 'dsa', title: 'A', tasks: [{ id: 't1', text: 'x' }, { id: 't2', text: 'y' }] };
const rest: Item = { id: 'r', track: 'rest', rest: true };

test('empty + toJSON round-trips shape', () => {
  const p = Progress.empty();
  assert.deepEqual(p.toJSON(), { schema: 'sunrise.progress/v1', items: {}, reviews: [], badges: {}, lastSurprise: null });
});
test('completion invariant: partial not complete; full sets completedAt+hour', () => {
  const p = Progress.empty();
  p.setTaskDone(item, 't1', true, '2026-05-30', 14);
  assert.equal(p.isItemComplete(item), false);
  assert.equal(p.toJSON().items['i1']?.completedAt, null);
  p.setTaskDone(item, 't2', true, '2026-05-30', 14);
  assert.equal(p.isItemComplete(item), true);
  assert.equal(p.toJSON().items['i1']?.completedAt, '2026-05-30');
  assert.equal(p.toJSON().items['i1']?.completedHour, 14);
});
test('un-checking clears completion; re-completing later keeps the ORIGINAL completedAt', () => {
  const p = Progress.empty();
  p.setTaskDone(item, 't1', true, '2026-05-30', 14);
  p.setTaskDone(item, 't2', true, '2026-05-30', 14);
  p.setTaskDone(item, 't2', false, '2026-05-31', 9);
  assert.equal(p.toJSON().items['i1']?.completedAt, null);
  p.setTaskDone(item, 't2', true, '2026-06-02', 8);
  assert.equal(p.toJSON().items['i1']?.completedAt, '2026-06-02'); // re-set after clear
});
test('rest item never completes', () => {
  const p = Progress.empty();
  assert.equal(p.isItemComplete(rest), false);
});
test('reflections, completedDates, counts', () => {
  const p = Progress.empty();
  p.setReflection('i1', 'note'); p.setReflection('i2', '   ');
  assert.equal(p.reflection('i1'), 'note');
  assert.equal(p.reflectionCount(), 1);
  p.setTaskDone(item, 't1', true, '2026-05-30', 14); p.setTaskDone(item, 't2', true, '2026-05-30', 14);
  assert.deepEqual(p.completedDates(), ['2026-05-30']);
  assert.deepEqual(p.completedHours(), [14]);
  assert.equal(p.completedCount(), 1);
});
test('reviews: schedule replaces; advance clamps to maxStage', () => {
  const p = Progress.empty();
  p.scheduleReview('bfs', '2026-05-30');
  p.scheduleReview('bfs', '2026-05-31'); // replaces
  assert.equal(p.reviewList.length, 1);
  assert.equal(p.reviewList[0]?.stage, 0);
  p.advanceReview('bfs', '2026-06-01', 3);
  assert.equal(p.reviewList[0]?.stage, 1);
  for (let i = 0; i < 9; i++) p.advanceReview('bfs', '2026-06-02', 3);
  assert.equal(p.reviewList[0]?.stage, 3); // clamped
});
test('badges: award is sticky and records date', () => {
  const p = Progress.empty();
  p.awardBadge('first-light', '2026-05-30');
  p.awardBadge('first-light', '2026-06-01'); // ignored — already owned
  assert.equal(p.isBadgeOwned('first-light'), true);
  assert.equal(p.badgeAt('first-light'), '2026-05-30');
});
test('isItemComplete/taskChecked tolerate a progress entry missing tasks (legacy/tampered)', () => {
  const bad = { schema: 'sunrise.progress/v1', items: { i1: { reflection: '', completedAt: null, completedHour: null } }, reviews: [], badges: {}, lastSurprise: null } as unknown as ProgressData;
  const p = new Progress(bad);
  assert.doesNotThrow(() => p.isItemComplete(item));
  assert.equal(p.isItemComplete(item), false);
  assert.equal(p.taskChecked('i1', 't1'), false);
});
