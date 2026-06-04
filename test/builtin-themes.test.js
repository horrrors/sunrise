// test/builtin-themes.test.js
const test = require('node:test');
const assert = require('node:assert');
const L = require('../logic.js');

test('every bundled theme manifest is valid and references an existing css file', () => {
  const fs = require('fs'); const path = require('path');
  const prevSUNRISE = global.SUNRISE;
  try {
    const registered = [];
    global.SUNRISE = { registerTheme: (t) => registered.push(t), themes: () => registered };
    delete require.cache[require.resolve('../data/builtin-themes.js')];
    require('../data/builtin-themes.js');
    assert.equal(registered.length, 5);
    for (const t of registered){
      assert.deepEqual(L.validateTheme(t), { ok:true }, 'invalid: ' + JSON.stringify(t));
      assert.ok(fs.existsSync(path.join(__dirname, '..', t.cssHref)), 'missing css: ' + t.cssHref);
    }
    assert.deepEqual(registered.map((t) => t.id).sort(), ['bonus','dashboard','emerald','japanese','neon']);
  } finally {
    global.SUNRISE = prevSUNRISE;
    delete require.cache[require.resolve('../data/builtin-themes.js')];
  }
});
