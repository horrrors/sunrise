import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Tracker } from '../../src/domain/tracker.ts';
import { Projections } from '../../src/domain/projections.ts';
import { Progress } from '../../src/domain/progress.ts';
import { Streaks } from '../../src/domain/streaks.ts';
import { ProgressStats } from '../../src/domain/progress-stats.ts';
import { BadgeEngine } from '../../src/domain/badge-engine.ts';
import type { Pack, Theme, Session } from '../../src/domain/types/entities.ts';
import type { ItemProgress } from '../../src/domain/types/progress.ts';
import type { ProgressStore, SessionStore } from '../../src/ports/index.ts';
import {
  DEFAULT_UI,
  GENERIC_BADGES,
  DEFAULT_STREAK_WORDS,
  DEFAULT_MOTTOS,
  SUPPORTED_LANGS,
} from '../../src/domain/builtins.ts';
import { ImportError } from '../../src/domain/errors.ts';

const PACK: Pack = {
  schema: 'sunrise.pack/v1',
  id: 'p',
  name: { en: 'P', ru: 'П' },
  version: '1.0.0',
  tracks: [{ id: 'dsa', label: 'DSA' }],
  groups: [
    {
      id: 'g1',
      title: 'Week 1',
      items: [
        { id: 'i1', track: 'dsa', title: { en: 'A', ru: 'А' }, tasks: [{ id: 't1', text: 'x' }] },
      ],
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
  const packs = { packs: () => opts.packs };
  const themes = { themes: () => [THEME] };
  const clock = { today: () => today, hour: () => 14 };
  const streaks = new Streaks();
  const stats = new ProgressStats();
  const badges = new BadgeEngine(streaks, stats);
  const t = new Tracker({
    packs,
    themes,
    progressStore,
    sessionStore,
    clock,
    random: { next: () => opts.randomValue ?? 0.99 },
    streaks,
    stats,
    badges,
    defaultUi: DEFAULT_UI,
    genericBadges: GENERIC_BADGES,
    defaultStreakWords: DEFAULT_STREAK_WORDS,
    defaultMottos: DEFAULT_MOTTOS,
    supportedLangs: SUPPORTED_LANGS,
  });
  t.init();
  // Read model over the same write model + shared calculators (CQS).
  const q = new Projections(() => t.view(), {
    clock,
    streaks,
    stats,
    badges,
    packs,
    themes,
    defaultUi: DEFAULT_UI,
    defaultStreakWords: DEFAULT_STREAK_WORDS,
  });
  return { t, q, store, getSession: () => session, setToday: (d: string) => void (today = d) };
}

test('completing the active item unlocks + persists first-light', () => {
  const { t, store } = buildTracker({ packs: [PACK] });
  const res = t.setTaskDone('t1', true);
  assert.ok(res.unlockedBadges.includes('first-light'));
  assert.ok(store.get('p')!.isBadgeOwned('first-light'));
});
test('dashboard + today + trophies shapes', () => {
  const { q } = buildTracker({ packs: [PACK] });
  assert.equal(typeof q.dashboard().overall.pct, 'number');
  assert.equal(q.todayCard().itemId, 'i1');
  assert.equal(q.trophies().length, GENERIC_BADGES.length);
});

test('todayCard resolves the active language; setLang flips it', () => {
  const { t, q } = buildTracker({ packs: [PACK], session: { lang: 'en' } });
  assert.equal(q.todayCard().title, 'A');
  t.setLang('ru');
  assert.equal(q.todayCard().title, 'А');
  assert.equal(t.currentLang(), 'ru');
});

test('default language is en when the session has none', () => {
  const { t, q } = buildTracker({ packs: [PACK] });
  assert.equal(t.currentLang(), 'en');
  assert.equal(q.todayCard().title, 'A');
});

test('setLang persists to the session', () => {
  const { t, getSession } = buildTracker({ packs: [PACK] });
  t.setLang('ru');
  assert.equal(getSession().lang, 'ru');
});

test('switching language preserves progress (same packId)', () => {
  const store = new Map<string, Progress>();
  const a = buildTracker({ packs: [PACK], store });
  a.t.setTaskDone('t1', true); // complete item i1
  assert.equal(a.q.dashboard().overall.done, 1);
  // Re-open the same pack under RU — progress is keyed on packId, not language.
  const b = buildTracker({ packs: [PACK], store, session: { lang: 'ru' } });
  assert.equal(b.q.dashboard().overall.done, 1);
});

test('chrome strings resolve per language (ui + trophies)', () => {
  const { t, q } = buildTracker({ packs: [PACK], session: { lang: 'en' } });
  assert.equal(q.ui('summaryTitle'), 'Summary');
  assert.equal(q.trophies().find((b) => b.id === 'halfway')!.title, 'Halfway');
  t.setLang('ru');
  assert.equal(q.ui('summaryTitle'), 'Сводка');
  assert.equal(q.trophies().find((b) => b.id === 'halfway')!.title, 'Экватор');
});

test('dashboard streak word uses the per-language plural forms', () => {
  const { t, q } = buildTracker({ packs: [PACK], session: { lang: 'en' } });
  t.setTaskDone('t1', true); // 1-day streak
  assert.equal(q.dashboard().streak, 1);
  assert.equal(q.dashboard().streakWord, 'day'); // en, index 0
  t.setLang('ru');
  assert.equal(q.dashboard().streakWord, 'день'); // ru, index 0
});
test('export → import round-trips', () => {
  const { t, q } = buildTracker({ packs: [PACK] });
  t.setTaskDone('t1', true);
  const parsed = JSON.parse(t.exportProgress());
  t.setTaskDone('t1', false);
  t.importProgress(parsed.packId, parsed);
  assert.equal(q.todayCard().tasks[0]!.done, true);
});

test('importProgress rejects a packId for an unloaded pack; null targets the active pack', () => {
  const { t } = buildTracker({ packs: [PACK] });
  assert.throws(
    () => t.importProgress('other', { schema: 'sunrise.progress/v1', items: {}, badges: {} }),
    (e: unknown) => e instanceof ImportError && /other/.test((e as Error).message),
  );
  // null packId (or a legacy export without packId) applies to the active pack.
  assert.doesNotThrow(() =>
    t.importProgress(null, { schema: 'sunrise.progress/v1', items: {}, badges: {} }),
  );
});

test('importProgress reconciles a stale completedAt against the current pack', () => {
  const { t, store } = buildTracker({ packs: [PACK] });
  // completedAt set but i1's task unchecked — e.g. an export made under an
  // older pack version, before the item gained its task.
  const stale = {
    schema: 'sunrise.progress/v1' as const,
    items: { i1: { tasks: {}, reflection: '', completedAt: '2026-05-29', completedHour: 9 } },
    badges: {},
  };
  t.importProgress('p', stale);
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
  const { t, q } = buildTracker({ packs: [overriding] });
  assert.equal(q.trophies().length, GENERIC_BADGES.length); // replaced, not appended
  const tro = q.trophies().find((x) => x.id === 'first-light')!;
  assert.equal(tro.title, 'CUSTOM');
  t.setTaskDone('t1', true);
  assert.equal(q.trophies().find((x) => x.id === 'first-light')!.unlocked, false); // gte:99 wins
});

test('badge awards are eager: a reflection-driven trophy persists without item completion', () => {
  const pack: Pack = {
    ...PACK,
    badges: [{ id: 'noted', type: 'reflections', gte: 1, title: 'Noted' }],
  };
  const { t, q, store } = buildTracker({ packs: [pack] });
  t.setReflection('thoughts');
  assert.ok(store.get('p')!.isBadgeOwned('noted')); // persisted, not just displayed
  t.setReflection(''); // condition regresses — award sticks
  assert.equal(q.trophies().find((x) => x.id === 'noted')!.unlocked, true);
});

test('aiPrompt wraps text in the tutor pre-prompt with item context', () => {
  const { q } = buildTracker({ packs: [PACK] }); // en is the default language
  const p = q.aiPrompt('Solve Two Sum', 'name the pattern first');
  assert.ok(p.includes('Solve Two Sum'), 'task text embedded');
  assert.ok(p.includes('“A”'), 'current item title embedded (en)');
  assert.ok(p.includes('DSA'), 'track label embedded');
  assert.ok(p.includes('name the pattern first'), 'guidance embedded');
  assert.ok(!/[{}]/.test(p), 'all placeholders filled');
  const bare = q.aiPrompt('Solve Two Sum');
  assert.ok(bare.includes('Solve Two Sum'));
  // The guidance value (not a substring that collides with the template body).
  assert.ok(!bare.includes('name the pattern first'), 'no guidance line without guidance');
  assert.ok(!bare.includes('Criterion for a strong answer'), 'no guidance label without guidance');
  assert.ok(!/[{}]/.test(bare), 'all placeholders filled without guidance');
});

test('aiPrompt template is pack-overridable like any ui string', () => {
  const pack: Pack = { ...PACK, ui: { aiPrompt: 'ASK: {text}' } };
  const { q } = buildTracker({ packs: [pack] });
  assert.equal(q.aiPrompt('Q'), 'ASK: Q');
});

test('streak word uses Slavic plural rules under ru (21 → one-form, 22 → few-form)', () => {
  const ru = DEFAULT_STREAK_WORDS['ru']!;
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
    store.set('p', new Progress({ schema: 'sunrise.progress/v1', items, badges: {} }));
    return buildTracker({ packs: [PACK], store, session: { lang: 'ru' } }).q;
  };
  assert.equal(mk(21).dashboard().streakWord, ru[0]); // 21 день
  assert.equal(mk(22).dashboard().streakWord, ru[1]); // 22 дня
  assert.equal(mk(11).dashboard().streakWord, ru[2]); // 11 дней
  assert.equal(mk(5).dashboard().streakWord, ru[2]); // 5 дней
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
  const { t, q } = buildTracker({ packs: [PACK, PACK2] });

  // Complete the item in pack 1
  t.setTaskDone('t1', true);
  assert.ok(q.todayCard().complete);

  // Switch to pack 2 — current item should reset to pack 2's first item
  t.selectPack('p2');
  assert.equal(q.todayCard().itemId, 'p2i1');
  assert.ok(!q.todayCard().complete); // pack 2 progress is independent

  // Switch back — pack 1 progress persisted
  t.selectPack('p');
  assert.ok(q.todayCard().complete);
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
  const { t, q } = buildTracker({ packs: [CARD_PACK] });

  let vm = q.cardMap();
  assert.equal(vm.groups.length, 2);
  assert.equal(vm.groups[0]!.title, 'Week 1');
  assert.equal(vm.groups[0]!.items.length, 2);
  assert.equal(vm.total, 2, 'rest excluded from total'); // a1, b1
  assert.equal(vm.done, 0);
  assert.equal(vm.groups[0]!.items[0]!.id, 'a1');
  assert.equal(vm.groups[0]!.items[0]!.current, true, 'a1 is the default current item');
  assert.equal(vm.groups[0]!.items[1]!.rest, true, 'rest flagged');

  t.setTaskDone('t1', true); // completes a1 (the current item)
  vm = q.cardMap();
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
    store.set('resume', new Progress({ schema: 'sunrise.progress/v1', items, badges: {} }));
  }
  const { t, q, getSession } = buildTracker({
    packs: [RESUME_PACK],
    store,
    session: opts.session ?? {},
  });
  return { t, q, getSession };
}

test('resume: cursor on a partial card reopens that card, not an earlier skip', () => {
  // c1 left unfinished (an earlier skip); cursor parked on the also-unfinished c2.
  const { q } = makeResumeTracker({ session: { cursors: { resume: 'c2' } } });
  assert.equal(q.todayCard().itemId, 'c2');
});

test('resume: cursor on a finished card advances to the next unfinished card', () => {
  // Parked on c2 which is now finished; c1 is an earlier skip → forward to c3.
  const { q } = makeResumeTracker({ session: { cursors: { resume: 'c2' } }, complete: ['c2'] });
  assert.equal(q.todayCard().itemId, 'c3');
});

test('resume: no cursor falls back to the first unfinished card (unchanged)', () => {
  const { q } = makeResumeTracker();
  assert.equal(q.todayCard().itemId, 'c1');
});

test('resume: stale cursor id (not in pack) falls back to first unfinished', () => {
  const { q } = makeResumeTracker({ session: { cursors: { resume: 'ghost' } } });
  assert.equal(q.todayCard().itemId, 'c1');
});

test('resume: everything ahead done → reopen on the last card', () => {
  // Parked on c3; c3 and c4 done; c1 skipped earlier → forward-only → last card c4.
  const { q } = makeResumeTracker({
    session: { cursors: { resume: 'c3' } },
    complete: ['c3', 'c4'],
  });
  assert.equal(q.todayCard().itemId, 'c4');
});

test('selectItem persists the cursor to session', () => {
  const { t, getSession } = makeResumeTracker();
  t.selectItem('c3');
  assert.equal(getSession().cursors?.['resume'], 'c3');
});

test('goToItem persists the cursor to session', () => {
  const { t, q, getSession } = makeResumeTracker(); // resolves to c1
  t.goToItem(1); // → c2
  assert.equal(q.todayCard().itemId, 'c2');
  assert.equal(getSession().cursors?.['resume'], 'c2');
});

test('appState exposes progress, streak, and the wall-clock hour', () => {
  const { q } = buildTracker({ packs: [PACK] });
  assert.deepEqual(q.appState(), {
    progress: q.dashboard().overall.pct,
    streak: q.dashboard().streak,
    hour: 14, // the fake clock's hour()
    month: 5, // parsed from the fake clock's today() '2026-05-30'
  });
});
