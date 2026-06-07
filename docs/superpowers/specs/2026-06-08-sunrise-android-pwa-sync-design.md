# Sunrise on Android — Installable PWA + Home-Base LAN Sync

- **Date:** 2026-06-08
- **Status:** Approved design — ready for implementation planning
- **Author:** brainstormed with Claude
- **Effort:** two sequential sub-projects (Phase 1 PWA, Phase 2 sync), each its own plan/build cycle

## 1. Goal

Run Sunrise on Android (and iOS) phones while preserving its character: a simple,
offline, zero-runtime-dependency web app. Three user requirements, in priority order:

1. **Simplicity above all** — prefer the simplest viable mechanism; deleting beats adding.
2. **Keep the existing themes** — all ~15 `themes/*.css` skins must work unchanged.
3. **Local-first storage + optional LAN sync** — keep per-device localStorage as the source
   of truth ("local memo like now"), and additionally sync progress between the user's *own*
   devices when they share a wifi network, with **no cloud and no internet** for the data.

## 2. Decision summary

| Decision | Choice | Why |
|---|---|---|
| Native vs web | **Web app, packaged as a PWA** (not React Native) | RN would force rebuilding the renderer and re-implementing every CSS theme — opposite of "simplicity" and "keep themes". |
| App delivery | **Host static shell on Cloudflare Pages** (free, private-repo OK) | A PWA cannot install or register a service worker from `file://`; it must be served over HTTPS. Only the *shell* is hosted; **progress data never leaves the user's devices.** Desktop/Mac keeps using `file://` as today. |
| Sync transport | **Home-base HTTP over LAN** (a device runs a tiny sync server; phones sync to it by private IP) | As of Chrome 142 (Oct 2025), Local Network Access (LNA) lets an installed HTTPS PWA fetch a plain-HTTP LAN server after a one-time permission. This makes the simplest transport viable from a pure PWA — no native wrapper, no WebRTC needed. |
| Conflict model | **Hand-rolled pure merge function, no CRDT library** | One user, 2–3 devices, coarse boolean+string facts. ~40 lines of commutative+idempotent merge beats a WASM CRDT dependency. |
| Unchecking a task | **Local-only (grow-only set union)** for v1 | Simplest correct rule for a learning tracker ("you don't un-learn a day"). Per-task tombstones (LWW-element-set) can be added later if needed. |
| Sync trigger | **Manual "Sync now" button** for v1 | Predictable; auto-on-focus can come later. |

## 3. Research grounding (load-bearing facts, verified mid-2026)

These came from a research pass with adversarial verification; the recommendation rests on them.

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
  gated later (~Chrome 147) — so use HTTP polling, not raw websockets.
  Sources: developer.chrome.com/blog/local-network-access; developer.chrome.com/release-notes/142;
  WICG/local-network-access explainer.
- **localStorage durability:** best-effort and evictable under storage pressure unless
  `navigator.storage.persist()` is called (silent grant on Chrome, granted readily once installed).
  localStorage's ~5 MiB cap is ample for this app's JSON; the store already swallows quota errors.
  Sources: MDN Storage quotas & eviction; web.dev/articles/persistent-storage.
- **Merge correctness:** "union + LWW" converges, but two spots in the current code are **not
  monotonic** and must be handled: `setTaskDone(...,false)` *deletes* the task key
  (`src/domain/progress.ts:44`) — a naive union re-checks unchecked tasks; and `completedAt`/
  `completedHour` reset to `null` when an item becomes incomplete (`progress.ts:50-53`) — so
  completion is derived, not a fact to merge. Badges are already once-only (`progress.ts:116`).
  Order LWW fields by a **per-device Lamport counter + deviceId**, never wall-clock (phones drift).

## 4. Current architecture (what we build on)

Sunrise is a 3-ring onion compiled to a committed `dist/sunrise.js` IIFE:

- `index.html` — shell: inline app-shell CSS, `<link id="themeCss">`, loads `dist/sunrise.js` +
  `data/packs/dev-roadmap.js`, then an inline script registers ~10 extra themes via
  `window.SUNRISE.registerTheme`. Builtins register 5 more. **~15 theme CSS files total.**
- `src/domain/` — pure logic. `Progress` aggregate (`progress.ts`), `ProgressData` type
  (`types/progress.ts`: `items` map, `reviews[]`, `badges` map, `lastSurprise`).
- `src/ports/index.ts` — interfaces: `Clock`, `Random`, `ProgressStore`, `SessionStore`,
  `PackSource`, `ThemeSource`.
- `src/adapters/` — `LocalStorageProgressStore`/`SessionStore` (keys `sunrise.progress.<packId>`,
  `sunrise.session`), `DomRenderer` (swaps theme via `link#themeCss.href`), `DomController`.
- `src/main.ts` — composition root; `boot()` wires rings and starts `DomController`.
- Build/test: esbuild → `dist/sunrise.js`; `node --test` runs `.ts` natively (Node ≥ 23.6),
  so domain code can be imported by Node tooling with **no build step**.

Progress is already clean, per-pack-namespaced JSON — so sync is purely additive.

## 5. Phase 1 — Installable, offline PWA

**Outcome:** Sunrise installs to the home screen, runs fully offline, all themes work, localStorage durable.

### Changes
1. **`manifest.webmanifest`** + `<link rel="manifest">` in `index.html`: `name`, `short_name`,
   `display:standalone`, `theme_color`, `background_color`, `start_url`, and **icons**
   (192px, 512px, plus a `purpose:"maskable"` icon).
2. **Icons** — produce PNGs from a sunrise / 日の出 mark (new asset task; an SVG source + a small
   export is fine).
3. **`sw.js`** — hand-written cache-first service worker (~35 lines, no Workbox). On install,
   precache: `index.html`, `dist/sunrise.js`, `data/packs/*.js`, **every** `themes/*.css`, icons,
   and the manifest. Serve cache-first; fall back to network. (Missing any theme → it 404s while
   offline and theme-switching breaks — so the precache list must be complete and auto-generated.)
4. **`scripts/gen-sw.js`** — zero-dep Node script wired into `npm run build`: globs the asset dirs,
   writes the SW precache array, and stamps a **content-hash cache version** so (a) new themes are
   never forgotten and (b) editing any asset auto-busts the stale cache.
5. **Register SW + persist** in `boot()` (`main.ts`): register `sw.js`; call
   `navigator.storage.persist()` once.
6. **Hosting** — deploy static files to Cloudflare Pages (HTTPS). App runs 100% offline after
   install/update. `file://` desktop use is unaffected.

### Explicitly NOT in Phase 1
- No data-model changes. `ProgressData` is already sync-ready (clean, namespaced JSON).
- "Sync" remains the existing export/import JSON.

## 6. Phase 2 — Home-base LAN sync

**Topology:** one device (typically the Mac) runs a tiny sync server; phones sync to it over wifi
by its LAN IP, behind the one-time LNA permission.

### Components (fit the onion)
- **`src/domain/merge.ts`** — pure `mergeProgress(local: ProgressData, remote: ProgressData): ProgressData`.
  Commutative + idempotent. No I/O. The only place merge logic lives.
- **Port `SyncTransport`** (`src/ports/index.ts`) — e.g. `push(packId, data): Promise<ProgressData>`
  (sends local, receives merged).
- **Adapter `LanHttpSync`** (`src/adapters/`) — `fetch('http://<ip>:<port>/progress/<packId>')`,
  addressed by **private-IP literal** so the LNA mixed-content exemption applies. Handles a denied
  LNA prompt gracefully ("enable local network access").
- **`server/sync.mjs`** — ~60-line `node:http` server, **zero deps**. Imports `src/domain/merge.ts`
  **directly** (Node ≥ 23.6 strips types) → no build step, no duplicated merge logic. Endpoint
  `POST /progress/:packId`: parse incoming `ProgressData`, `mergeProgress` with on-disk JSON,
  persist, return merged. Prints the host's LAN IP on startup. Optional shared-secret token in the
  URL to keep other LAN devices out (deferred; note it).
- **Client UI:** a "Sync now" toolbar button. First use triggers the LNA prompt. Home-base address
  saved once in Session.

### Merge rules
| Field | Rule |
|---|---|
| `items[i].tasks` | **union** (grow-only set). Unchecking is local-only in v1. |
| `items[i].completedAt` / `completedHour` | **recompute** from merged tasks + item def; keep earliest non-null. Never merge directly. |
| streak | never stored; recomputed by existing `completedDates()` after merge. |
| `badges` | **union**; keep earliest `at`. Never LWW (must not drop an earned badge). |
| `reviews` | per `itemId`, keep higher `stage` (and later `lastDate`). |
| `items[i].reflection` | **non-empty beats empty**; if both non-empty and differ, LWW by Lamport+deviceId. |
| `lastSurprise`, session settings (`themeId`, `activePackId`) | **LWW** by Lamport+deviceId. |

### Data-model additions (backward-compatible)
- `deviceId` — random UUID, generated once per install, stored in Session.
- Per-device **Lamport counter** (in Session), bumped on each LWW-field write; used to order LWW
  fields (with `deviceId` as deterministic tie-break). **Never order by wall-clock.**
- Optional per-field stamp `{c: lamport, d: deviceId}` on the LWW fields (reflection, lastSurprise,
  settings). The `ProgressValidator` gains these as **optional** fields so existing
  `sunrise.progress/v1` data still loads (no migration).

### Merge invariants to enforce
- `mergeProgress` must assert both sides share `schema: 'sunrise.progress/v1'`; mismatch → keep
  local + flag (don't blind-merge).
- Re-merging the same remote twice is a no-op (idempotent). Unit-test
  `merge(a,b) == merge(b,a)` (up to order) and `merge(a, merge(a,b)) == merge(a,b)`.

## 7. Testing

- **`merge.ts`** — `node:test` unit tests for: commutativity, idempotency, task-union,
  unchecking-doesn't-resurrect (documented behavior), completedAt recompute (earliest), streak
  recompute, badge survival + earliest-`at`, reflection non-empty-bias, LWW ordering by
  Lamport+deviceId, schema-mismatch guard.
- **`server/sync.mjs`** — a couple of endpoint tests posting two device states and asserting the
  merged result.
- **PWA** — verified manually: Lighthouse PWA audit; install on a real Android phone; airplane-mode
  cold start; switch every theme while offline; confirm `persist()` granted.

## 8. Limitations (accepted, honest)

- Requires **Chrome 142+** on the phone. Older Android Chrome cannot reach a plain-HTTP LAN server
  at all → graceful fallback is export/import JSON.
- The **home-base must be on the wifi** to sync (typically the Mac). No host present → export/import.
- **Guest-wifi / AP client-isolation** can block LAN traffic; pair on the main SSID.
- **Chromium-only:** Firefox/Safari on Android are not the target (different/absent LNA behavior).
- **Unchecking a task does not propagate** between devices in v1 (grow-only set).
- Chrome has signaled it *may* eventually gate WebRTC/more behind LNA — irrelevant to the HTTP
  home-base path chosen here, but a reason we did **not** build on WebRTC.

## 9. Out of scope (and why)

- **React Native / rewrite** — would discard the theme system; violates requirements 1 & 2.
- **WebRTC P2P (QR pairing)** — clunkier ("QR tango"), Chrome↔Chrome only in practice, breaks on
  guest wifi, iOS-PWA support shaky, eroding platform permissions. Kept as a documented fallback
  *only* if a no-computer-present scenario becomes real.
- **Capacitor / Tauri native wrapper** — would give silent LAN HTTP + Play-Store presence, but
  costs a full native toolchain and breaks the zero-dependency/`file://` ethos. LNA already gives
  the PWA what the native HTTP layer was for, so the wrapper buys nothing we need.
- **Multi-user / shared leaderboard, cloud sync, auto-discovery (mDNS)** — not requested; mDNS
  isn't reachable from a browser anyway.

## 10. Open items to resolve in planning

- Icon asset source (SVG → 192/512/maskable PNGs).
- Cloudflare Pages project setup + deploy step (manual `wrangler` vs git integration).
- Whether to ship the optional sync shared-secret token in v1 or defer.
