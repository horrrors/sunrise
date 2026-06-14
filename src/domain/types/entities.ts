import type { BadgeRule } from './badge-rule.ts';

// A user-visible string in one or more languages. A plain `string` is
// language-neutral (identical in every language); a map carries one value per
// language code. `tr()` (src/domain/i18n.ts) resolves it with EN as the fallback.
export type Localized = string | { readonly [lang: string]: string };

export interface Task {
  readonly id: string;
  readonly text: Localized;
  readonly guidance?: Localized;
}
export interface Resource {
  readonly label: Localized;
  readonly note: Localized;
}
export interface Item {
  readonly id: string;
  readonly track: string;
  readonly title?: Localized;
  readonly warmup?: Localized;
  readonly reflectPrompt?: Localized;
  readonly tasks?: readonly Task[];
  readonly resources?: readonly Resource[];
  readonly rest?: boolean;
}
export interface Group {
  readonly id: string;
  readonly title: Localized;
  readonly phase?: string;
  readonly items: readonly Item[];
}
export interface Phase {
  readonly id: string;
  readonly title: Localized;
}
export interface Track {
  readonly id: string;
  readonly label: Localized;
  readonly icon?: string;
  readonly color?: string;
}
export interface Labels {
  readonly phase?: Localized;
  readonly item?: Localized;
}
export interface PackSettings {
  readonly labels?: Labels;
  readonly reflections?: boolean;
  readonly warmups?: boolean;
}
export interface Pack {
  readonly schema: 'sunrise.pack/v1';
  readonly id: string;
  readonly name: Localized;
  readonly version: string;
  readonly locale?: string;
  readonly settings?: PackSettings;
  readonly tracks: readonly Track[];
  readonly phases?: readonly Phase[];
  readonly groups: readonly Group[];
  readonly badges?: readonly BadgeRule[];
  readonly mottos?: readonly Localized[];
  readonly surprises?: readonly Localized[];
  readonly ui?: Readonly<Record<string, Localized>>;
}
export interface Theme {
  readonly schema: 'sunrise.theme/v1';
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly cssHref?: string; // built-in/script-tag themes ship a file path
  readonly css?: string; // imported themes ship inline CSS (materialized to a blob URL)
}
export interface Session {
  activePackId?: string;
  themeId?: string;
  lang?: string;
  cursors?: Record<string, string>;
}
