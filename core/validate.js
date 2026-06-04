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

const API = { check, ID, THEME_SCHEMA, validateTheme, BADGE_RULES, _inHourRange };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (root){ root.SUNRISE = root.SUNRISE || {}; root.SUNRISE._validate = API; }
})(typeof window !== 'undefined' ? window : globalThis);
