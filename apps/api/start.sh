#!/bin/sh
# start.sh — Located in apps/api/start.sh

echo "→ Running database migrations..."
# Run prisma through the pnpm workspace executor from the root directory
pnpm --filter=@clarion/api exec prisma migrate deploy --schema=./apps/api/prisma/schema.prisma || {
  echo "⚠️  Migration failed or already up to date — continuing to start server..."
}

echo "→ Starting Clarion API..."
# Launch from the absolute location where Turbo outputs the code
node apps/api/dist/server.js