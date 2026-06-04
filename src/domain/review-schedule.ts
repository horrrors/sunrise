import type { Progress } from './progress.ts';
import { diffDays } from './dates.ts';

export const REVIEW_INTERVALS = [1, 3, 7, 16] as const;
const MAX_STAGE = REVIEW_INTERVALS.length - 1;

export class ReviewSchedule {
  due(progress: Progress, today: string): string[] {
    return progress.reviewList
      .filter((r) => {
        const stage = Math.min(Math.max(r.stage, 0), MAX_STAGE);
        return diffDays(r.lastDate, today) >= REVIEW_INTERVALS[stage]!;
      })
      .map((r) => r.itemId);
  }
  schedule(progress: Progress, itemId: string, today: string): void {
    progress.scheduleReview(itemId, today);
  }
  complete(progress: Progress, itemId: string, today: string): void {
    progress.advanceReview(itemId, today, MAX_STAGE);
  }
}
