import type { Stat } from './progress-stats.ts';

export interface Option {
  id: string;
  label: string;
  selected: boolean;
}
export interface TaskVM {
  id: string;
  text: string;
  guidance?: string;
  done: boolean;
}
export interface TodayVM {
  itemId: string;
  rest: boolean;
  track: string;
  trackLabel: string;
  trackIcon: string;
  title: string;
  phaseLabel: string;
  warmup?: string;
  reflectPrompt?: string;
  reflection: string;
  tasks: TaskVM[];
  resources: { label: string; note: string }[];
  complete: boolean;
  notLast: boolean;
  show: { warmup: boolean; reflection: boolean };
}
export interface DashboardVM {
  overall: Stat;
  streak: number;
  streakWord: string;
  phases: { id: string; title: string; stat: Stat }[] | null;
  tracks: { id: string; label: string; stat: Stat }[];
  daysOfLabel: string;
}
export interface CardMapItemVM {
  id: string;
  title: string;
  done: boolean;
  rest: boolean;
  current: boolean;
}
export interface CardMapGroupVM {
  id: string;
  title: string;
  items: CardMapItemVM[];
}
export interface CardMapVM {
  done: number;
  total: number;
  groups: CardMapGroupVM[];
}
export interface TrophyVM {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
}
export interface SelectorsVM {
  packs: Option[];
  themes: Option[];
  items: Option[];
}
export interface CompleteResult {
  unlockedBadges: string[];
  surprise?: string;
}
export interface TrackColor {
  id: string;
  color: string;
}
export interface AppStateVM {
  progress: number; // overall completion %, 0–100
  streak: number; // current streak, days
  hour: number; // local wall-clock hour, 0–23
}
