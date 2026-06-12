import { test } from 'node:test';
import assert from 'node:assert/strict';
import { watchMobileMode, MOBILE_BREAKPOINT_PX } from '../../src/adapters/mobile-mode.ts';

function fakes(initialMatches: boolean) {
  let listener: ((e: { matches: boolean }) => void) | null = null;
  let query = '';
  const matchMedia = (q: string) => {
    query = q;
    return {
      matches: initialMatches,
      addEventListener: (_t: 'change', cb: (e: { matches: boolean }) => void): void => {
        listener = cb;
      },
    };
  };
  const attrs: Record<string, string> = {};
  const root = {
    setAttribute: (n: string, v: string): void => {
      attrs[n] = v;
    },
    removeAttribute: (n: string): void => {
      delete attrs[n];
    },
  };
  return { matchMedia, root, attrs, fire: (m: boolean) => listener!({ matches: m }), q: () => query };
}

test('narrow at boot sets data-mobile; query embeds the breakpoint', () => {
  const f = fakes(true);
  watchMobileMode(f.matchMedia, f.root);
  assert.equal(f.attrs['data-mobile'], '1');
  assert.equal(f.q(), `(max-width: ${MOBILE_BREAKPOINT_PX}px)`);
});

test('wide at boot leaves the attribute off', () => {
  const f = fakes(false);
  watchMobileMode(f.matchMedia, f.root);
  assert.equal('data-mobile' in f.attrs, false);
});

test('live change toggles the attribute both ways', () => {
  const f = fakes(false);
  watchMobileMode(f.matchMedia, f.root);
  f.fire(true);
  assert.equal(f.attrs['data-mobile'], '1');
  f.fire(false);
  assert.equal('data-mobile' in f.attrs, false);
});
