import type { PackSource, ThemeSource } from '../ports/index.ts';
import type { Pack, Theme } from '../domain/types/entities.ts';
import { PackValidator, ThemeValidator } from '../domain/validators.ts';
import { ValidationError } from '../domain/errors.ts';
import type { Rejection } from './types/window-registry.ts';

export class WindowPluginRegistry implements PackSource, ThemeSource {
  private packList: Pack[] = [];
  private themeList: Theme[] = [];
  private rejectedList: Rejection[] = [];
  private packValidator = new PackValidator();
  private themeValidator = new ThemeValidator();

  public packs(): readonly Pack[] { return [...this.packList]; }
  public themes(): readonly Theme[] { return [...this.themeList]; }
  public rejected(): readonly Rejection[] { return [...this.rejectedList]; }

  public addBuiltinThemes(themes: readonly Theme[]): void { this.themeList.push(...themes); }

  public registerPack(raw: unknown): void {
    try { this.packList.push(this.packValidator.parse(raw)); } catch (e) { this.reject('pack', raw, e); }
  }

  public registerTheme(raw: unknown): void {
    try { this.themeList.push(this.themeValidator.parse(raw)); } catch (e) { this.reject('theme', raw, e); }
  }

  private reject(kind: 'pack' | 'theme', raw: unknown, e: unknown): void {
    const id =
      raw && typeof raw === 'object' && 'id' in raw && typeof (raw as { id: unknown }).id === 'string'
        ? (raw as { id: string }).id
        : '(no id)';
    const issues = e instanceof ValidationError ? e.issues : [{ path: '', msg: String(e) }];
    this.rejectedList.push({ kind, id, issues });
    console.error(`[sunrise] ${kind} "${id}" rejected:`, issues);
  }
}
