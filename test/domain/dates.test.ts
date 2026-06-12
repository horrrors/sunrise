import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, diffDays, weekdayMon } from '../../src/domain/dates.ts';

test('addDays crosses month, year, and leap boundaries', () => {
  assert.equal(addDays('2026-01-31', 1), '2026-02-01');
  assert.equal(addDays('2025-12-31', 1), '2026-01-01');
  assert.equal(addDays('2024-02-28', 1), '2024-02-29'); // leap year
  assert.equal(addDays('2024-02-29', 1), '2024-03-01');
  assert.equal(addDays('2025-02-28', 1), '2025-03-01'); // non-leap
});

test('addDays with negative n walks backwards', () => {
  assert.equal(addDays('2026-02-01', -1), '2026-01-31');
  assert.equal(addDays('2024-03-01', -1), '2024-02-29');
  assert.equal(addDays('2026-01-01', -1), '2025-12-31');
  assert.equal(addDays('2026-06-09', 0), '2026-06-09');
});

test('diffDays is antisymmetric and spans years', () => {
  assert.equal(diffDays('2025-12-31', '2026-01-01'), 1);
  assert.equal(diffDays('2026-01-01', '2025-12-31'), -1);
  assert.equal(diffDays('2026-06-09', '2026-06-09'), 0);
  assert.equal(diffDays('2024-01-01', '2026-01-01'), 731); // 2024 is leap
  assert.equal(diffDays('2026-01-01', '2024-01-01'), -731);
});

test('weekdayMon maps 0=Mon..6=Sun', () => {
  assert.equal(weekdayMon('2024-01-01'), 0); // the Monday anchor
  assert.equal(weekdayMon('2026-05-30'), 5); // Saturday
  assert.equal(weekdayMon('2026-05-31'), 6); // Sunday
  assert.equal(weekdayMon('1900-01-01'), 0); // Monday before the anchor (negative diff)
  assert.equal(weekdayMon('2100-01-04'), 0); // Monday far future
});
