import type { ImportHandler, ImportOutcome } from './import-handler.ts';
import { isObj } from './import-handler.ts';
import type { PluginRegistry } from '../../ports/index.ts';

// A roadmap/content pack. Structural validation happens in registry.addPack
// (the existing PackValidator) so there is a single validation path.
export class PackPlugin implements ImportHandler<unknown> {
  public readonly persistable = true;
  private registry: PluginRegistry;
  constructor(registry: PluginRegistry) {
    this.registry = registry;
  }
  public matches(raw: unknown): boolean {
    return isObj(raw) && raw['schema'] === 'sunrise.pack/v1';
  }
  public validate(raw: unknown): unknown {
    return raw;
  }
  public install(raw: unknown): ImportOutcome {
    this.registry.addPack(raw); // validates + dedups; throws on bad/duplicate
    return { kind: 'pack', id: (raw as { id: string }).id };
  }
}
