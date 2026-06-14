# Language switching (EN/RU i18n) — Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [ ]`) syntax.
> **Commit policy for THIS effort:** the user asked for NO commits — leave every change as an
> uncommitted working-tree edit in the worktree. Ignore the per-task `git commit` steps the
> TDD pattern would normally include. Still run `npm run build` after `src/` edits so the
> committed-artifact files (`dist/sunrise.js`, `.map`, `sw.js`) stay coherent in the tree.

**Goal:** Make Sunrise bilingual (English primary + Russian) with a live language toggle; every
user-visible string — chrome, badges, mottos, surprises, and all pack content — switches.

**Architecture:** A `Localized = string | {lang→string}` type; one pure resolver `tr(v, lang)`
(EN fallback). Resolution is centralized in `Tracker` when it builds plain-string view-models,
so `DomRenderer`/`DomController` barely change. Language lives in `Session.lang` (default `en`);
a header `🌐 EN/RU` toggle mirrors the existing theme-switch handler. Theme names are fixed
English brand strings (not localized). Plural logic moves to a pure `domain/plural.ts`.

**Tech Stack:** TypeScript (strict, NodeNext, `.ts` extensions), esbuild → committed
`dist/sunrise.js`, `node --test` native TS, zero runtime deps.

**Spec:** `docs/2026-06-14-language-switching-i18n-design.md`

---

## File map

**Create**
- `src/domain/i18n.ts` — `Localized` re-export, `DEFAULT_LANG`, `tr(v, lang)`.
- `src/domain/plural.ts` — `pluralIndex(lang, n)`.
- `test/domain/i18n.test.ts`, `test/domain/plural.test.ts`.

**Modify (src)**
- `src/domain/types/entities.ts` — add `Localized`; text fields → `Localized`; `Session.lang`.
- `src/domain/types/badge-rule.ts` — `BadgeMeta.title/desc` → `Localized`.
- `src/domain/types/tracker.ts` — `TrackerDeps` field types; add `supportedLangs`.
- `src/domain/builtins.ts` — bilingual `DEFAULT_UI`/badges/mottos; per-lang `streakWords`;
  `SUPPORTED_LANGS`; clean theme names to English.
- `src/domain/tracker.ts` — `lang` state, `setLang`/`currentLang`/`langs`; resolve every
  `Localized` via `tr`; plural via `pluralIndex`.
- `src/domain/validators.ts` — `localized` schema rule; apply to text fields; relax ui/labels.
- `src/adapters/dom-controller.ts` — toggle wiring; `locale()`→`currentLang()`; toggle label.
- `src/main.ts` — pass `supportedLangs: SUPPORTED_LANGS`.
- `index.html` — `<html lang="en">`; `🌐` buttons in header + dock; English `registerTheme` names.

**Modify (content + docs + tests)**
- `data/packs/dev-roadmap.js` — ~880 strings → `{ en, ru }` (Phase 5).
- `docs/plugins/content-pack.md`, `docs/plugins/theme.md`, `CLAUDE.md`.
- `test/domain/tracker.test.ts`, `test/domain/validators.test.ts`, `test/domain/builtins.test.ts`,
  `test/domain/dev-roadmap-pack.test.ts` (add `supportedLangs` to deps; new assertions).

---

# Phase 1 — Pure i18n primitives (no wiring yet)

### Task 1: `tr()` resolver

**Files:** Create `src/domain/i18n.ts`, `test/domain/i18n.test.ts`.

- [ ] **Step 1 — failing test** (`test/domain/i18n.test.ts`):

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tr, DEFAULT_LANG } from '../../src/domain/i18n.ts';

test('tr: plain string passes through unchanged for any lang', () => {
  assert.equal(tr('hi', 'en'), 'hi');
  assert.equal(tr('hi', 'ru'), 'hi');
});
test('tr: picks the active language', () => {
  assert.equal(tr({ en: 'Summary', ru: 'Сводка' }, 'ru'), 'Сводка');
  assert.equal(tr({ en: 'Summary', ru: 'Сводка' }, 'en'), 'Summary');
});
test('tr: falls back to EN, then any value, then empty', () => {
  assert.equal(tr({ en: 'E', ru: 'R' }, 'de'), 'E');        // unknown lang → EN
  assert.equal(tr({ ru: 'R' }, 'en'), 'R');                 // EN missing → any
  assert.equal(tr(undefined, 'en'), '');                    // missing → ''
  assert.equal(tr({}, 'en'), '');                           // empty map → ''
});
test('DEFAULT_LANG is en', () => assert.equal(DEFAULT_LANG, 'en'));
```

- [ ] **Step 2 — run, expect fail:** `node --test test/domain/i18n.test.ts` → FAIL (module not found).

- [ ] **Step 3 — implement** (`src/domain/i18n.ts`):

```ts
import type { Localized } from './types/entities.ts';
export type { Localized };

export const DEFAULT_LANG = 'en';

// en is the fallback; then any present value; then '' for an empty/missing field.
export function tr(v: Localized | undefined, lang: string): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return v[lang] ?? v[DEFAULT_LANG] ?? Object.values(v)[0] ?? '';
}
```

(Defining `Localized` itself is Task 4; until then this import is unresolved — keep Task 4
ordered before the first typecheck. To run this test standalone now, temporarily inline
`type Localized = string | { readonly [k: string]: string }` and replace with the import in
Task 4. Simpler: do Task 4 first, then this. Either order is fine as long as both land before
`npm run typecheck`.)

- [ ] **Step 4 — run, expect pass:** `node --test test/domain/i18n.test.ts` → PASS.

### Task 2: `pluralIndex()`

**Files:** Create `src/domain/plural.ts`, `test/domain/plural.test.ts`.

- [ ] **Step 1 — failing test:**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pluralIndex } from '../../src/domain/plural.ts';

test('en: 1 → 0 (singular), everything else → 1 (plural)', () => {
  assert.equal(pluralIndex('en', 1), 0);
  assert.equal(pluralIndex('en', 0), 1);
  assert.equal(pluralIndex('en', 2), 1);
  assert.equal(pluralIndex('en', 21), 1);
});
test('ru: Slavic 3-form one/few/many → 0/1/2', () => {
  assert.equal(pluralIndex('ru', 1), 0);   // день
  assert.equal(pluralIndex('ru', 21), 0);
  assert.equal(pluralIndex('ru', 2), 1);   // дня
  assert.equal(pluralIndex('ru', 23), 1);
  assert.equal(pluralIndex('ru', 5), 2);   // дней
  assert.equal(pluralIndex('ru', 11), 2);  // 11..14 are 'many' despite ending in 1..4
  assert.equal(pluralIndex('ru', 12), 2);
  assert.equal(pluralIndex('ru', 14), 2);
  assert.equal(pluralIndex('ru', 0), 2);
});
test('unknown lang uses the 2-form default', () => {
  assert.equal(pluralIndex('de', 1), 0);
  assert.equal(pluralIndex('de', 7), 1);
});
```

- [ ] **Step 2 — run, expect fail.**

- [ ] **Step 3 — implement** (`src/domain/plural.ts`) — this is the exact Slavic rule moved out
of `dashboard()`:

```ts
// Index into a per-language plural-forms array.
// ru: one(0) / few(1) / many(2). en + default: singular(0) / plural(1).
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
```

- [ ] **Step 4 — run, expect pass.**

---

# Phase 2 — Types & data model

### Task 3: `Localized` type + `Session.lang` + entity text fields

**Files:** Modify `src/domain/types/entities.ts`.

- [ ] **Step 1 — add the type** at top of `entities.ts`:

```ts
export type Localized = string | { readonly [lang: string]: string };
```

- [ ] **Step 2 — change text fields to `Localized`** (ids / refs / colors / icons / hrefs stay
`string`). Resulting interfaces:

```ts
export interface Task { readonly id: string; readonly text: Localized; readonly guidance?: Localized; }
export interface Resource { readonly label: Localized; readonly note: Localized; }
export interface Item {
  readonly id: string; readonly track: string;
  readonly title?: Localized; readonly warmup?: Localized; readonly reflectPrompt?: Localized;
  readonly tasks?: readonly Task[]; readonly resources?: readonly Resource[]; readonly rest?: boolean;
}
export interface Group { readonly id: string; readonly title: Localized; readonly phase?: string; readonly items: readonly Item[]; }
export interface Phase { readonly id: string; readonly title: Localized; }
export interface Track { readonly id: string; readonly label: Localized; readonly icon?: string; readonly color?: string; }
export interface Labels { readonly phase?: Localized; readonly item?: Localized; }
export interface Pack {
  readonly schema: 'sunrise.pack/v1';
  readonly id: string; readonly name: Localized; readonly version: string; readonly locale?: string;
  readonly settings?: PackSettings; readonly tracks: readonly Track[]; readonly phases?: readonly Phase[];
  readonly groups: readonly Group[]; readonly badges?: readonly BadgeRule[];
  readonly mottos?: readonly Localized[]; readonly surprises?: readonly Localized[];
  readonly ui?: Readonly<Record<string, Localized>>;
}
```

(Leave `Theme` unchanged — theme `name` stays `string`.)

- [ ] **Step 3 — add `lang` to `Session`:**

```ts
export interface Session { activePackId?: string; themeId?: string; lang?: string; cursors?: Record<string, string>; }
```

- [ ] **Step 4 — typecheck:** `npm run typecheck` → expect MANY errors in `tracker.ts`,
`builtins.ts`, `validators.ts` (string fields now `Localized`). That's expected; Tasks 4–7 fix them.

### Task 4: `BadgeMeta` localized

**Files:** Modify `src/domain/types/badge-rule.ts`.

- [ ] **Step 1 — change fields:**

```ts
import type { Localized } from './entities.ts';
export interface BadgeMeta { readonly id: string; readonly title: Localized; readonly desc?: Localized; readonly icon?: string; }
```

(Rest of file unchanged.)

### Task 5: `TrackerDeps` shapes

**Files:** Modify `src/domain/types/tracker.ts`.

- [ ] **Step 1 — update field types + add `supportedLangs`:**

```ts
import type { Localized } from './entities.ts';
// ...
export interface TrackerDeps {
  // ...existing service deps unchanged...
  defaultUi: Record<string, Localized>;
  genericBadges: readonly BadgeRule[];
  defaultStreakWords: Record<string, readonly string[]>;   // per-language: { en:[...], ru:[...] }
  defaultMottos: readonly Localized[];
  supportedLangs: readonly { id: string; label: string }[];
}
```

---

# Phase 3 — Bilingual builtins

### Task 6: Translate chrome, badges, mottos; per-lang streak words; SUPPORTED_LANGS; theme names

**Files:** Modify `src/domain/builtins.ts`.

- [ ] **Step 1 — `DEFAULT_UI` → `Record<string, Localized>`.** Convert every value to
`{ en, ru }`, EN as the new translation, RU = the current string. Full key list (use the
current file's RU verbatim as the `ru` side):

```
summaryTitle{en:'Summary'} todayTitle{en:'Today'} warmup{en:'Warm-up'} reflect{en:'Reflection'}
export{en:'Export'} import{en:'Import'} cardMap{en:'Progress map'} trophies{en:'Trophies'}
nextDay{en:'Next day →'} restTitle{en:'Rest day'} overallTitle{en:'Overall progress'}
streakTitle{en:'Streak'} phasesTitle{en:'Phases'} tracksTitle{en:'Tracks'}
daysOf{en:'days done of {n}'} newTrophy{en:'🏆 New trophy!'}
comeback{en:'Welcome back — {n} days done in total. Let’s keep going.'}
importOk{en:'Progress imported.'} importFail{en:'Import failed: {e}\nCurrent progress unchanged.'}
weekAbbr{en:'Wk'} inARow{en:'in a row'} phaseWord{en:'Phase'} phaseLabel{en:''}
todayVert{en:'TODAY'} restVert{en:'REST'} taskPlaceholder{en:'Short note...'}
prevDayAria{en:'Previous day'} nextDayAria{en:'Next day'} theme{en:'Theme'} pack{en:'Program'}
menu{en:'Menu'} hint{en:'What counts as a strong answer'} copy{en:'Copy'}
copyAi{en:'Copy with AI prompt'} copied{en:'Copied'} copiedAi{en:'AI prompt copied — paste it into an AI chat'}
aiPrompt{en:'I’m working through a study program and I’m currently on the topic “{title}” (track: {track}). Break down this task like an experienced mentor:\n\n{text}\n{guidance}\nFirst explain the idea and intuition in plain words, then give a full breakdown: for a problem — name the pattern, the approach, and the time/space complexity, and only after that the code; for theory — a structured explanation with examples. Answer in English.'}
aiPromptGuidance{en:'Criterion for a strong answer: {guidance}'}
shortcuts{en:'Keyboard shortcuts'} scDay{en:'Previous / next day'} scTick{en:'Move between tasks'}
scMark{en:'Toggle a task'} scMap{en:'Progress map'} scTrophies{en:'Trophies'} scHelp{en:'This help'}
scClose{en:'Close dialog'}
```

Add one new chrome key for the toggle's aria-label/tooltip:

```ts
language: { en: 'Language', ru: 'Язык' },
```

- [ ] **Step 2 — per-language streak words:**

```ts
export const DEFAULT_STREAK_WORDS: Record<string, readonly string[]> = {
  en: ['day', 'days'],
  ru: ['день', 'дня', 'дней'],
};
```

- [ ] **Step 3 — mottos → `Localized[]`:**

```ts
export const DEFAULT_MOTTOS: readonly import('./types/entities.ts').Localized[] = [
  { en: '一歩一歩 · step by step', ru: '一歩一歩 · шаг за шагом' },
];
```

- [ ] **Step 4 — `GENERIC_BADGES` title/desc → `{ en, ru }`.** Keep ids/types/icons. RU side =
current strings. EN side (titles already English keep both equal): e.g.
`first-light{title:{en:'First Light',ru:'First Light'},desc:{en:'First fully completed day',ru:'Первый полностью закрытый день'}}`,
`streak-3{title:{en:'Warm-up',ru:'Разогрев'},desc:{en:'3-day streak',ru:'Серия 3 дня подряд'}}`,
… apply the same pattern to all 21 badges (streak-7/14/30/100, days-10/25/50, halfway→
`{en:'Halfway',ru:'Экватор'}`, finisher→`{en:'Finisher',ru:'Финишер'}`, tasks-100,
scribe-10→`{en:'Scribe',ru:'Летописец'}`, scribe-30→`{en:'Chronicler',ru:'Хронист'}`,
perfect-week→`{en:'Perfect Week',ru:'Идеальная неделя'}`, weeks-4→`{en:'A Month In',ru:'Месяц в деле'}`,
comeback, night-owl, early-lark, weekend→`{en:'Weekend Warrior',ru:'Воин выходного'}`).

- [ ] **Step 5 — `SUPPORTED_LANGS`:**

```ts
export const SUPPORTED_LANGS: readonly { id: string; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'ru', label: 'RU' },
];
```

- [ ] **Step 6 — clean `BUILTIN_THEMES` names to English** (only Russian-containing ones):
`neon` → `'Neon · Acid'`, `emerald` → `'Emerald · Marble'`. (`japanese` keeps `和`,
`bonus`/`dashboard` unchanged.)

- [ ] **Step 7 — typecheck builtins** (will still error in tracker/validators — fixed next).

---

# Phase 4 — Resolution + validation + wiring

### Task 7: Resolve `Localized` in `Tracker`

**Files:** Modify `src/domain/tracker.ts`.

- [ ] **Step 1 — imports + state:**

```ts
import { tr, DEFAULT_LANG } from './i18n.ts';
import { pluralIndex } from './plural.ts';
// in class:
private lang: string = DEFAULT_LANG;
```

- [ ] **Step 2 — `init()` reads lang from session** (add near the existing `sess` load):

```ts
const sess = this.deps.sessionStore.load();
this.lang = sess.lang ?? DEFAULT_LANG;
```

- [ ] **Step 3 — language API:**

```ts
public setLang(id: string): void {
  const sess = this.deps.sessionStore.load();
  sess.lang = id;
  this.deps.sessionStore.save(sess);
  this.lang = id;
}
public currentLang(): string { return this.lang; }
public langs(): readonly { id: string; label: string }[] { return this.deps.supportedLangs; }
```

- [ ] **Step 4 — resolve in helpers:**

```ts
private uiText(k: string): string {
  const fromPack = this.pack.ui && this.pack.ui[k];
  if (fromPack != null) return tr(fromPack, this.lang);
  const def = this.deps.defaultUi[k];
  return def != null ? tr(def, this.lang) : '';
}
private lbl(k: keyof NonNullable<NonNullable<Pack['settings']>['labels']>, fallbackKey: string): string {
  const l = this.pack.settings && this.pack.settings.labels;
  const v = l && l[k];
  return v != null ? tr(v, this.lang) : this.uiText(fallbackKey);
}
```

- [ ] **Step 5 — resolve in every view-model builder.** Wrap each `Localized` read in `tr(_, this.lang)`:
  - `selectors()`: pack label `tr(p.name, this.lang)`; theme label stays `t.name`; item label
    `` `${tr(g.title, this.lang)} · ${it.rest ? this.uiText('restVert') : tr(this.trackMeta(it.track).label, this.lang)}` ``.
  - `todayCard()`: `trackLabel: tr(m.label, this.lang)`, `title: tr(it.title, this.lang)`,
    `warmup: it.warmup != null ? tr(it.warmup, this.lang) : undefined`,
    `reflectPrompt: it.reflectPrompt != null ? tr(it.reflectPrompt, this.lang) : undefined`,
    tasks `text: tr(t.text, this.lang)`, guidance `tr(t.guidance, this.lang)` (guard undefined),
    resources `label: tr(r.label, this.lang), note: tr(r.note, this.lang)`. (`title` for rest uses `uiText('restTitle')` already.)
    NOTE: `warmup`/`reflectPrompt`/`guidance` are optional on the VM; keep the existing
    conditional-spread shape but feed it the resolved string.
  - `dashboard()`: replace the inline Slavic block with
    ```ts
    const words = this.deps.defaultStreakWords[this.lang] ?? this.deps.defaultStreakWords[DEFAULT_LANG] ?? [];
    const streakWord = words[pluralIndex(this.lang, streak)] ?? words[words.length - 1] ?? '';
    ```
    phases `title: tr(ph.title, this.lang) || \`${this.lbl('phase','phaseWord')} ${ph.id}\``;
    tracks `label: tr(t.label, this.lang)`.
  - `cardMap()`: group `title: tr(g.title, this.lang)`; item `title: tr(it.title, this.lang)`.
  - `trophies()`: `title: meta ? tr(meta.title, this.lang) : b.id`, `desc: tr(meta?.desc, this.lang)`.
  - `mottos()`: `return this.mottosList.map((m) => tr(m, this.lang));` (type `mottosList: readonly Localized[]`).
  - `aiPrompt()`: `.replace('{track}', tr(this.trackMeta(it.track).label, this.lang))` and
    `.replace('{title}', tr(it.title, this.lang))`.

- [ ] **Step 6 — fix `trackMeta` rest fallback type:** it returns `{ id, label: '', icon: '' }`;
`label: ''` is a valid `Localized`, no change needed.

- [ ] **Step 7 — `mottosList` field type** → `private mottosList: readonly Localized[] = [];`
(import `Localized`). The `loadPack` assignment already works (both sides `Localized[]`).

- [ ] **Step 8 — remove the now-unused `locale()`** *after* the controller stops calling it
(Task 9). First grep: `grep -rn '\.locale()' src test`. If only the two controller call sites
match, delete `public locale()` here in Task 9's commit window. If a test references it, keep it.

- [ ] **Step 9 — typecheck:** `npm run typecheck` → tracker errors resolved (validators next).

### Task 8: Validator accepts `Localized`

**Files:** Modify `src/domain/validators.ts`. Test: `test/domain/validators.test.ts`.

- [ ] **Step 1 — failing test** (add to `validators.test.ts`):

```ts
test('PackValidator accepts {en,ru} maps in text fields', () => {
  const p = makeMinimalPack();                  // helper already in file, or inline a valid pack
  p.name = { en: 'Dev', ru: 'Дев' };
  p.tracks[0].label = { en: 'DSA', ru: 'Алго' };
  p.groups[0].title = { en: 'Week 1', ru: 'Неделя 1' };
  p.groups[0].items[0].title = { en: 'A', ru: 'А' };
  p.groups[0].items[0].tasks[0].text = { en: 'x', ru: 'икс' };
  assert.doesNotThrow(() => new PackValidator().parse(p));
});
test('PackValidator rejects a non-string value inside a localized map', () => {
  const p = makeMinimalPack();
  (p.groups[0].items[0].tasks[0] as any).text = { en: 'x', ru: 123 };
  assert.throws(() => new PackValidator().parse(p), /expected string/);
});
test('PackValidator still accepts plain strings (back-compat)', () => {
  assert.doesNotThrow(() => new PackValidator().parse(makeMinimalPack()));
});
```

(If `validators.test.ts` has no minimal-pack helper, inline a valid object literal matching
the current passing tests in that file.)

- [ ] **Step 2 — run, expect fail** (the `{en,ru}` map currently trips `expected string`).

- [ ] **Step 3 — implement.** Add a predicate + schema flag:

```ts
// near isObj:
function localizedOk(v: unknown): boolean {
  if (typeof v === 'string') return true;
  if (isObj(v)) return Object.values(v).every((x) => typeof x === 'string');
  return false;
}
```

Extend `Schema` with `localized?: boolean` and handle it in `check()` right after the
undefined/null guard:

```ts
if (schema.localized) {
  if (typeof value === 'string') return;
  if (isObj(value)) {
    for (const k in value) {
      if (typeof (value as Record<string, unknown>)[k] !== 'string')
        errors.push({ path: `${path}.${k}`, msg: 'expected string' });
    }
    return;
  }
  errors.push({ path, msg: 'expected string or {lang:string} map' });
  return;
}
```

Replace `{ type: 'string', required: true }` → `{ localized: true, required: true }` for:
`TASK.text`, `RES.label`, `RES.note`, `GROUP.title`, `TRACK.label`, `PHASE.title`,
`BADGE.title`, `PACK_SCHEMA.name`. Replace optional `{ type: 'string' }` → `{ localized: true }`
for: `TASK.guidance`, `ITEM.title`, `ITEM.warmup`, `ITEM.reflectPrompt`, `BADGE.desc`.
Change `mottos`/`surprises` `of:` to `{ localized: true, required: true }`.

Relax the manual `ui` and `settings.labels` loops to use `localizedOk`:

```ts
if (isObj(ui)) for (const k in ui) if (!localizedOk(ui[k])) errors.push({ path: `ui.${k}`, msg: 'expected string or {lang:string} map' });
// ...and the same for labels[k]
```

- [ ] **Step 4 — run, expect pass** + `npm run typecheck` clean.

### Task 9: Language toggle wiring + `currentLang`

**Files:** Modify `src/adapters/dom-controller.ts`, `src/main.ts`, `index.html`.

- [ ] **Step 1 — `index.html`:** set `<html lang="en" ...>`; add a toggle to the header toolbar
(after `trophiesBtn`) and to the dock (before `dockMenuBtn`):

```html
<!-- header toolbar -->
<button class="btn ghost" id="langBtn" type="button">🌐<span id="langCode"></span></button>
<!-- dock -->
<button class="btn ghost" id="dockLangBtn" type="button">🌐<span id="dockLangCode"></span></button>
```

(Keeping the 🌐 static and the code in a child `<span>` avoids clobbering the glyph when we set
text. Alternatively set the whole button text to the code — pick one and be consistent in Step 3.)

- [ ] **Step 2 — `main.ts`:** import `SUPPORTED_LANGS` from builtins and add
`supportedLangs: SUPPORTED_LANGS,` to the `new Tracker({...})` deps.

- [ ] **Step 3 — `dom-controller.ts`:**
  - Replace both `this.r.setLang(this.t.locale())` (in `start()` and the pack `onchange`) with
    `this.r.setLang(this.t.currentLang())`.
  - In `applyStaticLabels()` add the toggle’s label (target language) + aria/tooltip:
    ```ts
    const next = this.t.langs().find((l) => l.id !== this.t.currentLang()) ?? this.t.langs()[0]!;
    this.r.setText('langCode', next.label);
    this.r.setText('dockLangCode', next.label);
    this.r.setAttr('langBtn', 'aria-label', u('language'));
    this.r.setAttr('langBtn', 'data-tip', u('language'));
    this.r.setAttr('dockLangBtn', 'aria-label', u('language'));
    this.r.setAttr('dockLangBtn', 'data-tip', u('language'));
    ```
  - In `wire()` add (mirrors the theme handler + pack-switch refresh):
    ```ts
    const switchLang = () => {
      this.closeSheets();
      const next = this.t.langs().find((l) => l.id !== this.t.currentLang()) ?? this.t.langs()[0]!;
      this.t.setLang(next.id);
      this.r.setLang(this.t.currentLang());
      this.applyStaticLabels();
      this.startMotd();
      this.renderAll();
    };
    const langBtn = this.r.$('langBtn');
    if (langBtn) (langBtn as HTMLElement).onclick = switchLang;
    const dockLangBtn = this.r.$('dockLangBtn');
    if (dockLangBtn) (dockLangBtn as HTMLElement).onclick = switchLang;
    ```
  - If grep from Task 7 Step 8 confirmed no other `.locale()` callers, delete `public locale()`
    from `tracker.ts` now.

- [ ] **Step 4 — build + typecheck + lint:** `npm run build && npm run typecheck && npm run lint`.

### Task 10: Tracker i18n tests

**Files:** Modify `test/domain/tracker.test.ts`.

- [ ] **Step 1 — add `supportedLangs: SUPPORTED_LANGS` to `buildTracker`'s deps** and import it
from builtins. Make the test `PACK` exercise both forms: give one field a `{en,ru}` map, e.g.
`title: { en: 'A', ru: 'А' }` on item `i1`, and `name: { en: 'P', ru: 'П' }`.

- [ ] **Step 2 — failing tests:**

```ts
test('todayCard resolves the active language and switching flips it', () => {
  const { t } = buildTracker({ packs: [PACK], session: { lang: 'en' } });
  assert.equal(t.todayCard().title, 'A');
  t.setLang('ru');
  assert.equal(t.todayCard().title, 'А');
});
test('setLang persists to the session', () => {
  const { t, getSession } = buildTracker({ packs: [PACK] });
  t.setLang('ru');
  assert.equal(getSession().lang, 'ru');
});
test('switching language preserves progress (same packId)', () => {
  const store = new Map<string, Progress>();
  const a = buildTracker({ packs: [PACK], store });
  a.t.setTaskDone('t1', true);                  // complete item i1
  const b = buildTracker({ packs: [PACK], store, session: { lang: 'ru' } });
  assert.equal(b.t.dashboard().overall.done, 1);  // streak/progress intact under RU
});
test('dashboard streak word pluralizes per language', () => {
  // (build a 1-day and a 5-day streak fixture; assert en "day"/"days", ru "день"/"дней")
});
```

- [ ] **Step 3 — run, expect fail; implement is already done in Task 7; expect pass.**
`node --test test/domain/tracker.test.ts`.

### Task 11: Builtins guard test

**Files:** Modify `test/domain/builtins.test.ts`.

- [ ] **Step 1 — add guard** (per the "generalize into living docs" memory — keeps a future
chrome string from shipping single-language):

```ts
import { DEFAULT_UI, GENERIC_BADGES, DEFAULT_STREAK_WORDS, SUPPORTED_LANGS } from '../../src/domain/builtins.ts';

test('every DEFAULT_UI value provides en and ru', () => {
  for (const [k, v] of Object.entries(DEFAULT_UI)) {
    assert.ok(typeof v === 'object' && 'en' in v && 'ru' in v, `ui "${k}" must have en+ru`);
  }
});
test('every generic badge title/desc provides en and ru', () => {
  for (const b of GENERIC_BADGES) {
    for (const field of ['title', 'desc'] as const) {
      const v = b[field];
      if (v == null) continue;
      assert.ok(typeof v === 'object' && 'en' in v && 'ru' in v, `badge ${b.id}.${field}`);
    }
  }
});
test('streak words exist for every supported language', () => {
  for (const { id } of SUPPORTED_LANGS) assert.ok(Array.isArray(DEFAULT_STREAK_WORDS[id]));
});
```

- [ ] **Step 2 — run, expect pass** (after Phase 3). `node --test test/domain/builtins.test.ts`.

---

# Phase 5 — Translate the dev-roadmap pack (large, review-gated)

### Task 12: Convert `data/packs/dev-roadmap.js` strings to `{ en, ru }`

**Files:** Modify `data/packs/dev-roadmap.js`. Test: `test/domain/dev-roadmap-pack.test.ts`.

**Method (consistency-first):**
- [ ] **Step 1 — glossary.** Extract recurring CS terms and pin EN↔RU translations (e.g.
сложность→complexity, куча→heap, граф→graph, динамика/ДП→DP, указатели→pointers,
разбор→breakdown). Write them at the top of this task's working notes so every group uses the
same wording.
- [ ] **Step 2 — translate group-by-group.** For each `groups[]` entry, convert every
`title`/`warmup`/`reflectPrompt`/`tasks[].text`/`tasks[].guidance`/`resources[].label`/
`resources[].note`, plus top-level `name`, `tracks[].label`, `phases[].title`, `badges[]`
title/desc, `mottos[]`, `surprises[]`, and any `ui`/`settings.labels` values to
`{ en: "<translation>", ru: "<existing>" }`. Keep genuinely language-neutral values (bare URLs,
symbols) as plain strings.
- [ ] **Step 3 — automated coverage check.** Add to `dev-roadmap-pack.test.ts`:

```ts
// Walk the pack; assert no human-text field is a bare Russian string (i.e. every
// translated field is either a {en,ru} map or an ASCII-only/neutral string).
const CYRILLIC = /[А-Яа-яЁё]/;
function assertLocalized(v, path) {
  if (v == null) return;
  if (typeof v === 'string') { assert.ok(!CYRILLIC.test(v), `${path} is bare Russian: ${v}`); return; }
  assert.ok(typeof v === 'object' && typeof v.en === 'string' && typeof v.ru === 'string', `${path} not {en,ru}`);
}
// ...iterate name, tracks[].label, phases[].title, groups[].title,
// items[].{title,warmup,reflectPrompt}, tasks[].{text,guidance}, resources[].{label,note},
// badges[].{title,desc}, mottos[], surprises[] and call assertLocalized on each.
```

- [ ] **Step 4 — validate the pack loads:** `node --test test/domain/dev-roadmap-pack.test.ts`
(it parses through `PackValidator`) → PASS. Then full `npm test`.
- [ ] **Step 5 — REVIEW GATE:** present the EN translations to the user (group by group). CS
terminology accuracy is the risk; do not consider this task done until the user signs off.

---

# Phase 6 — Docs

### Task 13: Update authoring guides + CLAUDE.md

**Files:** `docs/plugins/content-pack.md`, `docs/plugins/theme.md`, `CLAUDE.md`.

- [ ] **Step 1 — `content-pack.md`:** document `Localized = string | { en, ru, ... }`; that any
text field accepts a plain string (language-neutral) or a per-language map; EN is the fallback;
show one `{ en, ru }` example per field kind; note `mottos`/`surprises`/`ui`/`settings.labels`
values are localizable too.
- [ ] **Step 2 — `theme.md`:** one-line note — theme `name` is a fixed (English) brand string and
is NOT localized / does not change with the language toggle.
- [ ] **Step 3 — `CLAUDE.md`:** add an i18n invariant — EN is default/fallback; language is
`Session.lang`; resolution is centralized in `Tracker` via `tr()` from `src/domain/i18n.ts`
(`Localized` type in `entities.ts`); pluralization lives in `src/domain/plural.ts`; the validator
accepts string or `{lang→string}` for text fields; theme names are not localized.

---

# Phase 7 — Final verification

### Task 14: Full gate + manual smoke

- [ ] **Step 1 — build & checks:** `npm run build` then `npm run typecheck && npm test &&
npm run lint && npm run format:check`. All green; 168 prior tests + new ones pass.
- [ ] **Step 2 — staleness:** confirm `npm run build` regenerated `dist/sunrise.js`, `.map`, and
`sw.js` (the PWA staleness test in `test/pwa/pwa-shell.test.ts` must pass).
- [ ] **Step 3 — manual smoke:** open `index.html` from `file://`; verify the 🌐 toggle flips ALL
visible text (header, dashboard, today card, trophies, motd, shortcuts) between EN/RU, that the
choice persists across reload (`Session.lang`), and that progress/streaks are unchanged after a
switch.
- [ ] **Step 4 — leave everything uncommitted** in the worktree for user review (`git status`
should show the modified `src`/`dist`/`sw.js`/`index.html`/docs/pack + new files).

---

## Self-review notes

- **Spec coverage:** localized type+resolver (T1,T3), lang state+persistence (T7), chrome+badges+
  mottos translation (T6), pluralization module (T2,T7), validator (T8), toggle button (T9),
  theme-name cleanup (T6 §6 + T9 §1), full pack translation (T12), docs (T13), tests incl. guard
  (T10,T11) and progress-preservation (T10). All spec sections map to a task.
- **Naming consistency:** `tr`, `pluralIndex`, `Localized`, `DEFAULT_LANG`, `currentLang()`,
  `setLang()`, `langs()`, `supportedLangs`, `SUPPORTED_LANGS`, `DEFAULT_STREAK_WORDS` (now a
  per-lang `Record`) used identically across tasks.
- **Ordering caveat:** Task 4 (define `Localized`) must precede the first `npm run typecheck`;
  Task 8 deletes `locale()` only after Task 9 removes its callers.
