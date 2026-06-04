// test/registry.test.js
const test = require('node:test');
const assert = require('node:assert');

function freshRegistry(){
  delete require.cache[require.resolve('../core/validate.js')];
  delete require.cache[require.resolve('../core/registry.js')];
  global.SUNRISE = undefined;
  require('../core/validate.js');
  require('../core/registry.js');
  return global.SUNRISE;
}
const VALID_PACK = { schema:'sunrise.pack/v1', id:'p', name:'P', version:'1.0.0',
  tracks:[{ id:'a', label:'A' }], groups:[{ id:'g', title:'G', items:[{ id:'i', track:'a', tasks:[{ id:'t', text:'x' }] }] }] };
const VALID_THEME = { schema:'sunrise.theme/v1', id:'t', name:'T', version:'1.0.0', cssHref:'t.css' };

test('registerPack/registerTheme accept valid plugins', () => {
  const S = freshRegistry();
  S.registerPack(VALID_PACK); S.registerTheme(VALID_THEME);
  assert.equal(S.packs().length, 1);
  assert.equal(S.themes().length, 1);
  assert.equal(S.packs()[0].id, 'p');
});
test('invalid pack is rejected, not registered, and recorded', () => {
  const S = freshRegistry();
  S.registerPack({ schema:'sunrise.pack/v1', id:'bad' });   // missing name/version/tracks/groups
  assert.equal(S.packs().length, 0);
  assert.equal(S._rejected.length, 1);
  assert.equal(S._rejected[0].kind, 'pack');
  assert.ok(S._rejected[0].errors.length > 0);
});
