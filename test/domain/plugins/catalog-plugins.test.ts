import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PackPlugin } from '../../../src/domain/plugins/pack-plugin.ts';
import { ThemePlugin } from '../../../src/domain/plugins/theme-plugin.ts';
import { WindowPluginRegistry } from '../../../src/adapters/window-registry.ts';

(globalThis as { URL: { createObjectURL?: (b: unknown) => string } }).URL.createObjectURL ??=
  (() => {
    let n = 0;
    return () => `blob:test/${n++}`;
  })();

const PACK = {
  schema: 'sunrise.pack/v1',
  id: 'p',
  name: 'P',
  version: '1',
  tracks: [{ id: 't', label: 'T' }],
  groups: [
    { id: 'g', title: 'G', items: [{ id: 'i', track: 't', tasks: [{ id: 'a', text: 'x' }] }] },
  ],
};
const THEME = { schema: 'sunrise.theme/v1', id: 'x', name: 'X', version: '1', css: ':root{}' };

test('PackPlugin matches pack schema only, installs, persistable', () => {
  const reg = new WindowPluginRegistry();
  const h = new PackPlugin(reg);
  assert.ok(h.matches(PACK));
  assert.ok(!h.matches(THEME));
  assert.equal(h.persistable, true);
  const out = h.install(h.validate(PACK));
  assert.deepEqual(out, { kind: 'pack', id: 'p' });
  assert.ok(reg.hasPack('p'));
});

test('PackPlugin.install throws on a duplicate (delegated to registry)', () => {
  const reg = new WindowPluginRegistry();
  const h = new PackPlugin(reg);
  h.install(h.validate(PACK));
  assert.throws(() => h.install(h.validate(PACK)), /already exists/i);
});

test('ThemePlugin matches theme schema, installs', () => {
  const reg = new WindowPluginRegistry();
  const h = new ThemePlugin(reg);
  assert.ok(h.matches(THEME));
  assert.ok(!h.matches(PACK));
  assert.equal(h.persistable, true);
  const out = h.install(h.validate(THEME));
  assert.deepEqual(out, { kind: 'theme', id: 'x' });
  assert.ok(reg.hasTheme('x'));
});
