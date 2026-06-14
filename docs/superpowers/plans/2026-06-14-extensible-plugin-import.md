# Extensible Plugin Import — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the 📥 button classify a dropped JSON file by its `schema` and route it through an open/closed `ImportHandler` pipeline (pack / theme / progress); persist imported packs/themes so they load from storage at boot; and decompose the `Tracker` god-object along a command/query seam.

**Architecture:** Onion preserved (`domain → ports ← adapters`; `main.ts` is the only composition root). New `src/domain/plugins/` module holds the import pipeline. `Tracker` keeps commands; new `Projections` holds queries. Spec: `docs/superpowers/specs/2026-06-14-extensible-plugin-import-design.md`.

**Tech Stack:** TypeScript (strict, `NodeNext`, `.ts` extensions on relative imports, `erasableSyntaxOnly`), esbuild → committed `dist/sunrise.js`, `node --test` on `.ts` (type-stripping, zero test deps), Node 23.11.0.

**Verification commands:**
- `npm run typecheck` — `tsc --noEmit`
- `npm test` — full suite (some build/pwa tests require `npm run build` first)
- `node --test test/path/file.test.ts` — single file
- `npm run build` — regenerate `dist/sunrise.js` + `.map` + `sw.js` (run before full `npm test`)
- `npm run lint` — domain-purity lint (no `window`/`document`/`localStorage`/`Date`/`Math.random` in `src/domain/**`)

**Conventions that will bite you:**
- Relative imports MUST carry the `.ts` extension.
- `src/domain/**` may not touch `window`/`localStorage`/`URL` — those are adapter-only. The blob-URL materialization lives in `WindowPluginRegistry` (adapter).
- Domain text fields are `Localized` (`string | {lang→string}`), resolved via `tr(v, lang)`.
- Run `npm run build` and commit `dist/sunrise.js` + `.map` + `sw.js` in the SAME commit as `src/` edits whenever `src/` changes.

---

## Phase 1 — Extensible plugin import (additive; ships the whole user-facing feature)

### Task 1: Add `PluginStore` + write-`PluginRegistry` ports

**Files:**
- Modify: `src/ports/index.ts`

- [ ] **Step 1:** Append to `src/ports/index.ts` (after `ThemeSource`):

```ts
// User-imported plugins persisted as raw, self-describing-by-`schema` JSON objects.
// A flat list so a new plugin kind needs no storage-format change.
export interface PluginStore {
  load(): unknown[];
  append(raw: unknown): void;
}

// Write side of the plugin registry, used by the import pipeline (the read side
// is PackSource/ThemeSource). add* throw on invalid/duplicate so import surfaces errors.
export interface PluginRegistry {
  addPack(raw: unknown): void;
  addTheme(raw: unknown): void;
  hasPack(id: string): boolean;
  hasTheme(id: string): boolean;
}
```

- [ ] **Step 2:** `npm run typecheck` → PASS (interfaces only). Commit: `feat(ports): PluginStore + write PluginRegistry interfaces`.

---

### Task 2: Theme `css` field + `ThemeValidator` accepts `css` OR `cssHref`

**Files:**
- Modify: `src/domain/types/entities.ts:67-73` (Theme), `src/domain/validators.ts` (THEME_SCHEMA + ThemeValidator)
- Test: `test/domain/validators.test.ts`

- [ ] **Step 1 (failing test):** add to `test/domain/validators.test.ts`:

```ts
test('ThemeValidator accepts inline css instead of cssHref', () => {
  const t = new ThemeValidator().parse({
    schema: 'sunrise.theme/v1', id: 'x', name: 'X', version: '1.0.0',
    css: ':root[data-theme="x"]{--ink:#000}',
  });
  assert.equal((t as { css?: string }).css?.length ? true : false, true);
});
test('ThemeValidator rejects a theme with neither css nor cssHref', () => {
  assert.throws(
    () => new ThemeValidator().parse({ schema: 'sunrise.theme/v1', id: 'x', name: 'X', version: '1.0.0' }),
    /css|cssHref/,
  );
});
```

- [ ] **Step 2:** Run `node --test test/domain/validators.test.ts` → FAIL.
- [ ] **Step 3 (entities):** in `src/domain/types/entities.ts`, change the `Theme` interface to make `cssHref` optional and add `css`:

```ts
export interface Theme {
  readonly schema: 'sunrise.theme/v1';
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly cssHref?: string; // built-in/script-tag themes ship a file path
  readonly css?: string;     // imported themes ship inline CSS (materialized to a blob URL)
}
```

- [ ] **Step 4 (validator):** in `src/domain/validators.ts`, change `THEME_SCHEMA` so `cssHref` is optional and add optional `css`:

```ts
const THEME_SCHEMA: Schema = {
  type: 'object',
  required: true,
  props: {
    schema: { type: 'string', required: true },
    id: ID,
    name: { type: 'string', required: true },
    version: { type: 'string', required: true },
    cssHref: { type: 'string' },
    css: { type: 'string' },
  },
};
```

Then in `ThemeValidator.parse`, after the schema-version check and before `return`, add the one-of rule:

```ts
const t = raw as Record<string, unknown>;
if (typeof t['cssHref'] !== 'string' && typeof t['css'] !== 'string') {
  throw new ValidationError([{ path: 'css', msg: 'theme needs either "cssHref" or inline "css"' }]);
}
```

- [ ] **Step 5:** Run `node --test test/domain/validators.test.ts` → PASS. `npm run typecheck` → PASS.
- [ ] **Step 6:** Commit: `feat(themes): ThemeValidator accepts inline css (css-or-cssHref)`.

---

### Task 3: `LocalStoragePluginStore` adapter

**Files:**
- Modify: `src/adapters/local-storage-store.ts` (add class; key `sunrise.plugins`)
- Test: `test/adapters/local-storage-store.test.ts`

- [ ] **Step 1 (failing test):** add to `test/adapters/local-storage-store.test.ts` (uses the file's existing Map-backed fake `localStorage` harness — match how the existing tests construct it):

```ts
test('LocalStoragePluginStore round-trips appended raws', () => {
  const store = new LocalStoragePluginStore();
  assert.deepEqual(store.load(), []);
  store.append({ schema: 'sunrise.theme/v1', id: 'x' });
  store.append({ schema: 'sunrise.pack/v1', id: 'p' });
  assert.equal(store.load().length, 2);
  assert.equal((store.load()[0] as { id: string }).id, 'x');
});
test('LocalStoragePluginStore.load tolerates a corrupt blob', () => {
  localStorage.setItem('sunrise.plugins', '{not json');
  assert.deepEqual(new LocalStoragePluginStore().load(), []);
});
```

Add `LocalStoragePluginStore` to the import line at the top of the test from `../../src/adapters/local-storage-store.ts`.

- [ ] **Step 2:** Run `node --test test/adapters/local-storage-store.test.ts` → FAIL.
- [ ] **Step 3:** in `src/adapters/local-storage-store.ts` add the `PluginStore` import and class:

```ts
// add PluginStore to the existing port import
import type { ProgressStore, SessionStore, PluginStore } from '../ports/index.ts';

const PLUGINS = 'sunrise.plugins';

export class LocalStoragePluginStore implements PluginStore {
  public load(): unknown[] {
    try {
      const raw = localStorage.getItem(PLUGINS);
      const o: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(o) ? o : [];
    } catch {
      return [];
    }
  }
  public append(raw: unknown): void {
    try {
      const list = this.load();
      list.push(raw);
      localStorage.setItem(PLUGINS, JSON.stringify(list));
    } catch {
      /* quota */
    }
  }
}
```

- [ ] **Step 4:** Run the test → PASS. `npm run typecheck` → PASS. Commit: `feat(storage): LocalStoragePluginStore (sunrise.plugins)`.

---

### Task 4: `WindowPluginRegistry` implements write-`PluginRegistry` (throwing add + has + css→blob)

**Files:**
- Modify: `src/adapters/window-registry.ts`
- Test: `test/adapters/window-registry.test.ts`

- [ ] **Step 1 (failing test):** add to `test/adapters/window-registry.test.ts`:

```ts
test('addPack throws on duplicate id', () => {
  const r = new WindowPluginRegistry();
  const pack = { schema: 'sunrise.pack/v1', id: 'p', name: 'P', version: '1', tracks: [{ id: 't', label: 'T' }], groups: [{ id: 'g', title: 'G', items: [{ id: 'i', track: 't', tasks: [{ id: 'a', text: 'x' }] }] }] };
  r.addPack(pack);
  assert.ok(r.hasPack('p'));
  assert.throws(() => r.addPack(pack), /duplicate|exists/i);
});
test('addTheme materializes inline css to a cssHref', () => {
  const r = new WindowPluginRegistry();
  r.addTheme({ schema: 'sunrise.theme/v1', id: 'x', name: 'X', version: '1', css: ':root{}' });
  const t = r.themes().find((t) => t.id === 'x')!;
  assert.equal(typeof t.cssHref, 'string');
  assert.ok(t.cssHref!.length > 0);
});
test('addTheme throws on invalid theme', () => {
  const r = new WindowPluginRegistry();
  assert.throws(() => r.addTheme({ schema: 'sunrise.theme/v1', id: 'x', name: 'X', version: '1' }), /css|cssHref/);
});
```

Provide a `URL.createObjectURL` shim at the top of the test if the test env lacks it:

```ts
(globalThis as { URL: { createObjectURL?: (b: unknown) => string } }).URL.createObjectURL ??=
  (() => { let n = 0; return () => `blob:test/${n++}`; })();
```

- [ ] **Step 2:** Run `node --test test/adapters/window-registry.test.ts` → FAIL.
- [ ] **Step 3:** in `src/adapters/window-registry.ts`:
  - add `PluginRegistry` to the port import and `implements PackSource, ThemeSource, PluginRegistry`;
  - add the four methods. `addPack`/`addTheme` validate, dedup-throw (`ImportError`), and push. `addTheme` materializes inline `css` → blob URL:

```ts
import type { PackSource, ThemeSource, PluginRegistry } from '../ports/index.ts';
import { ImportError } from '../domain/errors.ts';
// ...class header: implements PackSource, ThemeSource, PluginRegistry

public hasPack(id: string): boolean { return this.packList.some((p) => p.id === id); }
public hasTheme(id: string): boolean { return this.themeList.some((t) => t.id === id); }

public addPack(raw: unknown): void {
  const pack = this.packValidator.parse(raw); // throws ValidationError on bad input
  if (this.hasPack(pack.id)) throw new ImportError(`pack "${pack.id}" already exists`);
  this.packList.push(pack);
}

public addTheme(raw: unknown): void {
  const theme = this.themeValidator.parse(raw); // throws ValidationError; enforces css-or-cssHref
  if (this.hasTheme(theme.id)) throw new ImportError(`theme "${theme.id}" already exists`);
  this.themeList.push(this.materialize(theme));
}

// Inline-css themes have no file to <link>; turn the css text into a blob URL so
// the renderer's existing href path works unchanged.
private materialize(theme: Theme): Theme {
  if (theme.cssHref || !theme.css) return theme;
  const href = URL.createObjectURL(new Blob([theme.css], { type: 'text/css' }));
  return { ...theme, cssHref: href };
}
```

(`Theme` is already imported at the top of the file.)

- [ ] **Step 4:** Run the test → PASS. `npm run typecheck` → PASS. `npm run lint` → PASS (adapter may use `URL`). Commit: `feat(registry): write PluginRegistry (throwing add, css→blob)`.

---

### Task 5: `ImportHandler` interface, `ImportOutcome`, `ProgressTarget`

**Files:**
- Create: `src/domain/plugins/import-handler.ts`

- [ ] **Step 1:** create `src/domain/plugins/import-handler.ts`:

```ts
import type { ProgressData } from '../types/progress.ts';

export interface ImportOutcome {
  kind: 'pack' | 'theme' | 'progress';
  id: string;
}

// One importable plugin kind. Implementations are simple inside; the open/closed
// seam is that adding a kind = a new ImportHandler + one line at the composition root.
export interface ImportHandler<E = unknown> {
  matches(raw: unknown): boolean;
  validate(raw: unknown): E; // throws ValidationError / ImportError
  install(entity: E): ImportOutcome;
  readonly persistable: boolean; // catalog plugins persist + replay at boot; progress doesn't
}

// What ProgressPlugin needs from Tracker (the active-pack progress aggregate).
export interface ProgressTarget {
  // Switches to packId if it names a different *loaded* pack; throws ImportError
  // if packId is given but not loaded. Replaces progress, reconciles, saves, resets cursor.
  importProgress(packId: string | null, data: ProgressData): string; // resolved packId
}

export const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
```

- [ ] **Step 2:** `npm run typecheck` → PASS. Commit: `feat(plugins): ImportHandler/ImportOutcome/ProgressTarget contracts`.

---

### Task 6: `PackPlugin` and `ThemePlugin`

**Files:**
- Create: `src/domain/plugins/pack-plugin.ts`, `src/domain/plugins/theme-plugin.ts`
- Test: `test/domain/plugins/catalog-plugins.test.ts`

- [ ] **Step 1 (failing test):** create `test/domain/plugins/catalog-plugins.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PackPlugin } from '../../../src/domain/plugins/pack-plugin.ts';
import { ThemePlugin } from '../../../src/domain/plugins/theme-plugin.ts';
import { WindowPluginRegistry } from '../../../src/adapters/window-registry.ts';

(globalThis as { URL: { createObjectURL?: (b: unknown) => string } }).URL.createObjectURL ??=
  (() => { let n = 0; return () => `blob:test/${n++}`; })();

const PACK = { schema: 'sunrise.pack/v1', id: 'p', name: 'P', version: '1', tracks: [{ id: 't', label: 'T' }], groups: [{ id: 'g', title: 'G', items: [{ id: 'i', track: 't', tasks: [{ id: 'a', text: 'x' }] }] }] };
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
test('ThemePlugin matches theme schema, installs', () => {
  const reg = new WindowPluginRegistry();
  const h = new ThemePlugin(reg);
  assert.ok(h.matches(THEME));
  assert.ok(!h.matches(PACK));
  const out = h.install(h.validate(THEME));
  assert.deepEqual(out, { kind: 'theme', id: 'x' });
  assert.ok(reg.hasTheme('x'));
});
```

- [ ] **Step 2:** Run `node --test test/domain/plugins/catalog-plugins.test.ts` → FAIL.
- [ ] **Step 3:** create `src/domain/plugins/pack-plugin.ts`:

```ts
import type { ImportHandler, ImportOutcome } from './import-handler.ts';
import { isObj } from './import-handler.ts';
import type { PluginRegistry } from '../../ports/index.ts';

export class PackPlugin implements ImportHandler<unknown> {
  public readonly persistable = true;
  constructor(private registry: PluginRegistry) {}
  public matches(raw: unknown): boolean {
    return isObj(raw) && raw['schema'] === 'sunrise.pack/v1';
  }
  public validate(raw: unknown): unknown {
    return raw; // structural validation happens in registry.addPack (PackValidator)
  }
  public install(raw: unknown): ImportOutcome {
    this.registry.addPack(raw);
    return { kind: 'pack', id: (raw as { id: string }).id };
  }
}
```

create `src/domain/plugins/theme-plugin.ts` (same shape, theme schema, `registry.addTheme`, `kind: 'theme'`):

```ts
import type { ImportHandler, ImportOutcome } from './import-handler.ts';
import { isObj } from './import-handler.ts';
import type { PluginRegistry } from '../../ports/index.ts';

export class ThemePlugin implements ImportHandler<unknown> {
  public readonly persistable = true;
  constructor(private registry: PluginRegistry) {}
  public matches(raw: unknown): boolean {
    return isObj(raw) && raw['schema'] === 'sunrise.theme/v1';
  }
  public validate(raw: unknown): unknown {
    return raw; // structural validation happens in registry.addTheme (ThemeValidator)
  }
  public install(raw: unknown): ImportOutcome {
    this.registry.addTheme(raw);
    return { kind: 'theme', id: (raw as { id: string }).id };
  }
}
```

> Note: validation is delegated to `registry.add*` (which run the existing `PackValidator`/`ThemeValidator` and throw). This keeps one validation path and avoids double-validation. The `id` read in `install` is safe because `add*` already validated `id` is a non-empty string.

- [ ] **Step 4:** Run the test → PASS. `npm run typecheck` → PASS. Commit: `feat(plugins): PackPlugin + ThemePlugin handlers`.

---

### Task 7: `Tracker.importProgress(packId, data)` + `ProgressPlugin`

**Files:**
- Modify: `src/domain/tracker.ts` (replace string `importProgress` with `importProgress(packId, data)`; `implements ProgressTarget`)
- Create: `src/domain/plugins/progress-plugin.ts`
- Test: `test/domain/tracker.test.ts` (migrate the 5 importProgress cases), `test/domain/plugins/progress-plugin.test.ts`

- [ ] **Step 1 (Tracker change):** in `src/domain/tracker.ts`:
  - import the contract: `import type { ProgressTarget } from './plugins/import-handler.ts';` and `import type { ProgressData } from './types/progress.ts';`
  - class header: `export class Tracker implements ProgressTarget {`
  - replace the existing `importProgress(json: string)` (lines ~197-218) with:

```ts
public importProgress(packId: string | null, data: ProgressData): string {
  if (packId != null && packId !== this.pack.id) {
    if (!this.deps.packs.packs().some((p) => p.id === packId)) {
      throw new ImportError(`load the pack "${packId}" before importing its progress`);
    }
    this.selectPack(packId); // switches active pack + cursor + loads its store
  }
  this.progress = new Progress(data);
  // Heal completedAt that disagrees with task checks under the current pack version.
  this.progress.reconcile(this.allItems);
  this.save();
  this.currentItemId = this.resumeItemId();
  return this.pack.id;
}
```

  - `ProgressValidator` import may now be unused in tracker.ts — remove it if so (it moves to ProgressPlugin). Keep `ImportError` and `Progress`.

- [ ] **Step 2 (migrate tracker tests):** in `test/domain/tracker.test.ts`, update the 5 `importProgress` cases to the new signature. Example replacements:

```ts
// same-pack import applies items
const data = { schema: 'sunrise.progress/v1', items: { /* ... */ }, badges: {} };
tracker.importProgress(tracker.activePackId(), data);
// or null packId = active pack
tracker.importProgress(null, data);

// cross-pack to a NOT-loaded pack rejects
assert.throws(() => tracker.importProgress('not-loaded', { schema: 'sunrise.progress/v1', items: {}, badges: {} }), /load the pack/);
```

Any test that imported via a JSON string + asserted JSON-parse errors moves to `progress-plugin.test.ts` (Step 4).

- [ ] **Step 3:** Run `node --test test/domain/tracker.test.ts` → PASS (after migration). `npm run typecheck` → PASS.
- [ ] **Step 4 (ProgressPlugin + test):** create `test/domain/plugins/progress-plugin.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ProgressPlugin } from '../../../src/domain/plugins/progress-plugin.ts';

function fakeTarget() {
  const calls: { packId: string | null; itemCount: number }[] = [];
  return {
    calls,
    importProgress(packId: string | null, data: { items: Record<string, unknown> }) {
      calls.push({ packId, itemCount: Object.keys(data.items).length });
      return packId ?? 'active';
    },
  };
}

test('matches progress schema and legacy (items/days, no schema)', () => {
  const h = new ProgressPlugin(fakeTarget());
  assert.ok(h.matches({ schema: 'sunrise.progress/v1', items: {} }));
  assert.ok(h.matches({ items: {} }));      // legacy v1 export shape
  assert.ok(h.matches({ days: {} }));        // legacy v2
  assert.ok(!h.matches({ schema: 'sunrise.pack/v1' }));
  assert.equal(h.persistable, false);
});
test('validate extracts packId + parses; install delegates to target', () => {
  const target = fakeTarget();
  const h = new ProgressPlugin(target);
  const raw = { packId: 'p', schema: 'sunrise.progress/v1', items: { i: { tasks: { a: true } } }, badges: {} };
  const out = h.install(h.validate(raw));
  assert.equal(out.kind, 'progress');
  assert.equal(target.calls[0]!.packId, 'p');
  assert.equal(target.calls[0]!.itemCount, 1);
});
```

- [ ] **Step 5:** Run → FAIL. Create `src/domain/plugins/progress-plugin.ts`:

```ts
import type { ImportHandler, ImportOutcome, ProgressTarget } from './import-handler.ts';
import { isObj } from './import-handler.ts';
import type { ProgressData } from '../types/progress.ts';
import { ProgressValidator } from '../validators.ts';

interface ProgressPayload { packId: string | null; data: ProgressData; }

export class ProgressPlugin implements ImportHandler<ProgressPayload> {
  public readonly persistable = false;
  private validator = new ProgressValidator();
  constructor(private target: ProgressTarget) {}
  public matches(raw: unknown): boolean {
    if (!isObj(raw)) return false;
    if (raw['schema'] === 'sunrise.progress/v1') return true;
    return raw['schema'] === undefined && (isObj(raw['items']) || isObj(raw['days']));
  }
  public validate(raw: unknown): ProgressPayload {
    const data = this.validator.parse(raw); // throws ValidationError
    const packId = isObj(raw) && typeof raw['packId'] === 'string' ? raw['packId'] : null;
    return { packId, data };
  }
  public install(p: ProgressPayload): ImportOutcome {
    const id = this.target.importProgress(p.packId, p.data);
    return { kind: 'progress', id };
  }
}
```

- [ ] **Step 6:** Run both test files → PASS. `npm run typecheck` → PASS. `npm run lint` → PASS. Commit: `feat(plugins): ProgressPlugin + Tracker.importProgress(packId,data)`.

---

### Task 8: `Importer` (dispatch + boot replay)

**Files:**
- Create: `src/domain/plugins/importer.ts`
- Test: `test/domain/plugins/importer.test.ts`

- [ ] **Step 1 (failing test):** create `test/domain/plugins/importer.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Importer } from '../../../src/domain/plugins/importer.ts';
import type { ImportHandler, ImportOutcome } from '../../../src/domain/plugins/import-handler.ts';

function fakeStore(initial: unknown[] = []) {
  const list = [...initial];
  return { list, load: () => [...list], append: (r: unknown) => { list.push(r); } };
}
function handler(kind: 'pack'|'theme'|'progress', schema: string, persistable: boolean, log: string[]): ImportHandler {
  return {
    persistable,
    matches: (raw) => (raw as { schema?: string })?.schema === schema,
    validate: (raw) => raw,
    install: (raw): ImportOutcome => { log.push(`install:${kind}`); return { kind, id: (raw as { id: string }).id }; },
  };
}

test('routes by schema, persists only persistable kinds', () => {
  const log: string[] = []; const store = fakeStore();
  const imp = new Importer([handler('pack', 'sunrise.pack/v1', true, log), handler('progress', 'sunrise.progress/v1', false, log)], store);
  assert.deepEqual(imp.import('{"schema":"sunrise.pack/v1","id":"p"}'), { kind: 'pack', id: 'p' });
  assert.equal(store.list.length, 1); // pack persisted
  imp.import('{"schema":"sunrise.progress/v1","id":"x"}');
  assert.equal(store.list.length, 1); // progress NOT persisted
});
test('unknown file throws ImportError', () => {
  const imp = new Importer([handler('pack', 'sunrise.pack/v1', true, [])], fakeStore());
  assert.throws(() => imp.import('{"schema":"nope"}'), /Unrecognized|not a Sunrise/i);
});
test('invalid JSON throws ImportError', () => {
  const imp = new Importer([], fakeStore());
  assert.throws(() => imp.import('{bad'), /JSON/i);
});
test('loadStored replays persistable raws, swallows install errors', () => {
  const log: string[] = [];
  const bad = handler('theme', 'sunrise.theme/v1', true, log);
  const throwing: ImportHandler = { ...bad, install: () => { throw new Error('dup'); } };
  const store = fakeStore([{ schema: 'sunrise.theme/v1', id: 'a' }, { schema: 'sunrise.theme/v1', id: 'b' }]);
  const imp = new Importer([throwing], store);
  imp.loadStored(); // must not throw
  assert.ok(true);
});
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** create `src/domain/plugins/importer.ts`:

```ts
import type { ImportHandler, ImportOutcome } from './import-handler.ts';
import type { PluginStore } from '../../ports/index.ts';
import { ImportError } from '../errors.ts';

export class Importer {
  constructor(private handlers: readonly ImportHandler[], private store: PluginStore) {}

  public import(json: string): ImportOutcome {
    let raw: unknown;
    try { raw = JSON.parse(json); } catch { throw new ImportError('Invalid JSON'); }
    const h = this.handlers.find((x) => x.matches(raw));
    if (!h) throw new ImportError('Unrecognized file — not a Sunrise pack, theme, or progress export');
    const outcome = h.install(h.validate(raw)); // throws ValidationError/ImportError on bad input
    if (h.persistable) this.store.append(raw);
    return outcome;
  }

  // Boot: replay persisted catalog plugins (NO re-persist). A stored plugin gone
  // bad (dup id, schema drift) must not crash boot — swallow + log.
  public loadStored(): void {
    for (const raw of this.store.load()) {
      const h = this.handlers.find((x) => x.matches(raw) && x.persistable);
      if (!h) continue;
      try { h.install(h.validate(raw)); }
      catch (e) { console.error('[sunrise] stored plugin rejected:', e); }
    }
  }
}
```

- [ ] **Step 4:** Run → PASS. `npm run typecheck`, `npm run lint` → PASS. Commit: `feat(plugins): Importer (schema dispatch + boot replay)`.

---

### Task 9: UI strings + compose in `main.ts`

**Files:**
- Modify: `src/domain/builtins.ts` (DEFAULT_UI), `src/main.ts`

- [ ] **Step 1 (UI strings):** in `src/domain/builtins.ts` `DEFAULT_UI`, add (both EN+RU, guarded by `builtins.test.ts`):

```ts
  importedPack: { en: 'Imported program “{name}”. 🎉', ru: 'Программа «{name}» импортирована. 🎉' },
  importedTheme: { en: 'Imported theme “{name}”. 🎨', ru: 'Тема «{name}» импортирована. 🎨' },
```

- [ ] **Step 2:** Run `node --test test/domain/builtins.test.ts` → PASS (en+ru guard).
- [ ] **Step 3 (main.ts):** wire the pipeline. Add imports:

```ts
import { LocalStoragePluginStore } from './adapters/local-storage-store.ts';
import { Importer } from './domain/plugins/importer.ts';
import { PackPlugin } from './domain/plugins/pack-plugin.ts';
import { ThemePlugin } from './domain/plugins/theme-plugin.ts';
import { ProgressPlugin } from './domain/plugins/progress-plugin.ts';
```

In `boot()`, after `migrateLegacy()` and constructing `tracker` but BEFORE `tracker.init()`:

```ts
const pluginStore = new LocalStoragePluginStore();
const importer = new Importer(
  [new PackPlugin(registry), new ThemePlugin(registry), new ProgressPlugin(tracker)],
  pluginStore,
);
importer.loadStored(); // after built-ins/script tags → built-ins win id collisions
```

Pass `importer` into the `DomController` constructor (updated in Task 10). Note: `tracker` must be constructed before the `Importer` (it's the `ProgressPlugin` target) — keep the existing `const tracker = new Tracker({...})`, then the block above, then `tracker.init()`.

- [ ] **Step 4:** `npm run typecheck` → expect a controller-arity error (fixed in Task 10). Defer commit to end of Task 10.

---

### Task 10: Route the 📥 button through `Importer` + activate by kind

**Files:**
- Modify: `src/adapters/dom-controller.ts` (constructor gains `importer`; rewrite the import `onchange`)
- Test: `test/adapters/dom.test.ts` (extend the existing fake-DOM harness; assert routing)

- [ ] **Step 1 (constructor):** in `src/adapters/dom-controller.ts`:
  - import: `import type { Importer } from '../domain/plugins/importer.ts';`
  - add field `private imp: Importer;` and parameter; assign in ctor:

```ts
constructor(tracker: Tracker, renderer: DomRenderer, importer: Importer) {
  this.t = tracker;
  this.r = renderer;
  this.imp = importer;
}
```

- [ ] **Step 2 (rewrite import handler):** replace the `importFile.onchange` body (lines ~419-439) with routing + activation:

```ts
importFile.onchange = (e) => {
  this.closeSheets();
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const out = this.imp.import(String(rd.result));
      if (out.kind === 'pack') {
        this.t.selectPack(out.id);
        this.r.applyTrackColors(this.t.trackColors());
        this.r.setLang(this.t.currentLang());
        this.applyStaticLabels();
        this.startMotd();
        alert(this.t.ui('importedPack').replace('{name}', this.packName(out.id)));
      } else if (out.kind === 'theme') {
        this.t.selectTheme(out.id);
        const href = this.t.activeThemeHref();
        if (href != null) this.r.applyTheme(href, out.id);
        alert(this.t.ui('importedTheme').replace('{name}', this.themeName(out.id)));
      } else {
        alert(this.t.ui('importOk')); // progress (already applied + pack switched if needed)
      }
      this.renderAll();
    } catch (err) {
      if (err instanceof ImportError || err instanceof ValidationError) {
        alert(this.t.ui('importFail').replace('{e}', err.message));
      } else {
        throw err;
      }
    }
  };
  rd.readAsText(f);
  (e.target as HTMLInputElement).value = '';
};
```

  - add two small helpers (read the freshly-registered name from selectors, which already carry resolved labels):

```ts
private packName(id: string): string {
  return this.t.selectors().packs.find((p) => p.id === id)?.label ?? id;
}
private themeName(id: string): string {
  return this.t.selectors().themes.find((t) => t.id === id)?.label ?? id;
}
```

- [ ] **Step 3 (main.ts):** update the `DomController` construction to pass `importer`:

```ts
new DomController(tracker, renderer, importer).start();
```

- [ ] **Step 4 (controller test):** in `test/adapters/dom.test.ts`, where `DomController` is constructed, pass a stub `Importer` (or a real one over a fake registry/store). Add a test that simulates `importFile.onchange` with a theme JSON and asserts `applyTheme` was called / theme selected. Match the file's existing harness construction style.
- [ ] **Step 5:** `npm run typecheck` → PASS. `node --test test/adapters/dom.test.ts` → PASS.
- [ ] **Step 6 (build + full suite):** `npm run build`, then `npm test` → all PASS (build regenerates `dist`/`sw.js` so `dist-sync`/`pwa-shell` pass).
- [ ] **Step 7:** Commit (include `dist/sunrise.js`, `dist/sunrise.js.map`, `sw.js`): `feat(import): smart 📥 routes pack/theme/progress via Importer`.

---

## Phase 2 — Tracker CQS split (Projections read model)

### Task 11: Extract `Projections` (read model) + `Tracker.view()`

**Files:**
- Create: `src/domain/projections.ts`
- Create: `src/domain/types/projections.ts` (the `TrackerView` snapshot + `ProjectionDeps`)
- Modify: `src/domain/tracker.ts` (add `view()`; keep query methods temporarily for green tests until Task 12)

- [ ] **Step 1 (view snapshot type):** create `src/domain/types/projections.ts`:

```ts
import type { Pack, Item, Group, Localized } from './entities.ts';
import type { BadgeRule } from './badge-rule.ts';
import type { Progress } from '../progress.ts';

// Readonly snapshot the read model needs from the write model.
export interface TrackerView {
  pack: Pack;
  progress: Progress;
  lang: string;
  themeId: string | null;
  currentItemId: string;
  rules: readonly BadgeRule[];
  allItems: readonly Item[];
  groupOfItem: Readonly<Record<string, Group>>;
  mottosList: readonly Localized[];
}
```

- [ ] **Step 2 (Tracker.view):** in `src/domain/tracker.ts` add:

```ts
public view(): TrackerView {
  return {
    pack: this.pack, progress: this.progress, lang: this.lang, themeId: this.themeId,
    currentItemId: this.currentItemId, rules: this.rules, allItems: this.allItems,
    groupOfItem: this.groupOfItem, mottosList: this.mottosList,
  };
}
```

(import `TrackerView` type.)

- [ ] **Step 3 (Projections):** create `src/domain/projections.ts`. It takes the calc deps + a `() => TrackerView` reader, and holds the query methods + i18n helpers (`uiText`, `lbl`, `trackMeta`, `itemOf`, `itemIndex`, `groupOrdinal`) **moved verbatim** from `Tracker` (lines 76-99, 119-124, 226-432), with `this.pack`→`v.pack`, `this.progress`→`v.progress`, `this.lang`→`v.lang`, etc., where `const v = this.read();` at the top of each method. Constructor:

```ts
export class Projections {
  constructor(
    private read: () => TrackerView,
    private deps: ProjectionDeps, // { stats, streaks, badges, packs, themes, defaultUi, defaultStreakWords, defaultMottos, supportedLangs }
  ) {}
  // selectors(), todayCard(), dashboard(), cardMap(), trophies(), comeback(),
  // trackColors(), mottos(), ui(key), aiPrompt(text,guidance), itemLabel(),
  // activeThemeHref(), activeThemeId(), activePackId(), currentLang(), langs()
}
```

Define `ProjectionDeps` in `src/domain/types/projections.ts` as the subset of `TrackerDeps` the queries use (`stats`, `streaks`, `badges`, `packs`, `themes`, `defaultUi`, `defaultStreakWords`, `defaultMottos`, `supportedLangs`).

- [ ] **Step 4 (test):** create `test/domain/projections.test.ts`. Construct a real `Tracker`, then `new Projections(() => tracker.view(), deps)`. Move the VM assertions (todayCard/dashboard/cardMap/trophies/selectors/aiPrompt/ui) from `tracker.test.ts` here, calling `proj.x()` instead of `tracker.x()`.
- [ ] **Step 5:** `node --test test/domain/projections.test.ts` → PASS. `npm run typecheck` → PASS. Commit: `refactor(domain): Projections read model + Tracker.view()`.

---

### Task 12: Slim `Tracker` (remove the moved query methods)

**Files:**
- Modify: `src/domain/tracker.ts` (delete query methods now living in Projections), `test/domain/tracker.test.ts`

- [ ] **Step 1:** delete from `Tracker` the methods moved to Projections: `selectors`, `todayCard`, `dashboard`, `cardMap`, `trophies`, `comeback`, `trackColors`, `mottos`, `ui`, `aiPrompt`, `itemLabel`, and the now-unused private helpers (`uiText`, `lbl`, `trackMeta`, `groupOrdinal` — keep `itemOf`/`itemIndex` only if still used by intents/navigation; `setTaskDone` uses `itemOf`). Keep state getters `activeThemeHref`/`activeThemeId`/`activePackId`/`currentLang`/`langs` on Tracker **or** move them to Projections — choose Projections for the localized ones and keep `activePackId`/`activeThemeId`/`activeThemeHref`/`currentLang` on Tracker (the controller uses them for export filename + applyTheme + setLang). Decision: keep those four on Tracker; move `langs` to Projections is optional — keep on Tracker for the controller's lang toggle.

> Concretely: Tracker retains `activePackId()`, `activeThemeId()`, `activeThemeHref()`, `currentLang()`, `langs()`, `trackColors()` (the controller calls these outside render). Wait — `trackColors`/`mottos` are used in `start()`/`startMotd()`. Keep `trackColors()` + `mottos()` reachable. To avoid ambiguity: **Projections owns** `selectors/todayCard/dashboard/cardMap/trophies/comeback/aiPrompt/ui/itemLabel`. **Tracker keeps** `activePackId/activeThemeId/activeThemeHref/currentLang/langs/trackColors/mottos` (cheap state reads the controller needs for wiring, not VM projection). This split matches the controller call sites.

- [ ] **Step 2:** in `test/domain/tracker.test.ts`, remove the assertions that now live in `projections.test.ts`; keep lifecycle/intents/navigation/import/selection tests.
- [ ] **Step 3:** `node --test test/domain/tracker.test.ts` → PASS. `npm run typecheck` → PASS. Commit: `refactor(domain): slim Tracker to write model + state reads`.

---

### Task 13: Controller sources queries from `Projections`

**Files:**
- Modify: `src/adapters/dom-controller.ts` (add `private q: Projections`; param), `src/main.ts`

- [ ] **Step 1 (controller):** add `import type { Projections } from '../domain/projections.ts';`, field `private q: Projections;`, constructor param after `importer`. Replace query call sites: `this.t.todayCard()`→`this.q.todayCard()`, and likewise `dashboard`, `cardMap`, `trophies`, `comeback`, `selectors`, `aiPrompt`, `ui`, `itemLabel`. Leave on `this.t`: `selectPack/selectTheme/setLang/selectItem/goToItem/setTaskDone/setReflection/exportProgress`, plus the state reads `activePackId/activeThemeId/activeThemeHref/currentLang/langs/trackColors/mottos`.

  > The `labels()`/`applyStaticLabels()`/`renderShortcuts()` helpers call `u(k)=this.t.ui(k)` — switch their `u` to `this.q.ui(k)`. `packName/themeName` (Task 10) use `this.t.selectors()` → change to `this.q.selectors()`.

- [ ] **Step 2 (main.ts):** construct Projections and pass it:

```ts
const projections = new Projections(() => tracker.view(), {
  stats, streaks, badges: new BadgeEngine(streaks, stats), // reuse the same instances passed to Tracker
  packs: registry, themes: registry,
  defaultUi: DEFAULT_UI, defaultStreakWords: DEFAULT_STREAK_WORDS,
  defaultMottos: DEFAULT_MOTTOS, supportedLangs: SUPPORTED_LANGS,
});
new DomController(tracker, renderer, importer, projections).start();
```

  > Reuse the exact `streaks`/`stats`/`badges` instances already built for `TrackerDeps` (don't double-construct `BadgeEngine`). Hoist them into shared `const`s.

- [ ] **Step 3:** `npm run typecheck` → PASS. `node --test test/adapters/dom.test.ts` → update the controller construction in that test to pass a `Projections` built over the test tracker; PASS.
- [ ] **Step 4 (build + full):** `npm run build`; `npm test` → all PASS.
- [ ] **Step 5:** Commit (incl. `dist`+`sw.js`): `refactor(adapters): controller reads via Projections, commands via Tracker`.

---

### Task 14: Docs + CLAUDE.md + final verification

**Files:**
- Modify: `CLAUDE.md`, `docs/plugins/content-pack.md`, `docs/plugins/theme.md`

- [ ] **Step 1 (theme.md):** add a "JSON import format" section: a self-contained theme JSON `{schema:'sunrise.theme/v1', id, name, version, css:"..."}` with **inline `css`** (not a file path), and the `css`-OR-`cssHref` rule. Add the security note (imported CSS can `url()`/`@import` remote resources).
- [ ] **Step 2 (content-pack.md):** add a "JSON import format" section: the importable file is the pack object (`schema:'sunrise.pack/v1', ...`) as pure JSON, alongside the existing `.js` IIFE form. Note duplicate ids are rejected (no overwrite).
- [ ] **Step 3 (CLAUDE.md):** update — theme schema (`css`-or-`cssHref`); the new `src/domain/plugins/` module (`ImportHandler`/`Importer`/handlers); the `Tracker` (write) + `Projections` (read) CQS split; `sunrise.plugins` storage key; the adapter→domain call map (commands→Tracker, queries→Projections, import→Importer). Note that import is additive (reject dup, no removal).
- [ ] **Step 4:** `npm run format` (prettier), `npm run lint`, `npm run typecheck`, `npm run build`, `npm test` → all green.
- [ ] **Step 5:** Commit: `docs(plugins): JSON import format + Tracker/Projections + plugin pipeline`.

---

## Self-review notes

- **Spec coverage:** classify-by-schema (Importer Task 8), persist+replay (Tasks 3,8,9), reject-dup (Task 4), theme inline css→blob (Tasks 2,4), progress routing (Task 7), activation at UI (Task 10), Tracker CQS split (Tasks 11-13), UI strings EN/RU (Task 9), docs (Task 14). All covered.
- **Type consistency:** `ImportHandler`/`ImportOutcome`/`ProgressTarget` (Task 5) are reused unchanged in Tasks 6-8,10. `Tracker.importProgress(packId, data): string` (Task 7) matches `ProgressTarget` (Task 5) and `ProgressPlugin.install` (Task 7). `TrackerView`/`ProjectionDeps` (Task 11) reused in Tasks 12-13.
- **Green-between-tasks:** domain/adapter tests run on `src` directly (no build); only `dist-sync`/`pwa-shell` need `npm run build`, so build is run at the end of Phase 1 (Task 10) and Phase 2 (Task 13) before full `npm test`.
