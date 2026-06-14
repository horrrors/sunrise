import { Tracker } from './domain/tracker.ts';
import { Projections } from './domain/projections.ts';
import { Streaks } from './domain/streaks.ts';
import { ProgressStats } from './domain/progress-stats.ts';
import { BadgeEngine } from './domain/badge-engine.ts';
import {
  DEFAULT_UI,
  DEFAULT_STREAK_WORDS,
  DEFAULT_MOTTOS,
  GENERIC_BADGES,
  BUILTIN_THEMES,
  SUPPORTED_LANGS,
} from './domain/builtins.ts';
import { SystemClock } from './adapters/system-clock.ts';
import { MathRandom } from './adapters/math-random.ts';
import {
  LocalStorageProgressStore,
  LocalStorageSessionStore,
  LocalStoragePluginStore,
  migrateLegacy,
} from './adapters/local-storage-store.ts';
import { WindowPluginRegistry } from './adapters/window-registry.ts';
import { DomRenderer } from './adapters/dom-renderer.ts';
import { DomController } from './adapters/dom-controller.ts';
import { watchMobileMode } from './adapters/mobile-mode.ts';
import { Importer } from './domain/plugins/importer.ts';
import { PackPlugin } from './domain/plugins/pack-plugin.ts';
import { ThemePlugin } from './domain/plugins/theme-plugin.ts';
import { ProgressPlugin } from './domain/plugins/progress-plugin.ts';

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
    // Shared calculators — the same instances feed the write model (Tracker) and
    // the read model (Projections).
    const streaks = new Streaks();
    const stats = new ProgressStats();
    const clock = new SystemClock();
    const badges = new BadgeEngine(streaks, stats);
    const tracker = new Tracker({
      packs: registry,
      themes: registry,
      progressStore: new LocalStorageProgressStore(),
      sessionStore: new LocalStorageSessionStore(),
      clock,
      random: new MathRandom(),
      streaks,
      stats,
      badges,
      defaultUi: DEFAULT_UI,
      genericBadges: GENERIC_BADGES,
      defaultStreakWords: DEFAULT_STREAK_WORDS,
      defaultMottos: DEFAULT_MOTTOS,
      supportedLangs: SUPPORTED_LANGS,
    });
    const projections = new Projections(() => tracker.view(), {
      clock,
      streaks,
      stats,
      badges,
      packs: registry,
      themes: registry,
      defaultUi: DEFAULT_UI,
      defaultStreakWords: DEFAULT_STREAK_WORDS,
    });
    // Import pipeline: replay user-imported packs/themes from storage AFTER the
    // built-in/script-tag plugins are registered, so a built-in wins any id clash.
    const importer = new Importer(
      [new PackPlugin(registry), new ThemePlugin(registry), new ProgressPlugin(tracker)],
      new LocalStoragePluginStore(),
    );
    importer.loadStored();
    tracker.init(); // throws if no packs registered (now sees stored plugins too)
    new DomController(tracker, projections, renderer, importer).start();
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
