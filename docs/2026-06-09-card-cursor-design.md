# Sunrise — Resume Card Cursor — Design

**Date:** 2026-06-09 · **Status:** approved for implementation

## Goal

Remember which card the user last had open and reopen there, instead of always
jumping back to the earliest unfinished card. Concretely: if the last card was
left **partial** (e.g. 2/3 tasks) → reopen on it; if it was **finished** (3/3) →
reopen on the next unfinished card after it. Never jump *back* to an earlier
skipped card on open — the card map (🗺️) is the tool for revisiting skips.

## Problem

`Tracker.defaultItemId()` (tracker.ts) picks the **first** non-rest incomplete
card in the whole pack (or the last card if all are done). `currentItemId` is
never persisted — it's recomputed from scratch on every load. So leaving a card
half-done at position 40 and reopening throws you back to the earliest gap at
position 2. That's the "not first" complaint.

## Decisions (locked during design)

- **Forward-only resume.** On open, continue forward from where you were; never
  auto-jump back to an earlier skip. (User chose this over backfill.)
- **Cursor lives in session storage, per pack.** It's navigation state, like the
  existing `activePackId`/`themeId` in `sunrise.session` — not learning data. The
  validated `Progress` schema and the export/import format stay untouched, so an
  exported progress file carries no UI cursor.
- **"Card" completion is the existing 2-state rule** (`Progress.isItemComplete`:
  all tasks checked). No new "partial" state is stored — "partial" just means
  "not complete", and the resume rule lands you on it.

## Design

### Data — one optional field

`src/domain/types/entities.ts`:

```ts
interface Session {
  activePackId?: string;
  themeId?: string;
  cursors?: Record<string, string>; // packId → last-open itemId
}
```

The session store is free-form/unvalidated, so this is additive and safe.

### Resume rule — generalize `defaultItemId`

The whole feature is: start the existing "first incomplete" scan at the **stored
cursor's position** instead of index 0. `defaultItemId()` is replaced by:

```ts
private resumeItemId(): string {
  const storedId = this.deps.sessionStore.load().cursors?.[this.pack.id];
  const at = storedId ? this.allItems.findIndex((it) => it.id === storedId) : -1;
  for (let j = at >= 0 ? at : 0; j < this.allItems.length; j++) {
    const it = this.allItems[j]!;
    if (!it.rest && !this.progress.isItemComplete(it)) return it.id;
  }
  return this.allItems[this.allItems.length - 1]!.id;
}
```

Behavior, scanning **from** the stored card:
- stored card partial → not complete → returned immediately (**resume it**);
- stored card complete or rest → skipped, scan continues (**next unfinished**);
- earlier skip → never revisited on open (forward-only);
- no/invalid stored cursor → scan starts at 0 → **today's exact behavior**.

Used at the three sites that currently call `defaultItemId()`: `init()`,
`selectPack()`, `importProgress()`.

### Persistence points

Persist the cursor whenever the user moves to a card — in `selectItem()`
(card-map click, day dropdown) and `goToItem()` (prev/next, "next day" CTA). Not
on task-toggle: you stay on the card, and the resume rule already does the right
thing next time (complete → advance, partial → resume).

```ts
private persistCursor(): void {
  const sess = this.deps.sessionStore.load();
  sess.cursors = { ...(sess.cursors ?? {}), [this.pack.id]: this.currentItemId };
  this.deps.sessionStore.save(sess);
}
```

## Testing (`test/domain/tracker.test.ts`)

Multi-card pack (`c1..c4`, one task each). Seed session cursor + completed items,
then assert `t.init()`'s resulting `todayCard().itemId`:
- cursor on a partial card with an *earlier* skip → resumes the cursor card (not
  the earlier skip);
- cursor on a complete card → advances to the next unfinished card (skips the
  earlier skip);
- no cursor → first incomplete (unchanged);
- stale cursor id (not in pack) → first incomplete;
- `selectItem`/`goToItem` write `cursors[packId]` to the session store.

Existing `selectPack` test still holds (no cursor stored → start-at-0 fallback).

## Build

`index.html` loads `dist/sunrise.js`; run `npm run build` for the app to reflect
the change (tests run against `src` directly).

## Out of scope

Backfilling earlier skips on open (explicitly decided against); any UI surface
for the cursor (it's invisible plumbing); cross-device cursor sync.
