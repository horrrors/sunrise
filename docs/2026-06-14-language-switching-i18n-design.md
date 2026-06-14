# Language switching (i18n) — design

**Date:** 2026-06-14
**Branch:** `worktree-feat+i18n-language-switching` (from `origin/main`)
**Status:** design — awaiting user review

## Goal

Make Sunrise bilingual (English + Russian) with a runtime language switch. **English
is the primary language and the fallback.** Every user-visible string — app chrome,
badges, mottos, surprises, and all pack content — must be available in both languages
and switch live. Theme names are explicitly **out of scope** for switching (they stay
fixed English brand strings).

The app currently ships entirely in Russian. So this effort is, in practice:
1. an architecture that lets any string carry both languages, resolved at render time;
2. a Russian→English translation of all existing strings (chrome + the dev-roadmap pack);
3. EN promoted to the default/fallback language.

## Constraints (inherited, must not break)

- **Zero runtime dependencies.** No i18n library, no build-time message extraction. Runs
  from `file://` by double-clicking `index.html`.
- **Domain purity is lint-enforced** (`src/domain/**` may not touch `window`/`document`/
  `Date`/`Math.random`/`localStorage`). Language is just a string held in domain state;
  the resolver is pure.
- **Progress is keyed per `packId`.** The chosen design must keep `packId` stable across a
  language switch so streaks/badges/reflections survive switching.
- **`dist/sunrise.js` + `sw.js` are committed build artifacts.** Any `src/` change requires
  `npm run build` and committing the regenerated artifacts in the same change.
- Backward compatibility: existing single-language packs (plain-string fields) must keep
  validating and rendering unchanged.

## Architecture decision

### Chosen: inline localized maps (Approach A)

A text field becomes `Localized = string | { readonly [lang: string]: string }`. One pack
document carries both languages inline. A plain `string` means "language-neutral / identical
in all languages" (keeps existing packs valid; good for symbols, numbers, emoji-only mottos).

A single pure resolver in the domain turns a `Localized` + the active language into a plain
string. **Resolution happens only inside `Tracker`**, when it builds view-models and answers
`ui()`. View-models stay plain-string, so `DomRenderer` and `DomController` are essentially
untouched — the blast radius is the domain core + the validator + one button.

**Why A over the alternatives:**
- *One pack file per language* (B) would change `packId` on switch → split/lose progress
  (requires a real progress-store migration), and still needs a *separate* mechanism for
  chrome strings. Two mechanisms, plus a migration. Rejected.
- *Sidecar key→translation tables* (C) needs a stable key for every string and maximizes
  indirection / worst authoring ergonomics. Rejected.

Approach A keeps `packId` stable (progress survives), gives **one** uniform mechanism for
chrome + content + badges, and adds **no** dependency or build step.

## Components

### 1. `Localized` type + resolver (domain)

```ts
// src/domain/types/entities.ts (or a small i18n types file)
export type Localized = string | { readonly [lang: string]: string };
```

```ts
// src/domain/i18n.ts  (pure; no DOM/Date/globals)
export const DEFAULT_LANG = 'en';
// en is the fallback; then any present value; then '' for an empty/missing field.
export function tr(v: Localized | undefined, lang: string): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return v[lang] ?? v[DEFAULT_LANG] ?? Object.values(v)[0] ?? '';
}
```

### 2. Language state

- `Session` gains `lang?: string` (global, sits next to `themeId`/`cursors`). First run with
  no stored value → `'en'`. **No browser auto-detection** (deterministic, works on `file://`;
  YAGNI).
- `Tracker` holds `private lang: string`, with `setLang(id)` (persists to `SessionStore` like
  `selectTheme`) and `currentLang()`. `tracker.locale()` is replaced by `currentLang()` as the
  driver of `DomRenderer.setLang(...)`.
- `pack.locale` is retained only as optional source-language metadata; it no longer drives the
  UI language.
- Supported languages are a fixed list in `builtins.ts`:
  ```ts
  export const SUPPORTED_LANGS = [
    { id: 'en', label: 'EN' },
    { id: 'ru', label: 'Русский' },
  ] as const;
  ```
  (No per-pack language declaration — YAGNI. Chrome always supports en/ru.)

### 3. App chrome → bilingual (`builtins.ts`)

- `DEFAULT_UI` values become `Localized` (`{ en, ru }`). `Tracker.uiText(k)` resolves with the
  active language; pack `ui` overrides are also `Localized`.
  - The `aiPrompt` template's trailing "Отвечай на русском." gets a real EN variant
    ("Answer in English.").
- Generic badge `title`/`desc` become `Localized`; resolved in `Tracker.trophies()`
  (and wherever a badge toast title is produced).
- `DEFAULT_MOTTOS` entries become `Localized` (the current `一歩一歩 · шаг за шагом` motto is
  partly language-neutral; EN variant added).

### 4. Pluralization (the one locale-specific *logic*)

Today `dashboard()` inlines a Slavic 3-form plural picker over `DEFAULT_STREAK_WORDS`
(`['день','дня','дней']`). English needs a 2-form rule. Extract:

```ts
// src/domain/plural.ts  (pure)
export function pluralIndex(lang: string, n: number): number; // ru: 3-form; en/default: n===1?0:1
```

`streakWords` becomes per-language: `{ en: ['day','days'], ru: ['день','дня','дней'] }`.
`dashboard()` picks `streakWords[lang]` and indexes with `pluralIndex(lang, streak)`.
No `Intl` dependency — keep it explicit and unit-testable.

### 5. Validator (`validators.ts`)

Add a `LOCALIZED` schema rule: a field passes if it is a `string` **or** an object whose every
value is a `string` (reject arrays, numbers, nested objects, empty-string-only as today).
Apply to every text field:

`task.text`, `task.guidance`, `item.title`, `item.warmup`, `item.reflectPrompt`,
`resource.label`, `resource.note`, `group.title`, `phase.title`, `track.label`,
`badge.title`, `badge.desc`, `mottos[]`, `surprises[]`, `pack.name`, and `pack.ui` values.

Mechanical and backward compatible (plain strings still pass). Schema-version strings,
ids, icons, colors, hrefs stay plain `string`.

### 6. Language switch button (UI)

A compact ghost toggle in the header (and the mobile dock), next to the map/trophy buttons:
`🌐 EN/RU`. Click flips language. Handler mirrors the existing theme-switch handler exactly:

```
tracker.setLang(next) → r.setLang(tracker.currentLang()) → applyStaticLabels() → renderAll()
```

`DomRenderer.setLang` already sets `document.documentElement.lang`; the toggle label reflects
the *target* language (shows "RU" while in EN). With only two languages a toggle beats a
dropdown; if a 3rd language is ever added, swap the button for a `langSelect` later.

### 7. Theme names

Cleaned to English now (e.g. `"Dawn · Рассвет"` → `"Dawn · Sunrise"`, `"Neon · Кислота"` →
`"Neon · Acid"`), in `BUILTIN_THEMES` and the `registerTheme` calls in `index.html`. Theme
names are **not** localized and do **not** change with the toggle — they are fixed brand strings.

### 8. Content translation (the large, higher-risk task)

Convert all ~880 strings in `data/packs/dev-roadmap.js` to `{ en: "<new translation>",
ru: "<existing text>" }`, EN primary. Done in reviewable chunks (by group). CS/algorithm
terminology is the main accuracy risk — flagged explicitly for user review. Plain strings are
kept only for genuinely language-neutral values.

### 9. Docs

- `docs/plugins/content-pack.md`: document the `Localized` field type, the EN-fallback rule,
  and show a `{ en, ru }` example for each field kind.
- `docs/plugins/theme.md`: one-line note that theme names are fixed English, not localized.
- `CLAUDE.md`: new i18n invariant — EN is the default/fallback; resolution is centralized in
  `Tracker`; `Localized = string | {lang→string}`; pluralization lives in `domain/plural.ts`;
  language state is `Session.lang`.

## Data flow

```
Session.lang ──load──> Tracker.lang
                          │
   pack/chrome Localized ─┴─ tr(value, lang) ─> plain-string view-models ─> DomRenderer (unchanged)

toggle click ─> Tracker.setLang(next) ─persist─> Session.lang
            └─> r.setLang(currentLang())  (sets <html lang>)
            └─> applyStaticLabels() + renderAll()  (re-resolve every string)
```

`packId` never changes on a language switch → progress/streaks/badges/reflections are
untouched.

## Error handling / edge cases

- Missing translation for the active language → falls back to EN, then any present value,
  then `''` (via `tr`). No throw, no crash.
- Stored `Session.lang` that isn't in `SUPPORTED_LANGS` → treated as unknown; resolver still
  falls back to EN. The toggle normalizes it to a supported value on next switch.
- Old packs (plain-string fields) render identically in both languages.
- Old exports / stored progress: unaffected (progress stores no display text).

## Testing

- `tr()`: resolves selected lang; falls back EN → any → ''; passes plain strings through.
- `pluralIndex`: ru 1/2/5/11/21/22 forms; en 1 vs N; default 2-form.
- Validator: accepts plain string and `{en,ru}` map; rejects array / number / non-string values.
- `Tracker`: builds view-models in the selected language; switching language preserves
  progress (same `packId`); `ui()` resolves per language; badges/mottos resolve.
- Guard test (per "generalize into living docs"): assert `DEFAULT_UI`/generic badges provide
  both `en` and `ru`, so a future chrome string can't ship single-language.
- Existing 168 tests must stay green.

## Out of scope

- Browser language auto-detection.
- Localizing theme names.
- More than two languages (the design extends to N, but only en/ru are built/tested now).
- A general message-catalog / i18n library or build step.

## Build / commit reminders

- After `src/` edits: `npm run build` (regenerates `dist/sunrise.js`, `.map`, and `sw.js`) and
  commit the artifacts with the source.
- Run `npm run typecheck`, `npm test`, `npm run lint`, `npm run format:check` before completion.
