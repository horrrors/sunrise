import type { ImportHandler, ImportOutcome } from './import-handler.ts';
import { isObj } from './import-handler.ts';
import type { PluginRegistry } from '../../ports/index.ts';

// A theme. Validation + inline-css→blob materialization happen in
// registry.addTheme (the existing ThemeValidator + WindowPluginRegistry).
export class ThemePlugin implements ImportHandler<unknown> {
  public readonly persistable = true;
  private registry: PluginRegistry;
  constructor(registry: PluginRegistry) {
    this.registry = registry;
  }
  public matches(raw: unknown): boolean {
    return isObj(raw) && raw['schema'] === 'sunrise.theme/v1';
  }
  public validate(raw: unknown): unknown {
    return raw;
  }
  public install(raw: unknown): ImportOutcome {
    this.registry.addTheme(raw); // validates + dedups; throws on bad/duplicate
    return { kind: 'theme', id: (raw as { id: string }).id };
  }
}
