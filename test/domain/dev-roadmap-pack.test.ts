import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PackValidator } from '../../src/domain/validators.ts';
import { GENERIC_BADGES } from '../../src/domain/builtins.ts';

test('dev-roadmap pack is valid and complete', async () => {
  let captured: unknown;
  (globalThis as { SUNRISE?: unknown }).SUNRISE = { registerPack: (p: unknown) => { captured = p; }, registerTheme: () => {} };
  // Untyped runtime pack (classic-IIFE .js); a string specifier sidesteps the
  // implicit-any on importing a .js module that has no declaration.
  const packPath = '../../data/packs/dev-roadmap.js';
  await import(packPath);
  const pack = new PackValidator().parse(captured); // throws if invalid
  assert.equal(pack.groups.length, 13);
  assert.equal(pack.groups.flatMap((g) => g.items).length, 91);
  const ids = new Set([...GENERIC_BADGES, ...(pack.badges ?? [])].map((b) => b.id));
  assert.equal(ids.size, 30);
  assert.ok(pack.groups.flatMap((g) => g.items).some((i) => (i.tasks ?? []).some((t) => t.guidance)));
});
