import type { Pack, Item, Group, Localized } from './types/entities.ts';
import type { BadgeRule } from './types/badge-rule.ts';
import type { TrackerDeps } from './types/tracker.ts';
import { Progress } from './progress.ts';
import { ImportError } from './errors.ts';
import type { ProgressData } from './types/progress.ts';
import type { ProgressTarget } from './plugins/import-handler.ts';
import type { TrackerView } from './types/projections.ts';
import { tr, DEFAULT_LANG } from './i18n.ts';
import type { CompleteResult } from './types/view-models.ts';

const SURPRISE_CHANCE = 0.12;

export class Tracker implements ProgressTarget {
  private deps: TrackerDeps;
  private pack!: Pack;
  private progress!: Progress;
  private themeId: string | null = null;
  private currentItemId = '';
  private rules: readonly BadgeRule[] = [];
  private allItems: Item[] = [];
  private groupOfItem: Record<string, Group> = {};
  private mottosList: readonly Localized[] = [];
  private lang: string = DEFAULT_LANG;

  constructor(deps: TrackerDeps) {
    this.deps = deps;
  }

  // ----- lifecycle -----------------------------------------------------------

  public init(): void {
    const packs = this.deps.packs.packs();
    if (packs.length === 0) throw new Error('no packs registered');
    const sess = this.deps.sessionStore.load();
    this.lang = sess.lang ?? DEFAULT_LANG;
    const pack = packs.find((p) => p.id === sess.activePackId) ?? packs[0]!;
    this.loadPack(pack.id);
    const themes = this.deps.themes.themes();
    const theme = themes.find((t) => t.id === sess.themeId) ?? themes[0];
    this.themeId = theme ? theme.id : null;
    this.currentItemId = this.resumeItemId();
  }

  private loadPack(packId: string): void {
    const packs = this.deps.packs.packs();
    this.pack = packs.find((p) => p.id === packId) ?? packs[0]!;
    this.progress = this.deps.progressStore.load(this.pack.id);
    // Last wins, so a pack badge reusing a generic id overrides both its
    // condition and its displayed title/desc/icon.
    const byId = new Map<string, BadgeRule>();
    for (const r of [...this.deps.genericBadges, ...(this.pack.badges ?? [])]) byId.set(r.id, r);
    this.rules = [...byId.values()];
    this.allItems = this.pack.groups.flatMap((g) => [...g.items]);
    this.groupOfItem = {};
    for (const g of this.pack.groups) for (const it of g.items) this.groupOfItem[it.id] = g;
    this.mottosList =
      this.pack.mottos && this.pack.mottos.length ? this.pack.mottos : this.deps.defaultMottos;
    if (this.progress.reconcile(this.allItems)) this.save();
  }

  private save(): void {
    this.deps.progressStore.save(this.pack.id, this.progress);
  }

  // ----- helpers -------------------------------------------------------------

  private itemOf(id: string): Item {
    const it = this.allItems.find((x) => x.id === id);
    if (!it) throw new Error(`unknown item "${id}"`);
    return it;
  }
  // The card to open on load: the first unfinished card at or after the stored
  // cursor (so a partial card resumes; a finished one advances to the next). No
  // valid cursor → scan from the start (first unfinished). Forward-only — an
  // earlier skip is never auto-reopened; the card map is for revisiting those.
  private resumeItemId(): string {
    const storedId = this.deps.sessionStore.load().cursors?.[this.pack.id];
    const at = storedId ? this.allItems.findIndex((it) => it.id === storedId) : -1;
    for (let j = at >= 0 ? at : 0; j < this.allItems.length; j++) {
      const it = this.allItems[j]!;
      if (!it.rest && !this.progress.isItemComplete(it)) return it.id;
    }
    return this.allItems[this.allItems.length - 1]!.id;
  }

  private persistCursor(): void {
    const sess = this.deps.sessionStore.load();
    sess.cursors = { ...(sess.cursors ?? {}), [this.pack.id]: this.currentItemId };
    this.deps.sessionStore.save(sess);
  }
  private itemIndex(): number {
    return this.allItems.findIndex((it) => it.id === this.currentItemId);
  }
  // Badge awards must stick the moment a trophy shows as earned, so every
  // progress mutation syncs awards — not just item completion (which also toasts).
  private syncBadges(): string[] {
    return this.deps.badges.sync(this.pack, this.progress, this.rules, this.deps.clock.today());
  }

  // ----- intents -------------------------------------------------------------

  public setTaskDone(taskId: string, done: boolean): CompleteResult {
    const item = this.itemOf(this.currentItemId);
    const wasComplete = this.progress.isItemComplete(item);
    this.progress.setTaskDone(item, taskId, done, this.deps.clock.today(), this.deps.clock.hour());
    if (!wasComplete && this.progress.isItemComplete(item)) return this.onItemCompleted();
    this.syncBadges();
    this.save();
    return { unlockedBadges: [] };
  }

  private onItemCompleted(): CompleteResult {
    const unlocked = this.syncBadges();
    this.save();
    const result: CompleteResult = { unlockedBadges: unlocked };
    if (this.deps.random.next() < SURPRISE_CHANCE) {
      const pool = this.pack.surprises ?? [];
      const msg = pool.length ? pool[Math.floor(this.deps.random.next() * pool.length)] : undefined;
      if (msg) result.surprise = tr(msg, this.lang);
    }
    return result;
  }

  public setReflection(text: string): void {
    this.progress.setReflection(this.currentItemId, text);
    this.syncBadges();
    this.save();
  }

  public selectItem(id: string): void {
    this.currentItemId = id;
    this.persistCursor();
  }

  public goToItem(delta: number): void {
    const i = this.itemIndex();
    const j = Math.min(Math.max(i + delta, 0), this.allItems.length - 1);
    if (j !== i) {
      this.currentItemId = this.allItems[j]!.id;
      this.persistCursor();
    }
  }

  public selectPack(id: string): void {
    const sess = this.deps.sessionStore.load();
    sess.activePackId = id;
    this.deps.sessionStore.save(sess);
    this.loadPack(id);
    this.currentItemId = this.resumeItemId();
  }

  public selectTheme(id: string): void {
    const sess = this.deps.sessionStore.load();
    sess.themeId = id;
    this.deps.sessionStore.save(sess);
    this.themeId = id;
  }

  public setLang(id: string): void {
    const sess = this.deps.sessionStore.load();
    sess.lang = id;
    this.deps.sessionStore.save(sess);
    this.lang = id;
  }

  // ProgressTarget: apply an already-validated progress blob (the ProgressPlugin
  // parses + validates; Tracker owns the active-pack aggregate). A file carrying a
  // packId for another *loaded* pack switches to it; an unloaded one is rejected.
  public importProgress(packId: string | null, data: ProgressData): string {
    if (packId != null && packId !== this.pack.id) {
      if (!this.deps.packs.packs().some((p) => p.id === packId)) {
        throw new ImportError(`load the pack "${packId}" before importing its progress`);
      }
      this.selectPack(packId); // switches active pack + cursor + loads its store
    }
    this.progress = new Progress(data);
    // Same healing as loadPack: the file's completedAt may disagree with its
    // task checks under the current pack version (streaks vs dashboard).
    this.progress.reconcile(this.allItems);
    this.save();
    this.currentItemId = this.resumeItemId();
    return this.pack.id;
  }

  public exportProgress(): string {
    return JSON.stringify({ packId: this.pack.id, ...this.progress.toJSON() }, null, 2);
  }

  // Readonly snapshot for the Projections read model (CQS): queries read this,
  // never the private fields directly.
  public view(): TrackerView {
    return {
      pack: this.pack,
      progress: this.progress,
      lang: this.lang,
      themeId: this.themeId,
      currentItemId: this.currentItemId,
      rules: this.rules,
      allItems: this.allItems,
      groupOfItem: this.groupOfItem,
      mottosList: this.mottosList,
    };
  }

  // ----- state getters (raw; localized view-models live in Projections) ------

  public activeThemeHref(): string | null {
    const theme = this.deps.themes.themes().find((t) => t.id === this.themeId);
    return theme?.cssHref ?? null;
  }

  public activeThemeId(): string | null {
    return this.themeId;
  }

  public activePackId(): string {
    return this.pack.id;
  }

  public currentLang(): string {
    return this.lang;
  }

  public langs(): readonly { id: string; label: string }[] {
    return this.deps.supportedLangs;
  }
}
