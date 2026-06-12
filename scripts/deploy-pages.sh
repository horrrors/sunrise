#!/usr/bin/env bash
# Deploy the app shell to Cloudflare Pages by direct upload (no GitHub needed).
#
# One-time setup:  npx wrangler login        (opens the browser; free account)
# Deploy:          npm run deploy            -> project "sunrise"
#                  npm run deploy -- myname  -> custom project name, if
#                                               sunrise.pages.dev is taken
#
# Stages only the app files from the COMMITTED tree (git archive), so local
# edits, node_modules and docs/src never get uploaded.
set -euo pipefail
PROJECT="${1:-sunrise}"

# Deploy ships HEAD, not the working tree — flag anything that would surprise.
if [ -n "$(git status --porcelain)" ]; then
  echo "note: uncommitted changes will NOT be deployed (deploy ships HEAD)" >&2
fi
# Refuse to ship a commit whose build artifacts (dist/sunrise.js, sw.js) are
# stale relative to their sources.
if ! node --test test/build/dist-sync.test.ts test/pwa/pwa-shell.test.ts >/dev/null 2>&1; then
  echo "stale build artifacts or broken PWA shell — run: npm run build, commit, retry" >&2
  exit 1
fi

STAGE="$(mktemp -d /tmp/sunrise-deploy.XXXXXX)"
trap 'rm -rf "$STAGE"' EXIT
git archive HEAD index.html manifest.webmanifest sw.js dist data themes icons |
  tar -x -C "$STAGE"
npx wrangler pages deploy "$STAGE" --project-name "$PROJECT"
