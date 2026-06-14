# Theme motion + switch-transition — design spec

**Date:** 2026-06-14 · **Branch:** `feat/theme-animations` · **Status:** approved, no-commit (preview by opening `index.html`)

## Goal

Two things, one mechanism:

1. **Theme-switch transition** — switching themes is an instant style flip today (`DomRenderer.applyTheme`). Add one global cross-fade so every switch dissolves.
2. **Per-theme personal animation** — every one of the 17 themes gets its own *entrance* (plays when you switch into it) and its own *idle signature* (continuous ambient loop). The 6 already-rich themes are refined + given an entrance; the other 11 get fresh motion.

Structure decision: **pure per-theme CSS** (each `themes/X.css` owns its keyframes). The only shared piece is the cross-fade. Keeps themes self-contained / paste-able into the plugin guide; community themes add motion the same way.

## Layer 1 — shared cross-fade (the only global change)

**CSS** — in `index.html`, the baseline `<style>` "mechanism every theme shares" block (~line 54):

```css
body{transition:opacity .16s ease}
:root.theme-switching body{opacity:.18}
```

**JS** — `src/adapters/dom-renderer.ts`, `applyTheme(href,id)`. Sequence (the proven one from the validated demo — fade down → swap at the trough → fade up):

1. Start loading the new sheet in a parallel `<link>` (as today, for no-FOUC).
2. **Immediately** add `theme-switching` to `documentElement` → body begins fading **down** (.16s).
3. When the new sheet's `onload` has fired **and** the dip has had time to land (wait `max(0, FADE_MS − elapsed)`, `FADE_MS ≈ 170`, measured via `performance.now()` — adapter may use it): swap `link.href`, set `data-theme` (the swap happens invisibly at the trough), then `requestAnimationFrame(() => documentElement.classList.remove('theme-switching'))` → body fades **up** under the new palette, at which point each theme's entrance keyframes fire (the `:root[data-theme="X"]` rules begin matching). Net ≈ 340ms cross-dissolve.
- **Skip the dip entirely (old instant swap) when:** (a) first application at boot — entrance alone is enough, no flash-dip (track with an instance "have-applied" flag); (b) same-href reselect (already early-returns); (c) `window.matchMedia('(prefers-reduced-motion: reduce)').matches` — go straight to swap, no class, no delay.

**Why it degrades correctly:** it's an opacity *transition*. Line-57 `@media (prefers-reduced-motion)` zeroes `transition-duration` → instant swap. The mobile kill (line 71/73) only strips `animation`/`filter`/`transform`/`perspective` — not `opacity`/`transition` — so the fade runs on phones.

**Test:** add one adapter test (fake-DOM harness in `test/adapters/`) asserting `applyTheme` adds `theme-switching` and removes it after the swap; and that a same-href call early-returns without it.

## Layer 2 — per-theme entrance + idle signature

**Pattern** (each theme file, under its `:root[data-theme="X"]` scope):

```css
@keyframes X-enter { /* opacity + transform only */ }
@keyframes X-amb   { /* transform + opacity only, loops */ }
:root[data-theme="X"] <signature-el>{
  animation: X-enter .45s ease both, X-amb 5s ease-in-out .45s infinite;
  will-change: transform;
}
```

Entrance plays once on activation (and replays on every switch-in, because the rule starts matching again); ambient starts after a delay equal to the entrance duration. If entrance and ambient target different elements, no comma-join needed.

### Hard rules (every theme, non-negotiable)

1. **Compositor-only motion.** Loops and entrances animate **only `transform` and `opacity`**. `filter`/`box-shadow`/`backdrop-filter` may be used for static look but **never animated**. Moving textures (scanlines, sheens, gradient drift) are done by `translate`-ing an oversized layer, **not** by animating `background-position`. (Validated live: animated filter/background-position caused the first-switch FPS drop.)
2. **Unique keyframe names.** Prefix every new keyframe per theme (`jp-`, `bp-`, `mem-`, `os95-`, `dawn-`, `em-`, `au-`, `dash-`, `bonus-`, `neon-`, `arc-`, `sp-`, `bau-`, `gz-`…). `@keyframes` names are global and old+new sheets briefly coexist during the swap — generic names (`flicker`, `taskIn`) could bleed across themes.
3. **Mobile-safe placement.** Signatures must run on mobile. The mobile kill targets only `body` and `.app-header` (`animation:none` on those elements). So: anchor signatures on **child/pseudo elements** (`.brand-mark`, `.wrap`, `.ring`, `body::before`, `#fx`, `.cm-card`, decorative pseudo-elements). If a signature must live on `body`/`.app-header`, add a targeted `:root[data-mobile] <sel>{animation:… !important}` re-enable — **only** for cheap `transform`/`opacity` loops; never re-enable animated filters/backdrop on mobile.
4. **No per-theme reduced-motion guards.** Rely solely on the global line-57 reset. Remove any existing per-theme `@media (prefers-reduced-motion)` blanket `animation:none` clauses as redundant.

Keep idle motion subtle and slow (4–8s loops, small amplitude) so it reads as "alive," not "busy." Match intensity to the theme's personality (Swiss/Emerald/Gazette near-imperceptible; Memphis/Arcade lively).

## The 17 themes

Each agent **reads its own `themes/X.css` first** to use the real selectors it already styles, then implements an entrance + idle signature per the concept below. Concepts are direction, not literal code — adapt to what exists in the file. Refine (don't delete) the existing good motion in the 6 rich themes, and add an entrance.

| id | file | idle signature | entrance |
|---|---|---|---|
| bonus | bonus.css | halftone dot-field slow drift (translate an oversized dot layer behind content) | cards "stamp in": scale 1.04→1 + tiny rotate settle |
| neon | neon.css | scanline overlay scrolls (translateY oversized layer) + neon-tube opacity respiration on accent rule | neon "power-on" opacity flicker (2–3 steps) |
| japanese | japanese.css | seigaiha wave pattern pans horizontally (translateX) | sumi reveal: opacity + slight translateY (no blur animation) |
| emerald *(static→)* | emerald.css | brass sheen: a highlight gradient translateX across a static brass rule under the header | gallery fade-up: opacity + translateY, staggered cards |
| dashboard | dashboard.css | brand-mark gradient hue feel via slow opacity/transform pulse (no bg-position) | cards "deal in": staggered translateY/opacity |
| dawn *(rich)* | dawn.css | keep sun halo/rays/ember; ensure transform/opacity only | sunrise: app opacity-rise + translateY |
| arcade *(rich)* | arcade.css | keep CRT — convert any animated `filter:brightness` to an opacity-overlay flicker; scanline via translate | CRT power-on: scaleY line + opacity flash overlay |
| solarpunk | solarpunk.css | foliage/vine sway on a decorative border element (rotate/translate) | "grow in": scale 0.98→1 + opacity |
| swiss | swiss.css | restrained: red grid-accent metronome (scaleX or small translate, slow) | keep + refine the existing staggered grid reveal |
| bauhaus | bauhaus.css | a corner primary-shape (circle/triangle) slow rotation | geometric "assemble": cards slide in from alternating axes |
| blueprint *(rich)* | blueprint.css | keep plotter-scan beam (translate) | "draw-in" clip-path/scale wipe on the dashboard |
| memphis | memphis.css | decorative squiggle/dot jiggle (rotate/translate) | "pop in" with overshoot (scale cubic-bezier) |
| arcade-animated | arcade-animated.css | synthwave **sun** pulse/glow (transform/opacity) — distinct from siblings | horizon glow sweep (translate) |
| arcade-animated-v2 | arcade-animated-v2.css | keep receding cyber grid (translate); opacity-overlay flicker if any filter flicker exists | grid "boot up" from horizon (translate/opacity) |
| aurora-noir *(static→)* | aurora-noir.css | aurora violet→teal glow drifts across `body::before`/`.wrap::before` (translate + opacity) | aurora bloom from center (scale + opacity) |
| gazette *(static→)* | gazette.css | hairline press-rule under nameplate pulses (scaleX/opacity, restrained) | "off the press": opacity + small translateY slide |
| os95 *(rich)* | os95.css | keep marching copy-blocks + marquee (already translate-based) | Win95 window "open": scale-from-small + opacity |

## Build, test, no-commit

- Editing theme CSS forces `npm run build` (regenerates content-hashed `sw.js`; `test/pwa/pwa-shell.test.ts` enforces freshness). Editing `dom-renderer.ts` forces a `dist/sunrise.js(.map)` rebuild. Verify whether the `index.html` baseline edit needs a precache bump and let the pwa-shell test confirm.
- Gate: `npm run build` → `npm test` → `npm run typecheck` → `npm run lint` → `npm run format:check`. All must pass.
- **Leave everything uncommitted.** User previews by opening `index.html` and commits when satisfied.

## Execution

- Fan out one agent per theme file (17, independent files → no cross-file contention, no worktree needed). Each implements its row per the hard rules.
- In parallel, implement Layer 1 (cross-fade: `index.html` baseline + `dom-renderer.applyTheme` + adapter test) directly.
- After both: `npm run build` + full gate. Spot-check a few theme diffs for rule compliance (transform/opacity only, unique keyframe names, mobile-safe placement). Report; user does visual QA in the app.
