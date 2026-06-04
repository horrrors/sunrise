import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_UI, GENERIC_BADGES, BUILTIN_THEMES } from '../../src/domain/builtins.ts';

test('20 generic badges, none referencing track/phase/item, all with id/title/icon', () => {
  assert.equal(GENERIC_BADGES.length, 20);
  for (const b of GENERIC_BADGES) {
    assert.ok(b.id && b.title && b.icon);
    assert.ok(!('track' in b) && !('phase' in b) && !('item' in b));
  }
});
test('5 builtin themes with cssHref; DEFAULT_UI has hint + daysOf', () => {
  assert.deepEqual(BUILTIN_THEMES.map((t) => t.id).sort(), [
    'bonus',
    'dashboard',
    'emerald',
    'japanese',
    'neon',
  ]);
  for (const t of BUILTIN_THEMES) assert.equal(t.schema, 'sunrise.theme/v1');
  assert.ok(DEFAULT_UI['hint'] && DEFAULT_UI['daysOf']);
});
