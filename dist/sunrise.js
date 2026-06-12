"use strict";
(() => {
  // src/domain/progress.ts
  var Progress = class _Progress {
    items;
    badges;
    constructor(data) {
      this.items = data.items;
      this.badges = data.badges;
    }
    static empty() {
      return new _Progress({ schema: "sunrise.progress/v1", items: {}, badges: {} });
    }
    toJSON() {
      return structuredClone({
        schema: "sunrise.progress/v1",
        items: this.items,
        badges: this.badges
      });
    }
    ensure(itemId) {
      let it = this.items[itemId];
      if (!it) {
        it = { tasks: {}, reflection: "", completedAt: null, completedHour: null };
        this.items[itemId] = it;
      }
      return it;
    }
    isItemComplete(item) {
      if (item.rest || !item.tasks || item.tasks.length === 0) return false;
      const st = this.items[item.id];
      if (!st) return false;
      return item.tasks.every((t) => st.tasks?.[t.id] === true);
    }
    setTaskDone(item, taskId, done, today, hour) {
      const st = this.ensure(item.id);
      st.tasks ??= {};
      if (done) st.tasks[taskId] = true;
      else delete st.tasks[taskId];
      if (this.isItemComplete(item)) {
        if (!st.completedAt) {
          st.completedAt = today;
          st.completedHour = hour;
        }
      } else {
        st.completedAt = null;
        st.completedHour = null;
      }
    }
    setReflection(itemId, text) {
      this.ensure(itemId).reflection = text;
    }
    reflection(itemId) {
      return this.items[itemId]?.reflection ?? "";
    }
    taskChecked(itemId, taskId) {
      return this.items[itemId]?.tasks?.[taskId] === true;
    }
    completedDates() {
      const set = /* @__PURE__ */ new Set();
      for (const id of Object.keys(this.items)) {
        const c = this.items[id]?.completedAt;
        if (c) set.add(c);
      }
      return [...set].sort();
    }
    completedHours() {
      const out = [];
      for (const id of Object.keys(this.items)) {
        const it = this.items[id];
        if (it && it.completedAt != null && it.completedHour != null) out.push(it.completedHour);
      }
      return out;
    }
    completedCount() {
      return Object.keys(this.items).filter((id) => this.items[id]?.completedAt).length;
    }
    reflectionCount() {
      let n = 0;
      for (const id of Object.keys(this.items)) {
        const r = this.items[id]?.reflection;
        if (r && r.trim()) n++;
      }
      return n;
    }
    // A new pack version can add tasks to an already-completed item; the stale
    // completedAt would then disagree with isItemComplete (streaks vs dashboard).
    // Returns true when anything was cleared so the caller can persist.
    reconcile(items) {
      let changed = false;
      for (const it of items) {
        const st = this.items[it.id];
        if (st?.completedAt && !this.isItemComplete(it)) {
          st.completedAt = null;
          st.completedHour = null;
          changed = true;
        }
      }
      return changed;
    }
    isBadgeOwned(id) {
      return this.badges[id] !== void 0;
    }
    awardBadge(id, at) {
      if (!this.badges[id]) this.badges[id] = { at };
    }
  };

  // src/domain/errors.ts
  var ValidationError = class extends Error {
    issues;
    constructor(issues) {
      super(issues.map((i) => `${i.path}: ${i.msg}`).join("; ") || "validation failed");
      this.name = "ValidationError";
      this.issues = issues;
    }
  };
  var ImportError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "ImportError";
    }
  };

  // src/domain/validators.ts
  function typeOf(v) {
    return Array.isArray(v) ? "array" : v === null ? "null" : typeof v;
  }
  function check(value, schema, path, errors) {
    if (value === void 0 || value === null) {
      if (schema.required) errors.push({ path, msg: "required" });
      return;
    }
    const t = typeOf(value);
    if (schema.type && t !== schema.type) {
      errors.push({ path, msg: `expected ${schema.type}, got ${t}` });
      return;
    }
    if (schema.type === "string" && schema.pattern && !schema.pattern.test(value)) {
      errors.push({ path, msg: "invalid format" });
    }
    if (schema.type === "array") {
      const arr = value;
      if (schema.min != null && arr.length < schema.min) {
        errors.push({ path, msg: `expected >= ${schema.min} items` });
      }
      if (schema.of) arr.forEach((v, i) => check(v, schema.of, `${path}[${i}]`, errors));
    }
    if (schema.type === "object" && schema.props) {
      const obj = value;
      for (const k in schema.props) {
        check(obj[k], schema.props[k], path ? `${path}.${k}` : k, errors);
      }
    }
  }
  var ID = { type: "string", required: true, pattern: /^[a-z0-9][a-z0-9-]*$/ };
  var THEME_SCHEMA = {
    type: "object",
    required: true,
    props: {
      schema: { type: "string", required: true },
      id: ID,
      name: { type: "string", required: true },
      version: { type: "string", required: true },
      cssHref: { type: "string", required: true }
    }
  };
  var TASK = {
    type: "object",
    required: true,
    props: { id: ID, text: { type: "string", required: true }, guidance: { type: "string" } }
  };
  var RES = {
    type: "object",
    required: true,
    props: { label: { type: "string", required: true }, note: { type: "string", required: true } }
  };
  var ITEM = {
    type: "object",
    required: true,
    props: {
      id: ID,
      track: { type: "string", required: true },
      title: { type: "string" },
      warmup: { type: "string" },
      reflectPrompt: { type: "string" },
      tasks: { type: "array", of: TASK },
      resources: { type: "array", of: RES },
      rest: { type: "boolean" }
    }
  };
  var GROUP = {
    type: "object",
    required: true,
    props: {
      id: ID,
      title: { type: "string", required: true },
      phase: { type: "string" },
      items: { type: "array", required: true, min: 1, of: ITEM }
    }
  };
  var TRACK = {
    type: "object",
    required: true,
    props: {
      id: ID,
      label: { type: "string", required: true },
      icon: { type: "string" },
      color: { type: "string" }
    }
  };
  var PHASE = {
    type: "object",
    required: true,
    props: { id: ID, title: { type: "string", required: true } }
  };
  var BADGE = {
    type: "object",
    required: true,
    props: {
      id: ID,
      title: { type: "string", required: true },
      desc: { type: "string" },
      icon: { type: "string" },
      type: { type: "string", required: true }
    }
  };
  var PACK_SCHEMA = {
    type: "object",
    required: true,
    props: {
      schema: { type: "string", required: true },
      id: ID,
      name: { type: "string", required: true },
      version: { type: "string", required: true },
      locale: { type: "string" },
      settings: { type: "object" },
      tracks: { type: "array", required: true, min: 1, of: TRACK },
      phases: { type: "array", of: PHASE },
      groups: { type: "array", required: true, min: 1, of: GROUP },
      badges: { type: "array", of: BADGE },
      ui: { type: "object" },
      mottos: { type: "array", of: { type: "string", required: true } },
      surprises: { type: "array", of: { type: "string", required: true } }
    }
  };
  var BADGE_PARAMS = {
    streak: { gte: "number" },
    "days-done": { gte: "number" },
    percent: { gte: "number" },
    "all-done": {},
    "tasks-done": { gte: "number", track: "string?" },
    reflections: { gte: "number" },
    "groups-complete": { gte: "number" },
    "track-complete": { track: "string" },
    "phase-complete": { phase: "string" },
    "item-complete": { item: "string" },
    "all-tracks": { eachGte: "number" },
    weekday: { days: "number[]" },
    "hour-range": { from: "number", to: "number" },
    comeback: {}
  };
  function uniq(list, keyFn, label, errors) {
    const seen = /* @__PURE__ */ new Set();
    list.forEach((x, i) => {
      const k = keyFn(x);
      if (k == null) return;
      if (seen.has(k)) errors.push({ path: `${label}[${i}]`, msg: `duplicate id "${k}"` });
      seen.add(k);
    });
  }
  function checkBadgeRule(b, path, refs, errors) {
    const params = BADGE_PARAMS[b["type"]];
    if (!params) {
      errors.push({ path: `${path}.type`, msg: `unknown rule type "${String(b["type"])}"` });
      return;
    }
    for (const k in params) {
      const spec = params[k];
      const optional = spec.endsWith("?");
      const base = optional ? spec.slice(0, -1) : spec;
      const v = b[k];
      if (v === void 0) {
        if (!optional) errors.push({ path: `${path}.${k}`, msg: "required" });
        continue;
      }
      const ok = base === "number[]" ? Array.isArray(v) && v.every((n) => typeof n === "number") : typeof v === base;
      if (!ok) errors.push({ path: `${path}.${k}`, msg: `expected ${base}` });
    }
    const type = b["type"];
    if (type === "weekday") {
      const days = b["days"];
      if (Array.isArray(days) && !days.every((n) => Number.isInteger(n) && n >= 1 && n <= 7)) {
        errors.push({ path: `${path}.days`, msg: "days are 1=Mon..7=Sun" });
      }
    }
    if (type === "hour-range") {
      for (const k of ["from", "to"]) {
        const v = b[k];
        if (typeof v === "number" && !(Number.isInteger(v) && v >= 0 && v <= 23)) {
          errors.push({ path: `${path}.${k}`, msg: "expected an hour 0..23" });
        }
      }
    }
    const track = b["track"];
    if ((type === "track-complete" || type === "tasks-done") && track != null && !refs.trackIds.has(track)) {
      errors.push({ path: `${path}.track`, msg: `track "${String(track)}" not declared` });
    }
    const phase = b["phase"];
    if (type === "phase-complete" && phase != null && !refs.phaseIds.has(phase)) {
      errors.push({ path: `${path}.phase`, msg: `phase "${String(phase)}" not declared` });
    }
    const item = b["item"];
    if (type === "item-complete" && item != null && !refs.itemIds.has(item)) {
      errors.push({ path: `${path}.item`, msg: `item "${String(item)}" not declared` });
    }
  }
  var PackValidator = class {
    parse(raw) {
      const errors = [];
      check(raw, PACK_SCHEMA, "", errors);
      if (errors.length) throw new ValidationError(errors);
      const pack = raw;
      if (pack["schema"] !== "sunrise.pack/v1") {
        throw new ValidationError([
          { path: "schema", msg: `unsupported contract version "${String(pack["schema"])}"` }
        ]);
      }
      const tracks = pack["tracks"];
      const phases = pack["phases"] || [];
      const groups = pack["groups"];
      const badges = pack["badges"] || [];
      uniq(tracks, (t) => t["id"], "tracks", errors);
      if (pack["phases"]) uniq(phases, (p) => p["id"], "phases", errors);
      uniq(groups, (g) => g["id"], "groups", errors);
      if (pack["badges"]) uniq(badges, (b) => b["id"], "badges", errors);
      const trackIds = new Set(tracks.map((t) => t["id"]));
      trackIds.add("rest");
      const phaseIds = new Set(phases.map((p) => p["id"]));
      const itemIds = /* @__PURE__ */ new Set();
      groups.forEach((g, gi) => {
        const gphase = g["phase"];
        if (gphase != null && !phaseIds.has(gphase)) {
          errors.push({ path: `groups[${gi}].phase`, msg: `phase "${String(gphase)}" not declared` });
        }
        const items = g["items"];
        items.forEach((it, ii) => {
          const p = `groups[${gi}].items[${ii}]`;
          const itId = it["id"];
          if (itemIds.has(itId)) errors.push({ path: `${p}.id`, msg: `duplicate item id "${itId}"` });
          itemIds.add(itId);
          if (!trackIds.has(it["track"])) {
            errors.push({ path: `${p}.track`, msg: `track "${String(it["track"])}" not declared` });
          }
          if (!it["rest"] && !(Array.isArray(it["tasks"]) && it["tasks"].length > 0)) {
            errors.push({ path: `${p}.tasks`, msg: "non-rest item needs at least one task" });
          }
          const tids = /* @__PURE__ */ new Set();
          const tasks = it["tasks"] || [];
          tasks.forEach((t, ti) => {
            const tid = t["id"];
            if (tids.has(tid))
              errors.push({ path: `${p}.tasks[${ti}].id`, msg: `duplicate task id "${tid}"` });
            tids.add(tid);
          });
        });
      });
      badges.forEach(
        (b, bi) => checkBadgeRule(b, `badges[${bi}]`, { trackIds, phaseIds, itemIds }, errors)
      );
      const ui = pack["ui"];
      if (isObj(ui)) {
        for (const k in ui) {
          if (typeof ui[k] !== "string") errors.push({ path: `ui.${k}`, msg: "expected string" });
        }
      }
      const settings = pack["settings"];
      const labels = isObj(settings) ? settings["labels"] : void 0;
      if (labels !== void 0 && !isObj(labels)) {
        errors.push({ path: "settings.labels", msg: "expected object" });
      } else if (isObj(labels)) {
        for (const k in labels) {
          if (typeof labels[k] !== "string")
            errors.push({ path: `settings.labels.${k}`, msg: "expected string" });
        }
      }
      if (errors.length) throw new ValidationError(errors);
      return raw;
    }
  };
  var ThemeValidator = class {
    parse(raw) {
      const errors = [];
      check(raw, THEME_SCHEMA, "", errors);
      if (errors.length) throw new ValidationError(errors);
      const theme = raw;
      if (theme["schema"] !== "sunrise.theme/v1") {
        throw new ValidationError([
          { path: "schema", msg: `unsupported contract version "${String(theme["schema"])}"` }
        ]);
      }
      return raw;
    }
  };
  var PROGRESS_SCHEMA = {
    type: "object",
    required: true,
    props: {
      schema: { type: "string" },
      items: { type: "object", required: true },
      badges: { type: "object" }
    }
  };
  var isObj = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  var ProgressValidator = class {
    parse(raw) {
      let data;
      if (isObj(raw)) data = raw;
      else throw new ValidationError([{ path: "", msg: `expected object, got ${typeOf(raw)}` }]);
      if (data["days"] && !data["items"]) {
        data = {
          schema: "sunrise.progress/v1",
          items: data["days"],
          badges: data["badges"] || {}
        };
      }
      if (data["schema"] !== void 0 && data["schema"] !== "sunrise.progress/v1") {
        throw new ValidationError([
          { path: "schema", msg: `unsupported progress version "${String(data["schema"])}"` }
        ]);
      }
      const errors = [];
      check(data, PROGRESS_SCHEMA, "", errors);
      if (errors.length) throw new ValidationError(errors);
      const rawItems = data["items"];
      const items = {};
      for (const id in rawItems) {
        const it = rawItems[id];
        if (!isObj(it)) {
          errors.push({ path: `items.${id}`, msg: "must be an object" });
          continue;
        }
        const rawTasks = it["tasks"];
        if (rawTasks !== void 0 && !isObj(rawTasks)) {
          errors.push({ path: `items.${id}.tasks`, msg: "must be an object" });
        }
        const tasks = {};
        if (isObj(rawTasks)) {
          for (const t in rawTasks) if (rawTasks[t] === true) tasks[t] = true;
        }
        const completedAt = it["completedAt"];
        if (completedAt != null && !(typeof completedAt === "string" && DATE_RE.test(completedAt))) {
          errors.push({ path: `items.${id}.completedAt`, msg: 'expected "YYYY-MM-DD" or null' });
        }
        const completedHour = it["completedHour"];
        if (completedHour != null && typeof completedHour !== "number") {
          errors.push({ path: `items.${id}.completedHour`, msg: "expected number or null" });
        }
        const reflection = it["reflection"];
        if (reflection !== void 0 && typeof reflection !== "string") {
          errors.push({ path: `items.${id}.reflection`, msg: "expected string" });
        }
        items[id] = {
          tasks,
          reflection: typeof reflection === "string" ? reflection : "",
          completedAt: typeof completedAt === "string" ? completedAt : null,
          completedHour: typeof completedHour === "number" ? completedHour : null
        };
      }
      if (errors.length) throw new ValidationError(errors);
      const rawBadges = data["badges"];
      const badges = isObj(rawBadges) ? rawBadges : {};
      return {
        schema: "sunrise.progress/v1",
        items,
        badges
      };
    }
  };

  // src/domain/tracker.ts
  var SURPRISE_CHANCE = 0.12;
  var Tracker = class {
    deps;
    pack;
    progress;
    themeId = null;
    currentItemId = "";
    rules = [];
    allItems = [];
    groupOfItem = {};
    mottosList = [];
    constructor(deps) {
      this.deps = deps;
    }
    // ----- lifecycle -----------------------------------------------------------
    init() {
      const packs = this.deps.packs.packs();
      if (packs.length === 0) throw new Error("no packs registered");
      const sess = this.deps.sessionStore.load();
      const pack = packs.find((p) => p.id === sess.activePackId) ?? packs[0];
      this.loadPack(pack.id);
      const themes = this.deps.themes.themes();
      const theme = themes.find((t) => t.id === sess.themeId) ?? themes[0];
      this.themeId = theme ? theme.id : null;
      this.currentItemId = this.resumeItemId();
    }
    loadPack(packId) {
      const packs = this.deps.packs.packs();
      this.pack = packs.find((p) => p.id === packId) ?? packs[0];
      this.progress = this.deps.progressStore.load(this.pack.id);
      const byId = /* @__PURE__ */ new Map();
      for (const r of [...this.deps.genericBadges, ...this.pack.badges ?? []]) byId.set(r.id, r);
      this.rules = [...byId.values()];
      this.allItems = this.pack.groups.flatMap((g) => [...g.items]);
      this.groupOfItem = {};
      for (const g of this.pack.groups) for (const it of g.items) this.groupOfItem[it.id] = g;
      this.mottosList = this.pack.mottos && this.pack.mottos.length ? this.pack.mottos : this.deps.defaultMottos;
      if (this.progress.reconcile(this.allItems)) this.save();
    }
    save() {
      this.deps.progressStore.save(this.pack.id, this.progress);
    }
    // ----- helpers -------------------------------------------------------------
    uiText(k) {
      const fromPack = this.pack.ui && this.pack.ui[k];
      if (fromPack != null) return fromPack;
      return this.deps.defaultUi[k] ?? "";
    }
    lbl(k, fallbackKey) {
      const l = this.pack.settings && this.pack.settings.labels;
      const v = l && l[k];
      return v != null ? v : this.uiText(fallbackKey);
    }
    itemOf(id) {
      const it = this.allItems.find((x) => x.id === id);
      if (!it) throw new Error(`unknown item "${id}"`);
      return it;
    }
    // Unlike itemOf this never throws: the implicit "rest" track is undeclared by design.
    trackMeta(id) {
      for (const t of this.pack.tracks) if (t.id === id) return t;
      return { id, label: "", icon: "" };
    }
    // The card to open on load: the first unfinished card at or after the stored
    // cursor (so a partial card resumes; a finished one advances to the next). No
    // valid cursor → scan from the start (first unfinished). Forward-only — an
    // earlier skip is never auto-reopened; the card map is for revisiting those.
    resumeItemId() {
      const storedId = this.deps.sessionStore.load().cursors?.[this.pack.id];
      const at = storedId ? this.allItems.findIndex((it) => it.id === storedId) : -1;
      for (let j = at >= 0 ? at : 0; j < this.allItems.length; j++) {
        const it = this.allItems[j];
        if (!it.rest && !this.progress.isItemComplete(it)) return it.id;
      }
      return this.allItems[this.allItems.length - 1].id;
    }
    persistCursor() {
      const sess = this.deps.sessionStore.load();
      sess.cursors = { ...sess.cursors ?? {}, [this.pack.id]: this.currentItemId };
      this.deps.sessionStore.save(sess);
    }
    itemIndex() {
      return this.allItems.findIndex((it) => it.id === this.currentItemId);
    }
    groupOrdinal(id) {
      return this.pack.groups.indexOf(this.groupOfItem[id]) + 1;
    }
    // Badge awards must stick the moment a trophy shows as earned, so every
    // progress mutation syncs awards — not just item completion (which also toasts).
    syncBadges() {
      return this.deps.badges.sync(this.pack, this.progress, this.rules, this.deps.clock.today());
    }
    // ----- intents -------------------------------------------------------------
    setTaskDone(taskId, done) {
      const item = this.itemOf(this.currentItemId);
      const wasComplete = this.progress.isItemComplete(item);
      this.progress.setTaskDone(item, taskId, done, this.deps.clock.today(), this.deps.clock.hour());
      if (!wasComplete && this.progress.isItemComplete(item)) return this.onItemCompleted();
      this.syncBadges();
      this.save();
      return { unlockedBadges: [] };
    }
    onItemCompleted() {
      const unlocked = this.syncBadges();
      this.save();
      const result = { unlockedBadges: unlocked };
      if (this.deps.random.next() < SURPRISE_CHANCE) {
        const pool = this.pack.surprises ?? [];
        const msg = pool.length ? pool[Math.floor(this.deps.random.next() * pool.length)] : void 0;
        if (msg) result.surprise = msg;
      }
      return result;
    }
    setReflection(text) {
      this.progress.setReflection(this.currentItemId, text);
      this.syncBadges();
      this.save();
    }
    selectItem(id) {
      this.currentItemId = id;
      this.persistCursor();
    }
    goToItem(delta) {
      const i = this.itemIndex();
      const j = Math.min(Math.max(i + delta, 0), this.allItems.length - 1);
      if (j !== i) {
        this.currentItemId = this.allItems[j].id;
        this.persistCursor();
      }
    }
    selectPack(id) {
      const sess = this.deps.sessionStore.load();
      sess.activePackId = id;
      this.deps.sessionStore.save(sess);
      this.loadPack(id);
      this.currentItemId = this.resumeItemId();
    }
    selectTheme(id) {
      const sess = this.deps.sessionStore.load();
      sess.themeId = id;
      this.deps.sessionStore.save(sess);
      this.themeId = id;
    }
    importProgress(json) {
      let raw;
      try {
        raw = JSON.parse(json);
      } catch {
        throw new ImportError("Invalid JSON");
      }
      const filePackId = raw && typeof raw === "object" ? raw["packId"] : void 0;
      if (typeof filePackId === "string" && filePackId !== this.pack.id) {
        throw new ImportError(`file is for pack "${filePackId}", active pack is "${this.pack.id}"`);
      }
      const data = new ProgressValidator().parse(raw);
      this.progress = new Progress(data);
      this.progress.reconcile(this.allItems);
      this.save();
      this.currentItemId = this.resumeItemId();
    }
    exportProgress() {
      return JSON.stringify({ packId: this.pack.id, ...this.progress.toJSON() }, null, 2);
    }
    // ----- queries -------------------------------------------------------------
    selectors() {
      const packs = this.deps.packs.packs().map((p) => ({
        id: p.id,
        label: p.name,
        selected: p.id === this.pack.id
      }));
      const themes = this.deps.themes.themes().map((t) => ({
        id: t.id,
        label: t.name,
        selected: t.id === this.themeId
      }));
      const items = this.allItems.map((it) => {
        const g = this.groupOfItem[it.id];
        const tl = it.rest ? this.uiText("restVert") : this.trackMeta(it.track).label;
        return { id: it.id, label: `${g.title} \xB7 ${tl}`, selected: it.id === this.currentItemId };
      });
      return { packs, themes, items };
    }
    todayCard() {
      const it = this.itemOf(this.currentItemId);
      const m = this.trackMeta(it.track);
      const g = this.groupOfItem[it.id];
      const cfg = this.pack.settings ?? {};
      const i = this.itemIndex();
      const notLast = i < this.allItems.length - 1;
      const phaseLabel = this.uiText("phaseLabel").replace("{p}", g.phase == null ? "" : g.phase).replace("{w}", String(this.groupOrdinal(it.id)));
      if (it.rest) {
        return {
          itemId: it.id,
          rest: true,
          track: it.track,
          trackLabel: m.label,
          trackIcon: m.icon ?? "",
          title: this.uiText("restTitle"),
          phaseLabel,
          reflectPrompt: it.reflectPrompt,
          reflection: "",
          tasks: [],
          resources: [],
          complete: false,
          notLast,
          show: { warmup: false, reflection: false }
        };
      }
      const complete = this.progress.isItemComplete(it);
      const tasks = (it.tasks ?? []).map((t) => ({
        id: t.id,
        text: t.text,
        ...t.guidance !== void 0 ? { guidance: t.guidance } : {},
        done: this.progress.taskChecked(it.id, t.id)
      }));
      const showWarmup = cfg.warmups !== false && it.warmup != null;
      const showReflection = cfg.reflections !== false;
      return {
        itemId: it.id,
        rest: false,
        track: it.track,
        trackLabel: m.label,
        trackIcon: m.icon ?? "",
        title: it.title ?? "",
        phaseLabel,
        warmup: it.warmup,
        reflectPrompt: it.reflectPrompt,
        reflection: this.progress.reflection(it.id),
        tasks,
        resources: (it.resources ?? []).map((r) => ({ label: r.label, note: r.note })),
        complete,
        notLast,
        show: { warmup: showWarmup, reflection: showReflection }
      };
    }
    dashboard() {
      const overall = this.deps.stats.overall(this.pack, this.progress);
      const streak = this.deps.streaks.current(this.progress, this.deps.clock.today());
      const byPhase = this.deps.stats.byPhase(this.pack, this.progress);
      const byTrack = this.deps.stats.byTrack(this.pack, this.progress);
      const sw = this.deps.defaultStreakWords;
      const m10 = streak % 10;
      const m100 = streak % 100;
      const streakWord = m10 === 1 && m100 !== 11 ? sw[0] ?? "" : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? sw[1] ?? "" : sw[2] ?? "";
      const phaseList = this.pack.phases ?? [];
      const phases = phaseList.length ? phaseList.map((ph) => ({
        id: ph.id,
        title: ph.title || `${this.lbl("phase", "phaseWord")} ${ph.id}`,
        stat: byPhase[ph.id] ?? { done: 0, total: 0, pct: 0 }
      })) : null;
      const tracks = this.pack.tracks.filter((t) => byTrack[t.id]).map((t) => ({ id: t.id, label: t.label, stat: byTrack[t.id] }));
      return {
        overall,
        streak,
        streakWord,
        phases,
        tracks,
        daysOfLabel: this.uiText("daysOf").replace("{n}", String(overall.total))
      };
    }
    cardMap() {
      const overall = this.deps.stats.overall(this.pack, this.progress);
      const groups = this.pack.groups.map((g) => ({
        id: g.id,
        title: g.title,
        items: g.items.map((it) => ({
          id: it.id,
          title: it.title ?? "",
          done: this.progress.isItemComplete(it),
          rest: !!it.rest,
          current: it.id === this.currentItemId
        }))
      }));
      return { done: overall.done, total: overall.total, groups };
    }
    trophies() {
      const all = this.deps.badges.evaluate(this.pack, this.progress, this.rules);
      return all.map((b) => {
        const meta = this.rules.find((r) => r.id === b.id);
        return {
          id: b.id,
          title: meta?.title ?? b.id,
          desc: meta?.desc ?? "",
          icon: meta?.icon ?? "\u2022",
          unlocked: b.unlocked
        };
      });
    }
    comeback() {
      const today = this.deps.clock.today();
      const b = this.deps.badges.evaluate(this.pack, this.progress, this.rules).find((x) => x.id === "comeback");
      const streak = this.deps.streaks.current(this.progress, today);
      const show = !!(b && b.unlocked && streak <= 2);
      return { show, days: this.progress.completedCount() };
    }
    trackColors() {
      const out = [];
      for (const t of this.pack.tracks) if (t.color) out.push({ id: t.id, color: t.color });
      return out;
    }
    mottos() {
      return this.mottosList;
    }
    ui(key) {
      return this.uiText(key);
    }
    // Pre-prompt for the "AI copy" button: the task/warmup text wrapped in a
    // tutor template with the current item's context, ready to paste into a chat.
    aiPrompt(text, guidance) {
      const it = this.itemOf(this.currentItemId);
      const g = guidance ? `
${this.uiText("aiPromptGuidance").replace("{guidance}", guidance)}
` : "";
      return this.uiText("aiPrompt").replace("{title}", it.title ?? "").replace("{track}", this.trackMeta(it.track).label).replace("{text}", text).replace("{guidance}", g);
    }
    itemLabel() {
      return this.lbl("item", "weekAbbr");
    }
    activeThemeHref() {
      const theme = this.deps.themes.themes().find((t) => t.id === this.themeId);
      return theme ? theme.cssHref : null;
    }
    activeThemeId() {
      return this.themeId;
    }
    activePackId() {
      return this.pack.id;
    }
    locale() {
      return this.pack.locale ?? "en";
    }
  };

  // src/domain/dates.ts
  function ms(s) {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  }
  function addDays(s, n) {
    const dt = new Date(ms(s));
    dt.setUTCDate(dt.getUTCDate() + n);
    return dt.toISOString().slice(0, 10);
  }
  function diffDays(a, b) {
    return Math.round((ms(b) - ms(a)) / 864e5);
  }
  function weekdayMon(s) {
    return (diffDays("2024-01-01", s) % 7 + 7) % 7;
  }

  // src/domain/streaks.ts
  var Streaks = class {
    current(progress, today) {
      const set = new Set(progress.completedDates());
      if (set.size === 0) return 0;
      let cursor;
      if (set.has(today)) cursor = today;
      else if (set.has(addDays(today, -1))) cursor = addDays(today, -1);
      else return 0;
      let n = 0;
      while (set.has(cursor)) {
        n++;
        cursor = addDays(cursor, -1);
      }
      return n;
    }
    longest(progress) {
      const dates = progress.completedDates();
      if (dates.length === 0) return 0;
      let best = 1;
      let cur = 1;
      for (let i = 1; i < dates.length; i++) {
        if (diffDays(dates[i - 1], dates[i]) === 1) cur++;
        else cur = 1;
        if (cur > best) best = cur;
      }
      return best;
    }
    hasComeback(progress) {
      const dates = progress.completedDates();
      for (let i = 1; i < dates.length; i++) if (diffDays(dates[i - 1], dates[i]) >= 2) return true;
      return false;
    }
  };

  // src/domain/progress-stats.ts
  var pct = (done, total) => total ? Math.round(done / total * 100) : 0;
  var ProgressStats = class {
    all(pack) {
      return pack.groups.flatMap((g) => [...g.items]);
    }
    tracks(pack) {
      const s = /* @__PURE__ */ new Set();
      for (const it of this.all(pack)) if (!it.rest) s.add(it.track);
      return [...s];
    }
    overall(pack, progress) {
      let done = 0;
      let total = 0;
      for (const it of this.all(pack)) {
        if (it.rest) continue;
        total++;
        if (progress.isItemComplete(it)) done++;
      }
      return { done, total, pct: pct(done, total) };
    }
    byTrack(pack, progress) {
      const acc = {};
      for (const it of this.all(pack)) {
        if (it.rest) continue;
        this.bump(acc, it.track, progress.isItemComplete(it));
      }
      return this.finalize(acc);
    }
    byPhase(pack, progress) {
      const acc = {};
      for (const g of pack.groups) {
        if (g.phase == null) continue;
        for (const it of g.items) {
          if (it.rest) continue;
          this.bump(acc, g.phase, progress.isItemComplete(it));
        }
      }
      return this.finalize(acc);
    }
    countTasks(pack, progress, track) {
      let n = 0;
      for (const it of this.all(pack)) {
        if (track && it.track !== track) continue;
        for (const t of it.tasks ?? []) if (progress.taskChecked(it.id, t.id)) n++;
      }
      return n;
    }
    completedGroups(pack, progress) {
      let n = 0;
      for (const g of pack.groups) {
        const work = g.items.filter((it) => !it.rest);
        if (work.length && work.every((it) => progress.isItemComplete(it))) n++;
      }
      return n;
    }
    bump(acc, key, done) {
      const a = acc[key] ?? (acc[key] = { done: 0, total: 0, pct: 0 });
      a.total++;
      if (done) a.done++;
    }
    finalize(acc) {
      for (const k of Object.keys(acc)) {
        const a = acc[k];
        a.pct = pct(a.done, a.total);
      }
      return acc;
    }
  };

  // src/domain/badge-engine.ts
  var inHourRange = (h, from, to) => from <= to ? h >= from && h < to : h >= from || h < to;
  var BadgeEngine = class {
    streaks;
    stats;
    constructor(streaks, stats) {
      this.streaks = streaks;
      this.stats = stats;
    }
    context(pack, progress) {
      const overall = this.stats.overall(pack, progress);
      const byTrack = this.stats.byTrack(pack, progress);
      const byPhase = this.stats.byPhase(pack, progress);
      const byId = new Map(pack.groups.flatMap((g) => g.items).map((it) => [it.id, it]));
      const NONE = { done: 0, total: 0 };
      return {
        longestStreak: this.streaks.longest(progress),
        daysDone: overall.done,
        total: overall.total,
        // exact ratio, not the display-rounded Stat.pct — `percent` rules must
        // not fire early (199/200 rounds to 100)
        pct: overall.total ? overall.done / overall.total * 100 : 0,
        reflections: progress.reflectionCount(),
        groupsComplete: this.stats.completedGroups(pack, progress),
        hasComeback: this.streaks.hasComeback(progress),
        tracks: this.stats.tracks(pack),
        dates: progress.completedDates(),
        hours: progress.completedHours(),
        tasks: (track) => this.stats.countTasks(pack, progress, track),
        trackDone: (track) => byTrack[track]?.done ?? 0,
        trackStat: (track) => byTrack[track] ?? NONE,
        phaseStat: (phase) => byPhase[phase] ?? NONE,
        itemComplete: (id) => {
          const it = byId.get(id);
          return it ? progress.isItemComplete(it) : false;
        }
      };
    }
    passes(rule, c) {
      switch (rule.type) {
        case "streak":
          return c.longestStreak >= rule.gte;
        case "days-done":
          return c.daysDone >= rule.gte;
        case "percent":
          return c.pct >= rule.gte;
        case "all-done":
          return c.total > 0 && c.daysDone === c.total;
        case "tasks-done":
          return c.tasks(rule.track) >= rule.gte;
        case "reflections":
          return c.reflections >= rule.gte;
        case "groups-complete":
          return c.groupsComplete >= rule.gte;
        case "track-complete": {
          const s = c.trackStat(rule.track);
          return s.total > 0 && s.done === s.total;
        }
        case "phase-complete": {
          const s = c.phaseStat(rule.phase);
          return s.total > 0 && s.done === s.total;
        }
        case "item-complete":
          return c.itemComplete(rule.item);
        case "all-tracks":
          return c.tracks.length > 0 && c.tracks.every((t) => c.trackDone(t) >= rule.eachGte);
        // weekdayMon is 0-based (0=Mon); rule.days uses the documented 1=Mon..7=Sun.
        case "weekday":
          return c.dates.some((d) => rule.days.includes(weekdayMon(d) + 1));
        case "hour-range":
          return c.hours.some((h) => inHourRange(h, rule.from, rule.to));
        case "comeback":
          return c.hasComeback;
        default: {
          const _exhaustive = rule;
          return _exhaustive;
        }
      }
    }
    // Rules are deduped by Tracker.loadPack (last wins); ids are unique here.
    evaluate(pack, progress, rules) {
      const ctx = this.context(pack, progress);
      return rules.map((r) => ({
        id: r.id,
        unlocked: progress.isBadgeOwned(r.id) || this.passes(r, ctx)
      }));
    }
    sync(pack, progress, rules, today) {
      const ctx = this.context(pack, progress);
      const unlocked = [];
      for (const r of rules) {
        if (!progress.isBadgeOwned(r.id) && this.passes(r, ctx)) {
          progress.awardBadge(r.id, today);
          unlocked.push(r.id);
        }
      }
      return unlocked;
    }
  };

  // src/domain/builtins.ts
  var DEFAULT_UI = {
    summaryTitle: "\u0421\u0432\u043E\u0434\u043A\u0430",
    todayTitle: "\u0421\u0435\u0433\u043E\u0434\u043D\u044F",
    warmup: "\u0420\u0430\u0437\u043C\u0438\u043D\u043A\u0430",
    reflect: "\u0420\u0435\u0444\u043B\u0435\u043A\u0441\u0438\u044F",
    export: "\u042D\u043A\u0441\u043F\u043E\u0440\u0442",
    import: "\u0418\u043C\u043F\u043E\u0440\u0442",
    cardMap: "\u041A\u0430\u0440\u0442\u0430 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441\u0430",
    trophies: "\u0422\u0440\u043E\u0444\u0435\u0438",
    nextDay: "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0434\u0435\u043D\u044C \u2192",
    restTitle: "\u0420\u0430\u0437\u0433\u0440\u0443\u0437\u043A\u0430",
    overallTitle: "\u041E\u0431\u0449\u0438\u0439 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441",
    streakTitle: "\u0421\u0435\u0440\u0438\u044F",
    phasesTitle: "\u0424\u0430\u0437\u044B",
    tracksTitle: "\u0422\u0440\u0435\u043A\u0438",
    daysOf: "\u043F\u0440\u043E\u0439\u0434\u0435\u043D\u043E \u0434\u043D\u0435\u0439 \u0438\u0437 {n}",
    newTrophy: "\u{1F3C6} \u041D\u043E\u0432\u044B\u0439 \u0442\u0440\u043E\u0444\u0435\u0439!",
    comeback: "\u0421 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435\u043C \u2014 \u0432\u0441\u0435\u0433\u043E \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u043E {n} \u0434\u043D\u0435\u0439. \u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0435\u043C.",
    importOk: "\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0438\u043C\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u043D.",
    importFail: "\u0418\u043C\u043F\u043E\u0440\u0442 \u043D\u0435 \u0443\u0434\u0430\u043B\u0441\u044F: {e}\n\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u043D\u0435 \u0438\u0437\u043C\u0435\u043D\u0451\u043D.",
    weekAbbr: "\u041D\u0435\u0434",
    inARow: "\u043F\u043E\u0434\u0440\u044F\u0434",
    phaseWord: "\u0424\u0430\u0437\u0430",
    phaseLabel: "",
    todayVert: "TODAY",
    restVert: "REST",
    taskPlaceholder: "\u041A\u043E\u0440\u043E\u0442\u043A\u0430\u044F \u0437\u0430\u043C\u0435\u0442\u043A\u0430...",
    prevDayAria: "\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439 \u0434\u0435\u043D\u044C",
    nextDayAria: "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0434\u0435\u043D\u044C",
    theme: "\u0422\u0435\u043C\u0430",
    pack: "\u041F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430",
    menu: "\u041C\u0435\u043D\u044E",
    hint: "\u0427\u0442\u043E \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F \u0441\u0438\u043B\u044C\u043D\u044B\u043C \u043E\u0442\u0432\u0435\u0442\u043E\u043C",
    copy: "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
    copyAi: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441 \u043F\u0440\u043E\u043C\u043F\u0442\u043E\u043C \u0434\u043B\u044F \u0418\u0418",
    copied: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E",
    copiedAi: "\u041F\u0440\u043E\u043C\u043F\u0442 \u0434\u043B\u044F \u0418\u0418 \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D \u2014 \u0432\u0441\u0442\u0430\u0432\u044C \u0435\u0433\u043E \u0432 \u0447\u0430\u0442 \u0441 \u0418\u0418",
    // {guidance} is replaced with a filled aiPromptGuidance line (or '') by Tracker.aiPrompt
    aiPrompt: "\u042F \u043F\u0440\u043E\u0445\u043E\u0436\u0443 \u0443\u0447\u0435\u0431\u043D\u0443\u044E \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0443 \u0438 \u0441\u0435\u0439\u0447\u0430\u0441 \u043D\u0430 \u0442\u0435\u043C\u0435 \xAB{title}\xBB (\u0442\u0440\u0435\u043A: {track}). \u0420\u0430\u0437\u0431\u0435\u0440\u0438 \u044D\u0442\u043E \u0437\u0430\u0434\u0430\u043D\u0438\u0435 \u043A\u0430\u043A \u043E\u043F\u044B\u0442\u043D\u044B\u0439 \u043D\u0430\u0441\u0442\u0430\u0432\u043D\u0438\u043A:\n\n{text}\n{guidance}\n\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u043E\u0431\u044A\u044F\u0441\u043D\u0438 \u0438\u0434\u0435\u044E \u0438 \u0438\u043D\u0442\u0443\u0438\u0446\u0438\u044E \u043F\u0440\u043E\u0441\u0442\u044B\u043C\u0438 \u0441\u043B\u043E\u0432\u0430\u043C\u0438, \u0437\u0430\u0442\u0435\u043C \u0434\u0430\u0439 \u0440\u0430\u0437\u0432\u0451\u0440\u043D\u0443\u0442\u044B\u0439 \u0440\u0430\u0437\u0431\u043E\u0440: \u0434\u043B\u044F \u0437\u0430\u0434\u0430\u0447\u0438 \u2014 \u043D\u0430\u0437\u043E\u0432\u0438 \u043F\u0430\u0442\u0442\u0435\u0440\u043D, \u043F\u043E\u0434\u0445\u043E\u0434 \u0438 \u0441\u043B\u043E\u0436\u043D\u043E\u0441\u0442\u044C \u043F\u043E \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u0438 \u043F\u0430\u043C\u044F\u0442\u0438, \u0438 \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E\u0441\u043B\u0435 \u044D\u0442\u043E\u0433\u043E \u043A\u043E\u0434; \u0434\u043B\u044F \u0442\u0435\u043E\u0440\u0438\u0438 \u2014 \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0435 \u043E\u0431\u044A\u044F\u0441\u043D\u0435\u043D\u0438\u0435 \u0441 \u043F\u0440\u0438\u043C\u0435\u0440\u0430\u043C\u0438. \u041E\u0442\u0432\u0435\u0447\u0430\u0439 \u043D\u0430 \u0440\u0443\u0441\u0441\u043A\u043E\u043C.",
    aiPromptGuidance: "\u041A\u0440\u0438\u0442\u0435\u0440\u0438\u0439 \u0441\u0438\u043B\u044C\u043D\u043E\u0433\u043E \u043E\u0442\u0432\u0435\u0442\u0430: {guidance}",
    shortcuts: "\u0413\u043E\u0440\u044F\u0447\u0438\u0435 \u043A\u043B\u0430\u0432\u0438\u0448\u0438",
    scDay: "\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439 / \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0434\u0435\u043D\u044C",
    scTick: "\u041F\u0435\u0440\u0435\u0445\u043E\u0434 \u043C\u0435\u0436\u0434\u0443 \u0437\u0430\u0434\u0430\u0447\u0430\u043C\u0438",
    scMark: "\u041E\u0442\u043C\u0435\u0442\u0438\u0442\u044C \u0437\u0430\u0434\u0430\u0447\u0443",
    scMap: "\u041A\u0430\u0440\u0442\u0430 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441\u0430",
    scTrophies: "\u0422\u0440\u043E\u0444\u0435\u0438",
    scHelp: "\u042D\u0442\u0430 \u043F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0430",
    scClose: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043E\u043A\u043D\u043E"
  };
  var DEFAULT_STREAK_WORDS = ["\u0434\u0435\u043D\u044C", "\u0434\u043D\u044F", "\u0434\u043D\u0435\u0439"];
  var DEFAULT_MOTTOS = ["\u4E00\u6B69\u4E00\u6B69 \xB7 \u0448\u0430\u0433 \u0437\u0430 \u0448\u0430\u0433\u043E\u043C"];
  var GENERIC_BADGES = [
    {
      id: "first-light",
      type: "days-done",
      gte: 1,
      title: "First Light",
      desc: "\u041F\u0435\u0440\u0432\u044B\u0439 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u0437\u0430\u043A\u0440\u044B\u0442\u044B\u0439 \u0434\u0435\u043D\u044C",
      icon: "\u{1F305}"
    },
    {
      id: "streak-3",
      type: "streak",
      gte: 3,
      title: "\u0420\u0430\u0437\u043E\u0433\u0440\u0435\u0432",
      desc: "\u0421\u0435\u0440\u0438\u044F 3 \u0434\u043D\u044F \u043F\u043E\u0434\u0440\u044F\u0434",
      icon: "\u{1F331}"
    },
    {
      id: "streak-7",
      type: "streak",
      gte: 7,
      title: "7 \u0434\u043D\u0435\u0439",
      desc: "\u0421\u0435\u0440\u0438\u044F 7 \u0434\u043D\u0435\u0439 \u043F\u043E\u0434\u0440\u044F\u0434",
      icon: "\u{1F525}"
    },
    {
      id: "streak-14",
      type: "streak",
      gte: 14,
      title: "14 \u0434\u043D\u0435\u0439",
      desc: "\u0421\u0435\u0440\u0438\u044F 14 \u0434\u043D\u0435\u0439 \u043F\u043E\u0434\u0440\u044F\u0434",
      icon: "\u{1F30B}"
    },
    {
      id: "streak-30",
      type: "streak",
      gte: 30,
      title: "30 \u0434\u043D\u0435\u0439",
      desc: "\u0421\u0435\u0440\u0438\u044F 30 \u0434\u043D\u0435\u0439 \u043F\u043E\u0434\u0440\u044F\u0434",
      icon: "\u26A1"
    },
    {
      id: "streak-100",
      type: "streak",
      gte: 100,
      title: "100 \u0434\u043D\u0435\u0439",
      desc: "\u0421\u0435\u0440\u0438\u044F 100 \u0434\u043D\u0435\u0439 \u043F\u043E\u0434\u0440\u044F\u0434",
      icon: "\u{1F4AF}"
    },
    {
      id: "days-10",
      type: "days-done",
      gte: 10,
      title: "10 \u0434\u043D\u0435\u0439",
      desc: "10 \u0434\u043D\u0435\u0439 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u044B \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u043E",
      icon: "\u{1F4C5}"
    },
    {
      id: "days-25",
      type: "days-done",
      gte: 25,
      title: "25 \u0434\u043D\u0435\u0439",
      desc: "25 \u0434\u043D\u0435\u0439 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u044B \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u043E",
      icon: "\u{1F5D3}\uFE0F"
    },
    {
      id: "days-50",
      type: "days-done",
      gte: 50,
      title: "50 \u0434\u043D\u0435\u0439",
      desc: "50 \u0434\u043D\u0435\u0439 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u044B \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u043E",
      icon: "\u{1F4C6}"
    },
    {
      id: "halfway",
      type: "percent",
      gte: 50,
      title: "\u042D\u043A\u0432\u0430\u0442\u043E\u0440",
      desc: "\u041F\u0440\u043E\u0439\u0434\u0435\u043D\u0430 \u043F\u043E\u043B\u043E\u0432\u0438\u043D\u0430 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u044B",
      icon: "\u{1F317}"
    },
    {
      id: "finisher",
      type: "all-done",
      title: "\u0424\u0438\u043D\u0438\u0448\u0435\u0440",
      desc: "\u041F\u0440\u043E\u0439\u0434\u0435\u043D\u044B \u0432\u0441\u0435 \u0434\u043D\u0438 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u044B",
      icon: "\u{1F393}"
    },
    {
      id: "tasks-100",
      type: "tasks-done",
      gte: 100,
      title: "100 \u0437\u0430\u0434\u0430\u0447",
      desc: "100 \u0437\u0430\u0434\u0430\u0447 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043E",
      icon: "\u2705"
    },
    {
      id: "scribe-10",
      type: "reflections",
      gte: 10,
      title: "\u041B\u0435\u0442\u043E\u043F\u0438\u0441\u0435\u0446",
      desc: "10 \u0440\u0435\u0444\u043B\u0435\u043A\u0441\u0438\u0439 \u043D\u0430\u043F\u0438\u0441\u0430\u043D\u043E",
      icon: "\u270D\uFE0F"
    },
    {
      id: "scribe-30",
      type: "reflections",
      gte: 30,
      title: "\u0425\u0440\u043E\u043D\u0438\u0441\u0442",
      desc: "30 \u0440\u0435\u0444\u043B\u0435\u043A\u0441\u0438\u0439 \u043D\u0430\u043F\u0438\u0441\u0430\u043D\u043E",
      icon: "\u{1F4DC}"
    },
    {
      id: "perfect-week",
      type: "groups-complete",
      gte: 1,
      title: "\u0418\u0434\u0435\u0430\u043B\u044C\u043D\u0430\u044F \u043D\u0435\u0434\u0435\u043B\u044F",
      desc: "\u041D\u0435\u0434\u0435\u043B\u044F \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u0430 \u0446\u0435\u043B\u0438\u043A\u043E\u043C",
      icon: "\u{1F31F}"
    },
    {
      id: "weeks-4",
      type: "groups-complete",
      gte: 4,
      title: "\u041C\u0435\u0441\u044F\u0446 \u0432 \u0434\u0435\u043B\u0435",
      desc: "4 \u043D\u0435\u0434\u0435\u043B\u0438 \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u044B \u0446\u0435\u043B\u0438\u043A\u043E\u043C",
      icon: "\u{1F4C8}"
    },
    {
      id: "comeback",
      type: "comeback",
      title: "Comeback",
      desc: "\u0412\u0435\u0440\u043D\u0443\u043B\u0441\u044F \u043F\u043E\u0441\u043B\u0435 \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u0430",
      icon: "\u{1FA79}"
    },
    {
      id: "night-owl",
      type: "hour-range",
      from: 22,
      to: 5,
      title: "Night Owl",
      desc: "\u0417\u0430\u043A\u0440\u044B\u043B \u0434\u0435\u043D\u044C \u043F\u043E\u0441\u043B\u0435 22:00 \u0438\u043B\u0438 \u0434\u043E 5:00",
      icon: "\u{1F989}"
    },
    {
      id: "early-lark",
      type: "hour-range",
      from: 5,
      to: 8,
      title: "Early Lark",
      desc: "\u0417\u0430\u043A\u0440\u044B\u043B \u0434\u0435\u043D\u044C \u0434\u043E 8:00 \u0443\u0442\u0440\u0430",
      icon: "\u{1F426}"
    },
    {
      id: "weekend",
      type: "weekday",
      days: [6, 7],
      title: "\u0412\u043E\u0438\u043D \u0432\u044B\u0445\u043E\u0434\u043D\u043E\u0433\u043E",
      desc: "\u0417\u0430\u043A\u0440\u044B\u043B \u0434\u0435\u043D\u044C \u0432 \u0441\u0443\u0431\u0431\u043E\u0442\u0443 \u0438\u043B\u0438 \u0432\u043E\u0441\u043A\u0440\u0435\u0441\u0435\u043D\u044C\u0435",
      icon: "\u{1F334}"
    }
  ];
  var BUILTIN_THEMES = [
    {
      schema: "sunrise.theme/v1",
      id: "bonus",
      name: "Neo-Brutalist Riso",
      version: "1.0.0",
      cssHref: "themes/bonus.css"
    },
    {
      schema: "sunrise.theme/v1",
      id: "neon",
      name: "Neon \xB7 \u041A\u0438\u0441\u043B\u043E\u0442\u0430",
      version: "1.0.0",
      cssHref: "themes/neon.css"
    },
    {
      schema: "sunrise.theme/v1",
      id: "japanese",
      name: "Japanese \xB7 \u548C",
      version: "1.0.0",
      cssHref: "themes/japanese.css"
    },
    {
      schema: "sunrise.theme/v1",
      id: "emerald",
      name: "Emerald \xB7 \u041C\u0440\u0430\u043C\u043E\u0440",
      version: "1.0.0",
      cssHref: "themes/emerald.css"
    },
    {
      schema: "sunrise.theme/v1",
      id: "dashboard",
      name: "Colorful Dashboard",
      version: "1.0.0",
      cssHref: "themes/dashboard.css"
    }
  ];

  // src/adapters/system-clock.ts
  var SystemClock = class {
    today() {
      const d = /* @__PURE__ */ new Date();
      const p = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    }
    hour() {
      return (/* @__PURE__ */ new Date()).getHours();
    }
  };

  // src/adapters/math-random.ts
  var MathRandom = class {
    next() {
      return Math.random();
    }
  };

  // src/adapters/local-storage-store.ts
  var PREFIX = "sunrise.progress.";
  var SESSION = "sunrise.session";
  var LEGACY = "devRoadmapState.v1";
  var LEGACY_THEME = "sunriseTheme";
  var LocalStorageProgressStore = class {
    validator = new ProgressValidator();
    load(packId) {
      let raw;
      try {
        raw = localStorage.getItem(PREFIX + packId);
      } catch {
        return Progress.empty();
      }
      if (!raw) return Progress.empty();
      try {
        return new Progress(this.validator.parse(JSON.parse(raw)));
      } catch (e) {
        console.error(
          `[sunrise] progress for "${packId}" is unreadable, starting empty (backup at ${PREFIX}${packId}.corrupt):`,
          e
        );
        try {
          localStorage.setItem(PREFIX + packId + ".corrupt", raw);
        } catch {
        }
        return Progress.empty();
      }
    }
    save(packId, p) {
      try {
        localStorage.setItem(PREFIX + packId, JSON.stringify(p.toJSON(), null, 2));
      } catch {
      }
    }
  };
  function readSession() {
    try {
      const raw = localStorage.getItem(SESSION);
      const o = raw ? JSON.parse(raw) : {};
      return o && typeof o === "object" && !Array.isArray(o) ? o : {};
    } catch {
      return {};
    }
  }
  var LocalStorageSessionStore = class {
    load() {
      return readSession();
    }
    save(s) {
      try {
        localStorage.setItem(SESSION, JSON.stringify(s));
      } catch {
      }
    }
  };
  function migrateLegacy() {
    try {
      const legacy = localStorage.getItem(LEGACY);
      if (!legacy || localStorage.getItem(PREFIX + "dev-roadmap")) return;
      const data = new ProgressValidator().parse(JSON.parse(legacy));
      localStorage.setItem(PREFIX + "dev-roadmap", JSON.stringify(data, null, 2));
      const sess = readSession();
      if (!sess.activePackId) sess.activePackId = "dev-roadmap";
      const th = localStorage.getItem(LEGACY_THEME);
      if (th && !sess.themeId) sess.themeId = th;
      localStorage.setItem(SESSION, JSON.stringify(sess));
    } catch {
    }
  }

  // src/adapters/window-registry.ts
  var WindowPluginRegistry = class {
    packList = [];
    themeList = [];
    rejectedList = [];
    packValidator = new PackValidator();
    themeValidator = new ThemeValidator();
    packs() {
      return [...this.packList];
    }
    themes() {
      return [...this.themeList];
    }
    rejected() {
      return [...this.rejectedList];
    }
    addBuiltinThemes(themes) {
      this.themeList.push(...themes);
    }
    registerPack(raw) {
      try {
        const pack = this.packValidator.parse(raw);
        if (this.packList.some((p) => p.id === pack.id)) {
          throw new ValidationError([{ path: "id", msg: `duplicate pack id "${pack.id}"` }]);
        }
        this.packList.push(pack);
      } catch (e) {
        this.reject("pack", raw, e);
      }
    }
    registerTheme(raw) {
      try {
        const theme = this.themeValidator.parse(raw);
        if (this.themeList.some((t) => t.id === theme.id)) {
          throw new ValidationError([{ path: "id", msg: `duplicate theme id "${theme.id}"` }]);
        }
        this.themeList.push(theme);
      } catch (e) {
        this.reject("theme", raw, e);
      }
    }
    reject(kind, raw, e) {
      const id = raw && typeof raw === "object" && "id" in raw && typeof raw.id === "string" ? raw.id : "(no id)";
      const issues = e instanceof ValidationError ? e.issues : [{ path: "", msg: String(e) }];
      this.rejectedList.push({ kind, id, issues });
      console.error(`[sunrise] ${kind} "${id}" rejected:`, issues);
    }
  };

  // src/adapters/dom-renderer.ts
  var ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
  var DomRenderer = class {
    esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ESC[c]);
    }
    $(id) {
      return document.getElementById(id);
    }
    // ----- keyboard focus (the only place that touches activeElement/focus) ----
    // preventScroll keeps re-renders from yanking the page; pass reveal when the
    // user is navigating (the checkbox is visually hidden, so an off-screen row
    // would otherwise show no focus at all).
    focusTask(taskId, reveal = false) {
      const el = this.$("cb_" + taskId);
      if (!el || typeof el.focus !== "function") return;
      el.focus({ preventScroll: true });
      if (!reveal || typeof el.closest !== "function") return;
      const row = el.closest(".task");
      if (row && typeof row.scrollIntoView === "function") row.scrollIntoView({ block: "nearest" });
    }
    activeTaskId() {
      const a = document.activeElement;
      const id = a?.id ?? "";
      return id.startsWith("cb_") ? id.slice(3) : null;
    }
    isTypingTarget() {
      const a = document.activeElement;
      if (!a) return false;
      const tag = a.tagName;
      if (tag === "TEXTAREA" || tag === "SELECT") return true;
      if (tag === "INPUT") {
        const t = a.type;
        return t !== "checkbox" && t !== "radio" && t !== "button";
      }
      return false;
    }
    // ----- selectors -----------------------------------------------------------
    renderSelectors(vm) {
      this.fillSelect("packSelect", vm.packs);
      this.fillSelect("themeSelect", vm.themes);
      this.fillSelect("daySelect", vm.items);
    }
    fillSelect(id, options) {
      const sel = this.$(id);
      if (!sel) return;
      sel.innerHTML = options.map(
        (o) => `<option value="${this.esc(o.id)}"${o.selected ? " selected" : ""}>${this.esc(o.label)}</option>`
      ).join("");
    }
    // ----- today ---------------------------------------------------------------
    renderToday(vm, lbl) {
      const el = this.$("todayCard");
      if (!el) return;
      el.setAttribute("data-track", vm.track);
      const phaseLabel = this.$("phaseLabel");
      if (phaseLabel) phaseLabel.textContent = vm.phaseLabel;
      if (vm.rest) {
        el.innerHTML = `<div class="today-side"><span class="vert">${this.esc(lbl.restVert)}</span></div><div class="today-main"><h2 class="today-title">${this.esc(vm.title)}</h2>` + (vm.reflectPrompt ? `<p class="warm"><span class="warm-i">\u263E</span> ${this.esc(vm.reflectPrompt)}</p>` : "") + (vm.notLast ? `<button class="next-day-cta" id="nextDayCta" type="button">${this.esc(lbl.nextDay)}</button>` : "") + `</div>`;
        return;
      }
      const tools = (copyId, aiId) => `<span class="task-tools"><button class="copy-btn" id="${copyId}" type="button" data-tip="${this.esc(lbl.copy)}" aria-label="${this.esc(lbl.copy)}">\u29C9</button><button class="copy-btn ai" id="${aiId}" type="button" data-tip="${this.esc(lbl.copyAi)}" aria-label="${this.esc(lbl.copyAi)}">\u2728</button></span>`;
      const spacer = `<i class="tools-spacer" aria-hidden="true"></i>`;
      el.innerHTML = `<div class="today-side"><span class="vert">${this.esc(lbl.todayVert)}</span></div><div class="today-main"><span class="trackpill"><span class="k">${this.esc(vm.trackIcon)}</span> ${this.esc(vm.trackLabel)}</span><h2 class="today-title">${this.esc(vm.title)}</h2>` + (vm.show.warmup && vm.warmup ? `<div class="warm">${spacer}<div class="warm-head"><span class="warm-i">\u2726</span> <span class="muted">${this.esc(lbl.warmup)}</span></div><div class="warm-text">${this.esc(vm.warmup)}</div>${tools("copyWarm", "copyaiWarm")}</div>` : "") + `<div class="tasks" id="taskList"></div>` + (vm.show.reflection ? `<div class="reflect-block"><label class="reflect-label" for="reflect"><span class="kanji">\u7701</span> ${this.esc(lbl.reflect)}${vm.reflectPrompt ? ` \u2014 ${this.esc(vm.reflectPrompt)}` : ""}</label><textarea id="reflect" placeholder="${this.esc(lbl.taskPlaceholder)}">${this.esc(vm.reflection || "")}</textarea></div>` : "") + (vm.resources.length ? `<div class="res-row">${vm.resources.map((r) => `<span class="chip"><b>${this.esc(r.label)}</b> ${this.esc(r.note)}</span>`).join("")}</div>` : "") + (vm.complete && vm.notLast ? `<button class="next-day-cta" id="nextDayCta" type="button">${this.esc(lbl.nextDay)}</button>` : "") + `</div>`;
      const taskList = this.$("taskList");
      if (taskList) {
        taskList.innerHTML = vm.tasks.map((t, k) => {
          const id = this.esc(t.id);
          const label = `<label class="task ${t.done ? "done" : ""}" style="animation-delay:${k * 55}ms"><input type="checkbox" id="cb_${id}"${t.done ? " checked" : ""}/><span class="box"></span><span class="task-text"><i class="tools-spacer" aria-hidden="true"></i>${this.esc(t.text)}</span></label>`;
          return `<div class="task-wrap">${label}${tools(`copy_${id}`, `copyai_${id}`)}` + (t.guidance ? `<details class="task-hint"><summary>${this.esc(lbl.hint)}</summary><div class="task-hint-body">${this.esc(t.guidance)}</div></details>` : "") + `</div>`;
        }).join("");
      }
    }
    // ----- dashboard -----------------------------------------------------------
    bar(p) {
      return `<div class="bar"><i style="width:${p}%"></i></div>`;
    }
    renderDashboard(vm, lbl) {
      const dash = this.$("dashboard");
      if (!dash) return;
      const phaseRows = (vm.phases ?? []).map(
        (ph) => `<div class="prow"><span class="lbl"><i></i>${this.esc(ph.title)}</span><span class="val">${ph.stat.done}/${ph.stat.total}</span></div>` + this.bar(ph.stat.pct)
      ).join("");
      const trackRows = vm.tracks.map(
        (t) => `<div class="prow" data-track="${this.esc(t.id)}"><span class="lbl"><i></i>${this.esc(t.label)}</span><span class="val">${t.stat.pct}%</span></div><div class="bar" data-track="${this.esc(t.id)}"><i style="width:${t.stat.pct}%"></i></div>`
      ).join("");
      dash.innerHTML = `<div class="stat-card" data-kind="progress"><div class="eyebrow">${this.esc(lbl.overallTitle)}</div><div class="ring" style="--p:${vm.overall.pct}"><div><b>${vm.overall.pct}%</b><small>${vm.overall.done}/${vm.overall.total}</small></div></div><div class="stat-sub" style="text-align:center">${this.esc(vm.daysOfLabel)}</div></div><div class="stat-card" data-kind="streak"><div class="eyebrow">${this.esc(lbl.streakTitle)}</div><div class="flame">\u{1F525}</div><div class="streak-num">${vm.streak}</div><div class="stat-sub">${this.esc(vm.streakWord)} ${this.esc(lbl.inARow)}</div></div>` + (vm.phases && vm.phases.length ? `<div class="stat-card" data-kind="phases"><div class="eyebrow">${this.esc(lbl.phasesTitle)}</div>${phaseRows}</div>` : "") + `<div class="stat-card" data-kind="tracks"><div class="eyebrow">${this.esc(lbl.tracksTitle)}</div>` + (trackRows || '<div class="muted">\u2014</div>') + `</div>`;
      const sFill = this.$("dockStreakFill");
      if (sFill) sFill.style.width = `${Math.round(Math.min(vm.streak / 30, 1) * 100)}%`;
      this.setText("dockStreakVal", `${vm.streak}d`);
      const pFill = this.$("dockProgressFill");
      if (pFill) pFill.style.width = `${vm.overall.pct}%`;
      this.setText("dockProgressVal", `${vm.overall.done}/${vm.overall.total}`);
    }
    // ----- comeback ------------------------------------------------------------
    renderComeback(vm) {
      const cb = this.$("comeback");
      if (!cb) return;
      if (vm.show) {
        cb.style.display = "";
        cb.innerHTML = `\u{1FA79} ${this.esc(vm.text)}`;
      } else {
        cb.style.display = "none";
      }
    }
    // ----- card map ------------------------------------------------------------
    renderCardMap(vm, titleLabel) {
      const host = this.$("cardMapGrid");
      if (!host) return;
      const title = this.$("cardMapTitle");
      if (title) title.textContent = `${titleLabel} \xB7 ${vm.done}/${vm.total}`;
      host.innerHTML = vm.groups.map(
        (g) => `<div class="cm-row"><span class="cm-rlabel">${this.esc(g.title)}</span><div class="cm-cells">` + g.items.map((it) => {
          let cls = "cm-card";
          if (it.rest) cls += " rest";
          else if (it.done) cls += " done";
          if (it.current) cls += " current";
          const tip = it.title ? ` data-tip="${this.esc(it.title)}"` : "";
          return `<span class="${cls}" data-id="${this.esc(it.id)}"${tip}></span>`;
        }).join("") + `</div></div>`
      ).join("");
    }
    // ----- trophies ------------------------------------------------------------
    renderTrophies(vm, titleLabel) {
      const host = this.$("trophiesGrid");
      if (!host) return;
      const got = vm.filter((b) => b.unlocked).length;
      const title = this.$("trophiesTitle");
      if (title) title.textContent = `${titleLabel} \xB7 ${got}/${vm.length}`;
      host.innerHTML = vm.map(
        (b) => `<div class="badge ${b.unlocked ? "on" : "off"}" data-tip="${this.esc(b.title + " \u2014 " + (b.desc || ""))}"><span class="bi">${this.esc(b.icon || "\u2022")}</span><span class="bt">${this.esc(b.title)}</span></div>`
      ).join("");
    }
    // ----- shortcuts help ------------------------------------------------------
    renderShortcuts(rows, titleLabel) {
      const host = this.$("shortcutsGrid");
      if (!host) return;
      const title = this.$("shortcutsTitle");
      if (title) title.textContent = titleLabel;
      host.innerHTML = rows.map(
        (r) => `<div class="sc-row"><kbd class="sc-keys">${this.esc(r.keys)}</kbd><span class="sc-desc">${this.esc(r.label)}</span></div>`
      ).join("");
    }
    // ----- theme & track colors ------------------------------------------------
    // Theme switching double-buffers the stylesheet: swapping #themeCss's href
    // directly drops the old sheet while the new one is still loading, which
    // flashes the page unstyled. Instead the new sheet loads in a parallel
    // <link> while the old one keeps the page styled, and the swap happens only
    // once it's ready (then it's served from cache, so the flip is instant).
    themeLoader = null;
    themeToken = 0;
    applyTheme(href, id) {
      const link = this.$("themeCss");
      if (!link) return;
      const token = ++this.themeToken;
      if (this.themeLoader) {
        this.themeLoader.remove();
        this.themeLoader = null;
      }
      if (link.getAttribute("href") === href) {
        document.documentElement.setAttribute("data-theme", id);
        return;
      }
      const loader = document.createElement("link");
      loader.rel = "stylesheet";
      loader.href = href;
      loader.onload = () => {
        if (token !== this.themeToken) return;
        this.themeLoader = null;
        link.href = href;
        document.documentElement.setAttribute("data-theme", id);
        setTimeout(() => loader.remove(), 200);
      };
      loader.onerror = () => {
        if (token !== this.themeToken) return;
        this.themeLoader = null;
        loader.remove();
        console.error(`[sunrise] theme css failed to load, keeping the current theme: ${href}`);
      };
      this.themeLoader = loader;
      document.head.appendChild(loader);
    }
    appliedTrackColorIds = [];
    applyTrackColors(colors) {
      for (const id of this.appliedTrackColorIds) {
        document.documentElement.style.removeProperty(`--track-${id}`);
      }
      for (const c of colors) {
        document.documentElement.style.setProperty(`--track-${c.id}`, c.color);
      }
      this.appliedTrackColorIds = colors.map((c) => c.id);
    }
    setLang(lang) {
      document.documentElement.lang = lang;
    }
    // ----- labels --------------------------------------------------------------
    setText(id, text) {
      const el = this.$(id);
      if (el) el.textContent = text;
    }
    setAttr(id, name, value) {
      const el = this.$(id);
      if (el) el.setAttribute(name, value);
    }
    // ----- effects -------------------------------------------------------------
    celebrate() {
      const fx = this.$("fx");
      if (!fx) return;
      const flash = document.createElement("div");
      flash.className = "fx-flash";
      fx.appendChild(flash);
      setTimeout(() => {
        if (flash.parentNode) flash.parentNode.removeChild(flash);
      }, 650);
      for (let k = 0; k < 30; k++) {
        const p = document.createElement("span");
        p.className = "confetti-piece";
        p.style.left = Math.random() * 100 + "%";
        p.style.setProperty("--i", String(k));
        p.style.setProperty("--dx", (Math.random() * 2 - 1).toFixed(2));
        p.style.setProperty("--dy", Math.random().toFixed(2));
        p.style.setProperty("--rot", Math.floor(Math.random() * 720 - 360) + "deg");
        p.style.animationDelay = Math.random() * 0.2 + "s";
        fx.appendChild(p);
        setTimeout(() => {
          if (p.parentNode) p.parentNode.removeChild(p);
        }, 1900);
      }
    }
    toast(cls, html) {
      const fx = this.$("fx");
      if (!fx) return;
      const el = document.createElement("div");
      el.className = cls;
      el.innerHTML = html;
      fx.appendChild(el);
      setTimeout(() => el.classList.add("show"), 20);
      setTimeout(() => {
        el.classList.remove("show");
        setTimeout(() => {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 400);
      }, 3500);
    }
    badgeToast(newTrophyLabel, title, icon) {
      this.toast(
        "badge-toast",
        `<span class="bt-i">${this.esc(icon || "\u2022")}</span><span>${this.esc(newTrophyLabel)} <b>${this.esc(title)}</b></span>`
      );
    }
    // ----- load-fail fallback --------------------------------------------------
    stub(message, reasons) {
      const detail = reasons.length ? `<ul>${reasons.map((x) => `<li>${this.esc(x)}</li>`).join("")}</ul>` : "";
      document.body.innerHTML = `<div style="padding:24px;font:16px system-ui"><p>${this.esc(message)}</p>${detail}</div>`;
    }
  };

  // src/adapters/dom-controller.ts
  var DomController = class {
    t;
    r;
    activeModal = null;
    activeSheet = null;
    motdTimer = null;
    constructor(tracker, renderer) {
      this.t = tracker;
      this.r = renderer;
    }
    start() {
      this.applyStaticLabels();
      const href = this.t.activeThemeHref();
      if (href != null) this.r.applyTheme(href, this.t.activeThemeId() ?? "");
      this.r.applyTrackColors(this.t.trackColors());
      this.r.setLang(this.t.locale());
      this.wire();
      this.renderAll();
      this.startMotd();
    }
    // ----- labels --------------------------------------------------------------
    labels() {
      const u = (k) => this.t.ui(k);
      return {
        todayVert: u("todayVert"),
        restVert: u("restVert"),
        warmup: u("warmup"),
        reflect: u("reflect"),
        taskPlaceholder: u("taskPlaceholder"),
        nextDay: u("nextDay"),
        hint: u("hint"),
        copy: u("copy"),
        copyAi: u("copyAi"),
        overallTitle: u("overallTitle"),
        streakTitle: u("streakTitle"),
        inARow: u("inARow"),
        phasesTitle: u("phasesTitle"),
        tracksTitle: u("tracksTitle"),
        trophies: u("trophies"),
        newTrophy: u("newTrophy")
      };
    }
    applyStaticLabels() {
      const u = (k) => this.t.ui(k);
      const iconLabels = [
        ["exportBtn", "export"],
        ["importBtn", "import"],
        ["cardMapBtn", "cardMap"],
        ["trophiesBtn", "trophies"],
        ["prevDay", "prevDayAria"],
        ["nextDay", "nextDayAria"],
        ["cardMapClose", "scClose"],
        ["trophiesClose", "scClose"],
        ["shortcutsClose", "scClose"],
        ["dockMapBtn", "cardMap"],
        ["dockTrophiesBtn", "trophies"],
        ["dockMenuBtn", "menu"],
        ["dockBars", "summaryTitle"]
      ];
      for (const [id, key] of iconLabels) {
        this.r.setAttr(id, "aria-label", u(key));
        this.r.setAttr(id, "data-tip", u(key));
      }
      this.r.setAttr("packSelect", "aria-label", u("pack"));
      this.r.setAttr("themeSelect", "aria-label", u("theme"));
      this.r.setAttr("daySelect", "aria-label", this.t.itemLabel());
      this.r.setText("summaryTitle", u("summaryTitle"));
      this.r.setText("todayTitle", u("todayTitle"));
    }
    // ----- render --------------------------------------------------------------
    renderAll() {
      const lbl = this.labels();
      const today = this.t.todayCard();
      this.r.renderSelectors(this.t.selectors());
      this.r.renderToday(today, lbl);
      this.r.renderDashboard(this.t.dashboard(), lbl);
      this.renderComeback();
      this.renderTrophies();
      this.bindTodayHandlers(today);
      this.syncDayNav();
    }
    renderComeback() {
      const cb = this.t.comeback();
      const text = this.t.ui("comeback").replace("{n}", String(cb.days));
      this.r.renderComeback({ show: cb.show, text });
    }
    renderTrophies() {
      this.r.renderTrophies(this.t.trophies(), this.t.ui("trophies"));
    }
    renderCardMap() {
      this.r.renderCardMap(this.t.cardMap(), this.t.ui("cardMap"));
    }
    openCardMap() {
      this.renderCardMap();
      this.open("cardMapModal");
    }
    openTrophies() {
      this.renderTrophies();
      this.open("trophiesModal");
    }
    renderShortcuts() {
      const u = (k) => this.t.ui(k);
      this.r.renderShortcuts(
        [
          { keys: "\u2190 / \u2192", label: u("scDay") },
          { keys: "\u2191 / \u2193", label: u("scTick") },
          { keys: "Enter", label: u("scMark") },
          { keys: "M", label: u("scMap") },
          { keys: "T", label: u("scTrophies") },
          { keys: "?", label: u("scHelp") },
          { keys: "Esc", label: u("scClose") }
        ],
        u("shortcuts")
      );
    }
    // ----- today-card handlers (re-bound on every render) ----------------------
    bindTodayHandlers(vm) {
      const cta = this.r.$("nextDayCta");
      if (cta) cta.onclick = () => this.go(1);
      if (vm.rest) return;
      for (const t of vm.tasks) {
        const cb = this.r.$("cb_" + t.id);
        if (cb) {
          cb.onchange = (e) => this.setTaskChecked(t.id, e.target.checked);
        }
        this.bindCopy("copy_" + t.id, () => t.text, false);
        this.bindCopy("copyai_" + t.id, () => this.t.aiPrompt(t.text, t.guidance), true);
      }
      if (vm.show.warmup && vm.warmup) {
        const warmup = vm.warmup;
        this.bindCopy("copyWarm", () => warmup, false);
        this.bindCopy("copyaiWarm", () => this.t.aiPrompt(warmup), true);
      }
      if (vm.show.reflection) {
        const reflect = this.r.$("reflect");
        if (reflect) {
          reflect.oninput = (e) => {
            this.t.setReflection(e.target.value);
          };
        }
      }
    }
    // ----- copy / AI-copy -------------------------------------------------------
    bindCopy(id, text, ai) {
      const el = this.r.$(id);
      if (!el) return;
      el.onclick = () => {
        this.copyText(text());
        this.r.toast("toast", this.r.esc(this.t.ui(ai ? "copiedAi" : "copied")));
      };
    }
    // Seam for tests (the fake DOM has no clipboard); the default writes through
    // navigator.clipboard with a hidden-textarea fallback for older engines.
    copyText = (text) => {
      const nav = globalThis.navigator;
      const write = nav?.clipboard?.writeText(text);
      if (write) write.catch(() => this.copyFallback(text));
      else this.copyFallback(text);
    };
    copyFallback(text) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
      }
      document.body.removeChild(ta);
    }
    setTaskChecked(taskId, checked) {
      const was = this.t.todayCard().complete;
      const res = this.t.setTaskDone(taskId, checked);
      if (!was && this.t.todayCard().complete) {
        this.r.celebrate();
        if (res.unlockedBadges.length) {
          const tro = this.t.trophies().find((x) => x.id === res.unlockedBadges[0]);
          if (tro) this.r.badgeToast(this.t.ui("newTrophy"), tro.title, tro.icon);
        }
        if (res.surprise) this.r.toast("toast", this.r.esc(res.surprise));
      }
      this.renderAll();
      this.r.focusTask(taskId);
    }
    syncDayNav() {
      const sel = this.t.selectors();
      const i = sel.items.findIndex((o) => o.selected);
      const prev = this.r.$("prevDay");
      const next = this.r.$("nextDay");
      if (prev) prev.disabled = i <= 0;
      if (next) next.disabled = i >= sel.items.length - 1;
    }
    go(delta, scroll = true) {
      this.t.goToItem(delta);
      this.renderAll();
      if (!scroll) return;
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
      }
    }
    // ----- keyboard ------------------------------------------------------------
    handleKeydown(e) {
      const key = e.key;
      if (key === "Escape") {
        if (this.activeModal) this.closeActiveModal();
        else this.closeSheets();
        return;
      }
      if (this.activeModal) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (this.r.isTypingTarget()) return;
      switch (key) {
        case "ArrowLeft":
          this.go(-1, false);
          e.preventDefault();
          break;
        case "ArrowRight":
          this.go(1, false);
          e.preventDefault();
          break;
        case "ArrowDown":
          this.moveTaskFocus(1);
          e.preventDefault();
          break;
        case "ArrowUp":
          this.moveTaskFocus(-1);
          e.preventDefault();
          break;
        case "Enter": {
          const id = this.r.activeTaskId();
          if (id) {
            this.setTaskChecked(id, !this.taskDone(id));
            e.preventDefault();
          }
          break;
        }
        case "?":
          this.renderShortcuts();
          this.open("shortcutsModal");
          break;
        default: {
          const k = key.toLowerCase();
          if (k === "m" || e.code === "KeyM") {
            this.openCardMap();
          } else if (k === "t" || e.code === "KeyT") {
            this.openTrophies();
          }
        }
      }
    }
    taskDone(taskId) {
      return this.t.todayCard().tasks.find((t) => t.id === taskId)?.done ?? false;
    }
    moveTaskFocus(delta) {
      const card = this.t.todayCard();
      if (card.rest) return;
      const ids = card.tasks.map((t) => t.id);
      if (!ids.length) return;
      const cur = this.r.activeTaskId();
      let i = cur ? ids.indexOf(cur) : -1;
      if (i < 0) i = delta > 0 ? 0 : ids.length - 1;
      else i = Math.min(Math.max(i + delta, 0), ids.length - 1);
      this.r.focusTask(ids[i], true);
    }
    // ----- wiring (port of app.js init()) --------------------------------------
    wire() {
      const pack = this.r.$("packSelect");
      if (pack) {
        pack.onchange = () => {
          this.closeSheets();
          this.t.selectPack(pack.value);
          this.r.applyTrackColors(this.t.trackColors());
          this.r.setLang(this.t.locale());
          this.applyStaticLabels();
          this.startMotd();
          this.renderAll();
        };
      }
      const theme = this.r.$("themeSelect");
      if (theme) {
        theme.onchange = () => {
          this.closeSheets();
          this.t.selectTheme(theme.value);
          const href = this.t.activeThemeHref();
          if (href != null) this.r.applyTheme(href, theme.value);
        };
      }
      const day = this.r.$("daySelect");
      if (day) {
        day.onchange = () => {
          this.closeSheets();
          this.t.selectItem(day.value);
          this.renderAll();
        };
      }
      const cardMapBtn = this.r.$("cardMapBtn");
      if (cardMapBtn) cardMapBtn.onclick = () => this.openCardMap();
      this.bindClose("cardMapClose", "cardMapModal");
      this.bindBackdrop("cardMapModal");
      const cardMapGrid = this.r.$("cardMapGrid");
      if (cardMapGrid) {
        cardMapGrid.onclick = (e) => {
          const id = e.target.dataset?.id;
          if (!id) return;
          this.t.selectItem(id);
          this.closeActiveModal();
          this.renderAll();
        };
      }
      const trBtn = this.r.$("trophiesBtn");
      if (trBtn) trBtn.onclick = () => this.openTrophies();
      this.bindClose("trophiesClose", "trophiesModal");
      this.bindBackdrop("trophiesModal");
      this.bindClose("shortcutsClose", "shortcutsModal");
      this.bindBackdrop("shortcutsModal");
      document.addEventListener("keydown", (e) => this.handleKeydown(e));
      const prev = this.r.$("prevDay");
      if (prev) prev.onclick = () => this.go(-1);
      const next = this.r.$("nextDay");
      if (next) next.onclick = () => this.go(1);
      const exportBtn = this.r.$("exportBtn");
      if (exportBtn) {
        exportBtn.onclick = () => {
          this.closeSheets();
          const blob = new Blob([this.t.exportProgress()], { type: "application/json" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = this.t.activePackId() + "-progress.json";
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 1e3);
        };
      }
      const importBtn = this.r.$("importBtn");
      const importFile = this.r.$("importFile");
      if (importBtn && importFile) {
        importBtn.onclick = () => importFile.click();
        importFile.onchange = (e) => {
          this.closeSheets();
          const f = e.target.files?.[0];
          if (!f) return;
          const rd = new FileReader();
          rd.onload = () => {
            try {
              this.t.importProgress(String(rd.result));
              this.renderAll();
              alert(this.t.ui("importOk"));
            } catch (err) {
              if (err instanceof ImportError || err instanceof ValidationError) {
                alert(this.t.ui("importFail").replace("{e}", err.message));
              } else {
                throw err;
              }
            }
          };
          rd.readAsText(f);
          e.target.value = "";
        };
      }
      const dockMap = this.r.$("dockMapBtn");
      if (dockMap) dockMap.onclick = () => this.openCardMap();
      const dockTrophies = this.r.$("dockTrophiesBtn");
      if (dockTrophies) dockTrophies.onclick = () => this.openTrophies();
      const dockMenu = this.r.$("dockMenuBtn");
      if (dockMenu) dockMenu.onclick = () => this.toggleSheet("menu");
      const dockBars = this.r.$("dockBars");
      if (dockBars) dockBars.onclick = () => this.toggleSheet("stats");
      const todayCard = this.r.$("todayCard");
      if (todayCard) {
        let sx = 0;
        let sy = 0;
        todayCard.ontouchstart = (e) => {
          const t = e.changedTouches[0];
          if (!t) return;
          sx = t.clientX;
          sy = t.clientY;
        };
        todayCard.ontouchend = (e) => {
          if (this.activeModal || this.r.isTypingTarget()) return;
          const t = e.changedTouches[0];
          if (!t) return;
          const dx = t.clientX - sx;
          const dy = t.clientY - sy;
          if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.5) this.go(dx < 0 ? 1 : -1);
        };
      }
    }
    open(id) {
      this.closeSheets();
      if (this.activeModal && this.activeModal !== id) this.closeActiveModal();
      const el = this.r.$(id);
      if (el) {
        el.classList.add("open");
        this.activeModal = id;
        const btn = typeof el.querySelector === "function" ? el.querySelector("button") : null;
        if (btn && typeof btn.focus === "function") btn.focus();
      }
    }
    closeActiveModal() {
      if (!this.activeModal) return;
      const el = this.r.$(this.activeModal);
      if (el) el.classList.remove("open");
      this.activeModal = null;
    }
    toggleSheet(which) {
      const next = this.activeSheet === which ? null : which;
      const toolbar = this.r.$("toolbar");
      if (toolbar) toolbar.classList[next === "menu" ? "add" : "remove"]("open");
      const dash = this.r.$("dashboard");
      if (dash) dash.classList[next === "stats" ? "add" : "remove"]("open");
      this.activeSheet = next;
    }
    closeSheets() {
      if (this.activeSheet) this.toggleSheet(this.activeSheet);
    }
    bindClose(btnId, modalId) {
      const btn = this.r.$(btnId);
      if (btn) {
        btn.onclick = () => {
          if (this.activeModal === modalId) this.closeActiveModal();
        };
      }
    }
    bindBackdrop(modalId) {
      const m = this.r.$(modalId);
      if (m) {
        m.onclick = (e) => {
          if (e.target.id === modalId) this.closeActiveModal();
        };
      }
    }
    // ----- motd ----------------------------------------------------------------
    // Re-entrant: a pack switch calls this again with the new pack's mottos.
    startMotd() {
      if (this.motdTimer != null) {
        clearInterval(this.motdTimer);
        this.motdTimer = null;
      }
      const mottos = this.t.mottos();
      if (!mottos.length) return;
      this.r.setText("motd", mottos[0]);
      if (mottos.length > 1) {
        let i = 0;
        this.motdTimer = setInterval(() => {
          const el = this.r.$("motd");
          if (!el) return;
          el.classList.add("motd-out");
          setTimeout(() => {
            i = (i + 1) % mottos.length;
            el.textContent = mottos[i];
            el.classList.remove("motd-out");
          }, 600);
        }, 6e3);
      }
    }
  };

  // src/adapters/mobile-mode.ts
  var MOBILE_BREAKPOINT_PX = 640;
  function watchMobileMode(matchMedia, root) {
    const mq = matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`);
    const apply = (m) => {
      if (m) root.setAttribute("data-mobile", "1");
      else root.removeAttribute("data-mobile");
    };
    apply(mq.matches);
    mq.addEventListener("change", (e) => apply(e.matches));
  }

  // src/main.ts
  var registry = new WindowPluginRegistry();
  registry.addBuiltinThemes(BUILTIN_THEMES);
  window.SUNRISE = {
    registerPack: (p) => registry.registerPack(p),
    registerTheme: (t) => registry.registerTheme(t)
  };
  watchMobileMode((q) => window.matchMedia(q), document.documentElement);
  function boot() {
    const renderer = new DomRenderer();
    try {
      migrateLegacy();
      const streaks = new Streaks();
      const stats = new ProgressStats();
      const tracker = new Tracker({
        packs: registry,
        themes: registry,
        progressStore: new LocalStorageProgressStore(),
        sessionStore: new LocalStorageSessionStore(),
        clock: new SystemClock(),
        random: new MathRandom(),
        streaks,
        stats,
        badges: new BadgeEngine(streaks, stats),
        defaultUi: DEFAULT_UI,
        genericBadges: GENERIC_BADGES,
        defaultStreakWords: DEFAULT_STREAK_WORDS,
        defaultMottos: DEFAULT_MOTTOS
      });
      tracker.init();
      new DomController(tracker, renderer).start();
    } catch (err) {
      console.error("[sunrise] boot failed:", err);
      renderer.stub(
        "Failed to start. Check that dist/sunrise.js and data/packs/* sit next to index.html; details below and in the console.",
        [
          ...registry.rejected().map(
            (r) => `${r.kind} "${r.id}": ${r.issues.map((i) => `${i.path} ${i.msg}`).join(", ")}`
          ),
          `error: ${String(err)}`
        ]
      );
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
//# sourceMappingURL=sunrise.js.map
