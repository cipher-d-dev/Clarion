#!/bin/sh
# start.sh — Located in apps/api/start.sh
# Render runs this from the repo root, so all paths are relative to the root.

echo "→ Running database migrations..."
pnpm --filter=@clarion/database exec prisma migrate deploy || {
  echo "⚠️  Migration failed or already up to date — continuing to start server..."
}

echo "→ Starting Clarion API..."
node apps/api/dist/index.js
