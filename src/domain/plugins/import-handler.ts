import type { ProgressData } from '../types/progress.ts';

export interface ImportOutcome {
  kind: 'pack' | 'theme' | 'progress';
  id: string;
}

// One importable plugin kind. Implementations are simple inside; the open/closed
// seam is that adding a kind = a new ImportHandler + one line at the composition
// root — the Importer, controller, storage format and boot loop never change.
export interface ImportHandler<E = unknown> {
  matches(raw: unknown): boolean;
  validate(raw: unknown): E; // throws ValidationError / ImportError on bad input
  install(entity: E): ImportOutcome;
  readonly persistable: boolean; // catalog plugins persist + replay at boot; progress doesn't
}

// What ProgressPlugin needs from Tracker (the active-pack progress aggregate),
// kept narrow so the handler doesn't depend on the whole write model.
export interface ProgressTarget {
  // Switches to packId if it names a different *loaded* pack; throws ImportError
  // if packId is given but not loaded. Replaces progress, reconciles, saves,
  // resets the cursor. Returns the resolved (now-active) pack id.
  importProgress(packId: string | null, data: ProgressData): string;
}

export const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
