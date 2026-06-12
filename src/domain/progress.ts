import type { Item } from './types/entities.ts';
import type { ItemProgress, Review, ProgressData } from './types/progress.ts';

export class Progress {
  private items: Record<string, ItemProgress>;
  private reviews: Review[];
  private badges: Record<string, { at: string }>;

  constructor(data: ProgressData) {
    this.items = data.items;
    this.reviews = data.reviews;
    this.badges = data.badges;
  }

  public static empty(): Progress {
    return new Progress({ schema: 'sunrise.progress/v1', items: {}, reviews: [], badges: {} });
  }

  public toJSON(): ProgressData {
    return structuredClone({
      schema: 'sunrise.progress/v1',
      items: this.items,
      reviews: this.reviews,
      badges: this.badges,
    });
  }

  private ensure(itemId: string): ItemProgress {
    let it = this.items[itemId];
    if (!it) {
      it = { tasks: {}, reflection: '', completedAt: null, completedHour: null };
      this.items[itemId] = it;
    }
    return it;
  }

  public isItemComplete(item: Item): boolean {
    if (item.rest || !item.tasks || item.tasks.length === 0) return false;
    const st = this.items[item.id];
    if (!st) return false;
    return item.tasks.every((t) => st.tasks?.[t.id] === true);
  }

  public setTaskDone(item: Item, taskId: string, done: boolean, today: string, hour: number): void {
    const st = this.ensure(item.id);
    st.tasks ??= {}; // a hand-built/legacy entry may lack the map (read paths tolerate this too)
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

  public setReflection(itemId: string, text: string): void {
    this.ensure(itemId).reflection = text;
  }
  public reflection(itemId: string): string {
    return this.items[itemId]?.reflection ?? '';
  }
  public taskChecked(itemId: string, taskId: string): boolean {
    return this.items[itemId]?.tasks?.[taskId] === true;
  }

  public completedDates(): string[] {
    const set = new Set<string>();
    for (const id of Object.keys(this.items)) {
      const c = this.items[id]?.completedAt;
      if (c) set.add(c);
    }
    return [...set].sort();
  }
  public completedHours(): number[] {
    const out: number[] = [];
    for (const id of Object.keys(this.items)) {
      const it = this.items[id];
      if (it && it.completedAt != null && it.completedHour != null) out.push(it.completedHour);
    }
    return out;
  }
  public completedCount(): number {
    return Object.keys(this.items).filter((id) => this.items[id]?.completedAt).length;
  }
  public reflectionCount(): number {
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
  public reconcile(items: readonly Item[]): boolean {
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

  public getReviewList(): readonly Review[] {
    return this.reviews;
  }
  public scheduleReview(itemId: string, today: string): void {
    this.reviews = this.reviews.filter((r) => r.itemId !== itemId);
    this.reviews.push({ itemId, lastDate: today });
  }

  public isBadgeOwned(id: string): boolean {
    return this.badges[id] !== undefined;
  }
  public awardBadge(id: string, at: string): void {
    if (!this.badges[id]) this.badges[id] = { at };
  }
}
