import type { Item } from './entities.ts';

export interface ItemProgress {
  tasks: Record<string, boolean>;
  reflection: string;
  completedAt: string | null;
  completedHour: number | null;
}
export interface Review { itemId: string; lastDate: string; stage: number; }
export interface Surprise { text: string; at: string; }
export interface ProgressData {
  schema: 'sunrise.progress/v1';
  items: Record<string, ItemProgress>;
  reviews: Review[];
  badges: Record<string, { at: string }>;
  lastSurprise: Surprise | null;
}

export class Progress {
  #items: Record<string, ItemProgress>;
  #reviews: Review[];
  #badges: Record<string, { at: string }>;
  #lastSurprise: Surprise | null;

  constructor(data: ProgressData) {
    this.#items = data.items;
    this.#reviews = data.reviews;
    this.#badges = data.badges;
    this.#lastSurprise = data.lastSurprise;
  }

  static empty(): Progress {
    return new Progress({ schema: 'sunrise.progress/v1', items: {}, reviews: [], badges: {}, lastSurprise: null });
  }

  toJSON(): ProgressData {
    return structuredClone({ schema: 'sunrise.progress/v1', items: this.#items, reviews: this.#reviews, badges: this.#badges, lastSurprise: this.#lastSurprise });
  }

  #ensure(itemId: string): ItemProgress {
    let it = this.#items[itemId];
    if (!it) {
      it = { tasks: {}, reflection: '', completedAt: null, completedHour: null };
      this.#items[itemId] = it;
    }
    return it;
  }

  isItemComplete(item: Item): boolean {
    if (item.rest || !item.tasks || item.tasks.length === 0) return false;
    const st = this.#items[item.id];
    if (!st) return false;
    return item.tasks.every((t) => st.tasks?.[t.id] === true);
  }

  setTaskDone(item: Item, taskId: string, done: boolean, today: string, hour: number): void {
    const st = this.#ensure(item.id);
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

  setReflection(itemId: string, text: string): void {
    this.#ensure(itemId).reflection = text;
  }
  reflection(itemId: string): string {
    return this.#items[itemId]?.reflection ?? '';
  }
  taskChecked(itemId: string, taskId: string): boolean {
    return this.#items[itemId]?.tasks?.[taskId] === true;
  }

  completedDates(): string[] {
    const set = new Set<string>();
    for (const id of Object.keys(this.#items)) {
      const c = this.#items[id]?.completedAt;
      if (c) set.add(c);
    }
    return [...set].sort();
  }
  completedHours(): number[] {
    const out: number[] = [];
    for (const id of Object.keys(this.#items)) {
      const it = this.#items[id];
      if (it && it.completedAt != null && it.completedHour != null) out.push(it.completedHour);
    }
    return out;
  }
  completedCount(): number {
    return Object.keys(this.#items).filter((id) => this.#items[id]?.completedAt).length;
  }
  reflectionCount(): number {
    let n = 0;
    for (const id of Object.keys(this.#items)) {
      const r = this.#items[id]?.reflection;
      if (r && r.trim()) n++;
    }
    return n;
  }

  get reviewList(): readonly Review[] {
    return this.#reviews;
  }
  scheduleReview(itemId: string, today: string): void {
    this.#reviews = this.#reviews.filter((r) => r.itemId !== itemId);
    this.#reviews.push({ itemId, lastDate: today, stage: 0 });
  }
  advanceReview(itemId: string, today: string, maxStage: number): void {
    const r = this.#reviews.find((x) => x.itemId === itemId);
    if (r) {
      r.lastDate = today;
      r.stage = Math.min(r.stage + 1, maxStage);
    }
  }

  ownedBadges(): Readonly<Record<string, { at: string }>> {
    return this.#badges;
  }
  isBadgeOwned(id: string): boolean {
    return this.#badges[id] !== undefined;
  }
  awardBadge(id: string, at: string): void {
    if (!this.#badges[id]) this.#badges[id] = { at };
  }
  badgeAt(id: string): string | null {
    return this.#badges[id]?.at ?? null;
  }

  get lastSurprise(): Surprise | null {
    return this.#lastSurprise;
  }
  setLastSurprise(s: Surprise): void {
    this.#lastSurprise = s;
  }
}
