import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

test('committed dist/sunrise.js matches a fresh esbuild of src/main.ts', () => {
  const root = fileURLToPath(new URL('../..', import.meta.url));
  const out = join(tmpdir(), `sunrise-dist-sync-${process.pid}-${Date.now()}.js`);
  try {
    // Same flags as `npm run build`, minus --sourcemap (the map line is stripped below).
    execSync(`npx esbuild src/main.ts --bundle --format=iife --target=es2022 --outfile=${out}`, {
      cwd: root,
      stdio: 'pipe',
    });
    const fresh = readFileSync(out, 'utf8');
    const committed = readFileSync(join(root, 'dist', 'sunrise.js'), 'utf8')
      .split('\n')
      .filter((line) => !line.startsWith('//# sourceMappingURL'))
      .join('\n');
    assert.equal(
      committed,
      fresh,
      'dist/sunrise.js is stale — run `npm run build` and commit the result',
    );
  } finally {
    rmSync(out, { force: true });
  }
});
