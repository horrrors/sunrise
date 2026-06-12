import { Tracker } from './domain/tracker.ts';
import { Streaks } from './domain/streaks.ts';
import { ProgressStats } from './domain/progress-stats.ts';
import { BadgeEngine } from './domain/badge-engine.ts';
import {
  DEFAULT_UI,
  DEFAULT_STREAK_WORDS,
  DEFAULT_MOTTOS,
  GENERIC_BADGES,
  BUILTIN_THEMES,
} from './domain/builtins.ts';
import { SystemClock } from './adapters/system-clock.ts';
import { MathRandom } from './adapters/math-random.ts';
import {
  LocalStorageProgressStore,
  LocalStorageSessionStore,
  migrateLegacy,
} from './adapters/local-storage-store.ts';
import { WindowPluginRegistry } from './adapters/window-registry.ts';
import { DomRenderer } from './adapters/dom-renderer.ts';
import { DomController } from './adapters/dom-controller.ts';
import { watchMobileMode } from './adapters/mobile-mode.ts';

declare global {
  interface Window {
    SUNRISE?: { registerPack(p: unknown): void; registerTheme(t: unknown): void };
  }
}

const registry = new WindowPluginRegistry();
registry.addBuiltinThemes(BUILTIN_THEMES);
window.SUNRISE = {
  registerPack: (p) => registry.registerPack(p),
  registerTheme: (t) => registry.registerTheme(t),
};

watchMobileMode((q) => window.matchMedia(q), document.documentElement);

// PWA: register the offline shell + ask for durable storage. http(s) only —
// the file:// desktop flow must stay silent (a SW cannot register there).
if (location.protocol.startsWith('http') && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
  void navigator.storage?.persist?.();
}

function boot(): void {
  const renderer = new DomRenderer();
  try {
    migrateLegacy();
    const streaks = new Streaks();
    const stats = new ProgressStats();
    const tracker = new Tracker({
      packs: registry,
      themes: registry,
      progressStore: new LocalStorageProgressStore(),
      sessionStore: new LocalStorageSessionStore(),
      clock: new SystemClock(),
      random: new MathRandom(),
      streaks,
      stats,
      badges: new BadgeEngine(streaks, stats),
      defaultUi: DEFAULT_UI,
      genericBadges: GENERIC_BADGES,
      defaultStreakWords: DEFAULT_STREAK_WORDS,
      defaultMottos: DEFAULT_MOTTOS,
    });
    tracker.init(); // throws if no packs registered
    new DomController(tracker, renderer).start();
  } catch (err) {
    console.error('[sunrise] boot failed:', err);
    renderer.stub(
      'Failed to start. Check that dist/sunrise.js and data/packs/* sit next to index.html; details below and in the console.',
      [
        ...registry
          .rejected()
          .map(
            (r) => `${r.kind} "${r.id}": ${r.issues.map((i) => `${i.path} ${i.msg}`).join(', ')}`,
          ),
        `error: ${String(err)}`,
      ],
    );
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
