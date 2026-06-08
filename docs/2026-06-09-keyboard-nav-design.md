# Sunrise — Keyboard Navigation & Shortcuts — Design

**Date:** 2026-06-09 · **Status:** approved for implementation

## Goal

Drive the whole today-card flow from the keyboard:

- `←` / `→` — previous / next day (the `‹` / `›` nav buttons).
- `↑` / `↓` — move focus between today's ticks.
- `Enter` — mark the focused tick (toggle it).
- `M` / `T` / `?` — open Card map / Trophies / a Shortcuts help overlay.
- `Esc` — close any open modal (already works; folded into the same handler).

## Context

Today's ticks are native `<input type="checkbox">` inside `#taskList`, so the
browser already gives us **Tab between ticks** and **Space to toggle** for free —
those stay. The genuinely new behavior is the arrow keys, `Enter`-to-mark, and
the single-key shortcuts. We lean on **native focus**: the browser's
`:focus-visible` ring is the "selected tick" indicator, so there is no custom
cursor/selection state to invent or keep in sync.

`DomController.wire()` already owns one global `keydown` listener (Esc-only) and
binds `prevDay`/`nextDay` to `go(±1)`. `Tracker.goToItem(delta)` clamps
internally and is a no-op at the ends, so the keyboard can call `go(±1)` freely —
the button `disabled` state is only visual. `toggleTask(id, done)` returns the
`CompleteResult` the current `onchange` already consumes.

## Decisions (locked during design)

- **Keep Tab native; add Up/Down.** Tab/Shift+Tab keep moving through all
  controls as browsers do; `↑`/`↓` hop specifically between today's ticks. No
  focus trapping. (Chosen over capturing Tab to the tick list — that breaks
  standard tab order and screen-reader expectations.)
- **Native focus, no virtual cursor.** Tick selection *is* DOM focus. Rejected a
  controller-tracked "current tick index" — it reimplements focus and fights
  assistive tech.
- **Tick focus clamps at the ends** (no wrap).
- **Help overlay opens by `?` only** — no header button (keep the header lean).
- **One consolidated `handleKeydown` method**, not an inline closure, so the
  fake-DOM tests can invoke it directly (the harness's `document.addEventListener`
  is a no-op).
- **Modal open/close tracked in controller state**, removing the existing
  `document.querySelector('.modal.open')` lookup (it returns null in the test
  harness and is unnecessary once we track the active modal).
- **Help-overlay styling is theme-independent.** Reuse the themed
  `.modal`/`.modal-panel`/`.tr-head` frame; put the small list styling in the
  base `<style>` block in `index.html`. No per-theme CSS edits (15+ files).

## Keybindings

| Key | When | Action |
|---|---|---|
| `←` / `→` | not typing, no modal | previous / next day (clamped at ends) |
| `↓` / `↑` | not typing, no modal | move focus to next / previous tick |
| `Enter` | a tick is focused | toggle that tick (fires celebrate / badge / surprise) |
| `Space` | a tick is focused | native toggle (unchanged); now keeps focus after re-render |
| `M` | not typing, no modal | open Card map |
| `T` | not typing, no modal | open Trophies |
| `?` | not typing, no modal | open Shortcuts help |
| `Esc` | a modal is open | close it |

**Guards.** Ignored while typing in the reflection `<textarea>` or a `<select>`;
ignored when `Ctrl`/`Cmd`/`Alt` is held; while any modal is open only `Esc`
acts. `←/→/↑/↓` call `preventDefault()` (stop page scroll); `Enter` calls it
**only** when a tick is focused (never swallow `Enter` on buttons).

## Design

### `DomController` — the key handler

One method, registered once in `wire()` in place of the current Esc-only
listener:

```ts
document.addEventListener('keydown', (e) => this.handleKeydown(e as KeyboardEvent));
```

```ts
public handleKeydown(e: KeyboardEvent): void {
  const key = e.key;
  if (key === 'Escape') { if (this.activeModal) this.closeActiveModal(); return; }
  if (this.activeModal) return;                 // modal open → only Esc acts
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (this.r.isTypingTarget()) return;          // typing in textarea / select / text input

  switch (key) {
    case 'ArrowLeft':  this.go(-1); e.preventDefault(); break;
    case 'ArrowRight': this.go(1);  e.preventDefault(); break;
    case 'ArrowDown':  this.moveTickFocus(1);  e.preventDefault(); break;
    case 'ArrowUp':    this.moveTickFocus(-1); e.preventDefault(); break;
    case 'Enter': {
      const id = this.r.activeTaskId();
      if (id) { this.toggleTick(id, !this.tickDone(id)); e.preventDefault(); }
      break;
    }
    case '?': this.renderShortcuts(); this.open('shortcutsModal'); break;
    default: {
      const k = key.toLowerCase();
      if (k === 'm') { this.renderCardMap(); this.open('cardMapModal'); }
      else if (k === 't') { this.renderTrophies(); this.open('trophiesModal'); }
    }
  }
}
```

### Modal state (replaces the `.modal.open` query)

```ts
private activeModal: string | null = null;

private open(id: string): void {
  const el = this.r.$(id);
  if (el) { el.classList.add('open'); this.activeModal = id; }
}

private closeActiveModal(): void {
  if (!this.activeModal) return;
  const el = this.r.$(this.activeModal);
  if (el) el.classList.remove('open');
  this.activeModal = null;
}
```

`bindClose`, `bindBackdrop`, and the card-map grid's jump-and-close all route
through `closeActiveModal()` instead of removing the `open` class directly.

### Tick toggle, shared + focus-preserving

Extract the body of the current checkbox `onchange` so `Enter` and the checkbox
share one path; re-focus the tick after `renderAll()` blows away `#taskList`
(this also fixes Space silently losing focus today):

```ts
private tickDone(taskId: string): boolean {
  return this.t.todayCard().tasks.find((t) => t.id === taskId)?.done ?? false;
}

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
  this.r.focusTask(taskId);   // restore focus after the re-render
}
```

`bindTodayHandlers` becomes:

```ts
cb.onchange = (e) => this.toggleTick(t.id, (e.target as HTMLInputElement).checked);
```

### Tick focus movement (ordering from the VM, not the DOM)

```ts
private moveTickFocus(delta: number): void {
  const card = this.t.todayCard();
  if (card.rest) return;
  const ids = card.tasks.map((t) => t.id);
  if (!ids.length) return;
  const cur = this.r.activeTaskId();
  let i = cur ? ids.indexOf(cur) : -1;
  if (i < 0) i = delta > 0 ? 0 : ids.length - 1;   // nothing focused → first / last
  else i = Math.min(Math.max(i + delta, 0), ids.length - 1);   // clamp
  this.r.focusTask(ids[i]!);
}
```

### Shortcuts overlay content (controller builds rows, renderer draws)

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

`wire()` also binds the overlay's close button and backdrop:
`bindClose('shortcutsClose', 'shortcutsModal')` and
`bindBackdrop('shortcutsModal')`.

### `DomRenderer` — DOM focus helpers (all `document` access stays here)

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

### `index.html`

New modal after `#trophiesModal`, reusing the themed modal frame:

```html
<div class="modal" id="shortcutsModal" role="dialog" aria-modal="true" aria-labelledby="shortcutsTitle">
  <div class="modal-panel sc-panel">
    <div class="tr-head"><div id="shortcutsTitle"></div><button id="shortcutsClose" type="button">✕</button></div>
    <div class="sc-grid" id="shortcutsGrid"></div>
  </div>
</div>
```

Minimal list styling added to the existing theme-independent `<style>` block
(no per-theme edits):

```css
.sc-grid{ display:flex; flex-direction:column; gap:8px; }
.sc-row{ display:flex; align-items:center; gap:12px; }
.sc-keys{ flex:0 0 auto; min-width:84px; font:600 12px ui-monospace,SFMono-Regular,monospace; }
.sc-desc{ opacity:.8; }
```

### `DEFAULT_UI` keys (`src/domain/builtins.ts`)

Russian to match the existing labels; packs can override via their own `ui`.

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

## Edge cases

- **Rest day** — no ticks: `↑`/`↓`/`Enter` are no-ops; `←`/`→` still navigate.
- **Nothing focused yet** — `↓` focuses the first tick, `↑` the last.
- **List ends** — `↑`/`↓` clamp (no wrap).
- **Day-range ends** — `←`/`→` no-op (`goToItem` clamps).
- **Typing** — focus in the reflection textarea or a select suppresses all app
  keys, so cursor movement / option selection / newline work normally.
- **Modifier combos** — `Ctrl`/`Cmd`/`Alt` + key falls through to the browser.

## Testing (`test/adapters/dom.test.ts`, node:test + fake-DOM harness)

Harness additions (the fake DOM has no real focus or event dispatch):

- `FakeEl.focus()` sets the fake `document.activeElement = this`.
- `FakeEl` gains `tagName` (default `'DIV'`) and `type`; fake `document` gains an
  `activeElement` field.
- `boot()` returns the `DomController` so tests can call `handleKeydown` directly.

New tests:

- `←`/`→` move `tracker.todayCard().itemId` forward/back and **clamp** at both
  ends (no throw, no wrap).
- `↓`/`↑` move `document.activeElement` across the rendered `cb_*` ticks and
  clamp at the ends; `↓` with nothing focused lands on the first tick.
- `Enter` on a focused tick toggles it, persists, and on full completion fires
  the completion path (assert persisted state like the existing first-light
  test).
- After a toggle, focus is restored to the same `cb_*` tick.
- `M` / `T` / `?` set the corresponding modal's `open` class; `Esc` clears it.
- Typing guard: with a `TEXTAREA` as `activeElement`, `←`/`→` do **not** change
  the current item.

## Build

`index.html` loads `dist/sunrise.js`; run `npm run build` to refresh the bundle
(tests run against `src` directly). `npm test` must stay green.

## Out of scope

- Arrow navigation *inside* the card-map grid (click-to-jump stays; future work).
- Auto-focusing a tick on day load (first `↓` does it; avoids stealing focus /
  scroll jumps).
- A header button for the help overlay (`?` only, by decision).
- Remapping / user-configurable keybindings.
