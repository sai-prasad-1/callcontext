# CallContext — Project Setup Guide
## From zero to running app in 1 hour

---

## Project Structure — Monorepo

```
callcontext/                    — Project root (workspace)
├── docs/                       — All project documentation (read-only reference)
│   ├── architecture.md
│   ├── design-system.md
│   ├── engineering-plan.md
│   ├── features.md
│   └── project-setup.md        — This file
├── cursorrules                  — Cursor AI rules for the project
│
├── callcontext-frontend/       — Next.js application (deploys to Vercel)
│   ├── app/                    — Next.js App Router (pages + API routes)
│   ├── components/             — React components
│   ├── lib/                    — Shared utilities, hooks, types
│   ├── public/                 — Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   ├── eslint.config.mjs
│   ├── next.config.ts
│   └── middleware.ts           — Auth middleware (created in Step 5)
│
├── backend/                    — WebSocket server (deploys to Railway) — created later
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
└── supabase/                   — Database migrations — created later
    └── migrations/
```

---

## Step 0: Prerequisites

Install these before anything else:
```bash
node --version    # Need 18.17+  (use nvm if needed: nvm install 20)
npm --version     # Comes with node
git --version     # Any recent version
```

Get accounts (all free to start):
- [ ] Supabase (supabase.com) — create project, save URL + anon key + service role key
- [ ] Vercel (vercel.com) — connect GitHub
- [ ] Vonage (vonage.com) — create app, get API key + secret, buy a number ($0.99)
- [ ] Deepgram (deepgram.com) — get API key (free $200 credit)
- [ ] OpenAI (platform.openai.com) — get API key
- [ ] Stripe (stripe.com) — get test mode keys
- [ ] Resend (resend.com) — get API key
- [ ] Sentry (sentry.io) — create project, get DSN

---

## Step 1: Create the Project

The frontend app already exists at `callcontext-frontend/`. If starting fresh:

```bash
# From the callcontext/ root directory
npx create-next-app@latest callcontext-frontend --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

This scaffolds a Next.js project with:
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5** (strict mode)
- **Tailwind CSS v4** (via PostCSS plugin `@tailwindcss/postcss`)
- **ESLint 9** with `eslint-config-next`

### Install Additional Dependencies

```bash
cd callcontext-frontend

# Core application dependencies
npm install @supabase/supabase-js @supabase/ssr        # Supabase client + SSR helpers
npm install swr                                         # Client data fetching + caching
npm install zod                                         # Input validation
npm install lucide-react                                # Icons (Lucide only — no other icon libs)
npm install recharts                                    # Charts for analytics
npm install nanoid                                      # ID generation
npm install date-fns                                    # Date formatting
npm install @stripe/stripe-js stripe                    # Payments
npm install resend                                      # Transactional email
npm install @sentry/nextjs                              # Error tracking

# Dev dependencies
npm install -D @types/node prettier prettier-plugin-tailwindcss
npm install -D supabase                                 # CLI for types generation
```

### Current `package.json` State

```json
{
  "name": "callcontext-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "next": "16.2.1",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.1",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

The additional dependencies listed above still need to be installed.

---

## Step 2: Environment Variables

Create `.env.local` inside `callcontext-frontend/`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# Vonage
VONAGE_API_KEY=your-api-key
VONAGE_API_SECRET=your-api-secret
VONAGE_APPLICATION_ID=your-app-id
VONAGE_PRIVATE_KEY_PATH=./private.key

# Deepgram (used by Railway server, not Next.js — placed here for reference)
DEEPGRAM_API_KEY=your-deepgram-key

# OpenAI (used by Railway server, not Next.js — placed here for reference)
OPENAI_API_KEY=your-openai-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Resend
RESEND_API_KEY=re_...

# Sentry
SENTRY_DSN=https://...@sentry.io/...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
RAILWAY_HOST=your-app.railway.app
```

The existing `.gitignore` already ignores `.env*` files.

---

## Step 3: Tailwind CSS v4 Configuration

### How Tailwind v4 Works (Different from v3)

Tailwind CSS v4 does **NOT** use a `tailwind.config.ts` file. Instead:
- Configuration lives directly in your CSS via `@theme` blocks
- The PostCSS plugin `@tailwindcss/postcss` handles processing
- Custom colors, fonts, spacing, etc. are defined as CSS theme variables

The project already has the correct PostCSS setup in `postcss.config.mjs`:

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### Replace `app/globals.css` with the CallContext Design System

Replace the default `callcontext-frontend/app/globals.css` with:

```css
@import "tailwindcss";

/* ─── CallContext Design System ─── */
/* Fonts loaded via next/font in layout.tsx for performance */

@theme inline {
  /* Brand — Deep teal/green: trust, growth, nature */
  --color-brand-50:  #E8F5F0;
  --color-brand-100: #C8E6D8;
  --color-brand-200: #9BD4BC;
  --color-brand-300: #6BBF9E;
  --color-brand-400: #42A883;
  --color-brand-500: #2D8F6F;
  --color-brand-600: #247558;
  --color-brand-700: #1B5B43;
  --color-brand-800: #13412F;
  --color-brand-900: #0B281D;

  /* Accent — Soft amber/gold: warmth, delight, attention */
  --color-accent-50:  #FFF8EB;
  --color-accent-100: #FEECC0;
  --color-accent-200: #FDD889;
  --color-accent-300: #FCC44F;
  --color-accent-400: #F5AD1F;
  --color-accent-500: #D99512;
  --color-accent-600: #B5780E;
  --color-accent-700: #8E5C0B;
  --color-accent-800: #674108;
  --color-accent-900: #3F2704;

  /* Warm neutrals (NOT cool blue-grays) */
  --color-warm-25:  #FCFCFB;
  --color-warm-50:  #F9F8F6;
  --color-warm-100: #F3F1ED;
  --color-warm-150: #EBE9E3;
  --color-warm-200: #E0DDD5;
  --color-warm-300: #CBC7BC;
  --color-warm-400: #A9A49A;
  --color-warm-500: #858078;
  --color-warm-600: #666259;
  --color-warm-700: #4A473F;
  --color-warm-800: #2E2C27;
  --color-warm-900: #1A1917;

  /* Semantic status colors */
  --color-success-50:  #ECFDF5;
  --color-success-500: #10B981;
  --color-success-700: #047857;

  --color-warning-50:  #FFFBEB;
  --color-warning-500: #F59E0B;
  --color-warning-700: #B45309;

  --color-danger-50:  #FEF2F2;
  --color-danger-500: #EF4444;
  --color-danger-700: #B91C1C;

  --color-info-50:  #EFF6FF;
  --color-info-500: #3B82F6;
  --color-info-700: #1D4ED8;

  /* Typography — loaded via next/font, CSS variables set in layout.tsx */
  --font-sans: var(--font-dm-sans), system-ui, sans-serif;
  --font-display: var(--font-outfit), system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), monospace;

  /* Border radius */
  --radius-sm:  4px;
  --radius-md:  6px;
  --radius-lg:  8px;
  --radius-xl:  12px;
  --radius-2xl: 16px;

  /* Shadows — subtle, warm-toned */
  --shadow-xs:  0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm:  0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md:  0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.04);
  --shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.06), 0 4px 6px rgba(0, 0, 0, 0.04);
  --shadow-xl:  0 20px 25px rgba(0, 0, 0, 0.08), 0 8px 10px rgba(0, 0, 0, 0.04);

  /* Animations */
  --animate-pulse-dot: pulse-dot 2s ease-in-out infinite;
  --animate-fade-in: fadeIn 200ms ease-out;
  --animate-fade-in-up: fadeInUp 200ms ease-out;
  --animate-slide-in-right: slideInRight 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
  --animate-slide-in-top: slideInTop 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
  --animate-shimmer: shimmer 1.5s ease-in-out infinite;
}

/* Keyframes */
@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50%      { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes slideInTop {
  from { opacity: 0; transform: translateY(-100%); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Base layer */
@layer base {
  body {
    @apply bg-warm-50 text-warm-700 antialiased;
  }

  html {
    scroll-behavior: smooth;
  }

  *:focus-visible {
    @apply outline-none ring-2 ring-brand-500 ring-offset-2;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

### Key Differences from Tailwind v3

| Tailwind v3 | Tailwind v4 |
|-------------|-------------|
| `tailwind.config.ts` with JS object | `@theme inline { }` block in CSS |
| `@tailwind base; @tailwind components; @tailwind utilities;` | `@import "tailwindcss";` |
| `theme.extend.colors.brand` | `--color-brand-500: #2D8F6F;` |
| `theme.extend.fontFamily.sans` | `--font-sans: var(--font-dm-sans), ...;` |
| `theme.extend.boxShadow.md` | `--shadow-md: ...;` |
| `theme.extend.animation` | `--animate-fade-in: fadeIn 200ms ease-out;` |
| PostCSS plugin: `tailwindcss` | PostCSS plugin: `@tailwindcss/postcss` |

Usage in components stays the same: `className="bg-brand-500 text-white shadow-md"`.

---

## Step 4: Layout + Fonts

Replace `callcontext-frontend/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { DM_Sans, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CallContext — Call Intelligence CRM",
  description:
    "Real-time call intelligence for small businesses. Auto-transcribe calls, extract customer data, and build relationships effortlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${outfit.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

**Why `next/font`?** Google Fonts loaded via `next/font` are self-hosted at build time — zero layout shift, no external network requests, better Core Web Vitals than a CSS `@import url(...)`.

---

## Step 5: Supabase Client Setup

Create `callcontext-frontend/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

Create `callcontext-frontend/lib/supabase/server.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  );
}
```

Create `callcontext-frontend/lib/supabase/middleware.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/")) {
    const isPublicPath = [
      "/login",
      "/signup",
      "/forgot-password",
      "/reset-password",
      "/api/",
      "/pricing",
    ].some((path) => request.nextUrl.pathname.startsWith(path));
    const isRootOrMarketing =
      request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname === "/pricing";

    if (!isPublicPath && !isRootOrMarketing) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
```

Create `callcontext-frontend/middleware.ts` (project root of the frontend app):
```typescript
import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

## Step 6: Utility Files

Create `callcontext-frontend/lib/utils/formatting.ts`:
```typescript
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}yr ago`;
}

export function getInitials(
  firstName?: string | null,
  lastName?: string | null
): string {
  const f = firstName?.[0]?.toUpperCase() || "";
  const l = lastName?.[0]?.toUpperCase() || "";
  return f + l || "?";
}

export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}
```

Create `callcontext-frontend/lib/utils/constants.ts`:
```typescript
export const TWO_PARTY_STATES = new Set([
  "CA", "CT", "DE", "FL", "IL", "MD", "MA", "MT",
  "NV", "NH", "PA", "WA", "MI", "VT",
]);

export const PLAN_LIMITS = {
  trial:   { calls: 1000, name: "Trial",   price: 0 },
  starter: { calls: 300,  name: "Starter", price: 4900 },
  pro:     { calls: 1000, name: "Pro",     price: 6900 },
  growth:  { calls: -1,   name: "Growth",  price: 9900 },
} as const;

export const SENTIMENT_CONFIG = {
  positive: { label: "Positive", color: "text-success-700", bg: "bg-success-50" },
  neutral:  { label: "Neutral",  color: "text-warning-700", bg: "bg-warning-50" },
  negative: { label: "Negative", color: "text-danger-700",  bg: "bg-danger-50" },
} as const;

export const NAV_ITEMS = [
  { label: "Dashboard",  href: "/",           icon: "LayoutDashboard" },
  { label: "Calls",      href: "/calls",      icon: "Phone" },
  { label: "Customers",  href: "/customers",  icon: "Users" },
  { label: "Orders",     href: "/orders",     icon: "ShoppingBag" },
  { label: "Reminders",  href: "/reminders",  icon: "Bell" },
  { label: "Tasks",      href: "/tasks",      icon: "CheckSquare" },
  { label: "Marketing",  href: "/marketing",  icon: "Megaphone" },
  { label: "Analytics",  href: "/analytics",  icon: "BarChart3" },
] as const;

export const NAV_BOTTOM = [
  { label: "Automations", href: "/automations", icon: "Zap" },
  { label: "Settings",    href: "/settings",    icon: "Settings" },
] as const;
```

---

## Step 7: Folder Scaffold

Run these from inside `callcontext-frontend/`:

```bash
cd callcontext-frontend

# App routes — Auth (public, no sidebar)
mkdir -p "app/(auth)/login"
mkdir -p "app/(auth)/signup"
mkdir -p "app/(auth)/forgot-password"
mkdir -p "app/(auth)/reset-password"

# App routes — Dashboard (protected, sidebar layout)
mkdir -p "app/(dashboard)/calls/[id]"
mkdir -p "app/(dashboard)/calls/live/[callId]"
mkdir -p "app/(dashboard)/customers/[id]"
mkdir -p "app/(dashboard)/orders"
mkdir -p "app/(dashboard)/reminders"
mkdir -p "app/(dashboard)/tasks"
mkdir -p "app/(dashboard)/marketing/campaigns/new"
mkdir -p "app/(dashboard)/marketing/campaigns/[id]"
mkdir -p "app/(dashboard)/marketing/segments"
mkdir -p "app/(dashboard)/analytics"
mkdir -p "app/(dashboard)/automations"
mkdir -p "app/(dashboard)/settings/integrations"
mkdir -p "app/(dashboard)/billing"

# App routes — Onboarding (wizard, no sidebar)
mkdir -p "app/(onboarding)/step-1"
mkdir -p "app/(onboarding)/step-2"
mkdir -p "app/(onboarding)/step-3"
mkdir -p "app/(onboarding)/step-4"
mkdir -p "app/(onboarding)/step-5"

# App routes — Marketing site (public)
mkdir -p "app/(marketing)/pricing"

# API routes
mkdir -p app/api/auth/signup
mkdir -p app/api/auth/callback
mkdir -p app/api/vonage/answer
mkdir -p app/api/vonage/event
mkdir -p app/api/vonage/recording
mkdir -p "app/api/customers/[id]/notes"
mkdir -p app/api/customers/search
mkdir -p "app/api/calls/[id]/recording"
mkdir -p "app/api/orders/[id]"
mkdir -p "app/api/reminders/[id]"
mkdir -p app/api/reminders/upcoming
mkdir -p app/api/reminders/process
mkdir -p "app/api/tasks/[id]"
mkdir -p app/api/activity
mkdir -p "app/api/campaigns/[id]/send"
mkdir -p "app/api/campaigns/[id]/preview"
mkdir -p "app/api/segments/[id]/customers"
mkdir -p app/api/templates
mkdir -p app/api/analytics/calls
mkdir -p app/api/analytics/customers
mkdir -p app/api/analytics/overview
mkdir -p "app/api/loyalty/[customerId]/adjust"
mkdir -p app/api/loyalty/transactions
mkdir -p "app/api/automations/[id]"
mkdir -p app/api/automations/process
mkdir -p app/api/integrations/google-calendar/connect
mkdir -p app/api/integrations/google-calendar/callback
mkdir -p app/api/integrations/square/connect
mkdir -p app/api/integrations/square/callback
mkdir -p app/api/billing/create-checkout
mkdir -p app/api/billing/portal
mkdir -p app/api/billing/webhook
mkdir -p app/api/billing/usage
mkdir -p app/api/export/customers
mkdir -p app/api/export/calls
mkdir -p app/api/export/orders
mkdir -p app/api/onboarding/provision-number
mkdir -p app/api/onboarding/test-call
mkdir -p "app/api/webhooks/[id]"
mkdir -p app/api/webhooks/test
mkdir -p app/api/v1/customers
mkdir -p app/api/v1/calls
mkdir -p app/api/v1/reminders
mkdir -p app/api/v1/orders
mkdir -p app/api/cron/daily-digest
mkdir -p app/api/settings/api-keys

# Components
mkdir -p components/ui
mkdir -p components/layout
mkdir -p components/auth
mkdir -p components/calls
mkdir -p components/customers
mkdir -p components/orders
mkdir -p components/reminders
mkdir -p components/tasks
mkdir -p components/analytics
mkdir -p components/marketing
mkdir -p components/loyalty
mkdir -p components/settings
mkdir -p components/billing
mkdir -p components/activity
mkdir -p components/automations
mkdir -p components/dashboard
mkdir -p components/export
mkdir -p components/api

# Lib
mkdir -p lib/supabase
mkdir -p lib/vonage
mkdir -p lib/stripe
mkdir -p lib/hooks
mkdir -p lib/types
mkdir -p lib/utils

echo "Frontend folder structure created!"
```

Then, from the workspace root (`callcontext/`), create the backend and database scaffolds:

```bash
cd ..

# Backend (Railway WebSocket server) — separate Node.js project
mkdir -p backend/src/websocket
mkdir -p backend/src/transcription
mkdir -p backend/src/ai
mkdir -p backend/src/utils
mkdir -p backend/src/types

# Supabase migrations
mkdir -p supabase/migrations

echo "Backend + Supabase folder structure created!"
```

---

## Step 8: Verify Everything Works

```bash
cd callcontext-frontend

# Start dev server
npm run dev

# Should see:
#   ▲ Next.js 16.2.1
#   - Local:  http://localhost:3000
#   - Ready in ~2s

# Visit http://localhost:3000 — should see the default Next.js page
# This confirms: Next.js + Tailwind v4 + TypeScript all working
```

---

## Step 9: Cursor Setup

### Install Extensions in Cursor
- Tailwind CSS IntelliSense (autocomplete for Tailwind classes)
- Prettier (auto-formatting)
- ESLint (code quality)

### Cursor Rules File

The `cursorrules` file at the workspace root tells Cursor about:
- Project structure (monorepo with `callcontext-frontend/` + `backend/`)
- Tech stack rules (App Router only, no Redux, no UI libraries, Tailwind only)
- Design system constants (colors, fonts, spacing)
- Code patterns (API route structure, data fetching, component conventions)
- Security rules (RLS, Zod validation, no exposed secrets)

**Important note:** The `cursorrules` file references `frontend/` and `backend/` as directory names. The actual frontend directory is `callcontext-frontend/`. Update code paths accordingly when following patterns from cursorrules.

### Project Docs as Context

Reference these docs when building features:
1. `docs/engineering-plan.md` — Exact specs for every page, endpoint, table, and test
2. `docs/design-system.md` — Colors, typography, components, animations
3. `docs/architecture.md` — 4-layer architecture, scaling, security model
4. `docs/features.md` — Full 200+ feature brainstorm with priorities

### Cursor Prompting Tips

```
Good prompt:
"Build the Sidebar component following the design system in docs/design-system.md.
Navigation items from NAV_ITEMS in lib/utils/constants.ts.
Brand colors, DM Sans font, Lucide icons.
Active state: bg-brand-50 text-brand-700.
Collapsible on tablet, bottom nav on mobile."

Bad prompt:
"Make a sidebar"
```

---

## Step 10: Git + Deploy

```bash
# From workspace root (callcontext/)
git init
git add .
git commit -m "Project foundation: Next.js 16 + Tailwind v4 + design system + docs"

# Create GitHub repo
gh repo create callcontext --private
git push -u origin main

# Connect to Vercel
# Go to vercel.com → Import Git Repository → select callcontext
# Set root directory to: callcontext-frontend
# Add environment variables from .env.local
# Deploy

# Connect Railway (for later — WebSocket server)
# railway.app → New Project → Deploy from GitHub → select callcontext
# Set root directory to: backend
# Environment variables added later when backend is built
```

---

## Step 11: Existing Config Files (Reference)

These files were auto-generated by `create-next-app` and generally don't need changes:

### `tsconfig.json`
- `strict: true` — enforced
- `moduleResolution: "bundler"` — for Next.js App Router
- Path alias: `@/*` maps to `"./*"` (relative to `callcontext-frontend/`)

### `postcss.config.mjs`
- Uses `@tailwindcss/postcss` plugin (Tailwind v4)
- No additional PostCSS plugins needed initially

### `eslint.config.mjs`
- Flat config format (ESLint 9)
- Extends `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`
- Ignores `.next/`, `out/`, `build/`

### `next.config.ts`
- Currently empty — options added as needed (image domains, redirects, etc.)

---

## What's Ready After This

After completing these steps (~1 hour), you have:
- Next.js 16 project with TypeScript + Tailwind v4 configured
- CallContext design system (brand colors, warm grays, accents) in CSS theme
- CallContext fonts (DM Sans, Outfit, JetBrains Mono) loaded via `next/font`
- Supabase client/server/middleware setup for auth
- Auth middleware protecting dashboard routes
- Complete folder structure for all 22 weeks of features
- Utility functions (phone formatting, date formatting, etc.)
- Constants (consent states, plan limits, nav items, sentiment config)
- Cursor rules file for AI-assisted development
- Project docs for architecture, design system, features, and engineering plan
- Deployed to Vercel (even though pages are still default)
- Git repo with clean first commit

**Next step: Week 1 of the engineering plan — build the database schema and auth pages.**
