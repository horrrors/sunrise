// test/badges.test.js
const test = require('node:test');
const assert = require('node:assert');
const V = require('../core/validate.js');

test('BADGE_RULES: every rule has params spec and a test fn', () => {
  const types = Object.keys(V.BADGE_RULES);
  assert.ok(types.length >= 14, 'rule count: ' + types.length);
  for (const t of types){
    assert.equal(typeof V.BADGE_RULES[t].test, 'function', t + ' test');
    assert.equal(typeof V.BADGE_RULES[t].params, 'object', t + ' params');
  }
});
test('hour-range helper wraps when from>to', () => {
  assert.equal(V._inHourRange(23, 22, 5), true);   // night-owl
  assert.equal(V._inHourRange(3, 22, 5), true);
  assert.equal(V._inHourRange(10, 22, 5), false);
  assert.equal(V._inHourRange(6, 5, 8), true);     // early-lark
  assert.equal(V._inHourRange(8, 5, 8), false);
});
