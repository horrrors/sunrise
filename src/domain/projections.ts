import type { Pack, Item, Track } from './types/entities.ts';
import { tr } from './i18n.ts';
import { DEFAULT_LANG } from './i18n.ts';
import { pluralIndex } from './plural.ts';
import type { TrackerView, ProjectionDeps } from './types/projections.ts';
import type {
  TodayVM,
  DashboardVM,
  CardMapVM,
  TrophyVM,
  SelectorsVM,
  TrackColor,
  TaskVM,
  AppStateVM,
} from './types/view-models.ts';

// The read model (CQS). Stateless: it reads a live TrackerView snapshot via the
// injected reader and projects it (with i18n resolution) into view-models. All
// Localized→string resolution lives here, so the renderer/controller stay string-based.
export class Projections {
  private read: () => TrackerView;
  private deps: ProjectionDeps;
  constructor(read: () => TrackerView, deps: ProjectionDeps) {
    this.read = read;
    this.deps = deps;
  }

  // ----- i18n / lookup helpers (operate on a passed-in snapshot) -------------

  private uiText(v: TrackerView, k: string): string {
    const fromPack = v.pack.ui && v.pack.ui[k];
    if (fromPack != null) return tr(fromPack, v.lang);
    const def = this.deps.defaultUi[k];
    return def != null ? tr(def, v.lang) : '';
  }
  private lbl(
    v: TrackerView,
    k: keyof NonNullable<NonNullable<Pack['settings']>['labels']>,
    fallbackKey: string,
  ): string {
    const l = v.pack.settings && v.pack.settings.labels;
    const val = l && l[k];
    return val != null ? tr(val, v.lang) : this.uiText(v, fallbackKey);
  }
  private itemOf(v: TrackerView, id: string): Item {
    const it = v.allItems.find((x) => x.id === id);
    if (!it) throw new Error(`unknown item "${id}"`);
    return it;
  }
  // Unlike itemOf this never throws: the implicit "rest" track is undeclared by design.
  private trackMeta(v: TrackerView, id: string): Track {
    for (const t of v.pack.tracks) if (t.id === id) return t;
    return { id, label: '', icon: '' };
  }
  private itemIndex(v: TrackerView): number {
    return v.allItems.findIndex((it) => it.id === v.currentItemId);
  }
  private groupOrdinal(v: TrackerView, id: string): number {
    return v.pack.groups.indexOf(v.groupOfItem[id]!) + 1;
  }

  // ----- view-models ---------------------------------------------------------

  public selectors(): SelectorsVM {
    const v = this.read();
    const packs = this.deps.packs.packs().map((p) => ({
      id: p.id,
      label: tr(p.name, v.lang),
      selected: p.id === v.pack.id,
    }));
    // Theme names are fixed brand strings and are not localized.
    const themes = this.deps.themes.themes().map((t) => ({
      id: t.id,
      label: t.name,
      selected: t.id === v.themeId,
    }));
    const items = v.allItems.map((it) => {
      const g = v.groupOfItem[it.id]!;
      const tl = it.rest
        ? this.uiText(v, 'restVert')
        : tr(this.trackMeta(v, it.track).label, v.lang);
      return {
        id: it.id,
        label: `${tr(g.title, v.lang)} · ${tl}`,
        selected: it.id === v.currentItemId,
      };
    });
    return { packs, themes, items };
  }

  public todayCard(): TodayVM {
    const v = this.read();
    const it = this.itemOf(v, v.currentItemId);
    const m = this.trackMeta(v, it.track);
    const g = v.groupOfItem[it.id]!;
    const cfg = v.pack.settings ?? {};
    const i = this.itemIndex(v);
    const notLast = i < v.allItems.length - 1;
    const phaseLabel = this.uiText(v, 'phaseLabel')
      .replace('{p}', g.phase == null ? '' : g.phase)
      .replace('{w}', String(this.groupOrdinal(v, it.id)));

    if (it.rest) {
      return {
        itemId: it.id,
        rest: true,
        track: it.track,
        trackLabel: tr(m.label, v.lang),
        trackIcon: m.icon ?? '',
        title: this.uiText(v, 'restTitle'),
        phaseLabel,
        reflectPrompt: it.reflectPrompt != null ? tr(it.reflectPrompt, v.lang) : undefined,
        reflection: '',
        tasks: [],
        resources: [],
        complete: false,
        notLast,
        show: { warmup: false, reflection: false },
      };
    }

    const complete = v.progress.isItemComplete(it);
    const tasks: TaskVM[] = (it.tasks ?? []).map((t) => ({
      id: t.id,
      text: tr(t.text, v.lang),
      ...(t.guidance !== undefined ? { guidance: tr(t.guidance, v.lang) } : {}),
      done: v.progress.taskChecked(it.id, t.id),
    }));
    const showWarmup = cfg.warmups !== false && it.warmup != null;
    const showReflection = cfg.reflections !== false;
    return {
      itemId: it.id,
      rest: false,
      track: it.track,
      trackLabel: tr(m.label, v.lang),
      trackIcon: m.icon ?? '',
      title: it.title != null ? tr(it.title, v.lang) : '',
      phaseLabel,
      warmup: it.warmup != null ? tr(it.warmup, v.lang) : undefined,
      reflectPrompt: it.reflectPrompt != null ? tr(it.reflectPrompt, v.lang) : undefined,
      reflection: v.progress.reflection(it.id),
      tasks,
      resources: (it.resources ?? []).map((r) => ({
        label: tr(r.label, v.lang),
        note: tr(r.note, v.lang),
      })),
      complete,
      notLast,
      show: { warmup: showWarmup, reflection: showReflection },
    };
  }

  public dashboard(): DashboardVM {
    const v = this.read();
    const overall = this.deps.stats.overall(v.pack, v.progress);
    const streak = this.deps.streaks.current(v.progress, this.deps.clock.today());
    const byPhase = this.deps.stats.byPhase(v.pack, v.progress);
    const byTrack = this.deps.stats.byTrack(v.pack, v.progress);
    const words =
      this.deps.defaultStreakWords[v.lang] ?? this.deps.defaultStreakWords[DEFAULT_LANG] ?? [];
    const streakWord = words[pluralIndex(v.lang, streak)] ?? words[words.length - 1] ?? '';
    const phaseList = v.pack.phases ?? [];
    const phases = phaseList.length
      ? phaseList.map((ph) => ({
          id: ph.id,
          title: tr(ph.title, v.lang) || `${this.lbl(v, 'phase', 'phaseWord')} ${ph.id}`,
          stat: byPhase[ph.id] ?? { done: 0, total: 0, pct: 0 },
        }))
      : null;
    const tracks = v.pack.tracks
      .filter((t) => byTrack[t.id])
      .map((t) => ({ id: t.id, label: tr(t.label, v.lang), stat: byTrack[t.id]! }));
    return {
      overall,
      streak,
      streakWord,
      phases,
      tracks,
      daysOfLabel: this.uiText(v, 'daysOf').replace('{n}', String(overall.total)),
    };
  }

  // App-state surface for themes (read by DomRenderer.applyAppState). Reuses the
  // shared calculators; hour comes through the Clock port to keep the domain pure.
  public appState(): AppStateVM {
    const v = this.read();
    const overall = this.deps.stats.overall(v.pack, v.progress);
    const streak = this.deps.streaks.current(v.progress, this.deps.clock.today());
    // month parsed from the local "YYYY-MM-DD" day string — keeps the domain
    // pure (no Date) while giving season-reactive themes a --sunrise-month.
    const month = Number(this.deps.clock.today().slice(5, 7));
    return { progress: overall.pct, streak, hour: this.deps.clock.hour(), month };
  }

  public cardMap(): CardMapVM {
    const v = this.read();
    const overall = this.deps.stats.overall(v.pack, v.progress);
    const groups = v.pack.groups.map((g) => ({
      id: g.id,
      title: tr(g.title, v.lang),
      items: g.items.map((it) => ({
        id: it.id,
        title: it.title != null ? tr(it.title, v.lang) : '',
        done: v.progress.isItemComplete(it),
        rest: !!it.rest,
        current: it.id === v.currentItemId,
      })),
    }));
    return { done: overall.done, total: overall.total, groups };
  }

  public trophies(): TrophyVM[] {
    const v = this.read();
    const all = this.deps.badges.evaluate(v.pack, v.progress, v.rules);
    return all.map((b) => {
      const meta = v.rules.find((r) => r.id === b.id);
      return {
        id: b.id,
        title: meta ? tr(meta.title, v.lang) : b.id,
        desc: tr(meta?.desc, v.lang),
        icon: meta?.icon ?? '•',
        unlocked: b.unlocked,
      };
    });
  }

  public comeback(): { show: boolean; days: number } {
    const v = this.read();
    const today = this.deps.clock.today();
    const b = this.deps.badges
      .evaluate(v.pack, v.progress, v.rules)
      .find((x) => x.id === 'comeback');
    const streak = this.deps.streaks.current(v.progress, today);
    // streak <= 2: greet only during the first couple of days back, then get out of the way.
    const show = !!(b && b.unlocked && streak <= 2);
    return { show, days: v.progress.completedCount() };
  }

  public trackColors(): TrackColor[] {
    const v = this.read();
    const out: TrackColor[] = [];
    for (const t of v.pack.tracks) if (t.color) out.push({ id: t.id, color: t.color });
    return out;
  }

  public mottos(): readonly string[] {
    const v = this.read();
    return v.mottosList.map((m) => tr(m, v.lang));
  }

  public ui(key: string): string {
    return this.uiText(this.read(), key);
  }

  // Pre-prompt for the "AI copy" button: the task/warmup text wrapped in a
  // tutor template with the current item's context, ready to paste into a chat.
  public aiPrompt(text: string, guidance?: string): string {
    const v = this.read();
    const it = this.itemOf(v, v.currentItemId);
    const g = guidance
      ? `\n${this.uiText(v, 'aiPromptGuidance').replace('{guidance}', guidance)}\n`
      : '';
    return this.uiText(v, 'aiPrompt')
      .replace('{title}', it.title != null ? tr(it.title, v.lang) : '')
      .replace('{track}', tr(this.trackMeta(v, it.track).label, v.lang))
      .replace('{text}', text)
      .replace('{guidance}', g);
  }

  public itemLabel(): string {
    return this.lbl(this.read(), 'item', 'weekAbbr');
  }
}
