import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PackValidator } from '../../src/domain/validators.ts';

test('dev-roadmap pack is valid, structurally sound, and fully bilingual', async () => {
  let captured: unknown;
  (globalThis as { SUNRISE?: unknown }).SUNRISE = {
    registerPack: (p: unknown) => {
      captured = p;
    },
    registerTheme: () => {},
  };
  // Untyped runtime pack (classic-IIFE .js); a string specifier sidesteps the
  // implicit-any on importing a .js module that has no declaration. The IIFE runs
  // once per process (ESM cache), so capture + assert all in this single test.
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

  // Bilingual coverage: every translated field is a {en,ru} map and the en side
  // carries no leftover Russian. Guards against a future string shipping ru-only.
  const CYR = /[А-Яа-яЁё]/;
  const ok = (v: unknown, path: string): void => {
    assert.ok(
      typeof v === 'object' && v !== null && 'en' in v && 'ru' in v,
      `${path} must be {en,ru}, got ${JSON.stringify(v)}`,
    );
    const en = (v as { en: unknown }).en;
    assert.ok(typeof en === 'string' && !CYR.test(en), `${path}.en still Russian: ${String(en)}`);
  };
  const opt = (v: unknown, path: string): void => {
    if (v !== undefined) ok(v, path);
  };

  ok(pack.name, 'name');
  const labels = pack.settings?.labels ?? {};
  for (const k of Object.keys(labels)) ok((labels as Record<string, unknown>)[k], `labels.${k}`);
  pack.tracks.forEach((t, i) => ok(t.label, `tracks[${i}].label`));
  (pack.phases ?? []).forEach((p, i) => ok(p.title, `phases[${i}].title`));
  pack.groups.forEach((g, gi) => {
    ok(g.title, `groups[${gi}].title`);
    g.items.forEach((it, ii) => {
      const b = `groups[${gi}].items[${ii}]`;
      opt(it.title, `${b}.title`);
      opt(it.warmup, `${b}.warmup`);
      opt(it.reflectPrompt, `${b}.reflectPrompt`);
      (it.tasks ?? []).forEach((t, ti) => {
        ok(t.text, `${b}.tasks[${ti}].text`);
        opt(t.guidance, `${b}.tasks[${ti}].guidance`);
      });
      (it.resources ?? []).forEach((r, ri) => {
        ok(r.label, `${b}.resources[${ri}].label`);
        ok(r.note, `${b}.resources[${ri}].note`);
      });
    });
  });
  (pack.badges ?? []).forEach((bd, bi) => {
    ok(bd.title, `badges[${bi}].title`);
    opt(bd.desc, `badges[${bi}].desc`);
  });
  (pack.mottos ?? []).forEach((m, mi) => ok(m, `mottos[${mi}]`));
  (pack.surprises ?? []).forEach((s, si) => ok(s, `surprises[${si}]`));
});
