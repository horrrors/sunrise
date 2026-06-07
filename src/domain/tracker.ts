import type { Pack, Item, Group, Track } from './types/entities.ts';
import type { BadgeRule } from './types/badge-rule.ts';
import type { TrackerDeps } from './types/tracker.ts';
import { Progress } from './progress.ts';
import { ProgressValidator } from './validators.ts';
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
  private groupById: Record<string, Group> = {};
  private mottosList: readonly string[] = [];

  constructor(deps: TrackerDeps) {
    this.deps = deps;
  }

  // ----- lifecycle -----------------------------------------------------------

  public init(): void {
    const packs = this.deps.packs.packs();
    if (packs.length === 0) throw new Error('no packs registered');
    const sess = this.deps.sessionStore.load();
    const pack = packs.find((p) => p.id === sess.activePackId) ?? packs[0]!;
    this.loadPack(pack.id);
    const themes = this.deps.themes.themes();
    const theme = themes.find((t) => t.id === sess.themeId) ?? themes[0];
    this.themeId = theme ? theme.id : null;
    this.currentItemId = this.defaultItemId();
  }

  private loadPack(packId: string): void {
    const packs = this.deps.packs.packs();
    this.pack = packs.find((p) => p.id === packId) ?? packs[0]!;
    this.progress = this.deps.progressStore.load(this.pack.id);
    this.rules = [...this.deps.genericBadges, ...(this.pack.badges ?? [])];
    this.allItems = this.pack.groups.flatMap((g) => [...g.items]);
    this.groupById = {};
    for (const g of this.pack.groups) for (const it of g.items) this.groupById[it.id] = g;
    this.mottosList =
      this.pack.mottos && this.pack.mottos.length ? this.pack.mottos : this.deps.defaultMottos;
  }

  private save(): void {
    this.deps.progressStore.save(this.pack.id, this.progress);
  }

  // ----- helpers -------------------------------------------------------------

  private uiText(k: string): string {
    const fromPack = this.pack.ui && this.pack.ui[k];
    if (fromPack != null) return fromPack;
    return this.deps.defaultUi[k] ?? '';
  }
  private lbl(k: keyof NonNullable<NonNullable<Pack['settings']>['labels']>, fallback: string): string {
    const l = this.pack.settings && this.pack.settings.labels;
    const v = l && l[k];
    return v != null ? v : this.uiText(fallback);
  }
  private itemOf(id: string): Item {
    const it = this.allItems.find((x) => x.id === id);
    if (!it) throw new Error(`unknown item "${id}"`);
    return it;
  }
  private trackMeta(id: string): Track {
    for (const t of this.pack.tracks) if (t.id === id) return t;
    return { id, label: '', icon: '' };
  }
  private defaultItemId(): string {
    const open = this.allItems.find((it) => !it.rest && !this.progress.isItemComplete(it));
    return (open ?? this.allItems[this.allItems.length - 1]!).id;
  }
  private itemIndex(): number {
    return this.allItems.findIndex((it) => it.id === this.currentItemId);
  }
  private groupOrdinal(id: string): number {
    return this.pack.groups.indexOf(this.groupById[id]!) + 1;
  }

  // ----- intents -------------------------------------------------------------

  public toggleTask(taskId: string, done: boolean): CompleteResult {
    const item = this.itemOf(this.currentItemId);
    const wasComplete = this.progress.isItemComplete(item);
    this.progress.setTaskDone(item, taskId, done, this.deps.clock.today(), this.deps.clock.hour());
    if (!wasComplete && this.progress.isItemComplete(item)) return this.onItemCompleted();
    this.save();
    return { unlockedBadges: [] };
  }

  private onItemCompleted(): CompleteResult {
    const today = this.deps.clock.today();
    const unlocked = this.deps.badges.sync(this.pack, this.progress, this.rules, today);
    let surprise: string | undefined;
    if (this.deps.random.next() < SURPRISE_CHANCE) {
      const pool = this.pack.surprises ?? [];
      const msg = pool.length ? pool[Math.floor(this.deps.random.next() * pool.length)] : undefined;
      if (msg) {
        this.progress.setLastSurprise({ text: msg, at: today });
        surprise = msg;
      }
    }
    this.save();
    return surprise === undefined ? { unlockedBadges: unlocked } : { unlockedBadges: unlocked, surprise };
  }

  public setReflection(text: string): void {
    this.progress.setReflection(this.currentItemId, text);
    this.save();
  }

  public selectItem(id: string): void {
    this.currentItemId = id;
  }

  public goToItem(delta: number): void {
    const i = this.itemIndex();
    const j = Math.min(Math.max(i + delta, 0), this.allItems.length - 1);
    if (j !== i) this.currentItemId = this.allItems[j]!.id;
  }

  public selectPack(id: string): void {
    const sess = this.deps.sessionStore.load();
    sess.activePackId = id;
    this.deps.sessionStore.save(sess);
    this.loadPack(id);
    this.currentItemId = this.defaultItemId();
  }

  public selectTheme(id: string): void {
    const sess = this.deps.sessionStore.load();
    sess.themeId = id;
    this.deps.sessionStore.save(sess);
    this.themeId = id;
  }

  public scheduleReviewForCurrent(): void {
    const it = this.itemOf(this.currentItemId);
    const g = this.groupById[it.id]!;
    const reviewId = g.id + '-' + (it.title || it.id);
    this.deps.reviews.schedule(this.progress, reviewId, this.deps.clock.today());
    this.save();
  }

  public importProgress(json: string): void {
    const data = new ProgressValidator().parseJson(json);
    this.progress = new Progress(data);
    this.save();
    this.currentItemId = this.defaultItemId();
  }

  public exportProgress(): string {
    return JSON.stringify(this.progress.toJSON(), null, 2);
  }

  // ----- queries -------------------------------------------------------------

  public selectors(): SelectorsVM {
    const packs = this.deps.packs.packs().map((p) => ({
      id: p.id,
      label: p.name,
      selected: p.id === this.pack.id,
    }));
    const themes = this.deps.themes.themes().map((t) => ({
      id: t.id,
      label: t.name,
      selected: t.id === this.themeId,
    }));
    const items = this.allItems.map((it) => {
      const g = this.groupById[it.id]!;
      const tl = it.rest ? this.uiText('restVert') : this.trackMeta(it.track).label;
      return { id: it.id, label: `${g.title} · ${tl}`, selected: it.id === this.currentItemId };
    });
    return { packs, themes, items };
  }

  public todayCard(): TodayVM {
    const it = this.itemOf(this.currentItemId);
    const m = this.trackMeta(it.track);
    const g = this.groupById[it.id]!;
    const cfg = this.pack.settings ?? {};
    const i = this.itemIndex();
    const notLast = i < this.allItems.length - 1;
    const phaseLabel = this.uiText('phaseLabel')
      .replace('{p}', g.phase == null ? '' : g.phase)
      .replace('{w}', String(this.groupOrdinal(it.id)));

    if (it.rest) {
      const dueReviews = cfg.reviews
        ? this.deps.reviews.due(this.progress, this.deps.clock.today())
        : [];
      return {
        itemId: it.id,
        rest: true,
        track: it.track,
        trackLabel: m.label,
        trackIcon: m.icon ?? '',
        title: this.uiText('restTitle'),
        phaseLabel,
        reflectPrompt: it.reflectPrompt,
        reflection: '',
        tasks: [],
        resources: [],
        reviewable: false,
        dueReviews,
        complete: false,
        notLast,
        show: { warmup: false, reflection: false, review: false },
      };
    }

    const complete = this.progress.isItemComplete(it);
    const tasks: TaskVM[] = (it.tasks ?? []).map((t) => ({
      id: t.id,
      text: t.text,
      ...(t.guidance !== undefined ? { guidance: t.guidance } : {}),
      done: this.progress.taskChecked(it.id, t.id),
    }));
    const showWarmup = cfg.warmups !== false && it.warmup != null;
    const showReflection = cfg.reflections !== false;
    const showReview = !!(m.reviewable && cfg.reviews);
    return {
      itemId: it.id,
      rest: false,
      track: it.track,
      trackLabel: m.label,
      trackIcon: m.icon ?? '',
      title: it.title ?? '',
      phaseLabel,
      warmup: it.warmup,
      reflectPrompt: it.reflectPrompt,
      reflection: this.progress.reflection(it.id),
      tasks,
      resources: (it.resources ?? []).map((r) => ({ label: r.label, note: r.note })),
      reviewable: showReview,
      dueReviews: [],
      complete,
      notLast,
      show: { warmup: showWarmup, reflection: showReflection, review: showReview },
    };
  }

  public dashboard(): DashboardVM {
    const overall = this.deps.stats.overall(this.pack, this.progress);
    const streak = this.deps.streaks.current(this.progress, this.deps.clock.today());
    const byPhase = this.deps.stats.byPhase(this.pack, this.progress);
    const byTrack = this.deps.stats.byTrack(this.pack, this.progress);
    const sw = this.deps.defaultStreakWords;
    const streakWord =
      streak === 1 ? sw[0] ?? '' : streak >= 2 && streak <= 4 ? sw[1] ?? '' : sw[2] ?? '';
    const phaseList = this.pack.phases ?? [];
    const phases = phaseList.length
      ? phaseList.map((ph) => ({
          id: ph.id,
          title: ph.title || `${this.lbl('phase', 'phaseWord')} ${ph.id}`,
          stat: byPhase[ph.id] ?? { done: 0, total: 0, pct: 0 },
        }))
      : null;
    const tracks = this.pack.tracks
      .filter((t) => byTrack[t.id])
      .map((t) => ({ id: t.id, label: t.label, stat: byTrack[t.id]! }));
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
    let done = 0;
    let total = 0;
    const groups = this.pack.groups.map((g) => ({
      id: g.id,
      title: g.title,
      items: g.items.map((it) => {
        const rest = !!it.rest;
        const isDone = this.progress.isItemComplete(it);
        if (!rest) {
          total++;
          if (isDone) done++;
        }
        return {
          id: it.id,
          title: it.title ?? '',
          done: isDone,
          rest,
          current: it.id === this.currentItemId,
        };
      }),
    }));
    return { done, total, groups };
  }

  public trophies(): TrophyVM[] {
    const all = this.deps.badges.evaluate(this.pack, this.progress, this.rules);
    return all.map((b) => {
      const meta = this.rules.find((r) => r.id === b.id);
      return {
        id: b.id,
        title: meta?.title ?? b.id,
        desc: meta?.desc ?? '',
        icon: meta?.icon ?? '•',
        unlocked: b.unlocked,
      };
    });
  }

  public comeback(): { show: boolean; days: number } {
    const today = this.deps.clock.today();
    const b = this.deps.badges.evaluate(this.pack, this.progress, this.rules).find((x) => x.id === 'comeback');
    const streak = this.deps.streaks.current(this.progress, today);
    const show = !!(b && b.unlocked && streak <= 2);
    return { show, days: this.progress.completedCount() };
  }

  public trackColors(): TrackColor[] {
    const out: TrackColor[] = [];
    for (const t of this.pack.tracks) if (t.color) out.push({ id: t.id, color: t.color });
    return out;
  }

  public mottos(): readonly string[] {
    return this.mottosList;
  }

  public ui(key: string): string {
    return this.uiText(key);
  }

  public itemLabel(): string {
    return this.lbl('item', 'weekAbbr');
  }

  public activeThemeHref(): string | null {
    const theme = this.deps.themes.themes().find((t) => t.id === this.themeId);
    return theme ? theme.cssHref : null;
  }

  public activeThemeId(): string | null {
    return this.themeId;
  }

  public activePackId(): string {
    return this.pack.id;
  }

  public locale(): string {
    return this.pack.locale ?? 'en';
  }
}
