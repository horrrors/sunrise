# Sunrise Theme Authoring Guide (`sunrise.theme/v1`)

**How to use this file:** paste the whole document into an LLM, fill in the
`{PLACEHOLDERS}` in the **Prompt** at the bottom, and it outputs a complete,
ready-to-install theme. **This file is the entire contract — it is self-sufficient.
You do not need to read the app source or any existing theme.** Everything those
files would tell you (the real DOM tree, the styles the app already ships, the
runtime classes, and the house-style recipes) is reproduced here.

A theme is **pure CSS plus a one-line manifest**. It restyles a fixed set of DOM
hooks the app renders; it contains **no JavaScript and adds no DOM** of its own.

> ⚠️ **The app ships almost no CSS.** There is no reset, no base layout, no
> default spacing — only the inline block in **§3** (which also makes the
> card-map and shortcuts modals work without theme help). Your stylesheet owns
> **the rest of the layout**: page width and centering, the header row, the
> day-rail row, the today card, the dashboard grid, modal positioning, and
> `box-sizing`. If you only set colors, elements collapse into the default block
> flow and **overlap**. Treat the hooks below as a bare, unstyled skeleton you
> must lay out from scratch. **§6 (Layout) is what keeps elements from colliding
> — do not skip it.**

---

## 1. Install

Two ways; the first needs no build.

**A) External (recommended).** Drop the CSS under `themes/` and add one
`registerTheme` call after the app bundle in `index.html`:

```html
<script src="dist/sunrise.js"></script>
<script>
  if (window.SUNRISE) {
    SUNRISE.registerTheme({
      schema:  "sunrise.theme/v1",
      id:      "my-theme",          // lowercase [a-z0-9-], must start with a letter or digit
      name:    "My Theme",          // shown in the theme picker
      version: "1.0.0",
      cssHref: "themes/my-theme.css",
    });
  }
</script>
```

**B) Built-in.** Add the same manifest object to `BUILTIN_THEMES` in
`src/domain/builtins.ts` and rebuild (`npm run build`). Use this only if you are
editing the app itself.

When the user picks your theme the app loads your `cssHref` in a background
`<link>` first, and only once it's ready swaps `#themeCss` to it and sets
`data-theme="<id>"` on `<html>` — switching never flashes unstyled, and a
`cssHref` that fails to load keeps the previous theme applied (error in the
console). Every registered theme is **validated**; an invalid manifest is
rejected (reason logged to the console) and skipped — it never breaks the app.

| field | type | required | notes |
|---|---|---|---|
| `schema` | string | ✅ | exactly `"sunrise.theme/v1"` |
| `id` | string | ✅ | lowercase `[a-z0-9-]`, must start with a letter or digit |
| `name` | string | ✅ | shown in the theme picker |
| `version` | string | ✅ | e.g. `"1.0.0"` |
| `cssHref` | string | ✅ | path to your CSS file |

---

## 2. Scope every rule, and beware the default theme

`<html>` ships as `<html lang="ru" data-theme="bonus">`. Scope **all** your rules
to your own id so they only apply when your theme is active:

```css
:root[data-theme="my-theme"] { /* your variables */ }
:root[data-theme="my-theme"] body { /* page styles */ }
:root[data-theme="my-theme"] .app-header { /* etc. */ }
```

> 🪤 **Gotcha:** until the user selects your theme in the picker, `data-theme`
> stays `"bonus"`, so none of your `[data-theme="my-theme"]` rules apply and the
> page looks unstyled/wrong. That is expected — select your theme to see it.
> `lang` is also rewritten by JS per pack locale, so don't rely on `:lang()`.

> Two legacy built-ins (`bonus.css`, `dashboard.css`) predate this rule and ship
> unscoped; they get away with it only because the app swaps a single `<link>`
> per active theme. Your theme must still scope everything — unscoped rules
> bleed through the moment the stylesheet is loaded alongside another.

The reduced-motion guard (**§8**) is the one block you may leave global.

---

## 3. The page skeleton (what the app renders)

This is the **exact** DOM. Every class/id below is a stable hook; tag names are
shown because the app ships no reset, so default tag margins (`h2`, `p`, `b`)
are yours to neutralize.

```html
<html lang="ru" data-theme="bonus">           <!-- data-theme/lang set by JS -->
<head>
  <style>…tiny inline defaults, see below…</style>
  <link id="themeCss" rel="stylesheet" href="themes/bonus.css">  <!-- href swapped to your cssHref -->
</head>
<body>
  <header class="app-header">
    <div class="brand">
      <span class="brand-mark" lang="ja">日の出</span>
      <span class="brand-name">SUNRISE</span>
      <span class="brand-sub" id="phaseLabel"></span>   <!-- pack's phase label, may be empty -->
    </div>
    <div class="toolbar">                                <!-- ← the controls wrapper -->
      <label class="field"><select id="packSelect"></select></label>
      <label class="field"><select id="themeSelect"></select></label>
      <label class="field"><select id="daySelect"></select></label>
      <button class="btn ghost" id="cardMapBtn">🗺️</button>
      <button class="btn ghost" id="trophiesBtn">🏆</button>
      <button class="btn ghost" id="exportBtn">📤</button>
      <button class="btn ghost" id="importBtn">📥</button>
      <input type="file" id="importFile" hidden>          <!-- keep hidden -->
    </div>
  </header>

  <main class="wrap">                                      <!-- ← the content column -->
    <h2 class="section-title" id="summaryTitle"></h2>
    <section class="dash" id="dashboard"></section>        <!-- 3 or 4 .stat-card (see §4) -->
    <div id="comeback" style="display:none"></div>         <!-- JS toggles inline display (see §4) -->
    <h2 class="section-title" id="todayTitle"></h2>
    <section class="day-rail">                             <!-- ← the ‹ card › row -->
      <button class="day-nav day-prev" id="prevDay">‹</button>
      <section class="today-wrap">
        <article class="today" id="todayCard">       <!-- data-track="<id>" added at runtime -->
          <div class="today-side"><span class="vert">TODAY</span></div>
          <div class="today-main">                   <!-- ACTIVE item; children render in this order,
                                                          each only when the item has it: -->
            <span class="trackpill"><span class="k"></span> Track name</span>
            <h2 class="today-title">…</h2>
            <div class="warm"><span class="warm-i">✦</span> <span class="muted">Warm-up</span> text…
              <span class="task-tools"><button class="copy-btn" id="copyWarm">⧉</button><button class="copy-btn ai" id="copyaiWarm">✨</button></span>
            </div>                                          <!-- only if warmup; tools = copy / AI-copy -->
            <div class="tasks" id="taskList"><!-- task rows, see below --></div>
            <div class="reflect-block"><label class="reflect-label" for="reflect"><span class="kanji">省</span> …</label><textarea id="reflect"></textarea></div>  <!-- only if reflection on -->
            <div class="res-row"><span class="chip"><b>label</b> note</span></div>   <!-- only if resources -->
            <button class="next-day-cta" id="nextDayCta">…</button>  <!-- only when complete AND not the last item -->
          </div>
          <!-- a REST day instead renders: .today-side>.vert, then .today-main with
               <h2 today-title>, an optional <p class="warm"><span class="warm-i">☾</span> prompt</p>
               (NO .muted; only if the item has a reflect prompt; no tasks/reflect),
               and the same optional .next-day-cta#nextDayCta button when not the last item. -->
        </article>
      </section>
      <button class="day-nav day-next" id="nextDay">›</button>
    </section>
  </main>

  <div class="foot"><span id="motd"></span></div>          <!-- footer, motto rotates -->

  <div class="modal" id="cardMapModal" role="dialog">      <!-- hidden until .open added -->
    <div class="modal-panel cardmap-panel">
      <div class="tr-head"><div id="cardMapTitle"></div><button id="cardMapClose">✕</button></div>
      <div class="cm-grid" id="cardMapGrid"></div>         <!-- .cm-row > .cm-rlabel + .cm-cells > .cm-card -->
    </div>
  </div>

  <div class="modal" id="trophiesModal" role="dialog">     <!-- hidden until .open added -->
    <div class="modal-panel tr-panel">
      <div class="tr-head"><div id="trophiesTitle"></div><button id="trophiesClose">✕</button></div>
      <div class="tr-grid" id="trophiesGrid"></div>        <!-- .badge(.on|.off)[data-tip] -->
    </div>
  </div>

  <div class="modal" id="shortcutsModal" role="dialog">    <!-- hidden until .open added -->
    <div class="modal-panel sc-panel">
      <div class="tr-head"><div id="shortcutsTitle"></div><button id="shortcutsClose">✕</button></div>
      <div class="sc-grid" id="shortcutsGrid"></div>       <!-- .sc-row > kbd.sc-keys + .sc-desc -->
    </div>
  </div>

  <div id="fx" aria-hidden="true"></div>                   <!-- effects layer (confetti/toasts/flash) -->
</body>
```

**The inline `<style>` the app already ships** (you may restyle these, but know
they exist so you don't fight or double-apply them — e.g. the hint disclosure
triangle is already injected):

```css
.section-title{font:600 12px ui-monospace,SFMono-Regular,monospace;letter-spacing:.18em;text-transform:uppercase;opacity:.5;margin:20px 2px 10px}
.task-wrap{display:flex;flex-direction:column;gap:8px;position:relative}
.task-hint{font-size:13px;margin-left:6px}
.task-hint>summary{cursor:pointer;list-style:none;opacity:.55;font-weight:600;letter-spacing:.02em;display:inline-flex;align-items:center;gap:6px;width:fit-content}
.task-hint>summary::-webkit-details-marker{display:none}
.task-hint>summary::before{content:"\25B8";font-size:11px}   /* ▸ — flips to ▾ when [open]; don't add your own */
.task-hint[open]>summary::before{content:"\25BE"}
.task-hint[open]>summary{margin-bottom:6px}
.task-hint-body{font-size:13px;line-height:1.55;opacity:.78;border-left:2px solid currentColor;padding-left:10px;margin-left:3px}

/* copy / AI-copy tools — FUNCTIONAL baseline, tinted by your HUD tokens
   (--paper/--paper-2/--ink/--r). The chips sit at the block's top-right and
   the floated .tools-spacer that leads the text reserves their corner, so
   text WRAPS AROUND the buttons and never runs under them. Desktop: 28px
   chips at 60% opacity (full on hover/focus). [data-mobile]: same corner
   placement, 30px chips, always full opacity. Override only the look. */
.warm{position:relative}
.task-tools{position:absolute;top:6px;right:6px;display:inline-flex;gap:5px;opacity:.6;transition:opacity .12s ease}
.task-wrap:hover .task-tools,.task-wrap:focus-within .task-tools,.warm:hover>.task-tools,.warm:focus-within>.task-tools{opacity:1}
.tools-spacer{float:right;width:72px;height:30px}
.copy-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:2px solid var(--ink,#222);border-radius:var(--r,6px);background:var(--paper-2,#e7e3d8);color:var(--ink,#222);font-size:13px;line-height:1;cursor:pointer}
.copy-btn:hover{background:var(--paper,#fff)}

/* card map — a FUNCTIONAL baseline: the grid already lays out and the tooltip
   already works in every theme. Override the look (colors, size, radius) only
   if the card map matters to your design; doing nothing is fine. */
.cm-grid{display:flex;flex-direction:column;gap:12px}
.cm-row{display:flex;flex-direction:column;gap:6px}
.cm-rlabel{font:700 11px ui-monospace,SFMono-Regular,monospace;letter-spacing:.08em;text-transform:uppercase;opacity:.55}
.cm-cells{display:flex;flex-wrap:wrap;gap:6px}
.cm-card{position:relative;box-sizing:border-box;width:24px;height:24px;border:2px solid var(--ink,#222);border-radius:var(--r,6px);background:var(--paper-2,#e7e3d8);cursor:pointer;transition:transform .08s ease}
.cm-card:hover{transform:translate(-2px,-2px)}
.cm-card.done{background:var(--cobalt,#2b6cb0)}
.cm-card.rest{border-style:dashed;background:transparent;opacity:.5}
.cm-card.current{outline:3px solid var(--yellow,#f6c343);outline-offset:2px}
.cm-card[data-tip]:hover::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);width:max-content;max-width:220px;font:600 12px system-ui,sans-serif;line-height:1.35;color:#fff;background:#1a1a1a;border-radius:6px;padding:7px 10px;z-index:5;pointer-events:none;white-space:normal}

/* icon-button tooltips — FUNCTIONAL baseline too: the toolbar buttons, day-nav
   arrows and modal ✕ carry their localized name in data-tip; hover shows it
   (below the toolbar, above the arrows, under-right of the ✕). Override the
   bubble look only if it clashes with your design. */
.toolbar [data-tip],.day-nav[data-tip],.tr-head [data-tip]{position:relative}
.toolbar [data-tip]:hover::after,.day-nav[data-tip]:hover::after,.tr-head [data-tip]:hover::after{content:attr(data-tip);position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%);width:max-content;max-width:220px;font:600 12px system-ui,sans-serif;line-height:1.35;color:#fff;background:#1a1a1a;border-radius:6px;padding:7px 10px;z-index:30;pointer-events:none;white-space:normal}
.day-nav[data-tip]:hover::after{top:auto;bottom:calc(100% + 8px)}
.tr-head [data-tip]:hover::after{left:auto;right:0;transform:none}

/* shortcuts overlay — deliberately theme-independent; themes normally add NO .sc-* rules */
.sc-grid{display:flex;flex-direction:column;gap:8px}
.sc-row{display:flex;align-items:center;gap:12px}
.sc-keys{flex:0 0 auto;min-width:84px;font:600 12px ui-monospace,SFMono-Regular,monospace}
.sc-desc{opacity:.8}

/* mechanism the app also ships — DON'T re-declare these (set --focus-ring to restyle focus): */
*,*::before,*::after{box-sizing:border-box}
.task input{position:absolute;opacity:0;width:0;height:0;pointer-events:none}   /* native checkbox hidden for you */
@media (prefers-reduced-motion: reduce){ *,*::before,*::after{ animation-duration:.001ms!important; animation-iteration-count:1!important; transition-duration:.001ms!important; scroll-behavior:auto!important } }
#taskList .task:has(input:focus-visible){ outline:var(--focus-ring, 3px solid var(--accent,#f6c343)); outline-offset:3px; border-radius:var(--r,8px) }
```

**`--focus-ring` (the one token the baseline reads).** The keyboard-focus rule
above outlines the focused task row with `var(--focus-ring, 3px solid
var(--accent,#f6c343))` — so by default it picks up your `--accent`. Set
`--focus-ring` in your theme's token block only if you want a different focus
look (e.g. `--focus-ring: 2px dashed var(--ink)`); never re-declare the rule.
Note the baseline's `.cm-card` reads `--ink`/`--paper-2`/`--cobalt`/`--yellow`/`--r`
with hardcoded fallbacks — those names come from the default theme; either
define them, or (cleaner) restyle `.cm-card` directly with your own tokens.

---

## 4. Runtime contract — variables, state classes, inline styles

**CSS variables the app injects (the only ones):**

- `--track-<id>` — set inline on `<html>` for every track whose pack declares a
  `color`. Overrides any `--track-<id>` you set on `:root`. Track ids are
  pack-specific (see §7 for how to use them). To paint per track you still need
  per-id selectors — CSS can't read `var(--track-{attr})` dynamically.
- `--p` on `.ring` — overall-progress percent as a **unitless number 0–100**.
  Use it as `calc(var(--p) * 1%)` (writing `--p:42%` would break the `calc`).
- on each `.confetti-piece`: `--i` (0-based index), `--dx` (−1…1 horizontal
  drift), `--dy` (0…1 fall distance), `--rot` (rotation, e.g. −360…360deg).

**State classes the app toggles at runtime — style both states:**

| element | class added | meaning |
|---|---|---|
| `.modal` | `.open` | shown; **no `.open` = hidden** (you must hide it — §6) |
| `.task` (a `<label>`) | `.done` | all-checked / completed task |
| `.cm-card` | `.done` / `.rest` / `.current` | card-map cell states; `.done`/`.rest` are mutually exclusive, `.current` combines with either |
| `.badge` | `.on` / `.off` | unlocked / locked trophy |
| `#motd` | `.motd-out` | added ~600ms **before** the text swaps, then removed → fade must work both ways |
| `.toast`, `.badge-toast` | `.show` | added ~20ms after insert, removed ~400ms before removal → **base state must be hidden**, `.show` visible |

**Per-element inline styles the app writes (these beat your stylesheet):**

- every `.task` gets `style="animation-delay:<k*55>ms"` — a staggered entrance.
  Define a `.task` entrance keyframe keyed off it, with `animation-fill-mode:
  both` — without a backwards fill, delayed rows flash fully visible and then
  jump to the keyframe's `from` state (the app's baseline reduced-motion guard
  already covers the keyframe itself). Each `.confetti-piece` likewise gets an
  inline random `left` and `animation-delay` on top of its custom properties —
  `left` only moves a *positioned* element (see the Effects recipe in §6).
- every dashboard `.bar > i` gets `style="width:<pct>%"` — **this inline width is
  what draws the progress-bar fill** (bars have no `--p`; the width is their only
  length source). Give `.bar` a fixed height + `overflow:hidden` and
  `.bar > i { height:100% }` so the fill has a box (see §6).
- `.ring` gets `style="--p:<n>"`; the progress `.stat-sub` gets inline
  `text-align:center`; `#comeback` ships `style="display:none"` and JS sets its
  `display` to `''`/`none`. Because these are inline, you **cannot** override
  them with a plain rule — design around them (e.g. don't rely on
  `#comeback{display:flex}`; it'll be beaten by the inline `display`).

---

## 5. Mobile HUD (`[data-mobile]`)

At viewport widths ≤640px the app sets the `data-mobile` attribute on `<html>`
via `matchMedia` (tracked live — it updates if the window is resized). A
baseline block shipped with the app then re-lays **every** theme as a game HUD:

- **One-line header** — `.app-header` collapses to a single compact bar.
- **Bottom sheets** — `.toolbar` and `#dashboard` are hidden and become slide-up
  sheets. The app toggles `.toolbar.open` / `#dashboard.open` (mutually
  exclusive); a sheet closes on `Esc`, on any toolbar action (pack/theme/day
  pick, export, import), when a modal opens, or when its dock button is tapped
  again.
- **Hero today card** — `#todayCard` becomes the primary hero element, filling
  the visible area below the header.
- **Fixed bottom dock** — a `nav#dock` is pinned to the screen bottom with
  streak/progress micro-bars and quick-action buttons.

**This applies to every theme with zero theme work.** You do not need to write
a single line of mobile CSS — the HUD layout is automatic.

### Hard rule: never write phone-range width media queries

A guard test (`test/themes/mobile-guard.test.ts`) **rejects** any theme file
that contains a `max-width` query below 900px. Width queries in the phone range
conflict with the `[data-mobile]` abstraction. If you need to refine the HUD
look, use `[data-mobile]` attribute selectors instead. Tablet-range refinements
(`min-width: 900px` or `max-width` ≥900px) are allowed.

### HUD tokens — define these or get generic fallbacks

The baseline HUD reads the following tokens **with hardcoded fallbacks**. The
HUD works without them but uses generic colors, not your theme palette — a
beige dock pinned to a neon-black page. Define all of these in your token
block (map them to your existing palette vars):

| token | fallback | used for |
|---|---|---|
| `--paper` | `#fff` | dock micro-bar wells |
| `--paper-2` | `--paper` → `#f4f1e8` | dock background, sheet backgrounds |
| `--ink` | `#222` | borders, text |
| `--accent` | `#f6c343` | streak bar fill |
| `--cobalt` | `#2b6cb0` | progress bar fill |
| `--r` | `6px` | bar corner radius |

> Every bundled theme defines the full set (see the `/* mobile HUD + card-map
> baseline tokens */` line in any `themes/*.css` token block for a copyable
> example), and the guard test rejects a theme that skips one. The same tokens
> also tint the canonical card-map cells and the keyboard-focus ring, so a
> matched set pays off on desktop too. One trap: if your `--accent` is a
> *gradient*, also define `--focus-ring` with a solid color — a gradient is
> invalid inside the baseline's `outline: 3px solid var(--accent)` fallback and
> would silently kill the focus outline (this bit `dawn`).

### Dock anatomy and renderer fill contract

```
nav#dock
  button.dock-bars#dockBars
    span.dock-bar[data-kind="streak"]
      i.dock-bar-fill          ← renderer sets inline width: NN%  (min(streak/30, 1) × 100)
      span.dock-bar-val        ← renderer sets text: e.g. "7d"
    span.dock-bar[data-kind="progress"]
      i.dock-bar-fill          ← renderer sets inline width: NN%  (done/total × 100)
      span.dock-bar-val        ← renderer sets text: e.g. "12/80"
  button#dockMapBtn            🗺️
  button#dockTrophiesBtn       🏆
  button#dockMenuBtn           ☰
```

- **Streak bar** fills against a 30-day capped target: `min(streak / 30, 1)`.
  The val text is the raw streak in days, e.g. `"7d"`.
- **Progress bar** is overall completion percentage. The val text is
  `"done/total"`, e.g. `"12/80"`.
- **Do not override `.dock-bar-fill`'s width** — it is set as an inline style
  by the renderer on every render. Any `width` rule in your stylesheet will be
  beaten by the inline style and has no effect.

Tapping `#dockBars` opens the stats sheet (`#dashboard.open`). The three buttons
open the card-map modal, trophies modal, and the menu sheet (`.toolbar.open`)
respectively.

### Overriding the mobile HUD look

The baseline's `[data-mobile]` rules carry `!important` on layout-critical
declarations because themes legitimately style `#dashboard` and `#todayCard` by
id. To override: match the baseline selector under `[data-mobile]` in your
theme file. Your file loads **after** the baseline, so at equal specificity
+ `!important`, the last declaration wins — i.e. yours.

```css
/* Example — give the dock a black background in your theme */
:root[data-mobile][data-theme="yourtheme"] #dock {
  background: #000 !important;
}
```

The rule of thumb: prefix the baseline selector with your `data-theme` and
mirror its `!important` on any layout-critical declarations you change.

Expect the baseline to neutralize some desktop styling under `[data-mobile]`,
on purpose:

- **Page column** — your `width:min(…)` + `margin-inline:auto` on
  `.app-header`/`.wrap`/`.foot` is flattened to edge-to-edge (`width:auto`,
  zero margins). Forcing only the margin would leave a narrow column pinned to
  the left edge.
- **`body` / `.app-header` effects** — `filter`, `backdrop-filter`,
  `transform`, `perspective` *and* `animation` are forced to `none` on both.
  Any of them turns that element into the containing block for its
  `position:fixed` descendants, which then anchor to the page box instead of
  the viewport: a body-level `filter` animation sent the arcade themes' dock
  and sheets below the fold entirely, and a header transform *animation* with
  `fill-mode: both` hung `os95`'s menu sheet off the header even after the
  animation finished. Body-level ambience must live on `body::before/::after`
  (those are untouched), not on `body` itself.
- **Control metrics** — the day-nav is a 36px square and dock buttons keep your
  `.btn` skin, but the baseline owns their content centering (`inline-flex` +
  `line-height:1`, day-nav `padding:0`), so desktop line-heights don't push
  glyphs off-center.

### Sheet class names are owned by the app

`.toolbar.open` and `#dashboard.open` are toggled by the app's mobile
controller — these class names are **reserved**. You may restyle what an open
sheet looks like (background, shadow, transition), but do not repurpose those
class names for your own toggle logic.

---

## 6. Layout — the part that stops elements overlapping

The app gives you raw, unpositioned elements. **Build these containers or things
collide.** Recipes below are the proven house values.

**Page column.** `main.wrap` and the top-level blocks have no width. Center the
content (pick one): either constrain `.wrap`, or give each top block the same
width — the shipped themes do the latter:

```css
:root[data-theme="my-theme"] .app-header,
:root[data-theme="my-theme"] .wrap,
:root[data-theme="my-theme"] .foot { width: min(1100px, 100% - 32px); margin-inline: auto; }
```

**Header** is two children (`.brand`, `.toolbar`) — lay them out and flow the
toolbar, or the selects/buttons stack:

```css
:root[data-theme="my-theme"] .app-header { display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; }
:root[data-theme="my-theme"] .brand     { display:flex; align-items:center; gap:12px; }
:root[data-theme="my-theme"] .toolbar   { display:flex; flex-wrap:wrap; gap:10px; align-items:center; }
:root[data-theme="my-theme"] .field     { display:flex; flex-direction:column; gap:4px; }
```

**Dashboard** — auto-fit grid (reflows from 4→fewer with no media query; renders
**3 or 4** `.stat-card`s — the `phases` card only exists when the pack has phases):

```css
:root[data-theme="my-theme"] .dash      { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; }
:root[data-theme="my-theme"] .stat-card { display:flex; flex-direction:column; gap:10px; padding:18px; }   /* interior rhythm */
:root[data-theme="my-theme"] .prow      { display:flex; justify-content:space-between; align-items:center; gap:8px; }
:root[data-theme="my-theme"] .prow .lbl { display:flex; align-items:center; gap:8px; min-width:0; }         /* .lbl>i is the track dot */
:root[data-theme="my-theme"] .bar       { height:8px; border-radius:99px; overflow:hidden; background:var(--rail); }
:root[data-theme="my-theme"] .bar > i   { display:block; height:100%; }   /* width set inline by the app */
:root[data-theme="my-theme"] .ring      { width:132px; aspect-ratio:1; display:grid; place-items:center; border-radius:50%; margin-inline:auto; }   /* the BOX — §7 paints the donut into it; margin-inline centers it, else it sits flush left in the card */
:root[data-theme="my-theme"] .ring > div{ width:74%; aspect-ratio:1; display:grid; place-content:center; place-items:center; border-radius:50%; background:var(--panel); }   /* readout disc = the hole; holds <b>% + <small>. place-content packs the two rows as one centered group — without it grid stretches them apart vertically */
```

> ⚠️ `.ring` **must** get an explicit size here — it's the only element the app
> fills (via `--p`) but ships with no box, so without a width/aspect-ratio the
> gradient has nothing to paint and the `<b>`/`<small>` readout collapses.

**Day rail** — the `‹ card ›` row. Without this the prev/next buttons stack on
top of the card:

```css
:root[data-theme="my-theme"] .day-rail  { display:grid; grid-template-columns:56px minmax(0,1fr) 56px; gap:14px; align-items:stretch; }
:root[data-theme="my-theme"] .today-wrap{ min-width:0; }
```

**Today card** — the signature three-zone card: a track-colored spine, a
vertical text rail, and the main column.

```css
:root[data-theme="my-theme"] .today      { display:flex; overflow:hidden; min-height:420px; }
:root[data-theme="my-theme"] .today-side { flex:0 0 84px; display:grid; place-items:center; background:var(--accent); }
:root[data-theme="my-theme"] .today-main { flex:1; min-width:0; display:flex; flex-direction:column; gap:14px; padding:clamp(20px,4vw,34px); }
:root[data-theme="my-theme"] .vert       { writing-mode:vertical-rl; transform:rotate(180deg); }
:root[data-theme="my-theme"] .today-title{ margin:0; }   /* h2 ships browser margins that double the column's gap */
:root[data-theme="my-theme"] .tasks, :root[data-theme="my-theme"] #taskList { display:flex; flex-direction:column; gap:10px; }  /* space task rows */
:root[data-theme="my-theme"] .res-row     { display:flex; flex-wrap:wrap; gap:8px; }
:root[data-theme="my-theme"] .reflect-block { display:flex; flex-direction:column; gap:8px; }
```

`.today-main`'s children render top-to-bottom in the order shown in §3; the
`gap` spaces them — without it they butt together.

**Modal** — the most common overlap/clip trap. Full-viewport overlay, scrolls,
panel doesn't fill the edges (so click-to-close works), panel `overflow:visible`
(so badge tooltips aren't clipped):

```css
:root[data-theme="my-theme"] .modal       { position:fixed; inset:0; z-index:50; display:none; overflow-y:auto; align-items:flex-start; justify-content:center; padding:32px 16px; background:rgba(0,0,0,.4); }
:root[data-theme="my-theme"] .modal.open  { display:flex; }
:root[data-theme="my-theme"] .modal-panel { width:min(560px, 92vw); margin:auto; overflow:visible; background:var(--panel); }   /* the panel needs its own surface — the app ships none, and a transparent panel reads as a broken overlay */
```

> Click-to-close fires only when the click lands on the `.modal` element itself —
> so the panel must **not** cover the whole overlay (keep the `padding`/`width`
> gap above), or closing silently breaks. `Esc` always closes. Opening a modal
> moves keyboard focus to the panel's first `<button>` — give your buttons a
> visible `:focus-visible` style so that focus can be seen.

**Inside the panels** — all three panels share the same `.tr-head` header row
(title + ✕ button); lay it out once. The trophies grid needs columns or badges
stack; the card map and shortcuts grids are **already laid out by the baseline
(§3)** — add `.cm-*` rules only to retheme the look, and leave `.sc-*` alone:

```css
:root[data-theme="my-theme"] .tr-head { display:flex; align-items:center; gap:10px; }
:root[data-theme="my-theme"] #cardMapTitle, :root[data-theme="my-theme"] #trophiesTitle,
:root[data-theme="my-theme"] #shortcutsTitle { flex:1; }   /* push ✕ right */
:root[data-theme="my-theme"] .tr-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(120px, 1fr)); gap:12px; }
:root[data-theme="my-theme"] .badge   { display:grid; place-content:center; place-items:center; gap:8px; text-align:center; padding:14px; }  /* .bi icon + .bt label; place-content is required — the grid row stretches badges to equal height, and without it the icon and label drift apart vertically */

/* optional — retheme the card-map cells (the baseline already makes them work): */
:root[data-theme="my-theme"] .cm-card        { border-color:var(--line); background:var(--rail); }
:root[data-theme="my-theme"] .cm-card.done   { background:var(--accent); }
:root[data-theme="my-theme"] .cm-card.current{ outline-color:var(--accent); }
```

Card-map cells are clickable (clicking one jumps to that item and closes the
modal) — keep the baseline's `cursor:pointer` if you restyle them. Each cell
carries the item title in `data-tip`; the baseline already renders that tooltip
via `::after`, so unlike `.badge` you don't build it yourself.

**Effects layer** — keep it out of the way; the app inserts/removes children:

```css
:root[data-theme="my-theme"] #fx          { position:fixed; inset:0; z-index:80; pointer-events:none; overflow:hidden; }
:root[data-theme="my-theme"] .fx-flash    { position:fixed; inset:0; }                                  /* full-screen celebration flash */
:root[data-theme="my-theme"] .toast,
:root[data-theme="my-theme"] .badge-toast { position:fixed; left:50%; bottom:24px; transform:translateX(-50%); opacity:0; }   /* base = HIDDEN */
:root[data-theme="my-theme"] .toast.show,
:root[data-theme="my-theme"] .badge-toast.show { opacity:1; }
:root[data-theme="my-theme"] .confetti-piece   { position:fixed; top:18%; width:9px; height:14px; }   /* MUST be positioned: the app drives pieces via inline `left`, which does nothing on a static inline span (and width/height don't apply to one either) — unpositioned confetti is invisible */
```

> The toast/flash classes are `position:fixed` on their own (not just children of
> `#fx`) — without it they'd pile at the layer's top-left and overlap. They show
> one at a time (~3.5s each), so a single bottom-center anchor is enough.

**Tasks — style the checkbox.** The visible control is `.box`; the real
`<input type="checkbox">` is still in the DOM but **the app already hides it**
(baseline §3) — you only style `.box` and `.task.done`. The done state lives on
the `.task` label.

```css
:root[data-theme="my-theme"] .task        { display:grid; grid-template-columns:22px minmax(0,1fr); gap:10px; align-items:center; }
:root[data-theme="my-theme"] .task .box   { width:22px; height:22px; border:2px solid currentColor; border-radius:7px; }
:root[data-theme="my-theme"] .task.done .box { background:var(--accent); border-color:var(--accent); }
:root[data-theme="my-theme"] .task.done .box::after {                                                /* the tick */
  content:""; display:block; width:5px; height:9px; margin:3px auto; rotate:45deg;
  border:2px solid #fff; border-top:0; border-left:0;
}
```

**Two structural quirks to handle:**

- `.warm` renders **differently**: in an active item it's a `<div class="warm">`
  with a `.warm-i` icon **and** a `.muted` label; in a **rest** item it's a
  `<p class="warm">` with only `.warm-i` (no `.muted`). Style both; remember the
  `<p>` has default margins.
- `.muted` is **overloaded** — it's the warmup label inside `.warm` *and* the
  empty-state placeholder in the tracks card. Don't give it `display:block`
  globally.
- Dashboard `.bar` is a **sibling that follows** each `.prow`, not a child
  (`.prow .bar` matches nothing). The `.prow .lbl > i` is the empty track-color
  swatch.

---

## 7. House style — make it look designed, not generic

These are the conventions the shipped themes share. Apply them or the result
reads as flat/AI-generic.

**Design tokens.** Define a small system on `:root[data-theme="…"]`. The §6
recipes assume these names — define them (rename freely if you also update the
recipes): `--bg` (page), `--panel` (card surface), `--rail` (bar/ring track),
`--line` (borders), `--ink` (text), `--accent` (primary), plus a **3-step shadow
ramp** `--sh-sm`/`--sh`/`--sh-lg`. **None of these are app-injected — they are
yours to define** (the app injects only `--track-<id>`, `--p`, and the confetti
vars, per §4). Reuse the ramp: resting cards use the mid shadow, hover/modals the
large one. On a dark theme also set `color-scheme: dark` in the token block, or
native selects, their dropdown popups, and scrollbars stay light.

**Fluid type.** Size headings and big padding with `clamp(min, vw, max)`, not
fixed px — this is the biggest polish tell and prevents mobile breakage:

```css
.brand-name  { font-size: clamp(1.4rem, 3vw, 2.1rem); }
.today-title { font-size: clamp(1.8rem, 4vw, 3rem); line-height: 1; }
```

**Fonts.** A 2–3 family system via `@import` (a display face for headings/numbers,
a body face, optionally mono for `.eyebrow`/`.val` stats), each with a system
fallback stack so it degrades on `file://`.

**Per-track color.** The app sets `--track-<id>` for tracks the pack colors.
The bundled `dev-roadmap` pack declares the track ids `dsa js ts node sysdesign
patterns distsys db cs` — and **no colors**, so for it your per-id fallbacks are
the colors users actually see. Use those real ids; selectors for invented ids
match nothing and every track silently falls back to the neutral default. To
theme tracks richly:
- give bare `[data-track]` a **neutral accent default** so unknown packs still
  look intentional;
- add per-id rules for the track ids you design around, wiring the color into
  the `.bar > i` fill, the `.prow .lbl > i` dot, the `.trackpill`, and the
  `.today[data-track] .today-side` spine;
- derive tints/borders/glows from one hue with `color-mix()` instead of
  hardcoding a second color:

```css
.bar[data-track="dsa"] > i { background: linear-gradient(90deg, var(--track-dsa), color-mix(in srgb, var(--track-dsa) 65%, #fff)); }
.today[data-track="dsa"] .today-side { background: var(--track-dsa); }
```

**Progress ring — punch the donut hole.** `conic-gradient` alone gives a filled
pie with text on color. Layer a matching disc on top (or use the `.ring > div`
child) so the percent is readable:

```css
.ring {
  background:
    radial-gradient(closest-side, var(--panel) 0 71%, transparent 72%),    /* the hole */
    conic-gradient(var(--accent) calc(var(--p) * 1%), var(--rail) 0);       /* the progress */
}
.ring > div { display:grid; place-content:center; place-items:center; }   /* holds <b>% and <small>done/total — size the <b> so the worst case "100%" still fits inside the hole */
```

**Atmosphere.** A flat `background:var(--bg)` looks cheap. Stack 1–2 soft
`radial-gradient` light-blooms over the base and pin with
`background-attachment:fixed`; an optional subtle texture (grid/dots/SVG
data-URI) adds identity.

**Micro-interactions.** Give controls life: `transition` on hover, a small
`translateY(-2px)` + bigger shadow on `:hover`, settle to `0` on `:active`. A
spring ease (`cubic-bezier(.2,1.5,.4,1)`) on the checkbox check feels good.

**Confetti polish.** Vary pieces with `:nth-child` (a few colors, alternate
circle/rectangle shapes) and consume `--dx`/`--dy`/`--rot`/`--i` in the keyframe
so the burst looks hand-made rather than uniform.

---

## 8. Reduced motion (app-provided)

**The app ships a blanket reduced-motion guard in its baseline (§3)** — it catches
every keyframe/transition you add (including the `.task` stagger), so you no
longer write your own. For reference, the shipped guard is:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 9. Canonical hook checklist

> **App-provided baseline (don't write these):** the `box-sizing` reset, the
> native-checkbox hide (`.task input`), the reduced-motion guard, the keyboard
> focus outline (set `--focus-ring` to restyle focus), the functional card-map
> grid + its `data-tip` tooltip (`.cm-*`), the icon-button tooltips (`.toolbar`/
> `.day-nav`/`.tr-head`/`.task-tools` `[data-tip]`), the copy / AI-copy tools
> (`.task-tools>.copy-btn` — token-tinted, hover-revealed, forced visible on
> mobile), and the entire shortcuts list (`.sc-*`).

Style **every** one of these (grouped by where they render). Tag in parentheses
when it matters.

- **Header:** `.app-header`, `.brand` (`.brand-mark`, `.brand-name`, `.brand-sub#phaseLabel`), `.toolbar`, `.field`, `select`, `.btn`, `.btn.ghost[data-tip]` (baseline tooltip), `#importFile` (hidden)
- **Column:** `.wrap`, `.section-title` (h2; `#summaryTitle`, `#todayTitle`), `#comeback`
- **Dashboard:** `.dash`, `.stat-card[data-kind="progress|streak|phases|tracks"]`, `.eyebrow`, `.ring`+`.ring>div>b`+`small`, `.stat-sub`, `.muted`, `.flame`, `.streak-num`, `.prow`(`.lbl>i`, `.val`) + sibling `.bar>i`, `[data-track]`
- **Day rail:** `.day-rail`, `.day-nav.day-prev#prevDay` / `.day-nav.day-next#nextDay` (`[data-tip]`, baseline tooltip), `.today-wrap`, `.today#todayCard[data-track]`
  - active item: `.today-side>.vert`, `.today-main`, `.trackpill`(span)`>.k`, `.today-title`(h2), `.warm`(div)`>.warm-i`+`.muted` (+ `.task-tools` with `#copyWarm`/`#copyaiWarm`), `.tasks#taskList`, `.reflect-block>.reflect-label[for=reflect]>.kanji` + `textarea#reflect`, `.res-row>.chip`(span)`>b`, `.next-day-cta#nextDayCta`
  - task: `.task-wrap > label.task(.done)[style=animation-delay] (> input#cb_<id>` + `.box` + `.task-text > i.tools-spacer + text)` + `.task-tools > button.copy-btn#copy_<id> + button.copy-btn.ai#copyai_<id>`; with guidance also `+ details.task-hint > summary + .task-hint-body` (`.warm` likewise starts with `i.tools-spacer`)
  - rest item: `.warm`(p)`>.warm-i` (only with a reflect prompt), optional `.next-day-cta#nextDayCta`
- **Footer:** `.foot > #motd(.motd-out)`
- **Modals:** `.modal(.open)[role=dialog]` → `.modal-panel.cardmap-panel|.tr-panel|.sc-panel`, each headed by `.tr-head`
  - card map: `.tr-head`(`#cardMapTitle/#cardMapClose`), `.cm-grid#cardMapGrid > .cm-row > .cm-rlabel + .cm-cells > .cm-card(.done|.rest|.current)[data-id][data-tip]` — baseline-functional, override look only
  - trophies: `.tr-head`(`#trophiesTitle/#trophiesClose`), `.tr-grid#trophiesGrid>.badge(.on|.off)[data-tip]>.bi+.bt`
  - shortcuts: `.tr-head`(`#shortcutsTitle/#shortcutsClose`), `.sc-grid#shortcutsGrid > .sc-row > kbd.sc-keys + .sc-desc` — theme-independent via the baseline; themes normally need **no** `.sc-*` rules
- **Effects:** `#fx`, `.fx-flash`, `.confetti-piece`, `.toast(.show)`, `.badge-toast(.show)>.bt-i`+trailing text span

> Badges carry `data-tip` — build the tooltip yourself: give `.badge` a
> `position:relative` and the tooltip `position:absolute`:
> `.badge[data-tip]:hover::after { content: attr(data-tip); position:absolute; bottom:100%; left:50%; transform:translateX(-50%); … }`
> plus a `::before` arrow. **Without `position` the `::after` renders in-flow and
> shoves the badge's icon/label.** It floats free only because the modal panel is
> `overflow:visible`.

---

## 10. Prompt — fill the blanks, paste together with everything above

> You are authoring a **Sunrise theme** (contract `sunrise.theme/v1`). The full
> contract is in the document above — the page skeleton (§3), runtime
> variables/state classes/inline styles (§4), mobile HUD contract (§5), the
> layout recipes that prevent overlap (§6), house style (§7), reduced motion
> (§8), and the hook checklist (§9). Follow all of it. The app ships **no base
> CSS**, so you own all layout.
>
> **Vibe:** {DESCRIBE THE LOOK — mood, palette, era, typography, motion feel}.
>
> Output, with no other prose:
> 1. A complete `themes/{ID}.css` that:
>    - scopes every rule under `:root[data-theme="{ID}"]` (reduced-motion guard
>      may stay global);
>    - **lays out** the page column (`.wrap`), header (`.brand`/`.toolbar`),
>      `.dash` (auto-fit grid), `.day-rail` (the `‹ card ›` row), the `.today`
>      three-zone card, and the `.modal` shell (fixed overlay, scroll,
>      `flex-start`, panel not covering the backdrop, panel `overflow:visible`) —
>      so nothing overlaps;
>    - **hides the native checkbox** and drives the check via `.box` / `.task.done`;
>    - styles **every** hook in the §9 checklist, both states of each runtime
>      class (`.modal.open`, `.task.done`, `.badge.on/.off`, `.toast.show`,
>      `#motd.motd-out`), and both `.warm` variants; the card-map cells
>      (`.cm-card.done/.rest/.current`) and shortcuts list already work via the
>      baseline — retheme `.cm-card` only if it fits the vibe, add no `.sc-*`
>      rules;
>    - reads `--track-<id>`, `.ring`'s unitless `--p` via `calc(var(--p)*1%)`
>      with a donut hole, and the confetti vars (`--dx` −1…1, `--dy` 0…1,
>      `--rot`, `--i`);
>    - applies house style: a token system with a 3-step shadow ramp, `clamp()`
>      fluid type, a 2–3 font stack, per-track colors with `color-mix()` tints,
>      a layered atmospheric background, hover/active micro-interactions, and the
>      `.task` entrance keyframe keyed off the inline `animation-delay`;
>    - adds **no** reduced-motion block of its own — the app baseline ships the
>      guard (§8), and the theme test rejects a stylesheet that re-declares it.
> 2. The one-line `registerTheme({…})` manifest pointing at that file.
