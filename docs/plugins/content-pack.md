# Content Pack Authoring Guide (`sunrise.pack/v1`)

A content pack is one declarative object registered via `SUNRISE.registerPack(pack)`. It is fully self-contained: it declares its own subject columns ("tracks"), its structure, its display settings, and (optionally) its achievements. You can author one from this doc alone.

## Envelope

| field | type | required | notes |
|---|---|---|---|
| `schema` | string | ✅ | exactly `"sunrise.pack/v1"` |
| `id` | string | ✅ | lowercase `[a-z0-9-]`, must start with a letter or digit; namespaces the user's saved progress |
| `name` | string | ✅ | shown in the pack switcher |
| `version` | string | ✅ | e.g. `"1.0.0"` |
| `locale` | string | — | sets `<html lang>`, e.g. `"ru"`, `"en"`, `"ja"` |
| `settings` | object | — | display/behaviour knobs (below) |
| `tracks` | array | ✅ (≥1) | the subject columns |
| `phases` | array | — | optional top grouping for the dashboard "phases" card |
| `groups` | array | ✅ (≥1) | ordered sections, each holding items |
| `badges` | array | — | extra achievements (declarative rules) |
| `ui` | object | — | overrides app-default UI strings (see **UI overrides** below) |
| `mottos` | string[] | — | footer lines; falls back to app defaults |
| `surprises` | string[] | — | occasional congratulation messages |

## `tracks[]` — the subject columns

```js
{ id:"dsa", label:"Algorithms", icon:"算", color:"#e23", reviewable:true }
```
- `id` ✅, `label` ✅. `icon` optional (short glyph/emoji). `color` is an optional **hint**: the app applies it inline as `--track-<id>` so the pack looks right under any theme. This pack `color` takes precedence over a theme's `:root` `--track-<id>`; a theme that wants to control a track's color should style `[data-track="<id>"]` elements directly. `reviewable` optional — items on this track show a "schedule review" button (spaced repetition).

## `settings{}`

```js
{ labels:{ phase:"Phase", group:"Week", groupAbbr:"Wk", item:"Day" },
  reviews:true, reflections:true, warmups:true }
```
- `labels` — display nouns for the hierarchy. `reviews`/`reflections`/`warmups` — feature toggles (default true).

## `phases[]` / `groups[]` / `items[]`

```js
phases: [ { id:"p1", title:"Foundations" } ],
groups: [
  { id:"g1", title:"Week 1", phase:"p1", theme:"Intro topics",
    items: [
      { id:"g1i1", track:"dsa", title:"Complexity",
        warmup:"warm-up text", reflectPrompt:"reflection question",
        tasks:[ { id:"t1", text:"Task one" }, { id:"t2", text:"Task two" } ],
        resources:[ { label:"MDN", note:"Big-O" } ] },
      { id:"g1rest", track:"rest", rest:true, reflectPrompt:"Rest & review" }
    ] }
]
```
- An **item** is complete when all its `tasks` are checked. `rest:true` items are breathers — not counted toward progress, no tasks. `id`s must be globally unique within the pack. `phase` on a group must reference a declared phase id.
- A task is `{ id, text, guidance? }`. Optional `guidance` renders as a collapsible hint under the checkbox (label from the app-default `ui.hint`) — use it for "what a strong answer looks like" notes.

## `badges[]` — declarative achievement rules

Each badge is data: `{ id, title, desc, icon, type, …params }`. No code. The app ships a generic set automatically (streaks, total days, reflections, weekend/night-owl/early-lark, perfect group, halfway, finisher, comeback); your pack only adds extras. To override a generic badge, reuse its `id`.

| `type` | params | unlocks when |
|---|---|---|
| `streak` | `gte:number` | longest daily streak ≥ gte |
| `days-done` | `gte:number` | items completed ≥ gte |
| `percent` | `gte:number` | overall percent ≥ gte |
| `all-done` | — | every non-rest item complete |
| `tasks-done` | `gte:number, track?:string` | tasks checked (optionally within a track) ≥ gte |
| `reflections` | `gte:number` | non-empty reflections ≥ gte |
| `groups-complete` | `gte:number` | fully-complete groups ≥ gte |
| `track-complete` | `track:string` | a track is 100% complete |
| `phase-complete` | `phase:string` | a phase is 100% complete |
| `item-complete` | `item:string` | a specific item is complete |
| `all-tracks` | `eachGte:number` | every track has ≥ eachGte items done |
| `weekday` | `days:number[]` | completed an item on a listed weekday (1=Mon … 7=Sun) |
| `hour-range` | `from:number, to:number` | completed an item in the hour window (wraps if from>to) |
| `comeback` | — | resumed after a ≥2-day gap |

Example pack-specific badge:
```js
{ id:"capstone", title:"Capstone", desc:"Final project done", icon:"🏛️", type:"item-complete", item:"g13i6" }
```

## UI overrides (`ui`)

A pack may override any app-default UI string via a top-level `ui` object (falls back to the app defaults otherwise). The ones most worth setting per pack:

- `phaseLabel` — the small header label; supports `{p}` (the current group's phase id) and `{w}` (the current group's 1-based ordinal). The app default is empty, so set this if you want a header label, e.g. `"Phase {p} · Week {w}"`.
- `todayVert` / `restVert` — the vertical captions on the day card and rest card.
- `hint` — the label on the per-task `guidance` spoiler (default: a localized "what counts as a strong answer").
- `scheduleReview`, `restTitle`, `restToday`, `dueToday` — review/rest captions.

Example: `ui: { phaseLabel:"Phase {p} · Week {w}", todayVert:"TODAY", restVert:"REST" }`

## Complete minimal example

```js
(function (root){
  var pack = {
    schema:"sunrise.pack/v1", id:"rust-core", name:"Rust Core", version:"1.0.0", locale:"en",
    settings:{ labels:{ phase:"Phase", group:"Week", groupAbbr:"Wk", item:"Day" }, reviews:false, reflections:true, warmups:true },
    tracks:[ { id:"ownership", label:"Ownership", icon:"🦀", color:"#d35400" },
             { id:"async", label:"Async", icon:"⚙️", color:"#2980b9" } ],
    phases:[ { id:"p1", title:"Basics" } ],
    groups:[ { id:"g1", title:"Week 1", phase:"p1", theme:"Ownership & borrowing", items:[
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

## Prompt template (paste into any LLM)

> You are authoring a **Sunrise content pack** (contract `sunrise.pack/v1`). Follow this guide exactly: [paste this whole file]. Produce a pack about **{TOPIC}** with **{N}** groups of **{M}** items, using tracks **{TRACK LIST}**, locale **{LOCALE}**. Each non-rest item needs 2–4 concrete `tasks`. End each group with a `rest:true` item. Output **only** the `registerPack({…})` JS file, nothing else.

## Versioning

`schema:"sunrise.pack/v1"` is the current contract. The app rejects unknown versions with a clear message; future versions add a migrator.
