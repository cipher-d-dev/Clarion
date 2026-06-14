# Clarion SaaS Platform

Production-grade institutional complaint management platform built as a PNPM + Turborepo monorepo.

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, ShadCN/UI, TanStack Query, Zustand, React Hook Form, Zod, Framer Motion
- **Backend:** Express.js, TypeScript, Prisma, JWT + Refresh Tokens, RBAC
- **Database:** PostgreSQL (Supabase-compatible)
- **AI:** `@clarion/ai` with AIProvider abstraction + Gemini stub

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 14+ (local or Supabase)

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy the example env files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Set `DATABASE_URL` in `apps/api/.env` to your PostgreSQL connection string:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/clarion?schema=public"
```

Generate secure JWT secrets (minimum 32 characters):

```
JWT_SECRET="your-super-secret-jwt-key-at-least-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-at-least-32-chars"
```

Also set `DATABASE_URL` for Prisma (same value) — create `packages/database/.env`:

```bash
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/clarion?schema=public"' > packages/database/.env
```

### 3. Database setup

```bash
pnpm db:migrate
pnpm db:seed
```

### 4. Start development

```bash
pnpm dev
```

- **Web:** http://localhost:3000
- **API:** http://localhost:4000
- **Health check:** http://localhost:4000/v1/health

## Seeded Test Credentials

All seeded users share the password: **`Password123!`**

| Role | Email |
|------|-------|
| Student | `student@unilag-demo.clarion.app` |
| Lecturer | `lecturer@unilag-demo.clarion.app` |
| Admin Staff | `staff@unilag-demo.clarion.app` |
| Dept Head | `depthead@unilag-demo.clarion.app` |
| Institution Mgmt | `mgmt@unilag-demo.clarion.app` |
| Super Admin | `superadmin@clarion.app` |

Institution slug for registration: **`unilag-demo`**

## Project Structure

```
Clarion/
├── apps/
│   ├── web/          # Next.js 15 App Router frontend
│   └── api/          # Express TypeScript API
├── packages/
│   ├── database/     # Prisma schema, migrations, seed
│   ├── shared/       # Enums, Zod schemas, RBAC, types
│   ├── ui/           # ShadCN components + design tokens
│   ├── ai/           # AIProvider interface + Gemini stub
│   └── config/       # Shared ESLint, TypeScript, Tailwind configs
├── docs/
├── .github/workflows/
├── turbo.json
└── pnpm-workspace.yaml
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed the database |
| `pnpm db:generate` | Generate Prisma client |

## API Endpoints (Phase 0)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/health` | Health check |
| POST | `/v1/auth/register` | Register new user |
| POST | `/v1/auth/login` | Login |
| POST | `/v1/auth/refresh` | Refresh access token |
| POST | `/v1/auth/logout` | Revoke refresh token |

## Environment Variables

### apps/api/.env

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API port (default: 4000) |
| `NODE_ENV` | No | Environment (default: development) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Access token secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | Refresh token secret (min 32 chars) |
| `CORS_ORIGIN` | No | Allowed CORS origin (default: http://localhost:3000) |

### apps/web/.env

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | No | API base URL (default: http://localhost:4000) |

## License

Proprietary — All rights reserved.
