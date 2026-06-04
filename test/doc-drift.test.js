// test/doc-drift.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const L = require('../logic.js');

test('content-pack.md documents every badge rule type', () => {
  const doc = fs.readFileSync(path.join(__dirname, '..', 'docs', 'plugins', 'content-pack.md'), 'utf8');
  for (const type of Object.keys(L.BADGE_RULES)) assert.ok(doc.includes('`' + type + '`'), 'undocumented rule type: ' + type);
});
test('content-pack.md documents every required top-level pack field', () => {
  const doc = fs.readFileSync(path.join(__dirname, '..', 'docs', 'plugins', 'content-pack.md'), 'utf8');
  ['schema','id','name','version','tracks','groups'].forEach((f) => assert.ok(doc.includes('`' + f + '`'), 'undocumented field: ' + f));
});
