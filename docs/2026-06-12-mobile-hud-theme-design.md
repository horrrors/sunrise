# Sunrise Mobile — HUD-as-a-Theme

- **Date:** 2026-06-12
- **Status:** Approved design — ready for implementation planning
- **Sequencing:** "Phase 0" — lands before the PWA work in
  `2026-06-12-sunrise-android-pwa-sync-design.md` (which is unaffected: its service-worker
  precache already globs all of `themes/`).

## 1. Problem & chosen direction

The current mobile rendering is the desktop layout squeezed by 17 per-theme ad-hoc
`@media` tweaks. The user rejected it *by design*, and in a visual session picked a
**game-HUD bottom-dock layout** (over a top-HUD variant) with three hard requirements:

1. **One-line header** — brand + day counter, nothing else.
2. **Stats as micro bars** — HP/mana-style (streak, progress), not stat cards.
3. **Today card is the hero** — starts at the top, ~70% of the viewport, zero scrolling
   to reach today's tasks.

Plus the dock itself: streak bar + progress bar + 🗺️ 🏆 ☰ buttons in the bottom thumb
zone. Tapping the bars opens the full stats; ☰ opens the menu (pack/theme/day,
export/import). Day switching: swipe on the card (primary) + small ‹ › near the item
title. Desktop rendering of existing themes stays exactly as today.

## 2. Delivery model (the architectural decision)

**The mobile HUD ships as one ordinary theme plugin.** The app grows only *hooks and
behavior*; one new `themes/*.css` + one `registerTheme` line delivers the experience —
"enable THAT theme and it works ideally in browser and on a phone."

| Decision | Choice | Why |
|---|---|---|
| Who owns mobile layout | **A theme** (one new plugin), not an app-level transform | Simplest; zero changes to 17 existing themes; consistent with the plugin architecture that is this project's primary deliverable. Any future theme can adopt the same hooks ("full customizability"). |
| App's contribution | **Structure + behavior only**: `#dock` markup, bar data fill, sheet toggling, swipe | These cannot be done in CSS; appearance can. Same split as the card-map (`.cm-*`) hooks. |
| Existing-themes invariant | Baseline ships `#dock{display:none}`; the sheets are reachable **only** through the dock | A theme that never styles `#dock` is pixel-identical to today — hard, testable guarantee. The one always-on addition is the swipe gesture, which maps to the existing prev/next intents and changes no rendering. |
| Duplicate surfaces | **None — CSS relocation.** The ☰ menu sheet *is* the existing `.toolbar`; the stats sheet *is* the existing `#dashboard`; the controller only toggles `.open` classes | Nothing renders twice; old themes ignore `.open` (their toolbar/dashboard are always visible inline). |
| Auto-enabling HUD theme on small screens | **No** — the user switches theme once per device; `Session.themeId` is per-device and persists | Magic theme-switching fights the explicit-plugin model; one manual pick is acceptable. |

## 3. App changes (one rebuild of `dist/sunrise.js`)

### `index.html` (canonical hooks + baseline)
- New `#dock` element (sibling of `.foot`):
  - two bars — `.dock-bar[data-kind="streak"]`, `.dock-bar[data-kind="progress"]`, each
    containing `.dock-bar-fill` and `.dock-bar-val`;
  - three buttons — `#dockMapBtn`, `#dockTrophiesBtn`, `#dockMenuBtn`.
- Baseline `<style>` additions: `#dock{display:none}` and nothing else — appearance is
  100% theme-owned (consistent with the theme-base doc's "mechanism + tokens" rule:
  this is mechanism's OFF state).

### `DomRenderer`
- During the existing render pass, fill the dock from the same view-models the dashboard
  uses: set `.dock-bar-fill` inline `width: <pct>%` and `.dock-bar-val` text
  (streak: `Nd`, fill rule per §7; progress: `done/total`, fill = done/total).
  No new domain or VM computation — only reuse.

### `DomController`
- `#dockMapBtn` / `#dockTrophiesBtn` → the existing card-map / trophies intents.
- `#dockMenuBtn` → toggle `.toolbar.open`; tapping the dock bars → toggle
  `#dashboard.open`. Opening one sheet closes the other; `Esc` and the existing
  modal-dismiss patterns close both; any toolbar action (e.g. theme picked) closes the menu.
- **Swipe** on `#todayCard`: `touchstart`/`touchend`, horizontal threshold (~50px,
  mostly-horizontal), → existing prev/next-day intents. Registered always; harmless
  without touch input. Guarded against swipes that start in scrollable/typing targets.
- No `Tracker`/domain/ports changes. **Zero data-model impact.**

## 4. The HUD theme (one new plugin file)

A normal `sunrise.theme/v1` CSS file + one `registerTheme` line in `index.html` — no
rebuild, exactly like the other 12 registered themes.

- **Desktop (wide):** a complete, full-fledged skin like any other theme; dock hidden
  (or used decoratively — theme's call).
- **Narrow (`@media ≤ 640px`):** the bottom-dock HUD:
  - header collapses to one line (brand + `DAY n/m`); `.toolbar` becomes a hidden
    bottom sheet shown via `.toolbar.open`;
  - `#dashboard` becomes a hidden bottom sheet shown via `#dashboard.open`
    (`.section-title`s hidden);
  - today card from the top, fills remaining height above the dock; fat touch rows;
  - `#dock` visible: bars + buttons in the thumb zone; `#motd` as a tiny line above it;
  - `.day-nav` ‹ › repositioned small beside the item title (swipe is primary);
  - its own modals go phone-friendly: full-screen panels, `.cm-card` cells ≥ 40px —
    the touch/modal issues get fixed *inside this theme*, not globally.
- **Art direction:** open item (see §7) — candidates: LCD/tamagotchi, RPG quest-log,
  synthwave HUD (kin to the arcade family), modern console UI. Per stated taste:
  structurally playful beats restrained palette swaps.

## 5. Docs

- `docs/plugins/theme.md`: document the new canonical hooks — `#dock` structure, the
  renderer's fill contract (inline `width`% on `.dock-bar-fill`, text in `.dock-bar-val`),
  the `.open` sheet classes on `.toolbar`/`#dashboard`, and the baseline
  `#dock{display:none}` (a theme must explicitly show it). Keeps the guide
  self-contained for LLM-authored themes.
- `docs/FEATURES.md`: one section on the mobile HUD (what it is, how to enable).

## 6. Testing

- **Controller (fake-DOM harness):** dock buttons fire the right intents; ☰/bars toggle
  the `.open` classes and the sheets are mutually exclusive; swipe past threshold
  changes day (and sub-threshold / vertical / typing-target swipes don't); dock bar
  fill + value update after a task tick.
- **Invariant guard (file-content test, like `base-dedup`):** no existing
  `themes/*.css` (except the new HUD theme) mentions `#dock`, `.toolbar.open`, or
  `#dashboard.open` (plain `.modal.open` is legitimately everywhere) — proves old
  themes can't engage the new surfaces; `index.html` baseline contains
  `#dock{display:none}`.
- **Build:** `npm run build` + commit `dist/` same-change; existing `dist-sync` test
  keeps that honest. `npm run typecheck`, full `node --test`.
- **Manual:** narrow desktop window + a real Android phone via LAN dev check: hero card
  visible without scrolling, both sheets, swipe, all dock buttons; then sanity-load 2–3
  old themes and confirm pixel-status-quo.

## 7. Open items for planning

- Theme id/name + art direction (pick from the four candidates at implementation; can
  be a quick visual-companion round).
- Streak-bar fill rule (vs-best-streak or a capped target like 30d) — pick one, document it.
- Whether ‹ › repositioning is worth it at all once swipe exists (default: keep, tiny).

## 8. Out of scope

- Touching any of the 17 existing themes (including their current mobile squeezes).
- Auto-detecting mobile / auto-switching themes.
- App-level responsive layout for all themes (rejected: per-theme identity is the
  product; the hooks make mobile-readiness opt-in per theme).
- PWA install/offline/sync — separate, already-approved design.
