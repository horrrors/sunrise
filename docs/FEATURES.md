# Sunrise — Feature List

What the app does today, grouped by area. Each line is one feature with a one-sentence description. (For *how* it's built, see [ARCHITECTURE.md](ARCHITECTURE.md); for authoring plugins, see [plugins/](plugins/).)

## Tracking & progress

- **Day-at-a-time checklist** — the active "item" (a day) shows its tasks; the day counts as *complete* only when **all** its tasks are checked.
- **Per-day reflection** — a free-text note saved per item (e.g. "what I learned today").
- **Strong-answer guidance** — a task may carry optional `guidance` text, shown as a collapsible "what counts as a strong answer" spoiler under the checkbox.
- **Warm-up line** — an optional priming prompt shown above the day's tasks.
- **Resources** — optional reference chips (label + note) attached to a day.
- **Copy & AI copy** — every task and warm-up carries two hover tools: plain copy, and "AI copy" which wraps the text in a ready-to-paste tutor pre-prompt (current topic + track + the strong-answer criterion when the task has one), so an AI chat gives a useful answer first try. The template is pack-overridable (`ui.aiPrompt`).
- **Day navigation** — prev/next arrows, a "next day →" button when a day is done, and a dropdown to jump to any day.
- **Keyboard navigation** — `←/→` change day, `↑/↓` move between the day's tasks, `Enter` marks the focused task, `M`/`T`/`?` open card map / trophies / a shortcuts overlay, and `Esc` closes any dialog.
- **Per-pack progress** — progress (checks, streaks, trophies) is stored **separately per content pack**, so two different programs keep independent histories.
- **Saved automatically** — all progress persists to `localStorage`; nothing is lost on reload.

## Momentum & gamification

- **Streaks** — current streak (consecutive days ending today/yesterday) and longest-ever streak, computed on UTC dates.
- **Card map** — a compact grid of every card in the pack, grouped by week, marking which are done vs not; click a card to jump straight to it.
- **30 trophies** — achievements across streaks, total days, tasks done, reflections written, track/phase mastery, weekend/night-owl/early-lark timing, "comeback after a gap", and finishing. **Once earned, they stay earned.**
- **Confetti** — fires when you complete a day.
- **Trophy toast** — a pop-up when you unlock a new badge.
- **Surprise notes** — a ~12% chance of a short congratulatory message on completing a day.
- **Rotating mottos** — a footer line that cycles through the pack's mottos every few seconds.
- **Comeback banner** — a gentle "welcome back" prompt after you return from a break.

## Content & plugins

- **Content packs** — the whole roadmap is a swappable "pack": it declares its own subject **tracks**, **structure** (phases → groups → items → tasks), **settings**, and **badges**. The bundled pack is a 13-week software-engineering curriculum, but a pack can be any plan (a language, fitness, a reading list…).
- **Pack switcher** — install multiple packs and switch the active one from a dropdown.
- **Runtime-pluggable** — add a pack (a plain `.js` file that self-registers) or a theme (a `.css` file + manifest) by dropping in a file and adding one `<script>`/`<link>` line — **no rebuild**.
- **Validated at load** — every pack/theme is checked against its contract when it registers; an invalid one is rejected with a precise reason and simply doesn't appear (the app keeps running).
- **AI-authorable** — the plugin contracts are documented standalone (`docs/plugins/`) so an LLM can produce a valid pack or theme from the docs alone.

## Mobile HUD

On phones (viewport ≤640px) every theme automatically switches to a game-HUD layout — no theme work required:

- **One-line header** — the brand bar collapses; controls move off-screen.
- **Hero today card** — the active day's card fills the viewport below the header.
- **Bottom dock** — a fixed `nav#dock` sits at the screen bottom with two micro-bars (streak filled against a 30-day cap, progress as done/total) and three buttons: 🗺️ card map, 🏆 trophies, ☰ menu.
- **Bottom sheets** — tapping the bars opens a stats/controls sheet; ☰ opens the pack/theme/day/export/import sheet; sheets are mutually exclusive and close on `Esc`, on any toolbar action, when a modal opens, or when the dock button that opened them is tapped again.
- **Swipe to change day** — swipe left/right on the today card (50px horizontal-dominant threshold) navigates to the next/previous day.
- **Desktop untouched** — the only change on wide screens is `#dock { display: none }`; all desktop layout is pixel-identical.

## Appearance

- **17 themes** — 5 built-in (Neo-Brutalist Riso, Neon, Japanese, Emerald, Colorful Dashboard) + 12 registered in `index.html` — switchable live and remembered across sessions.
- **Per-track colors** — a pack can suggest a color per track; themes can override.
- **Icon tooltips** — hovering an icon-only control (toolbar buttons, day arrows, dialog ✕) shows its name, localized by the pack.
- **Localized UI** — UI strings, day-of-week, month names, and labels are data (the bundled pack ships a Russian UI with Japanese flourishes); a pack can override any of them.

## Data

- **Export** — download your progress for the active pack as a JSON file.
- **Import** — load a progress JSON back; it's validated, and a bad file is rejected with an alert (your current progress is untouched).
- **Legacy migration** — progress saved by the original (pre-rewrite) app is migrated automatically on first load, with no data loss.

## Platform

- **Offline, no server** — opens by double-clicking `index.html` from `file://`; works with no network.
- **Installable PWA** — served over HTTPS the app installs to a phone home screen (manifest + icons) and runs fully offline via a cache-first service worker that precaches the bundle, every pack and **every theme**; progress data never leaves the device. `file://` desktop use is unchanged.
- **Zero runtime dependencies** — the shipped bundle is plain JavaScript; the only dependencies are dev-time build tools.
- **Graceful degradation** — corrupt saved data resets to a fresh start rather than crashing; a failed boot shows a readable fallback (listing why), never a blank page.
- **Accessible touches** — ARIA labels on controls, `role="dialog"` modals, Escape-to-close, `prefers-reduced-motion` honored by the themes, and a per-pack `<html lang>`.
