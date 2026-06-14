import type { ProgressStore, SessionStore, PluginStore } from '../ports/index.ts';
import type { Session } from '../domain/types/entities.ts';
import { Progress } from '../domain/progress.ts';
import { ProgressValidator } from '../domain/validators.ts';

const PREFIX = 'sunrise.progress.';
const SESSION = 'sunrise.session';
const PLUGINS = 'sunrise.plugins';
const LEGACY = 'devRoadmapState.v1';
const LEGACY_THEME = 'sunriseTheme';

export class LocalStorageProgressStore implements ProgressStore {
  private validator = new ProgressValidator();
  public load(packId: string): Progress {
    let raw: string | null;
    try {
      raw = localStorage.getItem(PREFIX + packId);
    } catch {
      return Progress.empty();
    }
    if (!raw) return Progress.empty();
    try {
      return new Progress(this.validator.parse(JSON.parse(raw)));
    } catch (e) {
      // The next save would overwrite the unreadable blob — keep a copy for manual recovery.
      console.error(
        `[sunrise] progress for "${packId}" is unreadable, starting empty (backup at ${PREFIX}${packId}.corrupt):`,
        e,
      );
      try {
        localStorage.setItem(PREFIX + packId + '.corrupt', raw);
      } catch {
        /* quota */
      }
      return Progress.empty();
    }
  }
  public save(packId: string, p: Progress): void {
    try {
      localStorage.setItem(PREFIX + packId, JSON.stringify(p.toJSON(), null, 2));
    } catch {
      /* quota */
    }
  }
}

function readSession(): Session {
  try {
    const raw = localStorage.getItem(SESSION);
    const o: unknown = raw ? JSON.parse(raw) : {};
    return o && typeof o === 'object' && !Array.isArray(o) ? (o as Session) : {};
  } catch {
    return {};
  }
}

export class LocalStorageSessionStore implements SessionStore {
  public load(): Session {
    return readSession();
  }
  public save(s: Session): void {
    try {
      localStorage.setItem(SESSION, JSON.stringify(s));
    } catch {
      /* quota */
    }
  }
}

// User-imported packs/themes, persisted as a flat list of raw, self-describing
// (each carries its own `schema`) JSON objects so a new plugin kind needs no
// storage-format change. Re-registered at boot by Importer.loadStored().
export class LocalStoragePluginStore implements PluginStore {
  public load(): unknown[] {
    try {
      const raw = localStorage.getItem(PLUGINS);
      const o: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(o) ? o : [];
    } catch {
      return [];
    }
  }
  public append(raw: unknown): void {
    try {
      const list = this.load();
      list.push(raw);
      localStorage.setItem(PLUGINS, JSON.stringify(list));
    } catch {
      /* quota */
    }
  }
}

export function migrateLegacy(): void {
  try {
    const legacy = localStorage.getItem(LEGACY);
    if (!legacy || localStorage.getItem(PREFIX + 'dev-roadmap')) return;
    const data = new ProgressValidator().parse(JSON.parse(legacy)); // maps days→items
    localStorage.setItem(PREFIX + 'dev-roadmap', JSON.stringify(data, null, 2));
    const sess = readSession();
    if (!sess.activePackId) sess.activePackId = 'dev-roadmap';
    const th = localStorage.getItem(LEGACY_THEME);
    if (th && !sess.themeId) sess.themeId = th;
    localStorage.setItem(SESSION, JSON.stringify(sess));
  } catch {
    /* never block boot */
  }
}
