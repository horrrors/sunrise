# Theme-model hardening & expansion — design

**Date:** 2026-06-21
**Status:** approved (brainstorm), pending implementation plan
**Scope:** the theme model only. No roster changes (all 17 themes stay).

## Context

A theme is pure CSS scoped to `:root[data-theme="<id>"]`, hot-swapped by mutating
one `<link href>` with a cross-fade. The app→theme contract is thin: a `data-theme`
attribute plus a few injected CSS vars (`--track-<id>`, `--p`, confetti vars); the
rest is author convention. An analysis surfaced five issues this design addresses:

1. **16/17 themes `@import` `fonts.googleapis.com`** — breaks `file://`, absent from
   the PWA precache, phones a third party. The authoring guide (`theme.md` §7)
   actively instructs authors to do this, so every new generation re-adds it.
2. The §7 **keyframe-prefix rule** exists only to dodge a cross-fade name collision;
   it is unenforced and already violated by 7 themes (`taskIn` in 4).
3. A **bad `cssHref` fails silently** and the broken id stays persisted (sticks across
   reloads).
4. **Validation is manifest-only** — theme CSS content is never checked.
5. Themes can only react to `--track-*`/`--p`; there's no app-state surface to build
   richer, state-reactive themes on.

## Decisions (locked)

- **Self-host all 31 font families** currently used (faithful "do it ourselves";
  est. ~100–150 woff2, ~2–3 MB precache). Subsets limited to `latin`, `latin-ext`,
  `cyrillic` (the app is EN/RU only).
- **Relax, don't enforce** the keyframe-prefix rule — make collisions structurally
  impossible instead (workstream B), then downgrade the rule to optional.
- **Expand** the sanctioned surface with three app-state vars: `--sunrise-progress`,
  `--sunrise-streak`, `--sunrise-hour`. No structural/layout capabilities (declined).
- The new hard validation rule is **no remote URLs** (build guard + runtime check),
  not prefix policing.

## Non-goals

- No theme removed or rewritten beyond deleting its `@import` line.
- No keyframe-prefix or animated-`filter` *hard* guard (both stay advisory in docs —
  enforcing them now would force churn on existing themes).
- No registration-path unification, discriminated-union `Theme` type, or IndexedDB
  blob persistence (rejected as over-engineering for a single-user offline app).

---

## A — Offline self-hosted fonts

**New `scripts/fetch-fonts.mjs`** (run manually, *not* part of `npm run build`):
- For each theme's Google Fonts `@import` URL, fetch the CSS with a modern
  `User-Agent` (so Google serves woff2), keep only the requested weights and the
  `latin`/`latin-ext`/`cyrillic` subsets, download each woff2 into `fonts/`, and
  **emit `fonts.css`** with `@font-face` rules whose `src` points at the local files.
- `fonts/` and `fonts.css` are committed build artifacts (like `dist/`, `sw.js`).
  The script is the only thing that touches the network; the regular build stays
  offline and deterministic. Re-run it only when font usage changes.
- Licensing: the families in use are OFL/Apache; self-hosting is permitted.

**`index.html`**: add `<link rel="stylesheet" href="fonts.css" />` in `<head>`
(always loaded, never swapped). `@font-face` is lazy, so declaring all 31 families
downloads only those a live theme actually uses. Imported JSON themes get the
library for free (it's always present).

**16 theme files**: delete the `@import url('https://fonts.googleapis.com/…')` line.
No other CSS changes — `font-family: 'Press Start 2P'` etc. now resolve from
`fonts.css`. (`os95.css` already uses no web fonts; untouched.)

**`scripts/gen-sw.mjs`**: add `'fonts.css'` and `...list('fonts', '.woff2')` to
`ASSETS`. The staleness test (`test/pwa/pwa-shell.test.ts`) then enforces a rebuild
when fonts change.

**Acceptance:** no theme or `fonts.css` references a remote URL; themed fonts render
offline (`file://`) and after PWA install; `npm run build` stays network-free.

## B — Cross-fade root-fix (kills keyframe collisions)

In the `index.html` baseline `<style>`, beside the existing `theme-switching` rule,
add:

```css
:root.theme-switching *, :root.theme-switching *::before, :root.theme-switching *::after { animation: none !important; }
```

During the ~170ms dip (opacity .18, invisible) no animation runs, so the two briefly
coexisting stylesheets can't resolve a shared `@keyframes` name to the wrong body.
The new theme's entrance still fires — it plays on fade-up, *after*
`theme-switching` is removed. This is an `animation` kill; the opacity *transition*
(the fade itself) is untouched, as is the reduced-motion behavior.

**Acceptance:** switching between two themes that share an unprefixed keyframe (e.g.
`taskIn`) shows no cross-bleed; the entrance animation still plays after the swap.

## C — Expanded app-state CSS vars

`DomRenderer` gains `applyAppState({ progress, streak, hour })` that sets, on
`document.documentElement`:
- `--sunrise-progress` — overall completion %, unitless 0–100
- `--sunrise-streak` — current streak, integer days
- `--sunrise-hour` — local wall-clock hour 0–23 (updates on re-render, not live)

Wiring: `Projections` exposes an `appState()` view-model `{ progress, streak, hour }`;
`progress`/`streak` come from the existing dashboard computation, `hour` from the
`Clock` port via `Tracker` (domain purity preserved — no `Date` in the domain).
`DomController` calls `projections.appState()` each render and passes it to
`renderer.applyAppState(...)`. Namespaced `--sunrise-*` so they never collide with
theme-defined tokens.

**Acceptance:** after a render the three vars are present on `<html>` with correct
values (unit test with the fake DOM + fake clock).

## D — Validation backing it all

**New build guard** `test/themes/offline-guard.test.ts`:
- Scan `themes/*.css` + `fonts.css`: assert no `http(s)://` and no protocol-relative
  `//` inside `url()`/`@import` (allow `data:` and relative paths).
- Assert `index.html` ships the workstream-B `theme-switching` animation kill (pin
  it the way `mobile-guard.test.ts` pins baseline rules).

**Runtime check** in `ThemeValidator.parse` (`src/domain/validators.ts`): when a theme
carries inline `css`, reject it if the CSS contains a remote URL (same pattern as the
build guard; `data:` allowed). Turns the guide's "only import themes you trust"
warning into enforcement.

**Keep** the existing guards: `mobile-guard` (phone-range media queries, HUD baseline,
HUD tokens) and `base-dedup` (no per-theme reduced-motion).

**Acceptance:** build guard fails on any remote URL in a shipped theme or `fonts.css`;
`ThemeValidator` rejects an imported theme whose inline `css` `@import`s a remote font
and accepts one using a `data:` URL or a bundled family.

## E — Theme-load-failure fallback

`DomRenderer.applyTheme(href, id, callbacks?)` gains an optional
`callbacks.onError`. The existing `loader.onerror` path (keep the current theme +
console error) also invokes `onError`.

`DomController` tracks the last successfully-applied theme id. On a theme pick it sets
the new id optimistically; if `onError` fires it reverts `Tracker.selectTheme(...)` to
the previous good id, re-renders the selector (so the dropdown matches reality), and
re-applies the previous theme's href. A broken `cssHref` can no longer be persisted
and stick across reloads.

**Acceptance:** simulating a failed `<link>` load reverts the Tracker selection and
re-renders the selector to the previous theme; the broken id is not written to the
session store.

## F — Docs sync (`theme.md` + `CLAUDE.md`)

`docs/plugins/theme.md`:
- §1: note `fonts.css` is always loaded; note imported inline `css` with remote URLs
  is rejected.
- §4: add `--sunrise-progress` / `--sunrise-streak` / `--sunrise-hour` to the injected-
  vars list.
- §7 **Fonts**: rewrite from "@import Google Fonts … degrades on file://" to "use a
  bundled family (list the 31) or a system stack; **remote URLs/`@import` are rejected**.
  Just `font-family: '…'` — `@font-face` is shipped." Remove the `@import` instruction.
- §7 **Motion**: downgrade the keyframe-prefix rule to *optional* ("the app neutralizes
  animations during the cross-fade, so names can't collide; prefixing is still tidy").
- §10 prompt: drop the `@import` step and the prefix mandate; mention available families.

`CLAUDE.md`: update the Plugins/themes section — keyframe-prefix is now optional (app
handles it), themes load fonts from `fonts.css` (no remote `@import`), the no-remote
validation rule, and the new `--sunrise-*` vars. (Per the "living docs" convention:
conventions live in the guides + a guard test, not only in prose.)

---

## Testing & build

- `npm run typecheck`, `npm test`, `npm run lint`, `npm run format:check`.
- New tests: offline-guard (no remote + cross-fade rule), `ThemeValidator` remote-css
  rejection, `applyAppState` vars, load-fail revert.
- `npm run build` after `src/` edits (DomRenderer, validators, projections, tracker,
  controller) regenerates `dist/sunrise.js` + `sw.js`; after fonts + `@import` removal
  it regenerates `sw.js` (new precache list + content hash).
- **This session: do not commit.** Artifacts are normally committed alongside their
  source per repo workflow; here they stay unstaged.

## Risks & edge cases

- **`fetch-fonts` needs network.** If the environment is sandboxed, run it via
  `! node scripts/fetch-fonts.mjs` so its output lands in the session. Outputs are
  committed so the build never needs the network again.
- **Google URL/hash drift** → mitigated by committing `fonts/` + `fonts.css` and not
  running the fetch in `npm run build`.
- **Cyrillic coverage.** Some display faces (e.g. Press Start 2P) have no Cyrillic;
  RU text in them falls back — pre-existing and acceptable for Latin/symbolic display
  fonts.
- **`animation:none` during switch** must not kill the opacity fade (it's a
  transition, unaffected) or the entrance (fires after the class is removed) — verify
  in a real switch.
- **Payload** ~2–3 MB of woff2 is a one-time PWA precache; acceptable for offline.

## Open questions

None — font scope (all 31) and app-state vars (all three) confirmed.
