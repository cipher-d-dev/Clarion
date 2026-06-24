# Clarion — Implementation Plan

> This is the living implementation plan. Update status as phases complete.
> Last reviewed: June 2026

---

## Current State

Phase 0 is **complete**. The monorepo scaffold, database schema, auth module, shared packages, AI abstraction, and basic frontend shell are all in place and working.

### What exists

| Area | Status | Notes |
|------|--------|-------|
| Monorepo (PNPM + Turborepo) | ✅ Done | Root config, workspace packages |
| `packages/config` | ✅ Done | ESLint, TS, Tailwind presets |
| `packages/shared` | ✅ Done | Enums, RBAC, Zod schemas, types, constants |
| `packages/database` | ✅ Done | Full Prisma schema, migration, seed |
| `packages/ai` | ✅ Done | AIProvider interface + Gemini provider stub |
| `packages/ui` | ✅ Done | Button, Input, Card, Label, Form components |
| `apps/api` auth module | ✅ Done | Register, login, refresh, logout — clean architecture |
| `apps/api` middleware | ✅ Done | Auth, RBAC, tenant, rate-limit, error-handler |
| `apps/web` auth pages | ✅ Done | Login + register forms wired to API |
| `apps/web` dashboard shell | ⚠️ Stub | Role-based routing exists; all dashboard pages are empty |
| CI workflow | ✅ Done | `.github/workflows/ci.yml` |

### Known schema issues to fix before Phase 1

1. `Complaint` is missing `referenceNumber` (human-readable `CLN-YYYY-NNNNN`) — needed for staff workflows
2. `Ticket` reuses `ComplaintStatus` for its own status — needs a dedicated `TicketStatus` enum
3. Missing `ASSIGNED` and `AWAITING_INFORMATION` complaint statuses (dropped from original spec)
4. `Complaint` is missing `sentimentScore`, `aiMetadata`, and `satisfactionRating` fields
5. `Ticket` is missing `slaDeadline`, `slaBreached`, `escalatedLevel` fields
6. `KnowledgeArticle` has no vector embedding column (needed for Phase 2 RAG)

These will be fixed as the **Phase 0 Cleanup** step at the start of Phase 1 via a Prisma migration.

---

## Phases Overview

| Phase | Name | Status |
|-------|------|--------|
| 0 | Foundation | ✅ Complete |
| 1 | Core Complaint Loop | ✅ Complete |
| 2 | AI Layer | ⏳ In Progress |
| 3 | Notifications & Real-time | 🔲 Planned |
| 4 | Analytics & Dashboards | 🔲 Planned |
| 5 | Enterprise Hardening | 🔲 Planned |

---

## Phase 1 — Core Complaint Loop

**Goal:** End-to-end complaint submission → auto ticket → staff assignment → status updates → student tracking. No AI yet. No file uploads yet.

### 1.0 — Schema fixes (migration)

- Add `referenceNumber String` to `Complaint` (unique per institution, auto-generated)
- Add `TicketStatus` enum: `OPEN | ASSIGNED | IN_PROGRESS | PENDING_INFO | RESOLVED | CLOSED`
- Replace `Ticket.status ComplaintStatus` → `Ticket.status TicketStatus`
- Add `ComplaintStatus.ASSIGNED` and `AWAITING_INFORMATION` values
- Add `sentimentScore Float?`, `aiMetadata Json?`, `satisfactionRating Int?` to `Complaint`
- Add `slaDeadline DateTime?`, `slaBreached Boolean @default(false)`, `escalatedLevel Int @default(0)` to `Ticket`
- Add `referenceNumber String` to `Ticket` (human-readable `TKT-YYYY-NNNNN`)

### 1.1 — Backend: complaints module

**File structure:**
```
apps/api/src/modules/complaints/
├── complaints.controller.ts
├── complaints.service.ts
├── complaints.repository.ts
├── complaints.routes.ts
├── complaints.validators.ts
├── complaints.types.ts
└── dto/
    ├── create-complaint.dto.ts
    └── update-status.dto.ts
```

**Endpoints:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/complaints` | Any authenticated | Submit complaint, triggers ticket auto-creation |
| GET | `/v1/complaints` | Scoped | Student sees own; staff sees dept/all |
| GET | `/v1/complaints/:id` | Owner or staff | Full complaint detail with timeline |
| PATCH | `/v1/complaints/:id/status` | Staff+ | Status transition with validation |
| GET | `/v1/complaints/:id/timeline` | Scoped | Ordered timeline events |
| POST | `/v1/complaints/:id/notes` | Staff only | Internal note (not visible to submitter) |
| POST | `/v1/complaints/:id/rate` | Owner only | Satisfaction rating (1–5), only when RESOLVED |

**Business rules:**
- On `POST /complaints`: auto-generate `referenceNumber`, create linked `Ticket`, log `COMPLAINT_SUBMITTED` timeline event, log `AuditLog`
- Status transitions enforced by a state machine (not arbitrary PATCH): e.g., `DRAFT → SUBMITTED → UNDER_REVIEW → ASSIGNED → IN_PROGRESS → RESOLVED/REJECTED/CLOSED`
- Staff can only manage complaints within their `institutionId`
- Dept Head scope limited to their `departmentId`
- `isAnonymous = true` hides submitter identity from all roles except Super Admin

### 1.2 — Backend: tickets module

**File structure:**
```
apps/api/src/modules/tickets/
├── tickets.controller.ts
├── tickets.service.ts
├── tickets.repository.ts
├── tickets.routes.ts
├── tickets.validators.ts
└── dto/
    ├── assign-ticket.dto.ts
    └── escalate-ticket.dto.ts
```

**Endpoints:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/tickets` | Staff+ | Filtered ticket queue |
| GET | `/v1/tickets/:id` | Staff+ | Ticket detail with assignments |
| POST | `/v1/tickets/:id/assign` | Admin Staff+ | Assign to user |
| PATCH | `/v1/tickets/:id/status` | Admin Staff+ | Update ticket status |
| POST | `/v1/tickets/:id/escalate` | Dept Head+ | Escalate with reason |
| GET | `/v1/tickets/:id/notes` | Staff+ | Internal notes on ticket |

### 1.3 — Backend: users module (minimal)

Needed to support staff lookups for assignment.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/users` | Admin Staff+ | List users in institution (for assignment dropdown) |
| GET | `/v1/users/me` | Any | Current user profile |
| PATCH | `/v1/users/me` | Any | Update own profile |

### 1.4 — Frontend: student dashboard

Route: `/dashboard/student`

**Pages to build:**
- `/dashboard/student` — overview: active complaints, recent activity
- `/dashboard/student/complaints` — list of own complaints with status badges
- `/dashboard/student/complaints/new` — complaint submission form
- `/dashboard/student/complaints/[id]` — complaint detail + timeline view + rating

**Components:**
- `ComplaintStatusBadge` — color-coded status pill
- `ComplaintTimeline` — vertical timeline with event icons and timestamps
- `ComplaintCard` — list item with ref number, status, department, date
- `SubmitComplaintForm` — React Hook Form + Zod; title, description, category, department, anonymous toggle
- `RatingWidget` — 1–5 star satisfaction rating (shown when status = RESOLVED)

### 1.5 — Frontend: staff dashboard

Route: `/dashboard/staff`

**Pages to build:**
- `/dashboard/staff` — overview: queue counts by priority, recent assignments
- `/dashboard/staff/tickets` — ticket queue (filterable by priority, status, department)
- `/dashboard/staff/tickets/[id]` — ticket detail: complaint info, assignment, status control, internal notes
- `/dashboard/staff/complaints/[id]` — complaint view with staff controls

**Components:**
- `TicketQueue` — sortable/filterable table of tickets
- `TicketPriorityBadge`
- `AssignTicketModal` — user search dropdown + confirm
- `StatusTransitionControl` — dropdown of valid next statuses with confirmation
- `InternalNoteEditor` — textarea, staff-only, not visible to students

### 1.6 — Frontend: department head dashboard

Route: `/dashboard/dept-head`

**Pages to build:**
- `/dashboard/dept-head` — department overview: open/resolved counts, SLA status
- `/dashboard/dept-head/tickets` — full departmental ticket view with escalation controls
- `/dashboard/dept-head/complaints` — all complaints in department

### 1.7 — Shared UI components needed

These live in `packages/ui` or `apps/web/src/components/`:
- `DataTable` — reusable TanStack Table wrapper with sorting, filtering, pagination
- `PageHeader` — title + breadcrumb + action slot
- `StatCard` — metric card with label, value, trend indicator
- `EmptyState` — empty list illustration + CTA
- `ConfirmDialog` — generic confirmation modal
- `Spinner` / `LoadingOverlay`
- `DashboardLayout` sidebar — role-aware nav links, user avatar, institution name

### Phase 1 verification checklist

- [ ] `POST /v1/complaints` creates complaint + ticket + timeline event
- [ ] `GET /v1/complaints` returns only institution-scoped results, filtered by role
- [ ] Status transition rejects invalid state changes
- [ ] Anonymous complaint hides submitter from staff views
- [ ] Student can rate a resolved complaint exactly once
- [ ] Staff assignment creates `TicketAssignment` record and timeline event
- [ ] Dept Head can only see their department's tickets
- [ ] Student dashboard shows own complaints with live status
- [ ] Staff queue filters by priority and status
- [ ] `pnpm build` passes

---

## Phase 2 — AI Layer

**Goal:** AI classification on submit, knowledge base management, AI chat assistant with RAG.

### 2.1 — Activate `packages/ai` Gemini provider

Replace stubs with real Gemini API calls:
- `classify(text)` — structured JSON output for category, priority, severity, sentiment, suggested department
- `embed(text)` — used for KB article embeddings
- `chat(messages, context)` — RAG-powered responses

Add Zod validation on all AI outputs — never trust raw LLM JSON.

### 2.2 — Classification on complaint submit

- Call `aiProvider.classify(complaint.description)` in `ComplaintService.create()`
- Store result in `complaint.aiMetadata`
- Use `suggestedPriority` + `suggestedSeverity` to set ticket defaults
- If classification fails: log warning, set `category = 'UNCLASSIFIED'`, continue (never block submission)

### 2.3 — Backend: knowledge-base module

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/knowledge` | Authenticated | List published articles |
| GET | `/v1/knowledge/search?q=` | Authenticated | Semantic search via embeddings |
| GET | `/v1/knowledge/:slug` | Authenticated | Article detail |
| POST | `/v1/knowledge` | KB manage | Create article |
| PATCH | `/v1/knowledge/:id` | KB manage | Update article |
| DELETE | `/v1/knowledge/:id` | KB manage | Soft delete |
| POST | `/v1/knowledge/:id/publish` | KB manage | Publish / unpublish |

On create/update: async re-embed article content via `aiProvider.embed()`, store in `KnowledgeArticle.embedding` (pgvector).

Add the pgvector extension and `embedding vector(768)` column to `KnowledgeArticle` via migration.

### 2.4 — Backend: chatbot module

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/chat` | Authenticated | Send message, get response |
| GET | `/v1/chat/history` | Authenticated | Recent conversation |

Flow:
1. Embed user message
2. Vector similarity search on `KnowledgeArticle` (top 5 chunks)
3. Build system prompt: institution context + KB chunks + complaint context (if complaint ID provided)
4. Call `aiProvider.chat(messages, context)`
5. Return response (non-streaming for Phase 2; streaming SSE in Phase 3)

### 2.5 — Frontend: AI chat widget

- Floating chat button available on all authenticated pages
- Opens a slide-over panel
- Conversation history displayed
- Context-aware: if user is on a complaint detail page, complaint is injected as context

### 2.6 — Frontend: AI classification feedback

- On complaint detail (student view): show AI-assigned category badge
- On ticket detail (staff view): show AI classification summary card with category, priority, sentiment score
- Staff can override AI suggestions manually

### Phase 2 verification checklist

- [ ] Classification runs automatically on complaint submit
- [ ] Failed classification does not block submission
- [ ] Knowledge articles get embedded on publish
- [ ] Semantic search returns relevant results
- [ ] Chat assistant draws from KB content
- [ ] Chat responses are institution-aware

---

## Phase 3 — Notifications & Real-time

**Goal:** Users are notified of complaint activity via in-app and email. Dashboard uapdates in real-time.

### 3.1 — Backend: notifications module

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/notifications` | Authenticated | Paginated list |
| PATCH | `/v1/notifications/:id/read` | Owner | Mark as read |
| PATCH | `/v1/notifications/read-all` | Owner | Mark all read |
| GET | `/v1/notifications/stream` | Authenticated | SSE stream |

**Notification triggers** (called from within complaint/ticket services):
- Complaint submitted → notify submitter (confirmation)
- Ticket assigned → notify assignee
- Status changed → notify submitter
- Escalated → notify Dept Head
- Resolved → notify submitter
- Internal note added → notify ticket assignee

### 3.2 — SSE real-time stream

- `GET /v1/notifications/stream` returns an `EventSource`-compatible SSE endpoint
- Connection identified by JWT
- Events pushed when `NotificationService.send()` is called
- Heartbeat every 30s to keep connection alive
- Client reconnects automatically on drop

### 3.3 — Email notifications (BullMQ + Resend)

- Add `EmailQueue` using BullMQ with Upstash Redis
- Jobs dispatched by `NotificationService` for high-value events: assignment, resolution, escalation
- Email templates: HTML using `react-email` or plain template stringsimplemen
- Resend SDK for delivery
- Worker runs as a separate Render service (or same process in development)

### 3.4 — Frontend: notification center

- Bell icon in dashboard header with unread count badge
- Dropdown panel showing recent notifications (last 20)
- "Mark all read" button
- Click notification → navigate to relevant complaint/ticket
- SSE connection auto-established on dashboard load

### Phase 3 verification checklist

- [ ] Submitting a complaint creates an in-app notification
- [ ] SSE stream delivers notification within 2 seconds of trigger
- [ ] Email is dispatched (queued) on ticket assignment
- [ ] Unread count updates without page refresh
- [ ] Read state persists across sessions

---

## Phase 4 — Analytics & Dashboards

**Goal:** Role-specific dashboards with real data. Institutional analytics. SLA monitoring. AI trend insights.

### 4.1 — Backend: analytics module

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/analytics/overview` | Role-scoped | Counts, resolution rate, avg response time |
| GET | `/v1/analytics/complaints` | Admin Staff+ | Breakdown by status, category, department |
| GET | `/v1/analytics/departments` | Dept Head+ | Per-department performance |
| GET | `/v1/analytics/sla` | Admin Staff+ | SLA compliance, breach counts |
| GET | `/v1/analytics/trends` | Inst Mgmt+ | Time-series complaint volume |
| GET | `/v1/analytics/ai-insights` | Dept Head+ | AI-generated trend analysis |

All analytics queries are **institution-scoped**, filtered by role, and support `?from=&to=` date range params.

Heavy queries use raw Prisma `$queryRaw` with proper parameterization and cached in Upstash Redis (5-minute TTL for dashboards, 1-hour for trend reports).

### 4.2 — SLA enforcement

- `Ticket.slaDeadline` calculated at ticket creation: `createdAt + Department.slaHours`
- BullMQ `sla-check` job runs every 15 minutes
- Marks `slaBreached = true` and creates a `TimelineEvent` when deadline passes
- Auto-escalates (`escalatedLevel += 1`) after breach if configured in institution settings

### 4.3 — Frontend: complete all dashboard pages

**Student dashboard** (Phase 1 foundation + Phase 4 additions):
- Complaint statistics (submitted, in progress, resolved)
- Activity feed
- Quick submit shortcut

**Staff dashboard:**
- Ticket queue with SLA countdown timers
- Workload overview
- Recent activity

**Department Head dashboard:**
- Department KPIs: avg resolution time, open count, SLA compliance %
- Staff workload distribution chart
- Escalation overview

**Institution Management dashboard:**
- Institution-wide overview cards
- Complaint volume trend chart (time-series)
- Department performance comparison table
- Top complaint categories chart

**Super Admin dashboard:**
- Cross-institution overview (if multiple institutions exist)
- System health
- Audit log access

### 4.4 — Chart library

Use **Recharts** (already compatible with React 19, no conflict with existing stack) for:
- Area chart: complaint volume over time
- Bar chart: complaints by department
- Donut chart: status distribution
- Line chart: resolution time trend

### Phase 4 verification checklist

- [ ] Analytics queries return institution-scoped data only
- [ ] SLA deadline is set correctly on ticket creation
- [ ] SLA breach flag is set by the background job
- [ ] Each dashboard shows live data, not placeholder text
- [ ] Charts render with real data
- [ ] Date range filtering works on trend queries

---

## Phase 5 — Enterprise Hardening

**Goal:** Production-readiness. Audit trail UI. Super admin panel. Multi-institution. Observability.

### 5.1 — Audit log UI

- Super Admin + Inst Mgmt can search audit logs
- Filter by actor, action, entity type, date range
- Paginated, read-only

### 5.2 — Super Admin panel

- Create/manage institutions
- Manage users across institutions
- Configure AI settings per institution
- View system-wide metrics
- Trigger manual seed/setup for new institutions

### 5.3 — Institution onboarding flow

- Self-service: institution admin registers, requests activation
- Or: Super Admin creates institution + seeds initial admin user
- Institution settings page: name, logo, SLA defaults, department config, AI toggle

### 5.4 — File attachments (Supabase Storage)

- `POST /v1/complaints/:id/attachments` — multipart upload
- Validate MIME type (images, PDF, DOCX only) and size (max 10MB)
- Store at `{institutionId}/complaints/{complaintId}/{filename}`
- Return signed URL with expiry for access
- Display attachments on complaint detail page

### 5.5 — Observability

- **Sentry**: `@sentry/node` in API, `@sentry/nextjs` in web — error capture, performance traces
- **PostHog**: feature event tracking in web (complaint submitted, ticket viewed, AI chat used)
- **Structured logging**: `pino` in API with correlation IDs per request

### 5.6 — Security hardening

- CSRF: double-submit cookie on all POST/PATCH/DELETE routes
- CSP headers on Next.js via `next.config.mjs`
- Rate limit tuning: stricter on `/auth/*`, looser on `/notifications/stream`
- Prisma: enable query logging in development only
- Dependency audit: `pnpm audit` in CI, block on critical

### 5.7 — Performance

- Redis caching for analytics (TTL 5m), institution settings (TTL 1h), KB search results (TTL 10m)
- Next.js ISR for public knowledge base pages
- Prisma `include` audit — no N+1 queries
- Database: add `EXPLAIN ANALYZE` review for top 10 query patterns

### Phase 5 verification checklist

- [ ] File upload stores to Supabase Storage, attachment visible in complaint detail
- [ ] Sentry captures API errors in staging
- [ ] PostHog records key user actions
- [ ] Super Admin can create a second institution end-to-end
- [ ] `pnpm audit` passes with no critical vulnerabilities
- [ ] `pnpm build` + `pnpm typecheck` + `pnpm lint` all pass cleanly

---

## Architecture Decisions (Stable)

These are locked in and should not be revisited unless there is a strong technical reason.

| Decision | Choice | Reason |
|----------|--------|--------|
| Multi-tenancy | Shared schema + `institutionId` | Cost-effective, scales to thousands of tenants |
| API style | REST v1 | Mandated; simpler for future mobile client |
| Real-time | SSE (not WebSockets) | Simpler to operate on Render; sufficient for notifications |
| Vector search | pgvector on Supabase | Same DB, no extra Pinecone cost, sufficient for KB scale |
| Background jobs | BullMQ + Upstash Redis | Mandated; handles email + SLA jobs |
| File storage | Supabase Storage | Mandated; RLS policies per institution |
| ID format | cuid() for DB PKs | Already in place; human-readable refs for complaint/ticket |
| Caching | Upstash Redis | Mandated; serverless Redis, no persistent connection needed |
| Email | Resend | Mandated |
| Monitoring | Sentry + PostHog | Mandated |

---

## What We Are Not Building (Scope Boundaries)

- No mobile app (web-first; mobile-responsive only)
- No WebSocket server (SSE is sufficient)
- No GraphQL layer
- No multi-language / i18n (English only for now)
- No payment/billing integration
- No SMS notifications
- No video/audio evidence uploads (images, PDF, DOCX only)
- No public complaint portal (authenticated users only)

---

## Development Conventions

### Branch strategy
- `main` — production-ready only
- `dev` — integration branch
- `feat/phase-N-description` — feature branches

### Commit convention
```
feat(complaints): add auto-ticket creation on submit
fix(auth): handle expired refresh token edge case
chore(db): add referenceNumber migration
```

### Adding a new API module
1. Create folder under `apps/api/src/modules/{name}/`
2. Implement: `controller`, `service`, `repository`, `routes`, `validators`, `dto/`, `types`
3. Register router in `apps/api/src/app.ts`
4. Add container entry in `apps/api/src/container.ts`
5. Write at least a smoke-test for the happy path
what
### Adding a new dashboard page
1. Create route under `apps/web/src/app/dashboard/{role}/{page}/page.tsx`
2. Wrap in `Suspense` with `LoadingOverlay` fallback
3. Data fetching via TanStack Query hooks in `apps/web/src/hooks/`
4. No direct `fetch` calls in page components — always through `api-client.ts`

---

## Next Action

**Start Phase 2** — activate Gemini API in `packages/ai`, complaint classification on submit, knowledge base CRUD + embeddings, AI chat assistant with RAG.

### Phase 1 — what was completed to close it out

- Added `GET /v1/tickets/:id/notes` endpoint (service, controller, route)
- Created `/dashboard/staff/complaints/[id]` — complaint detail with status transitions, internal notes, timeline
- Created `/dashboard/dept-head/complaints` — department complaints table with status filter and pagination
