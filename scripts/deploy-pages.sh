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
STAGE="$(mktemp -d /tmp/sunrise-deploy.XXXXXX)"
trap 'rm -rf "$STAGE"' EXIT
git archive HEAD index.html manifest.webmanifest sw.js dist data themes icons |
  tar -x -C "$STAGE"
npx wrangler pages deploy "$STAGE" --project-name "$PROJECT"
