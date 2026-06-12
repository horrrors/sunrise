import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ReviewSchedule } from '../../src/domain/review-schedule.ts';
import { Progress } from '../../src/domain/progress.ts';

test('scheduled item is due from the next day onward', () => {
  const rs = new ReviewSchedule();
  const p = Progress.empty();
  rs.schedule(p, 'bfs', '2026-05-30');
  assert.deepEqual(rs.due(p, '2026-05-30'), []);
  assert.deepEqual(rs.due(p, '2026-05-31'), ['bfs']);
  assert.deepEqual(rs.due(p, '2026-06-30'), ['bfs']); // stays due until re-scheduled
});
test('re-scheduling resets the date and clears due-ness for today', () => {
  const rs = new ReviewSchedule();
  const p = Progress.empty();
  rs.schedule(p, 'bfs', '2026-05-30');
  rs.schedule(p, 'bfs', '2026-06-01');
  assert.deepEqual(rs.due(p, '2026-06-01'), []);
  assert.deepEqual(rs.due(p, '2026-06-02'), ['bfs']);
});
