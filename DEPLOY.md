# Clarion — Deployment Guide

Complete instructions for deploying Clarion from scratch to production (Vercel + Render + Supabase).

---

## Prerequisites

- GitHub repo with the Clarion monorepo
- Accounts on: [Supabase](https://supabase.com), [Render](https://render.com), [Vercel](https://vercel.com)
- Optional but recommended: [Sentry](https://sentry.io), [Resend](https://resend.com)

---

## 1. Database — Supabase

1. Create a new Supabase project (choose the EU West region to match existing config, or update `DATABASE_URL` accordingly).
2. In **Project Settings → Database**, copy:
   - **Transaction pooler** connection string (port `6543`) → used as `DATABASE_URL` in the API
   - **Session pooler** connection string (port `5432`) → used as `DIRECT_URL` for Prisma migrations
3. In **Project Settings → API**, copy the **service_role** key → `SUPABASE_SERVICE_KEY`

---

## 2. Backend — Render

### Create the Web Service

1. **New → Web Service** → connect your GitHub repo
2. **Root Directory:** leave blank (Render builds from repo root)
3. **Build Command:**
   ```
   pnpm install --frozen-lockfile && pnpm --filter @clarion/database exec prisma generate && pnpm --filter @clarion/api build
   ```
4. **Start Command:**
   ```
   node apps/api/dist/index.js
   ```
5. **Pre-Deploy Command** (runs migrations before each deploy):
   ```
   pnpm --filter @clarion/database exec prisma migrate deploy
   ```

### Environment Variables

Set these in Render → Environment:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `DATABASE_URL` | Supabase transaction pooler URL (port 6543) |
| `DIRECT_URL` | Supabase session pooler URL (port 5432) |
| `JWT_SECRET` | Random 64-char string (use `openssl rand -hex 32`) |
| `JWT_REFRESH_SECRET` | Another random 64-char string |
| `CORS_ORIGIN` | Your Vercel frontend URL, e.g. `https://clarion.vercel.app` |
| `GEMINI_API_KEY` | From Google AI Studio |
| `RESEND_API_KEY` | From Resend dashboard |
| `RESEND_FROM_EMAIL` | `Clarion <no-reply@yourdomain.com>` |
| `SENTRY_DSN` | From Sentry → Project → Settings → Client Keys (optional) |

### Seed the database (first deploy only)

After the first successful deploy, open Render's **Shell** tab and run:

```bash
pnpm --filter @clarion/database exec prisma db seed
```

This creates the demo institution and all six role users.

---

## 3. Frontend — Vercel

1. **Import** your GitHub repo on Vercel
2. **Framework Preset:** Next.js (auto-detected)
3. **Root Directory:** `apps/web`
4. **Build Command:** leave as default (`next build`)

### Environment Variables

Set these in Vercel → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Your Render service URL, e.g. `https://clarion-api.onrender.com` |
| `NEXT_PUBLIC_SENTRY_DSN` | From Sentry → Project → Settings → Client Keys (optional) |
| `SENTRY_ORG` | Your Sentry org slug (optional, enables source map uploads) |
| `SENTRY_PROJECT` | Your Sentry project slug (optional) |

---

## 4. CI — GitHub Actions

The `.github/workflows/ci.yml` runs on every PR and push to `main`/`develop`:

- Lint → Typecheck → `pnpm audit --audit-level=high` → Build

No additional setup needed beyond ensuring the repo is connected. The CI uses an ephemeral Postgres service container — no Supabase credentials required in CI.

---

## 5. Post-Deploy Checklist

- [ ] `GET https://your-api.onrender.com/v1/health` returns `{"status":"ok"}`
- [ ] Login with `student@unilag-demo.clarion.app` / `Password123!` succeeds
- [ ] Complaint submission creates a ticket
- [ ] Notifications appear in the bell dropdown
- [ ] File attachment upload works (images, PDF, DOCX up to 10 MB)
- [ ] Audit log accessible to Super Admin at `/dashboard/admin/audit`

---

## 6. Secrets — Quick Generation

```bash
# JWT secrets
openssl rand -hex 32   # JWT_SECRET
openssl rand -hex 32   # JWT_REFRESH_SECRET
```

Never commit `.env` files. Both `apps/api/.env` and `apps/web/.env` are in `.gitignore`.

---

## Seeded Test Credentials

All users share the password: **`Password123!`**

| Role | Email |
|------|-------|
| Student | `student@unilag-demo.clarion.app` |
| Lecturer | `lecturer@unilag-demo.clarion.app` |
| Admin Staff | `staff@unilag-demo.clarion.app` |
| Dept Head | `depthead@unilag-demo.clarion.app` |
| Institution Mgmt | `mgmt@unilag-demo.clarion.app` |
| Super Admin | `superadmin@clarion.app` |

Institution slug for self-registration: **`unilag-demo`**
