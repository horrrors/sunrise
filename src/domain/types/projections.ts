import type { Pack, Item, Group, Localized } from './entities.ts';
import type { BadgeRule } from './badge-rule.ts';
import type { Progress } from '../progress.ts';
import type { Clock, PackSource, ThemeSource } from '../../ports/index.ts';
import type { Streaks } from '../streaks.ts';
import type { ProgressStats } from '../progress-stats.ts';
import type { BadgeEngine } from '../badge-engine.ts';

// Readonly snapshot of the write model's state that the read model projects into
// view-models. Produced by Tracker.view(); never mutated by Projections.
export interface TrackerView {
  pack: Pack;
  progress: Progress;
  lang: string;
  themeId: string | null;
  currentItemId: string;
  rules: readonly BadgeRule[];
  allItems: readonly Item[];
  groupOfItem: Readonly<Record<string, Group>>;
  mottosList: readonly Localized[];
}

// The subset of TrackerDeps the query/projection layer needs.
export interface ProjectionDeps {
  clock: Clock;
  streaks: Streaks;
  stats: ProgressStats;
  badges: BadgeEngine;
  packs: PackSource;
  themes: ThemeSource;
  defaultUi: Record<string, Localized>;
  defaultStreakWords: Record<string, readonly string[]>;
}
