import type { Pack, Theme } from './entities.ts';
import type { BadgeType } from './badge-rule.ts';
import type { ProgressData } from './progress.ts';
import { ValidationError, ImportError, type ValidationIssue } from './errors.ts';

// Schema node for the generic structural walker (port of core/validate.js).
interface Schema {
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null';
  required?: boolean;
  of?: Schema;
  props?: Record<string, Schema>;
  pattern?: RegExp;
  min?: number;
}

function typeOf(v: unknown): string {
  return Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v;
}

// Generic structural walker; pushes issues into `errors`.
function check(value: unknown, schema: Schema, path: string, errors: ValidationIssue[]): void {
  if (value === undefined || value === null) {
    if (schema.required) errors.push({ path, msg: 'required' });
    return;
  }
  const t = typeOf(value);
  if (schema.type && t !== schema.type) {
    errors.push({ path, msg: `expected ${schema.type}, got ${t}` });
    return;
  }
  if (schema.type === 'string' && schema.pattern && !schema.pattern.test(value as string)) {
    errors.push({ path, msg: 'invalid format' });
  }
  if (schema.type === 'array') {
    const arr = value as unknown[];
    if (schema.min != null && arr.length < schema.min) {
      errors.push({ path, msg: `expected >= ${schema.min} items` });
    }
    if (schema.of) arr.forEach((v, i) => check(v, schema.of!, `${path}[${i}]`, errors));
  }
  if (schema.type === 'object' && schema.props) {
    const obj = value as Record<string, unknown>;
    for (const k in schema.props) {
      check(obj[k], schema.props[k]!, path ? `${path}.${k}` : k, errors);
    }
  }
}

const ID: Schema = { type: 'string', required: true, pattern: /^[a-z0-9][a-z0-9-]*$/ };

const THEME_SCHEMA: Schema = {
  type: 'object',
  required: true,
  props: {
    schema: { type: 'string', required: true },
    id: ID,
    name: { type: 'string', required: true },
    version: { type: 'string', required: true },
    cssHref: { type: 'string', required: true },
  },
};

const TASK: Schema = {
  type: 'object',
  props: { id: ID, text: { type: 'string', required: true }, guidance: { type: 'string' } },
};
const RES: Schema = {
  type: 'object',
  props: { label: { type: 'string', required: true }, note: { type: 'string', required: true } },
};
const ITEM: Schema = {
  type: 'object',
  props: {
    id: ID,
    track: { type: 'string', required: true },
    title: { type: 'string' },
    warmup: { type: 'string' },
    reflectPrompt: { type: 'string' },
    tasks: { type: 'array', of: TASK },
    resources: { type: 'array', of: RES },
    rest: { type: 'boolean' },
  },
};
const GROUP: Schema = {
  type: 'object',
  props: {
    id: ID,
    title: { type: 'string', required: true },
    phase: { type: 'string' },
    theme: { type: 'string' },
    items: { type: 'array', required: true, min: 1, of: ITEM },
  },
};
const TRACK: Schema = {
  type: 'object',
  props: {
    id: ID,
    label: { type: 'string', required: true },
    icon: { type: 'string' },
    color: { type: 'string' },
    reviewable: { type: 'boolean' },
  },
};
const PHASE: Schema = { type: 'object', props: { id: ID, title: { type: 'string', required: true } } };
const BADGE: Schema = {
  type: 'object',
  props: {
    id: ID,
    title: { type: 'string', required: true },
    desc: { type: 'string' },
    icon: { type: 'string' },
    type: { type: 'string', required: true },
  },
};

const PACK_SCHEMA: Schema = {
  type: 'object',
  required: true,
  props: {
    schema: { type: 'string', required: true },
    id: ID,
    name: { type: 'string', required: true },
    version: { type: 'string', required: true },
    locale: { type: 'string' },
    settings: { type: 'object' },
    tracks: { type: 'array', required: true, min: 1, of: TRACK },
    phases: { type: 'array', of: PHASE },
    groups: { type: 'array', required: true, min: 1, of: GROUP },
    badges: { type: 'array', of: BADGE },
    mottos: { type: 'array', of: { type: 'string' } },
    surprises: { type: 'array', of: { type: 'string' } },
  },
};

// Required params per badge type — mirror of the old BADGE_RULES param specs.
const BADGE_PARAMS: Record<BadgeType, Record<string, 'number' | 'string' | 'string?' | 'number[]'>> = {
  streak: { gte: 'number' },
  'days-done': { gte: 'number' },
  percent: { gte: 'number' },
  'all-done': {},
  'tasks-done': { gte: 'number', track: 'string?' },
  reflections: { gte: 'number' },
  'groups-complete': { gte: 'number' },
  'track-complete': { track: 'string' },
  'phase-complete': { phase: 'string' },
  'item-complete': { item: 'string' },
  'all-tracks': { eachGte: 'number' },
  weekday: { days: 'number[]' },
  'hour-range': { from: 'number', to: 'number' },
  comeback: {},
};

interface Refs {
  trackIds: Set<string>;
  phaseIds: Set<string>;
  itemIds: Set<string>;
}

function uniq<T>(
  list: readonly T[],
  keyFn: (x: T) => string | null | undefined,
  label: string,
  errors: ValidationIssue[],
): void {
  const seen = new Set<string>();
  list.forEach((x, i) => {
    const k = keyFn(x);
    if (k == null) return;
    if (seen.has(k)) errors.push({ path: `${label}[${i}]`, msg: `duplicate id "${k}"` });
    seen.add(k);
  });
}

function checkBadgeRule(
  b: Record<string, unknown>,
  path: string,
  refs: Refs,
  errors: ValidationIssue[],
): void {
  const params = BADGE_PARAMS[b['type'] as BadgeType];
  if (!params) {
    errors.push({ path: `${path}.type`, msg: `unknown rule type "${String(b['type'])}"` });
    return;
  }
  for (const k in params) {
    const spec = params[k]!;
    const optional = spec.endsWith('?');
    const base = optional ? spec.slice(0, -1) : spec;
    const v = b[k];
    if (v === undefined) {
      if (!optional) errors.push({ path: `${path}.${k}`, msg: 'required' });
      continue;
    }
    const ok =
      base === 'number[]'
        ? Array.isArray(v) && v.every((n) => typeof n === 'number')
        : typeof v === base;
    if (!ok) errors.push({ path: `${path}.${k}`, msg: `expected ${base}` });
  }
  const type = b['type'];
  const track = b['track'];
  if ((type === 'track-complete' || type === 'tasks-done') && track != null && !refs.trackIds.has(track as string)) {
    errors.push({ path: `${path}.track`, msg: `track "${String(track)}" not declared` });
  }
  const phase = b['phase'];
  if (type === 'phase-complete' && phase != null && !refs.phaseIds.has(phase as string)) {
    errors.push({ path: `${path}.phase`, msg: `phase "${String(phase)}" not declared` });
  }
  const item = b['item'];
  if (type === 'item-complete' && item != null && !refs.itemIds.has(item as string)) {
    errors.push({ path: `${path}.item`, msg: `item "${String(item)}" not declared` });
  }
}

export class PackValidator {
  parse(raw: unknown): Pack {
    const errors: ValidationIssue[] = [];
    check(raw, PACK_SCHEMA, '', errors);
    if (errors.length) throw new ValidationError(errors);
    const pack = raw as Record<string, unknown>;
    if (pack['schema'] !== 'sunrise.pack/v1') {
      throw new ValidationError([
        { path: 'schema', msg: `unsupported contract version "${String(pack['schema'])}"` },
      ]);
    }
    const tracks = pack['tracks'] as Array<Record<string, unknown>>;
    const phases = (pack['phases'] as Array<Record<string, unknown>>) || [];
    const groups = pack['groups'] as Array<Record<string, unknown>>;
    const badges = (pack['badges'] as Array<Record<string, unknown>>) || [];
    uniq(tracks, (t) => t['id'] as string, 'tracks', errors);
    if (pack['phases']) uniq(phases, (p) => p['id'] as string, 'phases', errors);
    uniq(groups, (g) => g['id'] as string, 'groups', errors);
    if (pack['badges']) uniq(badges, (b) => b['id'] as string, 'badges', errors);
    const trackIds = new Set(tracks.map((t) => t['id'] as string));
    trackIds.add('rest');
    const phaseIds = new Set(phases.map((p) => p['id'] as string));
    const itemIds = new Set<string>();
    groups.forEach((g, gi) => {
      const gphase = g['phase'];
      if (gphase != null && !phaseIds.has(gphase as string)) {
        errors.push({ path: `groups[${gi}].phase`, msg: `phase "${String(gphase)}" not declared` });
      }
      const items = g['items'] as Array<Record<string, unknown>>;
      items.forEach((it, ii) => {
        const p = `groups[${gi}].items[${ii}]`;
        const itId = it['id'] as string;
        if (itemIds.has(itId)) errors.push({ path: `${p}.id`, msg: `duplicate item id "${itId}"` });
        itemIds.add(itId);
        if (!trackIds.has(it['track'] as string)) {
          errors.push({ path: `${p}.track`, msg: `track "${String(it['track'])}" not declared` });
        }
        const tids = new Set<string>();
        const tasks = (it['tasks'] as Array<Record<string, unknown>>) || [];
        tasks.forEach((t, ti) => {
          const tid = t['id'] as string;
          if (tids.has(tid)) errors.push({ path: `${p}.tasks[${ti}].id`, msg: `duplicate task id "${tid}"` });
          tids.add(tid);
        });
      });
    });
    badges.forEach((b, bi) => checkBadgeRule(b, `badges[${bi}]`, { trackIds, phaseIds, itemIds }, errors));
    if (errors.length) throw new ValidationError(errors);
    return raw as Pack;
  }
}

export class ThemeValidator {
  parse(raw: unknown): Theme {
    const errors: ValidationIssue[] = [];
    check(raw, THEME_SCHEMA, '', errors);
    if (errors.length) throw new ValidationError(errors);
    const theme = raw as Record<string, unknown>;
    if (theme['schema'] !== 'sunrise.theme/v1') {
      throw new ValidationError([
        { path: 'schema', msg: `unsupported contract version "${String(theme['schema'])}"` },
      ]);
    }
    return raw as Theme;
  }
}

const PROGRESS_SCHEMA: Schema = {
  type: 'object',
  required: true,
  props: {
    schema: { type: 'string' },
    items: { type: 'object', required: true },
    reviews: { type: 'array', required: true },
    badges: { type: 'object' },
  },
};

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

export class ProgressValidator {
  parse(raw: unknown): ProgressData {
    let data: Record<string, unknown>;
    if (isObj(raw)) data = raw;
    else throw new ValidationError([{ path: '', msg: `expected object, got ${typeOf(raw)}` }]);
    // Legacy v2 blob: { days, ... } → { items, ... }.
    if (data['days'] && !data['items']) {
      data = {
        schema: 'sunrise.progress/v1',
        items: data['days'],
        reviews: data['reviews'] || [],
        badges: data['badges'] || {},
        lastSurprise: data['lastSurprise'] || null,
      };
    }
    const errors: ValidationIssue[] = [];
    check(data, PROGRESS_SCHEMA, '', errors);
    if (errors.length) throw new ValidationError(errors);
    const items = data['items'] as Record<string, unknown>;
    for (const id in items) {
      const it = items[id];
      if (!it || typeof it !== 'object' || Array.isArray(it)) {
        errors.push({ path: `items.${id}`, msg: 'must be an object' });
      }
    }
    const reviews = data['reviews'] as unknown[];
    reviews.forEach((r, i) => {
      const rr = r as Record<string, unknown>;
      if (
        !rr ||
        typeof rr !== 'object' ||
        typeof rr['itemId'] !== 'string' ||
        typeof rr['lastDate'] !== 'string' ||
        typeof rr['stage'] !== 'number'
      ) {
        errors.push({ path: `reviews[${i}]`, msg: 'bad review shape' });
      }
    });
    if (errors.length) throw new ValidationError(errors);
    const rawBadges = data['badges'];
    const badges = isObj(rawBadges) ? rawBadges : {};
    return {
      schema: 'sunrise.progress/v1',
      items: items as ProgressData['items'],
      reviews: reviews as ProgressData['reviews'],
      badges: badges as ProgressData['badges'],
      lastSurprise: (data['lastSurprise'] as ProgressData['lastSurprise']) || null,
    };
  }

  parseJson(json: string): ProgressData {
    let data: unknown;
    try {
      data = JSON.parse(json);
    } catch {
      throw new ImportError('Invalid JSON');
    }
    return this.parse(data);
  }
}
