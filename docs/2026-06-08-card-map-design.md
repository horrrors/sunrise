# Sunrise — Card Map — Design

**Date:** 2026-06-08 · **Status:** approved for implementation

> Written in English to preserve the exact technical names agreed during design. Can be translated to match the Russian house style of the other `docs/*-design.md` on request.

## Goal
Replace the date-based month **calendar** with a **card map**: a compact, at-a-glance grid of every card in the active pack. The map exists to answer one question fast — *"which cards did I start but not finish, so I can jump back and complete them?"* Because the real unit of work is the **card** (a theme/topic), not the calendar day — the user is self-paced and may clear several cards one day and none the next — a date grid cannot show an unfinished card (it was never completed on any date). A card-organized grid can.

Plus a small toolbar tidy-up: export/import become **icon buttons**, consistent with the calendar/trophies icons.

Two deliverables, one plan:
- **A. Card map** — replaces the calendar.
- **B. Export/import icons** — cosmetic toolbar consistency.

## Decisions (locked during design)
- **Unit is the card, not the day.** No per-day quota; "missed day" is not a concept. The map lists cards.
- **2-state per card:** *done* (all tasks checked) vs *not done*. No "in-progress/partial" state. Consequence accepted: the app cannot machine-distinguish "skipped" from "not yet reached" — both are "not done". A skip is found **visually** — a not-done cell sitting inside a run of done cells. (This is *why* the layout is a grid, not a filterable list: a "show unfinished only" filter would surface every future card, not the come-back list.)
- **Layout: compact grid.** One row per group/week; each card a small filled/empty square; all cards fit on one screen with no scrolling.
- **Calendar is replaced, not augmented.** The date-grid widget and its plumbing are deleted. Clean replacement, not a contortion of calendar code into an item grid.
- **Streaks survive.** Removing the calendar *view* does not remove streaks or date-based trophies — those read completion timestamps, not the calendar widget.
- **Theme polish is deferred.** Style the map in the default theme now; the other 14 themes get a functional (unstyled) grid until a later mechanical pass. Dead calendar CSS removal across themes is part of that follow-up, not this feature.
- **Glyphs:** map 🗺️ (replaces 📅), export 📤, import 📥. Swappable.

## UX / behavior
- A 🗺️ toolbar icon opens a modal overlay using the **existing modal pattern** (the trophies panel): `open(id)` adds `.open`; closes via close button, backdrop click, or the global Escape handler.
- Inside the overlay:
  - **One row per group**, labeled with the group title. Each card is a small square.
  - **Filled square = done** (all tasks checked). **Empty square = not done.**
  - The **current card** is outlined ("you are here").
  - **Rest days** render as a neutral dot, visually distinct from not-done, and are **excluded from the count**.
  - A header shows **done / total** (e.g. `41 / 57`), counting only real (non-rest) cards.
- **Hover** a square → its full title (reuse the trophies panel's `data-tip` tooltip mechanism).
- **Click** a square → navigate to that card **and close the overlay**.
- The grid is **fully data-driven** — it reads whatever the active pack defines (groups, items, rest flags). The bundled pack currently has 3 phases / 6 groups / 63 items; the README's "91" is stale and will be corrected.

## Architecture (follows the 3-ring onion)

### Domain — one new query, no new state, no schema change
Add `Tracker.cardMap(): CardMapVM`. It composes data the domain already holds: `allItems`, group metadata, `Progress.isItemComplete(item)`, and the private `currentItemId`. The `current` flag on the VM closes the "no public current-item getter" gap **without** exposing new mutable state.

New view-model types in `src/domain/types/view-models.ts`:

```ts
interface CardMapItemVM {
  id: string;       // item.id — argument to selectItem()
  label: string;    // short cell label (e.g. ordinal within group); also fine as fallback tooltip
  title: string;    // full item title — used for the data-tip hover tooltip
  done: boolean;    // Progress.isItemComplete(item)
  rest: boolean;    // item.rest === true
  current: boolean; // item.id === currentItemId
}
interface CardMapGroupVM {
  id: string;
  title: string;            // group title, e.g. "Week 1 · Foundations"
  items: CardMapItemVM[];
}
interface CardMapVM {
  done: number;             // count of non-rest items complete
  total: number;            // count of non-rest items
  groups: CardMapGroupVM[];
}
```

### Renderer
Add `DomRenderer.renderCardMap(vm: CardMapVM)` (innerHTML, same construction style as `renderCalendar`/`renderTrophies`). Each cell:
- carries `data-id="<itemId>"` for click routing,
- carries `data-tip="<title>"` for the hover tooltip,
- gets status classes (`done` / `current` / `rest`).

The header renders `vm.done / vm.total`. Target host: `#cardMapGrid` (+ a `#cardMapCount` / title element).

### Controller (`DomController.wire`)
- Wire `#cardMapBtn`: `renderCardMap(tracker.cardMap())` then `open('cardMapModal')`.
- `bindClose('cardMapModal', 'cardMapClose')` + `bindBackdrop('cardMapModal')`. Escape is already global — covers all modals.
- **Grid click handler** on `#cardMapGrid`: read `data-id` from the clicked cell → `tracker.selectItem(id)` → `renderAll()` → close the card-map modal. This adds the first "close modal on navigation" behavior, scoped to the map (today nothing closes a modal on item selection).

### HTML (`index.html`)
- Replace the `#calModal` block with a `#cardMapModal` (role=dialog, aria-modal, aria-labelledby) containing `.modal-panel`, a head with title/count + `#cardMapClose`, and `#cardMapGrid`.
- Toolbar: replace `#calBtn` (📅) with `#cardMapBtn` (🗺️); give `#exportBtn`/`#importBtn` the 📤/📥 glyphs.

### Export/import icons
- In `applyStaticLabels`, drop the `setText` calls for export/import (they currently inject text labels); set the glyphs in markup instead.
- **Keep** the `aria-label`s (`export` / `import`) for accessibility.
- Handlers (`exportProgress` blob download; hidden `#importFile` + `importProgress`) are unchanged.

### Removals (delete, don't contort)
- `DomRenderer.renderCalendar`, the `#calModal` markup, `calOffset` and the calendar button/prev/next handlers in `DomController`.
- `Tracker.calendar()` and the `CalendarVM` type.
- Calendar CSS (`cal-panel`/`cal-grid`/`cday`/`calDow`) — removed from the **default theme** in this feature; removed from the other 14 themes in the follow-up pass.

## Preserved vs removed
- **Removed:** only the calendar *view* (grid widget + plumbing).
- **Preserved untouched:** completion **timestamps** (`completedAt`/`completedHour`), **streaks** (current/longest, shown in the dashboard), and all **date-based trophies** (comeback, night-owl, early-lark) — all read timestamps, not the calendar.

## Theme strategy (the main cost, contained)
Themes are standalone, complete stylesheets (one is linked via `#themeCss`, swapped at runtime); there is no shared base stylesheet. All 15 themes currently style both the calendar and the generic `.modal`/`.modal-panel` shell.
- The card-map modal **reuses the already-themed `.modal`/`.modal-panel`**, so it is **functional in every theme immediately**.
- Add proper grid styling (`.cm-grid` / `.cm-card` / `.done` / `.current` / rest) to the **default theme (`bonus.css`)** only.
- **Follow-up (out of scope here):** per-theme grid polish + dead calendar-CSS removal across the other 14 themes — a repetitive, mechanical pass well-suited to batching.

## Docs to update (in this feature)
- `README.md` and `docs/FEATURES.md`: replace calendar references with the card map; correct "5 themes" / "91 items" where stale.

## Testing
- **Domain (`test/domain/tracker.test.ts`):** build a Progress with some items complete and at least one rest item; assert `cardMap()` shape — group structure preserved, `done`/`total` exclude rest items, `current` flag follows `selectItem(id)`.
- **DOM (`test/adapters/dom.test.ts`, fake-DOM harness):** click `#cardMapBtn` → assert the grid renders cells (e.g. innerHTML contains `data-id`); simulate a cell `onclick` carrying a known `data-id` → assert `tracker.todayCard().itemId` changed **and** the modal lost its `.open` class. Seed the new ids (`cardMapBtn`, `cardMapModal`, `cardMapGrid`, `cardMapClose`) in the harness `STATIC_IDS`.

## Out of scope / follow-ups
- Per-theme card-map styling + dead calendar-CSS cleanup across the other 14 themes.
- Any "partial/in-progress" third state, status filtering, or track-colored cells (explicitly decided against).
- Phase-level grouping/dividers above group rows (groups are the rows; phases optional, not required).

## Resolved micro-choices
- Glyphs: 🗺️ / 📤 / 📥.
- Every cell navigates, including rest cells (simpler than disabling some).
- Cells colored by **status only** (no track hue) — matches the 2-state decision.
