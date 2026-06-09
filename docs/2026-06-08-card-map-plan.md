# Card Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the date-based month calendar with a compact, click-to-jump **card map** of every card in the active pack, and turn export/import into icon buttons.

**Architecture:** Follows the existing 3-ring onion. Add one pure-domain query `Tracker.cardMap()` → `CardMapVM` (no new state, no schema change), a `DomRenderer.renderCardMap()` presenter, and `DomController` wiring (open / close / click-to-navigate). The calendar (`tracker.calendar()`, `CalendarVM`, `renderCalendar`, modal, button, CSS) and its now-dead deps (`defaultDow`/`defaultMonths`) are deleted. Completion timestamps, streaks, and date-based trophies are untouched.

**Tech Stack:** TypeScript (onion in `src/`), `node --test` with native `.ts` (Node ≥23.6), esbuild (`dist/sunrise.js`), typescript-eslint, prettier. Plain CSS themes. No runtime deps.

---

## Preconditions / working-tree state (read first)

- Branch: `build-tracker`. The working tree **already has uncommitted edits** to `index.html` and `README.md` (in-flight theme/plugin-doc work), plus untracked `themes/*.css`. This plan also edits `index.html` and `README.md`. Before starting, decide with the user whether to commit/stash the in-flight changes so the card-map commits stay clean. Do **not** revert that work.
- `docs/2026-06-08-card-map-design.md` (the spec) and this plan are currently uncommitted by design.
- **dist policy:** `index.html` loads `dist/sunrise.js`. Tests run against `src/*.ts` directly, so they pass **without** a build. To keep commits small, intermediate tasks do **not** rebuild `dist`; a single `npm run build` + commit happens in Task 7. The app only reflects changes after that build.
- **Commits:** the user's standing rule is "commit only when asked." Commit steps are included per convention; confirm with the user before actually committing, or batch the commits at the end.
- **DECIDED — shared-file handling:** the user chose "stage card-map hunks only." `index.html` and `README.md` already carry uncommitted in-flight work and cannot be split non-interactively (`git add -p` is unavailable in this environment). Therefore **never `git add index.html` or `git add README.md`** — make the card-map edits in them but leave them modified-and-uncommitted (the user commits them later with their theme work). Every other card-map file is committed normally. `themes/bonus.css`, `docs/FEATURES.md`, and all `src/`/`test/`/`dist/` files are clean (not part of the in-flight set) and commit normally.

## File structure (what each task touches)

| File | Responsibility | Tasks |
|---|---|---|
| `src/domain/types/view-models.ts` | Add `CardMapItemVM`/`CardMapGroupVM`/`CardMapVM`; remove `CalendarVM` | 1, 5 |
| `src/domain/tracker.ts` | Add `cardMap()` query; remove `calendar()` + calendar-only import | 1, 5 |
| `src/adapters/dom-renderer.ts` | Add `renderCardMap()`; remove `renderCalendar()` + `CalendarVM` import | 2, 5 |
| `src/adapters/dom-controller.ts` | Wire card-map button/close/backdrop/click-to-navigate; remove calendar wiring, `calOffset`, `renderCalendar()`; icon-ify export/import labels | 4 |
| `index.html` | Swap calendar button+modal for card-map; export/import glyphs | 3 |
| `themes/bonus.css` | Remove calendar CSS (surgically); add `.cm-*` styles; icon-button sizing | 3 |
| `src/domain/builtins.ts` | Add `cardMap` UI label; remove `DEFAULT_DOW`/`DEFAULT_MONTHS` | 3, 6 |
| `src/domain/types/tracker.ts` | Remove `defaultDow`/`defaultMonths` from `TrackerDeps` | 6 |
| `src/main.ts` | Drop `defaultDow`/`defaultMonths` wiring | 6 |
| `test/domain/tracker.test.ts` | Add `cardMap` test; remove calendar test; drop calendar deps | 1, 5, 6 |
| `test/adapters/dom.test.ts` | Seed card-map ids; upgrade fake `classList`; replace calendar test with card-map integration test; drop calendar deps/ids | 2, 4, 5, 6 |
| `README.md`, `docs/FEATURES.md` | Calendar → card map | 7 |
| `dist/sunrise.js`(+`.map`) | Rebuilt bundle | 7 |

---

## Task 1: Domain — `cardMap()` query + view-models

**Files:**
- Modify: `src/domain/types/view-models.ts`
- Modify: `src/domain/tracker.ts:7-16` (import block), add method near `dashboard()` (after line 287)
- Test: `test/domain/tracker.test.ts`

- [ ] **Step 1: Write the failing test**

Add at the end of `test/domain/tracker.test.ts`:

```ts
test('cardMap: groups, current flag, rest excluded from counts', () => {
  const CARD_PACK: Pack = {
    schema: 'sunrise.pack/v1',
    id: 'cm',
    name: 'CM',
    version: '1.0.0',
    tracks: [{ id: 'dsa', label: 'DSA' }],
    groups: [
      {
        id: 'g1',
        title: 'Week 1',
        items: [
          { id: 'a1', track: 'dsa', title: 'A1', tasks: [{ id: 't1', text: 'x' }] },
          { id: 'rest1', track: 'dsa', rest: true },
        ],
      },
      {
        id: 'g2',
        title: 'Week 2',
        items: [{ id: 'b1', track: 'dsa', title: 'B1', tasks: [{ id: 't2', text: 'y' }] }],
      },
    ],
  };
  const store = new Map<string, Progress>();
  const progressStore: ProgressStore = {
    load: (id) => store.get(id) ?? Progress.empty(),
    save: (id, p) => void store.set(id, p),
  };
  let session: Session = {};
  const sessionStore: SessionStore = { load: () => session, save: (s) => void (session = s) };
  const packs: PackSource = { packs: () => [CARD_PACK] };
  const themes: ThemeSource = { themes: () => [THEME] };
  const clock: Clock = { today: () => '2026-05-30', hour: () => 14 };
  const random: Random = { next: () => 0.99 };
  const t = new Tracker({
    packs,
    themes,
    progressStore,
    sessionStore,
    clock,
    random,
    streaks: new Streaks(),
    stats: new ProgressStats(),
    reviews: new ReviewSchedule(),
    badges: new BadgeEngine(new Streaks(), new ProgressStats()),
    defaultUi: DEFAULT_UI,
    genericBadges: GENERIC_BADGES,
    defaultDow: DEFAULT_DOW,
    defaultStreakWords: DEFAULT_STREAK_WORDS,
    defaultMonths: DEFAULT_MONTHS,
    defaultMottos: DEFAULT_MOTTOS,
  });
  t.init();

  let vm = t.cardMap();
  assert.equal(vm.groups.length, 2);
  assert.equal(vm.groups[0]!.title, 'Week 1');
  assert.equal(vm.groups[0]!.items.length, 2);
  assert.equal(vm.total, 2, 'rest excluded from total'); // a1, b1
  assert.equal(vm.done, 0);
  assert.equal(vm.groups[0]!.items[0]!.id, 'a1');
  assert.equal(vm.groups[0]!.items[0]!.current, true, 'a1 is the default current item');
  assert.equal(vm.groups[0]!.items[1]!.rest, true, 'rest flagged');

  t.toggleTask('t1', true); // completes a1 (the current item)
  vm = t.cardMap();
  assert.equal(vm.done, 1);
  assert.equal(vm.groups[0]!.items[0]!.done, true);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/domain/tracker.test.ts`
Expected: FAIL — TypeScript error `Property 'cardMap' does not exist on type 'Tracker'`.

- [ ] **Step 3: Add the view-model types**

In `src/domain/types/view-models.ts`, add after the `CalendarVM` interface (after line 45):

```ts
export interface CardMapItemVM {
  id: string;
  title: string;
  done: boolean;
  rest: boolean;
  current: boolean;
}
export interface CardMapGroupVM {
  id: string;
  title: string;
  items: CardMapItemVM[];
}
export interface CardMapVM {
  done: number;
  total: number;
  groups: CardMapGroupVM[];
}
```

- [ ] **Step 4: Implement `cardMap()` in the Tracker**

In `src/domain/tracker.ts`, add `CardMapVM` to the type import block (lines 7-16):

```ts
import type {
  TodayVM,
  DashboardVM,
  CalendarVM,
  CardMapVM,
  TrophyVM,
  SelectorsVM,
  CompleteResult,
  TrackColor,
  TaskVM,
} from './types/view-models.ts';
```

Then add this method immediately after `dashboard()` (after line 287, before `calendar()`):

```ts
  public cardMap(): CardMapVM {
    let done = 0;
    let total = 0;
    const groups = this.pack.groups.map((g) => ({
      id: g.id,
      title: g.title,
      items: g.items.map((it) => {
        const rest = !!it.rest;
        const isDone = this.progress.isItemComplete(it);
        if (!rest) {
          total++;
          if (isDone) done++;
        }
        return {
          id: it.id,
          title: it.title ?? '',
          done: isDone,
          rest,
          current: it.id === this.currentItemId,
        };
      }),
    }));
    return { done, total, groups };
  }
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `node --test test/domain/tracker.test.ts`
Expected: PASS (all tests, including the new `cardMap:` test).

- [ ] **Step 6: Typecheck and commit**

```bash
npm run typecheck
git add src/domain/types/view-models.ts src/domain/tracker.ts test/domain/tracker.test.ts
git commit -m "feat(domain): add cardMap() query + CardMapVM"
```

---

## Task 2: Renderer — `renderCardMap()`

**Files:**
- Modify: `src/adapters/dom-renderer.ts:1-8` (import), add method after `renderCalendar()` (after line 190)
- Test: `test/adapters/dom.test.ts` (seed ids + new test)

- [ ] **Step 1: Seed the card-map ids in the harness**

In `test/adapters/dom.test.ts`, in the `STATIC_IDS` array (lines 113-144), add these two entries (after `'calGrid',`):

```ts
    'cardMapGrid',
    'cardMapTitle',
```

- [ ] **Step 2: Write the failing renderer test**

Add at the end of `test/adapters/dom.test.ts`:

```ts
test('renderCardMap renders rows + cells with data-id', async () => {
  const { registry, tracker, renderer } = await boot();
  renderer.renderCardMap(tracker.cardMap(), 'Map');
  const html = registry['cardMapGrid']!.innerHTML || '';
  assert.ok(html.includes('cm-card'), 'cells render: ' + html.slice(0, 80));
  assert.ok(html.includes('data-id="'), 'cells carry data-id');
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `node --test test/adapters/dom.test.ts`
Expected: FAIL — `Property 'renderCardMap' does not exist on type 'DomRenderer'`.

- [ ] **Step 4: Implement `renderCardMap()`**

In `src/adapters/dom-renderer.ts`, add `CardMapVM` to the import block (lines 1-8):

```ts
import type {
  SelectorsVM,
  TodayVM,
  DashboardVM,
  CalendarVM,
  CardMapVM,
  TrophyVM,
  TrackColor,
} from '../domain/types/view-models.ts';
```

Then add this method after `renderCalendar()` (after line 190):

```ts
  // ----- card map ------------------------------------------------------------

  public renderCardMap(vm: CardMapVM, titleLabel: string): void {
    const host = this.$('cardMapGrid');
    if (!host) return;
    const title = this.$('cardMapTitle');
    if (title) title.textContent = `${titleLabel} · ${vm.done}/${vm.total}`;
    host.innerHTML = vm.groups
      .map(
        (g) =>
          `<div class="cm-row"><span class="cm-rlabel">${this.esc(g.title)}</span>` +
          `<div class="cm-cells">` +
          g.items
            .map((it) => {
              let cls = 'cm-card';
              if (it.rest) cls += ' rest';
              else if (it.done) cls += ' done';
              if (it.current) cls += ' current';
              const tip = it.title ? ` data-tip="${this.esc(it.title)}"` : '';
              return `<span class="${cls}" data-id="${this.esc(it.id)}"${tip}></span>`;
            })
            .join('') +
          `</div></div>`,
      )
      .join('');
  }
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `node --test test/adapters/dom.test.ts`
Expected: PASS (all tests, including the new renderer test).

- [ ] **Step 6: Typecheck and commit**

```bash
npm run typecheck
git add src/adapters/dom-renderer.ts test/adapters/dom.test.ts
git commit -m "feat(adapters): DomRenderer.renderCardMap()"
```

---

## Task 3: Markup, styles, label (presentation layer — no automated test)

This task adds the runtime DOM hooks, the default-theme CSS, and the UI label. It is verified by build + manual check (Task 7); the wiring it feeds is tested in Task 4.

**Files:**
- Modify: `index.html:26`, `index.html:28-29`, `index.html:46-52`
- Modify: `themes/bonus.css:217`, `themes/bonus.css:826-907`, `themes/bonus.css:910`
- Modify: `src/domain/builtins.ts:13` (add label)

- [ ] **Step 1: Swap the toolbar button + give export/import glyphs**

In `index.html`, replace the calendar button (line 26) and the empty export/import buttons (lines 28-29):

```html
    <button class="btn ghost" id="cardMapBtn" type="button">🗺️</button>
    <button class="btn ghost" id="trophiesBtn" type="button">🏆</button>
    <button class="btn ghost" id="exportBtn" type="button">📤</button>
    <button class="btn ghost" id="importBtn" type="button">📥</button>
```

(The `#trophiesBtn` line is unchanged — shown for placement.)

- [ ] **Step 2: Swap the calendar modal for the card-map modal**

In `index.html`, replace the whole `#calModal` block (lines 46-52) with:

```html
<div class="modal" id="cardMapModal" role="dialog" aria-modal="true" aria-labelledby="cardMapTitle">
  <div class="modal-panel cardmap-panel">
    <div class="tr-head"><div id="cardMapTitle"></div><button id="cardMapClose" type="button">✕</button></div>
    <div class="cm-grid" id="cardMapGrid"></div>
  </div>
</div>
```

(Reusing `.tr-head` so the title/close styling carries over with no extra CSS.)

- [ ] **Step 3: Add the `cardMap` UI label**

In `src/domain/builtins.ts`, in `DEFAULT_UI`, add a line after `calendar: 'Календарь',` (line 13):

```ts
  cardMap: 'Карта прогресса',
```

- [ ] **Step 4: Update icon-button sizing in the default theme**

In `themes/bonus.css`, replace line 217:

```css
#cardMapBtn, #trophiesBtn, #exportBtn, #importBtn{ font-size:16px; padding:8px 11px; }
```

- [ ] **Step 5: Surgically remove calendar CSS, preserving shared trophies rules**

In `themes/bonus.css`, the calendar block (lines 826-907) shares selectors with the trophies head. Make these exact edits:

- Replace `.cal-head, .tr-head{` (line 827) with `.tr-head{`
- Delete the rule `.cal-head{ justify-content:space-between; }` (line 833)
- Delete the rule `.cal-head > div, #calTitle{ ... }` (lines 834-840)
- Replace `.cal-head button,\n.tr-head button{` (lines 841-842) with `.tr-head button{`
- Replace `.cal-head button:hover,\n.tr-head button:hover{` (lines 856-857) with `.tr-head button:hover{`
- Replace `#calClose, #trophiesClose{ background:var(--alarm); color:var(--paper); }` (line 858) with `#cardMapClose, #trophiesClose{ background:var(--alarm); color:var(--paper); }`
- Replace `#calClose:hover, #trophiesClose:hover{ background:var(--ink); }` (line 859) with `#cardMapClose:hover, #trophiesClose:hover{ background:var(--ink); }`
- Delete the rules `.cal-dow{ ... }`, `.cal-dow span{ ... }`, `.cal-grid{ ... }`, `.cday{ ... }`, `.cday.other{ ... }`, `.cday.done{ ... }`, `.cday.today{ ... }`, `.cday.done.today{ ... }` (lines 861-907 — the entire remainder of the calendar block)
- Also change the comment `/* --- Calendar --- */` (line 826) to `/* --- Modal heads (shared) --- */`

- [ ] **Step 6: Let the card-map title reuse the trophies-title rule**

In `themes/bonus.css`, replace the `#trophiesTitle{` selector (line 910) with:

```css
#trophiesTitle, #cardMapTitle{
```

- [ ] **Step 7: Add the card-map grid styles**

In `themes/bonus.css`, add this block immediately before the `/* --- Trophies --- */` comment (line 909):

```css
/* --- Card map --- */
.cm-grid{ display:flex; flex-direction:column; gap:12px; }
.cm-row{ display:flex; flex-direction:column; gap:6px; }
.cm-rlabel{
  font-family:var(--mono);
  font-weight:700;
  font-size:11px;
  text-transform:uppercase;
  letter-spacing:.08em;
  color:#6b6353;
}
.cm-cells{ display:flex; flex-wrap:wrap; gap:6px; }
.cm-card{
  position:relative;
  width:24px; height:24px;
  border:2px solid var(--ink);
  border-radius:6px;
  background:var(--paper-2);
  cursor:pointer;
  transition:transform .08s ease, box-shadow .08s ease;
}
.cm-card:hover{ transform:translate(-2px,-2px); box-shadow:3px 3px 0 var(--ink); z-index:2; }
.cm-card.done{ background:var(--cobalt); box-shadow:2px 2px 0 var(--ink); }
.cm-card.rest{ border-style:dashed; background:transparent; opacity:.5; cursor:default; }
.cm-card.current{ outline:3px solid var(--yellow); outline-offset:2px; }
.cm-card[data-tip]:hover::after{
  content:attr(data-tip);
  position:absolute;
  bottom:calc(100% + 10px);
  left:50%;
  transform:translateX(-50%);
  width:max-content;
  max-width:220px;
  font-family:var(--body);
  font-weight:600;
  font-size:12px;
  line-height:1.35;
  text-align:left;
  color:var(--paper);
  background:var(--ink);
  border:var(--bw) solid var(--ink);
  border-radius:var(--r);
  padding:8px 11px;
  box-shadow:var(--shadow-sm);
  z-index:5;
  pointer-events:none;
  white-space:normal;
}
```

- [ ] **Step 8: Verify nothing broke and commit**

Run: `npm test` (tests don't read `index.html`/CSS, so they must still pass)
Expected: PASS (all existing + Task 1/2 tests).

```bash
# NOTE: do NOT stage index.html — leave its card-map edits uncommitted alongside the user's in-flight work.
git add themes/bonus.css src/domain/builtins.ts
git commit -m "feat(ui): card-map styles + cardMap label"
```

---

## Task 4: Controller — wire the card map, retire calendar wiring

**Files:**
- Modify: `src/adapters/dom-controller.ts` (constructor field, `applyStaticLabels`, `renderCalendar`→`renderCardMap`, `wire()`)
- Modify: `test/adapters/dom.test.ts` (upgrade `classList`, swap STATIC_IDS, replace the calendar test)

- [ ] **Step 1: Upgrade the fake-DOM `classList` to track classes**

In `test/adapters/dom.test.ts`, replace the `classList` field in `FakeEl` (lines 46-53):

```ts
  classList = (() => {
    const s = new Set<string>();
    return {
      add: (c: string): void => void s.add(c),
      remove: (c: string): void => void s.delete(c),
      toggle: (c: string): void => void (s.has(c) ? s.delete(c) : s.add(c)),
      contains: (c: string): boolean => s.has(c),
    };
  })();
```

- [ ] **Step 2: Swap calendar ids for card-map ids in STATIC_IDS**

In `test/adapters/dom.test.ts`, in `STATIC_IDS`: remove the eight calendar entries (`'calBtn'`, `'calModal'`, `'calPrev'`, `'calTitle'`, `'calNext'`, `'calClose'`, `'calDow'`, `'calGrid'`). Keep `'cardMapGrid'`/`'cardMapTitle'` (added in Task 2) and add:

```ts
    'cardMapBtn',
    'cardMapModal',
    'cardMapClose',
```

- [ ] **Step 3: Replace the calendar integration test with the card-map one**

In `test/adapters/dom.test.ts`, replace the `'calendar renders cday cells'` test (lines 257-261) with:

```ts
test('card map: opens, renders cards, click navigates + closes modal', async () => {
  const { registry, tracker } = await boot();
  registry['cardMapBtn']!.onclick!();
  const grid = registry['cardMapGrid']!;
  assert.ok((grid.innerHTML || '').includes('cm-card'), 'cards rendered');

  const ids = tracker.cardMap().groups.flatMap((g) => g.items.map((i) => i.id));
  const currentId = tracker.todayCard().itemId;
  const targetId = ids.find((id) => id !== currentId)!;

  grid.onclick!({ target: { dataset: { id: targetId } } });
  assert.equal(tracker.todayCard().itemId, targetId, 'navigated to clicked card');
  assert.equal(
    registry['cardMapModal']!.classList.contains('open'),
    false,
    'modal closed on navigate',
  );
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `node --test test/adapters/dom.test.ts`
Expected: FAIL — `registry['cardMapBtn']` is undefined / `onclick` is null (no wiring yet), so the test throws.

- [ ] **Step 5: Remove `calOffset` and the controller's `renderCalendar()`**

In `src/adapters/dom-controller.ts`: delete the field `private calOffset = 0;` (line 16). Replace the `renderCalendar()` method (lines 103-105):

```ts
  private renderCardMap(): void {
    this.r.renderCardMap(this.t.cardMap(), this.t.ui('cardMap'));
  }
```

- [ ] **Step 6: Icon-ify export/import labels + fix the calendar aria entry**

In `src/adapters/dom-controller.ts`, in `applyStaticLabels()`: delete the two lines (61-62):

```ts
    this.r.setText('exportBtn', u('export'));
    this.r.setText('importBtn', u('import'));
```

and in the `aria` array (lines 63-70) replace `['calBtn', 'calendar'],` with:

```ts
      ['cardMapBtn', 'cardMap'],
```

- [ ] **Step 7: Replace the calendar wiring with card-map wiring**

In `src/adapters/dom-controller.ts`, replace the whole calendar wiring block in `wire()` (lines 199-222 — from `const calBtn = this.r.$('calBtn');` through `this.bindBackdrop('calModal');`) with:

```ts
    const cardMapBtn = this.r.$('cardMapBtn');
    if (cardMapBtn) {
      (cardMapBtn as HTMLElement).onclick = () => {
        this.renderCardMap();
        this.open('cardMapModal');
      };
    }
    this.bindClose('cardMapClose', 'cardMapModal');
    this.bindBackdrop('cardMapModal');
    const cardMapGrid = this.r.$('cardMapGrid');
    if (cardMapGrid) {
      (cardMapGrid as HTMLElement).onclick = (e) => {
        const id = (e.target as HTMLElement).dataset?.id;
        if (!id) return;
        this.t.selectItem(id);
        const m = this.r.$('cardMapModal');
        if (m) m.classList.remove('open');
        this.renderAll();
      };
    }
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `node --test test/adapters/dom.test.ts`
Expected: PASS (all tests, including the new card-map integration test).

- [ ] **Step 9: Typecheck and commit**

```bash
npm run typecheck
git add src/adapters/dom-controller.ts test/adapters/dom.test.ts
git commit -m "feat(adapters): wire card map (open/close/click-to-jump); icon-ify export/import"
```

---

## Task 5: Delete the now-orphaned calendar code

After Task 4 nothing calls `tracker.calendar()` or `renderCalendar()`. Remove them and the calendar-only import + type.

**Files:**
- Modify: `src/domain/tracker.ts` (remove import line + `calendar()` + `CalendarVM` from type import)
- Modify: `src/adapters/dom-renderer.ts` (remove `renderCalendar()` + `CalendarVM` import)
- Modify: `src/domain/types/view-models.ts` (remove `CalendarVM`)
- Modify: `test/domain/tracker.test.ts` (remove the calendar shape test)

- [ ] **Step 1: Remove the calendar test**

In `test/domain/tracker.test.ts`, delete the `'calendar shape: 42 cells, non-empty title, today flagged'` test (lines 105-112).

- [ ] **Step 2: Remove `tracker.calendar()` and its calendar-only import**

In `src/domain/tracker.ts`: delete the import line `import { addDays, weekdayMon } from './dates.ts';` (line 6). Remove `CalendarVM,` from the view-models type import (line 10). Delete the entire `calendar(monthOffset: number)` method (lines 289-321).

- [ ] **Step 3: Remove `renderCalendar()` and its `CalendarVM` import**

In `src/adapters/dom-renderer.ts`: remove `CalendarVM,` from the import block (line 5). Delete the `renderCalendar(vm: CalendarVM)` method and its `// ----- calendar -----` comment (lines 172-190).

- [ ] **Step 4: Remove the `CalendarVM` interface**

In `src/domain/types/view-models.ts`, delete the `CalendarVM` interface (lines 41-45).

- [ ] **Step 5: Typecheck + full test run**

Run: `npm run typecheck && npm test`
Expected: PASS, with **no** "unused import" or "Cannot find name 'CalendarVM'" errors anywhere.

- [ ] **Step 6: Commit**

```bash
git add src/domain/tracker.ts src/adapters/dom-renderer.ts src/domain/types/view-models.ts test/domain/tracker.test.ts
git commit -m "refactor: delete calendar query/renderer/VM (replaced by card map)"
```

---

## Task 6: Delete the calendar-only deps (`defaultDow`/`defaultMonths`)

These deps + their builtins are now unused (only `calendar()` read them). Remove them everywhere.

**Files:**
- Modify: `src/domain/types/tracker.ts:28,30`
- Modify: `src/main.ts:7,37`
- Modify: `src/domain/builtins.ts:43-58`
- Modify: `test/domain/tracker.test.ts` (import + 3 construction sites)
- Modify: `test/adapters/dom.test.ts` (import + 1 construction site)

- [ ] **Step 1: Remove from the `TrackerDeps` interface**

In `src/domain/types/tracker.ts`, delete the two lines `defaultDow: readonly string[];` (line 28) and `defaultMonths: readonly string[];` (line 30).

- [ ] **Step 2: Remove from the composition root**

In `src/main.ts`: in the builtins import (line 7) remove `DEFAULT_DOW,` and `DEFAULT_MONTHS,`. In the deps object (line 37) remove `defaultDow: DEFAULT_DOW,` and `defaultMonths: DEFAULT_MONTHS,`.

- [ ] **Step 3: Remove the now-unused builtins**

In `src/domain/builtins.ts`, delete the `DEFAULT_DOW` export (line 43) and the `DEFAULT_MONTHS` export (lines 45-58).

- [ ] **Step 4: Remove from `test/domain/tracker.test.ts`**

Remove `DEFAULT_DOW,` and `DEFAULT_MONTHS,` from the builtins import (lines 21,23). Remove the lines `defaultDow: DEFAULT_DOW,` and `defaultMonths: DEFAULT_MONTHS,` from all three Tracker constructions — including the one in the `cardMap` test added in Task 1 (search for every `defaultDow:` / `defaultMonths:` occurrence and delete those lines).

- [ ] **Step 5: Remove from `test/adapters/dom.test.ts`**

Remove `DEFAULT_DOW,` and `DEFAULT_MONTHS,` from the builtins import (lines 10,12). Remove `defaultDow: DEFAULT_DOW,` and `defaultMonths: DEFAULT_MONTHS,` from the harness Tracker construction (lines 192,194).

- [ ] **Step 6: Typecheck + full test run**

Run: `npm run typecheck && npm test`
Expected: PASS — no "Property 'defaultDow' is missing" or unused-symbol errors.

- [ ] **Step 7: Commit**

```bash
git add src/domain/types/tracker.ts src/main.ts src/domain/builtins.ts test/domain/tracker.test.ts test/adapters/dom.test.ts
git commit -m "refactor: drop calendar-only deps (defaultDow/defaultMonths)"
```

---

## Task 7: Build, docs, full verification

**Files:**
- Modify: `README.md:3`, `README.md:22`
- Modify: `docs/FEATURES.md` (the Calendar bullet)
- Rebuild: `dist/sunrise.js`, `dist/sunrise.js.map`

- [ ] **Step 1: Update README calendar references**

In `README.md`, replace on line 3:

`with streaks, trophies, and a calendar to keep momentum.`
→ `with streaks, trophies, and a progress map to keep momentum.`

and replace the bullet on line 22:

`- **Streaks & calendar** — current/longest streak (UTC), plus a month calendar marking completed days.`
→ `- **Streaks & card map** — current/longest streak (UTC), plus a card map of the whole pack marking which cards are done.`

(Leave the "5 themes" line and theme list alone — that's the separate in-flight theme effort.)

- [ ] **Step 2: Update FEATURES calendar bullet**

In `docs/FEATURES.md`, replace the Calendar bullet (in "## Momentum & gamification"):

`- **Calendar** — a month grid marking every completed day, with prev/next month navigation.`
→ `- **Card map** — a compact grid of every card in the pack, grouped by week, marking which are done vs not; click a card to jump straight to it.`

- [ ] **Step 3: Rebuild the bundle**

Run: `npm run build`
Expected: esbuild writes `dist/sunrise.js` (+ `.map`) with no errors.

- [ ] **Step 4: Full verification gate**

Run: `npm run typecheck && npm run lint && npm test`
Expected: typecheck clean, lint clean, all tests PASS.

- [ ] **Step 5: Manual smoke check**

Open `index.html` in a browser (`open index.html`). Confirm: 🗺️ opens the card-map modal with week rows of squares (done = filled, current = outlined, rest = dashed/dim), the title shows `Карта прогресса · done/total`, hovering a square shows its title, clicking a square jumps to that card and closes the modal; 📤 downloads progress JSON and 📥 opens the file picker. No 📅 button remains.

- [ ] **Step 6: Commit**

```bash
# NOTE: do NOT stage README.md — leave its card-map edits uncommitted alongside the user's in-flight work.
git add docs/FEATURES.md dist/sunrise.js dist/sunrise.js.map
git commit -m "build: rebuild bundle; docs(FEATURES): calendar → card map"
```

---

## Self-review

**Spec coverage** (each spec section → task):
- Card map UX (grid, rows-by-group, done/not-done, current outline, rest neutral+excluded, done/total count, hover title, click-to-jump+close) → Tasks 1 (counts/rest/current), 2 (rows/cells/tooltip/title), 4 (open/click/close).
- Domain `cardMap()` + `CardMapVM`, no schema change → Task 1.
- Renderer `renderCardMap` with `data-id`/`data-tip` → Task 2.
- Controller wiring incl. first close-on-navigate → Task 4.
- HTML modal/button swap → Task 3.
- Export/import icons (drop labels, keep aria) → Tasks 3 (glyphs) + 4 (drop `setText`, keep aria).
- Delete-don't-contort calendar (renderer/query/VM/modal/button/CSS) → Tasks 3 (markup/CSS), 4 (wiring), 5 (query/renderer/VM).
- Preserved streaks/timestamps/trophies → untouched (no task edits `progress.ts`/`streaks.ts`/`badge-engine.ts`).
- Theme strategy: default theme styled (Task 3); other 14 themes inherit the generic `.modal`/`.modal-panel` and remain functional; their dead calendar CSS + polish are explicit follow-ups (not in this plan).
- Docs updated → Task 7.
- Tests (domain `cardMap`, DOM render + click-navigate) → Tasks 1, 2, 4.

**Placeholder scan:** none — every code/edit step shows concrete content; no "TBD/TODO/handle edge cases".

**Type consistency:** `CardMapVM`/`CardMapGroupVM`/`CardMapItemVM` field names (`done`, `total`, `groups`, `id`, `title`, `items`, `rest`, `current`) are identical in the type def (T1), the `cardMap()` return (T1), the renderer consumer (T2), and the tests (T1, T4). `renderCardMap(vm, titleLabel)` signature matches its caller `this.r.renderCardMap(this.t.cardMap(), this.t.ui('cardMap'))` (T4). DOM ids (`cardMapBtn`/`cardMapModal`/`cardMapGrid`/`cardMapTitle`/`cardMapClose`) are consistent across `index.html` (T3), STATIC_IDS (T2/T4), renderer (`cardMapGrid`/`cardMapTitle`, T2), and controller (T4).

**Note on `dataset?.id` (T4):** in a real browser `(e.target as HTMLElement).dataset.id` reads the cell's `data-id` (cells are leaf `<span>`s, so `e.target` is the cell). The fake-DOM test passes a synthetic `{ target: { dataset: { id } } }`, exercising the same path.
