// test/themes/mobile-guard.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));

// Mobile layout is app-owned ([data-mobile] baseline). Themes must not ship
// phone-range media queries; ≥900px tablet refinements are allowed.
test('no theme carries a phone-range (max-width < 900px) media query', () => {
  const dir = join(root, 'themes');
  const offenders: string[] = [];
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.css'))) {
    const css = readFileSync(join(dir, f), 'utf8');
    // Match only @media preludes — `max-width` is also a legitimate CSS
    // property (modal panels, tooltips) and must not trip the guard.
    const re = /@media[^{]*max-width:\s*(\d+(?:\.\d+)?)px/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(css))) {
      if (parseFloat(m[1]!) < 900) offenders.push(`${f}: max-width:${m[1]}px`);
    }
  }
  assert.deepEqual(offenders, [], 'use :root[data-mobile][data-theme=...] overrides instead');
});

test('index.html ships the dock + [data-mobile] HUD baseline', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.ok(html.includes('#dock{display:none}'), 'dock hidden by default');
  assert.ok(html.includes(':root[data-mobile] #dock'), 'HUD block present');
  assert.ok(html.includes('id="dock"'), 'dock markup present');
});
