import type { Pack, Item } from './entities.ts';
import type { Progress } from './progress.ts';

export interface Stat { done: number; total: number; pct: number; }
const pct = (done: number, total: number): number => (total ? Math.round((done / total) * 100) : 0);

export class ProgressStats {
  #all(pack: Pack): Item[] { return pack.groups.flatMap((g) => [...g.items]); }
  tracks(pack: Pack): string[] {
    const s = new Set<string>();
    for (const it of this.#all(pack)) if (!it.rest) s.add(it.track);
    return [...s];
  }
  overall(pack: Pack, progress: Progress): Stat {
    let done = 0, total = 0;
    for (const it of this.#all(pack)) { if (it.rest) continue; total++; if (progress.isItemComplete(it)) done++; }
    return { done, total, pct: pct(done, total) };
  }
  byTrack(pack: Pack, progress: Progress): Record<string, Stat> {
    const acc: Record<string, Stat> = {};
    for (const it of this.#all(pack)) { if (it.rest) continue; this.#bump(acc, it.track, progress.isItemComplete(it)); }
    return this.#finalize(acc);
  }
  byPhase(pack: Pack, progress: Progress): Record<string, Stat> {
    const acc: Record<string, Stat> = {};
    for (const g of pack.groups) {
      if (g.phase == null) continue;
      for (const it of g.items) { if (it.rest) continue; this.#bump(acc, g.phase, progress.isItemComplete(it)); }
    }
    return this.#finalize(acc);
  }
  countTasks(pack: Pack, progress: Progress, track?: string): number {
    let n = 0;
    for (const it of this.#all(pack)) {
      if (track && it.track !== track) continue;
      for (const t of it.tasks ?? []) if (progress.taskChecked(it.id, t.id)) n++;
    }
    return n;
  }
  completedGroups(pack: Pack, progress: Progress): number {
    let n = 0;
    for (const g of pack.groups) {
      const work = g.items.filter((it) => !it.rest);
      if (work.length && work.every((it) => progress.isItemComplete(it))) n++;
    }
    return n;
  }
  #bump(acc: Record<string, Stat>, key: string, done: boolean): void {
    const a = acc[key] ?? (acc[key] = { done: 0, total: 0, pct: 0 });
    a.total++; if (done) a.done++;
  }
  #finalize(acc: Record<string, Stat>): Record<string, Stat> {
    for (const k of Object.keys(acc)) { const a = acc[k]!; a.pct = pct(a.done, a.total); }
    return acc;
  }
}
