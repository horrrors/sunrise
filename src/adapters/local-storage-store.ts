import type { ProgressStore, SessionStore } from '../ports/index.ts';
import type { Session } from '../domain/entities.types.ts';
import { Progress } from '../domain/progress.ts';
import { ProgressValidator } from '../domain/validators.ts';

const PREFIX = 'sunrise.progress.';
const SESSION = 'sunrise.session';
const LEGACY = 'devRoadmapState.v1';
const LEGACY_THEME = 'sunriseTheme';

export class LocalStorageProgressStore implements ProgressStore {
  private validator = new ProgressValidator();
  public load(packId: string): Progress {
    try {
      const raw = localStorage.getItem(PREFIX + packId);
      if (!raw) return Progress.empty();
      return new Progress(this.validator.parse(JSON.parse(raw)));
    } catch { return Progress.empty(); }
  }
  public save(packId: string, p: Progress): void {
    try { localStorage.setItem(PREFIX + packId, JSON.stringify(p.toJSON(), null, 2)); } catch { /* quota */ }
  }
}

function readSession(): Session {
  try {
    const raw = localStorage.getItem(SESSION);
    const o: unknown = raw ? JSON.parse(raw) : {};
    return o && typeof o === 'object' && !Array.isArray(o) ? (o as Session) : {};
  } catch { return {}; }
}

export class LocalStorageSessionStore implements SessionStore {
  public load(): Session { return readSession(); }
  public save(s: Session): void { try { localStorage.setItem(SESSION, JSON.stringify(s)); } catch { /* quota */ } }
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
  } catch { /* never block boot */ }
}
