import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Importer } from '../../../src/domain/plugins/importer.ts';
import type { ImportHandler, ImportOutcome } from '../../../src/domain/plugins/import-handler.ts';

function fakeStore(initial: unknown[] = []) {
  const list = [...initial];
  return { list, load: () => [...list], append: (r: unknown) => void list.push(r) };
}
function handler(
  kind: 'pack' | 'theme' | 'progress',
  schema: string,
  persistable: boolean,
  log: string[],
): ImportHandler {
  return {
    persistable,
    matches: (raw) => (raw as { schema?: string })?.schema === schema,
    validate: (raw) => raw,
    install: (raw): ImportOutcome => {
      log.push(`install:${kind}`);
      return { kind, id: (raw as { id: string }).id };
    },
  };
}

test('routes by schema, persists only persistable kinds', () => {
  const log: string[] = [];
  const store = fakeStore();
  const imp = new Importer(
    [
      handler('pack', 'sunrise.pack/v1', true, log),
      handler('progress', 'sunrise.progress/v1', false, log),
    ],
    store,
  );
  assert.deepEqual(imp.import('{"schema":"sunrise.pack/v1","id":"p"}'), { kind: 'pack', id: 'p' });
  assert.equal(store.list.length, 1); // pack persisted
  imp.import('{"schema":"sunrise.progress/v1","id":"x"}');
  assert.equal(store.list.length, 1); // progress NOT persisted
  assert.deepEqual(log, ['install:pack', 'install:progress']);
});

test('unknown file throws ImportError', () => {
  const imp = new Importer([handler('pack', 'sunrise.pack/v1', true, [])], fakeStore());
  assert.throws(() => imp.import('{"schema":"nope"}'), /Unrecognized|not a Sunrise/i);
});

test('invalid JSON throws ImportError', () => {
  const imp = new Importer([], fakeStore());
  assert.throws(() => imp.import('{bad'), /JSON/i);
});

test('a failing install does NOT persist', () => {
  const throwing: ImportHandler = {
    persistable: true,
    matches: (raw) => (raw as { schema?: string })?.schema === 'sunrise.pack/v1',
    validate: (raw) => raw,
    install: () => {
      throw new Error('dup');
    },
  };
  const store = fakeStore();
  const imp = new Importer([throwing], store);
  assert.throws(() => imp.import('{"schema":"sunrise.pack/v1","id":"p"}'));
  assert.equal(store.list.length, 0);
});

test('loadStored replays persistable raws and swallows install errors', () => {
  const log: string[] = [];
  const good = handler('theme', 'sunrise.theme/v1', true, log);
  let first = true;
  const flaky: ImportHandler = {
    ...good,
    install: (raw) => {
      if (first) {
        first = false;
        throw new Error('dup');
      }
      return good.install(raw);
    },
  };
  const store = fakeStore([
    { schema: 'sunrise.theme/v1', id: 'a' },
    { schema: 'sunrise.theme/v1', id: 'b' },
  ]);
  const imp = new Importer([flaky], store);
  assert.doesNotThrow(() => imp.loadStored());
  assert.deepEqual(log, ['install:theme']); // second one installed; first swallowed
});

test('loadStored skips non-persistable handlers', () => {
  const log: string[] = [];
  const store = fakeStore([{ schema: 'sunrise.progress/v1', id: 'x' }]);
  const imp = new Importer([handler('progress', 'sunrise.progress/v1', false, log)], store);
  imp.loadStored();
  assert.deepEqual(log, []); // progress is not a catalog plugin, not replayed
});
