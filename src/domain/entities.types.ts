import type { BadgeRule } from './badge-rule.types.ts';

export interface Task { readonly id: string; readonly text: string; readonly guidance?: string; }
export interface Resource { readonly label: string; readonly note: string; }
export interface Item {
  readonly id: string;
  readonly track: string;
  readonly title?: string;
  readonly warmup?: string;
  readonly reflectPrompt?: string;
  readonly tasks?: readonly Task[];
  readonly resources?: readonly Resource[];
  readonly rest?: boolean;
}
export interface Group {
  readonly id: string;
  readonly title: string;
  readonly phase?: string;
  readonly theme?: string;
  readonly items: readonly Item[];
}
export interface Phase { readonly id: string; readonly title: string; }
export interface Track {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly color?: string;
  readonly reviewable?: boolean;
}
export interface Labels { readonly phase?: string; readonly group?: string; readonly groupAbbr?: string; readonly item?: string; }
export interface PackSettings {
  readonly labels?: Labels;
  readonly reviews?: boolean;
  readonly reflections?: boolean;
  readonly warmups?: boolean;
}
export interface Pack {
  readonly schema: 'sunrise.pack/v1';
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly locale?: string;
  readonly settings?: PackSettings;
  readonly tracks: readonly Track[];
  readonly phases?: readonly Phase[];
  readonly groups: readonly Group[];
  readonly badges?: readonly BadgeRule[];
  readonly mottos?: readonly string[];
  readonly surprises?: readonly string[];
  readonly ui?: Readonly<Record<string, string>>;
}
export interface Theme {
  readonly schema: 'sunrise.theme/v1';
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly cssHref: string;
}
export interface Session { activePackId?: string; themeId?: string; }
