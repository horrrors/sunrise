import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ProgressPlugin } from '../../../src/domain/plugins/progress-plugin.ts';
import type { ProgressData } from '../../../src/domain/types/progress.ts';

function fakeTarget() {
  const calls: { packId: string | null; itemCount: number }[] = [];
  return {
    calls,
    importProgress(packId: string | null, data: ProgressData): string {
      calls.push({ packId, itemCount: Object.keys(data.items).length });
      return packId ?? 'active';
    },
  };
}

test('matches progress schema and legacy (items/days, no schema)', () => {
  const h = new ProgressPlugin(fakeTarget());
  assert.ok(h.matches({ schema: 'sunrise.progress/v1', items: {} }));
  assert.ok(h.matches({ items: {} })); // legacy v1 export shape (no schema)
  assert.ok(h.matches({ days: {} })); // legacy v2
  assert.ok(!h.matches({ schema: 'sunrise.pack/v1' }));
  assert.ok(!h.matches({ schema: 'sunrise.theme/v1' }));
  assert.equal(h.persistable, false);
});

test('validate extracts packId + parses; install delegates to target', () => {
  const target = fakeTarget();
  const h = new ProgressPlugin(target);
  const raw = {
    packId: 'p',
    schema: 'sunrise.progress/v1',
    items: { i: { tasks: { a: true } } },
    badges: {},
  };
  const out = h.install(h.validate(raw));
  assert.equal(out.kind, 'progress');
  assert.equal(out.id, 'p');
  assert.equal(target.calls[0]!.packId, 'p');
  assert.equal(target.calls[0]!.itemCount, 1);
});

test('validate yields null packId for a legacy export without packId', () => {
  const target = fakeTarget();
  const h = new ProgressPlugin(target);
  h.install(h.validate({ schema: 'sunrise.progress/v1', items: {}, badges: {} }));
  assert.equal(target.calls[0]!.packId, null);
});

test('validate throws on a wrong progress schema version', () => {
  const h = new ProgressPlugin(fakeTarget());
  assert.throws(() => h.validate({ schema: 'sunrise.progress/v99', items: {} }), /version/);
});
