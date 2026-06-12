import type { Progress } from './progress.ts';
import { diffDays } from './dates.ts';

// Reviews are passive reminders: a scheduled item surfaces on rest days from the
// next day onward, until the user re-schedules it (which resets the date).
export class ReviewSchedule {
  public due(progress: Progress, today: string): string[] {
    return progress
      .getReviewList()
      .filter((r) => diffDays(r.lastDate, today) >= 1)
      .map((r) => r.itemId);
  }
  public schedule(progress: Progress, itemId: string, today: string): void {
    progress.scheduleReview(itemId, today);
  }
}
