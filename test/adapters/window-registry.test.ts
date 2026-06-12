import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WindowPluginRegistry } from '../../src/adapters/window-registry.ts';
import type { Pack, Theme } from '../../src/domain/types/entities.ts';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const VALID_PACK: Pack = {
  schema: 'sunrise.pack/v1',
  id: 'test-pack',
  name: 'Test Pack',
  version: '1.0.0',
  tracks: [{ id: 'dsa', label: 'DSA' }],
  groups: [
    {
      id: 'g1',
      title: 'Week 1',
      items: [{ id: 'i1', track: 'dsa', tasks: [{ id: 't1', text: 'Do it' }] }],
    },
  ],
};

const VALID_THEME: Theme = {
  schema: 'sunrise.theme/v1',
  id: 'neon',
  name: 'Neon',
  version: '1.0.0',
  cssHref: 'themes/neon.css',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test('valid pack registers and appears in packs()', () => {
  const r = new WindowPluginRegistry();
  r.registerPack(VALID_PACK);
  assert.equal(r.packs().length, 1);
  assert.equal(r.packs()[0]?.id, 'test-pack');
  assert.equal(r.rejected().length, 0);
});

test('valid theme registers and appears in themes()', () => {
  const r = new WindowPluginRegistry();
  r.registerTheme(VALID_THEME);
  assert.equal(r.themes().length, 1);
  assert.equal(r.themes()[0]?.id, 'neon');
  assert.equal(r.rejected().length, 0);
});

test('invalid pack (wrong schema) is rejected and NOT in packs()', () => {
  const r = new WindowPluginRegistry();
  const bad = { ...VALID_PACK, schema: 'sunrise.pack/v9' };
  r.registerPack(bad);
  assert.equal(r.packs().length, 0);
  assert.equal(r.rejected().length, 1);
  assert.equal(r.rejected()[0]?.kind, 'pack');
  assert.equal(r.rejected()[0]?.id, 'test-pack');
  assert.ok(r.rejected()[0]!.issues.length > 0);
});

test('invalid pack (empty tracks) is rejected and recorded in rejected()', () => {
  const r = new WindowPluginRegistry();
  const bad = { ...VALID_PACK, tracks: [] };
  r.registerPack(bad);
  assert.equal(r.packs().length, 0);
  assert.equal(r.rejected().length, 1);
  assert.equal(r.rejected()[0]?.kind, 'pack');
});

test('pack with undeclared track ref is rejected with issues', () => {
  const r = new WindowPluginRegistry();
  const bad = {
    ...VALID_PACK,
    groups: [
      {
        id: 'g1',
        title: 'Week 1',
        items: [{ id: 'i1', track: 'nonexistent', tasks: [{ id: 't1', text: 'Do it' }] }],
      },
    ],
  };
  r.registerPack(bad);
  assert.equal(r.packs().length, 0);
  const rej = r.rejected()[0]!;
  assert.equal(rej.kind, 'pack');
  assert.ok(rej.issues.some((i) => i.path.includes('track')));
});

test('invalid theme is rejected and NOT in themes()', () => {
  const r = new WindowPluginRegistry();
  const bad = { ...VALID_THEME, schema: 'sunrise.theme/v2' };
  r.registerTheme(bad);
  assert.equal(r.themes().length, 0);
  assert.equal(r.rejected().length, 1);
  assert.equal(r.rejected()[0]?.kind, 'theme');
  assert.equal(r.rejected()[0]?.id, 'neon');
});

test('rejected() with no id falls back to "(no id)"', () => {
  const r = new WindowPluginRegistry();
  r.registerPack({ schema: 'wrong', tracks: [] }); // no id field
  assert.equal(r.rejected()[0]?.id, '(no id)');
});

test('addBuiltinThemes adds without validation and does not touch rejected()', () => {
  const r = new WindowPluginRegistry();
  const themes: Theme[] = [
    VALID_THEME,
    {
      schema: 'sunrise.theme/v1',
      id: 'bonus',
      name: 'Bonus',
      version: '1.0.0',
      cssHref: 'themes/bonus.css',
    },
  ];
  r.addBuiltinThemes(themes);
  assert.equal(r.themes().length, 2);
  assert.equal(r.rejected().length, 0);
});

test('multiple valid packs and themes register independently', () => {
  const r = new WindowPluginRegistry();
  const pack2: Pack = { ...VALID_PACK, id: 'pack2', name: 'Pack 2' };
  r.registerPack(VALID_PACK);
  r.registerPack(pack2);
  r.registerTheme(VALID_THEME);
  assert.equal(r.packs().length, 2);
  assert.equal(r.themes().length, 1);
  assert.equal(r.rejected().length, 0);
});

test('duplicate pack id keeps the first pack and records a rejection', () => {
  const r = new WindowPluginRegistry();
  r.registerPack(VALID_PACK);
  r.registerPack({ ...VALID_PACK, name: 'Imposter' });
  assert.equal(r.packs().length, 1);
  assert.equal(r.packs()[0]?.name, 'Test Pack');
  const rej = r.rejected()[0]!;
  assert.equal(rej.kind, 'pack');
  assert.equal(rej.id, 'test-pack');
  assert.ok(rej.issues.some((i) => i.path === 'id' && i.msg.includes('duplicate')));
});

test('duplicate theme id keeps the first theme and records a rejection', () => {
  const r = new WindowPluginRegistry();
  r.registerTheme(VALID_THEME);
  r.registerTheme({ ...VALID_THEME, name: 'Imposter' });
  assert.equal(r.themes().length, 1);
  assert.equal(r.themes()[0]?.name, 'Neon');
  const rej = r.rejected()[0]!;
  assert.equal(rej.kind, 'theme');
  assert.equal(rej.id, 'neon');
  assert.ok(rej.issues.some((i) => i.path === 'id' && i.msg.includes('duplicate')));
});

test('registerTheme rejects an id colliding with a builtin theme', () => {
  const r = new WindowPluginRegistry();
  r.addBuiltinThemes([VALID_THEME]);
  r.registerTheme({ ...VALID_THEME, name: 'Imposter' });
  assert.equal(r.themes().length, 1);
  assert.equal(r.themes()[0]?.name, 'Neon');
  const rej = r.rejected()[0]!;
  assert.equal(rej.kind, 'theme');
  assert.ok(rej.issues.some((i) => i.msg.includes('duplicate')));
});

test('packs() and themes() return read-only snapshot (arrays)', () => {
  const r = new WindowPluginRegistry();
  r.registerPack(VALID_PACK);
  const packs = r.packs();
  assert.equal(Array.isArray(packs), true);
  assert.equal(packs.length, 1);
});

test('packs() returns a snapshot that does not mutate when more packs register later', () => {
  const reg = new WindowPluginRegistry();
  reg.registerPack(VALID_PACK);
  const snapshot = reg.packs();
  assert.equal(snapshot.length, 1);
  reg.registerPack({ ...VALID_PACK, id: 'p2' });
  assert.equal(snapshot.length, 1); // snapshot unchanged
  assert.equal(reg.packs().length, 2); // fresh call reflects the new pack
});
