# Sunrise · 日の出

A personal **goal-achievement tracker** — a single, offline, **zero-build** web app that turns any long-term goal or plan into one checkable day at a time, with streaks, trophies, and a calendar to keep momentum.

It runs by **double-clicking `index.html`** — no server, no build step, no dependencies. Just vanilla JS, swappable CSS themes, and plain-data content packs.

> Sunrise is **goal-agnostic**: a "content pack" is any plan broken into days — a language, a fitness program, a reading list, an instrument, a course, a 30-day challenge. The bundled example pack happens to be a 13-week software-engineering curriculum (Russian UI, Japanese flourishes), but it's just one pack — load or author your own. See [Plugins](#plugins).

---

## Quick start

```bash
# just open it — no install, no build
open index.html        # macOS    (or double-click the file)
```

Your progress is saved to `localStorage`; export/import it as JSON from the toolbar. Everything works fully offline from `file://`.

## Features

- **One day at a time** — each day is a small set of tasks; a day completes when all its tasks are checked.
- **Streaks & calendar** — current/longest streak (UTC), plus a month calendar marking completed days.
- **30 trophies** — streaks, totals, reflections, track/phase mastery, weekend/night-owl/early-lark, comeback, and more. Once earned, they stick.
- **Per-day reflection** and an optional **"strong answer" guidance** spoiler under tasks.
- **Spaced repetition** — schedule pattern reviews on review-eligible tracks; due items surface on rest days.
- **5 themes**, switchable live (Neo-Brutalist, Neon, Japanese, Emerald, Dashboard).
- **Confetti, surprise notes, rotating mottos** — small dopamine hits on completion.
- **Export / import** progress as JSON.

## Architecture

Sunrise is a **thin host** that loads plugins. Nothing domain-specific is hardcoded — the curriculum is just the first content pack.

```
index.html  →  core/validate.js → core/registry.js → core/state.js
            →  logic.js  →  data/app-defaults.js → data/builtin-themes.js
            →  data/packs/dev-roadmap.js  →  app.js
```

| Layer | File(s) | Responsibility |
|---|---|---|
| **Load seam** | `core/registry.js` | `registerPack` / `registerTheme` / `packs()` / `themes()` — the one place a future server swap would touch. Validates every plugin at register; rejects invalid ones with a reason. |
| **Contract** | `core/validate.js` | Hand-rolled schema validator + the declarative `BADGE_RULES` table (no library). |
| **Pure core** | `logic.js` | Dates, progress, streaks, aggregation, spaced repetition, the badge-rule interpreter. No DOM — fully Node-testable. |
| **State** | `core/state.js` | Per-pack progress + session in `localStorage`; lossless, idempotent migration of legacy saves. |
| **Data** | `data/app-defaults.js`, `data/builtin-themes.js`, `data/packs/*.js` | Fallback UI strings + 20 generic badges; the 5 bundled themes; content packs. |
| **Host / view** | `app.js`, `index.html` | Resolves the active pack + theme, renders from whatever the pack declares, wires events. |
| **Themes** | `themes/*.css` | CSS-only skins over a fixed set of canonical DOM hooks. |

Progress is **namespaced per pack**, so multiple roadmaps keep independent streaks and trophies.

## Plugins

Two kinds, each a single self-registering `.js` file (themes pair with a `.css`). Install by adding one `<script src>` line to `index.html`.

- **Content pack** — a self-contained knowledge base: its own tracks (subject columns), structure (groups → items → tasks), settings, and optional declarative badges.
- **Theme** — a CSS skin + a tiny manifest, layered over the canonical hooks.

The formats are designed to be **authored from documentation alone** — hand the relevant guide to an LLM (with no source access) and paste back the result. The validator keeps the docs and the runtime honest.

- **[`docs/plugins/README.md`](docs/plugins/README.md)** — overview, loading, canonical DOM hooks
- **[`docs/plugins/content-pack.md`](docs/plugins/content-pack.md)** — the content-pack contract + badge-rule reference + a paste-ready prompt
- **[`docs/plugins/theme.md`](docs/plugins/theme.md)** — the theme contract + CSS-variable list

## Project structure

```
index.html                 app shell + canonical DOM hooks + theme <link>
app.js                     plugin host: active pack/theme, rendering, events
logic.js                   pure core (Node-testable): progress, streaks, badges, validators re-export
core/
  registry.js              plugin load seam (validate-at-register)
  validate.js              schema validator + BADGE_RULES interpreter table
  state.js                 per-pack progress + session + legacy migration
data/
  app-defaults.js          fallback UI strings + 20 generic badge rules
  builtin-themes.js        registers the 5 bundled themes
  packs/dev-roadmap.js     pack #1 — the 13-week curriculum (13 groups · 91 items · 9 tracks)
themes/                    bonus · neon · japanese · emerald · dashboard  (CSS only)
docs/plugins/              authoring guides (the "AI-first" deliverable)
test/                      node --test suites (logic, validators, badges, state, migration, app, …)
scripts/reshape-curriculum.js   one-off generator that produced pack #1 (kept for provenance)
```

## Development

```bash
npm test        # or: node --test   — runs every test/*.test.js
```

There is **no build**. Tests are plain `node --test` (no dependencies). The `logic.js` / `core/*` layer is pure and tested in isolation; `app.js` is exercised through a small `vm` + fake-DOM harness in `test/app.test.js`.

**Constraints (by design):** vanilla JS only; no framework, bundler, or npm dependency; must open from `file://`; simplicity over abstraction.

## License

Private / personal project.
