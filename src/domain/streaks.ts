import type { Progress } from './progress.ts';
import { addDays, diffDays } from './dates.ts';

export class Streaks {
  current(progress: Progress, today: string): number {
    const set = new Set(progress.completedDates());
    if (set.size === 0) return 0;
    let cursor: string;
    if (set.has(today)) cursor = today;
    else if (set.has(addDays(today, -1))) cursor = addDays(today, -1);
    else return 0;
    let n = 0;
    while (set.has(cursor)) { n++; cursor = addDays(cursor, -1); }
    return n;
  }
  longest(progress: Progress): number {
    const dates = progress.completedDates();
    if (dates.length === 0) return 0;
    let best = 1, cur = 1;
    for (let i = 1; i < dates.length; i++) {
      if (diffDays(dates[i - 1]!, dates[i]!) === 1) cur++;
      else cur = 1;
      if (cur > best) best = cur;
    }
    return best;
  }
  hasComeback(progress: Progress): boolean {
    const dates = progress.completedDates();
    for (let i = 1; i < dates.length; i++) if (diffDays(dates[i - 1]!, dates[i]!) >= 2) return true;
    return false;
  }
}
