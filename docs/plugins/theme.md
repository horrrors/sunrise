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
> default spacing — only the tiny inline block in **§3**. Your stylesheet owns
> **100% of the layout**: page width and centering, the header row, the
> day-rail row, the today card, the dashboard grid, modal positioning, and
> `box-sizing`. If you only set colors, elements collapse into the default block
> flow and **overlap**. Treat the hooks below as a bare, unstyled skeleton you
> must lay out from scratch. **§5 (Layout) is what keeps elements from colliding
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

When the user picks your theme the app swaps the `#themeCss` link's `href` to
your `cssHref` and sets `data-theme="<id>"` on `<html>`. Every registered theme
is **validated**; an invalid manifest is rejected (reason logged to the console)
and skipped — it never breaks the app.

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

The reduced-motion guard (**§6**) is the one block you may leave global.

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
      <button class="btn ghost" id="calBtn">📅</button>
      <button class="btn ghost" id="trophiesBtn">🏆</button>
      <button class="btn ghost" id="exportBtn"></button>
      <button class="btn ghost" id="importBtn"></button>
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
          <div class="today-main">                   <!-- ACTIVE item; children render in this order: -->
            <span class="trackpill"><span class="k"></span> Track name</span>
            <h2 class="today-title">…</h2>
            <div class="warm"><span class="warm-i">✦</span><span class="muted">Warm-up</span> text…</div>
            <div class="tasks" id="taskList"><!-- task rows, see below --></div>
            <div class="reflect-block"><label class="reflect-label" for="reflect"><span class="kanji">省</span> …</label><textarea id="reflect"></textarea></div>
            <div class="res-row"><span class="chip"><b>label</b> note</span></div>
            <button class="btn gold" id="markReview">…</button>   <!-- only on reviewable tracks -->
            <button class="next-day-cta" id="nextDayCta">…</button>
          </div>
          <!-- a REST day instead renders: .today-side>.vert, then .today-main with
               <h2 today-title>, <p class="warm"><span class="warm-i">☾</span> prompt</p> (NO .muted),
               and a <div class="rest-due"> block (no tasks/reflect). -->
        </article>
      </section>
      <button class="day-nav day-next" id="nextDay">›</button>
    </section>
  </main>

  <div class="foot"><span id="motd"></span></div>          <!-- footer, motto rotates -->

  <div class="modal" id="calModal" role="dialog">          <!-- hidden until .open added -->
    <div class="modal-panel cal-panel">
      <div class="cal-head">
        <button id="calPrev">‹</button><div id="calTitle"></div>
        <button id="calNext">›</button><button id="calClose">✕</button>
      </div>
      <div class="cal-dow" id="calDow"></div>              <!-- 7 <span> weekday heads -->
      <div class="cal-grid" id="calGrid"></div>            <!-- .cday(.other|.done|.today) -->
    </div>
  </div>

  <div class="modal" id="trophiesModal" role="dialog">     <!-- hidden until .open added -->
    <div class="modal-panel tr-panel">
      <div class="tr-head"><div id="trophiesTitle"></div><button id="trophiesClose">✕</button></div>
      <div class="tr-grid" id="trophiesGrid"></div>        <!-- .badge(.on|.off)[data-tip] -->
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
.task-wrap{display:flex;flex-direction:column;gap:8px}
.task-hint{font-size:13px;margin-left:6px}
.task-hint>summary{cursor:pointer;list-style:none;opacity:.55;font-weight:600;letter-spacing:.02em;display:inline-flex;align-items:center;gap:6px;width:fit-content}
.task-hint>summary::-webkit-details-marker{display:none}
.task-hint>summary::before{content:"\25B8";font-size:11px}   /* ▸ — flips to ▾ when [open]; don't add your own */
.task-hint[open]>summary::before{content:"\25BE"}
.task-hint[open]>summary{margin-bottom:6px}
.task-hint-body{font-size:13px;line-height:1.55;opacity:.78;border-left:2px solid currentColor;padding-left:10px;margin-left:3px}

/* mechanism the app also ships — DON'T re-declare these (set --focus-ring to restyle focus): */
*,*::before,*::after{box-sizing:border-box}
.task input{position:absolute;opacity:0;width:0;height:0;pointer-events:none}   /* native checkbox hidden for you */
@media (prefers-reduced-motion: reduce){ *,*::before,*::after{ animation-duration:.001ms!important; animation-iteration-count:1!important; transition-duration:.001ms!important; scroll-behavior:auto!important } }
#taskList .task:has(input:focus-visible){ outline:var(--focus-ring, 3px solid var(--accent,#f6c343)); outline-offset:3px; border-radius:var(--r,8px) }
```

---

## 4. Runtime contract — variables, state classes, inline styles

**CSS variables the app injects (the only ones):**

- `--track-<id>` — set inline on `<html>` for every track whose pack declares a
  `color`. Overrides any `--track-<id>` you set on `:root`. Track ids are
  pack-specific (see §6 for how to use them). To paint per track you still need
  per-id selectors — CSS can't read `var(--track-{attr})` dynamically.
- `--p` on `.ring` — overall-progress percent as a **unitless number 0–100**.
  Use it as `calc(var(--p) * 1%)` (writing `--p:42%` would break the `calc`).
- on each `.confetti-piece`: `--i` (0-based index), `--dx` (−1…1 horizontal
  drift), `--dy` (0…1 fall distance), `--rot` (rotation, e.g. −360…360deg).

**State classes the app toggles at runtime — style both states:**

| element | class added | meaning |
|---|---|---|
| `.modal` | `.open` | shown; **no `.open` = hidden** (you must hide it — §5) |
| `.task` (a `<label>`) | `.done` | all-checked / completed task |
| `.cday` | `.done` / `.today` / `.other` | calendar day states |
| `.badge` | `.on` / `.off` | unlocked / locked trophy |
| `#motd` | `.motd-out` | added ~600ms **before** the text swaps, then removed → fade must work both ways |
| `.toast`, `.badge-toast` | `.show` | added ~20ms after insert, removed ~400ms before removal → **base state must be hidden**, `.show` visible |

**Per-element inline styles the app writes (these beat your stylesheet):**

- every `.task` gets `style="animation-delay:<k*55>ms"` — a staggered entrance.
  Define a `.task` entrance keyframe keyed off it (and disable it under reduced
  motion). It's the only motion the app pre-wires.
- every dashboard `.bar > i` gets `style="width:<pct>%"` — **this inline width is
  what draws the progress-bar fill** (bars have no `--p`; the width is their only
  length source). Give `.bar` a fixed height + `overflow:hidden` and
  `.bar > i { height:100% }` so the fill has a box (see §5).
- `.ring` gets `style="--p:<n>"`; the progress `.stat-sub` gets inline
  `text-align:center`; `#comeback` ships `style="display:none"` and JS sets its
  `display` to `''`/`none`. Because these are inline, you **cannot** override
  them with a plain rule — design around them (e.g. don't rely on
  `#comeback{display:flex}`; it'll be beaten by the inline `display`).

---

## 5. Layout — the part that stops elements overlapping

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
:root[data-theme="my-theme"] .ring      { width:132px; aspect-ratio:1; display:grid; place-items:center; border-radius:50%; }   /* the BOX — §6 paints the donut into it */
:root[data-theme="my-theme"] .ring > div{ width:74%; aspect-ratio:1; display:grid; place-items:center; border-radius:50%; background:var(--panel); }   /* readout disc = the hole; holds <b>% + <small> */
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
vertical-text rail, and the main column.

```css
:root[data-theme="my-theme"] .today      { display:flex; overflow:hidden; min-height:420px; }
:root[data-theme="my-theme"] .today-side { flex:0 0 84px; display:grid; place-items:center; background:var(--accent); }
:root[data-theme="my-theme"] .today-main { flex:1; min-width:0; display:flex; flex-direction:column; gap:14px; padding:clamp(20px,4vw,34px); }
:root[data-theme="my-theme"] .vert       { writing-mode:vertical-rl; transform:rotate(180deg); }
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
:root[data-theme="my-theme"] .modal-panel { width:min(560px, 92vw); margin:auto; overflow:visible; }
```

> Click-to-close fires only when the click lands on the `.modal` element itself —
> so the panel must **not** cover the whole overlay (keep the `padding`/`width`
> gap above), or closing silently breaks. `Esc` always closes.

**Inside the panels** — these multi-child containers also need layout or they
stack. The calendar especially collapses into a single vertical column without a
7-column grid:

```css
:root[data-theme="my-theme"] .cal-head, :root[data-theme="my-theme"] .tr-head { display:flex; align-items:center; gap:10px; }
:root[data-theme="my-theme"] #calTitle, :root[data-theme="my-theme"] #trophiesTitle { flex:1; }   /* push ✕ right */
:root[data-theme="my-theme"] .cal-dow, :root[data-theme="my-theme"] .cal-grid { display:grid; grid-template-columns:repeat(7, 1fr); gap:6px; }
:root[data-theme="my-theme"] .cday    { aspect-ratio:1; display:grid; place-items:center; border-radius:10px; }
:root[data-theme="my-theme"] .tr-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(120px, 1fr)); gap:12px; }
:root[data-theme="my-theme"] .badge   { display:grid; place-items:center; gap:8px; text-align:center; padding:14px; }  /* .bi icon + .bt label */
```

**Effects layer** — keep it out of the way; the app inserts/removes children:

```css
:root[data-theme="my-theme"] #fx          { position:fixed; inset:0; z-index:80; pointer-events:none; overflow:hidden; }
:root[data-theme="my-theme"] .fx-flash    { position:fixed; inset:0; }                                  /* full-screen celebration flash */
:root[data-theme="my-theme"] .toast,
:root[data-theme="my-theme"] .badge-toast { position:fixed; left:50%; bottom:24px; transform:translateX(-50%); opacity:0; }   /* base = HIDDEN */
:root[data-theme="my-theme"] .toast.show,
:root[data-theme="my-theme"] .badge-toast.show { opacity:1; }
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

## 6. House style — make it look designed, not generic

These are the conventions the shipped themes share. Apply them or the result
reads as flat/AI-generic.

**Design tokens.** Define a small system on `:root[data-theme="…"]`. The §5
recipes assume these names — define them (rename freely if you also update the
recipes): `--bg` (page), `--panel` (card surface), `--rail` (bar/ring track),
`--line` (borders), `--ink` (text), `--accent` (primary), plus a **3-step shadow
ramp** `--sh-sm`/`--sh`/`--sh-lg`. **None of these are app-injected — they are
yours to define** (the app injects only `--track-<id>`, `--p`, and the confetti
vars, per §4). Reuse the ramp: resting cards use the mid shadow, hover/modals the
large one.

**Fluid type.** Size headings and big padding with `clamp(min, vw, max)`, not
fixed px — this is the biggest polish tell and prevents mobile breakage:

```css
.brand-name  { font-size: clamp(1.4rem, 3vw, 2.1rem); }
.today-title { font-size: clamp(1.8rem, 4vw, 3rem); line-height: 1; }
```

**Fonts.** A 2–3 family system via `@import` (a display face for headings/numbers,
a body face, optionally mono for `.eyebrow`/`.val` stats), each with a system
fallback stack so it degrades on `file://`.

**Per-track color.** The app sets `--track-<id>` for tracks the pack colors. To
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
.ring > div { display:grid; place-items:center; }   /* holds <b>% and <small>done/total -->
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

## 7. Reduced motion (app-provided)

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

## 8. Canonical hook checklist

> **App-provided baseline (don't write these):** the `box-sizing` reset, the
> native-checkbox hide (`.task input`), the reduced-motion guard, and the keyboard
> focus outline — set `--focus-ring` to restyle focus.

Style **every** one of these (grouped by where they render). Tag in parentheses
when it matters.

- **Header:** `.app-header`, `.brand` (`.brand-mark`, `.brand-name`, `.brand-sub#phaseLabel`), `.toolbar`, `.field`, `select`, `.btn`, `.btn.ghost`, `.btn.gold`, `#importFile` (hidden)
- **Column:** `.wrap`, `.section-title` (h2; `#summaryTitle`, `#todayTitle`), `#comeback`
- **Dashboard:** `.dash`, `.stat-card[data-kind="progress|streak|phases|tracks"]`, `.eyebrow`, `.ring`+`.ring>div>b`+`small`, `.stat-sub`, `.muted`, `.flame`, `.streak-num`, `.prow`(`.lbl>i`, `.val`) + sibling `.bar>i`, `[data-track]`
- **Day rail:** `.day-rail`, `.day-nav.day-prev#prevDay` / `.day-nav.day-next#nextDay`, `.today-wrap`, `.today#todayCard[data-track]`
  - active item: `.today-side>.vert`, `.today-main`, `.trackpill`(span)`>.k`, `.today-title`(h2), `.warm`(div)`>.warm-i`+`.muted`, `.tasks#taskList`, `.reflect-block>.reflect-label[for=reflect]>.kanji` + `textarea#reflect`, `.res-row>.chip`(span)`>b`, `.btn.gold#markReview`, `.next-day-cta#nextDayCta`
  - task: `label.task(.done)[style=animation-delay] > input#cb_<id>` + `.box` + `.task-text`; with guidance: `.task-wrap > (label) + details.task-hint > summary + .task-hint-body`
  - rest item: `.warm`(p)`>.warm-i`, `.rest-due`
- **Footer:** `.foot > #motd(.motd-out)`
- **Modals:** `.modal(.open)[role=dialog]` → `.modal-panel.cal-panel|.tr-panel`; cal: `.cal-head`(`#calPrev/#calTitle/#calNext/#calClose`), `.cal-dow#calDow`, `.cal-grid#calGrid>.cday(.other|.done|.today)`; trophies: `.tr-head`(`#trophiesTitle/#trophiesClose`), `.tr-grid#trophiesGrid>.badge(.on|.off)[data-tip]>.bi+.bt`
- **Effects:** `#fx`, `.fx-flash`, `.confetti-piece`, `.toast(.show)`, `.badge-toast(.show)>.bt-i`+trailing text span

> Badges carry `data-tip` — build the tooltip yourself: give `.badge` a
> `position:relative` and the tooltip `position:absolute`:
> `.badge[data-tip]:hover::after { content: attr(data-tip); position:absolute; bottom:100%; left:50%; transform:translateX(-50%); … }`
> plus a `::before` arrow. **Without `position` the `::after` renders in-flow and
> shoves the badge's icon/label.** It floats free only because the modal panel is
> `overflow:visible`.

---

## 9. Prompt — fill the blanks, paste together with everything above

> You are authoring a **Sunrise theme** (contract `sunrise.theme/v1`). The full
> contract is in the document above — the page skeleton (§3), runtime
> variables/state classes/inline styles (§4), the layout recipes that prevent
> overlap (§5), house style (§6), reduced motion (§7), and the hook checklist
> (§8). Follow all of it. The app ships **no base CSS**, so you own all layout.
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
>    - styles **every** hook in the §8 checklist, both states of each runtime
>      class (`.modal.open`, `.task.done`, `.cday.*`, `.badge.on/.off`,
>      `.toast.show`, `#motd.motd-out`), and both `.warm` variants;
>    - reads `--track-<id>`, `.ring`'s unitless `--p` via `calc(var(--p)*1%)`
>      with a donut hole, and the confetti vars (`--dx` −1…1, `--dy` 0…1,
>      `--rot`, `--i`);
>    - applies house style: a token system with a 3-step shadow ramp, `clamp()`
>      fluid type, a 2–3 font stack, per-track colors with `color-mix()` tints,
>      a layered atmospheric background, hover/active micro-interactions, and the
>      `.task` entrance keyframe keyed off the inline `animation-delay`;
>    - includes the blanket reduced-motion block.
> 2. The one-line `registerTheme({…})` manifest pointing at that file.
