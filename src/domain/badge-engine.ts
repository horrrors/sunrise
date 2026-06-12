import type { Pack } from './types/entities.ts';
import type { Progress } from './progress.ts';
import type { BadgeRule } from './types/badge-rule.ts';
import type { BadgeStatus } from './types/badge-engine.ts';
import { Streaks } from './streaks.ts';
import { ProgressStats } from './progress-stats.ts';
import { weekdayMon } from './dates.ts';

interface BadgeContext {
  longestStreak: number;
  daysDone: number;
  total: number;
  pct: number;
  reflections: number;
  groupsComplete: number;
  hasComeback: boolean;
  tracks: string[];
  dates: string[];
  hours: number[];
  tasks(track?: string): number;
  trackDone(track: string): number;
  trackStat(track: string): { done: number; total: number };
  phaseStat(phase: string): { done: number; total: number };
  itemComplete(itemId: string): boolean;
}
const inHourRange = (h: number, from: number, to: number): boolean =>
  from <= to ? h >= from && h < to : h >= from || h < to;

export class BadgeEngine {
  private streaks: Streaks;
  private stats: ProgressStats;
  constructor(streaks: Streaks, stats: ProgressStats) {
    this.streaks = streaks;
    this.stats = stats;
  }

  private context(pack: Pack, progress: Progress): BadgeContext {
    const overall = this.stats.overall(pack, progress);
    const byTrack = this.stats.byTrack(pack, progress);
    const byPhase = this.stats.byPhase(pack, progress);
    const byId = new Map(pack.groups.flatMap((g) => g.items).map((it) => [it.id, it] as const));
    const NONE = { done: 0, total: 0 };
    return {
      longestStreak: this.streaks.longest(progress),
      daysDone: overall.done,
      total: overall.total,
      // exact ratio, not the display-rounded Stat.pct — `percent` rules must
      // not fire early (199/200 rounds to 100)
      pct: overall.total ? (overall.done / overall.total) * 100 : 0,
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
      },
    };
  }

  private passes(rule: BadgeRule, c: BadgeContext): boolean {
    switch (rule.type) {
      case 'streak':
        return c.longestStreak >= rule.gte;
      case 'days-done':
        return c.daysDone >= rule.gte;
      case 'percent':
        return c.pct >= rule.gte;
      case 'all-done':
        return c.total > 0 && c.daysDone === c.total;
      case 'tasks-done':
        return c.tasks(rule.track) >= rule.gte;
      case 'reflections':
        return c.reflections >= rule.gte;
      case 'groups-complete':
        return c.groupsComplete >= rule.gte;
      case 'track-complete': {
        const s = c.trackStat(rule.track);
        return s.total > 0 && s.done === s.total;
      }
      case 'phase-complete': {
        const s = c.phaseStat(rule.phase);
        return s.total > 0 && s.done === s.total;
      }
      case 'item-complete':
        return c.itemComplete(rule.item);
      case 'all-tracks':
        return c.tracks.length > 0 && c.tracks.every((t) => c.trackDone(t) >= rule.eachGte);
      // weekdayMon is 0-based (0=Mon); rule.days uses the documented 1=Mon..7=Sun.
      case 'weekday':
        return c.dates.some((d) => rule.days.includes(weekdayMon(d) + 1));
      case 'hour-range':
        return c.hours.some((h) => inHourRange(h, rule.from, rule.to));
      case 'comeback':
        return c.hasComeback;
      default: {
        const _exhaustive: never = rule;
        return _exhaustive;
      }
    }
  }

  // Rules are deduped by Tracker.loadPack (last wins); ids are unique here.
  public evaluate(pack: Pack, progress: Progress, rules: readonly BadgeRule[]): BadgeStatus[] {
    const ctx = this.context(pack, progress);
    return rules.map((r) => ({
      id: r.id,
      unlocked: progress.isBadgeOwned(r.id) || this.passes(r, ctx),
    }));
  }

  public sync(
    pack: Pack,
    progress: Progress,
    rules: readonly BadgeRule[],
    today: string,
  ): string[] {
    const ctx = this.context(pack, progress);
    const unlocked: string[] = [];
    for (const r of rules) {
      if (!progress.isBadgeOwned(r.id) && this.passes(r, ctx)) {
        progress.awardBadge(r.id, today);
        unlocked.push(r.id);
      }
    }
    return unlocked;
  }
}
