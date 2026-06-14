import type { BadgeRule } from './badge-rule.ts';
import type { Localized } from './entities.ts';
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
  badges: BadgeEngine;
  defaultUi: Record<string, Localized>;
  genericBadges: readonly BadgeRule[];
  defaultStreakWords: Record<string, readonly string[]>;
  defaultMottos: readonly Localized[];
  supportedLangs: readonly { id: string; label: string }[];
}
