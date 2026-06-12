import type { Tracker } from '../domain/tracker.ts';
import type { TodayVM } from '../domain/types/view-models.ts';
import type { DomRenderer } from './dom-renderer.ts';
import type { RenderLabels } from './types/dom-renderer.ts';
import { ImportError, ValidationError } from '../domain/errors.ts';

/**
 * Wires DOM events to Tracker intents and re-renders via DomRenderer.
 * A port of app.js `init()` — `L.*`/`state` calls become `this.t.*` intents,
 * re-render goes through `this.r`. The import handler is the catch boundary
 * for ImportError/ValidationError.
 */
export class DomController {
  private t: Tracker;
  private r: DomRenderer;
  private activeModal: string | null = null;
  private activeSheet: 'menu' | 'stats' | null = null;
  private motdTimer: ReturnType<typeof setInterval> | null = null;
  constructor(tracker: Tracker, renderer: DomRenderer) {
    this.t = tracker;
    this.r = renderer;
  }

  public start(): void {
    this.applyStaticLabels();
    const href = this.t.activeThemeHref();
    if (href != null) this.r.applyTheme(href, this.t.activeThemeId() ?? '');
    this.r.applyTrackColors(this.t.trackColors());
    this.r.setLang(this.t.locale());
    this.wire();
    this.renderAll();
    this.startMotd();
  }

  // ----- labels --------------------------------------------------------------

  private labels(): RenderLabels {
    const u = (k: string): string => this.t.ui(k);
    return {
      todayVert: u('todayVert'),
      restVert: u('restVert'),
      warmup: u('warmup'),
      reflect: u('reflect'),
      taskPlaceholder: u('taskPlaceholder'),
      nextDay: u('nextDay'),
      hint: u('hint'),
      overallTitle: u('overallTitle'),
      streakTitle: u('streakTitle'),
      inARow: u('inARow'),
      phasesTitle: u('phasesTitle'),
      tracksTitle: u('tracksTitle'),
      trophies: u('trophies'),
      newTrophy: u('newTrophy'),
    };
  }

  private applyStaticLabels(): void {
    const u = (k: string): string => this.t.ui(k);
    // Icon-only controls: one ui string doubles as aria-label and hover
    // tooltip (data-tip, styled by the canonical baseline in index.html).
    // The ✕ buttons reuse scClose — the same "close" wording as the Esc row.
    const iconLabels: [string, string][] = [
      ['exportBtn', 'export'],
      ['importBtn', 'import'],
      ['cardMapBtn', 'cardMap'],
      ['trophiesBtn', 'trophies'],
      ['prevDay', 'prevDayAria'],
      ['nextDay', 'nextDayAria'],
      ['cardMapClose', 'scClose'],
      ['trophiesClose', 'scClose'],
      ['shortcutsClose', 'scClose'],
      ['dockMapBtn', 'cardMap'],
      ['dockTrophiesBtn', 'trophies'],
      ['dockMenuBtn', 'menu'],
      ['dockBars', 'summaryTitle'],
    ];
    for (const [id, key] of iconLabels) {
      this.r.setAttr(id, 'aria-label', u(key));
      this.r.setAttr(id, 'data-tip', u(key));
    }
    this.r.setAttr('packSelect', 'aria-label', u('pack'));
    this.r.setAttr('themeSelect', 'aria-label', u('theme'));
    this.r.setAttr('daySelect', 'aria-label', this.t.itemLabel());
    this.r.setText('summaryTitle', u('summaryTitle'));
    this.r.setText('todayTitle', u('todayTitle'));
  }

  // ----- render --------------------------------------------------------------

  private renderAll(): void {
    const lbl = this.labels();
    const today = this.t.todayCard();
    this.r.renderSelectors(this.t.selectors());
    this.r.renderToday(today, lbl);
    this.r.renderDashboard(this.t.dashboard(), lbl);
    this.renderComeback();
    this.renderTrophies();
    this.bindTodayHandlers(today);
    this.syncDayNav();
  }

  private renderComeback(): void {
    const cb = this.t.comeback();
    const text = this.t.ui('comeback').replace('{n}', String(cb.days));
    this.r.renderComeback({ show: cb.show, text });
  }

  private renderTrophies(): void {
    this.r.renderTrophies(this.t.trophies(), this.t.ui('trophies'));
  }

  private renderCardMap(): void {
    this.r.renderCardMap(this.t.cardMap(), this.t.ui('cardMap'));
  }

  private openCardMap(): void {
    this.renderCardMap();
    this.open('cardMapModal');
  }

  private openTrophies(): void {
    this.renderTrophies();
    this.open('trophiesModal');
  }

  private renderShortcuts(): void {
    const u = (k: string): string => this.t.ui(k);
    this.r.renderShortcuts(
      [
        { keys: '← / →', label: u('scDay') },
        { keys: '↑ / ↓', label: u('scTick') },
        { keys: 'Enter', label: u('scMark') },
        { keys: 'M', label: u('scMap') },
        { keys: 'T', label: u('scTrophies') },
        { keys: '?', label: u('scHelp') },
        { keys: 'Esc', label: u('scClose') },
      ],
      u('shortcuts'),
    );
  }

  // ----- today-card handlers (re-bound on every render) ----------------------

  private bindTodayHandlers(vm: TodayVM): void {
    const cta = this.r.$('nextDayCta');
    if (cta) (cta as HTMLElement).onclick = () => this.go(1);
    if (vm.rest) return;
    for (const t of vm.tasks) {
      const cb = this.r.$('cb_' + t.id) as HTMLInputElement | null;
      if (cb) {
        cb.onchange = (e) => this.setTaskChecked(t.id, (e.target as HTMLInputElement).checked);
      }
    }
    if (vm.show.reflection) {
      const reflect = this.r.$('reflect') as HTMLTextAreaElement | null;
      if (reflect) {
        reflect.oninput = (e) => {
          this.t.setReflection((e.target as HTMLTextAreaElement).value);
        };
      }
    }
  }

  private setTaskChecked(taskId: string, checked: boolean): void {
    const was = this.t.todayCard().complete;
    const res = this.t.setTaskDone(taskId, checked);
    // Fire effects only on the not-complete → complete transition (parity).
    if (!was && this.t.todayCard().complete) {
      this.r.celebrate();
      if (res.unlockedBadges.length) {
        const tro = this.t.trophies().find((x) => x.id === res.unlockedBadges[0]);
        if (tro) this.r.badgeToast(this.t.ui('newTrophy'), tro.title, tro.icon);
      }
      if (res.surprise) this.r.toast('toast', this.r.esc(res.surprise));
    }
    this.renderAll();
    this.r.focusTask(taskId);
  }

  private syncDayNav(): void {
    const sel = this.t.selectors();
    const i = sel.items.findIndex((o) => o.selected);
    const prev = this.r.$('prevDay') as HTMLButtonElement | null;
    const next = this.r.$('nextDay') as HTMLButtonElement | null;
    if (prev) prev.disabled = i <= 0;
    if (next) next.disabled = i >= sel.items.length - 1;
  }

  private go(delta: number, scroll = true): void {
    // Deliberate: arrow/swipe day-nav does NOT close sheets — sheets are a
    // mobile affordance, arrows a desktop one; closing on nav would surprise.
    this.t.goToItem(delta);
    this.renderAll();
    if (!scroll) return; // keyboard nav keeps the current scroll position
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      /* jsdom / non-browser */
    }
  }

  // ----- keyboard ------------------------------------------------------------

  public handleKeydown(e: KeyboardEvent): void {
    const key = e.key;
    if (key === 'Escape') {
      if (this.activeModal) this.closeActiveModal();
      else this.closeSheets();
      return;
    }
    if (this.activeModal) return; // modal open → only Esc acts
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (this.r.isTypingTarget()) return;

    switch (key) {
      case 'ArrowLeft':
        this.go(-1, false);
        e.preventDefault();
        break;
      case 'ArrowRight':
        this.go(1, false);
        e.preventDefault();
        break;
      case 'ArrowDown':
        this.moveTaskFocus(1);
        e.preventDefault();
        break;
      case 'ArrowUp':
        this.moveTaskFocus(-1);
        e.preventDefault();
        break;
      case 'Enter': {
        const id = this.r.activeTaskId();
        if (id) {
          this.setTaskChecked(id, !this.taskDone(id));
          e.preventDefault();
        }
        break;
      }
      case '?':
        this.renderShortcuts();
        this.open('shortcutsModal');
        break;
      default: {
        // e.code matches the physical key, so M/T work on non-Latin layouts too
        // (on ЙЦУКЕН the M key yields key='ь').
        const k = key.toLowerCase();
        if (k === 'm' || e.code === 'KeyM') {
          this.openCardMap();
        } else if (k === 't' || e.code === 'KeyT') {
          this.openTrophies();
        }
      }
    }
  }

  private taskDone(taskId: string): boolean {
    return this.t.todayCard().tasks.find((t) => t.id === taskId)?.done ?? false;
  }

  private moveTaskFocus(delta: number): void {
    const card = this.t.todayCard();
    if (card.rest) return;
    const ids = card.tasks.map((t) => t.id);
    if (!ids.length) return;
    const cur = this.r.activeTaskId();
    let i = cur ? ids.indexOf(cur) : -1;
    if (i < 0) i = delta > 0 ? 0 : ids.length - 1;
    else i = Math.min(Math.max(i + delta, 0), ids.length - 1);
    this.r.focusTask(ids[i]!, true); // reveal: the row may be off-screen
  }

  // ----- wiring (port of app.js init()) --------------------------------------

  private wire(): void {
    const pack = this.r.$('packSelect') as HTMLSelectElement | null;
    if (pack) {
      pack.onchange = () => {
        this.closeSheets();
        this.t.selectPack(pack.value);
        this.r.applyTrackColors(this.t.trackColors());
        this.r.setLang(this.t.locale());
        this.applyStaticLabels(); // ui() answers come from the new pack now
        this.startMotd();
        this.renderAll();
      };
    }
    const theme = this.r.$('themeSelect') as HTMLSelectElement | null;
    if (theme) {
      theme.onchange = () => {
        this.closeSheets();
        this.t.selectTheme(theme.value);
        const href = this.t.activeThemeHref();
        if (href != null) this.r.applyTheme(href, theme.value);
      };
    }
    const day = this.r.$('daySelect') as HTMLSelectElement | null;
    if (day) {
      day.onchange = () => {
        this.closeSheets();
        this.t.selectItem(day.value);
        this.renderAll();
      };
    }

    const cardMapBtn = this.r.$('cardMapBtn');
    if (cardMapBtn) (cardMapBtn as HTMLElement).onclick = () => this.openCardMap();
    this.bindClose('cardMapClose', 'cardMapModal');
    this.bindBackdrop('cardMapModal');
    const cardMapGrid = this.r.$('cardMapGrid');
    if (cardMapGrid) {
      (cardMapGrid as HTMLElement).onclick = (e) => {
        const id = (e.target as HTMLElement).dataset?.id;
        if (!id) return;
        this.t.selectItem(id);
        this.closeActiveModal();
        this.renderAll();
      };
    }

    const trBtn = this.r.$('trophiesBtn');
    if (trBtn) (trBtn as HTMLElement).onclick = () => this.openTrophies();
    this.bindClose('trophiesClose', 'trophiesModal');
    this.bindBackdrop('trophiesModal');

    this.bindClose('shortcutsClose', 'shortcutsModal');
    this.bindBackdrop('shortcutsModal');

    document.addEventListener('keydown', (e) => this.handleKeydown(e as KeyboardEvent));

    const prev = this.r.$('prevDay');
    if (prev) (prev as HTMLElement).onclick = () => this.go(-1);
    const next = this.r.$('nextDay');
    if (next) (next as HTMLElement).onclick = () => this.go(1);

    const exportBtn = this.r.$('exportBtn');
    if (exportBtn) {
      (exportBtn as HTMLElement).onclick = () => {
        this.closeSheets();
        const blob = new Blob([this.t.exportProgress()], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = this.t.activePackId() + '-progress.json';
        a.click();
        // Safari starts the download async; revoking synchronously can abort it.
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      };
    }
    const importBtn = this.r.$('importBtn');
    const importFile = this.r.$('importFile') as HTMLInputElement | null;
    if (importBtn && importFile) {
      (importBtn as HTMLElement).onclick = () => importFile.click();
      importFile.onchange = (e) => {
        this.closeSheets();
        const f = (e.target as HTMLInputElement).files?.[0];
        if (!f) return;
        const rd = new FileReader();
        rd.onload = () => {
          try {
            this.t.importProgress(String(rd.result));
            this.renderAll();
            alert(this.t.ui('importOk'));
          } catch (err) {
            if (err instanceof ImportError || err instanceof ValidationError) {
              alert(this.t.ui('importFail').replace('{e}', err.message));
            } else {
              throw err;
            }
          }
        };
        rd.readAsText(f);
        (e.target as HTMLInputElement).value = '';
      };
    }

    const dockMap = this.r.$('dockMapBtn');
    if (dockMap) (dockMap as HTMLElement).onclick = () => this.openCardMap();
    const dockTrophies = this.r.$('dockTrophiesBtn');
    if (dockTrophies) (dockTrophies as HTMLElement).onclick = () => this.openTrophies();
    const dockMenu = this.r.$('dockMenuBtn');
    if (dockMenu) (dockMenu as HTMLElement).onclick = () => this.toggleSheet('menu');
    const dockBars = this.r.$('dockBars');
    if (dockBars) (dockBars as HTMLElement).onclick = () => this.toggleSheet('stats');

    // Swipe day-nav: primary mobile gesture; maps to the existing prev/next
    // intents. Threshold + horizontal-dominance keep page scrolling intact.
    const todayCard = this.r.$('todayCard');
    if (todayCard) {
      let sx = 0;
      let sy = 0;
      (todayCard as HTMLElement).ontouchstart = (e: TouchEvent) => {
        const t = e.changedTouches[0];
        if (!t) return;
        sx = t.clientX;
        sy = t.clientY;
      };
      (todayCard as HTMLElement).ontouchend = (e: TouchEvent) => {
        if (this.activeModal || this.r.isTypingTarget()) return;
        const t = e.changedTouches[0];
        if (!t) return;
        const dx = t.clientX - sx;
        const dy = t.clientY - sy;
        if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.5) this.go(dx < 0 ? 1 : -1);
      };
    }
  }

  private open(id: string): void {
    this.closeSheets();
    if (this.activeModal && this.activeModal !== id) this.closeActiveModal();
    const el = this.r.$(id);
    if (el) {
      el.classList.add('open');
      this.activeModal = id;
      // Move focus into the dialog so Enter/Space can't activate background controls.
      const btn = typeof el.querySelector === 'function' ? el.querySelector('button') : null;
      if (btn && typeof btn.focus === 'function') btn.focus();
    }
  }

  private closeActiveModal(): void {
    if (!this.activeModal) return;
    const el = this.r.$(this.activeModal);
    if (el) el.classList.remove('open');
    this.activeModal = null;
  }

  private toggleSheet(which: 'menu' | 'stats'): void {
    const next = this.activeSheet === which ? null : which;
    const toolbar = this.r.$('toolbar');
    if (toolbar) toolbar.classList[next === 'menu' ? 'add' : 'remove']('open');
    const dash = this.r.$('dashboard');
    if (dash) dash.classList[next === 'stats' ? 'add' : 'remove']('open');
    this.activeSheet = next;
  }

  private closeSheets(): void {
    if (this.activeSheet) this.toggleSheet(this.activeSheet);
  }

  private bindClose(btnId: string, modalId: string): void {
    const btn = this.r.$(btnId);
    if (btn) {
      (btn as HTMLElement).onclick = () => {
        if (this.activeModal === modalId) this.closeActiveModal();
      };
    }
  }

  private bindBackdrop(modalId: string): void {
    const m = this.r.$(modalId);
    if (m) {
      (m as HTMLElement).onclick = (e) => {
        if ((e.target as HTMLElement).id === modalId) this.closeActiveModal();
      };
    }
  }

  // ----- motd ----------------------------------------------------------------

  // Re-entrant: a pack switch calls this again with the new pack's mottos.
  private startMotd(): void {
    if (this.motdTimer != null) {
      clearInterval(this.motdTimer);
      this.motdTimer = null;
    }
    const mottos = this.t.mottos();
    if (!mottos.length) return;
    this.r.setText('motd', mottos[0]!);
    if (mottos.length > 1) {
      let i = 0;
      this.motdTimer = setInterval(() => {
        const el = this.r.$('motd');
        if (!el) return;
        el.classList.add('motd-out');
        setTimeout(() => {
          i = (i + 1) % mottos.length;
          el.textContent = mottos[i]!;
          el.classList.remove('motd-out');
        }, 600);
      }, 6000);
    }
  }
}
