import type { Pack, Item, Group, Track, Localized } from './types/entities.ts';
import type { BadgeRule } from './types/badge-rule.ts';
import type { TrackerDeps } from './types/tracker.ts';
import { Progress } from './progress.ts';
import { ProgressValidator } from './validators.ts';
import { ImportError } from './errors.ts';
import { tr, DEFAULT_LANG } from './i18n.ts';
import { pluralIndex } from './plural.ts';
import type {
  TodayVM,
  DashboardVM,
  CardMapVM,
  TrophyVM,
  SelectorsVM,
  CompleteResult,
  TrackColor,
  TaskVM,
} from './types/view-models.ts';

const SURPRISE_CHANCE = 0.12;

export class Tracker {
  private deps: TrackerDeps;
  private pack!: Pack;
  private progress!: Progress;
  private themeId: string | null = null;
  private currentItemId = '';
  private rules: readonly BadgeRule[] = [];
  private allItems: Item[] = [];
  private groupOfItem: Record<string, Group> = {};
  private mottosList: readonly Localized[] = [];
  private lang: string = DEFAULT_LANG;

  constructor(deps: TrackerDeps) {
    this.deps = deps;
  }

  // ----- lifecycle -----------------------------------------------------------

  public init(): void {
    const packs = this.deps.packs.packs();
    if (packs.length === 0) throw new Error('no packs registered');
    const sess = this.deps.sessionStore.load();
    this.lang = sess.lang ?? DEFAULT_LANG;
    const pack = packs.find((p) => p.id === sess.activePackId) ?? packs[0]!;
    this.loadPack(pack.id);
    const themes = this.deps.themes.themes();
    const theme = themes.find((t) => t.id === sess.themeId) ?? themes[0];
    this.themeId = theme ? theme.id : null;
    this.currentItemId = this.resumeItemId();
  }

  private loadPack(packId: string): void {
    const packs = this.deps.packs.packs();
    this.pack = packs.find((p) => p.id === packId) ?? packs[0]!;
    this.progress = this.deps.progressStore.load(this.pack.id);
    // Last wins, so a pack badge reusing a generic id overrides both its
    // condition and its displayed title/desc/icon.
    const byId = new Map<string, BadgeRule>();
    for (const r of [...this.deps.genericBadges, ...(this.pack.badges ?? [])]) byId.set(r.id, r);
    this.rules = [...byId.values()];
    this.allItems = this.pack.groups.flatMap((g) => [...g.items]);
    this.groupOfItem = {};
    for (const g of this.pack.groups) for (const it of g.items) this.groupOfItem[it.id] = g;
    this.mottosList =
      this.pack.mottos && this.pack.mottos.length ? this.pack.mottos : this.deps.defaultMottos;
    if (this.progress.reconcile(this.allItems)) this.save();
  }

  private save(): void {
    this.deps.progressStore.save(this.pack.id, this.progress);
  }

  // ----- helpers -------------------------------------------------------------

  private uiText(k: string): string {
    const fromPack = this.pack.ui && this.pack.ui[k];
    if (fromPack != null) return tr(fromPack, this.lang);
    const def = this.deps.defaultUi[k];
    return def != null ? tr(def, this.lang) : '';
  }
  private lbl(
    k: keyof NonNullable<NonNullable<Pack['settings']>['labels']>,
    fallbackKey: string,
  ): string {
    const l = this.pack.settings && this.pack.settings.labels;
    const v = l && l[k];
    return v != null ? tr(v, this.lang) : this.uiText(fallbackKey);
  }
  private itemOf(id: string): Item {
    const it = this.allItems.find((x) => x.id === id);
    if (!it) throw new Error(`unknown item "${id}"`);
    return it;
  }
  // Unlike itemOf this never throws: the implicit "rest" track is undeclared by design.
  private trackMeta(id: string): Track {
    for (const t of this.pack.tracks) if (t.id === id) return t;
    return { id, label: '', icon: '' };
  }
  // The card to open on load: the first unfinished card at or after the stored
  // cursor (so a partial card resumes; a finished one advances to the next). No
  // valid cursor → scan from the start (first unfinished). Forward-only — an
  // earlier skip is never auto-reopened; the card map is for revisiting those.
  private resumeItemId(): string {
    const storedId = this.deps.sessionStore.load().cursors?.[this.pack.id];
    const at = storedId ? this.allItems.findIndex((it) => it.id === storedId) : -1;
    for (let j = at >= 0 ? at : 0; j < this.allItems.length; j++) {
      const it = this.allItems[j]!;
      if (!it.rest && !this.progress.isItemComplete(it)) return it.id;
    }
    return this.allItems[this.allItems.length - 1]!.id;
  }

  private persistCursor(): void {
    const sess = this.deps.sessionStore.load();
    sess.cursors = { ...(sess.cursors ?? {}), [this.pack.id]: this.currentItemId };
    this.deps.sessionStore.save(sess);
  }
  private itemIndex(): number {
    return this.allItems.findIndex((it) => it.id === this.currentItemId);
  }
  private groupOrdinal(id: string): number {
    return this.pack.groups.indexOf(this.groupOfItem[id]!) + 1;
  }
  // Badge awards must stick the moment a trophy shows as earned, so every
  // progress mutation syncs awards — not just item completion (which also toasts).
  private syncBadges(): string[] {
    return this.deps.badges.sync(this.pack, this.progress, this.rules, this.deps.clock.today());
  }

  // ----- intents -------------------------------------------------------------

  public setTaskDone(taskId: string, done: boolean): CompleteResult {
    const item = this.itemOf(this.currentItemId);
    const wasComplete = this.progress.isItemComplete(item);
    this.progress.setTaskDone(item, taskId, done, this.deps.clock.today(), this.deps.clock.hour());
    if (!wasComplete && this.progress.isItemComplete(item)) return this.onItemCompleted();
    this.syncBadges();
    this.save();
    return { unlockedBadges: [] };
  }

  private onItemCompleted(): CompleteResult {
    const unlocked = this.syncBadges();
    this.save();
    const result: CompleteResult = { unlockedBadges: unlocked };
    if (this.deps.random.next() < SURPRISE_CHANCE) {
      const pool = this.pack.surprises ?? [];
      const msg = pool.length ? pool[Math.floor(this.deps.random.next() * pool.length)] : undefined;
      if (msg) result.surprise = tr(msg, this.lang);
    }
    return result;
  }

  public setReflection(text: string): void {
    this.progress.setReflection(this.currentItemId, text);
    this.syncBadges();
    this.save();
  }

  public selectItem(id: string): void {
    this.currentItemId = id;
    this.persistCursor();
  }

  public goToItem(delta: number): void {
    const i = this.itemIndex();
    const j = Math.min(Math.max(i + delta, 0), this.allItems.length - 1);
    if (j !== i) {
      this.currentItemId = this.allItems[j]!.id;
      this.persistCursor();
    }
  }

  public selectPack(id: string): void {
    const sess = this.deps.sessionStore.load();
    sess.activePackId = id;
    this.deps.sessionStore.save(sess);
    this.loadPack(id);
    this.currentItemId = this.resumeItemId();
  }

  public selectTheme(id: string): void {
    const sess = this.deps.sessionStore.load();
    sess.themeId = id;
    this.deps.sessionStore.save(sess);
    this.themeId = id;
  }

  public setLang(id: string): void {
    const sess = this.deps.sessionStore.load();
    sess.lang = id;
    this.deps.sessionStore.save(sess);
    this.lang = id;
  }

  public importProgress(json: string): void {
    let raw: unknown;
    try {
      raw = JSON.parse(json);
    } catch {
      throw new ImportError('Invalid JSON');
    }
    // Exports embed the pack id; a file from another pack would silently wipe
    // this pack's progress (old exports without packId are accepted as-is).
    const filePackId =
      raw && typeof raw === 'object' ? (raw as Record<string, unknown>)['packId'] : undefined;
    if (typeof filePackId === 'string' && filePackId !== this.pack.id) {
      throw new ImportError(`file is for pack "${filePackId}", active pack is "${this.pack.id}"`);
    }
    const data = new ProgressValidator().parse(raw);
    this.progress = new Progress(data);
    // Same healing as loadPack: the file's completedAt may disagree with its
    // task checks under the current pack version (streaks vs dashboard).
    this.progress.reconcile(this.allItems);
    this.save();
    this.currentItemId = this.resumeItemId();
  }

  public exportProgress(): string {
    return JSON.stringify({ packId: this.pack.id, ...this.progress.toJSON() }, null, 2);
  }

  // ----- queries -------------------------------------------------------------

  public selectors(): SelectorsVM {
    const packs = this.deps.packs.packs().map((p) => ({
      id: p.id,
      label: tr(p.name, this.lang),
      selected: p.id === this.pack.id,
    }));
    // Theme names are fixed brand strings and are not localized.
    const themes = this.deps.themes.themes().map((t) => ({
      id: t.id,
      label: t.name,
      selected: t.id === this.themeId,
    }));
    const items = this.allItems.map((it) => {
      const g = this.groupOfItem[it.id]!;
      const tl = it.rest ? this.uiText('restVert') : tr(this.trackMeta(it.track).label, this.lang);
      return {
        id: it.id,
        label: `${tr(g.title, this.lang)} · ${tl}`,
        selected: it.id === this.currentItemId,
      };
    });
    return { packs, themes, items };
  }

  public todayCard(): TodayVM {
    const it = this.itemOf(this.currentItemId);
    const m = this.trackMeta(it.track);
    const g = this.groupOfItem[it.id]!;
    const cfg = this.pack.settings ?? {};
    const i = this.itemIndex();
    const notLast = i < this.allItems.length - 1;
    const phaseLabel = this.uiText('phaseLabel')
      .replace('{p}', g.phase == null ? '' : g.phase)
      .replace('{w}', String(this.groupOrdinal(it.id)));

    if (it.rest) {
      return {
        itemId: it.id,
        rest: true,
        track: it.track,
        trackLabel: tr(m.label, this.lang),
        trackIcon: m.icon ?? '',
        title: this.uiText('restTitle'),
        phaseLabel,
        reflectPrompt: it.reflectPrompt != null ? tr(it.reflectPrompt, this.lang) : undefined,
        reflection: '',
        tasks: [],
        resources: [],
        complete: false,
        notLast,
        show: { warmup: false, reflection: false },
      };
    }

    const complete = this.progress.isItemComplete(it);
    const tasks: TaskVM[] = (it.tasks ?? []).map((t) => ({
      id: t.id,
      text: tr(t.text, this.lang),
      ...(t.guidance !== undefined ? { guidance: tr(t.guidance, this.lang) } : {}),
      done: this.progress.taskChecked(it.id, t.id),
    }));
    const showWarmup = cfg.warmups !== false && it.warmup != null;
    const showReflection = cfg.reflections !== false;
    return {
      itemId: it.id,
      rest: false,
      track: it.track,
      trackLabel: tr(m.label, this.lang),
      trackIcon: m.icon ?? '',
      title: it.title != null ? tr(it.title, this.lang) : '',
      phaseLabel,
      warmup: it.warmup != null ? tr(it.warmup, this.lang) : undefined,
      reflectPrompt: it.reflectPrompt != null ? tr(it.reflectPrompt, this.lang) : undefined,
      reflection: this.progress.reflection(it.id),
      tasks,
      resources: (it.resources ?? []).map((r) => ({
        label: tr(r.label, this.lang),
        note: tr(r.note, this.lang),
      })),
      complete,
      notLast,
      show: { warmup: showWarmup, reflection: showReflection },
    };
  }

  public dashboard(): DashboardVM {
    const overall = this.deps.stats.overall(this.pack, this.progress);
    const streak = this.deps.streaks.current(this.progress, this.deps.clock.today());
    const byPhase = this.deps.stats.byPhase(this.pack, this.progress);
    const byTrack = this.deps.stats.byTrack(this.pack, this.progress);
    const words =
      this.deps.defaultStreakWords[this.lang] ?? this.deps.defaultStreakWords[DEFAULT_LANG] ?? [];
    const streakWord = words[pluralIndex(this.lang, streak)] ?? words[words.length - 1] ?? '';
    const phaseList = this.pack.phases ?? [];
    const phases = phaseList.length
      ? phaseList.map((ph) => ({
          id: ph.id,
          title: tr(ph.title, this.lang) || `${this.lbl('phase', 'phaseWord')} ${ph.id}`,
          stat: byPhase[ph.id] ?? { done: 0, total: 0, pct: 0 },
        }))
      : null;
    const tracks = this.pack.tracks
      .filter((t) => byTrack[t.id])
      .map((t) => ({ id: t.id, label: tr(t.label, this.lang), stat: byTrack[t.id]! }));
    return {
      overall,
      streak,
      streakWord,
      phases,
      tracks,
      daysOfLabel: this.uiText('daysOf').replace('{n}', String(overall.total)),
    };
  }

  public cardMap(): CardMapVM {
    const overall = this.deps.stats.overall(this.pack, this.progress);
    const groups = this.pack.groups.map((g) => ({
      id: g.id,
      title: tr(g.title, this.lang),
      items: g.items.map((it) => ({
        id: it.id,
        title: it.title != null ? tr(it.title, this.lang) : '',
        done: this.progress.isItemComplete(it),
        rest: !!it.rest,
        current: it.id === this.currentItemId,
      })),
    }));
    return { done: overall.done, total: overall.total, groups };
  }

  public trophies(): TrophyVM[] {
    const all = this.deps.badges.evaluate(this.pack, this.progress, this.rules);
    return all.map((b) => {
      const meta = this.rules.find((r) => r.id === b.id);
      return {
        id: b.id,
        title: meta ? tr(meta.title, this.lang) : b.id,
        desc: tr(meta?.desc, this.lang),
        icon: meta?.icon ?? '•',
        unlocked: b.unlocked,
      };
    });
  }

  public comeback(): { show: boolean; days: number } {
    const today = this.deps.clock.today();
    const b = this.deps.badges
      .evaluate(this.pack, this.progress, this.rules)
      .find((x) => x.id === 'comeback');
    const streak = this.deps.streaks.current(this.progress, today);
    // streak <= 2: greet only during the first couple of days back, then get out of the way.
    const show = !!(b && b.unlocked && streak <= 2);
    return { show, days: this.progress.completedCount() };
  }

  public trackColors(): TrackColor[] {
    const out: TrackColor[] = [];
    for (const t of this.pack.tracks) if (t.color) out.push({ id: t.id, color: t.color });
    return out;
  }

  public mottos(): readonly string[] {
    return this.mottosList.map((m) => tr(m, this.lang));
  }

  public ui(key: string): string {
    return this.uiText(key);
  }

  // Pre-prompt for the "AI copy" button: the task/warmup text wrapped in a
  // tutor template with the current item's context, ready to paste into a chat.
  public aiPrompt(text: string, guidance?: string): string {
    const it = this.itemOf(this.currentItemId);
    const g = guidance
      ? `\n${this.uiText('aiPromptGuidance').replace('{guidance}', guidance)}\n`
      : '';
    return this.uiText('aiPrompt')
      .replace('{title}', it.title != null ? tr(it.title, this.lang) : '')
      .replace('{track}', tr(this.trackMeta(it.track).label, this.lang))
      .replace('{text}', text)
      .replace('{guidance}', g);
  }

  public itemLabel(): string {
    return this.lbl('item', 'weekAbbr');
  }

  public activeThemeHref(): string | null {
    const theme = this.deps.themes.themes().find((t) => t.id === this.themeId);
    return theme?.cssHref ?? null;
  }

  public activeThemeId(): string | null {
    return this.themeId;
  }

  public activePackId(): string {
    return this.pack.id;
  }

  public currentLang(): string {
    return this.lang;
  }

  public langs(): readonly { id: string; label: string }[] {
    return this.deps.supportedLangs;
  }
}
