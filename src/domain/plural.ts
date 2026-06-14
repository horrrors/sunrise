// Index into a per-language plural-forms array.
// ru: one(0) / few(1) / many(2) — the Slavic rule. en + default: singular(0) / plural(1).
export function pluralIndex(lang: string, n: number): number {
  if (lang === 'ru') {
    const m10 = n % 10;
    const m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return 0;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 1;
    return 2;
  }
  return n === 1 ? 0 : 1;
}
