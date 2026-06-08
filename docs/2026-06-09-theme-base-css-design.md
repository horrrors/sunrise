# Sunrise — Shared Theme Base (mechanism + tokens) — Design

**Date:** 2026-06-09 · **Status:** approved for implementation

## Goal

Stop every theme from re-implementing the same **mechanism** CSS. Move the
handful of rules that are universal (one sane value, not aesthetic) into the
app's shipped baseline, and expose *appearance* through a CSS variable so a theme
decides only **how** something looks — starting with the keyboard focus
highlight (`--focus-ring`).

## Context

`docs/plugins/theme.md` makes a deliberate architectural promise: the app "ships
almost no CSS," every theme rule is **scoped** to `:root[data-theme="<id>"]`, and
a theme is a self-contained, drop-in, AI-authorable stylesheet. Only **one**
theme's CSS is ever loaded (the `#themeCss` link's `href` is swapped), so the
duplication is **not** runtime bloat — the cost is *maintainability* (change a
recipe → edit 15 files) and *drift*.

A cross-theme rule analysis (15 files, ~2,300 distinct rules) showed themes share
the same *responsibilities* (~200 hooks each) but almost no identical rule
*bodies* (e.g. `bonus` 2/195, `japanese` 3/168 identical). The only genuinely
duplicated rules are **mechanism**: `box-sizing` reset (13/15), hide-native-
checkbox (11/15), and reduced-motion guards. That is the safe extraction surface;
pushing further (moving layout into a base) would fight the themes' intentional
divergence and the contract.

## Decisions (locked during design)

- **Base = mechanism + tokens.** Common code owns the selector + behavior; the
  theme sets a CSS variable for appearance. Worked example: the focus highlight.
- **The base is the existing inline `<style>` in `index.html`.** It is already
  the app's baseline layer (it holds `cm-grid`, `task-hint`, and the focus rule).
  No new file, loads before the theme, no FOUC. (Rejected a separate `base.css`:
  a new file + first-paint flash for no real gain on a local app.)
- **Extraction set (decoupled + universal only):** `box-sizing` reset,
  hide-native-checkbox, one blanket reduced-motion guard, and the tokenized focus
  highlight. Each is then **deleted from all 15 themes**.
- **Excluded on purpose:** `.modal.open{display:flex}` and `#motd.motd-out`
  (coupled to scoped `.modal`/`#motd` rules → an unscoped base rule loses on
  specificity and silently breaks show/hide), and `#fx` (varies: `aurora-noir`
  `z-index:80`, `solarpunk` `position:relative`). These stay in themes.
- **Specificity rule.** Themes scope to `:root[data-theme="x"]` (more specific
  than unscoped base). Base only wins where the theme's competing rule is *fully
  removed*, so we extract only **decoupled** rules and delete every variant. Until
  a theme's copy is deleted, the theme keeps winning (same value → no change), so
  the rollout is safe step by step.

## Design

### Base additions (inline `<style>` in `index.html`)

Add, alongside the existing baseline rules:

```css
/* app baseline — mechanism every theme shares; themes set tokens / override behavior only */
*,*::before,*::after{box-sizing:border-box}
.task input{position:absolute;opacity:0;width:0;height:0;pointer-events:none}
@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}}
```

And **tokenize** the focus rule already present (currently
`outline:3px solid var(--yellow,#f6c343)`):

```css
#taskList .task:has(input:focus-visible){outline:var(--focus-ring,3px solid var(--accent,#f6c343));outline-offset:3px;border-radius:var(--r,8px)}
```

- `--focus-ring` is the **how**: a theme sets e.g. `--focus-ring:2px solid #0ff`.
- Default is `3px solid var(--accent,#f6c343)` — themes that define `--accent`
  get a matching ring for free; others fall back to the card-map gold.

### Per-theme deletions

From **each** `themes/*.css`, delete the now-shared rules (every observed
variant):

- **box-sizing**: the scoped/unscoped reset, e.g.
  `:root[data-theme="x"] *{box-sizing:border-box}`,
  `*,*::before,*::after{box-sizing:border-box}`, and `japanese`'s
  `*::after{box-sizing:border-box}`. (Some themes have none — nothing to delete.)
- **hide-checkbox**: the `.task input{…}` / `.task input[type=checkbox]{…}` rule
  whose body hides the box (`position:absolute;opacity:0;…`). The base rule
  covers all observed bodies (incl. `aurora-noir`'s `pointer-events` variant).
- **reduced-motion**: the entire `@media (prefers-reduced-motion: reduce){…}`
  block (blanket or targeted) — base ships one blanket guard.

**Keep** everything else, including the 4 themes' existing
`.task input:focus-visible + .box{…}` focus rules (harmless; they may *optionally*
be replaced by setting `--focus-ring` later — out of scope here).

### Contract doc update (`docs/plugins/theme.md`)

Keep the contract truthful now that the app ships a bit more baseline:

- **§3** (inline `<style>` listing): add the three new baseline rules + the
  tokenized focus rule.
- **§4** (runtime contract): add `--focus-ring` to the app-provided token list
  ("set it to restyle keyboard focus; default is `3px solid var(--accent,#f6c343)`").
- **§5** ("hide the native checkbox"): note the app now hides it — you only style
  `.box`; you no longer write the hide rule.
- **§7** (reduced motion): note the app ships the blanket guard — you no longer
  add your own.
- **§8** (hook checklist): mark checkbox-hiding and reduced-motion as
  app-provided.

## Testing

No CSS-rendering tests exist, so add **file-content guard tests** in a new
`test/themes/base-dedup.test.ts` (picked up by the existing
`node --test "test/**/*.test.ts"`):

- For every `themes/*.css`: assert it contains **no** `box-sizing`, **no**
  `prefers-reduced-motion` block, and **no** `.task input` hide rule (regex:
  `.task input` … `position:absolute`). Proves the extraction happened and stays
  done.
- For `index.html`: assert the inline `<style>` contains
  `box-sizing:border-box`, `.task input{` with `opacity:0`,
  `prefers-reduced-motion`, and the focus rule with `--focus-ring`.

The existing 94 tests are unaffected (no TS/runtime change). **Manual browser
spot-check** required (CSS rendering isn't unit-testable): load `bonus`
(default), one expressive theme (`japanese` or `aurora-noir`), and one
default-follower (`blueprint`); verify the page lays out, the checkbox shows only
`.box`, completing a day still works, and `↓`/`↑` shows the focus outline.

## Out of scope

- Moving layout (`.day-rail`, `.today`, `.dash`, modal backdrop, responsive
  `@media` stacking) into the base — themes diverge here by design.
- Extracting `#fx`, `.modal.open`, `#motd.motd-out` (per the specificity/variance
  reasons above).
- Replacing the 4 themes' bespoke `.box` focus rules with `--focus-ring`
  (optional polish, later).
- A separate `base.css` file or any CSS build step.
