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
