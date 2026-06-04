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
