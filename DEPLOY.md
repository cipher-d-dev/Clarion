 Deploying to Vercel + Render

  Backend → Render

  1. Create a new Web Service on Render, point it at your GitHub repo
  2. Set Root Directory to apps/api
  3. Set Build Command: pnpm install && pnpm --filter @clarion/database db:generate && pnpm --filter @clarion/api build
  4. Set Start Command: node dist/index.js
  5. Add all environment variables from apps/api/.env.example in Render's dashboard (with real production values)
  6. Add a Pre-Deploy Command for migrations: pnpm --filter @clarion/database exec prisma migrate deploy

  Frontend → Vercel

  1. Import your GitHub repo on Vercel
  2. Set Root Directory to apps/web
  3. Vercel auto-detects Next.js — no build command change needed
  4. Add one environment variable: NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com

  That's it. The frontend calls the API via that env var, so they stay fully decoupled.

  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  One thing to note: because this is a monorepo, both Vercel and Render need to be told to install from the root pnpm-lock.yaml, not
  just the app subfolder. Vercel handles this automatically when you set the root directory. For Render, make sure the build command
  starts with pnpm install run from the repo root (Render does this by default when it detects a monorepo).
