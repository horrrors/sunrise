import type { PackSource, ThemeSource, PluginRegistry } from '../ports/index.ts';
import type { Pack, Theme } from '../domain/types/entities.ts';
import { PackValidator, ThemeValidator } from '../domain/validators.ts';
import { ValidationError, ImportError } from '../domain/errors.ts';
import type { Rejection } from './types/window-registry.ts';

export class WindowPluginRegistry implements PackSource, ThemeSource, PluginRegistry {
  private packList: Pack[] = [];
  private themeList: Theme[] = [];
  private rejectedList: Rejection[] = [];
  private packValidator = new PackValidator();
  private themeValidator = new ThemeValidator();

  public packs(): readonly Pack[] {
    return [...this.packList];
  }
  public themes(): readonly Theme[] {
    return [...this.themeList];
  }
  public rejected(): readonly Rejection[] {
    return [...this.rejectedList];
  }

  public addBuiltinThemes(themes: readonly Theme[]): void {
    this.themeList.push(...themes);
  }

  // ----- write side (PluginRegistry, used by the import pipeline) -------------
  // Unlike registerPack/registerTheme (boot path: swallow + log), these THROW so
  // the importer can surface validation/duplicate errors to the user.

  public hasPack(id: string): boolean {
    return this.packList.some((p) => p.id === id);
  }
  public hasTheme(id: string): boolean {
    return this.themeList.some((t) => t.id === id);
  }

  public addPack(raw: unknown): void {
    const pack = this.packValidator.parse(raw); // throws ValidationError on bad input
    if (this.hasPack(pack.id)) throw new ImportError(`pack "${pack.id}" already exists`);
    this.packList.push(pack);
  }

  public addTheme(raw: unknown): void {
    const theme = this.themeValidator.parse(raw); // throws; enforces css-or-cssHref
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

  public registerPack(raw: unknown): void {
    try {
      const pack = this.packValidator.parse(raw);
      if (this.packList.some((p) => p.id === pack.id)) {
        throw new ValidationError([{ path: 'id', msg: `duplicate pack id "${pack.id}"` }]);
      }
      this.packList.push(pack);
    } catch (e) {
      this.reject('pack', raw, e);
    }
  }

  public registerTheme(raw: unknown): void {
    try {
      const theme = this.themeValidator.parse(raw);
      if (this.themeList.some((t) => t.id === theme.id)) {
        throw new ValidationError([{ path: 'id', msg: `duplicate theme id "${theme.id}"` }]);
      }
      this.themeList.push(theme);
    } catch (e) {
      this.reject('theme', raw, e);
    }
  }

  private reject(kind: 'pack' | 'theme', raw: unknown, e: unknown): void {
    const id =
      raw &&
      typeof raw === 'object' &&
      'id' in raw &&
      typeof (raw as { id: unknown }).id === 'string'
        ? (raw as { id: string }).id
        : '(no id)';
    const issues = e instanceof ValidationError ? e.issues : [{ path: '', msg: String(e) }];
    this.rejectedList.push({ kind, id, issues });
    console.error(`[sunrise] ${kind} "${id}" rejected:`, issues);
  }
}
