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
