import type { Pack, Theme, Session } from '../domain/entities.types.ts';
import type { Progress } from '../domain/progress.ts';

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
