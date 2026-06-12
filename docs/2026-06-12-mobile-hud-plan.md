# Mobile HUD (App-Level, All Themes) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On screens ≤ 640px every theme renders as a game-HUD: one-line header, hero today-card, and a bottom dock (streak + progress micro-bars, 🗺️ 🏆 ☰), with the toolbar and dashboard relocated into tap-toggled bottom sheets — per `docs/2026-06-12-mobile-hud-design.md`.

**Architecture:** A tiny `mobile-mode` adapter toggles `data-mobile` on `<html>` via `matchMedia`; all mobile layout lives in one `[data-mobile]`-scoped baseline CSS block in `index.html` (scoped `!important` beats theme id-selectors); `DomRenderer.renderDashboard` additionally fills the dock bars; `DomController` wires dock buttons, sheet toggling, and swipe day-nav. The 17 themes lose their phone-range `@media` blocks (deletions only); a file-content guard test keeps them out forever.

**Tech Stack:** TypeScript (strict, `.ts` imports), esbuild IIFE bundle (committed `dist/`), `node --test` with the FakeEl harness in `test/adapters/dom.test.ts`, zero runtime dependencies.

---

**Conventions for every task:**
- Run single test files as `node --test test/adapters/dom.test.ts` (add `--test-name-pattern='<regex>'` for one case).
- **Any commit that touches `src/` must run `npm run build` first and include `dist/sunrise.js` + `dist/sunrise.js.map`** — `test/build/dist-sync.test.ts` fails otherwise.
- Commit with the exact pathspecs shown; the repo may contain other in-flight files that must not be swept in.
- All code below matches the existing idioms: `this.r.$(id)` lookups, `el.onclick = ...` property assignment (testable via FakeEl), `:root[data-theme=...]`-scoped theme CSS.

### Task 0: Baseline verification

**Files:** none (read-only)

- [ ] **Step 0.1:** `git status --porcelain` — expect **empty output** (the pre-existing WIP must be committed before execution; if it is not, STOP and ask the user).
- [ ] **Step 0.2:** Run `npm run typecheck && npm test` — expect 0 TS errors and `fail 0` (146+ tests pass).

### Task 1: Amend the spec's cleanup rule (≤ 640px → < 900px)

The real per-theme squeezes sit at 480–720px (inventory below); the spec's "≤ 640" rule would leave most of them fighting the HUD. Tablet refinements at 900/980/1000px stay.

**Files:**
- Modify: `docs/2026-06-12-mobile-hud-design.md`

- [ ] **Step 1.1:** In §2 row "The 17 existing themes", replace
  `**Delete their phone-squeeze `@media` blocks** (max-width ≤ 640px — the HUD's range). Tablet refinements above 640px may stay.`
  with
  `**Delete their phone-squeeze `@media` blocks** (every block with max-width < 900px — the observed squeezes sit at 480–720px). Tablet refinements at ≥ 900px may stay.`
- [ ] **Step 1.2:** In §4 "Cleanup", replace `targeting the phone range (max-width ≤ 640px)` with `with max-width < 900px (the observed phone squeezes: 480–720px)`, and replace `(e.g. a 900px two-column fallback)` with `(at ≥ 900px, e.g. japanese's 900px two-column fallback)`.
- [ ] **Step 1.3:** In §5 guard-test bullet, replace `(regex on `max-width` ≤ 640px)` with `(any `max-width` value below 900px)`.
- [ ] **Step 1.4:** Commit:
```bash
git commit -m "docs(spec): phone-range cleanup rule is max-width<900px (matches real theme inventory)" docs/2026-06-12-mobile-hud-design.md
```

### Task 2: `mobile-mode` adapter (matchMedia → `data-mobile`)

**Files:**
- Create: `src/adapters/mobile-mode.ts`
- Modify: `src/main.ts` (after the `window.SUNRISE` block, ~line 35)
- Test: `test/adapters/mobile-mode.test.ts`

- [ ] **Step 2.1: Write the failing test**

```ts
// test/adapters/mobile-mode.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { watchMobileMode, MOBILE_BREAKPOINT_PX } from '../../src/adapters/mobile-mode.ts';

function fakes(initialMatches: boolean) {
  let listener: ((e: { matches: boolean }) => void) | null = null;
  let query = '';
  const matchMedia = (q: string) => {
    query = q;
    return {
      matches: initialMatches,
      addEventListener: (_t: 'change', cb: (e: { matches: boolean }) => void): void => {
        listener = cb;
      },
    };
  };
  const attrs: Record<string, string> = {};
  const root = {
    setAttribute: (n: string, v: string): void => {
      attrs[n] = v;
    },
    removeAttribute: (n: string): void => {
      delete attrs[n];
    },
  };
  return { matchMedia, root, attrs, fire: (m: boolean) => listener!({ matches: m }), q: () => query };
}

test('narrow at boot sets data-mobile; query embeds the breakpoint', () => {
  const f = fakes(true);
  watchMobileMode(f.matchMedia, f.root);
  assert.equal(f.attrs['data-mobile'], '1');
  assert.equal(f.q(), `(max-width: ${MOBILE_BREAKPOINT_PX}px)`);
});

test('wide at boot leaves the attribute off', () => {
  const f = fakes(false);
  watchMobileMode(f.matchMedia, f.root);
  assert.equal('data-mobile' in f.attrs, false);
});

test('live change toggles the attribute both ways', () => {
  const f = fakes(false);
  watchMobileMode(f.matchMedia, f.root);
  f.fire(true);
  assert.equal(f.attrs['data-mobile'], '1');
  f.fire(false);
  assert.equal('data-mobile' in f.attrs, false);
});
```

- [ ] **Step 2.2:** Run `node --test test/adapters/mobile-mode.test.ts` — expect FAIL (`Cannot find module … mobile-mode.ts`).
- [ ] **Step 2.3: Implement**

```ts
// src/adapters/mobile-mode.ts
// Mobile is a MODE, not a theme: ≤ breakpoint the <html data-mobile> attribute
// turns on the HUD baseline block in index.html. The breakpoint lives only here.
export const MOBILE_BREAKPOINT_PX = 640;

interface MediaQueryLike {
  matches: boolean;
  addEventListener(type: 'change', cb: (e: { matches: boolean }) => void): void;
}
interface RootLike {
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
}

export function watchMobileMode(matchMedia: (q: string) => MediaQueryLike, root: RootLike): void {
  const mq = matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`);
  const apply = (m: boolean): void => {
    if (m) root.setAttribute('data-mobile', '1');
    else root.removeAttribute('data-mobile');
  };
  apply(mq.matches);
  mq.addEventListener('change', (e) => apply(e.matches));
}
```

- [ ] **Step 2.4:** Run `node --test test/adapters/mobile-mode.test.ts` — expect 3 PASS.
- [ ] **Step 2.5: Wire into `src/main.ts`** — add to the imports:

```ts
import { watchMobileMode } from './adapters/mobile-mode.ts';
```

and directly after the `window.SUNRISE = { … };` statement (before `function boot()`), so the attribute is set before first paint:

```ts
watchMobileMode((q) => window.matchMedia(q), document.documentElement);
```

- [ ] **Step 2.6:** `npm run typecheck && npm run build && npm test` — expect clean, all pass.
- [ ] **Step 2.7:** Commit:
```bash
git commit -m "feat(mobile): data-mobile attr via matchMedia (one breakpoint constant)" src/adapters/mobile-mode.ts src/main.ts test/adapters/mobile-mode.test.ts dist/sunrise.js dist/sunrise.js.map
```

### Task 3: Dock markup + the `[data-mobile]` HUD baseline CSS

Pure `index.html` change — no rebuild needed. The CSS is the heart of the feature; `!important` is deliberate (themes style `#dashboard`/`#todayCard` by id and would win otherwise — see spec §2).

**Files:**
- Modify: `index.html`

- [ ] **Step 3.1:** In the `<meta name="viewport">` tag (line 5), change content to `width=device-width, initial-scale=1, viewport-fit=cover` (enables `env(safe-area-inset-bottom)` on notched phones).
- [ ] **Step 3.2:** Give the toolbar an id — line 49: `<div class="toolbar">` → `<div class="toolbar" id="toolbar">`.
- [ ] **Step 3.3:** Add the dock markup directly after the `<div class="foot">…</div>` line:

```html
<nav id="dock" aria-label="HUD">
  <button class="dock-bars" id="dockBars" type="button">
    <span class="dock-bar" data-kind="streak"><i class="dock-bar-fill" id="dockStreakFill"></i><span class="dock-bar-val" id="dockStreakVal"></span></span>
    <span class="dock-bar" data-kind="progress"><i class="dock-bar-fill" id="dockProgressFill"></i><span class="dock-bar-val" id="dockProgressVal"></span></span>
  </button>
  <button class="btn ghost" id="dockMapBtn" type="button">🗺️</button>
  <button class="btn ghost" id="dockTrophiesBtn" type="button">🏆</button>
  <button class="btn ghost" id="dockMenuBtn" type="button">☰</button>
</nav>
```

- [ ] **Step 3.4:** Append to the inline `<style>` (after the focus-ring rule), exactly:

```css
/* ===== mobile HUD — mechanism + token-tinted appearance. Hidden until main.ts
   sets <html data-mobile> (≤640px). !important beats themes' id-based desktop
   rules; a theme overrides mobile by matching these selectors under
   [data-mobile] (its file loads later, so equal specificity wins). ===== */
#dock{display:none}
#dock .dock-bars{flex:1;display:flex;flex-direction:column;gap:4px;background:none;border:0;padding:0;cursor:pointer;min-width:0}
#dock .dock-bar{position:relative;display:block;height:12px;border:2px solid var(--ink,#222);border-radius:var(--r,6px);background:var(--paper,#fff);overflow:hidden}
#dock .dock-bar-fill{display:block;height:100%;width:0;background:var(--accent,#f6c343)}
#dock .dock-bar[data-kind="progress"] .dock-bar-fill{background:var(--cobalt,#2b6cb0)}
#dock .dock-bar-val{position:absolute;right:5px;top:50%;transform:translateY(-50%);font:700 8px ui-monospace,SFMono-Regular,monospace;line-height:1;color:var(--ink,#222);letter-spacing:.04em}
#dock>.btn{flex:0 0 auto;font-size:16px;padding:7px 10px}
:root[data-mobile] #dock{display:flex!important;position:fixed!important;left:0!important;right:0!important;bottom:0!important;z-index:70!important;align-items:center!important;gap:8px!important;margin:0!important;padding:8px 10px calc(8px + env(safe-area-inset-bottom,0px))!important;background:var(--paper-2,var(--paper,#f4f1e8))!important;border-top:2px solid var(--ink,#222)!important}
:root[data-mobile] .app-header{display:flex!important;flex-wrap:nowrap!important;align-items:center!important;gap:10px!important;padding:8px 12px!important;position:static!important}
:root[data-mobile] .brand{display:flex!important;align-items:baseline!important;gap:8px!important;min-width:0!important;flex:1 1 auto!important}
:root[data-mobile] .brand-sub{margin-left:auto!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
:root[data-mobile] .toolbar{position:fixed!important;left:0!important;right:0!important;bottom:0!important;top:auto!important;z-index:60!important;display:none!important;flex-direction:column!important;align-items:stretch!important;gap:10px!important;margin:0!important;padding:14px 16px 84px!important;background:var(--paper-2,var(--paper,#f4f1e8))!important;border-top:2px solid var(--ink,#222)!important;max-width:none!important;width:auto!important}
:root[data-mobile] .toolbar.open{display:flex!important}
:root[data-mobile] .toolbar .field{display:block!important;width:100%!important;max-width:none!important}
:root[data-mobile] .toolbar .field select{width:100%!important;max-width:none!important}
:root[data-mobile] #dashboard{position:fixed!important;left:0!important;right:0!important;bottom:0!important;top:auto!important;z-index:60!important;display:none!important;grid-template-columns:1fr!important;flex-direction:column!important;gap:10px!important;margin:0!important;padding:14px 16px 84px!important;max-height:72vh!important;overflow:auto!important;background:var(--paper-2,var(--paper,#f4f1e8))!important;border-top:2px solid var(--ink,#222)!important}
:root[data-mobile] #dashboard.open{display:grid!important}
:root[data-mobile] .section-title{display:none!important}
:root[data-mobile] .wrap{margin:0!important;padding:10px 10px 88px!important;max-width:none!important}
:root[data-mobile] .day-rail{display:flex!important;flex-wrap:wrap!important;justify-content:flex-end!important;gap:8px!important}
:root[data-mobile] .day-nav{order:1!important;position:static!important;width:36px!important;height:36px!important;flex:0 0 auto!important}
:root[data-mobile] .today-wrap{order:3!important;flex:1 1 100%!important;width:auto!important;max-width:none!important}
:root[data-mobile] .today{flex-direction:column!important;min-height:58vh!important}
:root[data-mobile] .today-side{display:none!important}
:root[data-mobile] .today-main{padding:14px 12px!important}
:root[data-mobile] .task{min-height:44px!important;align-items:center!important}
:root[data-mobile] .foot{margin:8px 8px 84px!important;text-align:center!important}
:root[data-mobile] .modal-panel{width:100vw!important;height:100dvh!important;max-width:none!important;max-height:none!important;border-radius:0!important;overflow:auto!important}
:root[data-mobile] .cm-card{width:42px!important;height:42px!important}
```

- [ ] **Step 3.5:** Sanity: open `index.html` from `file://` in a desktop browser at full width — pixel status quo, no dock visible, no console errors.
- [ ] **Step 3.6:** Commit:
```bash
git commit -m "feat(mobile): dock markup + [data-mobile] HUD baseline (token-tinted, scoped !important)" index.html
```

### Task 4: Renderer fills the dock bars

**Files:**
- Modify: `src/adapters/dom-renderer.ts` (end of `renderDashboard`, ~line 190)
- Test: `test/adapters/dom.test.ts`

- [ ] **Step 4.1:** In `test/adapters/dom.test.ts`, extend `STATIC_IDS` (line ~123) with the new canonical ids:

```ts
    'toolbar',
    'dock',
    'dockBars',
    'dockMapBtn',
    'dockTrophiesBtn',
    'dockMenuBtn',
    'dockStreakFill',
    'dockStreakVal',
    'dockProgressFill',
    'dockProgressVal',
```

- [ ] **Step 4.2: Write the failing test** (append to `test/adapters/dom.test.ts`):

```ts
test('dock bars reflect progress and streak after a render', async () => {
  const { registry, tracker } = await boot();
  Object.keys(registry)
    .filter((id) => /^cb_/.test(id))
    .forEach((id) => {
      const el = registry[id]!;
      if (el.onchange) el.onchange({ target: { checked: true } });
    });
  const vm = tracker.dashboard();
  const fillW = (id: string): string =>
    (registry[id]!.style as unknown as { width?: string }).width ?? '';
  assert.equal(registry['dockProgressVal']!.textContent, `${vm.overall.done}/${vm.overall.total}`);
  assert.equal(fillW('dockProgressFill'), `${vm.overall.pct}%`);
  assert.equal(registry['dockStreakVal']!.textContent, `${vm.streak}d`);
  assert.equal(fillW('dockStreakFill'), `${Math.round(Math.min(vm.streak / 30, 1) * 100)}%`);
});
```

- [ ] **Step 4.3:** Run `node --test test/adapters/dom.test.ts --test-name-pattern='dock bars reflect'` — expect FAIL (empty textContent).
- [ ] **Step 4.4: Implement** — append at the end of `DomRenderer.renderDashboard` (after the `dash.innerHTML = …` statement):

```ts
    // Dock micro-bars (mobile HUD) — same VM, micro presentation. Streak bar
    // fills against a 30-day target (capped); progress bar is overall pct.
    const sFill = this.$('dockStreakFill');
    if (sFill) sFill.style.width = `${Math.round(Math.min(vm.streak / 30, 1) * 100)}%`;
    this.setText('dockStreakVal', `${vm.streak}d`);
    const pFill = this.$('dockProgressFill');
    if (pFill) pFill.style.width = `${vm.overall.pct}%`;
    this.setText('dockProgressVal', `${vm.overall.done}/${vm.overall.total}`);
```

- [ ] **Step 4.5:** Run `node --test test/adapters/dom.test.ts` — expect ALL PASS.
- [ ] **Step 4.6:** `npm run typecheck && npm run build && npm test` — expect clean.
- [ ] **Step 4.7:** Commit:
```bash
git commit -m "feat(mobile): renderDashboard fills dock micro-bars (streak/30 cap, overall pct)" src/adapters/dom-renderer.ts test/adapters/dom.test.ts dist/sunrise.js dist/sunrise.js.map
```

### Task 5: Controller — dock buttons, sheets, labels

**Files:**
- Modify: `src/adapters/dom-controller.ts`, `src/domain/builtins.ts` (one UI string)
- Test: `test/adapters/dom.test.ts`

- [ ] **Step 5.1: Write the failing tests** (append to `test/adapters/dom.test.ts`):

```ts
test('dock map/trophies buttons open their modals (closing any sheet first)', async () => {
  const { registry } = await boot();
  registry['dockMenuBtn']!.onclick!();
  assert.equal(registry['toolbar']!.classList.contains('open'), true, 'menu sheet opens');
  registry['dockMapBtn']!.onclick!();
  assert.equal(registry['cardMapModal']!.classList.contains('open'), true, 'map modal opens');
  assert.equal(registry['toolbar']!.classList.contains('open'), false, 'sheet closed by modal');
  registry['cardMapModal']!.onclick!({ target: { id: 'cardMapModal' } });
  registry['dockTrophiesBtn']!.onclick!();
  assert.equal(registry['trophiesModal']!.classList.contains('open'), true, 'trophies modal opens');
});

test('menu and stats sheets toggle and are mutually exclusive; Esc closes', async () => {
  const { registry, controller } = await boot();
  registry['dockMenuBtn']!.onclick!();
  assert.equal(registry['toolbar']!.classList.contains('open'), true, 'menu opens');
  registry['dockBars']!.onclick!();
  assert.equal(registry['dashboard']!.classList.contains('open'), true, 'stats opens');
  assert.equal(registry['toolbar']!.classList.contains('open'), false, 'menu closed by stats');
  registry['dockBars']!.onclick!();
  assert.equal(registry['dashboard']!.classList.contains('open'), false, 'stats toggles closed');
  registry['dockMenuBtn']!.onclick!();
  controller!.handleKeydown(ev('Escape'));
  assert.equal(registry['toolbar']!.classList.contains('open'), false, 'Esc closes the sheet');
});

test('a toolbar action closes the menu sheet', async () => {
  const { registry, tracker } = await boot();
  registry['dockMenuBtn']!.onclick!();
  const items = tracker.selectors().items.map((o) => o.id);
  registry['daySelect']!.value = items[1]!;
  registry['daySelect']!.onchange!();
  assert.equal(registry['toolbar']!.classList.contains('open'), false, 'day pick closes menu');
});

test('dock controls carry aria-labels from ui strings', async () => {
  const { registry, tracker } = await boot();
  const u = (k: string): string => tracker.ui(k);
  assert.equal(registry['dockMapBtn']!.attrs['aria-label'], u('cardMap'));
  assert.equal(registry['dockTrophiesBtn']!.attrs['aria-label'], u('trophies'));
  assert.equal(registry['dockMenuBtn']!.attrs['aria-label'], u('menu'));
  assert.equal(registry['dockBars']!.attrs['aria-label'], u('summaryTitle'));
});
```

- [ ] **Step 5.2:** Run `node --test test/adapters/dom.test.ts --test-name-pattern='dock|sheet|menu'` — expect the 4 new tests FAIL (`onclick` is null / label missing).
- [ ] **Step 5.3: Implement in `src/domain/builtins.ts`** — add to `DEFAULT_UI` after `pack: 'Программа',`:

```ts
  menu: 'Меню',
```

(String-table-only domain edit; the spec's "no domain changes" refers to logic/data-model.)

- [ ] **Step 5.4: Implement in `src/adapters/dom-controller.ts`:**

(a) Add the sheet state field next to `activeModal` (~line 16):

```ts
  private activeSheet: 'menu' | 'stats' | null = null;
```

(b) Add the sheet helpers next to `closeActiveModal` (~line 395):

```ts
  private toggleSheet(which: 'menu' | 'stats'): void {
    const next = this.activeSheet === which ? null : which;
    const toolbar = this.r.$('toolbar');
    if (toolbar) toolbar.classList[next === 'menu' ? 'add' : 'remove']('open');
    const dash = this.r.$('dashboard');
    if (dash) dash.classList[next === 'stats' ? 'add' : 'remove']('open');
    this.activeSheet = next;
  }

  private closeSheets(): void {
    if (this.activeSheet) this.toggleSheet(this.activeSheet);
  }
```

(c) In `open(id)` (~line 378), close sheets first — add as the first line of the method:

```ts
    this.closeSheets();
```

(d) In `handleKeydown`, extend the Escape branch (~line 201) to:

```ts
    if (key === 'Escape') {
      if (this.activeModal) this.closeActiveModal();
      else this.closeSheets();
      return;
    }
```

(e) In `wire()`, append after the import-handler block (~line 375):

```ts
    const dockMap = this.r.$('dockMapBtn');
    if (dockMap) {
      (dockMap as HTMLElement).onclick = () => {
        this.renderCardMap();
        this.open('cardMapModal');
      };
    }
    const dockTrophies = this.r.$('dockTrophiesBtn');
    if (dockTrophies) {
      (dockTrophies as HTMLElement).onclick = () => {
        this.renderTrophies();
        this.open('trophiesModal');
      };
    }
    const dockMenu = this.r.$('dockMenuBtn');
    if (dockMenu) (dockMenu as HTMLElement).onclick = () => this.toggleSheet('menu');
    const dockBars = this.r.$('dockBars');
    if (dockBars) (dockBars as HTMLElement).onclick = () => this.toggleSheet('stats');
```

(f) Close the menu on toolbar actions — add `this.closeSheets();` as the **first line** inside the existing `pack.onchange`, `theme.onchange`, `day.onchange`, `exportBtn.onclick`, and `importFile.onchange` handlers (5 spots in `wire()`).

(g) Label the dock controls — in `applyStaticLabels`, extend `iconLabels` with:

```ts
      ['dockMapBtn', 'cardMap'],
      ['dockTrophiesBtn', 'trophies'],
      ['dockMenuBtn', 'menu'],
      ['dockBars', 'summaryTitle'],
```

- [ ] **Step 5.5:** Run `node --test test/adapters/dom.test.ts` — expect ALL PASS (incl. the pre-existing modal/keyboard tests — `open()`'s new `closeSheets()` line must not break them).
- [ ] **Step 5.6:** `npm run typecheck && npm run build && npm test` — expect clean.
- [ ] **Step 5.7:** Commit:
```bash
git commit -m "feat(mobile): dock intents + menu/stats sheets (mutually exclusive, Esc, action-close)" src/adapters/dom-controller.ts src/domain/builtins.ts test/adapters/dom.test.ts dist/sunrise.js dist/sunrise.js.map
```

### Task 6: Controller — swipe day-nav

**Files:**
- Modify: `src/adapters/dom-controller.ts` (`wire()`)
- Test: `test/adapters/dom.test.ts`

- [ ] **Step 6.1: Write the failing tests** (append):

```ts
const touch = (x: number, y: number) => ({ changedTouches: [{ clientX: x, clientY: y }] });

test('horizontal swipe on the today card changes day (left=next, right=prev)', async () => {
  const { registry, tracker } = await boot();
  const items = tracker.selectors().items.map((o) => o.id);
  tracker.selectItem(items[0]!);
  const card = registry['todayCard']! as unknown as {
    ontouchstart?: (e: unknown) => void;
    ontouchend?: (e: unknown) => void;
  };
  card.ontouchstart!(touch(300, 100));
  card.ontouchend!(touch(180, 110)); // dx=-120 → next
  assert.equal(tracker.todayCard().itemId, items[1], 'left swipe advances');
  card.ontouchstart!(touch(100, 100));
  card.ontouchend!(touch(260, 90)); // dx=+160 → prev
  assert.equal(tracker.todayCard().itemId, items[0], 'right swipe goes back');
});

test('small, vertical, typing-target and modal-open swipes are ignored', async () => {
  const { registry, controller, tracker } = await boot();
  const items = tracker.selectors().items.map((o) => o.id);
  tracker.selectItem(items[0]!);
  const card = registry['todayCard']! as unknown as {
    ontouchstart?: (e: unknown) => void;
    ontouchend?: (e: unknown) => void;
  };
  card.ontouchstart!(touch(300, 100));
  card.ontouchend!(touch(270, 100)); // |dx|=30 < 50
  assert.equal(tracker.todayCard().itemId, items[0], 'sub-threshold ignored');
  card.ontouchstart!(touch(300, 100));
  card.ontouchend!(touch(220, 260)); // dy dominates
  assert.equal(tracker.todayCard().itemId, items[0], 'vertical scroll ignored');
  registry['daySelect']!.tagName = 'SELECT';
  registry['daySelect']!.focus();
  card.ontouchstart!(touch(300, 100));
  card.ontouchend!(touch(100, 100));
  assert.equal(tracker.todayCard().itemId, items[0], 'typing target ignored');
  (globalThis as { document?: { activeElement?: unknown } }).document!.activeElement = null;
  controller!.handleKeydown(ev('m'));
  card.ontouchstart!(touch(300, 100));
  card.ontouchend!(touch(100, 100));
  assert.equal(tracker.todayCard().itemId, items[0], 'modal-open ignored');
});
```

- [ ] **Step 6.2:** Run `node --test test/adapters/dom.test.ts --test-name-pattern='swipe'` — expect FAIL (`ontouchstart` is not a function).
- [ ] **Step 6.3: Implement** — in `wire()`, after the dock block from Task 5:

```ts
    // Swipe day-nav: primary mobile gesture; maps to the existing prev/next
    // intents. Threshold + horizontal-dominance keep page scrolling intact.
    const todayCard = this.r.$('todayCard');
    if (todayCard) {
      let sx = 0;
      let sy = 0;
      (todayCard as HTMLElement).ontouchstart = (e: TouchEvent) => {
        const t = e.changedTouches[0];
        if (!t) return;
        sx = t.clientX;
        sy = t.clientY;
      };
      (todayCard as HTMLElement).ontouchend = (e: TouchEvent) => {
        if (this.activeModal || this.r.isTypingTarget()) return;
        const t = e.changedTouches[0];
        if (!t) return;
        const dx = t.clientX - sx;
        const dy = t.clientY - sy;
        if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.5) this.go(dx < 0 ? 1 : -1);
      };
    }
```

- [ ] **Step 6.4:** Run `node --test test/adapters/dom.test.ts` — expect ALL PASS.
- [ ] **Step 6.5:** `npm run typecheck && npm run build && npm test` — expect clean.
- [ ] **Step 6.6:** Commit:
```bash
git commit -m "feat(mobile): swipe day-nav on the today card (50px, horizontal-dominant, guarded)" src/adapters/dom-controller.ts test/adapters/dom.test.ts dist/sunrise.js dist/sunrise.js.map
```

### Task 7: Theme cleanup + permanent guard test

**Files:**
- Create: `test/themes/mobile-guard.test.ts`
- Modify: 17 × `themes/*.css` (delete whole `@media` blocks only)

- [ ] **Step 7.1: Write the failing guard test**

```ts
// test/themes/mobile-guard.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));

// Mobile layout is app-owned ([data-mobile] baseline). Themes must not ship
// phone-range media queries; ≥900px tablet refinements are allowed.
test('no theme carries a phone-range (max-width < 900px) media query', () => {
  const dir = join(root, 'themes');
  const offenders: string[] = [];
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.css'))) {
    const css = readFileSync(join(dir, f), 'utf8');
    // Match only @media preludes — `max-width` is also a legitimate CSS
    // property (modal panels, tooltips) and must not trip the guard.
    const re = /@media[^{]*max-width:\s*(\d+(?:\.\d+)?)px/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(css))) {
      if (parseFloat(m[1]!) < 900) offenders.push(`${f}: max-width:${m[1]}px`);
    }
  }
  assert.deepEqual(offenders, [], 'use :root[data-mobile][data-theme=...] overrides instead');
});

test('index.html ships the dock + [data-mobile] HUD baseline', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.ok(html.includes('#dock{display:none}'), 'dock hidden by default');
  assert.ok(html.includes(':root[data-mobile] #dock'), 'HUD block present');
  assert.ok(html.includes('id="dock"'), 'dock markup present');
});
```

- [ ] **Step 7.2:** Run `node --test test/themes/mobile-guard.test.ts` — expect FAIL listing exactly these **25** phone-range blocks across 17 files (≥900px blocks in dawn/memphis/japanese are kept):

| file | delete blocks at (max-width) | keep |
|---|---|---|
| arcade.css | 720, 520 | — |
| arcade-animated.css | 720, 520 | — |
| arcade-animated-v2.css | 720, 520 | — |
| aurora-noir.css | 720 | — |
| bauhaus.css | 720, 480 | — |
| blueprint.css | 720, 560 | — |
| bonus.css | 680 | — |
| dashboard.css | 640 | — |
| dawn.css | 720 | 1000 |
| emerald.css | 720 | — |
| gazette.css | 720 | — |
| japanese.css | 520, 600 | 900 |
| memphis.css | 720 | 980 |
| neon.css | 640 | — |
| os95.css | 720 | — |
| solarpunk.css | 720, 520 | — |
| swiss.css | 720, 480 | — |

- [ ] **Step 7.3:** In each listed file, locate each block with `grep -n "@media" themes/<file>.css` and delete the **entire block** — from the `@media (max-width:NNNpx){` line through its matching closing `}` (these blocks are short, 3–10 rules; do not touch any other rule).
- [ ] **Step 7.4:** Run `node --test test/themes/mobile-guard.test.ts` — expect 2 PASS.
- [ ] **Step 7.5:** `npm test` — expect ALL PASS (nothing else reads theme CSS).
- [ ] **Step 7.6:** Commit:
```bash
git commit -m "refactor(themes): delete phone-range @media squeezes (HUD owns mobile); add guard test" themes test/themes/mobile-guard.test.ts
```

### Task 8: Documentation

**Files:**
- Modify: `docs/plugins/theme.md`, `docs/FEATURES.md`

- [ ] **Step 8.1:** In `docs/plugins/theme.md`, add a section "Mobile HUD (`[data-mobile]`)" (place it after the runtime-contract/token section; match the doc's existing tone). Content to convey, in the guide's own style:

```markdown
## Mobile HUD ([data-mobile])

On screens ≤ 640px the app sets `data-mobile` on `<html>` (live, via matchMedia) and an
app-shipped baseline block in `index.html` re-lays the page as a HUD for EVERY theme:
one-line header, hero today-card, the toolbar and `#dashboard` become bottom sheets
(`.toolbar.open` / `#dashboard.open`, toggled by the app), and a bottom dock `#dock`
appears — two micro-bars plus 🗺️ 🏆 ☰ buttons.

You do NOT need to do anything for mobile:
- **Never write width media queries in a theme** (a guard test rejects `max-width < 900px`).
- The HUD tints itself from your tokens: `--paper`, `--paper-2`, `--ink`, `--accent`,
  `--cobalt`, `--r`. Define those and the HUD matches your theme automatically.

Dock anatomy (style hooks): `#dock` › `.dock-bars` (a button) › two `.dock-bar`
(`data-kind="streak"` / `"progress"`), each with an `.dock-bar-fill` (the app sets its
inline `width:NN%`; streak fills against a 30-day target) and a `.dock-bar-val` text.

To customize mobile, match the baseline's selectors under `[data-mobile]` — your file
loads after the baseline, so equal specificity wins; mirror its `!important` on the
layout-critical declarations you change:

    :root[data-mobile][data-theme="yourtheme"] #dock{background:#000!important}
```

- [ ] **Step 8.2:** In `docs/FEATURES.md`, add a "Mobile HUD" section (match the file's existing heading style): on phones (≤640px) every theme switches to a game-HUD layout — one-line header, today card up top, bottom dock with streak/progress micro-bars (tap → full stats sheet), ☰ menu sheet (pack/theme/day/export/import), swipe left/right on the card to change day, Esc/✕ patterns unchanged; desktop is untouched.
- [ ] **Step 8.3:** Commit:
```bash
git commit -m "docs: mobile HUD contract in theme guide + FEATURES entry" docs/plugins/theme.md docs/FEATURES.md
```

### Task 9: Full verification + manual phone pass

**Files:** none (verification)

- [ ] **Step 9.1:** `npm run typecheck && npm run lint && npm run format:check && npm run build && npm test` — all clean, `fail 0`. If `format:check` complains about files this plan touched, run `npm run format` and amend the relevant commit.
- [ ] **Step 9.2:** `git status --porcelain` — expect empty (everything committed, dist in sync).
- [ ] **Step 9.3 (manual, desktop):** open `index.html` via `file://`; at full width confirm pixel status quo for `bonus`, `japanese`, `os95`, `dashboard`; narrow the window below 640px and confirm: one-line header, hero card, dock with sane bar values, ☰ sheet (all selects + export/import usable), bars-tap stats sheet, sheets mutually exclusive, Esc closes, modals full-screen, card-map cells ≥40px, motd visible above dock.
- [ ] **Step 9.4 (manual, phone):** `python3 -m http.server 8000` in the repo root, open `http://<mac-lan-ip>:8000` on the phone; verify the same list plus: swipe left/right changes day, scrolling inside the card doesn't trigger swipes, ticking a task updates the progress bar, safe-area padding at the bottom looks right. Try at least one expressive theme (os95) and one calm one (japanese).
- [ ] **Step 9.5:** Report results (incl. any visual rough edges per theme) back to the user before closing the work.

---

## Self-review notes (kept for the executor)

- **Spec coverage:** §1 layout (Task 3 CSS), §2 delivery decisions (Tasks 2/3/7), §3 app changes (Tasks 2–6), §4 cleanup+contract (Tasks 7–8), §5 testing (Tasks 2/4/5/6/7 + 9), §6 open items resolved: streak fill = 30-day cap (Task 4), breakpoint = 640 (Task 2), ‹ › kept via flex `order` reposition (Task 3).
- **Known accepted gaps:** 641–720px desktop windows lose the old per-theme squeezes (band renders plain desktop — pre-existing layouts, deliberate); sheet styling inherits each theme's card look only via tokens (functional, not bespoke — per spec out-of-scope).
- **Type consistency check:** `watchMobileMode(matchMedia, root)` + `MOBILE_BREAKPOINT_PX` (Tasks 2); dock ids `dockStreakFill/dockStreakVal/dockProgressFill/dockProgressVal/dockBars/dockMapBtn/dockTrophiesBtn/dockMenuBtn` consistent across Tasks 3/4/5 and STATIC_IDS; sheet ids `toolbar`/`dashboard` with class `open` consistent across Tasks 3/5 and the guard test.
