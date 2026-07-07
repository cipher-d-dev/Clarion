#!/bin/sh
# start.sh — Isolated Package Entrypoint

echo "→ Running database migrations..."
# Use npx to dynamically catch the scoped prisma binary from the active root
npx prisma migrate deploy --schema=./prisma/schema.prisma || {
  echo "⚠️  Migration failed or already up to date — continuing to start server..."
}

echo "→ Starting Clarion API..."
# Since apps/api is the root, dist/server.js is right there
node dist/server.js