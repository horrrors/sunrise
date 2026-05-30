const test = require('node:test');
const assert = require('node:assert');
const C = require('../curriculum.js');

const TRACKS = ['dsa','js','ts','node','sysdesign','patterns','distsys','db','cs','rest'];

test('has 13 weeks, numbered 1..13, with correct phase', () => {
  assert.equal(C.weeks.length, 13);
  C.weeks.forEach((w, i) => {
    assert.equal(w.num, i + 1);
    const expected = w.num <= 4 ? 1 : w.num <= 9 ? 2 : 3;
    assert.equal(w.phase, expected, `week ${w.num} phase`);
    assert.ok(typeof w.theme === 'string' && w.theme.length > 0);
  });
});

test('each week has 7 days, dow 1..7, dow7 is rest', () => {
  for (const w of C.weeks) {
    assert.equal(w.days.length, 7, `week ${w.num} day count`);
    w.days.forEach((d, i) => {
      assert.equal(d.dow, i + 1, `${d.id} dow`);
      assert.equal(d.week, w.num, `${d.id} week`);
      assert.equal(d.id, `w${w.num}d${i + 1}`, `${d.id} id format`);
      assert.ok(TRACKS.includes(d.track), `${d.id} track ${d.track}`);
      if (d.dow === 7) {
        assert.equal(d.track, 'rest', `${d.id} should be rest`);
        assert.equal(d.warmup, null, `${d.id} warmup null`);
        assert.deepEqual(d.tasks, [], `${d.id} tasks empty`);
      } else {
        assert.equal(d.track !== 'rest', true, `${d.id} not rest`);
        assert.ok(typeof d.warmup === 'string' && d.warmup.length > 0, `${d.id} warmup`);
        assert.ok(d.tasks.length >= 2 && d.tasks.length <= 4, `${d.id} tasks 2-4`);
      }
    });
  }
});

test('day ids are globally unique; task ids unique within a day', () => {
  const ids = new Set();
  for (const w of C.weeks) for (const d of w.days) {
    assert.equal(ids.has(d.id), false, `dup day ${d.id}`);
    ids.add(d.id);
    const tids = new Set();
    for (const t of d.tasks) {
      assert.equal(tids.has(t.id), false, `dup task ${d.id}/${t.id}`);
      tids.add(t.id);
      assert.ok(typeof t.text === 'string' && t.text.length > 0, `${d.id}/${t.id} text`);
    }
  }
});

test('rotation: dow1=dsa, dow3=sysdesign, dow6=patterns', () => {
  for (const w of C.weeks) {
    assert.equal(w.days[0].track, 'dsa', `w${w.num} Mon`);
    assert.equal(w.days[2].track, 'sysdesign', `w${w.num} Wed`);
    assert.equal(w.days[5].track, 'patterns', `w${w.num} Sat`);
  }
});

test('phases array references all 13 weeks', () => {
  const wk = C.phases.flatMap((p) => p.weeks).sort((a, b) => a - b);
  assert.deepEqual(wk, [1,2,3,4,5,6,7,8,9,10,11,12,13]);
});
