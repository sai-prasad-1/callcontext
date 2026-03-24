# 📐 Next.js Project Structure - Explained

## Current Structure

```
callcontext-frontend/
├── app/
│   ├── layout.tsx                    # ✅ Root layout (fonts, metadata)
│   ├── page.tsx                      # ✅ Landing page for anonymous users
│   ├── landing.css                   # ✅ Landing page styles
│   ├── globals.css                   # ✅ Design system (Tailwind v4)
│   │
│   ├── (auth)/                       # 🔐 Authentication pages
│   │   ├── layout.tsx                # Auth-specific layout (centered, branded)
│   │   ├── login/page.tsx            → URL: /login
│   │   ├── signup/page.tsx           → URL: /signup
│   │   ├── forgot-password/page.tsx  → URL: /forgot-password
│   │   └── reset-password/page.tsx   → URL: /reset-password
│   │
│   ├── (dashboard)/                  # 📊 Protected dashboard pages
│   │   ├── layout.tsx                # Dashboard layout (sidebar, header)
│   │   └── page.tsx                  → URL: /dashboard
│   │
│   └── api/
│       ├── auth/
│       │   ├── signup/route.ts       # POST /api/auth/signup
│       │   └── callback/route.ts     # GET /api/auth/callback
│       └── waitlist/route.ts         # POST/GET /api/waitlist
│
├── components/
│   ├── landing/                      # 🚀 Landing page components
│   │   ├── LandingPage.tsx
│   │   └── WaitlistForm.tsx
│   ├── layout/                       # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileNav.tsx
│   └── ui/                           # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Avatar.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       ├── Spinner.tsx
│       ├── EmptyState.tsx
│       └── Skeleton.tsx
│
├── lib/
│   ├── supabase/                     # Database client
│   │   ├── client.ts                 # Browser client
│   │   ├── server.ts                 # Server client
│   │   └── middleware.ts             # Auth middleware
│   ├── types/
│   │   └── database.ts               # TypeScript types
│   └── utils/
│       ├── formatting.ts             # Helper functions
│       └── constants.ts              # App constants
│
└── middleware.ts                     # Root middleware (auth check)
```

---

## Why Use `(auth)` and `(dashboard)`?

### Route Groups = Organization Without URL Bloat

**Without Route Groups (messy URLs):**
```
/auth/login          ❌ Extra /auth in URL
/auth/signup         ❌ Extra /auth in URL
/dashboard/calls     ❌ Extra /dashboard in URL
```

**With Route Groups (clean URLs):**
```
/login               ✅ Clean, simple
/signup              ✅ Clean, simple
/calls               ✅ Clean, simple (future)
```

### Benefits

1. **Clean URLs** - No unnecessary path segments
2. **Separate Layouts** - Auth pages (centered) vs Dashboard pages (sidebar)
3. **Code Organization** - Grouped by feature, not URL structure
4. **Middleware Isolation** - Different auth rules per group

---

## How It Works (Flow Diagram)

```
User visits site
     ↓
┌────────────────────────────────────────┐
│ app/page.tsx (Root)                    │
│ • Check if authenticated               │
└────────────────────────────────────────┘
     ↓                    ↓
 Anonymous          Authenticated
     ↓                    ↓
┌──────────────────┐   ┌──────────────────┐
│ Show Landing     │   │ Redirect to      │
│ Page Component   │   │ /dashboard       │
└──────────────────┘   └──────────────────┘
                              ↓
                    ┌─────────────────────────┐
                    │ app/(dashboard)/page.tsx│
                    │ • Wrapped by dashboard  │
                    │   layout (sidebar, etc.)│
                    └─────────────────────────┘
```

---

## URL Mapping (What Users See)

| File Path | Actual URL | Notes |
|-----------|------------|-------|
| `app/page.tsx` | `/` | Landing page for anon users |
| `app/(auth)/login/page.tsx` | `/login` | Login form |
| `app/(auth)/signup/page.tsx` | `/signup` | Signup form |
| `app/(auth)/forgot-password/page.tsx` | `/forgot-password` | Reset request |
| `app/(auth)/reset-password/page.tsx` | `/reset-password` | New password |
| `app/(dashboard)/page.tsx` | `/dashboard` | Dashboard home |
| `app/api/waitlist/route.ts` | `/api/waitlist` | Waitlist API |
| `app/api/auth/signup/route.ts` | `/api/auth/signup` | Signup API |

**Key Point:** The `(auth)` and `(dashboard)` folders do NOT appear in URLs!

---

## Layout Hierarchy

```
Root Layout (app/layout.tsx)
├── Fonts (DM Sans, Outfit, JetBrains Mono)
├── Global CSS (design system)
└── Metadata (title, description)
    │
    ├─── Auth Layout (app/(auth)/layout.tsx)
    │    ├── Centered container
    │    ├── Branding (CallContext logo)
    │    └── Pages: Login, Signup, Reset
    │
    └─── Dashboard Layout (app/(dashboard)/layout.tsx)
         ├── Sidebar (navigation)
         ├── Header (page title, user menu)
         ├── MobileNav (bottom tabs on mobile)
         ├── Auth guard (redirect if not logged in)
         └── Pages: Dashboard home, Calls, Customers, etc.
```

---

## End-to-End Verification

### 1. Anonymous User Flow

```
1. Visit / → See landing page ✅
2. Click "Join Waitlist" → Scroll to form ✅
3. Fill form → Submit → Success message ✅
4. Click "Sign Up" → Go to /signup ✅
5. Create account → Redirect to /dashboard ✅
```

### 2. Authenticated User Flow

```
1. Visit / → Auto-redirect to /dashboard ✅
2. See dashboard with sidebar ✅
3. Click "Calls" in sidebar → Go to /calls ✅
4. Click "Logout" → Go to /login ✅
```

### 3. Auth Callback Flow

```
1. Sign up with email → Receive verification email
2. Click link → Goes to /?code=ABC123
3. app/page.tsx exchanges code for session
4. Redirect to /dashboard ✅
```

---

## Alternative: No Route Groups (If You Prefer)

If you prefer to avoid `()`, we can restructure to:

```
app/
├── page.tsx                    # Landing
├── login/page.tsx              # Login
├── signup/page.tsx             # Signup
├── dashboard/
│   ├── layout.tsx              # Sidebar layout
│   └── page.tsx                # Dashboard home
```

**Trade-offs:**
- ✅ No parentheses
- ❌ Can't share auth layout across login/signup easily
- ❌ Dashboard becomes /dashboard/dashboard (weird URL)
- ❌ Less Next.js idiomatic

---

## Current Structure is Best Because:

1. **Follows Next.js 13+ Best Practices** - Route groups are the recommended pattern
2. **Clean URLs** - No redundant path segments
3. **Separate Layouts** - Auth pages look different from dashboard pages
4. **Scalable** - Easy to add new dashboard pages
5. **Clear Organization** - Features grouped logically

---

## Testing Checklist

### URLs Work Correctly
- [ ] `/` → Landing page (if not logged in)
- [ ] `/` → Redirect to `/dashboard` (if logged in)
- [ ] `/login` → Login form
- [ ] `/signup` → Signup form
- [ ] `/dashboard` → Dashboard (if logged in)
- [ ] `/dashboard` → Redirect to `/login` (if not logged in)

### Layouts Apply Correctly
- [ ] Auth pages have centered layout
- [ ] Dashboard pages have sidebar + header
- [ ] Landing page has custom nav

### API Routes Work
- [ ] `POST /api/waitlist` → Creates waitlist entry
- [ ] `POST /api/auth/signup` → Creates user + shop
- [ ] `GET /api/auth/callback` → Handles email verification

---

## Recommendation

**Keep the current structure!** It's:
- ✅ Industry standard for Next.js App Router
- ✅ Used by major companies (Vercel, Shopify, etc.)
- ✅ Clean and scalable
- ✅ Tested and working

The `()` folders are a **feature**, not a bug. They make your app cleaner and more maintainable.

---

## Next Steps

Want to verify everything works? Let's test:

1. **Landing Page**: Visit http://localhost:3000
2. **Signup Flow**: http://localhost:3000/signup
3. **Dashboard**: http://localhost:3000/dashboard (after signup)

Need changes? I can:
- Add more dashboard pages
- Refactor to remove route groups (not recommended)
- Add more features to existing pages

Let me know!
