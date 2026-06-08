# Keyboard Navigation & Shortcuts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drive the today-card flow from the keyboard — `←/→` day nav, `↑/↓` tick focus, `Enter` to mark, and `M`/`T`/`?` shortcuts with a `?` help overlay.

**Architecture:** All key handling lives in one `DomController.handleKeydown` method (callable, so the fake-DOM tests invoke it directly). Tick selection is native DOM focus; the renderer owns the `document.activeElement`/`focus()` access. Modal open/close is tracked in controller state (`activeModal`), replacing the old `.modal.open` query.

**Tech Stack:** TypeScript (run directly under `node --test`), esbuild bundle, a custom `FakeEl`/fake-`document` test harness in `test/adapters/dom.test.ts`.

**Spec:** `docs/2026-06-09-keyboard-nav-design.md`

---

## File Structure

- `test/adapters/dom.test.ts` — **modified.** Harness gains fake focus (`FakeEl.focus()`, `tagName`, `type`, `document.activeElement`) and returns the controller; all new keyboard tests live here.
- `src/adapters/dom-renderer.ts` — **modified.** Adds DOM-focus helpers (`focusTask`, `activeTaskId`, `isTypingTarget`) and `renderShortcuts`. This file is the only place that touches `document.activeElement`/`focus()`.
- `src/adapters/dom-controller.ts` — **modified.** Adds `handleKeydown`, `moveTickFocus`, `tickDone`, `toggleTick`, modal-state tracking (`activeModal`/`open`/`closeActiveModal`), and the shortcuts-overlay wiring.
- `src/domain/builtins.ts` — **modified.** New `DEFAULT_UI` label keys for the help overlay.
- `index.html` — **modified.** New `#shortcutsModal` (reuses the themed modal frame) + small theme-independent list CSS in the existing `<style>` block.
- `dist/sunrise.js` (+ `.map`) — **rebuilt** in the final task.

**Convention note:** Every commit message ends with the trailer:
```
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```
**Test-run note:** `npm test` runs the whole suite (fast). To target one test you may use `node --test --test-name-pattern='<name>' test/adapters/dom.test.ts` if your Node strips TS types by default; otherwise just read the named test in the `npm test` output.

---

### Task 1: Test harness — fake focus + return the controller

No behavior change yet; this enables every later test. Verified by keeping the existing suite green.

**Files:**
- Modify: `test/adapters/dom.test.ts`

- [ ] **Step 1: Add focus fields + method to `FakeEl`**

In the `FakeEl` class, add `tagName`/`type` fields near the top (next to `id`) and a `focus()` method near `click()`:

```ts
  id: string;
  tagName = 'DIV';
  type = '';
```

```ts
  click(): void {}
  focus(): void {
    (globalThis as { document?: { activeElement?: unknown } }).document!.activeElement = this;
  }
```

- [ ] **Step 2: Give the fake `document` a mutable `activeElement`**

In `harness()`, extend the `g['document'] = { ... }` literal with an `activeElement` field:

```ts
  g['document'] = {
    getElementById: (id: string): FakeEl | null => registry[id] || null,
    createElement: (): FakeEl => new FakeEl('_el', registry),
    querySelector: (): null => null,
    addEventListener: (): void => {},
    documentElement: new FakeEl('html', registry),
    body: new FakeEl('body', registry),
    activeElement: null as FakeEl | null,
  };
```

- [ ] **Step 3: Expose the controller from `boot()`**

Add `controller` to the `Harness` interface (optional — `harness()` does not create one):

```ts
interface Harness {
  registry: Registry;
  store: Record<string, string>;
  tracker: Tracker;
  renderer: DomRenderer;
  controller?: DomController;
  registryPlugin: WindowPluginRegistry;
}
```

Change `boot()` to construct, keep, and return the controller:

```ts
async function boot(seed?: { store?: Record<string, string> }): Promise<Harness> {
  const h = harness(seed);
  await registerDevRoadmap(h.registryPlugin);
  h.tracker.init();
  h.controller = new DomController(h.tracker, h.renderer);
  h.controller.start();
  return h;
}
```

- [ ] **Step 4: Add the shared key-event helper**

Add this module-level helper just above the `// Tests` divider so all new tests share it:

```ts
const ev = (key: string, extra: Record<string, unknown> = {}): KeyboardEvent =>
  ({ key, preventDefault() {}, ...extra }) as unknown as KeyboardEvent;
```

- [ ] **Step 5: Run the suite to confirm nothing regressed**

Run: `npm test`
Expected: PASS (same test count as before; harness changes are additive).

- [ ] **Step 6: Commit**

```bash
git add test/adapters/dom.test.ts
git commit -m "test(harness): fake focus + expose controller for keyboard tests"
```

---

### Task 2: Renderer focus helpers

**Files:**
- Test: `test/adapters/dom.test.ts`
- Modify: `src/adapters/dom-renderer.ts`

- [ ] **Step 1: Write the failing tests**

Append to `test/adapters/dom.test.ts`:

```ts
test('renderer: focusTask / activeTaskId round-trip', async () => {
  const { registry, renderer } = await boot();
  const cbId = Object.keys(registry).find((id) => /^cb_/.test(id));
  assert.ok(cbId, 'today card rendered at least one tick');
  const taskId = cbId!.slice(3);
  renderer.focusTask(taskId);
  assert.equal(renderer.activeTaskId(), taskId, 'activeTaskId reflects focused tick');
});

test('renderer: isTypingTarget true for select, false when nothing focused', async () => {
  const { registry, renderer } = await boot();
  assert.equal(renderer.isTypingTarget(), false, 'nothing focused -> not typing');
  registry['daySelect']!.tagName = 'SELECT';
  registry['daySelect']!.focus();
  assert.equal(renderer.isTypingTarget(), true, 'select focused -> typing');
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm test`
Expected: FAIL — `renderer.focusTask`/`activeTaskId`/`isTypingTarget` are not functions.

- [ ] **Step 3: Implement the helpers**

In `src/adapters/dom-renderer.ts`, add these methods (e.g., just after the `$` method):

```ts
  public focusTask(taskId: string): void {
    const el = this.$('cb_' + taskId) as HTMLElement | null;
    if (el && typeof el.focus === 'function') el.focus();
  }

  public activeTaskId(): string | null {
    const a = document.activeElement as HTMLElement | null;
    const id = a?.id ?? '';
    return id.startsWith('cb_') ? id.slice(3) : null;
  }

  public isTypingTarget(): boolean {
    const a = document.activeElement as HTMLElement | null;
    if (!a) return false;
    const tag = a.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (tag === 'INPUT') {
      const t = (a as HTMLInputElement).type;
      return t !== 'checkbox' && t !== 'radio' && t !== 'button';
    }
    return false;
  }
```

- [ ] **Step 4: Run to verify they pass**

Run: `npm test`
Expected: PASS (all tests).

- [ ] **Step 5: Commit**

```bash
git add src/adapters/dom-renderer.ts test/adapters/dom.test.ts
git commit -m "feat(renderer): focusTask/activeTaskId/isTypingTarget helpers"
```

---

### Task 3: Extract `toggleTick` + preserve focus across re-render

The checkbox `onchange` and (later) `Enter` share one toggle path; after `renderAll()` re-creates `#taskList`, focus is restored to the acted tick.

**Files:**
- Test: `test/adapters/dom.test.ts`
- Modify: `src/adapters/dom-controller.ts`

- [ ] **Step 1: Write the failing test**

Append to `test/adapters/dom.test.ts`:

```ts
test('toggling a tick via onchange restores focus to it', async () => {
  const { registry, tracker, renderer } = await boot();
  const id = tracker.todayCard().tasks[0]!.id;
  registry['cb_' + id]!.onchange!({ target: { checked: true } });
  assert.equal(renderer.activeTaskId(), id, 'focus restored to toggled tick');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `activeTaskId()` is `null` (current `onchange` never focuses).

- [ ] **Step 3: Add `toggleTick` and rewire `onchange`**

In `src/adapters/dom-controller.ts`, add the method (e.g., just below `bindTodayHandlers`):

```ts
  private toggleTick(taskId: string, checked: boolean): void {
    const was = this.t.todayCard().complete;
    const res = this.t.toggleTask(taskId, checked);
    if (!was && this.t.todayCard().complete) {
      this.r.celebrate();
      if (res.unlockedBadges.length) {
        const tro = this.t.trophies().find((x) => x.id === res.unlockedBadges[0]);
        if (tro) this.r.badgeToast(this.t.ui('newTrophy'), tro.title, tro.icon);
      }
      if (res.surprise) this.r.toast('toast', this.r.esc(res.surprise));
    }
    this.renderAll();
    this.r.focusTask(taskId);
  }
```

Replace the existing `cb.onchange = (e) => { ... }` block inside `bindTodayHandlers` with:

```ts
      if (cb) {
        cb.onchange = (e) => this.toggleTick(t.id, (e.target as HTMLInputElement).checked);
      }
```

- [ ] **Step 4: Run to verify it passes (and first-light still persists)**

Run: `npm test`
Expected: PASS — including the existing `completing the active item persists first-light` test (same toggle path).

- [ ] **Step 5: Commit**

```bash
git add src/adapters/dom-controller.ts test/adapters/dom.test.ts
git commit -m "refactor(controller): shared toggleTick; restore focus after re-render"
```

---

### Task 4: `handleKeydown` core — modal state, `←/→`, `Esc`, guards

**Files:**
- Test: `test/adapters/dom.test.ts`
- Modify: `src/adapters/dom-controller.ts`

- [ ] **Step 1: Write the failing tests**

Append to `test/adapters/dom.test.ts`:

```ts
test('ArrowLeft/Right navigate days and clamp at both ends', async () => {
  const { controller, tracker } = await boot();
  const items = tracker.selectors().items.map((o) => o.id);
  assert.ok(items.length > 1, 'pack has multiple items');

  tracker.selectItem(items[0]!);
  controller!.handleKeydown(ev('ArrowLeft'));
  assert.equal(tracker.todayCard().itemId, items[0], 'clamps at start');

  controller!.handleKeydown(ev('ArrowRight'));
  assert.equal(tracker.todayCard().itemId, items[1], 'right advances');

  tracker.selectItem(items[items.length - 1]!);
  controller!.handleKeydown(ev('ArrowRight'));
  assert.equal(tracker.todayCard().itemId, items[items.length - 1], 'clamps at end');
});

test('Escape closes the open modal', async () => {
  const { registry, controller } = await boot();
  registry['cardMapBtn']!.onclick!();
  assert.equal(registry['cardMapModal']!.classList.contains('open'), true);
  controller!.handleKeydown(ev('Escape'));
  assert.equal(registry['cardMapModal']!.classList.contains('open'), false);
});

test('typing target and modifier keys suppress navigation', async () => {
  const { registry, controller, tracker } = await boot();
  const items = tracker.selectors().items.map((o) => o.id);
  tracker.selectItem(items[0]!);

  registry['daySelect']!.tagName = 'SELECT';
  registry['daySelect']!.focus();
  controller!.handleKeydown(ev('ArrowRight'));
  assert.equal(tracker.todayCard().itemId, items[0], 'ignored while typing');

  (globalThis as { document?: { activeElement?: unknown } }).document!.activeElement = null;
  controller!.handleKeydown(ev('ArrowRight', { ctrlKey: true }));
  assert.equal(tracker.todayCard().itemId, items[0], 'ignored with modifier');
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm test`
Expected: FAIL — `controller.handleKeydown` is not a function.

- [ ] **Step 3: Add modal-state tracking**

In `src/adapters/dom-controller.ts`, add a field at the top of the class (next to `private t`/`private r`):

```ts
  private activeModal: string | null = null;
```

Replace the existing `open()` method body and add `closeActiveModal()`:

```ts
  private open(id: string): void {
    if (this.activeModal && this.activeModal !== id) this.closeActiveModal();
    const el = this.r.$(id);
    if (el) {
      el.classList.add('open');
      this.activeModal = id;
    }
  }

  private closeActiveModal(): void {
    if (!this.activeModal) return;
    const el = this.r.$(this.activeModal);
    if (el) el.classList.remove('open');
    this.activeModal = null;
  }
```

- [ ] **Step 4: Route every close path through `closeActiveModal`**

Replace `bindClose` and `bindBackdrop`:

```ts
  private bindClose(btnId: string, modalId: string): void {
    const btn = this.r.$(btnId);
    if (btn) {
      (btn as HTMLElement).onclick = () => {
        if (this.activeModal === modalId) this.closeActiveModal();
      };
    }
  }

  private bindBackdrop(modalId: string): void {
    const m = this.r.$(modalId);
    if (m) {
      (m as HTMLElement).onclick = (e) => {
        if ((e.target as HTMLElement).id === modalId) this.closeActiveModal();
      };
    }
  }
```

In the `cardMapGrid` click handler inside `wire()`, replace the close lines:

```ts
        this.t.selectItem(id);
        this.closeActiveModal();
        this.renderAll();
```

- [ ] **Step 5: Replace the Esc-only listener with the keydown registration**

In `wire()`, replace this block:

```ts
    document.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Escape') {
        const m = document.querySelector('.modal.open');
        if (m) m.classList.remove('open');
      }
    });
```

with:

```ts
    document.addEventListener('keydown', (e) => this.handleKeydown(e as KeyboardEvent));
```

- [ ] **Step 6: Add `handleKeydown` (core only)**

Add the method to the class:

```ts
  public handleKeydown(e: KeyboardEvent): void {
    const key = e.key;
    if (key === 'Escape') {
      if (this.activeModal) this.closeActiveModal();
      return;
    }
    if (this.activeModal) return; // modal open -> only Esc acts
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (this.r.isTypingTarget()) return;

    switch (key) {
      case 'ArrowLeft':
        this.go(-1);
        e.preventDefault();
        break;
      case 'ArrowRight':
        this.go(1);
        e.preventDefault();
        break;
    }
  }
```

- [ ] **Step 7: Run to verify they pass (and the card-map close test still passes)**

Run: `npm test`
Expected: PASS — including the existing `card map: opens, renders cards, click navigates + closes modal` test (now closes via `closeActiveModal`).

- [ ] **Step 8: Commit**

```bash
git add src/adapters/dom-controller.ts test/adapters/dom.test.ts
git commit -m "feat(controller): handleKeydown core (arrows/Esc/guards) + modal state"
```

---

### Task 5: `↑/↓` move focus between ticks

**Files:**
- Test: `test/adapters/dom.test.ts`
- Modify: `src/adapters/dom-controller.ts`

- [ ] **Step 1: Write the failing test**

Append to `test/adapters/dom.test.ts`:

```ts
test('ArrowDown/Up move tick focus and clamp at the ends', async () => {
  const { registry, controller, renderer, tracker } = await boot();

  // Switch to an item with at least two ticks (rendered via the day-select path).
  let multi: string | undefined;
  for (const o of tracker.selectors().items) {
    tracker.selectItem(o.id);
    if (tracker.todayCard().tasks.length >= 2) {
      multi = o.id;
      break;
    }
  }
  assert.ok(multi, 'fixture has an item with >= 2 ticks');
  registry['daySelect']!.value = multi!;
  registry['daySelect']!.onchange!();

  const ids = tracker.todayCard().tasks.map((t) => t.id);
  controller!.handleKeydown(ev('ArrowDown'));
  assert.equal(renderer.activeTaskId(), ids[0], 'down with nothing focused -> first');
  controller!.handleKeydown(ev('ArrowDown'));
  assert.equal(renderer.activeTaskId(), ids[1], 'down -> second');
  controller!.handleKeydown(ev('ArrowUp'));
  assert.equal(renderer.activeTaskId(), ids[0], 'up -> first');
  controller!.handleKeydown(ev('ArrowUp'));
  assert.equal(renderer.activeTaskId(), ids[0], 'up clamps at top');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `ArrowDown`/`ArrowUp` are unhandled, so focus never moves (`activeTaskId()` stays `null`).

- [ ] **Step 3: Add `moveTickFocus` and the two cases**

Add the method to `DomController`:

```ts
  private moveTickFocus(delta: number): void {
    const card = this.t.todayCard();
    if (card.rest) return;
    const ids = card.tasks.map((t) => t.id);
    if (!ids.length) return;
    const cur = this.r.activeTaskId();
    let i = cur ? ids.indexOf(cur) : -1;
    if (i < 0) i = delta > 0 ? 0 : ids.length - 1;
    else i = Math.min(Math.max(i + delta, 0), ids.length - 1);
    this.r.focusTask(ids[i]!);
  }
```

Add these cases to the `switch` in `handleKeydown` (after `ArrowRight`):

```ts
      case 'ArrowDown':
        this.moveTickFocus(1);
        e.preventDefault();
        break;
      case 'ArrowUp':
        this.moveTickFocus(-1);
        e.preventDefault();
        break;
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/adapters/dom-controller.ts test/adapters/dom.test.ts
git commit -m "feat(controller): up/down move focus between today's ticks"
```

---

### Task 6: `Enter` marks the focused tick

**Files:**
- Test: `test/adapters/dom.test.ts`
- Modify: `src/adapters/dom-controller.ts`

- [ ] **Step 1: Write the failing tests**

Append to `test/adapters/dom.test.ts`:

```ts
test('Enter toggles the focused tick and keeps focus', async () => {
  const { controller, renderer, tracker } = await boot();
  const id = tracker.todayCard().tasks[0]!.id;
  renderer.focusTask(id);
  controller!.handleKeydown(ev('Enter'));
  assert.equal(tracker.todayCard().tasks.find((t) => t.id === id)!.done, true, 'tick marked');
  assert.equal(renderer.activeTaskId(), id, 'focus stays on the tick');
});

test('Enter through all ticks completes the item and persists', async () => {
  const { controller, renderer, tracker, store } = await boot();
  const packId = tracker.activePackId();
  for (const t of tracker.todayCard().tasks) {
    renderer.focusTask(t.id);
    controller!.handleKeydown(ev('Enter'));
  }
  const saved = JSON.parse(store['sunrise.progress.' + packId]!);
  assert.ok(saved.badges && saved.badges['first-light'], 'first-light persisted via Enter');
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm test`
Expected: FAIL — `Enter` is unhandled, so `tasks[0].done` stays `false`.

- [ ] **Step 3: Add `tickDone` and the `Enter` case**

Add the method to `DomController`:

```ts
  private tickDone(taskId: string): boolean {
    return this.t.todayCard().tasks.find((t) => t.id === taskId)?.done ?? false;
  }
```

Add this case to the `switch` in `handleKeydown` (after the arrow cases):

```ts
      case 'Enter': {
        const id = this.r.activeTaskId();
        if (id) {
          this.toggleTick(id, !this.tickDone(id));
          e.preventDefault();
        }
        break;
      }
```

- [ ] **Step 4: Run to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/adapters/dom-controller.ts test/adapters/dom.test.ts
git commit -m "feat(controller): Enter marks the focused tick"
```

---

### Task 7: Shortcuts help overlay + `M`/`T`/`?`

**Files:**
- Modify: `index.html`
- Modify: `src/domain/builtins.ts`
- Modify: `src/adapters/dom-renderer.ts`
- Modify: `src/adapters/dom-controller.ts`
- Test: `test/adapters/dom.test.ts`

- [ ] **Step 1: Add the modal to `index.html`**

Immediately after the `#trophiesModal` block (the `<div class="modal" id="trophiesModal"> ... </div>`), add:

```html
<div class="modal" id="shortcutsModal" role="dialog" aria-modal="true" aria-labelledby="shortcutsTitle">
  <div class="modal-panel sc-panel">
    <div class="tr-head"><div id="shortcutsTitle"></div><button id="shortcutsClose" type="button">✕</button></div>
    <div class="sc-grid" id="shortcutsGrid"></div>
  </div>
</div>
```

- [ ] **Step 2: Add list CSS to the existing `<style>` block**

In `index.html`, inside the existing `<style> ... </style>` block (it begins at line 8 with `.section-title{...}`), add these rules before the closing `</style>`:

```css
.sc-grid{ display:flex; flex-direction:column; gap:8px; }
.sc-row{ display:flex; align-items:center; gap:12px; }
.sc-keys{ flex:0 0 auto; min-width:84px; font:600 12px ui-monospace,SFMono-Regular,monospace; }
.sc-desc{ opacity:.8; }
```

- [ ] **Step 3: Add `DEFAULT_UI` keys**

In `src/domain/builtins.ts`, add these entries inside the `DEFAULT_UI` object (e.g., after the `hint:` line, before the closing `};`):

```ts
  shortcuts: 'Горячие клавиши',
  scDay: 'Предыдущий / следующий день',
  scTick: 'Переход между задачами',
  scMark: 'Отметить задачу',
  scMap: 'Карта прогресса',
  scTrophies: 'Трофеи',
  scHelp: 'Эта подсказка',
  scClose: 'Закрыть окно',
```

- [ ] **Step 4: Add `renderShortcuts` to the renderer**

In `src/adapters/dom-renderer.ts`, add (e.g., after `renderTrophies`):

```ts
  public renderShortcuts(rows: { keys: string; label: string }[], titleLabel: string): void {
    const host = this.$('shortcutsGrid');
    if (!host) return;
    const title = this.$('shortcutsTitle');
    if (title) title.textContent = titleLabel;
    host.innerHTML = rows
      .map(
        (r) =>
          `<div class="sc-row"><kbd class="sc-keys">${this.esc(r.keys)}</kbd>` +
          `<span class="sc-desc">${this.esc(r.label)}</span></div>`,
      )
      .join('');
  }
```

- [ ] **Step 5: Add `renderShortcuts` + overlay wiring + key cases to the controller**

In `src/adapters/dom-controller.ts`, add the render helper (e.g., next to `renderTrophies`):

```ts
  private renderShortcuts(): void {
    const u = (k: string): string => this.t.ui(k);
    this.r.renderShortcuts(
      [
        { keys: '← / →', label: u('scDay') },
        { keys: '↑ / ↓', label: u('scTick') },
        { keys: 'Enter', label: u('scMark') },
        { keys: 'M', label: u('scMap') },
        { keys: 'T', label: u('scTrophies') },
        { keys: '?', label: u('scHelp') },
        { keys: 'Esc', label: u('scClose') },
      ],
      u('shortcuts'),
    );
  }
```

In `wire()`, after the existing `this.bindClose('trophiesClose', 'trophiesModal'); this.bindBackdrop('trophiesModal');` lines, add:

```ts
    this.bindClose('shortcutsClose', 'shortcutsModal');
    this.bindBackdrop('shortcutsModal');
```

Add the `?` case and the letter `default` branch to the `switch` in `handleKeydown` (after the `Enter` case):

```ts
      case '?':
        this.renderShortcuts();
        this.open('shortcutsModal');
        break;
      default: {
        const k = key.toLowerCase();
        if (k === 'm') {
          this.renderCardMap();
          this.open('cardMapModal');
        } else if (k === 't') {
          this.renderTrophies();
          this.open('trophiesModal');
        }
      }
```

- [ ] **Step 6: Register the new modal's ids in the test harness**

In `test/adapters/dom.test.ts`, add to the `STATIC_IDS` array:

```ts
    'shortcutsModal',
    'shortcutsTitle',
    'shortcutsClose',
    'shortcutsGrid',
```

- [ ] **Step 7: Write the failing test**

Append to `test/adapters/dom.test.ts`:

```ts
test('single-key shortcuts open the right modals', async () => {
  const { registry, controller } = await boot();

  controller!.handleKeydown(ev('m'));
  assert.equal(registry['cardMapModal']!.classList.contains('open'), true, 'm opens card map');
  controller!.handleKeydown(ev('Escape'));

  controller!.handleKeydown(ev('t'));
  assert.equal(registry['trophiesModal']!.classList.contains('open'), true, 't opens trophies');
  controller!.handleKeydown(ev('Escape'));

  controller!.handleKeydown(ev('?'));
  assert.equal(registry['shortcutsModal']!.classList.contains('open'), true, '? opens help');
  assert.ok((registry['shortcutsGrid']!.innerHTML || '').includes('sc-row'), 'help rows render');
});
```

- [ ] **Step 8: Run to verify it passes**

Run: `npm test`
Expected: PASS (this test fails before Step 5's handler cases; with all of Step 1–6 in place it passes).

- [ ] **Step 9: Commit**

```bash
git add index.html src/domain/builtins.ts src/adapters/dom-renderer.ts src/adapters/dom-controller.ts test/adapters/dom.test.ts
git commit -m "feat: shortcuts help overlay (?) + M/T quick-open"
```

---

### Task 8: Rebuild bundle, full test sweep, docs

**Files:**
- Rebuild: `dist/sunrise.js`, `dist/sunrise.js.map`
- Modify: `docs/FEATURES.md`

- [ ] **Step 1: Full test sweep**

Run: `npm test`
Expected: PASS — all suites green.

- [ ] **Step 2: Rebuild the bundle**

Run: `npm run build`
Expected: writes `dist/sunrise.js` (+ `.map`) with no errors.

- [ ] **Step 3: Add a Keyboard shortcuts note to `docs/FEATURES.md`**

Open `docs/FEATURES.md`, find the section describing the today-card / navigation controls, and add this bullet list (place it near the card map / nav controls description):

```markdown
### Keyboard

- `←` / `→` — previous / next day
- `↑` / `↓` — move between today's tasks
- `Enter` — mark the focused task (Space also works)
- `M` / `T` / `?` — card map / trophies / shortcuts help
- `Esc` — close any open dialog
```

- [ ] **Step 4: Commit**

```bash
git add dist/sunrise.js dist/sunrise.js.map docs/FEATURES.md
git commit -m "build: rebuild bundle; docs(FEATURES): keyboard shortcuts"
```

---

## Self-Review

**Spec coverage** — every spec section maps to a task:
- Keybindings `←/→` → Task 4; `↑/↓` → Task 5; `Enter` → Task 6; `Space` focus-preservation → Task 3; `M/T/?` → Task 7; `Esc` → Task 4.
- Guards (typing/modifier/modal-open) → Task 4 (`isTypingTarget` from Task 2).
- `handleKeydown` consolidated method → Tasks 4–7.
- Modal-state tracking (drops `.modal.open` query) → Task 4.
- Shared focus-preserving `toggleTick` → Task 3.
- VM-ordered `moveTickFocus` → Task 5.
- Renderer focus helpers → Task 2.
- Help overlay (themed frame + base `<style>` CSS, `?`-only, no header button) → Task 7.
- `DEFAULT_UI` keys → Task 7.
- Test-plan items + harness additions → Tasks 1–7.
- Build/refresh `dist` → Task 8.
- Out-of-scope items (grid arrow-nav, auto-focus on load, header button, remapping) → intentionally not implemented.

**Placeholder scan** — no TBD/TODO/"handle edge cases"; every code step shows complete code; commands have expected output.

**Type/name consistency** — `focusTask`, `activeTaskId`, `isTypingTarget`, `renderShortcuts` (renderer); `handleKeydown`, `toggleTick`, `tickDone`, `moveTickFocus`, `renderShortcuts`, `open`, `closeActiveModal`, `activeModal` (controller); `DEFAULT_UI` keys `shortcuts`/`scDay`/`scTick`/`scMark`/`scMap`/`scTrophies`/`scHelp`/`scClose` are defined in Task 7 and consumed by `controller.renderShortcuts` in the same task. Harness `controller` field (Task 1) is used by Tasks 4–7.
