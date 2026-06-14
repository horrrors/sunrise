import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_UI,
  GENERIC_BADGES,
  BUILTIN_THEMES,
  DEFAULT_STREAK_WORDS,
  SUPPORTED_LANGS,
} from '../../src/domain/builtins.ts';

// Guard: keep a future chrome string from shipping single-language.
const hasEnRu = (v: unknown): boolean =>
  typeof v === 'object' && v !== null && 'en' in v && 'ru' in v;

test('every DEFAULT_UI value provides en and ru', () => {
  for (const [k, v] of Object.entries(DEFAULT_UI)) {
    assert.ok(hasEnRu(v), `ui "${k}" must have en+ru`);
  }
});
test('every generic badge title/desc provides en and ru', () => {
  for (const b of GENERIC_BADGES) {
    assert.ok(hasEnRu(b.title), `badge ${b.id}.title`);
    if (b.desc != null) assert.ok(hasEnRu(b.desc), `badge ${b.id}.desc`);
  }
});
test('streak words exist for every supported language', () => {
  for (const { id } of SUPPORTED_LANGS) {
    assert.ok(Array.isArray(DEFAULT_STREAK_WORDS[id]), `streak words for "${id}"`);
  }
});
test('theme names carry no Cyrillic (English brand strings only)', () => {
  for (const t of BUILTIN_THEMES) assert.ok(!/[А-Яа-яЁё]/.test(t.name), t.name);
});

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
