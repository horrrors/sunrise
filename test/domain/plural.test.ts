import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pluralIndex } from '../../src/domain/plural.ts';

test('en: 1 → 0 (singular), everything else → 1 (plural)', () => {
  assert.equal(pluralIndex('en', 1), 0);
  assert.equal(pluralIndex('en', 0), 1);
  assert.equal(pluralIndex('en', 2), 1);
  assert.equal(pluralIndex('en', 21), 1);
});

test('ru: Slavic 3-form one/few/many → 0/1/2', () => {
  assert.equal(pluralIndex('ru', 1), 0); // день
  assert.equal(pluralIndex('ru', 21), 0);
  assert.equal(pluralIndex('ru', 2), 1); // дня
  assert.equal(pluralIndex('ru', 23), 1);
  assert.equal(pluralIndex('ru', 5), 2); // дней
  assert.equal(pluralIndex('ru', 11), 2); // 11..14 are 'many' despite ending in 1..4
  assert.equal(pluralIndex('ru', 12), 2);
  assert.equal(pluralIndex('ru', 14), 2);
  assert.equal(pluralIndex('ru', 0), 2);
});

test('unknown lang uses the 2-form default', () => {
  assert.equal(pluralIndex('de', 1), 0);
  assert.equal(pluralIndex('de', 7), 1);
});
