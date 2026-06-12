import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Streaks } from '../../src/domain/streaks.ts';
import { Progress } from '../../src/domain/progress.ts';
import type { ProgressData } from '../../src/domain/types/progress.ts';

function progressOf(dates: string[]): Progress {
  const items: ProgressData['items'] = {};
  dates.forEach((d, i) => {
    items['x' + i] = { tasks: {}, reflection: '', completedAt: d, completedHour: 12 };
  });
  return new Progress({ schema: 'sunrise.progress/v1', items, reviews: [], badges: {} });
}

test('streaks: empty, consecutive ending today, anchors to yesterday', () => {
  const s = new Streaks();
  assert.equal(s.current(progressOf([]), '2026-05-30'), 0);
  assert.equal(s.current(progressOf(['2026-05-28', '2026-05-29', '2026-05-30']), '2026-05-30'), 3);
  assert.equal(s.current(progressOf(['2026-05-28', '2026-05-29']), '2026-05-30'), 2);
  assert.equal(s.current(progressOf(['2026-05-27']), '2026-05-30'), 0);
});
test('longest streak across gaps', () => {
  const s = new Streaks();
  assert.equal(s.longest(progressOf([])), 0);
  assert.equal(s.longest(progressOf(['2026-05-30'])), 1);
  assert.equal(
    s.longest(progressOf(['2026-05-20', '2026-05-21', '2026-05-29', '2026-05-30', '2026-05-31'])),
    3,
  );
});
test('hasComeback: true only when a >=2-day gap exists between completions', () => {
  const s = new Streaks();
  assert.equal(s.hasComeback(progressOf(['2026-05-28', '2026-05-29', '2026-05-30'])), false);
  assert.equal(s.hasComeback(progressOf(['2026-05-20', '2026-05-28'])), true);
  assert.equal(s.hasComeback(progressOf([])), false);
});
