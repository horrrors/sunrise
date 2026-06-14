import type { Localized } from './entities.ts';

export interface BadgeMeta {
  readonly id: string;
  readonly title: Localized;
  readonly desc?: Localized;
  readonly icon?: string;
}
export type BadgeCondition =
  | { readonly type: 'streak'; readonly gte: number }
  | { readonly type: 'days-done'; readonly gte: number }
  | { readonly type: 'percent'; readonly gte: number }
  | { readonly type: 'all-done' }
  | { readonly type: 'tasks-done'; readonly gte: number; readonly track?: string }
  | { readonly type: 'reflections'; readonly gte: number }
  | { readonly type: 'groups-complete'; readonly gte: number }
  | { readonly type: 'track-complete'; readonly track: string }
  | { readonly type: 'phase-complete'; readonly phase: string }
  | { readonly type: 'item-complete'; readonly item: string }
  | { readonly type: 'all-tracks'; readonly eachGte: number }
  | { readonly type: 'weekday'; readonly days: readonly number[] }
  | { readonly type: 'hour-range'; readonly from: number; readonly to: number }
  | { readonly type: 'comeback' };
export type BadgeRule = BadgeMeta & BadgeCondition;
export type BadgeType = BadgeCondition['type'];
