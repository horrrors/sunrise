import type {
  SelectorsVM,
  TodayVM,
  DashboardVM,
  CalendarVM,
  TrophyVM,
  TrackColor,
} from '../domain/view-models.ts';

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

/**
 * Static UI label strings the renderer needs but that the VMs don't carry.
 * The controller fills these from `tracker.ui(key)` (the facade's label query),
 * so the renderer stays a pure presenter and the domain is untouched.
 */
export interface RenderLabels {
  todayVert: string;
  restVert: string;
  warmup: string;
  reflect: string;
  taskPlaceholder: string;
  scheduleReview: string;
  nextDay: string;
  hint: string;
  dueToday: string;
  restToday: string;
  overallTitle: string;
  streakTitle: string;
  inARow: string;
  phasesTitle: string;
  tracksTitle: string;
  trophies: string;
  newTrophy: string;
}

/**
 * Renders the Tracker's view-models into the canonical DOM hooks (ids/classes
 * unchanged from index.html). A near-1:1 port of app.js's render functions —
 * the only change is reading VM fields instead of recomputing via L.*.
 */
export class DomRenderer {
  esc(s: unknown): string {
    return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ESC[c]!);
  }

  $(id: string): HTMLElement | null {
    return document.getElementById(id);
  }

  // ----- selectors -----------------------------------------------------------

  renderSelectors(vm: SelectorsVM): void {
    this.#fillSelect('packSelect', vm.packs);
    this.#fillSelect('themeSelect', vm.themes);
    this.#fillSelect('daySelect', vm.items);
  }

  #fillSelect(id: string, options: SelectorsVM['packs']): void {
    const sel = this.$(id);
    if (!sel) return;
    sel.innerHTML = options
      .map(
        (o) =>
          '<option value="' +
          this.esc(o.id) +
          '"' +
          (o.selected ? ' selected' : '') +
          '>' +
          this.esc(o.label) +
          '</option>',
      )
      .join('');
  }

  // ----- today ---------------------------------------------------------------

  renderToday(vm: TodayVM, lbl: RenderLabels): void {
    const el = this.$('todayCard');
    if (!el) return;
    el.setAttribute('data-track', vm.track);
    const phaseLabel = this.$('phaseLabel');
    if (phaseLabel) phaseLabel.textContent = vm.phaseLabel;

    if (vm.rest) {
      el.innerHTML =
        '<div class="today-side"><span class="vert">' +
        this.esc(lbl.restVert) +
        '</span></div><div class="today-main">' +
        '<h2 class="today-title">' +
        this.esc(vm.title) +
        '</h2>' +
        '<p class="warm"><span class="warm-i">☾</span> ' +
        this.esc(vm.reflectPrompt || '') +
        '</p>' +
        '<div class="rest-due">' +
        (vm.dueReviews.length
          ? this.esc(lbl.dueToday) + ' — <b>' + this.esc(vm.dueReviews.join(' · ')) + '</b>'
          : this.esc(lbl.restToday)) +
        '</div>' +
        (vm.notLast
          ? '<button class="next-day-cta" id="nextDayCta" type="button">' +
            this.esc(lbl.nextDay) +
            '</button>'
          : '') +
        '</div>';
      return;
    }

    el.innerHTML =
      '<div class="today-side"><span class="vert">' +
      this.esc(lbl.todayVert) +
      '</span></div><div class="today-main">' +
      '<span class="trackpill"><span class="k">' +
      this.esc(vm.trackIcon) +
      '</span> ' +
      this.esc(vm.trackLabel) +
      '</span>' +
      '<h2 class="today-title">' +
      this.esc(vm.title) +
      '</h2>' +
      (vm.show.warmup && vm.warmup
        ? '<div class="warm"><span class="warm-i">✦</span> <span class="muted">' +
          this.esc(lbl.warmup) +
          '</span> ' +
          this.esc(vm.warmup) +
          '</div>'
        : '') +
      '<div class="tasks" id="taskList"></div>' +
      (vm.show.reflection
        ? '<div class="reflect-block"><label class="reflect-label" for="reflect"><span class="kanji">省</span> ' +
          this.esc(lbl.reflect) +
          (vm.reflectPrompt ? ' — ' + this.esc(vm.reflectPrompt) : '') +
          '</label><textarea id="reflect" placeholder="' +
          this.esc(lbl.taskPlaceholder) +
          '">' +
          this.esc(vm.reflection || '') +
          '</textarea></div>'
        : '') +
      (vm.resources.length
        ? '<div class="res-row">' +
          vm.resources
            .map(
              (r) =>
                '<span class="chip"><b>' +
                this.esc(r.label) +
                '</b> ' +
                this.esc(r.note) +
                '</span>',
            )
            .join('') +
          '</div>'
        : '') +
      (vm.show.review
        ? '<button class="btn gold" id="markReview" type="button">' +
          this.esc(lbl.scheduleReview) +
          '</button>'
        : '') +
      (vm.complete && vm.notLast
        ? '<button class="next-day-cta" id="nextDayCta" type="button">' +
          this.esc(lbl.nextDay) +
          '</button>'
        : '') +
      '</div>';

    const taskList = this.$('taskList');
    if (taskList) {
      taskList.innerHTML = vm.tasks
        .map((t, k) => {
          const label =
            '<label class="task ' +
            (t.done ? 'done' : '') +
            '" style="animation-delay:' +
            k * 55 +
            'ms"><input type="checkbox" id="cb_' +
            this.esc(t.id) +
            '"' +
            (t.done ? ' checked' : '') +
            '/><span class="box"></span><span class="task-text">' +
            this.esc(t.text) +
            '</span></label>';
          if (!t.guidance) return label;
          return (
            '<div class="task-wrap">' +
            label +
            '<details class="task-hint"><summary>' +
            this.esc(lbl.hint) +
            '</summary><div class="task-hint-body">' +
            this.esc(t.guidance) +
            '</div></details></div>'
          );
        })
        .join('');
    }
  }

  // ----- dashboard -----------------------------------------------------------

  #bar(p: number): string {
    return '<div class="bar"><i style="width:' + p + '%"></i></div>';
  }

  renderDashboard(vm: DashboardVM, lbl: RenderLabels): void {
    const dash = this.$('dashboard');
    if (!dash) return;
    const phaseRows = (vm.phases ?? [])
      .map(
        (ph) =>
          '<div class="prow"><span class="lbl"><i></i>' +
          this.esc(ph.title) +
          '</span><span class="val">' +
          ph.stat.done +
          '/' +
          ph.stat.total +
          '</span></div>' +
          this.#bar(ph.stat.pct),
      )
      .join('');
    const trackRows = vm.tracks
      .map(
        (t) =>
          '<div class="prow" data-track="' +
          this.esc(t.id) +
          '"><span class="lbl"><i></i>' +
          this.esc(t.label) +
          '</span><span class="val">' +
          t.stat.pct +
          '%</span></div><div class="bar" data-track="' +
          this.esc(t.id) +
          '"><i style="width:' +
          t.stat.pct +
          '%"></i></div>',
      )
      .join('');
    dash.innerHTML =
      '<div class="stat-card" data-kind="progress"><div class="eyebrow">' +
      this.esc(lbl.overallTitle) +
      '</div><div class="ring" style="--p:' +
      vm.overall.pct +
      '"><div><b>' +
      vm.overall.pct +
      '%</b><small>' +
      vm.overall.done +
      '/' +
      vm.overall.total +
      '</small></div></div><div class="stat-sub" style="text-align:center">' +
      this.esc(vm.daysOfLabel) +
      '</div></div>' +
      '<div class="stat-card" data-kind="streak"><div class="eyebrow">' +
      this.esc(lbl.streakTitle) +
      '</div><div class="flame">🔥</div><div class="streak-num">' +
      vm.streak +
      '</div><div class="stat-sub">' +
      this.esc(vm.streakWord) +
      ' ' +
      this.esc(lbl.inARow) +
      '</div></div>' +
      (vm.phases && vm.phases.length
        ? '<div class="stat-card" data-kind="phases"><div class="eyebrow">' +
          this.esc(lbl.phasesTitle) +
          '</div>' +
          phaseRows +
          '</div>'
        : '') +
      '<div class="stat-card" data-kind="tracks"><div class="eyebrow">' +
      this.esc(lbl.tracksTitle) +
      '</div>' +
      (trackRows || '<div class="muted">—</div>') +
      '</div>';
  }

  // ----- comeback ------------------------------------------------------------

  renderComeback(vm: { show: boolean; text: string }): void {
    const cb = this.$('comeback');
    if (!cb) return;
    if (vm.show) {
      cb.style.display = '';
      cb.innerHTML = '🩹 ' + this.esc(vm.text);
    } else {
      cb.style.display = 'none';
    }
  }

  // ----- calendar ------------------------------------------------------------

  renderCalendar(vm: CalendarVM): void {
    const grid = this.$('calGrid');
    if (!grid) return;
    const dh = this.$('calDow');
    if (dh) dh.innerHTML = vm.dow.map((x) => '<span>' + this.esc(x) + '</span>').join('');
    grid.innerHTML = vm.cells
      .map((c) => {
        let cls = 'cday';
        if (c.other) cls += ' other';
        if (c.done) cls += ' done';
        if (c.today) cls += ' today';
        return '<span class="' + cls + '">' + c.day + '</span>';
      })
      .join('');
    const title = this.$('calTitle');
    if (title) title.textContent = vm.title;
  }

  // ----- trophies ------------------------------------------------------------

  renderTrophies(vm: TrophyVM[], titleLabel: string): void {
    const host = this.$('trophiesGrid');
    if (!host) return;
    const got = vm.filter((b) => b.unlocked).length;
    const title = this.$('trophiesTitle');
    if (title) title.textContent = titleLabel + ' · ' + got + '/' + vm.length;
    host.innerHTML = vm
      .map(
        (b) =>
          '<div class="badge ' +
          (b.unlocked ? 'on' : 'off') +
          '" data-tip="' +
          this.esc(b.title + ' — ' + (b.desc || '')) +
          '"><span class="bi">' +
          this.esc(b.icon || '•') +
          '</span><span class="bt">' +
          this.esc(b.title) +
          '</span></div>',
      )
      .join('');
  }

  // ----- theme & track colors ------------------------------------------------

  applyTheme(href: string, id: string): void {
    const link = this.$('themeCss') as HTMLLinkElement | null;
    if (link) link.href = href;
    document.documentElement.setAttribute('data-theme', id);
  }

  applyTrackColors(colors: TrackColor[]): void {
    for (const c of colors) {
      document.documentElement.style.setProperty('--track-' + c.id, c.color);
    }
  }

  setLang(lang: string): void {
    document.documentElement.lang = lang;
  }

  // ----- labels --------------------------------------------------------------

  setText(id: string, text: string): void {
    const el = this.$(id);
    if (el) el.textContent = text;
  }

  setAttr(id: string, name: string, value: string): void {
    const el = this.$(id);
    if (el) el.setAttribute(name, value);
  }

  // ----- effects -------------------------------------------------------------

  celebrate(): void {
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

  toast(cls: string, html: string): void {
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

  badgeToast(newTrophyLabel: string, title: string, icon: string): void {
    this.toast(
      'badge-toast',
      '<span class="bt-i">' +
        this.esc(icon || '•') +
        '</span><span>' +
        this.esc(newTrophyLabel) +
        ' <b>' +
        this.esc(title) +
        '</b></span>',
    );
  }

  // ----- load-fail fallback --------------------------------------------------

  stub(message: string, reasons: string[]): void {
    const detail = reasons.length
      ? '<ul>' + reasons.map((x) => '<li>' + this.esc(x) + '</li>').join('') + '</ul>'
      : '';
    document.body.innerHTML =
      '<div style="padding:24px;font:16px system-ui"><p>' +
      this.esc(message) +
      '</p>' +
      detail +
      '</div>';
  }
}
