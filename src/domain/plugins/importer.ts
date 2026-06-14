import type { ImportHandler, ImportOutcome } from './import-handler.ts';
import type { PluginStore } from '../../ports/index.ts';
import { ImportError } from '../errors.ts';

// The open/closed import pipeline. Adding a new importable kind = a new
// ImportHandler in the `handlers` list (composition root) — this class never changes.
export class Importer {
  private handlers: readonly ImportHandler[];
  private store: PluginStore;
  constructor(handlers: readonly ImportHandler[], store: PluginStore) {
    this.handlers = handlers;
    this.store = store;
  }

  public import(json: string): ImportOutcome {
    let raw: unknown;
    try {
      raw = JSON.parse(json);
    } catch {
      throw new ImportError('Invalid JSON');
    }
    const h = this.handlers.find((x) => x.matches(raw));
    if (!h) {
      throw new ImportError('Unrecognized file — not a Sunrise pack, theme, or progress export');
    }
    const outcome = h.install(h.validate(raw)); // throws ValidationError/ImportError on bad input
    if (h.persistable) this.store.append(raw); // only after a successful install
    return outcome;
  }

  // Boot: replay persisted catalog plugins (NO re-persist). A stored plugin gone
  // bad (duplicate id, schema drift) must not crash boot — swallow + log.
  public loadStored(): void {
    for (const raw of this.store.load()) {
      const h = this.handlers.find((x) => x.matches(raw) && x.persistable);
      if (!h) continue;
      try {
        h.install(h.validate(raw));
      } catch (e) {
        console.error('[sunrise] stored plugin rejected:', e);
      }
    }
  }
}
