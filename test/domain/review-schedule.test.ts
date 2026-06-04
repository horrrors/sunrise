import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ReviewSchedule } from '../../src/domain/review-schedule.ts';
import { Progress } from '../../src/domain/progress.ts';

test('schedule → due after interval; complete advances; negative stage clamps to due', () => {
  const rs = new ReviewSchedule(); const p = Progress.empty();
  rs.schedule(p, 'bfs', '2026-05-30');
  assert.deepEqual(rs.due(p, '2026-05-30'), []);
  assert.deepEqual(rs.due(p, '2026-05-31'), ['bfs']);
  rs.complete(p, 'bfs', '2026-05-31');
  assert.equal(p.getReviewList()[0]?.stage, 1);
});
test('tampered negative stage still becomes due (clamp lower bound)', () => {
  const p = new Progress({ schema: 'sunrise.progress/v1', items: {}, reviews: [{ itemId: 'x', lastDate: '2026-05-01', stage: -5 }], badges: {}, lastSurprise: null });
  assert.deepEqual(new ReviewSchedule().due(p, '2026-06-30'), ['x']);
});
