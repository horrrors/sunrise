import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Tracker } from '../../src/domain/tracker.ts';
import { Progress } from '../../src/domain/progress.ts';
import { Streaks } from '../../src/domain/streaks.ts';
import { ProgressStats } from '../../src/domain/progress-stats.ts';
import { ReviewSchedule } from '../../src/domain/review-schedule.ts';
import { BadgeEngine } from '../../src/domain/badge-engine.ts';
import type { Pack, Theme, Session } from '../../src/domain/entities.ts';
import type {
  ProgressStore,
  SessionStore,
  PackSource,
  ThemeSource,
  Clock,
  Random,
} from '../../src/ports/index.ts';
import {
  DEFAULT_UI,
  GENERIC_BADGES,
  DEFAULT_DOW,
  DEFAULT_STREAK_WORDS,
  DEFAULT_MONTHS,
  DEFAULT_MOTTOS,
} from '../../src/domain/builtins.ts';

const PACK: Pack = {
  schema: 'sunrise.pack/v1',
  id: 'p',
  name: 'P',
  version: '1.0.0',
  tracks: [{ id: 'dsa', label: 'DSA' }],
  groups: [
    {
      id: 'g1',
      title: 'Week 1',
      items: [{ id: 'i1', track: 'dsa', title: 'A', tasks: [{ id: 't1', text: 'x' }] }],
    },
  ],
};
const THEME: Theme = {
  schema: 'sunrise.theme/v1',
  id: 'bonus',
  name: 'Bonus',
  version: '1.0.0',
  cssHref: 'themes/bonus.css',
};

function makeTracker() {
  const store = new Map<string, Progress>();
  const progressStore: ProgressStore = {
    load: (id) => store.get(id) ?? Progress.empty(),
    save: (id, p) => void store.set(id, p),
  };
  let session: Session = {};
  const sessionStore: SessionStore = { load: () => session, save: (s) => void (session = s) };
  const packs: PackSource = { packs: () => [PACK] };
  const themes: ThemeSource = { themes: () => [THEME] };
  const clock: Clock = { today: () => '2026-05-30', hour: () => 14 };
  const random: Random = { next: () => 0.99 };
  const t = new Tracker({
    packs,
    themes,
    progressStore,
    sessionStore,
    clock,
    random,
    streaks: new Streaks(),
    stats: new ProgressStats(),
    reviews: new ReviewSchedule(),
    badges: new BadgeEngine(new Streaks(), new ProgressStats()),
    defaultUi: DEFAULT_UI,
    genericBadges: GENERIC_BADGES,
    defaultDow: DEFAULT_DOW,
    defaultStreakWords: DEFAULT_STREAK_WORDS,
    defaultMonths: DEFAULT_MONTHS,
    defaultMottos: DEFAULT_MOTTOS,
  });
  t.init();
  return { t, store };
}

test('completing the active item unlocks + persists first-light', () => {
  const { t, store } = makeTracker();
  const res = t.toggleTask('t1', true);
  assert.ok(res.unlockedBadges.includes('first-light'));
  assert.ok(store.get('p')!.isBadgeOwned('first-light'));
});
test('dashboard + today + trophies shapes', () => {
  const { t } = makeTracker();
  assert.equal(typeof t.dashboard().overall.pct, 'number');
  assert.equal(t.todayCard().itemId, 'i1');
  assert.equal(t.trophies().length, GENERIC_BADGES.length);
});
test('export → import round-trips', () => {
  const { t } = makeTracker();
  t.toggleTask('t1', true);
  const json = t.exportProgress();
  t.toggleTask('t1', false);
  t.importProgress(json);
  assert.equal(t.todayCard().tasks[0]!.done, true);
});
