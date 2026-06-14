# Extensible plugin import — design

**Date:** 2026-06-14
**Status:** approved (design), pending implementation plan

## Goal

Turn the single 📥 import button into a **smart importer** that classifies a dropped
JSON file by its `schema` field and routes it to the right handler — packs (roadmaps),
themes, and progress all go through the *same* button. Imported packs/themes **persist**
so the app loads plugins from two sources at boot: the built-in app (script tags /
`BUILTIN_THEMES`) **and** user storage (localStorage).

The architecture must be **open for extension**: adding a new importable plugin kind
later (e.g. a sound pack, a widget pack) should require writing one handler + its
consumer and adding one line at the composition root — *not* editing the import
dispatcher, the controller, the storage format, or the boot sequence.

This work also **decomposes the `Tracker` god-object** along a command/query seam, which
is a precondition for the above (the import pipeline must not pile onto Tracker).

## Decisions (from brainstorming)

| Decision | Choice | Rationale |
|---|---|---|
| Import file format | **JSON only, external producers** | No `eval` of `.js`; pure data. Producers = the authoring-guide LLM (updated to emit JSON) or hand-authored files. No in-app pack/theme export. |
| Plugin lifecycle | **Reject duplicate ids; no overwrite; no removal UI** | Strictest/simplest. Updating a plugin means a new id. Matches today's registry behavior. |
| Tracker scope | **Decompose now (CQS)** | Tracker is a ~430-line god-object mixing write model, read model, and selection. Adding plugin logic would worsen it. |
| High-level architecture | **Open/closed import pipeline (`ImportHandler` + `Importer`)** | User named future plugin kinds as an explicit requirement, so the extension seam is justified (not speculative). |
| Theme CSS transport | **Inline `css` text → blob-URL `cssHref` at registration** | A `file://` app cannot ship a separate `.css`; the theme JSON must be self-contained. Blob URL keeps `applyTheme`'s `<link href>` path unchanged. |
| Progress routing | **Route to the file's `packId` if that pack is loaded (switch if needed); else reject** | "Classify and set it up." Falls back to today's reject-on-mismatch when the pack is absent. |
| Activation | **At the UI boundary, from `ImportOutcome.kind`** | Handlers stay pure (no navigation). Controller sequences import → activate → render. |
| Registration timing | **Live (no page reload)** | Imported plugin appears and activates immediately. |

## Architecture

Onion preserved: `domain → ports ← adapters`; `main.ts` is the only composition root.

### The extension seam

```ts
// src/domain/plugins/import-handler.ts
interface ImportHandler<E = unknown> {
  matches(raw: unknown): boolean;     // its schema discriminator (+ any legacy fallback)
  validate(raw: unknown): E;          // throws ValidationError
  install(entity: E): ImportOutcome;  // the effect: register-to-catalog OR apply-to-aggregate
  readonly persistable: boolean;      // catalog plugins persist + replay at boot; progress does not
}
type ImportOutcome = { kind: 'pack' | 'theme' | 'progress' | string; id: string };
```

```ts
// src/domain/plugins/importer.ts
class Importer {
  constructor(private handlers: readonly ImportHandler[], private store: PluginStore) {}

  // parse JSON → first handler whose matches() is true → validate → install
  // → if handler.persistable, store.append(raw). Throws ImportError if no handler matches.
  import(json: string): ImportOutcome;

  // boot replay: for each persisted raw → matching handler → validate → install
  // (NO re-persist). Errors are swallowed + logged (a stored plugin gone bad must not crash boot).
  loadStored(): void;
}
```

### Current handlers (each simple inside)

- **`PackPlugin`** — `ctor(registry: PluginRegistry)`. `matches`: `raw.schema === 'sunrise.pack/v1'`.
  `validate`: `PackValidator.parse`. `install`: `registry.addPack(pack)` (throws `ImportError`
  on duplicate id). `persistable = true`.
- **`ThemePlugin`** — `ctor(registry: PluginRegistry)`. `matches`: `raw.schema === 'sunrise.theme/v1'`.
  `validate`: `ThemeValidator.parse`. `install`: `registry.addTheme(theme)` (the adapter
  materializes inline `css` → blob-URL `cssHref`; throws on duplicate id). `persistable = true`.
- **`ProgressPlugin`** — `ctor(target: ProgressTarget)`. `matches`:
  `raw.schema === 'sunrise.progress/v1'` **or** (no `schema` and has `items`/`days` — legacy).
  `validate`: `ProgressValidator.parse` + capture `packId`. `install`:
  `target.importProgress(packId, data)`. `persistable = false`.

**Adding a new kind later** (worked example — a sound pack):
1. Add a `SoundSource` port + adapter consumer (where the app reads sounds).
2. Write `SoundPlugin implements ImportHandler` (`matches` on `sunrise.sound/v1`, `validate`
   via a new `SoundValidator`, `install` via the registry, `persistable = true`).
3. Add `new SoundPlugin(registry)` to the handler list in `main.ts`.

`Importer`, `DomController`, `PluginStore` format, and `loadStored()` are **untouched**.

### Tracker decomposition (CQS)

- **`Tracker`** (write model, keeps its name — now genuinely "tracks progress through the
  active pack"): lifecycle (`init`/`loadPack`/`save`/reconcile), navigation
  (`selectItem`/`goToItem`/resume/cursor), intents (`setTaskDone`/`setReflection`/completion
  +badge-sync), selections (`selectPack`/`selectTheme`/`setLang` — via a private
  `patchSession()` helper), progress I/O (`importProgress(packId, data)`, `exportProgress`),
  trivial state getters (`activePackId`/`activeThemeId`/`activeThemeHref`/`currentLang`/`langs`),
  and a readonly `view()` snapshot. Implements the narrow **`ProgressTarget`** port that
  `ProgressPlugin` depends on.
- **`Projections`** (read model, new `src/domain/projections.ts`): stateless projector built
  from the calc deps (`stats`, `streaks`, `badges`, defaults, pack/theme sources) + a reference
  to `tracker.view()`. Owns **all** VM builders (`todayCard`, `dashboard`, `cardMap`, `trophies`,
  `selectors`, `comeback`, `trackColors`, `mottos`, `aiPrompt`, `ui`, `itemLabel`) and **all**
  i18n resolution (`uiText`, `lbl`, `trackMeta`, `tr`).

`ProgressTarget`:

```ts
interface ProgressTarget {
  // Switches to packId if it names a different *loaded* pack; throws ImportError
  // if packId is given but not loaded. Replaces progress, reconciles, saves, resets cursor.
  importProgress(packId: string | null, data: ProgressData): string; // returns resolved packId
}
```

### Ports & adapters

- **`PluginStore`** port — `{ load(): unknown[]; append(raw: unknown): void }`. Adapter:
  `LocalStoragePluginStore`, key `sunrise.plugins` = a **flat `unknown[]`** of raw, self-describing
  (each carries its own `schema`) plugin objects. New kinds need **no storage-format change**.
- **`PluginRegistry`** (write side) port — `{ addPack(p: Pack): void; addTheme(t: Theme): void;
  hasPack(id): boolean; hasTheme(id): boolean }`. Implemented by `WindowPluginRegistry`
  (which already holds the lists and the boot-time swallow-and-log `registerPack`/`registerTheme`).
  `addPack`/`addTheme` **throw** `ImportError` on validation/duplicate so the import path can
  surface errors (boot path keeps swallowing). `addTheme` materializes inline `css` →
  `URL.createObjectURL(new Blob([css], {type:'text/css'}))` and stores that as the theme's
  effective `cssHref`, so `themeHref()`/`applyTheme` are unchanged.
- **`Theme`** entity gains optional `readonly css?: string`; `ThemeValidator` requires
  **`cssHref` OR `css`** (built-ins keep `cssHref`; imported themes ship `css`).

### Composition root (`main.ts`)

```
registry (WindowPluginRegistry) + addBuiltinThemes
window.SUNRISE = registerPack/registerTheme  (script tags self-register, as today)
boot():
  migrateLegacy()
  pluginStore = LocalStoragePluginStore
  tracker = new Tracker(deps)   // constructed first; ProgressPlugin + Projections reference it
  importer = new Importer([new PackPlugin(registry), new ThemePlugin(registry), new ProgressPlugin(tracker)], pluginStore)
  importer.loadStored()         // AFTER built-ins/script tags → built-ins win id collisions
  tracker.init()                // picks active pack/theme; now sees stored plugins too
  projections = new Projections(deps, tracker)
  new DomController(tracker, projections, importer, renderer).start()
```

### Data flow

- **Command:** DOM event → `tracker.intent()` → mutate `Progress` + persist → controller
  re-renders via `Projections`.
- **Query:** controller → `projections.x()` → reads `tracker.view()` + deps → VM → `DomRenderer`.
- **Import:** file → controller reads text → `importer.import(json)` → `ImportOutcome` →
  controller activates by `kind` (`pack`→`selectPack`, `theme`→`selectTheme`+`applyTheme`,
  `progress`→already applied) → `renderAll()` → success `alert`. `ImportError`/`ValidationError`
  → `importFail` `alert`.

## UI

- Reuse the existing 📥 button + hidden `#importFile` input unchanged; `accept="application/json"`.
- **No management UI** (per the lifecycle decision).
- New `DEFAULT_UI` strings, both EN + RU (guarded by `test/domain/builtins.test.ts`):
  - `importedPack` — `Imported pack "{name}" 🎉`
  - `importedTheme` — `Imported theme "{name}" 🎨`
  - Progress success reuses existing `importOk`; all failures reuse existing `importFail` (with
    `{e}` = the `ImportError` message, which stays English like today's messages).
- Unknown file → `Importer` throws `ImportError('Unrecognized file — not a Sunrise pack,
  theme, or progress export')`, surfaced via `importFail`.

## Error handling

- All import failures are `ImportError` or `ValidationError`, caught at the controller's import
  handler (its existing catch boundary) and shown via `alert(importFail)`.
- Duplicate id on a pack/theme import → `ImportError` (rejected, per decision).
- Progress for a not-loaded pack → `ImportError` ("load the pack first").
- A persisted plugin that fails validation at boot → swallowed + logged by `loadStored()`
  (consistent with `WindowPluginRegistry.reject`); it simply never registers.

## Security note (documented, accepted)

Imported theme CSS can reference remote resources (`url(...)`, `@import`), a mild
exfiltration/tracking vector on an otherwise-offline app. Accepted because import is
user-initiated and packs already carry arbitrary text. Not gated; called out in the theme
authoring guide.

## Testing

- `test/domain/plugins/importer.test.ts` — dispatch by `schema`; unknown → throws; persistable
  vs not; `loadStored` replay + swallow; dedup-rejects on duplicate id.
- `test/domain/plugins/*-plugin.test.ts` — each handler's `matches`/`validate`/`install`
  (incl. legacy-progress `matches`, progress routing/reject, theme `css`-or-`cssHref`).
- `test/domain/projections.test.ts` — the VM assertions lifted from `tracker.test.ts`.
- `test/domain/tracker.test.ts` — slimmed to lifecycle/navigation/intents/progress-I/O.
- `test/adapters/local-storage-store.test.ts` — `LocalStoragePluginStore` round-trip.
- `test/adapters/window-registry.test.ts` — throwing `addPack`/`addTheme`, `has*`, inline-`css`
  → blob-URL materialization.

## Deliverables beyond code

- `npm run build` (regenerate `dist/sunrise.js` + `.map`; `sw.js` precache is unaffected — no new
  shipped files), committed in the same change as the `src/` edits.
- Update `docs/plugins/content-pack.md` (offer a JSON output alongside the `.js` IIFE) and
  `docs/plugins/theme.md` (JSON output with **inline `css`**, plus the `css`-or-`cssHref` rule).
- Update `CLAUDE.md`: theme schema (`css`-or-`cssHref`), the new `domain/plugins/` module and
  `Projections`/`Tracker` (CQS) split, the `sunrise.plugins` storage key, and the adapter→domain
  call map (commands→Tracker, queries→Projections, import→Importer).

## Out of scope

- Plugin removal / management UI; overwrite-on-reimport.
- In-app pack/theme export; executing `.js` plugin files.
- Extracting navigation or session state into their own units (kept inside `Tracker`).
- Aggregates/repositories/domain-events ceremony, handler sandboxing, dynamic/remote handler
  discovery, capability negotiation. `persistable: boolean` covers the one real axis today.

## Migration notes

Behavior-preserving refactor + new feature. The existing test suite is the safety net. The
controller's ~25 calls into Tracker split mechanically into 9 commands (stay on `Tracker`) and
~16 queries (move to `Projections`); `tracker.test.ts`'s query assertions move to
`projections.test.ts`. No user-visible behavior changes except the new import capability.
