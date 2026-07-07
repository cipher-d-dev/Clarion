#!/bin/sh
# build.sh — Render build script (run from repo root)
# Installs deps and builds @clarion/api plus all its workspace dependencies
# (@clarion/shared, @clarion/database, @clarion/ai) via Turbo's dependency graph.

set -e

echo "→ Installing dependencies..."
NODE_ENV=development pnpm install --frozen-lockfile

echo "→ Building workspace packages and API..."
pnpm turbo run build --filter=@clarion/api...

echo "✓ Build complete"
