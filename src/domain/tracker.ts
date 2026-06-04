import type { Pack, Item, Group, Track } from './entities.ts';
import type { BadgeRule } from './badge-rule.ts';
import type {
  Clock,
  Random,
  ProgressStore,
  SessionStore,
  PackSource,
  ThemeSource,
} from '../ports/index.ts';
import { Progress } from './progress.ts';
import { Streaks } from './streaks.ts';
import { ProgressStats } from './progress-stats.ts';
import { ReviewSchedule } from './review-schedule.ts';
import { BadgeEngine } from './badge-engine.ts';
import { ProgressValidator } from './validators.ts';
import { addDays, weekdayMon } from './dates.ts';
import type {
  TodayVM,
  DashboardVM,
  CalendarVM,
  TrophyVM,
  SelectorsVM,
  CompleteResult,
  TrackColor,
  TaskVM,
} from './view-models.ts';

export interface TrackerDeps {
  packs: PackSource;
  themes: ThemeSource;
  progressStore: ProgressStore;
  sessionStore: SessionStore;
  clock: Clock;
  random: Random;
  streaks: Streaks;
  stats: ProgressStats;
  reviews: ReviewSchedule;
  badges: BadgeEngine;
  defaultUi: Record<string, string>;
  genericBadges: readonly BadgeRule[];
  defaultDow: readonly string[];
  defaultStreakWords: readonly string[];
  defaultMonths: readonly string[];
  defaultMottos: readonly string[];
}

const SURPRISE_CHANCE = 0.12;

export class Tracker {
  #deps: TrackerDeps;
  #pack!: Pack;
  #progress!: Progress;
  #themeId: string | null = null;
  #currentItemId = '';
  #rules: readonly BadgeRule[] = [];
  #allItems: Item[] = [];
  #groupById: Record<string, Group> = {};
  #mottos: readonly string[] = [];

  constructor(deps: TrackerDeps) {
    this.#deps = deps;
  }

  // ----- lifecycle -----------------------------------------------------------

  init(): void {
    const packs = this.#deps.packs.packs();
    if (packs.length === 0) throw new Error('no packs registered');
    const sess = this.#deps.sessionStore.load();
    const pack = packs.find((p) => p.id === sess.activePackId) ?? packs[0]!;
    this.#loadPack(pack.id);
    const themes = this.#deps.themes.themes();
    const theme = themes.find((t) => t.id === sess.themeId) ?? themes[0];
    this.#themeId = theme ? theme.id : null;
    this.#currentItemId = this.#defaultItemId();
  }

  #loadPack(packId: string): void {
    const packs = this.#deps.packs.packs();
    this.#pack = packs.find((p) => p.id === packId) ?? packs[0]!;
    this.#progress = this.#deps.progressStore.load(this.#pack.id);
    this.#rules = [...this.#deps.genericBadges, ...(this.#pack.badges ?? [])];
    this.#allItems = this.#pack.groups.flatMap((g) => [...g.items]);
    this.#groupById = {};
    for (const g of this.#pack.groups) for (const it of g.items) this.#groupById[it.id] = g;
    this.#mottos =
      this.#pack.mottos && this.#pack.mottos.length ? this.#pack.mottos : this.#deps.defaultMottos;
  }

  #save(): void {
    this.#deps.progressStore.save(this.#pack.id, this.#progress);
  }

  // ----- helpers -------------------------------------------------------------

  #ui(k: string): string {
    const fromPack = this.#pack.ui && this.#pack.ui[k];
    if (fromPack != null) return fromPack;
    return this.#deps.defaultUi[k] ?? '';
  }
  #lbl(k: keyof NonNullable<NonNullable<Pack['settings']>['labels']>, fallback: string): string {
    const l = this.#pack.settings && this.#pack.settings.labels;
    const v = l && l[k];
    return v != null ? v : this.#ui(fallback);
  }
  #itemOf(id: string): Item {
    const it = this.#allItems.find((x) => x.id === id);
    if (!it) throw new Error(`unknown item "${id}"`);
    return it;
  }
  #trackMeta(id: string): Track {
    for (const t of this.#pack.tracks) if (t.id === id) return t;
    return { id, label: '', icon: '' };
  }
  #defaultItemId(): string {
    const open = this.#allItems.find((it) => !it.rest && !this.#progress.isItemComplete(it));
    return (open ?? this.#allItems[this.#allItems.length - 1]!).id;
  }
  #itemIndex(): number {
    return this.#allItems.findIndex((it) => it.id === this.#currentItemId);
  }
  #groupOrdinal(id: string): number {
    return this.#pack.groups.indexOf(this.#groupById[id]!) + 1;
  }

  // ----- intents -------------------------------------------------------------

  toggleTask(taskId: string, done: boolean): CompleteResult {
    const item = this.#itemOf(this.#currentItemId);
    const wasComplete = this.#progress.isItemComplete(item);
    this.#progress.setTaskDone(item, taskId, done, this.#deps.clock.today(), this.#deps.clock.hour());
    if (!wasComplete && this.#progress.isItemComplete(item)) return this.#onItemCompleted();
    this.#save();
    return { unlockedBadges: [] };
  }

  #onItemCompleted(): CompleteResult {
    const today = this.#deps.clock.today();
    const unlocked = this.#deps.badges.sync(this.#pack, this.#progress, this.#rules, today);
    let surprise: string | undefined;
    if (this.#deps.random.next() < SURPRISE_CHANCE) {
      const pool = this.#pack.surprises ?? [];
      const msg = pool.length ? pool[Math.floor(this.#deps.random.next() * pool.length)] : undefined;
      if (msg) {
        this.#progress.setLastSurprise({ text: msg, at: today });
        surprise = msg;
      }
    }
    this.#save();
    return surprise === undefined ? { unlockedBadges: unlocked } : { unlockedBadges: unlocked, surprise };
  }

  setReflection(text: string): void {
    this.#progress.setReflection(this.#currentItemId, text);
    this.#save();
  }

  selectItem(id: string): void {
    this.#currentItemId = id;
  }

  goToItem(delta: number): void {
    const i = this.#itemIndex();
    const j = Math.min(Math.max(i + delta, 0), this.#allItems.length - 1);
    if (j !== i) this.#currentItemId = this.#allItems[j]!.id;
  }

  selectPack(id: string): void {
    const sess = this.#deps.sessionStore.load();
    sess.activePackId = id;
    this.#deps.sessionStore.save(sess);
    this.#loadPack(id);
    this.#currentItemId = this.#defaultItemId();
  }

  selectTheme(id: string): void {
    const sess = this.#deps.sessionStore.load();
    sess.themeId = id;
    this.#deps.sessionStore.save(sess);
    this.#themeId = id;
  }

  scheduleReviewForCurrent(): void {
    const it = this.#itemOf(this.#currentItemId);
    const g = this.#groupById[it.id]!;
    const reviewId = g.id + '-' + (it.title || it.id);
    this.#deps.reviews.schedule(this.#progress, reviewId, this.#deps.clock.today());
    this.#save();
  }

  importProgress(json: string): void {
    const data = new ProgressValidator().parseJson(json);
    this.#progress = new Progress(data);
    this.#save();
    this.#currentItemId = this.#defaultItemId();
  }

  exportProgress(): string {
    return JSON.stringify(this.#progress.toJSON(), null, 2);
  }

  // ----- queries -------------------------------------------------------------

  selectors(): SelectorsVM {
    const packs = this.#deps.packs.packs().map((p) => ({
      id: p.id,
      label: p.name,
      selected: p.id === this.#pack.id,
    }));
    const themes = this.#deps.themes.themes().map((t) => ({
      id: t.id,
      label: t.name,
      selected: t.id === this.#themeId,
    }));
    const items = this.#allItems.map((it) => {
      const g = this.#groupById[it.id]!;
      const tl = it.rest ? this.#ui('restVert') : this.#trackMeta(it.track).label;
      return { id: it.id, label: `${g.title} · ${tl}`, selected: it.id === this.#currentItemId };
    });
    return { packs, themes, items };
  }

  todayCard(): TodayVM {
    const it = this.#itemOf(this.#currentItemId);
    const m = this.#trackMeta(it.track);
    const g = this.#groupById[it.id]!;
    const cfg = this.#pack.settings ?? {};
    const i = this.#itemIndex();
    const notLast = i < this.#allItems.length - 1;
    const phaseLabel = this.#ui('phaseLabel')
      .replace('{p}', g.phase == null ? '' : g.phase)
      .replace('{w}', String(this.#groupOrdinal(it.id)));

    if (it.rest) {
      const dueReviews = cfg.reviews
        ? this.#deps.reviews.due(this.#progress, this.#deps.clock.today())
        : [];
      return {
        itemId: it.id,
        rest: true,
        track: it.track,
        trackLabel: m.label,
        trackIcon: m.icon ?? '',
        title: this.#ui('restTitle'),
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

    const complete = this.#progress.isItemComplete(it);
    const tasks: TaskVM[] = (it.tasks ?? []).map((t) => ({
      id: t.id,
      text: t.text,
      ...(t.guidance !== undefined ? { guidance: t.guidance } : {}),
      done: this.#progress.taskChecked(it.id, t.id),
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
      reflection: this.#progress.reflection(it.id),
      tasks,
      resources: (it.resources ?? []).map((r) => ({ label: r.label, note: r.note })),
      reviewable: showReview,
      dueReviews: [],
      complete,
      notLast,
      show: { warmup: showWarmup, reflection: showReflection, review: showReview },
    };
  }

  dashboard(): DashboardVM {
    const overall = this.#deps.stats.overall(this.#pack, this.#progress);
    const streak = this.#deps.streaks.current(this.#progress, this.#deps.clock.today());
    const byPhase = this.#deps.stats.byPhase(this.#pack, this.#progress);
    const byTrack = this.#deps.stats.byTrack(this.#pack, this.#progress);
    const sw = this.#deps.defaultStreakWords;
    const streakWord =
      streak === 1 ? sw[0] ?? '' : streak >= 2 && streak <= 4 ? sw[1] ?? '' : sw[2] ?? '';
    const phaseList = this.#pack.phases ?? [];
    const phases = phaseList.length
      ? phaseList.map((ph) => ({
          id: ph.id,
          title: ph.title || `${this.#lbl('phase', 'phaseWord')} ${ph.id}`,
          stat: byPhase[ph.id] ?? { done: 0, total: 0, pct: 0 },
        }))
      : null;
    const tracks = this.#pack.tracks
      .filter((t) => byTrack[t.id])
      .map((t) => ({ id: t.id, label: t.label, stat: byTrack[t.id]! }));
    return {
      overall,
      streak,
      streakWord,
      phases,
      tracks,
      daysOfLabel: this.#ui('daysOf').replace('{n}', String(overall.total)),
    };
  }

  calendar(monthOffset: number): CalendarVM {
    const done = new Set(this.#progress.completedDates());
    const today = this.#deps.clock.today();
    const [ys, ms] = today.split('-');
    let y = Number(ys);
    let m = Number(ms) + monthOffset;
    while (m < 1) {
      m += 12;
      y--;
    }
    while (m > 12) {
      m -= 12;
      y++;
    }
    const first = `${y}-${m < 10 ? '0' : ''}${m}-01`;
    const start = addDays(first, -weekdayMon(first));
    const cells: CalendarVM['cells'] = [];
    for (let k = 0; k < 42; k++) {
      const dd = addDays(start, k);
      cells.push({
        day: Number(dd.slice(8, 10)),
        done: done.has(dd),
        today: dd === today,
        other: dd.slice(0, 7) !== first.slice(0, 7),
      });
    }
    const months = this.#deps.defaultMonths;
    return {
      title: `${months[m - 1] ?? ''} ${y}`,
      dow: [...this.#deps.defaultDow],
      cells,
    };
  }

  trophies(): TrophyVM[] {
    const all = this.#deps.badges.evaluate(this.#pack, this.#progress, this.#rules);
    return all.map((b) => {
      const meta = this.#rules.find((r) => r.id === b.id);
      return {
        id: b.id,
        title: meta?.title ?? b.id,
        desc: meta?.desc ?? '',
        icon: meta?.icon ?? '•',
        unlocked: b.unlocked,
      };
    });
  }

  comeback(): { show: boolean; days: number } {
    const today = this.#deps.clock.today();
    const b = this.#deps.badges.evaluate(this.#pack, this.#progress, this.#rules).find((x) => x.id === 'comeback');
    const streak = this.#deps.streaks.current(this.#progress, today);
    const show = !!(b && b.unlocked && streak <= 2);
    return { show, days: this.#progress.completedCount() };
  }

  trackColors(): TrackColor[] {
    const out: TrackColor[] = [];
    for (const t of this.#pack.tracks) if (t.color) out.push({ id: t.id, color: t.color });
    return out;
  }

  mottos(): readonly string[] {
    return this.#mottos;
  }

  ui(key: string): string {
    return this.#ui(key);
  }

  itemLabel(): string {
    return this.#lbl('item', 'weekAbbr');
  }

  activeThemeHref(): string | null {
    const theme = this.#deps.themes.themes().find((t) => t.id === this.#themeId);
    return theme ? theme.cssHref : null;
  }

  activeThemeId(): string | null {
    return this.#themeId;
  }

  activePackId(): string {
    return this.#pack.id;
  }

  locale(): string {
    return this.#pack.locale ?? 'en';
  }
}
