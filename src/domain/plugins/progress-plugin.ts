import type { ImportHandler, ImportOutcome, ProgressTarget } from './import-handler.ts';
import { isObj } from './import-handler.ts';
import type { ProgressData } from '../types/progress.ts';
import { ProgressValidator } from '../validators.ts';

interface ProgressPayload {
  packId: string | null;
  data: ProgressData;
}

// A progress export. Unlike packs/themes it is not a catalog plugin: it is applied
// to the active-pack aggregate (via ProgressTarget) and is neither persisted to the
// plugin store nor replayed at boot (Tracker persists progress under its own key).
export class ProgressPlugin implements ImportHandler<ProgressPayload> {
  public readonly persistable = false;
  private validator = new ProgressValidator();
  private target: ProgressTarget;
  constructor(target: ProgressTarget) {
    this.target = target;
  }
  public matches(raw: unknown): boolean {
    if (!isObj(raw)) return false;
    if (raw['schema'] === 'sunrise.progress/v1') return true;
    // Legacy exports carried no schema: v1 had `items`, v2 had `days`.
    return raw['schema'] === undefined && (isObj(raw['items']) || isObj(raw['days']));
  }
  public validate(raw: unknown): ProgressPayload {
    const data = this.validator.parse(raw); // throws ValidationError; migrates legacy days→items
    const packId = isObj(raw) && typeof raw['packId'] === 'string' ? raw['packId'] : null;
    return { packId, data };
  }
  public install(p: ProgressPayload): ImportOutcome {
    const id = this.target.importProgress(p.packId, p.data);
    return { kind: 'progress', id };
  }
}
