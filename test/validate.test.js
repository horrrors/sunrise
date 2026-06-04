// test/validate.test.js
const test = require('node:test');
const assert = require('node:assert');
const V = require('../core/validate.js');

test('validateTheme: valid theme passes', () => {
  const r = V.validateTheme({ schema:'sunrise.theme/v1', id:'neon', name:'Neon', version:'1.0.0', cssHref:'themes/neon.css' });
  assert.deepEqual(r, { ok:true });
});
test('validateTheme: missing cssHref reports path', () => {
  const r = V.validateTheme({ schema:'sunrise.theme/v1', id:'neon', name:'Neon', version:'1.0.0' });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => e.path === 'cssHref' && e.msg === 'required'), JSON.stringify(r.errors));
});
test('validateTheme: bad id format reports', () => {
  const r = V.validateTheme({ schema:'sunrise.theme/v1', id:'Neon!', name:'Neon', version:'1.0.0', cssHref:'x.css' });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => e.path === 'id'));
});
test('validateTheme: wrong contract version rejected', () => {
  const r = V.validateTheme({ schema:'sunrise.theme/v2', id:'neon', name:'Neon', version:'1.0.0', cssHref:'x.css' });
  assert.equal(r.ok, false);
  assert.ok(r.errors[0].msg.includes('unsupported contract version'));
});

const MINIMAL_PACK = {
  schema:'sunrise.pack/v1', id:'p', name:'P', version:'1.0.0',
  tracks:[{ id:'dsa', label:'DSA' }],
  groups:[{ id:'g1', title:'G1', items:[
    { id:'g1i1', track:'dsa', title:'A', tasks:[{ id:'t1', text:'x' }] },
  ] }],
};
test('validatePack: minimal valid pack passes', () => {
  assert.deepEqual(V.validatePack(MINIMAL_PACK), { ok:true });
});
test('validatePack: item referencing undeclared track', () => {
  const bad = JSON.parse(JSON.stringify(MINIMAL_PACK));
  bad.groups[0].items[0].track = 'nope';
  const r = V.validatePack(bad);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => e.path === 'groups[0].items[0].track' && /not declared/.test(e.msg)), JSON.stringify(r.errors));
});
test('validatePack: duplicate item id', () => {
  const bad = JSON.parse(JSON.stringify(MINIMAL_PACK));
  bad.groups[0].items.push({ id:'g1i1', track:'dsa', title:'B', tasks:[{ id:'t1', text:'y' }] });
  const r = V.validatePack(bad);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => /duplicate item id/.test(e.msg)));
});
test('validatePack: unknown badge type + bad ref', () => {
  const bad = JSON.parse(JSON.stringify(MINIMAL_PACK));
  bad.badges = [
    { id:'b1', title:'B1', type:'tarck-complete', track:'dsa' },
    { id:'b2', title:'B2', type:'item-complete', item:'ghost' },
    { id:'b3', title:'B3', type:'tasks-done', gte:5 },           // valid (track optional)
  ];
  const r = V.validatePack(bad);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => e.path === 'badges[0].type' && /unknown rule type/.test(e.msg)));
  assert.ok(r.errors.some(e => e.path === 'badges[1].item' && /not declared/.test(e.msg)));
});
test('validatePack: group.phase must be declared', () => {
  const bad = JSON.parse(JSON.stringify(MINIMAL_PACK));
  bad.groups[0].phase = 'p1';
  const r = V.validatePack(bad);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => e.path === 'groups[0].phase' && /not declared/.test(e.msg)));
});
test('validatePack: wrong contract version rejected', () => {
  const bad = { ...MINIMAL_PACK, schema:'sunrise.pack/v2' };
  const r = V.validatePack(bad);
  assert.equal(r.ok, false);
  assert.ok(r.errors[0].msg.includes('unsupported contract version'));
});

test('validateProgress: well-formed passes', () => {
  const p = { schema:'sunrise.progress/v1', items:{ a:{ tasks:{}, reflection:'', completedAt:null, completedHour:null } }, reviews:[], badges:{} };
  assert.deepEqual(V.validateProgress(p), { ok:true });
});
test('validateProgress: null day value rejected (review robustness bug)', () => {
  const r = V.validateProgress({ items:{ x:null }, reviews:[] });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => e.path === 'items.x'));
});
test('validateProgress: malformed review element rejected', () => {
  const r = V.validateProgress({ items:{}, reviews:['oops', null] });
  assert.equal(r.ok, false);
  assert.ok(r.errors.some(e => /reviews\[0\]/.test(e.path)));
});
test('parseProgress: rejects bad JSON / bad shape; migrates legacy days->items', () => {
  assert.equal(V.parseProgress('{x').ok, false);
  assert.equal(V.parseProgress(JSON.stringify({ items:{ a:5 }, reviews:[] })).ok, false);
  const legacy = JSON.stringify({ version:2, days:{ w1d1:{ tasks:{t1:true}, reflection:'', completedAt:'2026-05-30', completedHour:14 } }, reviews:[], badges:{ 'first-light':{ at:'2026-05-30' } } });
  const r = V.parseProgress(legacy);
  assert.equal(r.ok, true);
  assert.ok(r.progress.items.w1d1, 'days migrated to items');
  assert.equal(r.progress.badges['first-light'].at, '2026-05-30');
});

test('validatePack: id "constructor" is NOT a false duplicate (proto-chain regression)', () => {
  const ok = JSON.parse(JSON.stringify(MINIMAL_PACK));
  ok.tracks = [{ id:'constructor', label:'C' }];
  ok.groups[0].items[0].track = 'constructor';
  assert.deepEqual(V.validatePack(ok), { ok:true });
});
test('validatePack: duplicate track id flagged', () => {
  const bad = JSON.parse(JSON.stringify(MINIMAL_PACK));
  bad.tracks.push({ id:'dsa', label:'dup' });
  const r = V.validatePack(bad);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /duplicate id "dsa"/.test(e.msg)), JSON.stringify(r.errors));
});
test('validatePack: duplicate badge id flagged', () => {
  const bad = JSON.parse(JSON.stringify(MINIMAL_PACK));
  bad.badges = [{ id:'x', title:'X', type:'all-done' }, { id:'x', title:'X2', type:'comeback' }];
  const r = V.validatePack(bad);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /duplicate id "x"/.test(e.msg)));
});
test('validatePack: track-complete with undeclared track', () => {
  const bad = JSON.parse(JSON.stringify(MINIMAL_PACK));
  bad.badges = [{ id:'m', title:'M', type:'track-complete', track:'ghost' }];
  const r = V.validatePack(bad);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.path === 'badges[0].track' && /not declared/.test(e.msg)));
});
test('validatePack: phase-complete with undeclared phase', () => {
  const bad = JSON.parse(JSON.stringify(MINIMAL_PACK));
  bad.phases = [{ id:'p1', title:'P1' }];
  bad.badges = [{ id:'pc', title:'PC', type:'phase-complete', phase:'p9' }];
  const r = V.validatePack(bad);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.path === 'badges[0].phase' && /not declared/.test(e.msg)));
});
test('validatePack: weekday days must be number[]', () => {
  const bad = JSON.parse(JSON.stringify(MINIMAL_PACK));
  bad.badges = [{ id:'w', title:'W', type:'weekday', days:'sat' }];
  const r = V.validatePack(bad);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.path === 'badges[0].days' && /number\[\]/.test(e.msg)));
});
test('validatePack: empty tracks array rejected (min 1)', () => {
  const bad = JSON.parse(JSON.stringify(MINIMAL_PACK));
  bad.tracks = [];
  const r = V.validatePack(bad);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.path === 'tracks'));
});
