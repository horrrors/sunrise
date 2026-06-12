# Sunrise Mobile — App-Level HUD (all themes)

- **Date:** 2026-06-12 (revision 2, same day — delivery model reversed at user direction:
  from "HUD as one theme plugin" to **app-level mobile mode for every theme**)
- **Status:** Approved design — ready for implementation planning
- **Sequencing:** "Phase 0" — lands before the PWA work in
  `2026-06-12-sunrise-android-pwa-sync-design.md` (unaffected by this: its service-worker
  precache already globs all of `themes/`).

## 1. Problem & chosen direction

The current mobile rendering is the desktop layout squeezed by 17 per-theme ad-hoc
`@media` tweaks. The user rejected it *by design* and, in a visual session, picked a
**game-HUD bottom-dock layout** (over a top-HUD variant) with three hard requirements:

1. **One-line header** — brand + day counter, nothing else.
2. **Stats as micro bars** — HP/mana-style (streak, progress), not stat cards.
3. **Today card is the hero** — starts at the top, ~70% of the viewport, zero scrolling
   to reach today's tasks.

The dock: streak bar + progress bar + 🗺️ 🏆 ☰ buttons in the bottom thumb zone. Tapping
the bars opens the full stats; ☰ opens the menu (pack/theme/day, export/import). Day
switching: swipe on the card (primary) + small ‹ › near the item title.

**This applies to every theme automatically.** On a phone, Japanese is a washi-toned
HUD, OS '95 a gray one — same structure, tinted by each theme's own tokens. Desktop
rendering of every theme stays exactly as today.

## 2. Delivery model

| Decision | Choice | Why |
|---|---|---|
| Who owns mobile layout | **The app.** Baseline CSS implements the HUD for all themes; themes only tint (tokens) or deliberately override | One implementation instead of 17; every theme works on phones with zero per-theme work; nothing for the user to enable. |
| Mobile detection | `matchMedia('(max-width: 640px)')` in the composition root toggles **`data-mobile` on `<html>`**, live | This *is* the "auto-detection" — a mode, not a theme switch. All mobile CSS keys off `[data-mobile]`; the breakpoint lives in exactly one place (TS). No `@media` in the baseline, and none in the phone range in themes (wider tablet refinements may stay, §4). |
| Beating theme CSS | Baseline mobile rules carry **`!important`** on layout-critical declarations, strictly scoped under `[data-mobile]` | Themes legitimately style `#dashboard`/`#todayCard` by id; no realistic specificity stack clears ids without an arms race. One contained `!important` block is the honest, predictable mechanism. |
| Per-theme mobile customization | A theme overrides by matching the baseline selector under `[data-mobile]` (+`!important` where the baseline uses it) — later in cascade, the theme wins ties | "Full customizability" survives, documented in `theme.md`. Themes never write width `@media`; `[data-mobile]` is the abstraction. |
| The 17 existing themes | **Delete their phone-squeeze `@media` blocks** (every block with max-width < 900px — the observed squeezes sit at 480–720px). Tablet refinements at ≥ 900px may stay. Desktop rules untouched | They'd fight the HUD. Deletions only; a guard test keeps phone-range media queries out of themes forever. |
| Separate HUD theme | **Dropped** (with its art-direction question) | Dissolved by the app-level model — there's nothing to enable. |
| Relation to the 06-09 theme-base doc | Deliberately amends its "responsive stacking stays in themes" exclusion: **mobile** layout becomes app mechanism; **desktop** layout remains theme-owned | That exclusion was decided while deduplicating desktop rules, not designing mobile. |

## 3. App changes (one rebuild of `dist/sunrise.js`)

### `index.html` (canonical hooks + baseline)
- New `#dock` element (sibling of `.foot`):
  - two bars — `.dock-bar[data-kind="streak"]`, `.dock-bar[data-kind="progress"]`, each
    containing `.dock-bar-fill` and `.dock-bar-val`;
  - three buttons — `#dockMapBtn`, `#dockTrophiesBtn`, `#dockMenuBtn`.
- Baseline `<style>` gains `#dock{display:none}` plus the **`[data-mobile]` HUD block**,
  built from theme tokens with fallbacks (`var(--paper,…)`, `var(--ink,…)`,
  `var(--accent,…)`, `var(--r,…)` — same pattern as the existing `.cm-*` baseline):
  - header collapses to one line; `.toolbar` becomes a bottom sheet (hidden until
    `.toolbar.open`);
  - `#dashboard` becomes a bottom sheet (hidden until `#dashboard.open`);
    `.section-title`s hidden;
  - today card from the top, filling the height above the dock; fat touch rows;
  - `#dock` visible: bars + buttons in the thumb zone; `#motd` a tiny line above it;
  - `.day-nav` ‹ › compact beside the item title (swipe is primary);
  - modals go full-screen; `.cm-card` cells ≥ 40px (the touch/modal fixes ride along
    for every theme).

### `src/main.ts` (composition root)
- One `matchMedia` listener toggles `data-mobile` on `<html>` (set at boot + on change).
  CSS does the rest; no re-render needed on mode flip.

### `DomRenderer`
- During the existing render pass, fill the dock from the same view-models the
  dashboard uses: `.dock-bar-fill` inline `width:<pct>%`, `.dock-bar-val` text
  (streak: `Nd`, fill rule per §6; progress: `done/total`, fill = done/total).
  Rendered unconditionally (cheap; element is display-none on desktop).

### `DomController`
- `#dockMapBtn` / `#dockTrophiesBtn` → existing card-map / trophies intents.
- `#dockMenuBtn` → toggle `.toolbar.open`; tap on the dock bars → toggle
  `#dashboard.open`. Sheets are mutually exclusive; `Esc` closes; any toolbar action
  (e.g. theme picked) closes the menu.
- **Swipe** on `#todayCard`: `touchstart`/`touchend`, mostly-horizontal ~50px threshold
  → existing prev/next-day intents. Registered always (it maps to existing intents and
  changes no rendering); guarded against swipes starting in scrollable/typing targets.
- No `Tracker`/domain/ports changes. **Zero data-model impact.**

## 4. Theme cleanup & contract

- **Cleanup:** from each of the 17 `themes/*.css`, delete the `@media` blocks
  with max-width < 900px (the observed phone squeezes: 480–720px). Keep wider tablet refinements
  (at ≥ 900px, e.g. japanese's 900px two-column fallback) — they don't overlap the HUD. Desktop rules untouched.
- **`docs/plugins/theme.md`:** document the contract — the app sets `[data-mobile]`
  ≤ 640px; the baseline HUD consumes the listed tokens (with fallbacks), so a theme that
  defines its palette tokens gets a matching HUD for free; the override pattern
  (`:root[data-mobile][data-theme="x"] … !important` where needed); the `#dock` hook
  structure + renderer fill contract; the `.open` sheet classes; **never write width
  media queries in a theme.**
- **`docs/FEATURES.md`:** one section on the mobile HUD.

## 5. Testing

- **Controller (fake-DOM harness):** dock buttons fire the right intents; ☰/bars toggle
  the `.open` classes, mutually exclusive, `Esc` closes; swipe past threshold changes
  day (sub-threshold / vertical / typing-target swipes don't); dock bar fill + value
  update after a task tick; `data-mobile` toggles with a faked `matchMedia`.
- **Guard test (file-content, like the base-dedup tests):** no `themes/*.css` contains a
  media query with any `max-width` value below 900px; `index.html` baseline
  contains `#dock{display:none}` and the `[data-mobile]` block.
- **Build:** `npm run build` + commit `dist/` in the same change (`dist-sync` test keeps
  that honest); `npm run typecheck`; full `node --test`.
- **Manual:** real Android phone + narrow desktop window across several themes
  (`bonus`, `japanese`, `os95`, `dashboard`): hero card visible without scrolling, both
  sheets, swipe, all dock buttons; wide desktop: pixel status quo per theme.

## 6. Open items for planning

- Streak-bar fill rule (vs-best-streak or a capped target like 30d) — pick one, document it.
- Exact breakpoint value (default 640px) — one TS constant either way.
- Whether the ‹ › reposition is worth keeping once swipe exists (default: keep, tiny).

## 7. Out of scope

- Any change to any theme's **desktop** look.
- Theme auto-*switching* (meaningless now — mobile is a mode, not a theme).
- Bespoke per-theme mobile art direction (themes *may* add it later via the documented
  override pattern; the baseline ships a functional token-tinted HUD).
- PWA install/offline/sync — separate, already-approved design.
