#!/usr/bin/env node
// Downloads the bundled Google-Fonts families into fonts/ and emits fonts.css
// (an always-loaded @font-face sheet). The font set is the explicit FONT_CSS_URLS
// list below — themes reference families by name and carry NO @import (that's
// enforced by test/themes/offline-guard.test.ts). Run manually when the list
// changes — NOT part of `npm run build`, which must stay offline & deterministic.
// Reuses already-downloaded woff2 (only new faces are fetched). Outputs (fonts/,
// fonts.css) are committed build artifacts like dist/ and sw.js.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const KEEP = new Set(['latin', 'latin-ext', 'cyrillic']); // the app is EN/RU only
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Google's woff2 CDN occasionally connect-times-out; retry a few times.
async function fetchOk(url, tries = 5) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (r.ok) return r;
      last = new Error(`${url} -> ${r.status}`);
    } catch (e) {
      last = e;
    }
  }
  throw last;
}

// The bundled font library (Google Fonts css2 URLs). Themes pick families by
// name; to extend the library, add a family/URL here and re-run this script.
const FONT_CSS_URLS = [
  'https://fonts.googleapis.com/css2?family=Anton&family=Syne:wght@600;700;800&family=Space+Mono:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Archivo+Black&family=Spline+Sans+Mono:wght@400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap',
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Hanken+Grotesk:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Saira+Semi+Condensed:wght@600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=JetBrains+Mono:wght@500;700&family=Playfair+Display:wght@700;900&display=swap',
  'https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Marcellus&family=Faustina:ital,wght@0,400;0,500;0,600;1,400&family=Spline+Sans+Mono:wght@400;500;600&display=swap',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=PT+Serif:ital,wght@0,400;0,700;1,400&family=PT+Mono&display=swap',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Silkscreen:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700;800&family=Zen+Kaku+Gothic+New:wght@300;400;500;700;900&display=swap',
  'https://fonts.googleapis.com/css2?family=Shrikhand&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap',
  // Hogwarts Express — Cinzel: engraved Roman caps for display/titles.
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap',
];

mkdirSync(join(root, 'fonts'), { recursive: true });
const faces = new Map(); // filename -> rewritten @font-face block (deduped)

for (const url of FONT_CSS_URLS) {
  const css = await (await fetchOk(url)).text();
  // Each face is preceded by a `/* subset */` comment.
  const blockRe = /\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g;
  let b;
  while ((b = blockRe.exec(css))) {
    const subset = b[1];
    const block = b[2];
    if (!KEEP.has(subset)) continue;
    const fam = (/font-family:\s*'([^']+)'/.exec(block) || [])[1] || 'font';
    const wght = (/font-weight:\s*(\d+)/.exec(block) || [])[1] || '400';
    const style = /font-style:\s*italic/.test(block) ? 'italic' : 'normal';
    const src = (/src:\s*url\((https:\/\/[^)]+\.woff2)\)/.exec(block) || [])[1];
    if (!src) continue;
    const name = `${slug(fam)}-${wght}-${style}-${subset}.woff2`;
    if (faces.has(name)) continue;
    faces.set(name, block.replace(src, `fonts/${name}`));
    if (existsSync(join(root, 'fonts', name))) continue; // reuse already-fetched
    const bin = Buffer.from(await (await fetchOk(src)).arrayBuffer());
    writeFileSync(join(root, 'fonts', name), bin);
  }
}

const out =
  `/* Generated by scripts/fetch-fonts.mjs — do not edit by hand.\n` +
  `   Self-hosted @font-face for the bundled themes (offline; no remote deps). */\n` +
  `${[...faces.values()].join('\n')}\n`;
writeFileSync(join(root, 'fonts.css'), out);
console.log(`fonts.css: ${faces.size} faces from ${FONT_CSS_URLS.length} font sets`);
