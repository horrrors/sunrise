import type { Localized } from './types/entities.ts';
export type { Localized };

export const DEFAULT_LANG = 'en';

// Resolve a Localized value for the active language. A plain string is
// language-neutral. For a map: the active language wins, then EN (the fallback),
// then any present value, then '' for an empty/missing field. Never throws.
export function tr(v: Localized | undefined, lang: string): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return v[lang] ?? v[DEFAULT_LANG] ?? Object.values(v)[0] ?? '';
}
