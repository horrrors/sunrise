import type { BadgeRule } from './badge-rule.ts';
import type {
  Clock,
  Random,
  ProgressStore,
  SessionStore,
  PackSource,
  ThemeSource,
} from '../../ports/index.ts';
import type { Streaks } from '../streaks.ts';
import type { ProgressStats } from '../progress-stats.ts';
import type { ReviewSchedule } from '../review-schedule.ts';
import type { BadgeEngine } from '../badge-engine.ts';

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
  defaultStreakWords: readonly string[];
  defaultMottos: readonly string[];
}
