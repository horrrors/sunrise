# Sunrise Content Pack Authoring Guide (`sunrise.pack/v1`)

**How to use this file:** paste the whole document into an LLM, fill in the
`{PLACEHOLDERS}` in the **Prompt** at the bottom, and it outputs a complete,
ready-to-install content pack as one JS file. This file is the entire contract —
you do not need the app source or any other doc.

A content pack is one declarative object registered via `SUNRISE.registerPack(pack)`.
It is fully self-contained: it declares its own subject columns ("tracks"), its
structure (phases → groups → items → tasks), its display settings, and
optionally its achievements. No code, no app changes beyond loading the file.

Every registered pack is **validated**. An invalid one is rejected — with a
precise reason logged to the console — and simply never appears; it cannot break
the app.

## Install

A pack file is a self-registering IIFE. Save it as `data/packs/<id>.js` and add
one `<script>` line to `index.html` **after** the app bundle:

```html
<script src="dist/sunrise.js"></script>
<script src="data/packs/my-pack.js"></script>
```

```js
(function (root) {
  var pack = { /* …the pack object (see below)… */ };
  if (root.SUNRISE && root.SUNRISE.registerPack) root.SUNRISE.registerPack(pack);
})(typeof window !== 'undefined' ? window : globalThis);
```

**Or import as JSON (no edits).** Save the pack object on its own as a `.json`
file (the bare object — `{ "schema": "sunrise.pack/v1", "id": …, "tracks": […],
"groups": […] }`, no IIFE wrapper) and load it with the 📥 button. The app
classifies it by `schema`, validates and registers it, switches to it, and
persists it under `sunrise.plugins` so it returns on the next load. Importing a
pack whose `id` already exists is **rejected** (no overwrite) — give an updated
pack a new `id`.

## Envelope

| field | type | required | notes |
|---|---|---|---|
| `schema` | string | ✅ | exactly `"sunrise.pack/v1"` |
| `id` | string | ✅ | lowercase `[a-z0-9-]`, must start with a letter or digit; namespaces the user's saved progress |
| `name` | string | ✅ | shown in the pack switcher |
| `version` | string | ✅ | e.g. `"1.0.0"` |
| `locale` | string | — | optional source-language hint; the **displayed** language is chosen by the in-app 🌐 switcher, not this field |
| `settings` | object | — | display / behaviour knobs (below) |
| `tracks` | array | ✅ (≥1) | the subject columns |
| `phases` | array | — | optional top grouping for the dashboard "phases" card |
| `groups` | array | ✅ (≥1) | ordered sections, each holding items |
| `badges` | array | — | extra achievements (declarative rules) |
| `ui` | object | — | overrides app-default UI strings (free-form `{key: Localized}`; see **UI overrides**) |
| `mottos` | Localized[] | — | footer lines; falls back to app defaults |
| `surprises` | Localized[] | — | occasional congratulation messages |

All `id`s match `^[a-z0-9][a-z0-9-]*$` and must be **unique within their list**
(track ids, phase ids, group ids, badge ids); **item ids are globally unique**
across the whole pack, and **task ids are unique within their item**.

No array (`tracks`, `phases`, `groups`, `items`, `tasks`, `resources`, `badges`,
`mottos`, `surprises`) may contain `null` entries. A pack whose `id` is already
registered is rejected at registration time.

## Localized text (`Localized`)

Every **human-visible text field** accepts a `Localized` value — either:

- a plain **string** (language-neutral: shown as-is in every language), or
- a **per-language map** `{ "en": "…", "ru": "…", … }`.

English (`en`) is the primary/fallback language: when the active language is
missing from a map, the app falls back to `en`, then to any present value. So a
field that is only `{ "ru": "…" }` still renders (showing the Russian) but won't
switch. The user toggles language with the header 🌐 button (built-in: EN / RU).

The fields that take `Localized`: `name`, every `tracks[].label`,
`phases[].title`, `groups[].title`, `items[].{title,warmup,reflectPrompt}`,
`tasks[].{text,guidance}`, `resources[].{label,note}`, `badges[].{title,desc}`,
each `mottos[]` / `surprises[]` element, and every value in `ui` and
`settings.labels`. All `id`s, `track`/`phase` references, `icon`s, and `color`s
stay plain strings. Example:

```js
{ "id": "w1d1", "track": "dsa",
  "title": { "en": "Complexity + arrays", "ru": "Сложность + массивы" },
  "tasks": [ { "id": "t1",
    "text": { "en": "Theory: Big-O and amortization.", "ru": "Теория: Big-O и амортизация." } } ] }
```

A single-language pack that uses plain strings everywhere is still valid — it
simply shows the same text regardless of the toggle.

## `tracks[]` — the subject columns

```js
{ id:"dsa", label:"Algorithms", icon:"算", color:"#e23" }
```

- `id` ✅, `label` ✅. `icon` optional (short glyph/emoji).
- `color` is an optional **hint**: the app applies it inline as `--track-<id>`
  so the pack looks right under any theme, and this hint wins over a theme's own
  `:root` `--track-<id>`. (A theme that wants to force a track color styles the
  `[data-track="<id>"]` elements directly.)
- **`rest` is a built-in track id** — you may use `track:"rest"` on rest items
  without declaring it.

## `settings{}`

```js
{ labels:{ phase:"Phase", item:"Day" },
  reflections:true, warmups:true }
```

- `labels` — display nouns; only `phase` and `item` are used (values must be
  strings).
- `reflections` / `warmups` are **on unless you set them to `false`**.

## `phases[]` / `groups[]` / `items[]`

```js
phases: [ { id:"p1", title:"Foundations" } ],
groups: [
  { id:"g1", title:"Week 1", phase:"p1",
    items: [
      { id:"g1i1", track:"dsa", title:"Complexity",
        warmup:"warm-up text", reflectPrompt:"reflection question",
        tasks:[ { id:"t1", text:"Task one" }, { id:"t2", text:"Task two" } ],
        resources:[ { label:"MDN", note:"Big-O" } ] },
      { id:"g1rest", track:"rest", rest:true, reflectPrompt:"What stuck this week?" }
    ] }
]
```

- A **group** needs `id` + `title` and at least one item; `phase` (if set) must
  reference a declared phase id.
- An **item** is complete when all its `tasks` are checked. `title` is optional;
  `warmup` / `reflectPrompt` / `resources` are optional.
- **A non-rest item must have at least one task — the validator enforces this**
  (`non-rest item needs at least one task`): a task-less non-rest item could
  never be completed, yet would still count toward the total. Only `rest:true`
  items may omit tasks.
- `rest:true` items are breathers — not counted toward progress and carry no
  tasks; give them `track:"rest"`.
- A **task** is `{ id, text, guidance? }` — both `id` and `text` are required;
  `guidance` is optional and renders as a collapsible hint under the checkbox
  (label from `ui.hint`) — use it for "what a strong answer looks like" notes.
- A **resource** is `{ label, note }` (both required).
- An item's `track` must reference a declared track id (or `"rest"`).

## `badges[]` — declarative achievement rules

Each badge is data: `{ id, title, desc, icon, type, …params }`. No code. The app
ships a generic set automatically (streaks, total days, reflections,
weekend / night-owl / early-lark, perfect group, halfway, finisher, comeback);
your pack only adds extras. To override a generic badge, reuse its `id` — your
rule replaces both the unlock condition and the displayed title/desc/icon.

Required per type: `id`, `title`, `type`. (`desc`, `icon` optional.)

| `type` | params | unlocks when |
|---|---|---|
| `streak` | `gte:number` | longest daily streak ≥ gte |
| `days-done` | `gte:number` | items completed ≥ gte |
| `percent` | `gte:number` | overall percent ≥ gte |
| `all-done` | — | every non-rest item complete |
| `tasks-done` | `gte:number, track?:string` | tasks checked (optionally within a track) ≥ gte |
| `reflections` | `gte:number` | non-empty reflections ≥ gte |
| `groups-complete` | `gte:number` | fully-complete groups ≥ gte |
| `track-complete` | `track:string` | a (declared) track is 100% complete |
| `phase-complete` | `phase:string` | a (declared) phase is 100% complete |
| `item-complete` | `item:string` | a specific (declared) item is complete |
| `all-tracks` | `eachGte:number` | every track has ≥ eachGte items done |
| `weekday` | `days:number[]` — integers 1..7 | completed an item on a listed weekday (1=Mon … 7=Sun) |
| `hour-range` | `from:number, to:number` — hours 0..23 | completed an item in the hour window (wraps if from>to) |
| `comeback` | — | resumed after a ≥2-day gap |

The `track` / `phase` / `item` referenced by `track-complete`, `tasks-done`,
`phase-complete`, and `item-complete` must exist in the pack.

```js
{ id:"capstone", title:"Capstone", desc:"Final project done", icon:"🏛️", type:"item-complete", item:"g13i6" }
```

## UI overrides (`ui`)

A pack may override any app-default UI string via a top-level `ui` object (it is
a free-form `{ key: Localized }` map; unknown keys are harmless, missing ones
fall back to the app defaults; every value is a `Localized` — a string or a
`{ en, ru, … }` map). The ones most worth setting per pack:

- `phaseLabel` — the small header label; supports `{p}` (current group's phase
  id) and `{w}` (current group's 1-based ordinal). The app default is empty, so
  set this if you want a header label, e.g. `"Phase {p} · Week {w}"`.
- `todayVert` / `restVert` — the vertical captions on the day card and rest card.
- `hint` — label on the per-task `guidance` spoiler (default: a localized "what
  counts as a strong answer").
- `restTitle` — the rest-day card heading.
- `aiPrompt` — the pre-prompt the "AI copy" button wraps a task/warm-up in, so
  the learner can paste it straight into a chat assistant. Placeholders:
  `{title}` (current item title), `{track}` (track label), `{text}` (the copied
  task/warm-up text), `{guidance}` (replaced with a filled `aiPromptGuidance`
  line when the task has `guidance`, else removed). The default is a Russian
  tutor prompt — **override this when your pack is in another language**, and
  keep all four placeholders.
- `aiPromptGuidance` — the guidance line inside `aiPrompt` (`{guidance}` = the
  task's `guidance` text).
- `copy` / `copyAi` (button tooltips), `copied` / `copiedAi` (toasts).

```js
ui: { phaseLabel:"Phase {p} · Week {w}", todayVert:"TODAY", restVert:"REST" }
```

## Complete minimal example (`data/packs/rust-core.js`)

```js
(function (root){
  var pack = {
    schema:"sunrise.pack/v1", id:"rust-core", name:"Rust Core", version:"1.0.0", locale:"en",
    settings:{ labels:{ phase:"Phase", item:"Day" }, reflections:true, warmups:true },
    tracks:[ { id:"ownership", label:"Ownership", icon:"🦀", color:"#d35400" },
             { id:"async", label:"Async", icon:"⚙️", color:"#2980b9" } ],
    phases:[ { id:"p1", title:"Basics" } ],
    groups:[ { id:"g1", title:"Week 1", phase:"p1", items:[
      { id:"g1i1", track:"ownership", title:"Move semantics", warmup:"Recall stack vs heap",
        reflectPrompt:"Where did the borrow checker bite?", tasks:[ { id:"t1", text:"Read ch.4" }, { id:"t2", text:"Solve 3 exercises" } ] },
      { id:"g1i2", track:"async", title:"Futures 101", tasks:[ { id:"t1", text:"Write a hello-async" } ] },
      { id:"g1rest", track:"rest", rest:true, reflectPrompt:"Review the week" }
    ] } ],
    badges:[ { id:"own-master", title:"Owner", desc:"Ownership track done", icon:"🦀", type:"track-complete", track:"ownership" } ],
    mottos:[ "Fearless concurrency, one day at a time." ],
  };
  if (root.SUNRISE && root.SUNRISE.registerPack) root.SUNRISE.registerPack(pack);
})(typeof window !== 'undefined' ? window : globalThis);
```

## Prompt — fill the blanks, paste together with everything above

> You are authoring a **Sunrise content pack** (contract `sunrise.pack/v1`). The
> full contract — envelope, tracks, structure, badge rules, and UI overrides —
> is in the document above. Follow it exactly.
>
> Produce a pack with id **{ID}** (a kebab-case slug matching
> `^[a-z0-9][a-z0-9-]*$`) about **{TOPIC}**, with **{N}** groups of about
> **{M}** items each, using tracks **{TRACK LIST}**, locale **{LOCALE}**.
>
> Rules: the pack object must include `schema:"sunrise.pack/v1"`, `id:"{ID}"`,
> `name`, `version`, at least one track, and at least one group. Every non-rest
> item has 2–4 concrete `tasks` (the validator rejects a non-rest item with no
> tasks); every task has both `id` and `text`; end each group with a `rest:true`
> item on `track:"rest"`; all ids match `^[a-z0-9][a-z0-9-]*$`, item ids are
> globally unique, task ids unique within their item; no array contains `null`
> entries; every text field is a `Localized` (a string, or a `{ en, ru }` map —
> en is the fallback); weekday badge `days`
> are integers 1..7 and hour-range `from`/`to` are hours 0..23; any
> badge/track/phase/item it references must exist.
>
> Output **only** the self-registering `data/packs/{ID}.js` file (the IIFE that
> calls `registerPack({…})`), nothing else.

## Versioning

`schema:"sunrise.pack/v1"` is the current contract. The app rejects unknown
versions with a clear message; future versions add a migrator.
