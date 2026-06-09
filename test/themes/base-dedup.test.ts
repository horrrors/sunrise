import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

// Guards the "shared theme base" refactor: the mechanism rules below live in the
// app baseline (index.html inline <style>), not duplicated in every theme.
const THEMES = readdirSync('themes').filter((f) => f.endsWith('.css'));

for (const f of THEMES) {
  test(`theme ${f}: shared mechanism rules live in base, not the theme`, () => {
    const css = readFileSync(`themes/${f}`, 'utf8');
    assert.ok(!/box-sizing/.test(css), 'box-sizing reset belongs to the base');
    assert.ok(!/prefers-reduced-motion/.test(css), 'reduced-motion guard belongs to the base');
    assert.ok(
      !/\.task\s+input[^{:]*\{[^}]*opacity\s*:\s*0/.test(css),
      'hide-native-checkbox rule belongs to the base',
    );
    const opens = (css.match(/\{/g) || []).length;
    const closes = (css.match(/\}/g) || []).length;
    assert.equal(opens, closes, 'braces stay balanced after deletions');
  });
}

test('index.html ships the base mechanism + focus token', () => {
  const html = readFileSync('index.html', 'utf8');
  assert.ok(/box-sizing:border-box/.test(html), 'box-sizing reset in base');
  assert.ok(/\.task input\{[^}]*opacity:0/.test(html), 'hide-checkbox in base');
  assert.ok(/prefers-reduced-motion/.test(html), 'reduced-motion guard in base');
  assert.ok(/--focus-ring/.test(html), 'focus highlight tokenized via --focus-ring');
});
