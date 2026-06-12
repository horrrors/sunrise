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

# Full local CI gate before spending a deploy: typecheck, lint, format, all
# tests (incl. the dist/sw staleness guards, i.e. the "is the committed build
# fresh" check — building here would be pointless since we ship HEAD).
echo "running local CI gate (npm run ci)…" >&2
if ! LOG="$(npm run ci 2>&1)"; then
  printf '%s\n' "$LOG" | tail -30 >&2
  echo "CI gate failed — nothing deployed. Reproduce with: npm run ci" >&2
  exit 1
fi
echo "CI green — deploying HEAD" >&2

STAGE="$(mktemp -d /tmp/sunrise-deploy.XXXXXX)"
trap 'rm -rf "$STAGE"' EXIT
git archive HEAD index.html manifest.webmanifest sw.js dist data themes icons |
  tar -x -C "$STAGE"
npx wrangler pages deploy "$STAGE" --project-name "$PROJECT"
