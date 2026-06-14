import type { Pack, Theme, Session } from '../domain/types/entities.ts';
import type { Progress } from '../domain/progress.ts';

// Contract: both values share one time basis (the user's local clock) —
// today() is the local calendar day as "YYYY-MM-DD", hour() the local hour.
export interface Clock {
  today(): string;
  hour(): number;
}
export interface Random {
  next(): number;
}
export interface ProgressStore {
  load(packId: string): Progress;
  save(packId: string, p: Progress): void;
}
export interface SessionStore {
  load(): Session;
  save(s: Session): void;
}
export interface PackSource {
  packs(): readonly Pack[];
}
export interface ThemeSource {
  themes(): readonly Theme[];
}

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
