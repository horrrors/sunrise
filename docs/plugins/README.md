# Sunrise Plugins

Sunrise loads two kinds of plugins, each a single self-registering JS file:

- **Theme** — a visual skin (CSS over a fixed set of DOM hooks). See `theme.md`.
- **Content pack** — a self-contained knowledge base (its own tracks, structure, settings, badges). See `content-pack.md`.

You do not need to read the app source to author either one. The docs are the contract.

## How a plugin is loaded

A plugin file calls a global registration function:

```js
// a content pack file
(function (root){
  var pack = { /* ...the pack object... */ };
  if (root.SUNRISE && root.SUNRISE.registerPack) root.SUNRISE.registerPack(pack);
})(typeof window !== 'undefined' ? window : globalThis);
```

```js
// a theme file
(function (root){
  if (root.SUNRISE && root.SUNRISE.registerTheme)
    root.SUNRISE.registerTheme({ schema:'sunrise.theme/v1', id:'my-theme', name:'My Theme', version:'1.0.0', cssHref:'themes/my-theme.css' });
})(typeof window !== 'undefined' ? window : globalThis);
```

To install, add one `<script src="…">` line to `index.html` after the bundled plugins. Every registered plugin is **validated**; an invalid one is rejected (with a precise reason in the console) and simply does not appear — it never breaks the app.

## Canonical DOM hooks (themes style these; do not rename)

Stable `id`/`class` hooks the app renders and themes target:

- Header `header.app-header`: `.brand` (`.brand-mark`, `.brand-name`, `#phaseLabel`), `#packSelect`, `#themeSelect`, `#daySelect`, `#calBtn`, `#trophiesBtn`, `#exportBtn`, `#importBtn`.
- Dashboard `#dashboard`: 4 `.stat-card` with `data-kind="progress|streak|phases|tracks"`; inside, `.eyebrow`, `.ring`, `.streak-num`, `.prow` + `.bar`.
- Day block: `.day-rail` → `#prevDay.day-nav`, `#todayCard.today`, `#nextDay.day-nav`; `#comeback`.
  - Inside `#todayCard`: `.trackpill`, `.today-title`, `.warm`, `#taskList` (`.task` > `input#cb_<taskId>` + `.box` + `.task-text`; a task with `guidance` is wrapped in `.task-wrap` with a `.task-hint` > `.task-hint-body` spoiler), `#reflect`, `.res-row .chip`, `#markReview`, `#nextDayCta`.
  - Track-colored elements carry `data-track="<trackId>"`; **the CSS theme sets the color** via `--track-<id>`.
- Calendar modal `#calModal.modal` (`role="dialog"`): `#calPrev`, `#calTitle`, `#calNext`, `#calClose`, `.cal-dow`, `#calGrid` (`.cday[.done|.today|.other]`).
- Trophies modal `#trophiesModal.modal`: `#trophiesTitle`, `#trophiesClose`, `#trophiesGrid` (`.badge[.on|.off]` with `data-tip`).
- Footer `.foot` → `#motd`. Effects (app spawns, theme styles): `.confetti-piece`, `.toast`, `.badge-toast`, `.fx-flash` inside `#fx`.
