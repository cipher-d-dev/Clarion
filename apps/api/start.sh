#!/bin/sh
# start.sh — (Located inside apps/api, but executed from Monorepo Root)

echo "→ Running database migrations..."
# Execute prisma through pnpm so it references the local monorepo binaries
pnpm --filter=@clarion/api exec prisma migrate deploy --schema=./apps/api/prisma/schema.prisma || {
  echo "⚠️  Migration failed or already up to date — continuing to start server..."
}

echo "→ Starting Clarion API..."
# Point explicitly to the subfolder where Turbo builds the app
node apps/api/dist/server.js