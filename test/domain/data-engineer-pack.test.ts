import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PackValidator } from '../../src/domain/validators.ts';

test('data-engineer pack is valid, structurally sound, and fully bilingual', async () => {
  let captured: unknown;
  (globalThis as { SUNRISE?: unknown }).SUNRISE = {
    registerPack: (p: unknown) => {
      captured = p;
    },
    registerTheme: () => {},
  };
  const packPath = '../../data/packs/data-engineer.js';
  await import(packPath);
  const pack = new PackValidator().parse(captured); // throws if invalid

  // Shape: 5 weeks, each 6 non-rest items + 1 rest, deliberate track weighting.
  assert.equal(pack.groups.length, 5, '5 week-groups');
  for (const g of pack.groups)
    assert.equal(g.items.length, 7, `group "${g.id}" has 6 items + 1 rest`);

  const items = pack.groups.flatMap((g) => g.items);
  const nonRest = items.filter((i) => !i.rest);
  const rest = items.filter((i) => i.rest);
  assert.equal(nonRest.length, 30, '30 non-rest days');
  assert.equal(rest.length, 5, '5 rest days');
  assert.equal(new Set(items.map((i) => i.id)).size, items.length, 'item ids are unique');

  const totals: Record<string, number> = {};
  for (const i of nonRest) totals[i.track] = (totals[i.track] ?? 0) + 1;
  assert.deepEqual(
    totals,
    { python: 5, modeling: 5, warehouse: 5, pipelines: 8, quality: 7 },
    'track weighting matches the design (pipelines + quality carry the most)',
  );

  for (const i of nonRest)
    assert.ok((i.tasks ?? []).length >= 2, `non-rest item "${i.id}" has >= 2 tasks`);

  // Phase assignment: weeks 1-2 -> Foundations, weeks 3-5 -> Production.
  assert.deepEqual(
    pack.groups.map((g) => g.phase),
    ['1', '1', '2', '2', '2'],
    'phase assignment per design',
  );

  // Pack-specific badges all present and their references resolve (parse() already
  // checks references; this pins the intended set).
  const badgeIds = (pack.badges ?? []).map((b) => b.id).sort();
  assert.deepEqual(
    badgeIds,
    ['de-foundations', 'de-plumber', 'de-pythonista', 'de-shipped', 'de-warehouse'],
    'the 5 pack badges',
  );
  assert.ok(
    items.some((i) => i.id === 'w5d6'),
    'capstone item w5d6 exists (de-shipped target)',
  );

  // Bilingual coverage: every translated field is a {en,ru} map and the en side
  // carries no leftover Cyrillic.
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
