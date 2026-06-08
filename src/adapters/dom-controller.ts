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
      scheduleReview: u('scheduleReview'),
      nextDay: u('nextDay'),
      hint: u('hint'),
      dueToday: u('dueToday'),
      restToday: u('restToday'),
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
    const aria: [string, string][] = [
      ['exportBtn', 'export'],
      ['importBtn', 'import'],
      ['cardMapBtn', 'cardMap'],
      ['trophiesBtn', 'trophies'],
      ['prevDay', 'prevDayAria'],
      ['nextDay', 'nextDayAria'],
    ];
    for (const [id, key] of aria) this.r.setAttr(id, 'aria-label', u(key));
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
    if (vm.rest) return;
    for (const t of vm.tasks) {
      const cb = this.r.$('cb_' + t.id) as HTMLInputElement | null;
      if (cb) {
        cb.onchange = (e) => this.toggleTick(t.id, (e.target as HTMLInputElement).checked);
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
    if (vm.show.review) {
      const mr = this.r.$('markReview');
      if (mr) {
        (mr as HTMLElement).onclick = () => {
          this.t.scheduleReviewForCurrent();
          this.renderAll();
        };
      }
    }
  }

  private toggleTick(taskId: string, checked: boolean): void {
    const was = this.t.todayCard().complete;
    const res = this.t.toggleTask(taskId, checked);
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
    const cta = this.r.$('nextDayCta');
    if (cta) (cta as HTMLElement).onclick = () => this.go(1);
  }

  private go(delta: number): void {
    this.t.goToItem(delta);
    this.renderAll();
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
      return;
    }
    if (this.activeModal) return; // modal open → only Esc acts
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (this.r.isTypingTarget()) return;

    switch (key) {
      case 'ArrowLeft':
        this.go(-1);
        e.preventDefault();
        break;
      case 'ArrowRight':
        this.go(1);
        e.preventDefault();
        break;
      case 'ArrowDown':
        this.moveTickFocus(1);
        e.preventDefault();
        break;
      case 'ArrowUp':
        this.moveTickFocus(-1);
        e.preventDefault();
        break;
      case 'Enter': {
        const id = this.r.activeTaskId();
        if (id) {
          this.toggleTick(id, !this.tickDone(id));
          e.preventDefault();
        }
        break;
      }
      case '?':
        this.renderShortcuts();
        this.open('shortcutsModal');
        break;
      default: {
        const k = key.toLowerCase();
        if (k === 'm') {
          this.renderCardMap();
          this.open('cardMapModal');
        } else if (k === 't') {
          this.renderTrophies();
          this.open('trophiesModal');
        }
      }
    }
  }

  private tickDone(taskId: string): boolean {
    return this.t.todayCard().tasks.find((t) => t.id === taskId)?.done ?? false;
  }

  private moveTickFocus(delta: number): void {
    const card = this.t.todayCard();
    if (card.rest) return;
    const ids = card.tasks.map((t) => t.id);
    if (!ids.length) return;
    const cur = this.r.activeTaskId();
    let i = cur ? ids.indexOf(cur) : -1;
    if (i < 0) i = delta > 0 ? 0 : ids.length - 1;
    else i = Math.min(Math.max(i + delta, 0), ids.length - 1);
    this.r.focusTask(ids[i]!);
  }

  // ----- wiring (port of app.js init()) --------------------------------------

  private wire(): void {
    const pack = this.r.$('packSelect') as HTMLSelectElement | null;
    if (pack) {
      pack.onchange = () => {
        this.t.selectPack(pack.value);
        this.r.applyTrackColors(this.t.trackColors());
        this.r.setLang(this.t.locale());
        this.renderAll();
      };
    }
    const theme = this.r.$('themeSelect') as HTMLSelectElement | null;
    if (theme) {
      theme.onchange = () => {
        this.t.selectTheme(theme.value);
        const href = this.t.activeThemeHref();
        if (href != null) this.r.applyTheme(href, theme.value);
      };
    }
    const day = this.r.$('daySelect') as HTMLSelectElement | null;
    if (day) {
      day.onchange = () => {
        this.t.selectItem(day.value);
        this.renderAll();
      };
    }

    const cardMapBtn = this.r.$('cardMapBtn');
    if (cardMapBtn) {
      (cardMapBtn as HTMLElement).onclick = () => {
        this.renderCardMap();
        this.open('cardMapModal');
      };
    }
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
    if (trBtn) {
      (trBtn as HTMLElement).onclick = () => {
        this.renderTrophies();
        this.open('trophiesModal');
      };
    }
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
        const blob = new Blob([this.t.exportProgress()], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = this.t.activePackId() + '-progress.json';
        a.click();
        URL.revokeObjectURL(a.href);
      };
    }
    const importBtn = this.r.$('importBtn');
    const importFile = this.r.$('importFile') as HTMLInputElement | null;
    if (importBtn && importFile) {
      (importBtn as HTMLElement).onclick = () => importFile.click();
      importFile.onchange = (e) => {
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
  }

  private open(id: string): void {
    if (this.activeModal && this.activeModal !== id) this.closeActiveModal();
    const el = this.r.$(id);
    if (el) {
      el.classList.add('open');
      this.activeModal = id;
    }
  }

  private closeActiveModal(): void {
    if (!this.activeModal) return;
    const el = this.r.$(this.activeModal);
    if (el) el.classList.remove('open');
    this.activeModal = null;
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

  private startMotd(): void {
    const mottos = this.t.mottos();
    if (!mottos.length) return;
    this.r.setText('motd', mottos[0]!);
    if (mottos.length > 1) {
      let i = 0;
      setInterval(() => {
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
