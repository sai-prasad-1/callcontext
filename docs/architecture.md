# CallContext — Scalable Architecture Specification
## Built for 5 Customers, Designed for 5,000

---

## The Core Principle: Managed Everything

As a solo dev, you cannot afford to manage infrastructure. Every hour spent on DevOps is an hour not spent building features. The architecture uses **managed services at every layer** so that scaling happens automatically, not through your effort.

The rule: **If a managed service exists for it, use it. Only run your own server when a managed service literally cannot do the job** (which is only the case for long-lived WebSocket connections).

---

## 1. FOUR-LAYER ARCHITECTURE

### Layer 1: Edge (Auto-scales, zero management)

```
Vercel          — Frontend hosting + serverless API routes
                  Auto-scales from 0 to millions of requests
                  Global CDN for static assets
                  Edge middleware for auth checks

Vonage          — Telephony provider (managed)
                  Handles all phone infrastructure
                  Auto-scales to thousands of simultaneous calls
                  You never touch a phone system

Cloudflare      — DNS + DDoS protection (free tier)
                  SSL termination
                  Basic WAF rules

Stripe          — Payment processing (managed)
                  PCI compliance handled for you
                  Subscription management, invoicing, tax
```

**Why this matters for scale**: Zero servers at the edge. Whether you have 5 users or 5,000, Vercel auto-provisions functions per request, Vonage handles telephony at any volume, and Cloudflare absorbs traffic spikes. You never think about load balancers, nginx configs, or CDN invalidation.

### Layer 2: Compute (Split: Stateless + Stateful)

This is the critical architectural decision. You have two fundamentally different workloads:

```
STATELESS (Vercel Serverless Functions):
  - All REST API routes (/api/customers, /api/calls, /api/billing, etc.)
  - Vonage webhook handlers (/api/vonage/answer, /api/vonage/event)
  - Stripe webhook handlers
  - Cron jobs (daily digest, reminder processing, automation rules)
  - Server-side rendering for dashboard pages

  Why stateless: Each request is independent. No shared memory needed.
  Auto-scales from 0 → thousands of concurrent functions.
  Cold start: ~200ms (acceptable for API routes).
  Max execution: 30 seconds on Vercel (plenty for API calls).
  Cost: Free tier covers MVP, then pay-per-invocation.

STATEFUL (Railway Persistent Server):
  - WebSocket server for Vonage audio streaming
  - WebSocket server for dashboard live updates
  - Deepgram streaming connection management
  - In-memory transcript buffer per active call
  - Real-time entity extraction coordination

  Why stateful: A phone call is a 3-5 minute continuous audio stream.
  You need a process that stays alive for the duration of the call,
  holding the Vonage WebSocket ↔ Deepgram WebSocket bridge open.
  Serverless functions timeout at 30s — they literally cannot do this.

  Railway: Persistent Node.js process, $5/mo starter.
  Scales vertically (bigger instance) up to ~100 concurrent calls.
  Beyond 100 concurrent: add horizontal scaling (see section 6).
```

**The split is clean**: Vercel handles request-response work. Railway handles streaming work. They share the database (Supabase) but never need to communicate directly.

### Layer 3: Data (Managed PostgreSQL + Object Storage)

```
Supabase PostgreSQL:
  - Primary database for ALL application data
  - Row Level Security (RLS) — multi-tenant security at the database level
  - Built-in Realtime subscriptions (Postgres LISTEN/NOTIFY)
  - Connection pooling via Supavisor (handles 1000s of connections)
  - Daily automated backups
  - Point-in-time recovery

Supabase Storage:
  - Call recordings (MP3 files, ~0.5-1MB per minute of call)
  - Encrypted at rest (AES-256)
  - Signed URLs for secure playback (time-limited access)
  - Lifecycle policies for automatic deletion (retention settings)

Supabase Realtime:
  - Powers dashboard live updates (screen pop, call status)
  - Postgres Changes: subscribe to INSERT/UPDATE on calls table
  - Broadcast: push custom events from server to connected clients
  - Handles 10,000+ concurrent connections on Pro plan
```

**Why Supabase over raw Postgres + S3**: You get auth, realtime, storage, and a REST API auto-generated from your schema — all from one service. That's 4 services you don't have to integrate, configure, or maintain. The free tier handles MVP comfortably (500MB database, 1GB storage, 50,000 monthly active users).

### Layer 4: AI (Pay-per-use APIs, zero infrastructure)

```
Deepgram:
  - Streaming transcription (Nova-3 model)
  - Pay per audio second: ~$0.0043/minute
  - WebSocket-based — connect, stream audio, get text back
  - No GPUs to provision, no models to deploy
  - Auto-scales to your volume

OpenAI:
  - GPT-4o-mini for entity extraction and call analysis
  - Pay per token: ~$0.15/1M input tokens
  - ~$0.002 per entity extraction call (30s chunk)
  - ~$0.003 per full post-call analysis
  - No infrastructure, instant scaling

Resend:
  - Transactional email delivery
  - Free tier: 3,000 emails/month (enough for MVP)
  - Then $20/mo for 50,000 emails
```

**Why this matters**: The AI layer has ZERO fixed costs. If nobody makes calls, you pay $0 for transcription and extraction. Costs scale linearly with usage, which means your margins stay healthy as you grow.

---

## 2. DATA ARCHITECTURE — MULTI-TENANCY

### The Hard Rule: Row Level Security on Every Table

Every single table has a `shop_id` column. Every single query is filtered by `shop_id`. This is enforced at the database level via RLS policies, not in your application code.

```sql
-- Applied to EVERY table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shops can only see their own customers"
ON customers FOR ALL
USING (
  shop_id IN (
    SELECT id FROM shops WHERE owner_id = auth.uid()
  )
);
```

**Why RLS instead of application-level filtering**: If you forget a WHERE clause in one API route, a customer could see another shop's data. With RLS, the database itself rejects unauthorized access — even if your code has a bug. This is non-negotiable for a multi-tenant SaaS.

### Database Connection Strategy

```
Vercel (serverless functions) → Supabase via connection pooler (port 6543)
  - Uses Supavisor transaction mode
  - Handles 1000s of short-lived connections
  - Each function opens → queries → closes

Railway (WebSocket server) → Supabase via direct connection (port 5432)
  - Single long-lived connection
  - Used for writing call transcripts, updating profiles
  - Reconnect logic on disconnect

Browser (client-side) → Supabase via PostgREST + Realtime
  - Uses anon key with RLS
  - Real-time subscriptions for live updates
  - Never touches raw SQL
```

### Indexing Strategy

```sql
-- These indexes are critical for performance at scale

-- Fast caller lookup during incoming calls (must be < 50ms)
CREATE UNIQUE INDEX idx_customers_shop_phone ON customers(shop_id, phone);

-- Dashboard call list (sorted, paginated)
CREATE INDEX idx_calls_shop_started ON calls(shop_id, started_at DESC);

-- Customer call history
CREATE INDEX idx_calls_customer ON calls(customer_id, started_at DESC);

-- Active calls (small result set, frequently queried)
CREATE INDEX idx_calls_active ON calls(shop_id, status) WHERE status = 'active';

-- Reminders due (cron job queries this daily)
CREATE INDEX idx_reminders_due ON reminders(shop_id, reminder_date, status)
  WHERE status = 'pending';

-- Customer segmentation queries
CREATE INDEX idx_customers_segment ON customers(shop_id, last_contact_date, total_orders);

-- Full-text search on customers
CREATE INDEX idx_customers_search ON customers
  USING gin(to_tsvector('english', coalesce(first_name,'') || ' ' || coalesce(last_name,'') || ' ' || coalesce(phone,'')));

-- Campaign targeting
CREATE INDEX idx_customers_tags ON customers USING gin(tags);
```

---

## 3. REAL-TIME PIPELINE ARCHITECTURE

This is the most complex subsystem. Here's exactly how data flows during a live call:

```
TIMELINE OF A 3-MINUTE CALL:

T=0.0s  Customer dials shop's Vonage number
T=0.1s  Vonage sends HTTP GET to /api/vonage/answer (Vercel)
T=0.2s  Vercel function:
          1. Looks up shop by phone number
          2. Matches caller to customer (or creates new)
          3. Inserts call record (status: 'ringing')
          4. Returns NCCO JSON to Vonage
T=0.3s  Supabase Realtime fires → Dashboard shows screen pop
T=0.5s  Vonage plays consent disclosure (if 2-party state)
T=2.0s  Vonage connects shop owner's phone (rings their cell)
T=2.0s  Vonage opens WebSocket to Railway server
T=2.1s  Railway opens WebSocket to Deepgram
T=5.0s  Shop owner answers → call is live
T=5.0s  Vonage sends call event (status: 'active') → Vercel updates DB

T=5.0-180s  DURING CALL:
  Every 20ms:
    Vonage → sends 640 bytes of PCM audio → Railway
    Railway → forwards to Deepgram WebSocket
  
  Every 0.5-2s (as Deepgram processes):
    Deepgram → sends transcript fragment → Railway
    Railway → pushes to dashboard WebSocket
    Dashboard → renders words appearing in real-time
  
  Every 30s:
    Railway → batches last 30s of final transcript
    Railway → calls OpenAI GPT-4o-mini (async, non-blocking)
    OpenAI → returns entities JSON
    Railway → pushes entities to dashboard WebSocket
    Dashboard → shows entities sliding in

T=180s  Call ends (either party hangs up)
T=180.1s  Vonage closes WebSocket → Railway
T=180.1s  Railway closes Deepgram connection
T=180.2s  Railway saves full transcript to Supabase
T=180.3s  Railway calls OpenAI for full post-call analysis
T=181.0s  OpenAI returns full analysis JSON
T=181.1s  Railway updates call record (summary, sentiment, entities)
T=181.2s  Railway updates customer profile (merge new data)
T=181.3s  Railway creates reminders for detected dates
T=181.4s  Railway creates order if order detected
T=181.5s  Railway pushes 'call_ended' event to dashboard
T=182.0s  Vonage fires recording webhook → Vercel downloads and stores MP3
```

### Memory Management on Railway

```javascript
// Each active call holds these in memory:
const activeCall = {
  callId: 'uuid',
  shopId: 'uuid',
  vonageWs: WebSocket,        // ~1KB
  deepgramWs: WebSocket,      // ~1KB
  transcriptBuffer: '',       // grows ~500 bytes/minute
  entities: [],               // ~2KB after 3 minutes
  metadata: {},               // ~500 bytes
  startedAt: Date.now()
};
// Total per call: ~5-10KB in memory

// At 100 concurrent calls: ~1MB of memory
// At 1000 concurrent calls: ~10MB of memory
// Memory is NOT the bottleneck — WebSocket connections are

// Cleanup: when call ends, delete from Map immediately
activeCalls.delete(callId);
```

### Failure Modes & Graceful Degradation

```
WHAT IF Railway server is down?
  → Vonage WebSocket connection fails silently
  → Call STILL CONNECTS to shop owner (phone leg is independent)
  → Recording STILL HAPPENS (Vonage records the conference)
  → No live transcription, but post-call batch processing can run later
  → Customer NEVER knows anything went wrong

WHAT IF Deepgram is down?
  → Railway logs the error, closes the failed connection
  → No live transcription for this call
  → Recording is saved normally
  → Post-call analysis can still run on the recording (batch API)

WHAT IF OpenAI is down?
  → Entity extraction skipped for this call
  → Transcript is still saved
  → Post-call analysis queued for retry (exponential backoff)
  → Customer profile not auto-updated, but data isn't lost

WHAT IF Supabase is down?
  → This is the worst case — call data can't be saved
  → Railway buffers transcript in memory
  → Retries database writes every 5 seconds
  → If Supabase comes back within the call duration, no data lost
  → If Supabase is down for extended period, write to local file as fallback

KEY PRINCIPLE: A phone call must NEVER fail because of our system.
The call always connects. Everything else is best-effort enhancement.
```

---

## 4. API ARCHITECTURE

### Route Organization

```
app/api/
  ├── auth/                    — Authentication (signup, callback)
  ├── vonage/                  — Telephony webhooks (answer, event, recording)
  ├── customers/               — CRM operations
  ├── calls/                   — Call management
  ├── orders/                  — Order management
  ├── reminders/               — Reminder CRUD
  ├── tasks/                   — Task CRUD
  ├── campaigns/               — Marketing campaigns
  ├── segments/                — Customer segments
  ├── analytics/               — Dashboard analytics
  ├── loyalty/                 — Loyalty program
  ├── automations/             — Automation rules
  ├── integrations/            — Third-party integrations (OAuth, sync)
  ├── billing/                 — Stripe billing
  ├── export/                  — CSV exports
  ├── webhooks/                — Outgoing webhook management
  ├── onboarding/              — Onboarding flow (provision, test)
  ├── cron/                    — Scheduled jobs (daily digest, reminders)
  └── v1/                      — Public REST API (API key auth)
```

### API Design Patterns

```typescript
// Every API route follows this pattern:

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 1. Input validation schema
const schema = z.object({
  first_name: z.string().min(1).max(100),
  phone: z.string().regex(/^\+\d{10,15}$/),
});

export async function POST(req: NextRequest) {
  try {
    // 2. Auth check
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 3. Get shop context
    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', user.id)
      .single();
    if (!shop) return NextResponse.json({ error: 'No shop found' }, { status: 404 });

    // 4. Validate input
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

    // 5. Business logic (RLS ensures shop isolation automatically)
    const { data, error } = await supabase
      .from('customers')
      .insert({ ...parsed.data, shop_id: shop.id })
      .select()
      .single();

    if (error) throw error;

    // 6. Return response
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    // 7. Error handling (Sentry captures this)
    console.error('Customer creation failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Rate Limiting

```typescript
// Simple in-memory rate limiting (upgrade to Redis if needed at scale)

const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

// Usage in API route:
// Authenticated routes: 100 requests/minute per user
// Public routes: 20 requests/minute per IP
// Vonage webhooks: no limit (they're from Vonage)
// API v1 (external): 100 requests/minute per API key
```

---

## 5. FRONTEND ARCHITECTURE

### Next.js App Router Structure

```
app/
  (auth)/                      — Public auth pages (no sidebar)
    login/page.tsx
    signup/page.tsx
    forgot-password/page.tsx

  (onboarding)/                — Onboarding wizard (no sidebar)
    layout.tsx                 — Progress bar, logo only
    step-[1-5]/page.tsx

  (dashboard)/                 — Protected dashboard (sidebar layout)
    layout.tsx                 — Sidebar + header + auth guard
    page.tsx                   — Dashboard home
    calls/
      page.tsx                 — Call list
      [id]/page.tsx            — Call detail
      live/[callId]/page.tsx   — Live call view
    customers/
      page.tsx                 — Customer list
      [id]/page.tsx            — Customer profile
    orders/page.tsx
    reminders/page.tsx
    tasks/page.tsx
    marketing/
      page.tsx
      campaigns/new/page.tsx
      campaigns/[id]/page.tsx
      segments/page.tsx
    analytics/page.tsx
    automations/page.tsx
    settings/
      page.tsx
      integrations/page.tsx
    billing/page.tsx

  (marketing)/                 — Public marketing pages
    page.tsx                   — Landing page
    pricing/page.tsx
```

### State Management Strategy

```
NO REDUX. NO ZUSTAND. Keep it simple:

Server state (data from API):
  → React Server Components for initial load
  → SWR or TanStack Query for client-side fetching + caching
  → Supabase Realtime for live updates

Client state (UI state):
  → useState for local component state
  → useContext for shared UI state (modals, toasts, sidebar)
  → URL search params for filters, pagination, tab selection

Real-time state (WebSocket):
  → Custom useWebSocket hook wrapping the Railway dashboard connection
  → Stores last N messages in a ref (no re-renders for buffered data)
  → Only triggers re-render for finalized transcript lines + entities

Why this works at scale:
  - No global state store = no state synchronization bugs
  - Server Components mean most pages render on the server (fast TTI)
  - SWR handles caching, deduplication, and revalidation automatically
  - Supabase Realtime handles the "push" case (screen pops, call status)
```

### Data Fetching Pattern

```typescript
// Server Component (most pages)
// Data fetched on the server, HTML streamed to client
export default async function CustomersPage() {
  const supabase = createClient();
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .order('last_contact_date', { ascending: false })
    .limit(20);

  return <CustomerTable initialData={customers} />;
}

// Client Component (interactive parts)
// SWR handles refetching, caching, pagination
'use client';
function CustomerTable({ initialData }) {
  const { data, isLoading, mutate } = useSWR(
    '/api/customers?page=1',
    fetcher,
    { fallbackData: initialData }
  );

  // Realtime updates (new customer created from call)
  useEffect(() => {
    const channel = supabase
      .channel('customers')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'customers' },
        () => mutate() // Refetch when new customer added
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return <Table data={data} />;
}
```

---

## 6. SCALING MILESTONES

### Stage 1: 0–50 Shops (MVP, $0-2K MRR)

```
Infrastructure:
  Vercel: Free → Hobby ($20/mo)
  Supabase: Free tier (500MB, 50K MAU)
  Railway: Starter ($5/mo, 512MB RAM)
  Total infra: ~$25/mo

Limits:
  ~10-15 concurrent calls (Railway 512MB)
  ~500 total customers across all shops
  ~50 calls/hour across all shops

What breaks first: Nothing. This handles MVP comfortably.
```

### Stage 2: 50–200 Shops ($5K-15K MRR)

```
Infrastructure:
  Vercel: Pro ($20/mo)
  Supabase: Pro ($25/mo, 8GB, 100K MAU)
  Railway: Pro ($20/mo, 2GB RAM)
  Total infra: ~$65/mo

Upgrades needed:
  - Railway → 2GB RAM (handles ~50 concurrent calls)
  - Supabase → Pro tier (connection pooling, more storage)
  - Add Sentry Pro for error tracking
  - Add PostHog for product analytics

What breaks first:
  - Database queries slow down → add missing indexes
  - Recording storage grows → implement retention policies
  - Daily digest cron takes too long → paginate by shop
```

### Stage 3: 200–1,000 Shops ($15K-70K MRR)

```
Infrastructure:
  Vercel: Pro ($20/mo)
  Supabase: Pro ($25/mo) or Team ($599/mo for dedicated resources)
  Railway: Pro with 8GB ($40/mo)
  Redis (Upstash): $10/mo (for caching + rate limiting)
  Total infra: ~$100-700/mo

Upgrades needed:
  - Add Redis caching layer:
    → Cache customer lookups during calls (avoid DB hit on every call)
    → Cache segment counts (expensive queries)
    → Rate limiting (move from in-memory to Redis)
    → Session storage for API keys

  - Database optimization:
    → Partition calls table by month (old calls rarely queried)
    → Materialized views for analytics queries
    → Read replicas if read load is high

  - Railway scaling:
    → Single process handles ~200 concurrent calls at 8GB
    → If more needed: spin up second Railway service
    → Route by shop_id hash: shops A-M → server 1, N-Z → server 2

What breaks first:
  - Analytics queries slow down (aggregating across millions of calls)
  - Recording storage gets expensive (terabytes)
  - WebSocket connection count on Railway
```

### Stage 4: 1,000–5,000 Shops ($70K-350K MRR)

```
At this point you have real revenue and can invest in infrastructure.

Infrastructure changes:
  - Railway → move to AWS ECS or Fly.io for horizontal scaling
  - Multiple WebSocket instances behind a load balancer
  - Redis cluster for pub/sub (sync between WS instances)
  - Supabase → self-hosted Postgres on AWS RDS (cost control)
  - S3 for recordings (cheaper than Supabase Storage at scale)
  - CloudFront CDN for recording playback
  - Dedicated DevOps hire or consultant

Architecture changes:
  - Extract AI pipeline to separate service (async processing queue)
  - Move background jobs to BullMQ + Redis (instead of cron)
  - Add a message queue (SQS or Redis streams) for:
    → Post-call analysis jobs
    → Email/SMS sending
    → Webhook delivery
    → Integration sync
  - Consider moving from Vercel to AWS for cost control

You don't need any of this until $70K+ MRR.
Don't pre-optimize. Build for Stage 1, upgrade when you hit limits.
```

---

## 7. SECURITY ARCHITECTURE

### Defense in Depth

```
Layer 1 — Network:
  Cloudflare WAF (DDoS, bot protection)
  HTTPS everywhere (Vercel auto-provisions SSL)
  No direct database access from internet (Supabase handles this)

Layer 2 — Authentication:
  Supabase Auth (email + password)
  JWT tokens (httpOnly cookies, not localStorage)
  Refresh token rotation
  Password hashing: bcrypt (Supabase default)

Layer 3 — Authorization:
  Row Level Security on every table
  API routes verify auth before any operation
  API keys hashed with bcrypt (never stored in plain text)
  Webhook signatures verified with HMAC-SHA256

Layer 4 — Data:
  Recordings encrypted at rest (AES-256, Supabase default)
  Signed URLs for recording access (expire in 1 hour)
  PII minimization: phone numbers are the only identifier
  No credit card data stored (Stripe handles PCI compliance)

Layer 5 — Application:
  Input validation with Zod on every API route
  Parameterized queries only (Supabase prevents SQL injection)
  React auto-escapes output (XSS prevention)
  CSRF protection via SameSite cookies
  Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options

Layer 6 — Monitoring:
  Sentry error tracking (alerts on new error types)
  Rate limiting on all API endpoints
  Audit log for sensitive operations (planned for Stage 3)
  Uptime monitoring with alerts
```

### Secrets Management

```
Environment variables (NEVER in code):
  NEXT_PUBLIC_SUPABASE_URL          — Client-safe (public)
  NEXT_PUBLIC_SUPABASE_ANON_KEY     — Client-safe (RLS protects data)
  SUPABASE_SERVICE_ROLE_KEY         — Server-only (bypasses RLS, NEVER expose)
  VONAGE_API_KEY                    — Server-only
  VONAGE_API_SECRET                 — Server-only
  VONAGE_APPLICATION_ID             — Server-only
  VONAGE_PRIVATE_KEY                — Server-only
  DEEPGRAM_API_KEY                  — Server-only (Railway only)
  OPENAI_API_KEY                    — Server-only (Railway only)
  STRIPE_SECRET_KEY                 — Server-only
  STRIPE_WEBHOOK_SECRET             — Server-only
  RESEND_API_KEY                    — Server-only
  SENTRY_DSN                       — Client-safe (only sends errors)

Where they live:
  Vercel: Project Settings → Environment Variables
  Railway: Service Settings → Variables
  Local dev: .env.local (gitignored)
```

---

## 8. MONITORING & OBSERVABILITY

### What to Track from Day 1

```
Error tracking (Sentry):
  - Every unhandled exception in Vercel functions
  - Every error in Railway WebSocket server
  - Frontend JavaScript errors
  - Alert on: new error type, error spike, unhandled rejection

Uptime (Betterstack or UptimeRobot, free tier):
  - Vercel app health endpoint: GET /api/health → 200
  - Railway server health: GET /health → 200
  - Alert: email + SMS if down for 2+ minutes

Product analytics (PostHog, free tier):
  - Page views, feature usage
  - Funnel: signup → onboard → first call → active user
  - Key events: call started, customer created, campaign sent
  - Retention: weekly active shops

Business metrics (custom dashboard, built in week 9):
  - Calls per day (all shops)
  - New shops this week
  - Active shops (had a call in last 7 days)
  - Revenue (Stripe dashboard)
  - Churn (shops that cancelled)
```

### Logging Strategy

```
Vercel (serverless functions):
  console.log → appears in Vercel function logs
  Structured JSON for important events:
    { event: 'call.started', shop_id, call_id, timestamp }
    { event: 'customer.created', shop_id, customer_id, source: 'auto' }
    { event: 'webhook.failed', provider: 'vonage', error, call_id }

Railway (WebSocket server):
  Use pino logger (structured JSON, fast)
  Log levels: error, warn, info, debug
  Production: info + above only
  Key events:
    { event: 'ws.vonage.connected', call_id, shop_id }
    { event: 'ws.deepgram.transcript', call_id, is_final: true }
    { event: 'ai.extraction.completed', call_id, entities_count: 5 }
    { event: 'ws.vonage.closed', call_id, duration_seconds: 187 }
```

---

## 9. FOLDER STRUCTURE

```
callcontext/
├── app/                       — Next.js App Router (pages + API)
│   ├── (auth)/                — Login, signup
│   ├── (dashboard)/           — Protected dashboard pages
│   ├── (marketing)/           — Public landing pages
│   ├── (onboarding)/          — Onboarding wizard
│   └── api/                   — All API routes
│
├── components/                — React components
│   ├── ui/                    — Base UI (Button, Input, Card, etc.)
│   ├── layout/                — Sidebar, Header, MobileNav
│   ├── calls/                 — Call-related components
│   ├── customers/             — Customer-related components
│   ├── reminders/             — Reminder components
│   ├── analytics/             — Chart components
│   ├── marketing/             — Campaign/segment components
│   ├── loyalty/               — Loyalty program components
│   ├── settings/              — Settings form components
│   └── billing/               — Billing/plan components
│
├── lib/                       — Shared utilities
│   ├── supabase/
│   │   ├── client.ts          — Browser Supabase client
│   │   ├── server.ts          — Server Supabase client
│   │   └── middleware.ts      — Auth middleware
│   ├── vonage/
│   │   ├── client.ts          — Vonage SDK setup
│   │   └── ncco.ts            — NCCO builder functions
│   ├── stripe/
│   │   └── client.ts          — Stripe SDK setup
│   ├── types/
│   │   └── database.ts        — Auto-generated Supabase types
│   ├── hooks/
│   │   ├── useWebSocket.ts    — Dashboard WebSocket hook
│   │   ├── useScreenPop.ts    — Screen pop notification hook
│   │   └── useAuth.ts         — Auth state hook
│   └── utils/
│       ├── formatting.ts      — Phone, date, currency formatting
│       ├── constants.ts       — State consent map, plan limits
│       └── validation.ts      — Zod schemas
│
├── server/                    — Railway WebSocket server (separate deploy)
│   ├── src/
│   │   ├── index.ts           — Express + WS server entry
│   │   ├── websocket/
│   │   │   ├── audioHandler.ts
│   │   │   └── dashboardHandler.ts
│   │   ├── transcription/
│   │   │   ├── deepgramClient.ts
│   │   │   └── transcriptBuffer.ts
│   │   ├── ai/
│   │   │   ├── realtimeExtraction.ts
│   │   │   ├── postCallAnalysis.ts
│   │   │   └── prompts.ts
│   │   └── utils/
│   │       ├── logger.ts
│   │       └── supabase.ts
│   ├── package.json
│   └── tsconfig.json
│
├── supabase/
│   └── migrations/            — SQL migration files
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_indexes.sql
│
├── public/                    — Static assets
├── tailwind.config.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── .env.local                 — Environment variables (gitignored)
```

---

## 10. DEPLOYMENT PIPELINE

```
GitHub (single repo, monorepo)
  ├── Push to main → triggers both deploys
  │
  ├── Vercel (auto-deploy)
  │   - Detects Next.js
  │   - Builds and deploys in ~60 seconds
  │   - Preview deployments on PRs
  │   - Environment variables per environment
  │
  └── Railway (auto-deploy)
      - Watches /server directory
      - Builds and deploys Node.js server
      - Zero-downtime deploys (new container starts before old stops)
      - Environment variables in Railway dashboard

Database migrations:
  - Run manually via Supabase dashboard or CLI
  - Migration files in /supabase/migrations
  - Apply in order before deploying code that uses new tables
  - Never break backward compatibility (add columns, don't rename)

Rollback:
  - Vercel: click "Redeploy" on previous deployment
  - Railway: click "Rollback" on previous deployment
  - Database: write a reverse migration (drop added columns)
  - Total rollback time: < 2 minutes
```
