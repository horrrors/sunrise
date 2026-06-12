# Sunrise on Android — Installable PWA + Home-Base LAN Sync (v2)

- **Date:** 2026-06-12
- **Status:** Approved design — ready for implementation planning
- **Supersedes:** `2026-06-08-sunrise-android-pwa-sync-design.md` (schema drifted on 06-09; merge model simplified)
- **Effort:** two sequential sub-projects (Phase 1 PWA, Phase 2 sync), each its own plan/build cycle

## 1. Goal

Run Sunrise on Android (and iOS, Phase 1 only) phones while preserving its character: a simple,
offline, zero-runtime-dependency web app. Three user requirements, in priority order:

1. **Simplicity above all** — prefer the simplest viable mechanism; deleting beats adding.
2. **Keep the existing themes** — all theme CSS skins (17 registered and growing) must work unchanged.
3. **Local-first storage + optional LAN sync** — keep per-device localStorage as the source
   of truth ("local memo like now"), and additionally sync *progress* between the user's *own*
   devices when they share a wifi network, with **no cloud and no internet** for the data.

## 2. What changed vs the 2026-06-08 design

| Change | Why |
|---|---|
| Review merge rule is now `max(lastDate)` | The spaced-repetition `stage` ladder was deleted on 06-09; `Review` is just `{itemId, lastDate}`. |
| `lastSurprise` removed from the design | The field no longer exists in `ProgressData`. |
| **Session is not synced at all** | Per-device theme/pack/cursor is a feature (different skin per device); the requirement was always to sync *progress*. |
| **Lamport counter, deviceId, per-field stamps: deleted** | Their only remaining customer was reflection conflicts; replaced by a stamp-free rule (below). No `ProgressValidator` changes needed. |
| Merge is **def-free**; the one def-needing step moves to a client-side post-merge sweep | The 06-08 doc asked the server to "recompute completedAt from item defs" — but the server has no Pack (packs are browser IIFEs). Internal inconsistency, now fixed. |
| Test list fixed: unchecking **is reverted** by sync | The old doc listed a test for the opposite of the chosen grow-only behavior. |

**v1 mental model: "nothing ever shrinks."** Tasks grow, badges grow, reviews advance,
reflections grow. Every merge rule below is a max/union on a total order — commutative,
idempotent, associative by construction.

## 3. Decision summary

| Decision | Choice | Why |
|---|---|---|
| Native vs web | **Web app, packaged as a PWA** (not React Native) | RN would force rebuilding the renderer and re-implementing every CSS theme — opposite of "simplicity" and "keep themes". |
| App delivery | **Host static shell on Cloudflare Pages** (free, private-repo OK) | A PWA cannot install or register a service worker from `file://`; it must be served over HTTPS. Only the *shell* is hosted; **progress data never leaves the user's devices.** Desktop/Mac keeps using `file://` as today. |
| Sync transport | **Home-base HTTP over LAN** (a device runs a tiny sync server; phones sync to it by private IP) | As of Chrome 142 (Oct 2025), Local Network Access (LNA) lets an installed HTTPS PWA fetch a plain-HTTP LAN server after a one-time permission. Simplest viable transport from a pure PWA — no native wrapper, no WebRTC. |
| Conflict model | **Hand-rolled pure merge, no CRDT library, no clocks of any kind** | One user, 2–3 devices, coarse boolean+string facts. Every field merges by union/max on a total order; no Lamport, no deviceId, no wall-clock. |
| Merge location | **Server merges** (client also re-merges the response) | With a def-free merge the server can read-merge-write synchronously per request → concurrent syncs are race-free for free. A dumb GET/PUT store would push a read-modify-write race to the client. |
| Unchecking a task | **Reverted by next sync** (grow-only set union) for v1 | Simplest correct rule for a learning tracker ("you don't un-learn a day"). Stated brutally: the uncheck doesn't merely fail to propagate — the next sync puts the check *back* on the device that removed it. Per-task tombstones can be added in v2 if this ever hurts. |
| Sync trigger | **Manual "Sync now" button**; syncs **all registered packs** | Predictable; auto-on-focus can come later. Syncing only the active pack would silently leave other packs stale. |

## 4. Research grounding (load-bearing facts, verified 2026-06-08)

- **PWA install requires HTTPS, not `file://`.** A service worker cannot register over `file://`.
  Installability needs a manifest (name, 192+512 icons, `display:standalone`) + HTTPS. A service
  worker is no longer required *for installability* (Chrome 108+) but **is** required to actually
  run offline — install alone does not give offline.
  Sources: web.dev/articles/install-criteria; MDN Making-PWAs-installable; developer.chrome.com/blog/update-install-criteria.
- **The mixed-content wall fell.** Chrome 142 (shipped ~Oct 28 2025, default-on incl. Android)
  introduced **Local Network Access**: after a one-time permission, an HTTPS page is **exempted
  from mixed-content blocking** for requests it knows are local *before DNS* — i.e. private-IP
  literals (`http://192.168.x.x`), `*.local` hosts, or `fetch(url,{targetAddressSpace:'local'})`.
  A public hostname that merely resolves to a LAN IP is **not** exempt. `ws://` WebSockets are
  gated later (~Chrome 147) — so use HTTP, not raw websockets.
  Sources: developer.chrome.com/blog/local-network-access; developer.chrome.com/release-notes/142;
  WICG/local-network-access explainer.
  **Re-verify current LNA status when Phase 2 planning starts** (Phase 1 does not depend on it).
- **localStorage durability:** best-effort and evictable under storage pressure unless
  `navigator.storage.persist()` is called (silent grant on Chrome, granted readily once installed).
  localStorage's ~5 MiB cap is ample for this app's JSON; the store already swallows quota errors.
  Sources: MDN Storage quotas & eviction; web.dev/articles/persistent-storage.
- **Non-monotonic spots in current code** (why merge must not naively trust stored fields):
  `setTaskDone(..., false)` *deletes* the task key, and an incomplete item *resets*
  `completedAt`/`completedHour` to `null` (`src/domain/progress.ts:44-58`) — so completion is a
  derived/cached fact, not a mergeable one. Badges are already once-only (`progress.ts:125`).

## 5. Current architecture (what we build on)

- `index.html` — shell: inline app-shell CSS, `<link id="themeCss">`, loads `dist/sunrise.js` +
  `data/packs/dev-roadmap.js`; an inline script registers extra themes via
  `window.SUNRISE.registerTheme` (builtins add 5 more — **17 themes total today, growing**).
- `src/domain/` — pure logic. `ProgressData` (`types/progress.ts`): `items` map
  (`tasks`, `reflection`, `completedAt`, `completedHour`), `reviews: {itemId, lastDate}[]`,
  `badges` map. `Progress.reconcile(items)` already clears a stale `completedAt` when a pack
  update adds tasks (`progress.ts:101`) — the sync sweep (below) is its exact inverse.
- `src/ports/index.ts` — `Clock`, `Random`, `ProgressStore`, `SessionStore`, `PackSource`, `ThemeSource`.
- `src/adapters/` — localStorage stores (keys `sunrise.progress.<packId>`, `sunrise.session`),
  `DomRenderer`, `DomController`. `Session = {activePackId?, themeId?, cursors?}` — all
  per-device working state, **none of it synced**.
- `src/main.ts` — composition root; `boot()` wires rings.
- Build/test: esbuild → committed `dist/sunrise.js`; `node --test` runs `.ts` natively
  (Node ≥ 23.6 type-stripping), so domain code imports into Node tooling with **no build step**.
  `test/build/dist-sync.test.ts` guards against a stale committed bundle.

Progress is already clean, per-pack-namespaced JSON — sync is purely additive.

## 6. Phase 1 — Installable, offline PWA

**Outcome:** Sunrise installs to the home screen, runs fully offline, all themes work, localStorage durable.

### Changes
1. **`manifest.webmanifest`** + `<link rel="manifest">` in `index.html`: `name`, `short_name`,
   `display:standalone`, `theme_color`, `background_color`, `start_url`, and **icons**
   (192px, 512px, plus a `purpose:"maskable"` icon).
2. **Icons** — produce PNGs from a sunrise / 日の出 mark (new asset task; an SVG source + a small
   export script is fine).
3. **`sw.js`** — hand-written cache-first service worker (~35 lines, no Workbox). On install,
   precache: `index.html`, `dist/sunrise.js`, `data/packs/*.js`, **every** `themes/*.css`, icons,
   and the manifest. Serve cache-first; fall back to network. (Missing any theme → it 404s while
   offline and theme-switching breaks — so the precache list must be complete and auto-generated.)
4. **`scripts/gen-sw.js`** — zero-dep Node script wired into `npm run build`: globs the asset dirs,
   writes the SW precache array, and stamps a **content-hash cache version** so (a) new themes are
   never forgotten and (b) editing any asset auto-busts the stale cache. `sw.js` is a committed
   build artifact like `dist/sunrise.js` — extend the `dist-sync` staleness test to cover it.
5. **Register SW + persist** in `boot()` (`main.ts`): register `sw.js` **guarded so the `file://`
   desktop flow skips registration silently** (no console error); call
   `navigator.storage.persist()` once.
6. **Hosting** — deploy static files to Cloudflare Pages (HTTPS), **no CF build step** (the repo
   is already pre-built; dist is committed). App runs 100% offline after install/update.
   `file://` desktop use is unaffected.

### Explicitly NOT in Phase 1
- No data-model changes. `ProgressData` is already sync-ready.
- "Sync" remains the existing export/import JSON.

## 7. Phase 2 — Home-base LAN sync

**Topology:** one device (typically the Mac) runs a tiny sync server; phones sync to it over wifi
by its LAN IP, behind the one-time LNA permission.

### Components (fit the onion)
- **`src/domain/merge.ts`** — pure, **def-free** `mergeProgress(local: ProgressData, remote: ProgressData): ProgressData`.
  Needs no Pack, no Clock, no I/O. Output is deterministic (reviews sorted by `itemId`) so
  `merge(a,b)` deep-equals `merge(b,a)`. The only place merge logic lives; runs on both server
  and client.
- **Port `SyncTransport`** (`src/ports/index.ts`) — `push(packId, data): Promise<ProgressData>`
  (sends local state, receives the server-merged result).
- **Adapter `LanHttpSync`** (`src/adapters/`) — `fetch('http://<ip>:<port>/progress/<packId>')`,
  addressed by **private-IP literal** so the LNA mixed-content exemption applies. Handles a denied
  LNA prompt gracefully ("enable local network access").
- **`server/sync.mjs`** — ~60-line `node:http` server, **zero deps**. Imports
  `src/domain/merge.ts` **directly** (Node type-stripping) → no build step, no duplicated logic.
  `POST /progress/:packId`: parse body, `mergeProgress` with the on-disk JSON for that pack,
  persist, return merged. Read-merge-write is synchronous per request → concurrent posts cannot
  interleave. Prints the host's LAN IP on startup. Optional shared-secret token in the URL
  (deferred to an open item).
- **`Tracker.syncNow()`** (domain) — for each registered pack: load local progress, `push` via the
  port, **re-merge the response with current local** (covers ticks made during the round-trip),
  run the **completion sweep** (below), save, re-run badge sync (merged data may legitimately earn
  new badges), then the controller re-renders.
- **Client UI:** a "Sync now" toolbar button. First use triggers the LNA prompt. Home-base address
  saved once in Session (per-device, like the rest of Session).

### Merge rules (all def-free; every rule is union/max on a total order)
| Field | Rule |
|---|---|
| `items` map | union of item ids; per-item fields merge below. |
| `items[i].tasks` | **union** of checked keys (grow-only set). An uncheck is reverted at next sync — accepted v1 semantics. |
| `items[i].completedAt` + `completedHour` | merged **as a pair**: earliest non-null `(date, hour)` (lexicographic on date, then hour); both null → null. Sound without defs because union only adds checks, so a side that was complete stays complete. |
| streak | never stored; recomputed by existing `completedDates()` after merge. |
| `badges` | **union**; keep earliest `at`. Never drop an earned badge. |
| `reviews` | union by `itemId`; keep **max(`lastDate`)** (most recent re-schedule wins; `YYYY-MM-DD` compares lexicographically = chronologically). Reviews are never deleted in current code, so this is grow-only too. |
| `items[i].reflection` | **max by (length, then lexicographic)**. "Non-empty beats empty" falls out (empty has length 0). Shortening a reflection on one device is reverted by sync — accepted v1 semantics, same class as uncheck. |
| Session (`themeId`, `activePackId`, `cursors`), sync address | **not synced** — per-device by design. |

### Completion sweep (client-side, def-aware)
Def-free merge can't see one case: device A checks half an item's tasks, device B the other half;
the union completes the item but neither side has a `completedAt`. After applying merged data, the
client runs the inverse of the existing `reconcile()`: **if an item is complete and `completedAt`
is null → stamp `clock.today()`/`hour()`**. The stamp then propagates on the next sync like any
local change. (The existing `reconcile()` keeps handling the opposite disagreement.)

### Merge invariants to enforce
- `mergeProgress` asserts both sides have `schema: 'sunrise.progress/v1'`; mismatch → server
  responds 4xx, client keeps local and shows a message (never blind-merge).
- `merge(a,b) deep-equals merge(b,a)`; `merge(a, merge(a,b)) deep-equals merge(a,b)`.
- **No data-model or validator changes.** Existing `sunrise.progress/v1` data syncs as-is; no migration.

## 8. Testing

- **`merge.ts`** (`node:test`, pure): commutativity + idempotency (deep-equal, enabled by sorted
  output); task union; **uncheck-is-reverted-by-merge** (assert the chosen behavior, documented);
  completedAt earliest-pair incl. one-side-null and both-null; badge union + earliest `at`;
  review union + max `lastDate`; reflection longest-wins, tie→lexicographic, empty-loses;
  schema-mismatch guard.
- **Completion sweep**: complete-but-null gets stamped with today; incomplete items untouched;
  interplay with `reconcile()`.
- **`server/sync.mjs`**: endpoint test posting two device states, asserting convergence; bad-schema
  body → 4xx.
- **PWA (manual)**: Lighthouse PWA audit; install on a real Android phone; airplane-mode cold
  start; switch **every** theme while offline; confirm `persist()` granted; `file://` desktop
  still boots with no console errors.

## 9. Limitations (accepted, honest)

- Requires **Chrome 142+** on the phone for sync. Older Android Chrome cannot reach a plain-HTTP
  LAN server at all → fallback is export/import JSON.
- The **home-base must be on the wifi** to sync. No host present → export/import.
- **Guest-wifi / AP client-isolation** can block LAN traffic; pair on the main SSID.
- **Chromium-only sync:** Firefox/Safari (incl. iOS) get Phase 1 (installable offline PWA) but not
  LAN sync — different/absent LNA behavior.
- **Unchecking a task is reverted by the next sync** (grow-only union) — on every device,
  including the one that unchecked.
- **Shortening a reflection is reverted by the next sync** (longest-wins). Both are the v2
  trigger: if either ever hurts in practice, add per-field stamps/tombstones then — not before.

## 10. Out of scope (and why)

- **React Native / rewrite** — discards the theme system; violates requirements 1 & 2.
- **WebRTC P2P (QR pairing)** — clunkier, Chrome↔Chrome only in practice, breaks on guest wifi,
  eroding platform permissions. Documented fallback only if a no-computer-present scenario becomes real.
- **Capacitor / Tauri wrapper** — full native toolchain for what LNA already gives the PWA.
- **Session/theme sync** — per-device session state is a feature, not a gap.
- **Lamport stamps / deviceId / tombstones** — v2 machinery with no v1 customer; add only when a
  Limitation above actually hurts.
- **Multi-user, cloud sync, auto-discovery (mDNS)** — not requested; mDNS unreachable from a browser anyway.

## 11. Open items to resolve in planning

- Icon asset source (SVG → 192/512/maskable PNGs).
- Cloudflare Pages project setup + deploy step (manual `wrangler` vs git integration).
- Whether to ship the optional sync shared-secret token in v1 or defer.
- Server persistence location (per-pack JSON files next to the script vs a dot-dir).
