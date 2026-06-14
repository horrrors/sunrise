// Dev tool (not shipped): extract/apply translations for a content pack.
//   node scripts/i18n-pack.mjs extract <pack.js> <out-entries.json>
//   node scripts/i18n-pack.mjs apply   <pack.js> <en-map.json>   (rewrites pack.js in place)
//
// "apply" wraps each translatable leaf string into { en, ru } where ru is the
// existing text and en comes from the map (keyed by JSON path). Fields not in
// the map are left untouched (so partial translation falls back to ru via tr()).
import fs from 'node:fs';

const [, , mode, file, arg] = process.argv;
if (!mode || !file) {
  console.error('usage: i18n-pack.mjs <extract|apply> <pack.js> <json>');
  process.exit(1);
}

const src = fs.readFileSync(file, 'utf8');
const objStart = src.indexOf('{', src.indexOf('var pack ='));
const nl = src.indexOf('\n};', objStart); // object closes at "\n};"
const jsonText = src.slice(objStart, nl + 2); // include the closing }
const pack = JSON.parse(jsonText);

const isStr = (v) => typeof v === 'string';

// Collect translatable (path, ru) leaves in document order.
function collect() {
  const out = [];
  const add = (path, v) => {
    if (isStr(v)) out.push({ path, ru: v });
  };
  add('name', pack.name);
  if (pack.settings && pack.settings.labels)
    for (const k of Object.keys(pack.settings.labels))
      add(`settings.labels.${k}`, pack.settings.labels[k]);
  (pack.tracks || []).forEach((t, i) => add(`tracks.${i}.label`, t.label));
  (pack.phases || []).forEach((p, i) => add(`phases.${i}.title`, p.title));
  (pack.groups || []).forEach((g, gi) => {
    add(`groups.${gi}.title`, g.title);
    (g.items || []).forEach((it, ii) => {
      const b = `groups.${gi}.items.${ii}`;
      add(`${b}.title`, it.title);
      add(`${b}.warmup`, it.warmup);
      add(`${b}.reflectPrompt`, it.reflectPrompt);
      (it.tasks || []).forEach((t, ti) => {
        add(`${b}.tasks.${ti}.text`, t.text);
        add(`${b}.tasks.${ti}.guidance`, t.guidance);
      });
      (it.resources || []).forEach((r, ri) => {
        add(`${b}.resources.${ri}.label`, r.label);
        add(`${b}.resources.${ri}.note`, r.note);
      });
    });
  });
  (pack.badges || []).forEach((bd, bi) => {
    add(`badges.${bi}.title`, bd.title);
    add(`badges.${bi}.desc`, bd.desc);
  });
  (pack.mottos || []).forEach((m, mi) => add(`mottos.${mi}`, m));
  (pack.surprises || []).forEach((s, si) => add(`surprises.${si}`, s));
  return out;
}

function setByPath(root, path, value) {
  const segs = path.split('.');
  let o = root;
  for (let i = 0; i < segs.length - 1; i++) o = o[segs[i]];
  o[segs[segs.length - 1]] = value;
}

if (mode === 'extract') {
  const entries = collect();
  fs.writeFileSync(arg, JSON.stringify(entries, null, 2));
  console.error(`extracted ${entries.length} strings → ${arg}`);
} else if (mode === 'apply') {
  const enMap = JSON.parse(fs.readFileSync(arg, 'utf8'));
  const entries = collect();
  let wrapped = 0;
  let missing = 0;
  for (const { path, ru } of entries) {
    const en = enMap[path];
    if (typeof en === 'string' && en.length) {
      setByPath(pack, path, { en, ru });
      wrapped++;
    } else {
      missing++;
    }
  }
  const head = "'use strict';\n(function (root) {\n  var pack = ";
  const tail =
    ';\n' +
    '  if (root.SUNRISE && root.SUNRISE.registerPack) root.SUNRISE.registerPack(pack);\n' +
    "  if (typeof module !== 'undefined' && module.exports) module.exports = pack;\n" +
    "})(typeof window !== 'undefined' ? window : globalThis);\n";
  fs.writeFileSync(file, head + JSON.stringify(pack, null, 2) + tail);
  console.error(`applied: ${wrapped} wrapped, ${missing} left untranslated (fall back to ru)`);
} else {
  console.error('unknown mode', mode);
  process.exit(1);
}
