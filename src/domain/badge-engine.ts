import type { Pack } from './entities.ts';
import type { Progress } from './progress.ts';
import type { BadgeRule } from './badge-rule.ts';
import { Streaks } from './streaks.ts';
import { ProgressStats } from './progress-stats.ts';
import { weekdayMon } from './dates.ts';

export interface BadgeStatus { id: string; unlocked: boolean; at: string | null; }

interface BadgeContext {
  longestStreak: number; daysDone: number; total: number; pct: number;
  reflections: number; groupsComplete: number; hasComeback: boolean;
  tracks: string[]; dates: string[]; hours: number[];
  tasks(track?: string): number; trackDone(track: string): number;
  trackPct(track: string): number; phasePct(phase: string): number;
  itemComplete(itemId: string): boolean;
}
const inHourRange = (h: number, from: number, to: number): boolean =>
  from <= to ? h >= from && h < to : h >= from || h < to;

export class BadgeEngine {
  #streaks: Streaks;
  #stats: ProgressStats;
  constructor(streaks: Streaks, stats: ProgressStats) { this.#streaks = streaks; this.#stats = stats; }

  #context(pack: Pack, progress: Progress): BadgeContext {
    const overall = this.#stats.overall(pack, progress);
    const byTrack = this.#stats.byTrack(pack, progress);
    const byPhase = this.#stats.byPhase(pack, progress);
    const byId = new Map(pack.groups.flatMap((g) => g.items).map((it) => [it.id, it] as const));
    return {
      longestStreak: this.#streaks.longest(progress),
      daysDone: overall.done, total: overall.total, pct: overall.pct,
      reflections: progress.reflectionCount(),
      groupsComplete: this.#stats.completedGroups(pack, progress),
      hasComeback: this.#streaks.hasComeback(progress),
      tracks: this.#stats.tracks(pack),
      dates: progress.completedDates(),
      hours: progress.completedHours(),
      tasks: (track) => this.#stats.countTasks(pack, progress, track),
      trackDone: (track) => byTrack[track]?.done ?? 0,
      trackPct: (track) => byTrack[track]?.pct ?? 0,
      phasePct: (phase) => byPhase[phase]?.pct ?? 0,
      itemComplete: (id) => { const it = byId.get(id); return it ? progress.isItemComplete(it) : false; },
    };
  }

  #passes(rule: BadgeRule, c: BadgeContext): boolean {
    switch (rule.type) {
      case 'streak': return c.longestStreak >= rule.gte;
      case 'days-done': return c.daysDone >= rule.gte;
      case 'percent': return c.pct >= rule.gte;
      case 'all-done': return c.total > 0 && c.daysDone === c.total;
      case 'tasks-done': return c.tasks(rule.track) >= rule.gte;
      case 'reflections': return c.reflections >= rule.gte;
      case 'groups-complete': return c.groupsComplete >= rule.gte;
      case 'track-complete': return c.trackPct(rule.track) === 100;
      case 'phase-complete': return c.phasePct(rule.phase) === 100;
      case 'item-complete': return c.itemComplete(rule.item);
      case 'all-tracks': return c.tracks.length > 0 && c.tracks.every((t) => c.trackDone(t) >= rule.eachGte);
      case 'weekday': return c.dates.some((d) => rule.days.includes(weekdayMon(d) + 1));
      case 'hour-range': return c.hours.some((h) => inHourRange(h, rule.from, rule.to));
      case 'comeback': return c.hasComeback;
      default: { const _exhaustive: never = rule; return _exhaustive; }
    }
  }

  #dedupe(rules: readonly BadgeRule[]): BadgeRule[] {
    const idx = new Map<string, number>();
    const out: BadgeRule[] = [];
    for (const r of rules) {
      const at = idx.get(r.id);
      if (at !== undefined) out[at] = r;
      else { idx.set(r.id, out.length); out.push(r); }
    }
    return out;
  }

  evaluate(pack: Pack, progress: Progress, rules: readonly BadgeRule[]): BadgeStatus[] {
    const ctx = this.#context(pack, progress);
    return this.#dedupe(rules).map((r) => ({
      id: r.id,
      unlocked: progress.isBadgeOwned(r.id) || this.#passes(r, ctx),
      at: progress.badgeAt(r.id),
    }));
  }

  sync(pack: Pack, progress: Progress, rules: readonly BadgeRule[], today: string): string[] {
    const ctx = this.#context(pack, progress);
    const unlocked: string[] = [];
    for (const r of this.#dedupe(rules)) {
      if (!progress.isBadgeOwned(r.id) && this.#passes(r, ctx)) {
        progress.awardBadge(r.id, today);
        unlocked.push(r.id);
      }
    }
    return unlocked;
  }
}
