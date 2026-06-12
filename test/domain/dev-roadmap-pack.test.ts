import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PackValidator } from '../../src/domain/validators.ts';

test('dev-roadmap pack is valid and structurally sound', async () => {
  let captured: unknown;
  (globalThis as { SUNRISE?: unknown }).SUNRISE = {
    registerPack: (p: unknown) => {
      captured = p;
    },
    registerTheme: () => {},
  };
  // Untyped runtime pack (classic-IIFE .js); a string specifier sidesteps the
  // implicit-any on importing a .js module that has no declaration.
  const packPath = '../../data/packs/dev-roadmap.js';
  await import(packPath);
  const pack = new PackValidator().parse(captured); // throws if invalid

  assert.ok(pack.groups.length > 0, 'pack has at least one group');
  for (const g of pack.groups)
    assert.ok(g.items.length > 0, `group "${g.id}" has at least one item`);

  const items = pack.groups.flatMap((g) => g.items);
  assert.equal(new Set(items.map((i) => i.id)).size, items.length, 'item ids are unique');
  for (const i of items) {
    if (!i.rest)
      assert.ok((i.tasks ?? []).length > 0, `non-rest item "${i.id}" has at least one task`);
  }

  const badgeIds = (pack.badges ?? []).map((b) => b.id);
  assert.equal(new Set(badgeIds).size, badgeIds.length, 'badge ids are unique');
});
