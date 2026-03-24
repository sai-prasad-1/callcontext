# CallContext — Complete 22-Week Engineering Plan
## Every Page, Every Endpoint, Every Table, Every Test

---

## Ground Rules

- **Hours**: ~20 hrs weekday + ~10 hrs weekend = **30 hrs/week**
- **Total budget**: 660 hrs (with ~10% buffer eaten by debugging/life = 600 usable)
- **Tech stack**: Next.js 16 App Router, TypeScript, Tailwind CSS v4, Supabase, Vonage, Deepgram, OpenAI, Stripe, Resend, Vercel + Railway
- **Principle**: Build vertical slices. Every week ends with something testable end-to-end.
- **Claude leverage**: Use Claude for all boilerplate, debugging, code review. You focus on architecture decisions, integration wiring, and testing.

---

## Hour Budget by Month

| Month | Weeks | Hours | What ships |
|-------|-------|-------|------------|
| Month 1 | Week 1–4 | 120 hrs | Call engine working end-to-end |
| Month 2 | Week 5–9 | 150 hrs | Real-time transcription + CRM profiles |
| Month 3 | Week 10–13 | 120 hrs | Reminders + marketing + analytics dashboard |
| Month 4 | Week 14–18 | 150 hrs | Loyalty + integrations + onboarding + billing |
| Month 5 | Week 19–22 | 120 hrs | Beta → iterate → paying customers |

---

# ═══════════════════════════════════════════
# MONTH 1: THE CALL ENGINE
# "Make a call, record it, see the caller"
# ═══════════════════════════════════════════

---

## WEEK 1: Project Foundation + Auth + Database (30 hrs)

### Database — Supabase SQL Migrations

Create ALL tables upfront. Empty tables cost nothing, but retrofitting schema later costs days.

```
Tables to create:

shops
  - id (uuid, PK)
  - owner_id (uuid, FK → auth.users)
  - name (text, NOT NULL)
  - address (text)
  - city (text)
  - state (varchar(2))
  - zip (varchar(10))
  - timezone (text, default 'America/New_York')
  - vonage_number (varchar(15))
  - forwarding_to (varchar(15))
  - consent_mode (enum: 'auto', 'silent', 'always_disclose')
  - custom_greeting (text)
  - business_hours (jsonb)
  - settings (jsonb, default '{}')
  - subscription_plan (enum: 'trial', 'starter', 'pro', 'growth')
  - stripe_customer_id (text)
  - stripe_subscription_id (text)
  - trial_ends_at (timestamptz)
  - created_at (timestamptz)
  - updated_at (timestamptz)

customers
  - id (uuid, PK)
  - shop_id (uuid, FK → shops, NOT NULL)
  - phone (varchar(15), NOT NULL)
  - email (text)
  - first_name (text)
  - last_name (text)
  - address (text)
  - city (text)
  - state (varchar(2))
  - zip (varchar(10))
  - preferences (jsonb, default '{}')
    → { flowers: [], colors: [], allergies: [], style: '' }
  - tags (text[], default '{}')
  - loyalty_tier (enum: 'bronze', 'silver', 'gold', 'platinum', default 'bronze')
  - loyalty_points (integer, default 0)
  - lifetime_value (decimal, default 0)
  - total_orders (integer, default 0)
  - communication_preference (enum: 'phone', 'sms', 'email', default 'phone')
  - first_contact_date (timestamptz)
  - last_contact_date (timestamptz)
  - created_at (timestamptz)
  - updated_at (timestamptz)
  - UNIQUE(shop_id, phone)

calls
  - id (uuid, PK)
  - shop_id (uuid, FK → shops, NOT NULL)
  - customer_id (uuid, FK → customers, nullable)
  - vonage_call_id (text)
  - direction (enum: 'inbound', 'outbound')
  - status (enum: 'ringing', 'active', 'completed', 'missed', 'voicemail')
  - started_at (timestamptz)
  - ended_at (timestamptz)
  - duration_seconds (integer)
  - recording_url (text)
  - recording_storage_path (text)
  - transcript (text)
  - ai_summary (text)
  - sentiment (enum: 'positive', 'neutral', 'negative')
  - entities_extracted (jsonb)
    → { products: [], occasion: '', delivery_date: '', address: '', preferences: [] }
  - follow_up_needed (boolean, default false)
  - tags (text[], default '{}')
  - created_at (timestamptz)

orders
  - id (uuid, PK)
  - shop_id (uuid, FK → shops)
  - customer_id (uuid, FK → customers)
  - call_id (uuid, FK → calls, nullable)
  - products (jsonb)
    → [{ name: '', quantity: 1, price: null }]
  - delivery_date (date)
  - delivery_address (text)
  - occasion (text)
  - special_instructions (text)
  - budget_mentioned (decimal)
  - total_amount (decimal)
  - status (enum: 'pending', 'confirmed', 'delivered', 'cancelled')
  - created_at (timestamptz)
  - updated_at (timestamptz)

reminders
  - id (uuid, PK)
  - shop_id (uuid, FK → shops)
  - customer_id (uuid, FK → customers)
  - title (text, NOT NULL)
  - description (text)
  - reminder_date (date, NOT NULL)
  - advance_days (integer, default 7)
  - recurring (boolean, default false)
  - recurrence_pattern (enum: 'yearly', 'monthly', 'weekly', nullable)
  - status (enum: 'pending', 'sent', 'dismissed', 'snoozed')
  - snoozed_until (date, nullable)
  - source (enum: 'auto_detected', 'manual')
  - call_id (uuid, FK → calls, nullable)
  - created_at (timestamptz)

notes
  - id (uuid, PK)
  - shop_id (uuid, FK → shops)
  - customer_id (uuid, FK → customers)
  - call_id (uuid, FK → calls, nullable)
  - content (text, NOT NULL)
  - pinned (boolean, default false)
  - created_by (uuid, FK → auth.users)
  - created_at (timestamptz)

tasks
  - id (uuid, PK)
  - shop_id (uuid, FK → shops)
  - customer_id (uuid, FK → customers, nullable)
  - title (text, NOT NULL)
  - description (text)
  - due_date (date)
  - status (enum: 'open', 'in_progress', 'done')
  - priority (enum: 'low', 'medium', 'high')
  - assigned_to (uuid, FK → auth.users, nullable)
  - created_at (timestamptz)
  - updated_at (timestamptz)

loyalty_transactions
  - id (uuid, PK)
  - shop_id (uuid, FK → shops)
  - customer_id (uuid, FK → customers)
  - type (enum: 'earn', 'redeem', 'adjust', 'expire')
  - points (integer, NOT NULL)
  - description (text)
  - order_id (uuid, FK → orders, nullable)
  - created_at (timestamptz)

campaigns
  - id (uuid, PK)
  - shop_id (uuid, FK → shops)
  - name (text, NOT NULL)
  - type (enum: 'sms', 'email')
  - segment_filter (jsonb)
    → { tags: [], min_orders: null, last_order_before: null, loyalty_tier: null }
  - subject (text, nullable — email only)
  - content (text)
  - template_id (text, nullable)
  - scheduled_at (timestamptz, nullable)
  - sent_at (timestamptz, nullable)
  - stats (jsonb, default '{}')
    → { total: 0, delivered: 0, opened: 0, clicked: 0, opted_out: 0 }
  - status (enum: 'draft', 'scheduled', 'sending', 'sent', 'cancelled')
  - created_at (timestamptz)

integrations
  - id (uuid, PK)
  - shop_id (uuid, FK → shops)
  - provider (text, NOT NULL)
    → 'square', 'google_calendar', 'mailchimp', 'quickbooks', 'zapier', etc.
  - credentials_encrypted (text)
  - config (jsonb, default '{}')
  - last_synced_at (timestamptz)
  - status (enum: 'active', 'error', 'disconnected')
  - created_at (timestamptz)

webhook_endpoints
  - id (uuid, PK)
  - shop_id (uuid, FK → shops)
  - url (text, NOT NULL)
  - events (text[], NOT NULL)
    → ['call.completed', 'customer.created', 'reminder.due', 'order.created']
  - secret (text, NOT NULL)
  - active (boolean, default true)
  - last_triggered_at (timestamptz)
  - created_at (timestamptz)

webhook_deliveries
  - id (uuid, PK)
  - webhook_endpoint_id (uuid, FK)
  - event (text)
  - payload (jsonb)
  - response_status (integer)
  - response_body (text)
  - attempts (integer, default 1)
  - delivered_at (timestamptz)
  - created_at (timestamptz)

Indexes:
  - customers(shop_id, phone) — UNIQUE, fast caller lookup
  - customers(shop_id, last_contact_date) — for segmentation queries
  - calls(shop_id, started_at DESC) — call history
  - calls(customer_id, started_at DESC) — customer call history
  - calls(shop_id, status) — active calls
  - reminders(shop_id, reminder_date, status) — upcoming reminders
  - orders(shop_id, customer_id) — customer orders
  - campaigns(shop_id, status) — campaign management

RLS Policies (Row Level Security):
  - Every table: shops can only see their own data
  - Filter: shop_id = (SELECT shop_id FROM shops WHERE owner_id = auth.uid())
  - Enable RLS on ALL tables from day 1
```

### Backend — API Routes

```
app/
  api/
    auth/
      signup/route.ts          — POST: Create user + shop record
      callback/route.ts        — GET: Supabase auth callback

Build:
  POST /api/auth/signup
    Input: { email, password, shop_name, state, phone }
    Logic:
      1. Supabase auth.signUp(email, password)
      2. Insert into shops table (name, state, forwarding_to)
      3. Set trial_ends_at = now + 14 days
      4. Return { user, shop }
    Error handling: duplicate email, weak password, missing fields
```

### Frontend — Pages & Components

```
app/
  (auth)/
    login/page.tsx             — Email + password login form
    signup/page.tsx            — Sign-up form (name, email, password, shop name, state)
    forgot-password/page.tsx   — Password reset request
    reset-password/page.tsx    — New password form

  (dashboard)/
    layout.tsx                 — Sidebar + header + main content area
    page.tsx                   — Dashboard home (empty state with setup checklist)

components/
  ui/
    Button.tsx                 — Primary, secondary, ghost, danger variants
    Input.tsx                  — Text input with label, error state
    Select.tsx                 — Dropdown select
    Card.tsx                   — Content card container
    Badge.tsx                  — Status/tag badges
    Modal.tsx                  — Overlay modal
    Toast.tsx                  — Success/error notifications
    Spinner.tsx                — Loading spinner
    EmptyState.tsx             — Illustration + message for empty pages
  layout/
    Sidebar.tsx                — Nav links: Dashboard, Calls, Customers, Reminders, Settings
    Header.tsx                 — Shop name, user avatar, notifications bell
    MobileNav.tsx              — Hamburger menu for mobile
  auth/
    LoginForm.tsx              — Login form component
    SignupForm.tsx             — Multi-step signup form
    AuthGuard.tsx              — Redirect to login if not authenticated

lib/
  supabase/
    client.ts                  — Browser Supabase client
    server.ts                  — Server-side Supabase client
    middleware.ts              — Auth middleware for protected routes
  types/
    database.ts                — TypeScript types generated from Supabase schema
  utils/
    formatting.ts              — Phone number formatting, date formatting
    constants.ts               — State consent map, plan limits, etc.
```

### Deploy

```
Vercel:
  - Connect GitHub repo
  - Set environment variables:
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY
  - Auto-deploy on push to main

Railway:
  - Create Node.js service (empty for now, will hold WebSocket server)
  - Set up auto-deploy from same repo /server directory

Domain:
  - Point callcontext.ai (or .com) to Vercel
  - SSL auto-provisioned
```

### Testing — Week 1

```
Manual tests:
  ✓ Sign up with new email → lands on dashboard
  ✓ Login with existing account → lands on dashboard
  ✓ Visit /dashboard without auth → redirects to login
  ✓ Forgot password → receives email → can reset
  ✓ Mobile responsive: login and signup work on phone
  ✓ Shop record created with correct state and trial dates
  ✓ RLS: User A cannot see User B's shop data

Automated tests (optional this week, nice to have):
  - Auth signup API: valid input, duplicate email, missing fields
  - Database: RLS policy test with two different user tokens
```

### Week 1 Deliverable
> You can sign up, log in, see an empty dashboard with a sidebar. Database has all 15+ tables ready. Deployed to production URL.

---

## WEEK 2: Vonage Integration — Inbound Calls (30 hrs)

### Backend — API Routes

```
app/api/
  vonage/
    answer/route.ts            — GET/POST: Vonage calls this when a call comes in
    event/route.ts             — POST: Call status updates (ringing, answered, completed)
    recording/route.ts         — POST: Recording ready notification
    fallback/route.ts          — POST: Error fallback handler

server/                        — Separate Node.js project for Railway
  (empty this week, just placeholder)
```

### Vonage Answer Webhook — Full Logic

```
GET /api/vonage/answer
  Input: query params { to, from, uuid, conversation_uuid }

  Logic:
    1. Look up shop by vonage_number = req.query.to
    2. Generate unique call_id (nanoid)
    3. Look up customer by phone = req.query.from AND shop_id
       - If found: set customer_id on the call record
       - If not found: create new customer with phone number only
    4. Insert into calls table:
       { shop_id, customer_id, vonage_call_id: uuid, direction: 'inbound',
         status: 'ringing', started_at: now() }
    5. Push real-time event via Supabase Realtime:
       → channel: `shop:{shop_id}:calls`
       → event: 'screen_pop'
       → payload: { call_id, customer_id, customer_name, customer_phone, caller_history }
    6. Build NCCO response:

    const ncco = [];

    // Step A: Consent disclosure (if 2-party state)
    if (TWO_PARTY_STATES.has(shop.state) && shop.consent_mode !== 'silent') {
      ncco.push({
        action: 'talk',
        text: shop.custom_greeting ||
              `Thanks for calling ${shop.name}. This call may be recorded.`,
        language: 'en-US', style: 1
      });
    }

    // Step B: Conversation (conference room for audio routing)
    ncco.push({
      action: 'conversation',
      name: `call-${call_id}`,
      startOnEnter: true, endOnExit: true,
      record: true, canSpeak: true, canHear: true,
      eventUrl: [`${BASE_URL}/api/vonage/event?call_id=${call_id}`]
    });

    // Step C: Connect to shop owner's phone
    ncco.push({
      action: 'connect',
      from: shop.vonage_number,
      endpoint: [{ type: 'phone', number: shop.forwarding_to }],
      eventUrl: [`${BASE_URL}/api/vonage/event?call_id=${call_id}`]
    });

    return NextResponse.json(ncco);

  Error handling:
    - Shop not found → play "Sorry, this number is not configured" → hang up
    - Database error → return basic connect NCCO (don't block the call)
    - Log all errors to Sentry
```

### Vonage Event Webhook

```
POST /api/vonage/event
  Input: body { status, uuid, timestamp, duration, ... }
         query: { call_id }

  Logic per status:
    'answered':
      → UPDATE calls SET status = 'active' WHERE id = call_id
      → Push Supabase Realtime event: 'call_answered'

    'completed':
      → UPDATE calls SET status = 'completed',
          ended_at = now(),
          duration_seconds = body.duration
      → Push Supabase Realtime event: 'call_ended'

    'unanswered' / 'busy' / 'rejected' / 'timeout':
      → UPDATE calls SET status = 'missed', ended_at = now()
      → Push Supabase Realtime event: 'call_missed'

  Error handling:
    - Always return 200 (Vonage retries on non-200)
    - Log unknown statuses for debugging
```

### Vonage Recording Webhook

```
POST /api/vonage/recording
  Input: body { recording_url, ... }
         query: { call_id }

  Logic:
    1. Download recording from Vonage (authenticated GET)
    2. Upload to Supabase Storage bucket 'recordings'
       path: `{shop_id}/{year}/{month}/{call_id}.mp3`
    3. UPDATE calls SET
         recording_url = vonage_url,
         recording_storage_path = supabase_path
    4. Return 200

  Error handling:
    - Retry download up to 3 times (Vonage URLs expire)
    - If upload fails, store vonage URL only (it persists for ~24hrs)
```

### Frontend — Additions

```
app/(dashboard)/
  calls/page.tsx               — Call list (table: date, caller, duration, status)

components/
  calls/
    CallList.tsx               — Sortable table of recent calls
    CallStatusBadge.tsx        — Color-coded: active (green), completed (gray), missed (red)
    ScreenPopNotification.tsx  — Toast that slides in when a call comes in
      → Shows: caller name (or phone), "Incoming call", customer tags if known
      → Uses Supabase Realtime subscription on `shop:{id}:calls`
```

### Supabase Realtime Setup

```
Enable Realtime on tables: calls, customers

Client subscription (in dashboard layout):
  supabase
    .channel(`shop:${shopId}:calls`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'calls', filter: `shop_id=eq.${shopId}` },
      (payload) => { showScreenPop(payload.new) }
    )
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'calls', filter: `shop_id=eq.${shopId}` },
      (payload) => { updateCallStatus(payload.new) }
    )
    .subscribe()
```

### ngrok Setup for Local Testing

```
Steps:
  1. Install ngrok: brew install ngrok
  2. Run: ngrok http 3000
  3. Copy the https URL
  4. Set in Vonage Dashboard:
     - Answer URL: https://xxxx.ngrok.io/api/vonage/answer
     - Event URL: https://xxxx.ngrok.io/api/vonage/event
  5. Call your Vonage number from your personal phone
  6. Verify: call connects, events fire, recording saves
```

### Testing — Week 2

```
Manual tests (CRITICAL — make 20+ real test calls):
  ✓ Call Vonage number → phone rings at forwarding number
  ✓ Answer → call connects, audio both ways
  ✓ Hang up → call record shows 'completed' with duration
  ✓ Don't answer → call record shows 'missed'
  ✓ New caller → new customer created with phone number
  ✓ Returning caller → matched to existing customer
  ✓ 2-party state shop → disclosure message plays first
  ✓ 1-party state shop → no disclosure, connects directly
  ✓ Recording appears in Supabase Storage after call ends
  ✓ Screen pop notification appears on dashboard when call comes in
  ✓ Call list page shows all test calls with correct status

Edge case tests:
  ✓ Two calls at the same time (different callers)
  ✓ Very short call (<5 seconds)
  ✓ Very long call (>5 minutes)
  ✓ Call from blocked/private number (no caller ID)
  ✓ Vonage webhook timeout (what happens if your server is slow?)
```

### Week 2 Deliverable
> Real phone calls work. Call your Vonage number → it rings your phone → you talk → it records. Screen pop notification appears on dashboard. Call history shows up in the calls list. New callers auto-create customer profiles.

---

## WEEK 3: Caller ID, Customer List, Basic Profiles (30 hrs)

### Backend — API Routes

```
app/api/
  customers/
    route.ts                   — GET: List customers (paginated, searchable)
                                 POST: Create customer manually
    [id]/route.ts              — GET: Single customer with call history
                                 PATCH: Update customer details
                                 DELETE: Soft-delete customer
    [id]/notes/route.ts        — GET: List notes, POST: Add note
    search/route.ts            — GET: Full-text search across customers
```

### API Specs

```
GET /api/customers?page=1&limit=20&search=maria&tag=vip&sort=last_contact_date
  Response: {
    customers: [...],
    total: 142,
    page: 1,
    totalPages: 8
  }
  Query logic:
    - Filter by shop_id (from auth)
    - Search across: first_name, last_name, phone, email (ILIKE)
    - Filter by tag if provided
    - Sort by last_contact_date DESC default
    - Paginate with offset

GET /api/customers/[id]
  Response: {
    customer: { ...all fields },
    recent_calls: [ last 10 calls with summaries ],
    upcoming_reminders: [ active reminders ],
    notes: [ all notes, pinned first ],
    orders: [ all orders ],
    stats: { total_calls, total_orders, lifetime_value, days_since_last_contact }
  }

PATCH /api/customers/[id]
  Input: { first_name?, last_name?, email?, address?, preferences?, tags? }
  Logic: Merge preferences (don't overwrite), update updated_at
  Validation: email format, phone format, tags are strings

POST /api/customers
  Input: { phone, first_name?, last_name?, email?, tags? }
  Logic: Create customer, set first_contact_date = now
  Validation: phone required, unique per shop

POST /api/customers/[id]/notes
  Input: { content, pinned? }
  Logic: Insert note with created_by = auth user
```

### Frontend — Pages

```
app/(dashboard)/
  customers/
    page.tsx                   — Customer list with search and filters
    [id]/page.tsx              — Customer profile page (full detail)

components/
  customers/
    CustomerTable.tsx          — Searchable table: name, phone, last contact, tags, value
    CustomerSearch.tsx         — Search bar with debounce (300ms)
    CustomerTagFilter.tsx      — Multi-select tag filter
    CustomerProfile.tsx        — Full profile layout:
      ┌──────────────────────────────────────────┐
      │ [Avatar] Maria Chen          [Edit] [Tag]│
      │ +1 (512) 555-0173 | maria@email.com      │
      │ Tags: [VIP] [Wedding Client]              │
      ├──────────────────────────────────────────┤
      │ Tab: Overview | Calls | Orders | Notes    │
      ├──────────────────────────────────────────┤
      │ Overview tab:                             │
      │  Stats: 12 calls | 8 orders | $1,240 LTV │
      │  Preferences: Loves peonies, no lilies    │
      │  Important dates:                         │
      │    🎂 Anniversary: March 15 (annual)      │
      │    🎂 Mother's birthday: June 3           │
      ├──────────────────────────────────────────┤
      │ Calls tab:                                │
      │  [Mar 5] 4:32 min — Ordered roses for     │
      │  anniversary. Wants delivery March 14.    │
      │  [Feb 12] 2:15 min — Asked about pricing  │
      │  for wedding centerpieces.                │
      ├──────────────────────────────────────────┤
      │ Notes tab:                                │
      │  📌 Allergic to lilies — NEVER include    │
      │  [Mar 5] Prefers warm colors              │
      │  [+Add note]                              │
      └──────────────────────────────────────────┘

    CustomerEditModal.tsx      — Edit name, email, address, preferences
    CustomerNoteForm.tsx       — Add/edit note with pin toggle
    CustomerTagManager.tsx     — Add/remove tags (autocomplete from existing tags)
    CustomerStatsBar.tsx       — Total calls, orders, LTV, days since last contact
    PreferencesEditor.tsx      — Edit flower preferences, colors, allergies
    ImportantDatesCard.tsx     — List of detected dates with edit/delete
```

### Caller ID Enhancement

```
Update the Vonage answer webhook:
  When a call comes in and customer is found:
    Screen pop now includes:
    {
      customer_name: 'Maria Chen',
      customer_phone: '+15125550173',
      tags: ['VIP', 'Wedding Client'],
      last_call_summary: 'Ordered roses for anniversary, delivery March 14',
      last_call_date: '2024-03-05',
      total_orders: 8,
      preferences: { flowers: ['peonies', 'roses'], allergies: ['lilies'] },
      important_dates: [{ label: 'Anniversary', date: '03-15', recurring: true }]
    }
```

### Testing — Week 3

```
Manual tests:
  ✓ Customer list loads with pagination (test with 50+ records via seed script)
  ✓ Search by name finds customer
  ✓ Search by phone finds customer
  ✓ Filter by tag works
  ✓ Click customer → profile page loads with all tabs
  ✓ Edit customer name → saves, shows updated
  ✓ Add a note → appears in notes tab
  ✓ Pin a note → moves to top
  ✓ Add a tag → appears on profile and in list
  ✓ Screen pop shows full customer info (not just phone)
  ✓ New caller creates profile → appears in customer list
  ✓ Mobile: customer list scrollable, profile readable on phone

Seed script:
  - Write a script that creates 50 fake customers with varied data
  - Include: some with many calls, some with none, varied tags
  - Run it in development for testing pagination, search, filters
```

### Week 3 Deliverable
> Customer list with search and tags. Click any customer to see full profile with call history, notes, preferences. Screen pop shows rich customer info when they call. You can manually edit profiles, add notes, manage tags.

---

## WEEK 4: Call Detail Page + Recording Playback + Call History (30 hrs)

### Backend — API Routes

```
app/api/
  calls/
    route.ts                   — GET: List calls (paginated, filterable)
    [id]/route.ts              — GET: Single call with full details
    [id]/recording/route.ts    — GET: Signed URL for recording playback
```

### API Specs

```
GET /api/calls?page=1&limit=20&status=completed&customer_id=xxx&date_from=2024-01-01
  Response: {
    calls: [{
      id, customer_id, customer_name, customer_phone,
      direction, status, started_at, duration_seconds,
      ai_summary, sentiment, follow_up_needed
    }],
    total, page, totalPages
  }

GET /api/calls/[id]
  Response: {
    call: { ...all fields },
    customer: { id, name, phone, tags },
    transcript: "full transcript text",
    entities: { products, occasion, delivery_date, address, sentiment, preferences },
    recording_available: true/false
  }

GET /api/calls/[id]/recording
  Logic:
    1. Verify call belongs to user's shop
    2. Generate signed URL from Supabase Storage (expires in 1 hour)
    3. Return { url: signed_url, expires_at }
```

### Frontend — Pages

```
app/(dashboard)/
  calls/
    page.tsx                   — Enhanced call list (update from week 2)
    [id]/page.tsx              — Call detail page

components/
  calls/
    CallList.tsx               — UPDATE: Add filters (date range, status, search)
    CallDetail.tsx             — Full call detail layout:
      ┌──────────────────────────────────────────┐
      │ ← Back to calls                          │
      │                                          │
      │ Call with Maria Chen                     │
      │ Mar 5, 2024 • 4:32 min • Inbound        │
      │ Sentiment: 😊 Positive                  │
      │ Follow-up needed: Yes                    │
      ├──────────────────────────────────────────┤
      │ 🔊 Recording                             │
      │ [▶ advancement ━━━━━━━━━━━━━━━━ 4:32]  │
      │ [1x] [Download]                          │
      ├──────────────────────────────────────────┤
      │ AI Summary                               │
      │ Customer ordered 2 dozen red roses for   │
      │ wedding anniversary, delivery March 14   │
      │ to 123 Main St. Mentioned budget of $150.│
      ├──────────────────────────────────────────┤
      │ Detected entities                        │
      │ Products: Red roses (2 dozen)            │
      │ Occasion: Wedding anniversary            │
      │ Delivery: March 14, 123 Main St          │
      │ Budget: $150                             │
      ├──────────────────────────────────────────┤
      │ Transcript                               │
      │ Owner: Good morning, Bella's Flowers!    │
      │ Customer: Hi, I'd like to order roses... │
      │ ...                                      │
      └──────────────────────────────────────────┘

    AudioPlayer.tsx            — Custom audio player:
      - Play/pause button
      - Progress bar (seekable)
      - Current time / total time display
      - Playback speed (1x, 1.5x, 2x)
      - Download button
      - Volume control
    CallTranscript.tsx         — Formatted transcript with speaker labels
    CallEntities.tsx           — Extracted entities display cards
    CallSummary.tsx            — AI summary block
    CallFilters.tsx            — Date range picker, status dropdown, search input
```

### Testing — Week 4

```
Manual tests:
  ✓ Call list shows all calls with correct filters
  ✓ Date range filter works
  ✓ Status filter works (completed, missed, etc.)
  ✓ Click call → detail page loads
  ✓ Recording plays in custom audio player
  ✓ Playback speed change works
  ✓ Seek/scrub works
  ✓ Download recording works
  ✓ Transcript displays (placeholder text for now — real transcription next month)
  ✓ AI summary displays (placeholder for now)
  ✓ Click customer name → navigates to customer profile
  ✓ Mobile: audio player works on iOS Safari and Android Chrome
  ✓ Recording signed URL expires correctly (test with expired URL)
```

### Week 4 Deliverable
> Complete call management: list, filter, detail view, recording playback. The UI is polished enough to demo. Next month adds real-time transcription to fill in the transcript and AI summary fields that are currently placeholders.

---

### MONTH 1 MILESTONE CHECK

> **Can you do all of this?**
> 1. ✅ Sign up and log in
> 2. ✅ Call your Vonage number → phone rings → call connects
> 3. ✅ Screen pop with customer info when call comes in
> 4. ✅ Call recorded and playable from dashboard
> 5. ✅ Customer list with search, tags, filters
> 6. ✅ Customer profile with call history, notes, preferences
> 7. ✅ Call detail page with recording player
>
> **If yes → proceed to Month 2. If any of 1-4 don't work → FIX THEM before moving on.**

---

# ═══════════════════════════════════════════
# MONTH 2: REAL-TIME ENGINE + CRM DEPTH
# "Watch the transcript live, AI extracts everything"
# ═══════════════════════════════════════════

---

## WEEK 5: WebSocket Audio Streaming Server (30 hrs)

### Backend — Railway WebSocket Server

```
server/
  package.json
  tsconfig.json
  src/
    index.ts                   — Express + WebSocket server entry point
    websocket/
      audioHandler.ts          — Handle incoming Vonage audio WebSocket
      dashboardHandler.ts      — Handle outgoing dashboard WebSocket connections
    utils/
      logger.ts                — Structured logging
      auth.ts                  — Verify shop_id from WebSocket headers
    types/
      vonage.ts                — Vonage WebSocket message types
      dashboard.ts             — Dashboard WebSocket event types
```

### WebSocket Server — Full Implementation Plan

```
Express server on Railway (port from env):

1. Route: wss://server.railway.app/audio-stream
   - Vonage connects here when a call starts
   - Headers contain: shop_id, call_id, caller_number
   - Receives: raw PCM audio chunks (16-bit, 16kHz, little-endian)
   - This week: receive audio, log it, store buffer
   - Next week: forward to Deepgram

2. Route: wss://server.railway.app/dashboard/{shop_id}
   - Browser dashboard connects here
   - Authenticated via Supabase JWT token in query param
   - Receives: nothing (it's a consumer)
   - Sends: live transcript chunks, entity updates, call status

Connection management:
  - Map: shop_id → Set<WebSocket> (multiple dashboard tabs)
  - Map: call_id → { vonageWs, audioBuffer, metadata }
  - Clean up on disconnect
  - Heartbeat ping every 30s to keep connections alive

pushToDashboard(shopId, callId, data):
  - Find all dashboard connections for shopId
  - JSON.stringify and send to each
  - If no dashboards connected, data is lost (that's fine — it's live-only)
```

### Update Vonage NCCO

```
Update /api/vonage/answer to include WebSocket endpoint:

  // After consent disclosure and conversation action...
  ncco.push({
    action: 'connect',
    endpoint: [{
      type: 'websocket',
      uri: `wss://${RAILWAY_HOST}/audio-stream`,
      'content-type': 'audio/l16;rate=16000',
      headers: {
        shop_id: shop.id,
        call_id: callId,
        caller_number: callerPhone
      }
    }]
  });

  // Then connect to shop owner phone (same as before)
  ncco.push({
    action: 'connect',
    from: shop.vonage_number,
    endpoint: [{ type: 'phone', number: shop.forwarding_to }]
  });
```

### Frontend — Live Connection

```
components/
  calls/
    LiveCallIndicator.tsx      — Pulsing green dot + "Live call" in sidebar
    useWebSocket.ts            — Custom hook for dashboard WebSocket:
      const { connected, messages, lastEvent } = useDashboardWebSocket(shopId);
      - Auto-connect on mount
      - Auto-reconnect on disconnect (exponential backoff)
      - Parse incoming JSON messages
      - Provide connection status
```

### Testing — Week 5

```
Manual tests:
  ✓ Railway server starts and accepts WebSocket connections
  ✓ Make a real call → Vonage opens WebSocket to Railway
  ✓ Audio data arrives (log buffer sizes to verify)
  ✓ Call ends → WebSocket closes cleanly
  ✓ Dashboard connects to dashboard WebSocket
  ✓ Dashboard receives connection confirmation
  ✓ Multiple dashboard tabs connect simultaneously
  ✓ Dashboard reconnects after server restart
  ✓ Call still works normally (owner can talk, audio quality unchanged)

Critical verification:
  ✓ Adding WebSocket to NCCO does NOT break existing call flow
  ✓ If Railway server is down, calls still connect (graceful degradation)
```

### Week 5 Deliverable
> WebSocket pipeline is wired: Vonage → Railway → Dashboard. Audio flows through. Call quality is unchanged. Dashboard connects and stays connected. No transcription yet — just the pipe.

---

## WEEK 6: Deepgram Live Transcription (30 hrs)

### Backend — Deepgram Integration

```
server/src/
  transcription/
    deepgramClient.ts          — Deepgram SDK setup and streaming connection
    transcriptBuffer.ts        — Buffer management for entity extraction batching
    speakerLabels.ts           — Map Deepgram speaker IDs to "Customer" / "Owner"
```

### Deepgram Streaming — Full Logic

```
When Vonage WebSocket connects (audioHandler.ts):

  1. Open Deepgram streaming connection:
     const dgConnection = deepgram.listen.live({
       model: 'nova-3',
       language: 'en-US',
       smart_format: true,
       punctuate: true,
       diarize: true,
       interim_results: true,
       utterance_end_ms: 1000,
       vad_events: true,
       keywords: ['roses:2', 'peonies:2', 'lilies:2', 'carnations:2',
                  'arrangement:2', 'bouquet:2', 'centerpiece:2',
                  'delivery:2', 'sympathy:2', 'wedding:2']
     });

  2. On Vonage audio chunk:
     → Forward raw PCM bytes to Deepgram: dgConnection.send(audioData)

  3. On Deepgram transcript event:
     const transcript = data.channel.alternatives[0].transcript;
     const isFinal = data.is_final;
     const speaker = data.channel.alternatives[0].words?.[0]?.speaker;

     → Push to dashboard WebSocket:
       {
         type: 'transcript',
         call_id: callId,
         text: transcript,
         speaker: speaker === 0 ? 'customer' : 'owner',
         is_final: isFinal,
         confidence: data.channel.alternatives[0].confidence,
         timestamp: Date.now()
       }

     → If isFinal: append to transcript buffer

  4. On Vonage WebSocket close (call ended):
     → Close Deepgram connection
     → Save full transcript to database:
       UPDATE calls SET transcript = fullTranscript WHERE id = callId
     → Trigger post-call analysis (week 7)
```

### Frontend — Live Transcript View

```
app/(dashboard)/
  calls/
    live/[callId]/page.tsx     — Live call view (during active call)

components/
  calls/
    LiveCallView.tsx           — Main live call layout:
      ┌──────────────────────────────────────────┐
      │ 🟢 Live call with Maria Chen     03:42   │
      ├──────────────┬───────────────────────────┤
      │ Customer card │  Live transcript          │
      │ Maria Chen    │                           │
      │ VIP, Wedding  │  Customer: Hi, I'd like   │
      │               │  to order some flowers    │
      │ Last order:   │  for my anniversary...    │
      │ Roses, $120   │                           │
      │               │  You: Of course! When is  │
      │ Anniversary:  │  the anniversary?         │
      │ March 15      │                           │
      │               │  Customer: March 15th,    │
      │ Preferences:  │  it's our 10th...         │
      │ Peonies,      │                           │
      │ warm colors   │  [typing indicator...]    │
      │               │                           │
      ├──────────────┴───────────────────────────┤
      │ Detected (updates live):                  │
      │ [Occasion: Anniversary] [Date: Mar 15]    │
      └──────────────────────────────────────────┘

    LiveTranscript.tsx         — Auto-scrolling transcript:
      - Final lines: solid text
      - Interim (partial) line: gray/italic, updates in place
      - Speaker labels: Customer (left-aligned) vs You (right-aligned)
      - Auto-scroll to bottom, with "scroll to latest" button if user scrolls up
    CustomerCardMini.tsx       — Compact customer card for live view sidebar
    LiveEntitiesBar.tsx        — Horizontal bar of detected entities (animated entrance)
```

### Auto-Navigate to Live View

```
When a call starts (screen pop):
  - Show notification: "Incoming call from Maria Chen"
  - Notification has button: "View live →"
  - Clicking it navigates to /calls/live/{callId}
  - If already on dashboard, auto-switch to live view (optional, configurable)
```

### Testing — Week 6

```
Manual tests (make 10+ real calls with varied conversations):
  ✓ Call starts → transcript appears within 1-2 seconds
  ✓ Words stream in real-time (interim results show as typing)
  ✓ Final results replace interim results
  ✓ Speaker identification: customer vs owner labeled correctly
  ✓ Auto-scroll works, doesn't jump annoyingly
  ✓ Scroll up → auto-scroll pauses, "back to bottom" button appears
  ✓ Call ends → final transcript saved to database
  ✓ Navigate to call detail page → transcript is there
  ✓ Florist-specific words transcribed correctly (roses, peonies, bouquet)
  ✓ Long call (5+ min) → no memory leaks, no disconnection
  ✓ Poor phone audio → still gets reasonable transcript

Edge cases:
  ✓ Silence (hold) → no crash, no garbage text
  ✓ Background noise → handled gracefully
  ✓ Fast speaker → still keeps up
  ✓ Dashboard opened mid-call → catches up with current state
```

### Week 6 Deliverable
> Live transcription works. Make a call, open the live view, watch words appear in real-time. Speaker diarization labels customer vs owner. Call ends → full transcript saved.

---

## WEEK 7: AI Entity Extraction + Post-Call Analysis (30 hrs)

### Backend — AI Pipeline

```
server/src/
  ai/
    realtimeExtraction.ts      — 30-second batched entity extraction during call
    postCallAnalysis.ts        — Full analysis when call ends
    prompts.ts                 — All LLM prompt templates
    entityMerger.ts            — Merge partial entities into complete profile updates

app/api/
  customers/
    [id]/
      route.ts                 — UPDATE: PATCH now handles AI-detected data merge
```

### Real-Time Extraction (every 30s during call)

```
extractEntitiesRealTime(shopId, callId, transcriptChunk):

  Prompt:
    System: "Extract entities from this florist call transcript snippet.
    Return JSON only. Only extract what is EXPLICITLY stated. Return null for missing fields.
    {"products":[{"name":"","quantity":""}],"occasion":"","delivery_date":"","delivery_address":"","sentiment":"positive/neutral/negative","preferences":[],"customer_name":"","budget":null}"

  Input: last 30 seconds of transcript

  On response:
    1. Parse JSON (with try/catch — LLM output can be malformed)
    2. Push to dashboard:
       { type: 'entities', call_id, data: entities, timestamp }
    3. Store in memory for post-call merge

  Rate limiting:
    - Max 1 extraction per 30 seconds
    - Skip if transcript chunk < 50 characters
    - Use GPT-4o-mini for speed + cost ($0.002 per call)
```

### Post-Call Analysis (runs once when call ends)

```
runPostCallAnalysis(shopId, callId, fullTranscript):

  Prompt:
    System: "Analyze this complete florist shop phone call. Extract ALL information.
    Return JSON:
    {
      "customer_name": "string or null",
      "products": [{"name":"","quantity":"","price":null}],
      "delivery_address": "string or null",
      "delivery_date": "string or null (ISO format)",
      "occasion": "string or null",
      "preferences": ["string"],
      "special_instructions": "string or null",
      "budget_mentioned": number or null,
      "call_summary": "2-3 sentence summary",
      "sentiment": "positive/neutral/negative",
      "follow_up_needed": boolean,
      "follow_up_reason": "string or null",
      "important_dates_detected": [{"date":"ISO","label":"","recurring":boolean}],
      "upsell_opportunity": "string or null",
      "order_detected": boolean
    }"

  On response:
    1. Parse JSON
    2. UPDATE calls SET
         ai_summary = analysis.call_summary,
         sentiment = analysis.sentiment,
         entities_extracted = analysis,
         follow_up_needed = analysis.follow_up_needed
    3. Update customer profile (MERGE, not overwrite):
       - Add new preferences (don't remove existing)
       - Update name if detected and profile has no name
       - Add new important dates
       - Update last_contact_date
       - If order_detected: create order record
    4. Create reminders for detected dates:
       - For each date in important_dates_detected:
         INSERT INTO reminders (shop_id, customer_id, title, reminder_date,
           advance_days: 7, recurring, source: 'auto_detected', call_id)
    5. Push to dashboard:
       { type: 'call_ended', call_id, summary: analysis }
    6. If follow_up_needed:
       INSERT INTO tasks (shop_id, customer_id, title: "Follow up: " + reason,
         due_date: tomorrow, priority: 'high')
```

### Customer Profile Auto-Update Logic

```
mergeCustomerData(existingProfile, aiExtractedData):

  Rules:
  - Name: only set if currently null/empty
  - Email: only set if currently null/empty
  - Address: only set if currently null/empty OR if AI extracted one and it's different
  - Preferences.flowers: APPEND new, don't remove existing
  - Preferences.allergies: APPEND new
  - Preferences.colors: APPEND new
  - Tags: don't auto-modify (owner controls tags)
  - Loyalty: don't auto-modify
  - Important dates: add new ones, don't duplicate existing (match by date + label)
  - lifetime_value: increment by detected budget/order amount
  - total_orders: increment if order detected
  - last_contact_date: always update to now
```

### Frontend — Enhancements

```
Update LiveCallView.tsx:
  - Entities bar now updates in real-time (animated slide-in)
  - Sentiment indicator (emoji + color: 😊 green, 😐 yellow, 😟 red)
  - When call ends: smooth transition from live view to summary view

Update CallDetail page (calls/[id]/page.tsx):
  - AI Summary section now populated
  - Entities section now populated
  - "Follow-up needed" badge if flagged
  - Link to auto-created reminder if dates detected
  - Link to auto-created order if order detected

Update CustomerProfile:
  - Show "AI-detected" badge on auto-populated fields
  - Important dates section shows source (auto-detected vs manual)
  - Activity feed shows: "AI detected anniversary date: March 15"

New component:
  AIInsightCard.tsx            — "Upsell opportunity: Customer mentioned they want
                                 something special — suggest premium arrangement"
```

### Testing — Week 7

```
Manual tests (make 15+ calls with specific scenarios):

  Scenario 1 — Simple order:
    "I'd like to order a dozen red roses for delivery on Friday"
    ✓ Products detected: red roses, quantity 12
    ✓ Delivery date detected: this Friday
    ✓ Order auto-created

  Scenario 2 — Anniversary with address:
    "It's our anniversary on March 15th, deliver to 123 Oak Street"
    ✓ Occasion: anniversary
    ✓ Date: March 15
    ✓ Address: 123 Oak Street
    ✓ Recurring reminder auto-created
    ✓ Customer profile updated with date

  Scenario 3 — Preferences mentioned:
    "She loves peonies but is allergic to lilies"
    ✓ Preferences updated: peonies added
    ✓ Allergies updated: lilies added
    ✓ Existing preferences not removed

  Scenario 4 — Complaint/negative:
    "I'm really unhappy with the last delivery, it arrived wilted"
    ✓ Sentiment: negative
    ✓ Follow-up needed: true
    ✓ Task auto-created: "Follow up: Customer complaint about delivery"

  Scenario 5 — New customer:
    "Hi, this is Sarah. I've never ordered from you before"
    ✓ Name detected and added to profile
    ✓ New customer flag

  Scenario 6 — Returning customer (profile already exists):
    ✓ Existing name not overwritten
    ✓ New preferences MERGED with existing
    ✓ New dates added without duplicating existing ones
```

### Week 7 Deliverable
> Full AI pipeline works. During calls: entities appear in real-time. After calls: AI summary, sentiment, entities, auto-created orders and reminders. Customer profiles auto-update from call data. The product now has genuine intelligence.

---

### MONTH 2 MILESTONE CHECK

> **The core product is DONE. You could start selling this.**
> 1. ✅ Real-time transcription during calls
> 2. ✅ AI entity extraction (live + post-call)
> 3. ✅ Auto-generated summaries and profiles
> 4. ✅ Smart reminders from detected dates
> 5. ✅ Auto-created orders and follow-up tasks
> 6. ✅ Rich customer profiles with full history
>
> **This is the "wow moment" demo.** Make a call, watch the transcript stream, see entities pop up, call ends → everything auto-organized.

---

# ═══════════════════════════════════════════
# MONTH 3: REMINDERS + MARKETING + ANALYTICS
# "Bring customers back and track everything"
# ═══════════════════════════════════════════

---

## WEEK 8: Smart Reminders System (30 hrs)

### Backend — API Routes

```
app/api/
  reminders/
    route.ts                   — GET: List reminders (filterable by date range, status)
                                 POST: Create manual reminder
    [id]/route.ts              — PATCH: Update/snooze/dismiss
                                 DELETE: Delete reminder
    upcoming/route.ts          — GET: Reminders due in next 7/14/30 days
    process/route.ts           — POST: Cron-triggered — process due reminders
```

### API Specs

```
GET /api/reminders?status=pending&from=2024-03-01&to=2024-03-31&customer_id=xxx
  Response: {
    reminders: [{
      id, customer_id, customer_name, customer_phone,
      title, description, reminder_date, advance_days,
      recurring, recurrence_pattern, status, source
    }],
    total
  }

GET /api/reminders/upcoming?days=7
  Response: {
    today: [...],     // due today
    this_week: [...], // due in next 7 days
    upcoming: [...]   // due in 8-30 days
  }

POST /api/reminders
  Input: {
    customer_id, title, description?,
    reminder_date (YYYY-MM-DD), advance_days? (default 7),
    recurring? (default false), recurrence_pattern? ('yearly')
  }

PATCH /api/reminders/[id]
  Actions:
    { action: 'dismiss' }     → status = 'dismissed'
    { action: 'snooze', days: 3 } → snoozed_until = now + 3 days, status = 'snoozed'
    { action: 'complete' }    → status = 'sent'
    { ...field updates }      → update fields

POST /api/reminders/process (called by Vercel Cron daily at 8am shop timezone)
  Logic:
    1. Find all reminders where:
       - status = 'pending'
       - reminder_date - advance_days <= today
       - OR (status = 'snoozed' AND snoozed_until <= today)
    2. For each due reminder:
       a. Send push notification to shop owner's dashboard
       b. Include in daily email digest
       c. Update status to 'sent'
    3. For recurring reminders that fired:
       a. Create next occurrence (same date next year/month)
       b. Keep original for history
```

### Cron Job Setup (Vercel Cron)

```
vercel.json:
{
  "crons": [{
    "path": "/api/cron/daily-digest",
    "schedule": "0 12 * * *"    // Noon UTC (adjust per shop timezone)
  }]
}

app/api/cron/
  daily-digest/route.ts        — Process reminders + send email digest
```

### Daily Email Digest (Resend)

```
Email content:
  Subject: "☀️ Your CallContext Daily Brief — March 5"

  Sections:
  1. TODAY'S REMINDERS
     - Maria Chen — Anniversary (March 15) — Call to suggest arrangement
     - John Park — Mother's birthday (March 8) — Order confirmed last year

  2. YESTERDAY'S CALLS
     - 8 calls received, 2 new customers
     - 1 follow-up needed: Sarah Kim (complaint)

  3. UPCOMING THIS WEEK
     - 3 more reminders due this week

  CTA: "Open Dashboard →"
```

### Frontend — Pages & Components

```
app/(dashboard)/
  reminders/page.tsx           — Reminders list page
  page.tsx                     — UPDATE dashboard home with reminders widget

components/
  reminders/
    RemindersList.tsx          — List grouped by: Today, This Week, Upcoming
    ReminderCard.tsx           — Single reminder:
      ┌──────────────────────────────────────┐
      │ 🎂 Maria Chen — Anniversary          │
      │ March 15 (recurring yearly)           │
      │ Auto-detected from call on Feb 12     │
      │                                       │
      │ [Call Maria] [Snooze ▾] [Dismiss]     │
      └──────────────────────────────────────┘
    CreateReminderModal.tsx    — Form: customer picker, title, date, recurring toggle
    ReminderDashboardWidget.tsx — Compact widget for dashboard home:
      "3 reminders today, 7 this week"
      + list of today's reminders

  dashboard/
    DashboardHome.tsx          — UPDATE: Add reminders widget, recent calls widget
```

### Dashboard Home Page (finally not empty!)

```
Dashboard home layout:
  ┌──────────────────────────────────────────────┐
  │ Good morning, Sai! Here's your day.          │
  ├──────────────┬───────────────────────────────┤
  │ TODAY'S       │  RECENT CALLS                 │
  │ REMINDERS     │  [Call 1 summary...]          │
  │ 🎂 Maria -   │  [Call 2 summary...]          │
  │ Anniversary   │  [Call 3 summary...]          │
  │ 📞 Follow up │  [Call 4 summary...]          │
  │ Sarah (comp.) │                               │
  │               │  QUICK STATS                  │
  │ [View all →]  │  12 calls today               │
  │               │  3 new customers              │
  │               │  2 follow-ups needed          │
  └──────────────┴───────────────────────────────┘
```

### Testing — Week 8

```
Manual tests:
  ✓ Reminders page lists all reminders grouped correctly
  ✓ Create manual reminder → appears in list
  ✓ Reminder auto-created from call (from week 7) → appears in list
  ✓ Dismiss reminder → moves to dismissed
  ✓ Snooze for 3 days → disappears, reappears in 3 days
  ✓ Recurring reminder fires → next year's instance auto-created
  ✓ Dashboard home shows today's reminders
  ✓ Daily email digest sends (test with your email)
  ✓ Click "Call Maria" → shows phone number / opens dialer
  ✓ Reminder for customer who was deleted → handled gracefully
```

### Week 8 Deliverable
> Reminders system complete. Auto-detected from calls + manual creation. Dashboard home page shows today's reminders and recent calls. Daily email digest sends every morning.

---

## WEEK 9: Analytics Dashboard (30 hrs)

### Backend — API Routes

```
app/api/
  analytics/
    calls/route.ts             — GET: Call volume stats (daily/weekly/monthly)
    customers/route.ts         — GET: Customer growth stats
    overview/route.ts          — GET: Dashboard overview numbers
```

### API Specs

```
GET /api/analytics/overview
  Response: {
    today: { calls: 12, new_customers: 3, missed_calls: 1 },
    this_week: { calls: 67, new_customers: 14, missed_calls: 5 },
    this_month: { calls: 234, new_customers: 52, missed_calls: 18 },
    trends: {
      calls_vs_last_month: '+12%',
      customers_vs_last_month: '+8%'
    }
  }

GET /api/analytics/calls?period=30d
  Response: {
    daily_volume: [{ date: '2024-03-01', count: 15 }, ...],
    by_hour: [{ hour: 9, count: 45 }, ...],  // busiest hours
    by_day_of_week: [{ day: 'Monday', count: 52 }, ...],
    avg_duration_seconds: 187,
    completion_rate: 0.89,  // completed / total
    by_sentiment: { positive: 156, neutral: 62, negative: 16 }
  }

GET /api/analytics/customers?period=30d
  Response: {
    daily_new: [{ date: '2024-03-01', count: 3 }, ...],
    total_customers: 342,
    top_customers: [{ name, total_calls, lifetime_value }],  // top 10
    by_occasion: [{ occasion: 'birthday', count: 45 }, ...],
    popular_products: [{ product: 'roses', mentions: 89 }, ...],
    returning_rate: 0.42  // customers with 2+ calls / total
  }
```

### Frontend — Analytics Pages

```
app/(dashboard)/
  analytics/page.tsx           — Full analytics dashboard

components/
  analytics/
    OverviewCards.tsx           — 4 stat cards: calls today, new customers, missed calls, follow-ups
    CallVolumeChart.tsx        — Line chart: daily call volume (last 30 days)
      → Use recharts library (already in Next.js ecosystem)
    BusiestHoursHeatmap.tsx    — Heatmap: hour × day-of-week (when do most calls come in?)
    SentimentBreakdown.tsx     — Donut chart: positive/neutral/negative calls
    TopCustomersTable.tsx      — Table: top 10 customers by calls or revenue
    OccasionsPieChart.tsx      — Pie chart: birthday, anniversary, sympathy, wedding...
    PopularProductsList.tsx    — Bar chart: most mentioned products
    CustomerGrowthChart.tsx    — Line chart: cumulative customers over time
    StatCard.tsx               — Reusable stat card: number + trend arrow + label
    DateRangePicker.tsx        — 7d / 30d / 90d / custom range selector
```

### Dashboard Home — Update with Stats

```
Update DashboardHome.tsx:
  - Add OverviewCards at the top (4 stat cards)
  - Add mini call volume sparkline (last 7 days)
  - Add "Busiest hour today" indicator
```

### Testing — Week 9

```
Manual tests:
  ✓ Analytics page loads with charts (need 50+ calls seeded for meaningful data)
  ✓ Date range picker changes all charts
  ✓ Call volume chart shows correct daily counts
  ✓ Busiest hours heatmap highlights correctly
  ✓ Top customers matches manual count
  ✓ Sentiment breakdown matches known data
  ✓ Occasion pie chart shows auto-detected occasions
  ✓ Charts look good on mobile (responsive)
  ✓ Empty state: analytics page with 0 calls shows helpful message

Seed script update:
  - Generate 200+ fake calls with varied dates, durations, sentiments
  - Generate fake transcripts with entity data
  - Run to fill analytics with realistic data for demo
```

### Week 9 Deliverable
> Full analytics dashboard: call volume trends, busiest hours, sentiment breakdown, top customers, popular products, customer growth. Beautiful charts that update with real data.

---

## WEEK 10: Tasks System + Notes Enhancement + Activity Feed (30 hrs)

### Backend — API Routes

```
app/api/
  tasks/
    route.ts                   — GET: List tasks, POST: Create task
    [id]/route.ts              — PATCH: Update task, DELETE: Delete task
  activity/
    route.ts                   — GET: Activity feed for a customer or shop-wide
```

### API Specs

```
GET /api/tasks?status=open&customer_id=xxx&due=overdue|today|this_week|all
  Response: { tasks: [...], total }

POST /api/tasks
  Input: { title, description?, customer_id?, due_date?, priority? }

PATCH /api/tasks/[id]
  Input: { status?, title?, due_date?, priority? }

GET /api/activity?customer_id=xxx&page=1&limit=50
  OR
GET /api/activity?scope=shop&page=1&limit=50
  Response: {
    activities: [{
      type: 'call' | 'note' | 'reminder' | 'order' | 'task' | 'profile_update',
      timestamp, description, customer_id?, customer_name?, metadata
    }]
  }
  Logic:
    UNION query across calls, notes, reminders, orders, tasks
    ORDER BY timestamp DESC
```

### Frontend — Pages & Components

```
app/(dashboard)/
  tasks/page.tsx               — Task board (Kanban-style or list)

components/
  tasks/
    TaskBoard.tsx              — Three columns: To Do | In Progress | Done
      → Drag-and-drop between columns (use @hello-pangea/dnd)
    TaskCard.tsx               — Task card:
      ┌──────────────────────────────┐
      │ 🔴 Follow up with Sarah Kim  │
      │ Complaint about wilted roses │
      │ Due: Tomorrow                │
      │ Customer: Sarah Kim →        │
      └──────────────────────────────┘
    TaskCreateModal.tsx        — Create/edit task form with customer picker
    TaskFilters.tsx            — Filter by: status, priority, due date, customer

  activity/
    ActivityFeed.tsx           — Chronological feed of all events
    ActivityItem.tsx           — Single activity:
      "[Mar 5, 3:42pm] 📞 Call with Maria Chen — 4:32 min
       AI: Ordered roses for anniversary, delivery March 14"
      "[Mar 5, 3:50pm] 🤖 AI detected: Anniversary March 15 (recurring)
       → Reminder auto-created"
      "[Mar 5, 4:00pm] 📝 Note added: Prefers warm colors"

Update CustomerProfile:
  - Add Activity tab showing full customer activity feed
  - Add Tasks section showing open tasks for this customer
```

### Testing — Week 10

```
Manual tests:
  ✓ Task board shows tasks in correct columns
  ✓ Drag task between columns → status updates
  ✓ Create task from task page → appears in board
  ✓ Auto-created tasks (from AI follow-up detection) appear in board
  ✓ Click customer link on task → navigates to profile
  ✓ Filter tasks by customer, priority, due date
  ✓ Activity feed shows all event types in correct order
  ✓ Customer profile activity tab shows only that customer's events
  ✓ Overdue tasks highlighted in red
  ✓ Mobile: task list view (not kanban) on small screens
```

### Week 10 Deliverable
> Tasks system with kanban board. Activity feed across the whole CRM. Customer profiles show complete timeline of all interactions. The CRM now tracks everything that happens.

---

## WEEK 11: SMS & Email Marketing Foundation (30 hrs)

### Backend — API Routes

```
app/api/
  campaigns/
    route.ts                   — GET: List campaigns, POST: Create campaign
    [id]/route.ts              — GET: Detail, PATCH: Update, DELETE: Delete
    [id]/send/route.ts         — POST: Send/schedule campaign
    [id]/preview/route.ts      — POST: Send test to shop owner's email/phone
  segments/
    route.ts                   — GET: List segments, POST: Create segment
    [id]/route.ts              — GET: Segment details with customer count
    [id]/customers/route.ts    — GET: Customers in this segment
  templates/
    route.ts                   — GET: Pre-built templates
```

### Segments Logic

```
Segment filter structure (stored as JSONB):
{
  "conditions": [
    { "field": "tags", "op": "contains", "value": "VIP" },
    { "field": "total_orders", "op": "gte", "value": 3 },
    { "field": "last_contact_date", "op": "before", "value": "90_days_ago" },
    { "field": "loyalty_tier", "op": "eq", "value": "gold" },
    { "field": "occasions", "op": "contains", "value": "birthday" }
  ],
  "logic": "AND"    // AND = all conditions, OR = any condition
}

Build dynamic SQL query from segment filter:
  SELECT * FROM customers WHERE shop_id = $1
    AND 'VIP' = ANY(tags)
    AND total_orders >= 3
    AND last_contact_date < now() - interval '90 days'
    ...

Pre-built segments (auto-created on signup):
  - "All customers" — no filter
  - "VIP customers" — tag contains 'VIP'
  - "New this month" — first_contact_date in current month
  - "Inactive 90+ days" — last_contact_date > 90 days ago
  - "Frequent buyers" — total_orders >= 5
```

### SMS Sending (Vonage Messages API)

```
sendSMS(to, from, text):
  - Use Vonage Messages API
  - Track delivery status via webhook
  - Handle opt-out: check customer.communication_preference !== 'none'
  - TCPA compliance:
    → Only send during 8am-9pm recipient's timezone
    → Include opt-out instructions: "Reply STOP to unsubscribe"
    → Maintain opt-out list in database
```

### Email Sending (Resend)

```
sendEmail(to, subject, html):
  - Use Resend API
  - Track opens/clicks via webhook
  - Include unsubscribe link
  - From: "Shop Name <notifications@callcontext.ai>"
```

### Pre-Built Templates

```
SMS templates:
  1. "Hi {first_name}! {shop_name} here. {custom_message} Reply STOP to opt out."
  2. "Your {occasion} is coming up on {date}! We'd love to help. Call us at {shop_phone}."
  3. "Thanks for your order! Your {products} will be delivered on {delivery_date}."
  4. "We miss you, {first_name}! Come back and enjoy {offer}. {shop_name}"

Email templates:
  1. Holiday promotion (customizable banner, products, CTA)
  2. Birthday/occasion reminder (personalized, warm tone)
  3. Thank you / post-purchase (order details, review request)
  4. Win-back (personalized offer, "we miss you" tone)
  5. Newsletter (seasonal tips, new products, shop news)
```

### Frontend — Pages & Components

```
app/(dashboard)/
  marketing/
    page.tsx                   — Marketing home: campaigns list + segments
    campaigns/
      new/page.tsx             — Create campaign wizard
      [id]/page.tsx            — Campaign detail with stats
    segments/
      page.tsx                 — Segment list with customer counts
      [id]/page.tsx            — Segment detail: customer list + actions

components/
  marketing/
    CampaignList.tsx           — Table: name, type, status, sent date, stats
    CampaignWizard.tsx         — Step-by-step wizard:
      Step 1: Choose type (SMS or Email)
      Step 2: Select segment (or build new one)
      Step 3: Write message (with template picker)
        → Personalization tokens: {first_name}, {shop_name}, {occasion}, etc.
        → Character count for SMS (160 char limit)
        → Preview on mock phone/email
      Step 4: Schedule or send now
      Step 5: Review & confirm
    SegmentBuilder.tsx         — Visual segment builder:
      "Customers WHERE [tag contains VIP] AND [orders >= 3]"
      → Add/remove conditions
      → Live count: "142 customers match this segment"
    TemplatesPicker.tsx        — Gallery of pre-built templates with preview
    CampaignStats.tsx          — After send: delivered, opened, clicked, opted out
    PersonalizationHelper.tsx  — Dropdown of available tokens with preview
    SMSPreview.tsx             — Mock phone screen with composed message
    EmailPreview.tsx           — Mock email client with composed email
```

### Testing — Week 11

```
Manual tests:
  ✓ Create segment → correct customer count shown
  ✓ Pre-built segments have correct counts
  ✓ Segment builder: add/remove conditions → count updates live
  ✓ Create SMS campaign → select segment → write message → preview looks right
  ✓ Personalization tokens render correctly in preview
  ✓ Send test SMS to your phone → message arrives
  ✓ Send test email to your inbox → email arrives, looks good
  ✓ Character count works for SMS
  ✓ Schedule campaign for future → status shows "scheduled"
  ✓ Campaign stats page shows delivery numbers
  ✓ Opt-out: reply STOP → customer unsubscribed from future messages
```

### Week 11 Deliverable
> Marketing engine: create customer segments with flexible filters, compose SMS/email campaigns with personalization, send or schedule. Pre-built templates for common florist scenarios.

---

## WEEK 12: Orders System + Data Export (30 hrs)

### Backend — API Routes

```
app/api/
  orders/
    route.ts                   — GET: List orders, POST: Create order manually
    [id]/route.ts              — GET: Detail, PATCH: Update status, DELETE
  export/
    customers/route.ts         — GET: Export customers as CSV
    calls/route.ts             — GET: Export calls as CSV
    orders/route.ts            — GET: Export orders as CSV
```

### Frontend — Pages & Components

```
app/(dashboard)/
  orders/page.tsx              — Orders list with filters

components/
  orders/
    OrderList.tsx              — Table: date, customer, products, delivery date, status, amount
    OrderDetail.tsx            — Full order view:
      Products, delivery info, special instructions, linked call
    OrderCreateModal.tsx       — Quick order entry form:
      - Customer picker (search by name/phone)
      - Products (multi-line: name, quantity, price)
      - Delivery date, delivery address
      - Occasion, special instructions
      - Budget/total
    OrderStatusFlow.tsx        — Status badges: Pending → Confirmed → Delivered → Cancelled
    OrderFilters.tsx           — Filter by: status, date range, customer

  export/
    ExportButton.tsx           — "Export CSV" button with loading state
    ExportModal.tsx            — Choose: which data, date range, format
```

### CSV Export Logic

```
GET /api/export/customers?format=csv
  Columns: First Name, Last Name, Phone, Email, Address, Tags,
           Loyalty Tier, Points, Lifetime Value, Total Orders,
           First Contact, Last Contact, Preferences, Important Dates

GET /api/export/calls?from=2024-01-01&to=2024-03-31
  Columns: Date, Customer Name, Phone, Duration, Direction,
           Sentiment, AI Summary, Follow-up Needed

GET /api/export/orders?from=2024-01-01&to=2024-03-31
  Columns: Date, Customer, Products, Delivery Date, Address,
           Occasion, Amount, Status
```

### Testing — Week 12

```
Manual tests:
  ✓ Orders from AI detection appear in orders list
  ✓ Create manual order → appears in list
  ✓ Update order status → badge changes
  ✓ Order linked to call → click to see call detail
  ✓ Order linked to customer → click to see profile
  ✓ Export customers CSV → opens/imports in Excel correctly
  ✓ Export calls CSV → all fields present, dates formatted
  ✓ Export with date filter → correct subset
  ✓ Large export (1000+ rows) → doesn't timeout
```

### Week 12 Deliverable
> Orders management. CSV export of all data. The CRM now tracks the full customer lifecycle: call → entities → order → delivery → follow-up.

---

## WEEK 13: Onboarding Wizard + Settings + Polish (30 hrs)

### Frontend — Onboarding

```
app/(onboarding)/
  layout.tsx                   — Clean layout (no sidebar, just logo + progress)
  step-1/page.tsx              — Shop details: name, address, state, timezone
  step-2/page.tsx              — Phone setup:
    → Auto-explain consent mode based on state selection
    → "Your shop is in California (2-party consent state).
       A brief disclosure will play before each call."
  step-3/page.tsx              — Vonage number:
    → Auto-provision number matching area code
    → Display: "Your CallContext number is (512) 555-0199"
  step-4/page.tsx              — Call forwarding instructions:
    → Detect carrier if possible
    → Show per-carrier steps:
      AT&T: Dial *72 then (512) 555-0199
      Verizon: Dial *72 then (512) 555-0199
      T-Mobile: Settings → Phone → Call Forwarding → Enable → Enter number
    → "Test my connection" button:
      Calls the shop owner's phone via Vonage to verify
  step-5/page.tsx              — Success! Dashboard tour prompt

Backend for onboarding:
  POST /api/onboarding/provision-number
    → Call Vonage API to search and buy a number in shop's area code
    → Save to shops.vonage_number
    → Return number

  POST /api/onboarding/test-call
    → Vonage makes a test call to shop's forwarding number
    → Play: "This is a test call from CallContext. Your setup is working!"
    → Return success/failure
```

### Frontend — Settings

```
app/(dashboard)/
  settings/
    page.tsx                   — Settings tabs:
      General | Phone | Notifications | Billing | Data

components/
  settings/
    GeneralSettings.tsx        — Shop name, address, state, timezone, business hours
    PhoneSettings.tsx          — Vonage number, forwarding number, consent mode, custom greeting
      → Greeting preview: type text, hear TTS preview
    NotificationSettings.tsx   — Toggle: screen pop, push, email digest, reminder alerts
    DataSettings.tsx           — Recording retention (30/60/90/365 days), export, delete account
    BusinessHoursEditor.tsx    — Day-by-day open/close time picker
```

### Polish Tasks

```
This week also includes:
  - Loading skeletons on all pages (not blank screens while data loads)
  - Error boundaries on all routes (graceful error pages)
  - Empty states on all list pages (friendly messages, not blank)
  - Mobile responsive check on EVERY page
  - Toast notifications for all CRUD operations
  - Keyboard shortcuts: Ctrl+K for search, Esc to close modals
  - Page titles and meta tags
  - Favicon and app icons
  - 404 page
```

### Testing — Week 13

```
Full onboarding flow test:
  ✓ New signup → lands on onboarding step 1
  ✓ Fill shop details → next → phone setup displays correct consent info
  ✓ Provision number → real Vonage number assigned
  ✓ Forwarding instructions → correct for selected carrier
  ✓ Test call → phone rings, test message plays
  ✓ Complete onboarding → dashboard with guided tour

Settings tests:
  ✓ Update shop name → reflected everywhere
  ✓ Change forwarding number → next call routes to new number
  ✓ Toggle consent mode → next call uses new mode
  ✓ Custom greeting → preview plays correctly
  ✓ Business hours → save and display correctly
  ✓ Recording retention → setting saves
```

### Week 13 Deliverable
> Polished onboarding that takes a florist from signup to first call in under 5 minutes. Settings page for full customization. Loading states, error handling, and mobile responsiveness across the entire app.

---

### MONTH 3 MILESTONE CHECK

> **The product is now feature-rich and polished.**
> Added this month: Reminders, analytics, tasks, marketing (SMS/email), orders, segments, onboarding, settings.
> **You could put this in front of florists and charge money.**

---

# ═══════════════════════════════════════════
# MONTH 4: BILLING + LOYALTY + INTEGRATIONS
# "Make it a business and make it sticky"
# ═══════════════════════════════════════════

---

## WEEK 14: Stripe Billing (30 hrs)

### Backend

```
app/api/
  billing/
    create-checkout/route.ts   — POST: Create Stripe Checkout session
    portal/route.ts            — POST: Create Stripe Customer Portal session
    webhook/route.ts           — POST: Stripe webhook handler
    usage/route.ts             — GET: Current usage stats
```

### Stripe Integration — Full Logic

```
Plans:
  Starter: $49/mo — 300 calls, basic features
  Pro: $69/mo — 1000 calls, marketing tools, integrations
  Growth: $99/mo — unlimited calls, all features, API access

Trial: 14 days, full Pro access, no credit card required

Webhook events to handle:
  checkout.session.completed    → Activate subscription
  customer.subscription.updated → Plan change (upgrade/downgrade)
  customer.subscription.deleted → Cancellation
  invoice.payment_succeeded     → Record payment
  invoice.payment_failed        → Notify owner, show banner

Usage tracking:
  - Count calls per billing period
  - At 80%: show warning banner
  - At 100%: show upgrade prompt (don't cut off calls — just limit features)
  - At 120%: pause recording (calls still connect)

Trial-to-paid flow:
  - Day 1: Welcome email
  - Day 7: "How's it going?" email with usage stats
  - Day 11: "Trial ending soon" email
  - Day 13: "Last day" email with upgrade CTA
  - Day 14: Trial expires → read-only dashboard, calls still forward but no recording/AI
```

### Frontend

```
app/(dashboard)/
  billing/page.tsx             — Billing page:
    Current plan, usage, payment method, invoices

components/
  billing/
    PlanSelector.tsx           — Compare plans side-by-side
    UsageMeter.tsx             — Visual: "143 / 300 calls used this month"
    TrialBanner.tsx            — "7 days left in trial — Upgrade now"
    UpgradePrompt.tsx          — Upgrade modal with plan comparison
    InvoiceHistory.tsx         — List of past invoices with download links
```

### Testing — Week 14

```
✓ Sign up → 14-day trial starts, Pro features accessible
✓ Upgrade from trial → Stripe Checkout works, plan activates
✓ Downgrade plan → takes effect at next billing cycle
✓ Cancel subscription → access continues until period end
✓ Payment fails → banner shows, email sent
✓ Usage meter shows correct count
✓ Trial emails send at correct intervals
✓ Trial expires → limited access (calls forward, no AI)
✓ Webhook handles all Stripe events correctly
✓ Customer portal: update card, download invoices
```

---

## WEEK 15: Loyalty Program (30 hrs)

### Backend

```
app/api/
  loyalty/
    route.ts                   — GET: Loyalty program settings
                                 PATCH: Update settings (points rate, tier thresholds)
    [customerId]/
      route.ts                 — GET: Customer loyalty details
      adjust/route.ts          — POST: Manually adjust points
    transactions/route.ts      — GET: Loyalty transaction history
    tiers/route.ts             — GET: Tier definitions, customer counts per tier
```

### Loyalty Logic

```
Settings (per shop, configurable):
  points_per_dollar: 1 (default)
  tier_thresholds: { silver: 500, gold: 1500, platinum: 5000 }
  rewards: [
    { points: 250, reward: '$10 off next order' },
    { points: 500, reward: 'Free delivery' },
    { points: 1000, reward: 'Free small arrangement' }
  ]

Auto-earn (when order completed):
  - points = order.total_amount × points_per_dollar
  - INSERT loyalty_transaction (earn, points, order_id)
  - UPDATE customer SET loyalty_points += points
  - Check tier upgrade:
    IF loyalty_points >= tier_thresholds.gold AND loyalty_tier != 'gold':
      UPDATE customer SET loyalty_tier = 'gold'
      → Trigger notification: "Maria Chen reached Gold tier!"

Redeem:
  - Owner manually redeems during call or from profile
  - INSERT loyalty_transaction (redeem, -points, description)
  - UPDATE customer SET loyalty_points -= points
```

### Frontend

```
components/
  loyalty/
    LoyaltySettings.tsx        — Configure points rate, tiers, rewards
    CustomerLoyaltyCard.tsx     — On customer profile:
      ┌──────────────────────────────────┐
      │ ⭐ GOLD MEMBER — 1,240 points    │
      │ ████████████████░░░░ 1240/1500   │
      │ Next tier: Platinum (260 to go)  │
      │                                  │
      │ Available rewards:               │
      │ • $10 off (250 pts) [Redeem]     │
      │ • Free delivery (500 pts) [Redeem]│
      │                                  │
      │ [+Adjust points] [View history]  │
      └──────────────────────────────────┘
    LoyaltyBadge.tsx           — Inline badge: "⭐ Gold" (for use in customer list, screen pop)
    LoyaltyDashboardWidget.tsx — "12 customers near tier upgrade this month"
    PointsHistoryTable.tsx     — Transaction history: earn/redeem/adjust with dates

Update screen pop:
  - Include loyalty tier and points in screen pop notification
  - "Maria Chen — ⭐ Gold (1,240 pts) — anniversary coming up"

Update customer list:
  - Add loyalty tier column (sortable)
  - Filter by tier
```

### Testing — Week 15

```
✓ Configure loyalty settings → saves correctly
✓ Complete an order → points auto-earned
✓ Points calculation correct (amount × rate)
✓ Tier auto-upgrade when threshold hit
✓ Redeem points → balance decreases, transaction logged
✓ Loyalty badge shows on customer profile, list, screen pop
✓ Manual adjust points (admin correction) → works
✓ Customer near tier upgrade → shows progress bar
✓ Loyalty disabled → no points earned, UI hidden
```

---

## WEEK 16: Google Calendar + Square POS Integration (30 hrs)

### Backend

```
app/api/
  integrations/
    route.ts                   — GET: List connected integrations
    google-calendar/
      connect/route.ts         — GET: OAuth redirect to Google
      callback/route.ts        — GET: OAuth callback, save tokens
      sync/route.ts            — POST: Push reminders/deliveries to calendar
      disconnect/route.ts      — POST: Revoke tokens, disconnect
    square/
      connect/route.ts         — GET: OAuth redirect to Square
      callback/route.ts        — GET: OAuth callback, save tokens
      sync/route.ts            — POST: Pull orders from Square, match to customers
      disconnect/route.ts      — POST: Disconnect
```

### Google Calendar Integration

```
OAuth 2.0 flow:
  1. Owner clicks "Connect Google Calendar" → redirect to Google consent
  2. Google redirects back with auth code
  3. Exchange code for access + refresh tokens
  4. Save encrypted tokens to integrations table

Sync logic (push):
  - When reminder created/updated → create/update Google Calendar event
  - When delivery date set on order → create calendar event
  - Event title: "🌸 [Customer Name] — [Occasion/Delivery]"
  - Event description: order details, customer phone

Sync triggers:
  - Real-time: when reminders or orders change
  - Manual: "Sync now" button
  - No pull needed (we're the source of truth)
```

### Square POS Integration

```
OAuth 2.0 flow (same pattern as Google)

Sync logic (pull):
  - Periodic sync (every 15 minutes or manual)
  - Pull recent transactions from Square
  - Match to customers by:
    1. Phone number (if Square has customer phone)
    2. Name match (fuzzy)
    3. Amount match + time proximity to call (within 2 hours)
  - When matched:
    → Update order with actual amount from Square
    → Award loyalty points based on actual transaction amount
    → Update customer lifetime_value

Dashboard display:
  - Integration status: "Connected to Square — Last synced 5 min ago"
  - Matched orders: "23 Square transactions matched to call orders this month"
  - Unmatched: "5 transactions couldn't be matched — Review →"
```

### Frontend

```
app/(dashboard)/
  settings/
    integrations/page.tsx      — Integrations page:
      ┌──────────────────────────────────┐
      │ INTEGRATIONS                      │
      │                                   │
      │ 📅 Google Calendar   [Connected ✓]│
      │    Last sync: 2 min ago           │
      │    [Sync now] [Disconnect]        │
      │                                   │
      │ 💳 Square POS       [Connect →]   │
      │    Match orders to call customers │
      │                                   │
      │ 📧 Mailchimp        [Coming soon] │
      │ 📊 QuickBooks       [Coming soon] │
      │ ⚡ Zapier           [Coming soon] │
      └──────────────────────────────────┘
```

### Testing — Week 16

```
Google Calendar:
  ✓ Connect → OAuth flow completes, tokens saved
  ✓ Create reminder → event appears in Google Calendar
  ✓ Update reminder → calendar event updates
  ✓ Delete reminder → calendar event removed
  ✓ Disconnect → tokens revoked, events stop syncing

Square:
  ✓ Connect → OAuth flow completes
  ✓ Manual sync → pulls recent transactions
  ✓ Transaction matched to customer → order updated with real amount
  ✓ Loyalty points awarded from Square amount
  ✓ Unmatched transactions listed for review
  ✓ Disconnect → stops syncing
```

---

## WEEK 17: Webhooks + API Foundation (30 hrs)

### Backend

```
app/api/
  v1/                          — Public API namespace
    customers/route.ts         — CRUD (API key auth)
    calls/route.ts             — Read-only (API key auth)
    reminders/route.ts         — CRUD (API key auth)
    orders/route.ts            — CRUD (API key auth)
  webhooks/
    route.ts                   — GET: List endpoints, POST: Create endpoint
    [id]/route.ts              — PATCH/DELETE endpoint
    test/route.ts              — POST: Send test webhook
  settings/
    api-keys/route.ts          — GET: List keys, POST: Generate new key, DELETE: Revoke
```

### API Key Auth

```
Middleware:
  - Check for `X-API-Key` header or `api_key` query param
  - Look up key in api_keys table
  - Verify key is active and not expired
  - Rate limit: 100 requests/minute per key
  - Attach shop_id to request context
  - Log API call to audit table

Key generation:
  - Format: `cc_live_` + 32 random chars (e.g., cc_live_a1b2c3d4...)
  - Hash stored in DB (never store plain text after creation)
  - Show key once on creation, never again
```

### Webhook System

```
Events:
  call.started        — when call begins
  call.completed      — when call ends (includes summary)
  customer.created    — new customer auto-created
  customer.updated    — profile changed
  order.created       — new order (auto or manual)
  reminder.due        — reminder is due today

Delivery:
  - POST to registered URL with JSON payload
  - Include signature header: X-CallContext-Signature (HMAC-SHA256)
  - Retry: 3 attempts with exponential backoff (1s, 10s, 60s)
  - Log all deliveries with status code and response

Payload format:
  {
    "event": "call.completed",
    "timestamp": "2024-03-05T15:42:00Z",
    "shop_id": "...",
    "data": { ...event-specific data }
  }
```

### Frontend

```
components/
  api/
    ApiKeyManager.tsx          — List keys, generate new, revoke
    WebhookManager.tsx         — List endpoints, create, test, view delivery log
    ApiDocsLink.tsx            — Link to API documentation (build docs in week 18)
```

### Testing — Week 17

```
✓ Generate API key → shown once, works for auth
✓ API call with key → returns correct data, scoped to shop
✓ API call without key → 401
✓ Rate limiting → 429 after 100 requests/minute
✓ Create webhook endpoint → saved
✓ Make a call → webhook fires to registered URL
✓ Test webhook button → sends test payload
✓ Webhook delivery log shows attempts and response codes
✓ Failed webhook → retries 3 times
✓ Signature verification → correct HMAC
```

---

## WEEK 18: Landing Page + Automation Rules MVP (30 hrs)

### Landing Page (15 hrs)

```
app/(marketing)/
  page.tsx                     — Landing page (public, no auth)
  pricing/page.tsx             — Pricing page with plan comparison
  layout.tsx                   — Marketing layout (different header/footer)

Sections:
  1. Hero: headline, subhead, CTA, hero image/animation
  2. Problem: "You're losing customers because you can't remember them"
  3. Solution: 3-feature blocks with screenshots
  4. How it works: 3 steps (sign up, forward calls, watch the magic)
  5. Live demo: embedded video or GIF of live call view
  6. Pricing: 3 plan cards
  7. Testimonials: (placeholder for beta feedback)
  8. FAQ: common questions
  9. Footer: CTA, links, legal
```

### Automation Rules Engine MVP (15 hrs)

```
app/api/
  automations/
    route.ts                   — GET: List rules, POST: Create rule
    [id]/route.ts              — PATCH/DELETE rule
    process/route.ts           — POST: Cron-triggered, evaluate rules

Pre-built automations (toggle on/off, no custom builder yet):
  1. "Welcome new customer" — When first call ends → send SMS
  2. "Post-delivery follow-up" — 2 days after delivery_date → send SMS
  3. "Birthday reminder outreach" — 14 days before birthday → send email
  4. "Win-back inactive customer" — 90 days no contact → send email
  5. "Review request" — After positive call → send SMS with Google Review link
  6. "Follow-up task" — After call with follow_up_needed → create task

Rule structure:
  {
    "trigger": "call.completed",
    "conditions": [{ "field": "sentiment", "op": "eq", "value": "positive" }],
    "action": "send_sms",
    "action_config": { "template": "review_request" },
    "delay_minutes": 2880,  // 2 days
    "enabled": true
  }

Processing:
  - Cron runs every 15 minutes
  - Checks for rules with pending triggers
  - Evaluates conditions
  - Executes action (or schedules for later if delayed)
```

### Frontend

```
app/(dashboard)/
  automations/page.tsx         — Automation rules list (toggle on/off)

components/
  automations/
    AutomationsList.tsx        — List of pre-built rules with on/off toggles
    AutomationCard.tsx         — Single rule card:
      ┌──────────────────────────────────┐
      │ 📨 Welcome new customer    [ON]   │
      │ When: First call completed        │
      │ Action: Send SMS with welcome msg │
      │ Sent: 23 times this month         │
      │ [Edit message] [View history]     │
      └──────────────────────────────────┘
```

### Testing — Week 18

```
Landing page:
  ✓ Loads fast (<2s)
  ✓ CTA → navigates to signup
  ✓ Pricing → shows correct plans
  ✓ Mobile responsive
  ✓ SEO: meta tags, OG images

Automations:
  ✓ Toggle automation on → works
  ✓ New customer call → welcome SMS sent (if enabled)
  ✓ Positive call → review request SMS sent (if enabled, after delay)
  ✓ Automation off → no messages sent
  ✓ View automation history → shows sent messages
```

---

### MONTH 4 MILESTONE CHECK

> **The product is now a real business.**
> Added: Billing (Stripe), loyalty program, Google Calendar + Square integrations, webhooks + API, automation rules, landing page.
> **You can charge money. The product is sticky (integrations + loyalty + automations make it hard to leave).**

---

# ═══════════════════════════════════════════
# MONTH 5: BETA LAUNCH → PAYING CUSTOMERS
# "Put it in front of real florists and close deals"
# ═══════════════════════════════════════════

---

## WEEK 19: Security Hardening + Performance (30 hrs)

```
Security:
  - Auth: verify all API routes check auth, RLS enabled on all tables
  - Input validation: zod schemas on every API input
  - Rate limiting: all public endpoints (100/min authenticated, 20/min public)
  - API keys: hashed storage, rate limited
  - Recording encryption: verify Supabase Storage encryption at rest
  - Webhook signatures: verify HMAC implementation
  - XSS: verify React escapes all user input
  - CSRF: verify Supabase auth uses httpOnly cookies
  - Headers: add security headers (CSP, HSTS, X-Frame-Options)
  - Secrets: verify no API keys in client-side code
  - SQL injection: verify all queries use parameterized queries (Supabase does this)
  - Error messages: verify no stack traces leaked to client

Performance:
  - Database: add missing indexes, analyze slow queries
  - Frontend: lazy load heavy pages (analytics, marketing)
  - Images: next/image optimization
  - WebSocket: connection pooling, memory leak check
  - Caching: add cache headers on static assets
  - Bundle size: analyze and reduce
  - Lighthouse audit: aim for 90+ on all scores

Monitoring:
  - Sentry: error tracking on frontend + backend + Railway server
  - PostHog: analytics on key user actions
  - Uptime monitoring: set up for Vercel + Railway
  - Alerts: Sentry → Slack/email for critical errors
```

### Testing — Week 19

```
✓ Full security checklist (above) passes
✓ Lighthouse score > 90
✓ No console errors in production
✓ Sentry captures test error correctly
✓ PostHog tracks page views and key actions
✓ Load test: 10 simultaneous calls → no crashes
✓ Memory: Railway server stable after 24 hours
```

---

## WEEK 20: Beta Onboarding — 5 Florists (30 hrs)

```
This week is 50% code, 50% people:

Pre-beta prep (code):
  - Fix every known bug
  - Add "feedback" button in dashboard → sends to your email
  - Add "help" chat widget (Intercom free tier or simple email form)
  - Create a "getting started" checklist on dashboard home
  - Ensure onboarding flow is smooth (do it yourself 3x)

Beta recruitment:
  - Reach out to 15 florists (from discovery interviews, Facebook groups, local shops)
  - Offer: "Free for 3 months, I just need your feedback"
  - Goal: 5 say yes, 3 actually complete setup

Per-florist onboarding (budget 2 hrs each):
  - Personal call: walk through signup + setup
  - Verify their calls are routing correctly
  - Stay on while they receive their first real call
  - Show them the dashboard after the call
  - Set up their custom greeting if 2-party state
  - Set expectations: "I'll check in daily for the first week"

Daily monitoring (for each beta shop):
  - Check Sentry for errors related to their shop
  - Check their call logs — are calls flowing?
  - Check transcription quality — any issues?
  - Quick text or call: "How's it going? Any issues?"
```

---

## WEEK 21: Iterate on Beta Feedback (30 hrs)

```
Based on beta feedback (you won't know specifics until week 20, but common patterns):

Expected fixes:
  - Transcription accuracy for florist terms → add more keywords to Deepgram
  - UI confusion → simplify navigation based on what confused them
  - Missing feature they expected → quick build if < 4 hours, else backlog
  - Mobile experience → fix the top 3 mobile issues they found
  - Speed issues → optimize the queries/pages they use most

Expected feature requests (build 1-2):
  - "Can I see this on my phone when I'm not at the computer?" → improve mobile + push
  - "Can I text the customer right from here?" → quick SMS from profile
  - "Can I see daily revenue?" → add revenue estimate to analytics
  - "The greeting sounds robotic" → allow audio file upload for greeting

Spend this week:
  - 15 hrs fixing bugs and top issues
  - 10 hrs building 1-2 quick features they asked for
  - 5 hrs improving the 3 screens they use most
```

---

## WEEK 22: Convert to Paid + Public Launch Prep (30 hrs)

```
Convert beta users:
  - Call each beta florist personally
  - Show them their stats: "You've had 87 calls, 23 new customers captured,
    12 reminders auto-created. Without CallContext, all of that would be lost."
  - Offer: "Starter plan at $49/mo. You've been using Pro features —
    upgrade to $69/mo to keep them."
  - Goal: 3-5 paying customers

Public launch prep:
  - Polish landing page with real beta testimonials
  - Set up PostHog analytics dashboard for key metrics
  - Write launch post for florist Facebook groups
  - Create 2-minute demo video (screen recording + voiceover)
  - Set up Calendly for demo calls
  - Prepare "launch week" email to waitlist
  - Submit to relevant directories (florist industry sites, SaaS directories)

Operations setup:
  - Support email: support@callcontext.ai
  - Knowledge base: 10 help articles covering setup, features, billing
  - Status page: simple uptime page
  - Backup: verify Supabase daily backups enabled
  - Runbook: document how to handle common issues
```

---

### MONTH 5 — FINAL DELIVERABLE

> **5 paying customers.** Real florists using CallContext every day to manage their customer relationships. Real revenue. Real product-market fit signal.

---

# ═══════════════════════════════════════════
# POST-LAUNCH BACKLOG (MONTH 6+)
# Full vision features not yet built
# ═══════════════════════════════════════════

### CRM Depth
- [ ] Household/company grouping
- [ ] Customer merge tool (advanced duplicate detection)
- [ ] Communication preference enforcement
- [ ] Customer photo/avatar

### Marketing Power
- [ ] Drag-and-drop email builder
- [ ] Automated drip sequences
- [ ] A/B testing
- [ ] AI-generated marketing copy
- [ ] Social media post generator
- [ ] Promotional flyer generator
- [ ] Printable coupon generator

### Loyalty Advanced
- [ ] Digital loyalty card (Apple/Google Wallet)
- [ ] QR code check-in
- [ ] Referral points program
- [ ] Double points events

### Integrations
- [ ] Mailchimp export
- [ ] QuickBooks/Xero sync
- [ ] Shopify integration
- [ ] Clover POS
- [ ] WhatsApp Business
- [ ] Slack notifications
- [ ] Zapier connector
- [ ] Google Reviews auto-request
- [ ] Delivery routing (Google Maps)

### Phone Features
- [ ] Multi-line support
- [ ] Outbound click-to-call
- [ ] Voicemail transcription
- [ ] Call queue with hold music
- [ ] IVR menu builder
- [ ] Business hours routing

### AI Advanced
- [ ] Natural language search
- [ ] Conversation coaching
- [ ] Demand forecasting
- [ ] Inventory suggestions
- [ ] Pricing insights
- [ ] Multi-language support (Spanish)

### Platform
- [ ] Multi-user team access with roles
- [ ] Audit log
- [ ] Custom automation builder (visual)
- [ ] Vertical expansion templates (bakeries, salons)
- [ ] White-label option
- [ ] Mobile native app (iOS/Android)

---

## FULL FEATURE TRACKING MATRIX

| # | Feature | Week Built | Status |
|---|---------|-----------|--------|
| 1 | Database schema (all tables) | Week 1 | MVP |
| 2 | Auth (signup/login/reset) | Week 1 | MVP |
| 3 | Dashboard shell | Week 1 | MVP |
| 4 | Deploy (Vercel + Railway) | Week 1 | MVP |
| 5 | Vonage inbound call routing | Week 2 | MVP |
| 6 | State-based consent | Week 2 | MVP |
| 7 | Call recording + storage | Week 2 | MVP |
| 8 | Screen pop notification | Week 2 | MVP |
| 9 | Call list page | Week 2 | MVP |
| 10 | Customer list + search + tags | Week 3 | MVP |
| 11 | Customer profile page | Week 3 | MVP |
| 12 | Caller ID with full context | Week 3 | MVP |
| 13 | Notes on customer profiles | Week 3 | MVP |
| 14 | Call detail page | Week 4 | MVP |
| 15 | Audio player (recording playback) | Week 4 | MVP |
| 16 | Call filters | Week 4 | MVP |
| 17 | WebSocket audio server (Railway) | Week 5 | MVP |
| 18 | Dashboard WebSocket connection | Week 5 | MVP |
| 19 | Deepgram live transcription | Week 6 | MVP |
| 20 | Live transcript view | Week 6 | MVP |
| 21 | Speaker diarization | Week 6 | MVP |
| 22 | Real-time entity extraction | Week 7 | MVP |
| 23 | Post-call AI analysis | Week 7 | MVP |
| 24 | Auto-update customer profiles | Week 7 | MVP |
| 25 | Auto-create orders from calls | Week 7 | MVP |
| 26 | Auto-create reminders from calls | Week 7 | MVP |
| 27 | Auto-create follow-up tasks | Week 7 | MVP |
| 28 | Smart reminders system | Week 8 | MVP |
| 29 | Daily email digest | Week 8 | MVP |
| 30 | Dashboard home page | Week 8 | MVP |
| 31 | Analytics dashboard | Week 9 | MVP |
| 32 | Call volume charts | Week 9 | MVP |
| 33 | Customer growth charts | Week 9 | MVP |
| 34 | Sentiment breakdown | Week 9 | MVP |
| 35 | Tasks system (kanban) | Week 10 | MVP |
| 36 | Activity feed | Week 10 | MVP |
| 37 | Customer segments | Week 11 | MVP |
| 38 | SMS campaigns | Week 11 | MVP |
| 39 | Email campaigns | Week 11 | MVP |
| 40 | Pre-built templates | Week 11 | MVP |
| 41 | Orders management | Week 12 | MVP |
| 42 | CSV export (all data) | Week 12 | MVP |
| 43 | Onboarding wizard | Week 13 | MVP |
| 44 | Settings page | Week 13 | MVP |
| 45 | UI polish + mobile responsive | Week 13 | MVP |
| 46 | Stripe billing | Week 14 | MVP |
| 47 | Trial management | Week 14 | MVP |
| 48 | Loyalty program (points + tiers) | Week 15 | MVP |
| 49 | Google Calendar integration | Week 16 | MVP |
| 50 | Square POS integration | Week 16 | MVP |
| 51 | Webhooks system | Week 17 | MVP |
| 52 | Public REST API | Week 17 | MVP |
| 53 | API key management | Week 17 | MVP |
| 54 | Landing page | Week 18 | MVP |
| 55 | Automation rules (pre-built) | Week 18 | MVP |
| 56 | Security hardening | Week 19 | MVP |
| 57 | Performance optimization | Week 19 | MVP |
| 58 | Monitoring (Sentry + PostHog) | Week 19 | MVP |
| 59 | Beta onboarding (5 florists) | Week 20 | MVP |
| 60 | Beta feedback iteration | Week 21 | MVP |
| 61 | Paid conversion + launch | Week 22 | MVP |

**Total: 61 features in 22 weeks → paying customers.**
