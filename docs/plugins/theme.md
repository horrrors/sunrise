# Theme Authoring Guide (`sunrise.theme/v1`)

A theme is a CSS file plus a tiny manifest. It styles the canonical DOM hooks (see `README.md`); it must not contain JS or bespoke DOM.

## Manifest

```js
SUNRISE.registerTheme({ schema:"sunrise.theme/v1", id:"my-theme", name:"My Theme", version:"1.0.0", cssHref:"themes/my-theme.css" });
```
| field | type | required |
|---|---|---|
| `schema` | string | ✅ `"sunrise.theme/v1"` |
| `id` | string | ✅ lowercase `[a-z0-9-]` |
| `name` | string | ✅ shown in the theme picker |
| `version` | string | ✅ |
| `cssHref` | string | ✅ path to the CSS file |

## CSS variable contract

Define these on `:root` (or `:root[data-theme="my-theme"]`):
`--bg, --panel, --line, --ink, --ink-dim, --ink-faint, --accent, --gold, --font-display, --font-body, --font-mono`, per-track colors `--track-<id>` (e.g. `--track-dsa`), and confetti colors `--confetti-1..4`.

A theme must style every canonical hook in `README.md` and **must honor reduced motion**:
```css
@media (prefers-reduced-motion: reduce){ .confetti-piece, .fx-flash, .task { animation: none !important; transition: none !important; } }
```

## Minimal example (`themes/my-theme.css`)

```css
:root[data-theme="my-theme"]{
  --bg:#111; --panel:#1b1b1b; --line:#333; --ink:#eee; --ink-dim:#aaa; --ink-faint:#777;
  --accent:#7cf; --gold:#fc6;
  --track-dsa:#e23; --confetti-1:#7cf; --confetti-2:#fc6; --confetti-3:#e23; --confetti-4:#9e9;
}
:root[data-theme="my-theme"] body{ background:var(--bg); color:var(--ink); font-family:var(--font-body, system-ui); }
/* …style .app-header, .stat-card, .today, .task, .modal, .badge, .cday, .confetti-piece … */
```

## Prompt template

> You are authoring a **Sunrise theme** (contract `sunrise.theme/v1`). Follow this guide and the canonical hooks in README.md. Theme vibe: **{DESCRIBE}**. Output a complete `themes/{id}.css` styling every hook + the CSS variables + a reduced-motion block, and the one-line `registerTheme({…})` manifest.
