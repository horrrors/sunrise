#!/usr/bin/env node
// Rasterize icons/icon.svg -> committed PNGs via headless Chrome (dev-only tool;
// CI never runs this). The maskable variant zooms the mark out to the 80% safe
// zone on a full-bleed background.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, copyFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const CHROME =
  process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const root = resolve(new URL('..', import.meta.url).pathname);
const svg = join(root, 'icons', 'icon.svg');

function shoot(size, scale, out) {
  const dir = mkdtempSync(join(tmpdir(), 'sunrise-icon-'));
  const page = join(dir, 'i.html');
  writeFileSync(
    page,
    `<!doctype html><body style="margin:0;background:#f5f1e6">` +
      `<img src="file://${svg}" style="display:block;width:${size}px;height:${size}px;` +
      `transform:scale(${scale});transform-origin:center"></body>`,
  );
  const png = join(dir, 'i.png');
  execFileSync(CHROME, [
    '--headless',
    '--no-first-run',
    '--disable-gpu',
    `--window-size=${size},${size}`,
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--screenshot=${png}`,
    '--virtual-time-budget=800',
    `file://${page}`,
  ]);
  copyFileSync(png, join(root, 'icons', out));
  rmSync(dir, { recursive: true, force: true });
  console.log('icons/' + out);
}

if (!existsSync(CHROME)) {
  console.error('Chrome not found — set CHROME_BIN');
  process.exit(1);
}
shoot(192, 1, 'icon-192.png');
shoot(512, 1, 'icon-512.png');
shoot(512, 0.78, 'icon-maskable-512.png'); // mark inside the maskable safe zone
