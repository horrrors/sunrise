import type { PackSource, ThemeSource } from '../ports/index.ts';
import type { Pack, Theme } from '../domain/entities.ts';
import { PackValidator, ThemeValidator } from '../domain/validators.ts';
import { ValidationError } from '../domain/errors.ts';

export interface Rejection {
  kind: 'pack' | 'theme';
  id: string;
  issues: readonly { path: string; msg: string }[];
}

export class WindowPluginRegistry implements PackSource, ThemeSource {
  #packs: Pack[] = [];
  #themes: Theme[] = [];
  #rejected: Rejection[] = [];
  #packValidator = new PackValidator();
  #themeValidator = new ThemeValidator();

  packs(): readonly Pack[] { return [...this.#packs]; }
  themes(): readonly Theme[] { return [...this.#themes]; }
  rejected(): readonly Rejection[] { return [...this.#rejected]; }

  addBuiltinThemes(themes: readonly Theme[]): void { this.#themes.push(...themes); }

  registerPack(raw: unknown): void {
    try { this.#packs.push(this.#packValidator.parse(raw)); } catch (e) { this.#reject('pack', raw, e); }
  }

  registerTheme(raw: unknown): void {
    try { this.#themes.push(this.#themeValidator.parse(raw)); } catch (e) { this.#reject('theme', raw, e); }
  }

  #reject(kind: 'pack' | 'theme', raw: unknown, e: unknown): void {
    const id =
      raw && typeof raw === 'object' && 'id' in raw && typeof (raw as { id: unknown }).id === 'string'
        ? (raw as { id: string }).id
        : '(no id)';
    const issues = e instanceof ValidationError ? e.issues : [{ path: '', msg: String(e) }];
    this.#rejected.push({ kind, id, issues });
    console.error(`[sunrise] ${kind} "${id}" rejected:`, issues);
  }
}
