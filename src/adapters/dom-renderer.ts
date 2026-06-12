import type {
  SelectorsVM,
  TodayVM,
  DashboardVM,
  CardMapVM,
  TrophyVM,
  TrackColor,
} from '../domain/types/view-models.ts';
import type { RenderLabels } from './types/dom-renderer.ts';

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

/**
 * Renders the Tracker's view-models into the canonical DOM hooks (ids/classes
 * unchanged from index.html). A near-1:1 port of app.js's render functions —
 * the only change is reading VM fields instead of recomputing via L.*.
 */
export class DomRenderer {
  public esc(s: unknown): string {
    return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ESC[c]!);
  }

  public $(id: string): HTMLElement | null {
    return document.getElementById(id);
  }

  // ----- keyboard focus (the only place that touches activeElement/focus) ----

  // preventScroll keeps re-renders from yanking the page; pass reveal when the
  // user is navigating (the checkbox is visually hidden, so an off-screen row
  // would otherwise show no focus at all).
  public focusTask(taskId: string, reveal = false): void {
    const el = this.$('cb_' + taskId) as HTMLElement | null;
    if (!el || typeof el.focus !== 'function') return;
    el.focus({ preventScroll: true });
    if (!reveal || typeof el.closest !== 'function') return;
    const row = el.closest('.task');
    if (row && typeof row.scrollIntoView === 'function') row.scrollIntoView({ block: 'nearest' });
  }

  public activeTaskId(): string | null {
    const a = document.activeElement as HTMLElement | null;
    const id = a?.id ?? '';
    return id.startsWith('cb_') ? id.slice(3) : null;
  }

  public isTypingTarget(): boolean {
    const a = document.activeElement as HTMLElement | null;
    if (!a) return false;
    const tag = a.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (tag === 'INPUT') {
      const t = (a as HTMLInputElement).type;
      return t !== 'checkbox' && t !== 'radio' && t !== 'button';
    }
    return false;
  }

  // ----- selectors -----------------------------------------------------------

  public renderSelectors(vm: SelectorsVM): void {
    this.fillSelect('packSelect', vm.packs);
    this.fillSelect('themeSelect', vm.themes);
    this.fillSelect('daySelect', vm.items);
  }

  private fillSelect(id: string, options: SelectorsVM['packs']): void {
    const sel = this.$(id);
    if (!sel) return;
    sel.innerHTML = options
      .map(
        (o) =>
          `<option value="${this.esc(o.id)}"${o.selected ? ' selected' : ''}>${this.esc(o.label)}</option>`,
      )
      .join('');
  }

  // ----- today ---------------------------------------------------------------

  public renderToday(vm: TodayVM, lbl: RenderLabels): void {
    const el = this.$('todayCard');
    if (!el) return;
    el.setAttribute('data-track', vm.track);
    const phaseLabel = this.$('phaseLabel');
    if (phaseLabel) phaseLabel.textContent = vm.phaseLabel;

    if (vm.rest) {
      el.innerHTML =
        `<div class="today-side"><span class="vert">${this.esc(lbl.restVert)}</span></div>` +
        `<div class="today-main">` +
        `<h2 class="today-title">${this.esc(vm.title)}</h2>` +
        (vm.reflectPrompt
          ? `<p class="warm"><span class="warm-i">☾</span> ${this.esc(vm.reflectPrompt)}</p>`
          : '') +
        (vm.notLast
          ? `<button class="next-day-cta" id="nextDayCta" type="button">${this.esc(lbl.nextDay)}</button>`
          : '') +
        `</div>`;
      return;
    }

    // copy / AI-copy pair rendered over every copyable text block; the floated
    // .tools-spacer leads the block's text so it wraps around the buttons
    // instead of running under them (hidden on mobile, where tools are static)
    const tools = (copyId: string, aiId: string): string =>
      `<span class="task-tools">` +
      `<button class="copy-btn" id="${copyId}" type="button" data-tip="${this.esc(lbl.copy)}" aria-label="${this.esc(lbl.copy)}">⧉</button>` +
      `<button class="copy-btn ai" id="${aiId}" type="button" data-tip="${this.esc(lbl.copyAi)}" aria-label="${this.esc(lbl.copyAi)}">✨</button>` +
      `</span>`;
    const spacer = `<i class="tools-spacer" aria-hidden="true"></i>`;

    el.innerHTML =
      `<div class="today-side"><span class="vert">${this.esc(lbl.todayVert)}</span></div>` +
      `<div class="today-main">` +
      `<span class="trackpill"><span class="k">${this.esc(vm.trackIcon)}</span> ${this.esc(vm.trackLabel)}</span>` +
      `<h2 class="today-title">${this.esc(vm.title)}</h2>` +
      (vm.show.warmup && vm.warmup
        ? `<div class="warm">${spacer}<span class="warm-i">✦</span> <span class="muted">${this.esc(lbl.warmup)}</span> ${this.esc(vm.warmup)}${tools('copyWarm', 'copyaiWarm')}</div>`
        : '') +
      `<div class="tasks" id="taskList"></div>` +
      (vm.show.reflection
        ? `<div class="reflect-block"><label class="reflect-label" for="reflect"><span class="kanji">省</span> ${this.esc(lbl.reflect)}${vm.reflectPrompt ? ` — ${this.esc(vm.reflectPrompt)}` : ''}</label>` +
          `<textarea id="reflect" placeholder="${this.esc(lbl.taskPlaceholder)}">${this.esc(vm.reflection || '')}</textarea></div>`
        : '') +
      (vm.resources.length
        ? `<div class="res-row">${vm.resources
            .map((r) => `<span class="chip"><b>${this.esc(r.label)}</b> ${this.esc(r.note)}</span>`)
            .join('')}</div>`
        : '') +
      (vm.complete && vm.notLast
        ? `<button class="next-day-cta" id="nextDayCta" type="button">${this.esc(lbl.nextDay)}</button>`
        : '') +
      `</div>`;

    const taskList = this.$('taskList');
    if (taskList) {
      taskList.innerHTML = vm.tasks
        .map((t, k) => {
          const id = this.esc(t.id);
          const label =
            `<label class="task ${t.done ? 'done' : ''}" style="animation-delay:${k * 55}ms">` +
            `<input type="checkbox" id="cb_${id}"${t.done ? ' checked' : ''}/>` +
            `<span class="box"></span><span class="task-text"><i class="tools-spacer" aria-hidden="true"></i>${this.esc(t.text)}</span></label>`;
          return (
            `<div class="task-wrap">${label}${tools(`copy_${id}`, `copyai_${id}`)}` +
            (t.guidance
              ? `<details class="task-hint"><summary>${this.esc(lbl.hint)}</summary>` +
                `<div class="task-hint-body">${this.esc(t.guidance)}</div></details>`
              : '') +
            `</div>`
          );
        })
        .join('');
    }
  }

  // ----- dashboard -----------------------------------------------------------

  private bar(p: number): string {
    return `<div class="bar"><i style="width:${p}%"></i></div>`;
  }

  public renderDashboard(vm: DashboardVM, lbl: RenderLabels): void {
    const dash = this.$('dashboard');
    if (!dash) return;
    const phaseRows = (vm.phases ?? [])
      .map(
        (ph) =>
          `<div class="prow"><span class="lbl"><i></i>${this.esc(ph.title)}</span>` +
          `<span class="val">${ph.stat.done}/${ph.stat.total}</span></div>` +
          this.bar(ph.stat.pct),
      )
      .join('');
    const trackRows = vm.tracks
      .map(
        (t) =>
          `<div class="prow" data-track="${this.esc(t.id)}"><span class="lbl"><i></i>${this.esc(t.label)}</span>` +
          `<span class="val">${t.stat.pct}%</span></div>` +
          `<div class="bar" data-track="${this.esc(t.id)}"><i style="width:${t.stat.pct}%"></i></div>`,
      )
      .join('');
    dash.innerHTML =
      `<div class="stat-card" data-kind="progress"><div class="eyebrow">${this.esc(lbl.overallTitle)}</div>` +
      `<div class="ring" style="--p:${vm.overall.pct}"><div><b>${vm.overall.pct}%</b>` +
      `<small>${vm.overall.done}/${vm.overall.total}</small></div></div>` +
      `<div class="stat-sub" style="text-align:center">${this.esc(vm.daysOfLabel)}</div></div>` +
      `<div class="stat-card" data-kind="streak"><div class="eyebrow">${this.esc(lbl.streakTitle)}</div>` +
      `<div class="flame">🔥</div><div class="streak-num">${vm.streak}</div>` +
      `<div class="stat-sub">${this.esc(vm.streakWord)} ${this.esc(lbl.inARow)}</div></div>` +
      (vm.phases && vm.phases.length
        ? `<div class="stat-card" data-kind="phases"><div class="eyebrow">${this.esc(lbl.phasesTitle)}</div>${phaseRows}</div>`
        : '') +
      `<div class="stat-card" data-kind="tracks"><div class="eyebrow">${this.esc(lbl.tracksTitle)}</div>` +
      (trackRows || '<div class="muted">—</div>') +
      `</div>`;
    // Dock micro-bars (mobile HUD) — same VM, micro presentation. Streak bar
    // fills against a 30-day target (capped); progress bar is overall pct.
    const sFill = this.$('dockStreakFill');
    if (sFill) sFill.style.width = `${Math.round(Math.min(vm.streak / 30, 1) * 100)}%`;
    this.setText('dockStreakVal', `${vm.streak}d`);
    const pFill = this.$('dockProgressFill');
    if (pFill) pFill.style.width = `${vm.overall.pct}%`;
    this.setText('dockProgressVal', `${vm.overall.done}/${vm.overall.total}`);
  }

  // ----- comeback ------------------------------------------------------------

  public renderComeback(vm: { show: boolean; text: string }): void {
    const cb = this.$('comeback');
    if (!cb) return;
    if (vm.show) {
      cb.style.display = '';
      cb.innerHTML = `🩹 ${this.esc(vm.text)}`;
    } else {
      cb.style.display = 'none';
    }
  }

  // ----- card map ------------------------------------------------------------

  public renderCardMap(vm: CardMapVM, titleLabel: string): void {
    const host = this.$('cardMapGrid');
    if (!host) return;
    const title = this.$('cardMapTitle');
    if (title) title.textContent = `${titleLabel} · ${vm.done}/${vm.total}`;
    host.innerHTML = vm.groups
      .map(
        (g) =>
          `<div class="cm-row"><span class="cm-rlabel">${this.esc(g.title)}</span>` +
          `<div class="cm-cells">` +
          g.items
            .map((it) => {
              let cls = 'cm-card';
              if (it.rest) cls += ' rest';
              else if (it.done) cls += ' done';
              if (it.current) cls += ' current';
              const tip = it.title ? ` data-tip="${this.esc(it.title)}"` : '';
              return `<span class="${cls}" data-id="${this.esc(it.id)}"${tip}></span>`;
            })
            .join('') +
          `</div></div>`,
      )
      .join('');
  }

  // ----- trophies ------------------------------------------------------------

  public renderTrophies(vm: TrophyVM[], titleLabel: string): void {
    const host = this.$('trophiesGrid');
    if (!host) return;
    const got = vm.filter((b) => b.unlocked).length;
    const title = this.$('trophiesTitle');
    if (title) title.textContent = `${titleLabel} · ${got}/${vm.length}`;
    host.innerHTML = vm
      .map(
        (b) =>
          `<div class="badge ${b.unlocked ? 'on' : 'off'}" data-tip="${this.esc(b.title + ' — ' + (b.desc || ''))}">` +
          `<span class="bi">${this.esc(b.icon || '•')}</span>` +
          `<span class="bt">${this.esc(b.title)}</span></div>`,
      )
      .join('');
  }

  // ----- shortcuts help ------------------------------------------------------

  public renderShortcuts(rows: { keys: string; label: string }[], titleLabel: string): void {
    const host = this.$('shortcutsGrid');
    if (!host) return;
    const title = this.$('shortcutsTitle');
    if (title) title.textContent = titleLabel;
    host.innerHTML = rows
      .map(
        (r) =>
          `<div class="sc-row"><kbd class="sc-keys">${this.esc(r.keys)}</kbd>` +
          `<span class="sc-desc">${this.esc(r.label)}</span></div>`,
      )
      .join('');
  }

  // ----- theme & track colors ------------------------------------------------

  // Theme switching double-buffers the stylesheet: swapping #themeCss's href
  // directly drops the old sheet while the new one is still loading, which
  // flashes the page unstyled. Instead the new sheet loads in a parallel
  // <link> while the old one keeps the page styled, and the swap happens only
  // once it's ready (then it's served from cache, so the flip is instant).
  private themeLoader: HTMLLinkElement | null = null;
  private themeToken = 0;

  public applyTheme(href: string, id: string): void {
    const link = this.$('themeCss') as HTMLLinkElement | null;
    if (!link) return;
    const token = ++this.themeToken;
    if (this.themeLoader) {
      // a previous switch is still loading — this one supersedes it
      this.themeLoader.remove();
      this.themeLoader = null;
    }
    if (link.getAttribute('href') === href) {
      document.documentElement.setAttribute('data-theme', id);
      return;
    }
    const loader = document.createElement('link');
    loader.rel = 'stylesheet';
    loader.href = href;
    loader.onload = () => {
      if (token !== this.themeToken) return;
      this.themeLoader = null;
      link.href = href;
      document.documentElement.setAttribute('data-theme', id);
      // keep both sheets through one paint so the handover is seamless
      setTimeout(() => loader.remove(), 200);
    };
    loader.onerror = () => {
      if (token !== this.themeToken) return;
      // keep the previous theme rather than leaving the page unstyled
      this.themeLoader = null;
      loader.remove();
      console.error(`[sunrise] theme css failed to load, keeping the current theme: ${href}`);
    };
    this.themeLoader = loader;
    document.head.appendChild(loader);
  }

  private appliedTrackColorIds: string[] = [];

  public applyTrackColors(colors: TrackColor[]): void {
    // Clear the previous pack's vars first — packs can share track ids, and a
    // stale inline value would mask the theme's fallback color.
    for (const id of this.appliedTrackColorIds) {
      document.documentElement.style.removeProperty(`--track-${id}`);
    }
    for (const c of colors) {
      document.documentElement.style.setProperty(`--track-${c.id}`, c.color);
    }
    this.appliedTrackColorIds = colors.map((c) => c.id);
  }

  public setLang(lang: string): void {
    document.documentElement.lang = lang;
  }

  // ----- labels --------------------------------------------------------------

  public setText(id: string, text: string): void {
    const el = this.$(id);
    if (el) el.textContent = text;
  }

  public setAttr(id: string, name: string, value: string): void {
    const el = this.$(id);
    if (el) el.setAttribute(name, value);
  }

  // ----- effects -------------------------------------------------------------

  public celebrate(): void {
    const fx = this.$('fx');
    if (!fx) return;
    const flash = document.createElement('div');
    flash.className = 'fx-flash';
    fx.appendChild(flash);
    setTimeout(() => {
      if (flash.parentNode) flash.parentNode.removeChild(flash);
    }, 650);
    for (let k = 0; k < 30; k++) {
      const p = document.createElement('span');
      p.className = 'confetti-piece';
      p.style.left = Math.random() * 100 + '%';
      p.style.setProperty('--i', String(k));
      p.style.setProperty('--dx', (Math.random() * 2 - 1).toFixed(2));
      p.style.setProperty('--dy', Math.random().toFixed(2));
      p.style.setProperty('--rot', Math.floor(Math.random() * 720 - 360) + 'deg');
      p.style.animationDelay = Math.random() * 0.2 + 's';
      fx.appendChild(p);
      setTimeout(() => {
        if (p.parentNode) p.parentNode.removeChild(p);
      }, 1900);
    }
  }

  public toast(cls: string, html: string): void {
    const fx = this.$('fx');
    if (!fx) return;
    const el = document.createElement('div');
    el.className = cls;
    el.innerHTML = html;
    fx.appendChild(el);
    setTimeout(() => el.classList.add('show'), 20);
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 400);
    }, 3500);
  }

  public badgeToast(newTrophyLabel: string, title: string, icon: string): void {
    this.toast(
      'badge-toast',
      `<span class="bt-i">${this.esc(icon || '•')}</span>` +
        `<span>${this.esc(newTrophyLabel)} <b>${this.esc(title)}</b></span>`,
    );
  }

  // ----- load-fail fallback --------------------------------------------------

  public stub(message: string, reasons: string[]): void {
    const detail = reasons.length
      ? `<ul>${reasons.map((x) => `<li>${this.esc(x)}</li>`).join('')}</ul>`
      : '';
    document.body.innerHTML = `<div style="padding:24px;font:16px system-ui"><p>${this.esc(message)}</p>${detail}</div>`;
  }
}
