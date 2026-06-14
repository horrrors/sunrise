import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tr, DEFAULT_LANG } from '../../src/domain/i18n.ts';

test('tr: plain string passes through unchanged for any lang', () => {
  assert.equal(tr('hi', 'en'), 'hi');
  assert.equal(tr('hi', 'ru'), 'hi');
});

test('tr: picks the active language', () => {
  assert.equal(tr({ en: 'Summary', ru: 'Сводка' }, 'ru'), 'Сводка');
  assert.equal(tr({ en: 'Summary', ru: 'Сводка' }, 'en'), 'Summary');
});

test('tr: falls back to EN, then any value, then empty', () => {
  assert.equal(tr({ en: 'E', ru: 'R' }, 'de'), 'E'); // unknown lang → EN
  assert.equal(tr({ ru: 'R' }, 'en'), 'R'); // EN missing → any value
  assert.equal(tr(undefined, 'en'), ''); // missing → ''
  assert.equal(tr({}, 'en'), ''); // empty map → ''
});

test('DEFAULT_LANG is en', () => assert.equal(DEFAULT_LANG, 'en'));
