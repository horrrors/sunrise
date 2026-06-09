import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Tracker } from '../../src/domain/tracker.ts';
import { Progress } from '../../src/domain/progress.ts';
import { Streaks } from '../../src/domain/streaks.ts';
import { ProgressStats } from '../../src/domain/progress-stats.ts';
import { ReviewSchedule } from '../../src/domain/review-schedule.ts';
import { BadgeEngine } from '../../src/domain/badge-engine.ts';
import type { Pack, Theme, Session } from '../../src/domain/types/entities.ts';
import type { ItemProgress } from '../../src/domain/types/progress.ts';
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
  DEFAULT_STREAK_WORDS,
  DEFAULT_MOTTOS,
} from '../../src/domain/builtins.ts';
import { ImportError } from '../../src/domain/errors.ts';

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
    defaultStreakWords: DEFAULT_STREAK_WORDS,
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

test('importProgress throws ImportError on bad JSON', () => {
  const { t } = makeTracker();
  assert.throws(
    () => t.importProgress('{bad json'),
    (e: unknown) => e instanceof ImportError,
  );
});

test('surprise branch fires with zero Random', () => {
  const store = new Map<string, Progress>();
  const progressStore: ProgressStore = {
    load: (id) => store.get(id) ?? Progress.empty(),
    save: (id, p) => void store.set(id, p),
  };
  let session: Session = {};
  const sessionStore: SessionStore = { load: () => session, save: (s) => void (session = s) };
  const packWithSurprises: Pack = {
    ...PACK,
    surprises: ['nice work'],
  };
  const packs: PackSource = { packs: () => [packWithSurprises] };
  const themes: ThemeSource = { themes: () => [THEME] };
  const clock: Clock = { today: () => '2026-05-30', hour: () => 14 };
  const random: Random = { next: () => 0 }; // 0 < 0.12 gate
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
    defaultStreakWords: DEFAULT_STREAK_WORDS,
    defaultMottos: DEFAULT_MOTTOS,
  });
  t.init();
  const res = t.toggleTask('t1', true);
  assert.equal(res.surprise, 'nice work');
});

test('selectPack reloads per-pack progress + resets current item', () => {
  const PACK2: Pack = {
    schema: 'sunrise.pack/v1',
    id: 'p2',
    name: 'P2',
    version: '1.0.0',
    tracks: [{ id: 'dsa', label: 'DSA' }],
    groups: [
      {
        id: 'g2',
        title: 'W',
        items: [{ id: 'p2i1', track: 'dsa', title: 'B', tasks: [{ id: 't1', text: 'y' }] }],
      },
    ],
  };
  const store = new Map<string, Progress>();
  const progressStore: ProgressStore = {
    load: (id) => store.get(id) ?? Progress.empty(),
    save: (id, p) => void store.set(id, p),
  };
  let session: Session = {};
  const sessionStore: SessionStore = { load: () => session, save: (s) => void (session = s) };
  const packs: PackSource = { packs: () => [PACK, PACK2] };
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
    defaultStreakWords: DEFAULT_STREAK_WORDS,
    defaultMottos: DEFAULT_MOTTOS,
  });
  t.init();

  // Complete the item in pack 1
  t.toggleTask('t1', true);
  assert.ok(t.todayCard().complete);

  // Switch to pack 2 — current item should reset to pack 2's first item
  t.selectPack('p2');
  assert.equal(t.todayCard().itemId, 'p2i1');
  assert.ok(!t.todayCard().complete); // pack 2 progress is independent

  // Switch back — pack 1 progress persisted
  t.selectPack('p');
  assert.ok(t.todayCard().complete);
});

test('cardMap: groups, current flag, rest excluded from counts', () => {
  const CARD_PACK: Pack = {
    schema: 'sunrise.pack/v1',
    id: 'cm',
    name: 'CM',
    version: '1.0.0',
    tracks: [{ id: 'dsa', label: 'DSA' }],
    groups: [
      {
        id: 'g1',
        title: 'Week 1',
        items: [
          { id: 'a1', track: 'dsa', title: 'A1', tasks: [{ id: 't1', text: 'x' }] },
          { id: 'rest1', track: 'dsa', rest: true },
        ],
      },
      {
        id: 'g2',
        title: 'Week 2',
        items: [{ id: 'b1', track: 'dsa', title: 'B1', tasks: [{ id: 't2', text: 'y' }] }],
      },
    ],
  };
  const store = new Map<string, Progress>();
  const progressStore: ProgressStore = {
    load: (id) => store.get(id) ?? Progress.empty(),
    save: (id, p) => void store.set(id, p),
  };
  let session: Session = {};
  const sessionStore: SessionStore = { load: () => session, save: (s) => void (session = s) };
  const packs: PackSource = { packs: () => [CARD_PACK] };
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
    defaultStreakWords: DEFAULT_STREAK_WORDS,
    defaultMottos: DEFAULT_MOTTOS,
  });
  t.init();

  let vm = t.cardMap();
  assert.equal(vm.groups.length, 2);
  assert.equal(vm.groups[0]!.title, 'Week 1');
  assert.equal(vm.groups[0]!.items.length, 2);
  assert.equal(vm.total, 2, 'rest excluded from total'); // a1, b1
  assert.equal(vm.done, 0);
  assert.equal(vm.groups[0]!.items[0]!.id, 'a1');
  assert.equal(vm.groups[0]!.items[0]!.current, true, 'a1 is the default current item');
  assert.equal(vm.groups[0]!.items[1]!.rest, true, 'rest flagged');

  t.toggleTask('t1', true); // completes a1 (the current item)
  vm = t.cardMap();
  assert.equal(vm.done, 1);
  assert.equal(vm.groups[0]!.items[0]!.done, true);
});

// --- resume cursor ---------------------------------------------------------

const RESUME_PACK: Pack = {
  schema: 'sunrise.pack/v1',
  id: 'resume',
  name: 'Resume',
  version: '1.0.0',
  tracks: [{ id: 'dsa', label: 'DSA' }],
  groups: [
    {
      id: 'g1',
      title: 'Week 1',
      items: [
        { id: 'c1', track: 'dsa', title: 'C1', tasks: [{ id: 't1', text: 'x' }] },
        { id: 'c2', track: 'dsa', title: 'C2', tasks: [{ id: 't2', text: 'x' }] },
        { id: 'c3', track: 'dsa', title: 'C3', tasks: [{ id: 't3', text: 'x' }] },
      ],
    },
    {
      id: 'g2',
      title: 'Week 2',
      items: [{ id: 'c4', track: 'dsa', title: 'C4', tasks: [{ id: 't4', text: 'x' }] }],
    },
  ],
};
const TASK_OF: Record<string, string> = { c1: 't1', c2: 't2', c3: 't3', c4: 't4' };

function makeResumeTracker(opts: { session?: Session; complete?: string[] } = {}) {
  const store = new Map<string, Progress>();
  if (opts.complete && opts.complete.length) {
    const items: Record<string, ItemProgress> = {};
    for (const id of opts.complete) {
      items[id] = {
        tasks: { [TASK_OF[id]!]: true },
        reflection: '',
        completedAt: '2026-05-30',
        completedHour: 14,
      };
    }
    store.set(
      'resume',
      new Progress({ schema: 'sunrise.progress/v1', items, reviews: [], badges: {}, lastSurprise: null }),
    );
  }
  const progressStore: ProgressStore = {
    load: (id) => store.get(id) ?? Progress.empty(),
    save: (id, p) => void store.set(id, p),
  };
  let session: Session = opts.session ?? {};
  const sessionStore: SessionStore = { load: () => session, save: (s) => void (session = s) };
  const packs: PackSource = { packs: () => [RESUME_PACK] };
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
    defaultStreakWords: DEFAULT_STREAK_WORDS,
    defaultMottos: DEFAULT_MOTTOS,
  });
  t.init();
  return { t, getSession: () => session };
}

test('resume: cursor on a partial card reopens that card, not an earlier skip', () => {
  // c1 left unfinished (an earlier skip); cursor parked on the also-unfinished c2.
  const { t } = makeResumeTracker({ session: { cursors: { resume: 'c2' } } });
  assert.equal(t.todayCard().itemId, 'c2');
});

test('resume: cursor on a finished card advances to the next unfinished card', () => {
  // Parked on c2 which is now finished; c1 is an earlier skip → forward to c3.
  const { t } = makeResumeTracker({ session: { cursors: { resume: 'c2' } }, complete: ['c2'] });
  assert.equal(t.todayCard().itemId, 'c3');
});

test('resume: no cursor falls back to the first unfinished card (unchanged)', () => {
  const { t } = makeResumeTracker();
  assert.equal(t.todayCard().itemId, 'c1');
});

test('resume: stale cursor id (not in pack) falls back to first unfinished', () => {
  const { t } = makeResumeTracker({ session: { cursors: { resume: 'ghost' } } });
  assert.equal(t.todayCard().itemId, 'c1');
});

test('resume: everything ahead done → reopen on the last card', () => {
  // Parked on c3; c3 and c4 done; c1 skipped earlier → forward-only → last card c4.
  const { t } = makeResumeTracker({ session: { cursors: { resume: 'c3' } }, complete: ['c3', 'c4'] });
  assert.equal(t.todayCard().itemId, 'c4');
});

test('selectItem persists the cursor to session', () => {
  const { t, getSession } = makeResumeTracker();
  t.selectItem('c3');
  assert.equal(getSession().cursors?.['resume'], 'c3');
});

test('goToItem persists the cursor to session', () => {
  const { t, getSession } = makeResumeTracker(); // resolves to c1
  t.goToItem(1); // → c2
  assert.equal(t.todayCard().itemId, 'c2');
  assert.equal(getSession().cursors?.['resume'], 'c2');
});
