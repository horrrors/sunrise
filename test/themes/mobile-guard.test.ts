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

// Every fixed HUD element (dock, sheets, modals, toasts) must anchor to the
// VIEWPORT. A filter/transform/backdrop-filter — or a *running or filled
// animation* of one (arcade's body-level crt-flicker, os95's header
// window-zoom with fill:both) — turns that ancestor into the containing block
// instead, and the fixed element anchors to the page box (dock off-screen,
// menu sheet hanging from the header). The baseline must cancel every trigger
// on both fixed-element ancestors: body (everything) and .app-header
// (.toolbar's parent).
test('mobile baseline neutralizes containing-block triggers on fixed-element ancestors', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  for (const sel of ['body', '.app-header']) {
    const re = new RegExp(`:root\\[data-mobile\\]\\s*${sel.replace('.', '\\.')}\\s*\\{([^}]*)\\}`);
    const m = re.exec(html);
    assert.ok(m, `[data-mobile] ${sel} rule present`);
    for (const decl of [
      '-webkit-backdrop-filter:none!important',
      'backdrop-filter:none!important',
      'filter:none!important',
      'transform:none!important',
      'perspective:none!important',
      'animation:none!important',
    ]) {
      assert.ok(m![1]!.includes(decl), `${sel} must set ${decl}`);
    }
  }
});

function baselineRule(html: string, sel: string): string {
  const re = new RegExp(`:root\\[data-mobile\\]\\s*${sel.replace(/[.#]/g, '\\$&')}\\s*\\{([^}]*)\\}`);
  const m = re.exec(html);
  assert.ok(m, `[data-mobile] ${sel} rule present`);
  return m![1]!;
}

// The [data-mobile] baseline tints the dock/sheets with theme tokens; a theme
// that skips them gets the generic beige fallbacks — a beige dock pinned to a
// neon-black page. Every bundled theme must define the full HUD token set
// (theme.md §5 "HUD tokens").
test('every theme defines the HUD tint tokens', () => {
  const dir = join(root, 'themes');
  const missing: string[] = [];
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.css'))) {
    const css = readFileSync(join(dir, f), 'utf8');
    for (const tok of ['--paper', '--paper-2', '--ink', '--accent', '--cobalt', '--r']) {
      if (!new RegExp(`${tok}\\s*:`).test(css)) missing.push(`${f}: ${tok}`);
    }
  }
  assert.deepEqual(missing, [], 'define the missing tokens in the theme token block');
});

// Themes give .app-header/.wrap/.foot a desktop page column
// (width:min(1100px,…) + margin-inline:auto). The baseline forces margins with
// !important, which kills the auto-centering but not the width — leaving a
// narrow column pinned to the left edge (os95, aurora-noir). Mobile must
// neutralize the width wherever it overrides the margin.
test('mobile baseline neutralizes theme page-column widths', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  for (const sel of ['.app-header', '.wrap', '.foot']) {
    assert.ok(
      baselineRule(html, sel).includes('width:auto!important'),
      `${sel} must set width:auto!important`,
    );
  }
  assert.ok(
    baselineRule(html, '.app-header').includes('margin:0!important'),
    '.app-header must set margin:0!important',
  );
});

// The baseline resizes the day-nav to a 36px square and lets the dock buttons
// keep each theme's .btn skin — but theme line-heights/paddings tuned for
// desktop sizes leak in and push the glyph off-center (os95). The baseline
// must own the centering of the controls it resizes. The brand phase label
// needs min-width:0 or it refuses to shrink and wraps the header to two rows.
test('mobile baseline centers resized controls and lets the brand shrink', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const dayNav = baselineRule(html, '.day-nav');
  for (const decl of [
    'display:inline-flex!important',
    'align-items:center!important',
    'justify-content:center!important',
    'line-height:1!important',
    'padding:0!important',
  ]) {
    assert.ok(dayNav.includes(decl), `.day-nav must set ${decl}`);
  }
  assert.ok(
    baselineRule(html, '.brand-sub').includes('min-width:0!important'),
    '.brand-sub must set min-width:0!important',
  );
  // bonus wraps .brand on desktop; one-line HUD header needs nowrap forced
  assert.ok(
    baselineRule(html, '.brand').includes('flex-wrap:nowrap!important'),
    '.brand must set flex-wrap:nowrap!important',
  );
});

// Mobile motion-perf: the body/.app-header *element* kills don't reach their
// pseudos or children, where the heavy idle loops live. The baseline must
// (1) freeze the full-viewport background loops on those pseudos + .bar>i
// (background-position scroll is a whole-screen repaint a phone GPU can't
// sustain), and (2) drop the static drop-shadow/blur on the always-animating
// decorative glyphs so their transform loops stay pure-compositor on a phone.
// Removing either rule silently brings the jank back, so pin them here.
test('mobile baseline freezes background loops + de-filters animated glyphs', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const freeze = /:root\[data-mobile\]\s*body::before[^{]*\{([^}]*)\}/.exec(html);
  assert.ok(freeze, 'body/header-pseudo freeze rule present');
  assert.ok(freeze![1]!.includes('animation:none!important'), 'pseudo loops must be frozen');
  for (const sel of ['body::after', '.app-header::before', '.app-header::after', '.bar>i']) {
    assert.ok(
      html.includes(`:root[data-mobile] ${sel}`),
      `freeze rule must cover ${sel}`,
    );
  }
  const defilter = /:root\[data-mobile\]\s*\.flame[^{]*\{([^}]*)\}/.exec(html);
  assert.ok(defilter, '.flame de-filter rule present');
  assert.ok(defilter![1]!.includes('filter:none!important'), 'animated glyphs must drop static filter');
  for (const sel of ['.ring', '.ring::before', '.badge .bi', '.wrap::before', '.wrap::after']) {
    assert.ok(
      html.includes(`:root[data-mobile] ${sel}`),
      `de-filter rule must cover ${sel}`,
    );
  }
});

// Toasts are fixed at bottom:24px by themes — under [data-mobile] that is
// behind/over the dock (z-index 70). The baseline must lift them clear.
test('mobile baseline lifts toasts above the dock', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const m = /:root\[data-mobile\]\s*\.toast\s*,\s*:root\[data-mobile\]\s*\.badge-toast\s*\{([^}]*)\}/.exec(
    html,
  );
  assert.ok(m, '[data-mobile] .toast/.badge-toast rule present');
  assert.ok(m![1]!.includes('bottom:calc('), 'toasts must sit above the dock height');
});

test('baseline neutralizes animations during the theme cross-fade', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.ok(
    /:root\.theme-switching\s*\*[^{]*\{[^}]*animation:\s*none\s*!important/.test(html),
    'the cross-fade must kill animations so coexisting sheets cannot bleed keyframes',
  );
});
