#!/bin/sh
# start.sh — (Inside apps/api)

echo "→ Running database migrations..."
# Since apps/api is the root directory, prisma is right inside the local node_modules binary folder
./node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma || {
  echo "⚠️  Migration failed or already up to date — continuing to start server..."
}

echo "→ Starting Clarion API..."
# Since apps/api is the root, dist/server.js is relative to where you are standing
node dist/server.js