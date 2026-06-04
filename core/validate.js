// core/validate.js
'use strict';
(function (root) {

function _typeOf(v){ return Array.isArray(v) ? 'array' : (v === null ? 'null' : typeof v); }

// Generic structural walker. schema node: { type, required, of, props, pattern, min }
function check(value, schema, path, errors){
  if (value === undefined || value === null){
    if (schema.required) errors.push({ path, msg: 'required' });
    return;
  }
  const t = _typeOf(value);
  if (schema.type && t !== schema.type){ errors.push({ path, msg: `expected ${schema.type}, got ${t}` }); return; }
  if (schema.type === 'string' && schema.pattern && !schema.pattern.test(value)) errors.push({ path, msg: 'invalid format' });
  if (schema.type === 'array'){
    if (schema.min != null && value.length < schema.min) errors.push({ path, msg: `expected >= ${schema.min} items` });
    if (schema.of) value.forEach((v, i) => check(v, schema.of, `${path}[${i}]`, errors));
  }
  if (schema.type === 'object' && schema.props){
    for (const k in schema.props) check(value[k], schema.props[k], path ? `${path}.${k}` : k, errors);
  }
}

const ID = { type:'string', required:true, pattern:/^[a-z0-9][a-z0-9-]*$/ };

const THEME_SCHEMA = { type:'object', required:true, props:{
  schema:{ type:'string', required:true },
  id: ID, name:{ type:'string', required:true }, version:{ type:'string', required:true },
  cssHref:{ type:'string', required:true },
} };

function validateTheme(theme){
  const errors = []; check(theme, THEME_SCHEMA, '', errors);
  if (errors.length) return { ok:false, errors };
  if (theme.schema !== 'sunrise.theme/v1') return { ok:false, errors:[{ path:'schema', msg:`unsupported contract version "${theme.schema}"` }] };
  return { ok:true };
}

const _TASK  = { type:'object', props:{ id:ID, text:{ type:'string', required:true }, guidance:{ type:'string' } } };
const _RES   = { type:'object', props:{ label:{ type:'string', required:true }, note:{ type:'string', required:true } } };
const _ITEM  = { type:'object', props:{
  id:ID, track:{ type:'string', required:true }, title:{ type:'string' },
  warmup:{ type:'string' }, reflectPrompt:{ type:'string' },
  tasks:{ type:'array', of:_TASK }, resources:{ type:'array', of:_RES }, rest:{ type:'boolean' } } };
const _GROUP = { type:'object', props:{
  id:ID, title:{ type:'string', required:true }, phase:{ type:'string' }, theme:{ type:'string' },
  items:{ type:'array', required:true, min:1, of:_ITEM } } };
const _TRACK = { type:'object', props:{
  id:ID, label:{ type:'string', required:true }, icon:{ type:'string' }, color:{ type:'string' }, reviewable:{ type:'boolean' } } };
const _PHASE = { type:'object', props:{ id:ID, title:{ type:'string', required:true } } };
const _BADGE = { type:'object', props:{
  id:ID, title:{ type:'string', required:true }, desc:{ type:'string' }, icon:{ type:'string' }, type:{ type:'string', required:true } } };

const PACK_SCHEMA = { type:'object', required:true, props:{
  schema:{ type:'string', required:true },
  id:ID, name:{ type:'string', required:true }, version:{ type:'string', required:true }, locale:{ type:'string' },
  settings:{ type:'object' },
  tracks:{ type:'array', required:true, min:1, of:_TRACK },
  phases:{ type:'array', of:_PHASE },
  groups:{ type:'array', required:true, min:1, of:_GROUP },
  badges:{ type:'array', of:_BADGE },
  mottos:{ type:'array', of:{ type:'string' } }, surprises:{ type:'array', of:{ type:'string' } } } };

function _uniq(list, keyFn, label, errors){
  const seen = new Set(); list.forEach((x, i) => { const k = keyFn(x); if (k == null) return;
    if (seen.has(k)) errors.push({ path:`${label}[${i}]`, msg:`duplicate id "${k}"` }); seen.add(k); });
}

function _checkBadgeRule(b, path, refs, errors){
  const def = BADGE_RULES[b.type];
  if (!def){ errors.push({ path:`${path}.type`, msg:`unknown rule type "${b.type}"` }); return; }
  for (const k in def.params){
    const spec = def.params[k]; const optional = spec.endsWith('?'); const base = optional ? spec.slice(0, -1) : spec;
    const v = b[k];
    if (v === undefined){ if (!optional) errors.push({ path:`${path}.${k}`, msg:'required' }); continue; }
    const ok = base === 'number[]' ? (Array.isArray(v) && v.every(n => typeof n === 'number')) : (typeof v === base);
    if (!ok) errors.push({ path:`${path}.${k}`, msg:`expected ${base}` });
  }
  if ((b.type === 'track-complete' || b.type === 'tasks-done') && b.track != null && !refs.trackIds.has(b.track))
    errors.push({ path:`${path}.track`, msg:`track "${b.track}" not declared` });
  if (b.type === 'phase-complete' && b.phase != null && !refs.phaseIds.has(b.phase))
    errors.push({ path:`${path}.phase`, msg:`phase "${b.phase}" not declared` });
  if (b.type === 'item-complete' && b.item != null && !refs.itemIds.has(b.item))
    errors.push({ path:`${path}.item`, msg:`item "${b.item}" not declared` });
}

function validatePack(pack){
  const errors = []; check(pack, PACK_SCHEMA, '', errors);
  if (errors.length) return { ok:false, errors };
  if (pack.schema !== 'sunrise.pack/v1') return { ok:false, errors:[{ path:'schema', msg:`unsupported contract version "${pack.schema}"` }] };
  _uniq(pack.tracks, t => t.id, 'tracks', errors);
  if (pack.phases) _uniq(pack.phases, p => p.id, 'phases', errors);
  _uniq(pack.groups, g => g.id, 'groups', errors);
  if (pack.badges) _uniq(pack.badges, b => b.id, 'badges', errors);
  const trackIds = new Set(pack.tracks.map(t => t.id)); trackIds.add('rest');
  const phaseIds = new Set((pack.phases || []).map(p => p.id));
  const itemIds = new Set();
  pack.groups.forEach((g, gi) => {
    if (g.phase != null && !phaseIds.has(g.phase)) errors.push({ path:`groups[${gi}].phase`, msg:`phase "${g.phase}" not declared` });
    g.items.forEach((it, ii) => {
      const p = `groups[${gi}].items[${ii}]`;
      if (itemIds.has(it.id)) errors.push({ path:`${p}.id`, msg:`duplicate item id "${it.id}"` });
      itemIds.add(it.id);
      if (!trackIds.has(it.track)) errors.push({ path:`${p}.track`, msg:`track "${it.track}" not declared` });
      const tids = new Set();
      (it.tasks || []).forEach((t, ti) => { if (tids.has(t.id)) errors.push({ path:`${p}.tasks[${ti}].id`, msg:`duplicate task id "${t.id}"` }); tids.add(t.id); });
    });
  });
  (pack.badges || []).forEach((b, bi) => _checkBadgeRule(b, `badges[${bi}]`, { trackIds, phaseIds, itemIds }, errors));
  return errors.length ? { ok:false, errors } : { ok:true };
}

function _inHourRange(h, from, to){ return from <= to ? (h >= from && h < to) : (h >= from || h < to); }

const BADGE_RULES = {
  'streak':          { params:{ gte:'number' },                test:(r,c)=> c.longestStreak >= r.gte },
  'days-done':       { params:{ gte:'number' },                test:(r,c)=> c.daysDone >= r.gte },
  'percent':         { params:{ gte:'number' },                test:(r,c)=> c.pct >= r.gte },
  'all-done':        { params:{},                              test:(r,c)=> c.total > 0 && c.daysDone === c.total },
  'tasks-done':      { params:{ gte:'number', track:'string?' }, test:(r,c)=> c.tasks(r.track) >= r.gte },
  'reflections':     { params:{ gte:'number' },                test:(r,c)=> c.reflections >= r.gte },
  'groups-complete': { params:{ gte:'number' },                test:(r,c)=> c.groupsComplete >= r.gte },
  'track-complete':  { params:{ track:'string' },              test:(r,c)=> c.trackPct(r.track) === 100 },
  'phase-complete':  { params:{ phase:'string' },              test:(r,c)=> c.phasePct(r.phase) === 100 },
  'item-complete':   { params:{ item:'string' },               test:(r,c)=> c.itemComplete(r.item) },
  'all-tracks':      { params:{ eachGte:'number' },            test:(r,c)=> c.tracks.length > 0 && c.tracks.every(t => c.trackDone(t) >= r.eachGte) },
  'weekday':         { params:{ days:'number[]' },             test:(r,c)=> c.dates.some(d => r.days.includes(c.weekday(d) + 1)) },
  'hour-range':      { params:{ from:'number', to:'number' },  test:(r,c)=> c.hours.some(h => _inHourRange(h, r.from, r.to)) },
  'comeback':        { params:{},                              test:(r,c)=> c.hasComeback },
};

const PROGRESS_SCHEMA = { type:'object', required:true, props:{
  schema:{ type:'string' },
  items:{ type:'object', required:true },
  reviews:{ type:'array', required:true },
  badges:{ type:'object' } } };

function validateProgress(progress){
  const errors = []; check(progress, PROGRESS_SCHEMA, '', errors);
  if (errors.length) return { ok:false, errors };
  for (const id in progress.items){ const it = progress.items[id];
    if (!it || typeof it !== 'object' || Array.isArray(it)) errors.push({ path:`items.${id}`, msg:'must be an object' }); }
  progress.reviews.forEach((r, i) => {
    if (!r || typeof r !== 'object' || typeof r.itemId !== 'string' || typeof r.lastDate !== 'string' || typeof r.stage !== 'number')
      errors.push({ path:`reviews[${i}]`, msg:'bad review shape' }); });
  return errors.length ? { ok:false, errors } : { ok:true };
}

function serializeProgress(progress){ return JSON.stringify(progress, null, 2); }

function parseProgress(jsonString){
  let data; try { data = JSON.parse(jsonString); } catch (e){ return { ok:false, error:'Invalid JSON' }; }
  if (!data || typeof data !== 'object') return { ok:false, error:'Not an object' };
  if (data.days && !data.items) data = { schema:'sunrise.progress/v1', items:data.days, reviews:data.reviews || [], badges:data.badges || {}, lastSurprise:data.lastSurprise || null };
  const v = validateProgress(data);
  if (!v.ok) return { ok:false, error: v.errors.map(e => `${e.path}: ${e.msg}`).join('; ') };
  const badges = (data.badges && typeof data.badges === 'object' && !Array.isArray(data.badges)) ? data.badges : {};
  return { ok:true, progress:{ schema:'sunrise.progress/v1', items:data.items, reviews:data.reviews, badges, lastSurprise:data.lastSurprise || null } };
}

const API = { check, ID, THEME_SCHEMA, validateTheme, PACK_SCHEMA, validatePack, PROGRESS_SCHEMA, validateProgress, serializeProgress, parseProgress, BADGE_RULES, _inHourRange };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (root){ root.SUNRISE = root.SUNRISE || {}; root.SUNRISE._validate = API; }
})(typeof window !== 'undefined' ? window : globalThis);
