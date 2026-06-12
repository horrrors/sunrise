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
import type { ProgressStore, SessionStore } from '../../src/ports/index.ts';
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

function buildTracker(opts: {
  packs: Pack[];
  store?: Map<string, Progress>;
  session?: Session;
  randomValue?: number;
}) {
  const store = opts.store ?? new Map<string, Progress>();
  const progressStore: ProgressStore = {
    load: (id) => store.get(id) ?? Progress.empty(),
    save: (id, p) => void store.set(id, p),
  };
  let session: Session = opts.session ?? {};
  const sessionStore: SessionStore = { load: () => session, save: (s) => void (session = s) };
  let today = '2026-05-30';
  const t = new Tracker({
    packs: { packs: () => opts.packs },
    themes: { themes: () => [THEME] },
    progressStore,
    sessionStore,
    clock: { today: () => today, hour: () => 14 },
    random: { next: () => opts.randomValue ?? 0.99 },
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
  return { t, store, getSession: () => session, setToday: (d: string) => void (today = d) };
}

test('completing the active item unlocks + persists first-light', () => {
  const { t, store } = buildTracker({ packs: [PACK] });
  const res = t.setTaskDone('t1', true);
  assert.ok(res.unlockedBadges.includes('first-light'));
  assert.ok(store.get('p')!.isBadgeOwned('first-light'));
});
test('dashboard + today + trophies shapes', () => {
  const { t } = buildTracker({ packs: [PACK] });
  assert.equal(typeof t.dashboard().overall.pct, 'number');
  assert.equal(t.todayCard().itemId, 'i1');
  assert.equal(t.trophies().length, GENERIC_BADGES.length);
});
test('export → import round-trips', () => {
  const { t } = buildTracker({ packs: [PACK] });
  t.setTaskDone('t1', true);
  const json = t.exportProgress();
  t.setTaskDone('t1', false);
  t.importProgress(json);
  assert.equal(t.todayCard().tasks[0]!.done, true);
});

test('importProgress throws ImportError on bad JSON', () => {
  const { t } = buildTracker({ packs: [PACK] });
  assert.throws(
    () => t.importProgress('{bad json'),
    (e: unknown) => e instanceof ImportError,
  );
});

test("importProgress rejects another pack's export; tolerates old exports without packId", () => {
  const { t } = buildTracker({ packs: [PACK] });
  const foreign = JSON.stringify({
    packId: 'other',
    schema: 'sunrise.progress/v1',
    items: {},
    reviews: [],
    badges: {},
  });
  assert.throws(
    () => t.importProgress(foreign),
    (e: unknown) => e instanceof ImportError && /other/.test((e as Error).message),
  );
  const legacy = JSON.stringify({
    schema: 'sunrise.progress/v1',
    items: {},
    reviews: [],
    badges: {},
  });
  assert.doesNotThrow(() => t.importProgress(legacy));
});

test('importProgress reconciles a stale completedAt against the current pack', () => {
  const { t, store } = buildTracker({ packs: [PACK] });
  // completedAt set but i1's task unchecked — e.g. an export made under an
  // older pack version, before the item gained its task.
  const stale = JSON.stringify({
    packId: 'p',
    schema: 'sunrise.progress/v1',
    items: { i1: { tasks: {}, reflection: '', completedAt: '2026-05-29', completedHour: 9 } },
    reviews: [],
    badges: {},
  });
  t.importProgress(stale);
  assert.equal(store.get('p')!.completedCount(), 0); // healed immediately, not on next load
});

test('exportProgress embeds the active pack id', () => {
  const { t } = buildTracker({ packs: [PACK] });
  assert.equal(JSON.parse(t.exportProgress()).packId, 'p');
});

test('surprise branch fires with zero Random', () => {
  const packWithSurprises: Pack = { ...PACK, surprises: ['nice work'] };
  const { t } = buildTracker({ packs: [packWithSurprises], randomValue: 0 });
  const res = t.setTaskDone('t1', true);
  assert.equal(res.surprise, 'nice work');
});

test('a pack badge reusing a generic id overrides condition AND displayed meta', () => {
  const overriding: Pack = {
    ...PACK,
    badges: [
      { id: 'first-light', type: 'days-done', gte: 99, title: 'CUSTOM', desc: 'mine', icon: '★' },
    ],
  };
  const { t } = buildTracker({ packs: [overriding] });
  assert.equal(t.trophies().length, GENERIC_BADGES.length); // replaced, not appended
  const tro = t.trophies().find((x) => x.id === 'first-light')!;
  assert.equal(tro.title, 'CUSTOM');
  t.setTaskDone('t1', true);
  assert.equal(t.trophies().find((x) => x.id === 'first-light')!.unlocked, false); // gte:99 wins
});

test('badge awards are eager: a reflection-driven trophy persists without item completion', () => {
  const pack: Pack = {
    ...PACK,
    badges: [{ id: 'noted', type: 'reflections', gte: 1, title: 'Noted' }],
  };
  const { t, store } = buildTracker({ packs: [pack] });
  t.setReflection('thoughts');
  assert.ok(store.get('p')!.isBadgeOwned('noted')); // persisted, not just displayed
  t.setReflection(''); // condition regresses — award sticks
  assert.equal(t.trophies().find((x) => x.id === 'noted')!.unlocked, true);
});

test('reviews are keyed by item id and surface as titles on the rest card', () => {
  const pack: Pack = {
    ...PACK,
    settings: { reviews: true },
    tracks: [{ id: 'dsa', label: 'DSA', reviewable: true }],
    groups: [
      {
        id: 'g1',
        title: 'Week 1',
        items: [
          { id: 'i1', track: 'dsa', title: 'Graphs', tasks: [{ id: 't1', text: 'x' }] },
          { id: 'r1', track: 'rest', rest: true },
        ],
      },
    ],
  };
  const { t, store, setToday } = buildTracker({ packs: [pack] });
  t.scheduleReviewForCurrent(); // current = i1
  assert.deepEqual(store.get('p')!.getReviewList()[0], { itemId: 'i1', lastDate: '2026-05-30' });
  setToday('2026-05-31');
  t.selectItem('r1');
  assert.deepEqual(t.todayCard().dueReviews, ['Graphs']); // title, not id
});

test('streak word uses Slavic plural rules (21 → one-form, 22 → few-form)', () => {
  const mk = (n: number) => {
    const items: Record<string, ItemProgress> = {};
    for (let i = 0; i < n; i++) {
      const d = new Date(Date.UTC(2026, 4, 30 - i)); // consecutive days ending 2026-05-30
      items['x' + i] = {
        tasks: {},
        reflection: '',
        completedAt: d.toISOString().slice(0, 10),
        completedHour: 12,
      };
    }
    const store = new Map<string, Progress>();
    store.set('p', new Progress({ schema: 'sunrise.progress/v1', items, reviews: [], badges: {} }));
    return buildTracker({ packs: [PACK], store }).t;
  };
  assert.equal(mk(21).dashboard().streakWord, DEFAULT_STREAK_WORDS[0]); // 21 день
  assert.equal(mk(22).dashboard().streakWord, DEFAULT_STREAK_WORDS[1]); // 22 дня
  assert.equal(mk(11).dashboard().streakWord, DEFAULT_STREAK_WORDS[2]); // 11 дней
  assert.equal(mk(5).dashboard().streakWord, DEFAULT_STREAK_WORDS[2]); // 5 дней
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
  const { t } = buildTracker({ packs: [PACK, PACK2] });

  // Complete the item in pack 1
  t.setTaskDone('t1', true);
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
  const { t } = buildTracker({ packs: [CARD_PACK] });

  let vm = t.cardMap();
  assert.equal(vm.groups.length, 2);
  assert.equal(vm.groups[0]!.title, 'Week 1');
  assert.equal(vm.groups[0]!.items.length, 2);
  assert.equal(vm.total, 2, 'rest excluded from total'); // a1, b1
  assert.equal(vm.done, 0);
  assert.equal(vm.groups[0]!.items[0]!.id, 'a1');
  assert.equal(vm.groups[0]!.items[0]!.current, true, 'a1 is the default current item');
  assert.equal(vm.groups[0]!.items[1]!.rest, true, 'rest flagged');

  t.setTaskDone('t1', true); // completes a1 (the current item)
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
      new Progress({ schema: 'sunrise.progress/v1', items, reviews: [], badges: {} }),
    );
  }
  const { t, getSession } = buildTracker({
    packs: [RESUME_PACK],
    store,
    session: opts.session ?? {},
  });
  return { t, getSession };
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
  const { t } = makeResumeTracker({
    session: { cursors: { resume: 'c3' } },
    complete: ['c3', 'c4'],
  });
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
