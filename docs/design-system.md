# CallContext — Design System & Visual Language
## Complete UI/UX Specification for Development

---

## 1. DESIGN PHILOSOPHY

### Brand Personality
CallContext sits at the intersection of **professional tool** and **warm assistant**. It's not a cold enterprise dashboard — it's a smart companion that helps a small shop owner remember their customers. The design should feel:

- **Warm but not cutesy** — Like a well-organized notebook, not a toy
- **Calm but not boring** — Soft surfaces with moments of delight (live transcript streaming, entity detection animations)
- **Dense but not cluttered** — Shop owners need information at a glance during a live call, but the rest of the time the dashboard should breathe
- **Trustworthy** — Handling phone recordings and customer data means the design must feel secure and reliable

### The One Thing to Remember
The live call experience is the signature moment. When a shop owner sees words appearing in real-time and entities lighting up as they're detected, that's the "wow" that sells the product. Every other page is supporting cast.

---

## 2. COLOR SYSTEM

### Primary Palette

```css
:root {
  /* Core brand — Deep teal/green: trust, growth, nature (florists!) */
  --brand-50:  #E8F5F0;
  --brand-100: #C8E6D8;
  --brand-200: #9BD4BC;
  --brand-300: #6BBF9E;
  --brand-400: #42A883;
  --brand-500: #2D8F6F;   /* ← Primary brand color */
  --brand-600: #247558;
  --brand-700: #1B5B43;
  --brand-800: #13412F;
  --brand-900: #0B281D;

  /* Warm accent — Soft amber/gold: warmth, delight, attention */
  --accent-50:  #FFF8EB;
  --accent-100: #FEECC0;
  --accent-200: #FDD889;
  --accent-300: #FCC44F;
  --accent-400: #F5AD1F;   /* ← Accent for CTAs, highlights */
  --accent-500: #D99512;
  --accent-600: #B5780E;
  --accent-700: #8E5C0B;
  --accent-800: #674108;
  --accent-900: #3F2704;
}
```

### Semantic Colors

```css
:root {
  /* Status colors */
  --success-50:  #ECFDF5;
  --success-500: #10B981;
  --success-700: #047857;

  --warning-50:  #FFFBEB;
  --warning-500: #F59E0B;
  --warning-700: #B45309;

  --danger-50:  #FEF2F2;
  --danger-500: #EF4444;
  --danger-700: #B91C1C;

  --info-50:  #EFF6FF;
  --info-500: #3B82F6;
  --info-700: #1D4ED8;
}
```

### Neutral Scale (Warm grays — not cold blue-grays)

```css
:root {
  --gray-0:   #FFFFFF;
  --gray-25:  #FCFCFB;
  --gray-50:  #F9F8F6;     /* Page background */
  --gray-100: #F3F1ED;     /* Card hover, subtle bg */
  --gray-150: #EBE9E3;     /* Borders (light) */
  --gray-200: #E0DDD5;     /* Borders (default) */
  --gray-300: #CBC7BC;     /* Disabled text, placeholders */
  --gray-400: #A9A49A;     /* Secondary icons */
  --gray-500: #858078;     /* Secondary text */
  --gray-600: #666259;     /* Body text */
  --gray-700: #4A473F;     /* Strong body text */
  --gray-800: #2E2C27;     /* Headings */
  --gray-900: #1A1917;     /* Darkest text */
}
```

### Sentiment Colors (used during calls)

```css
:root {
  --sentiment-positive: #10B981;   /* Green — happy customer */
  --sentiment-neutral:  #F59E0B;   /* Amber — neutral/unknown */
  --sentiment-negative: #EF4444;   /* Red — complaint/upset */
}
```

### Color Usage Rules

| Context | Color | Example |
|---------|-------|---------|
| Page background | gray-50 | Dashboard bg |
| Card/surface background | gray-0 (white) | Cards, modals, panels |
| Card border | gray-200 | 1px solid borders |
| Primary text | gray-800 | Headings, names |
| Secondary text | gray-500 | Timestamps, labels |
| Primary button | brand-500 | "Save", "Create", main CTAs |
| Primary button hover | brand-600 | Darkened on hover |
| Accent/attention | accent-400 | Live call indicator, upgrade prompts |
| Links | brand-500 | Inline links |
| Destructive action | danger-500 | "Delete", "Cancel subscription" |
| Active call pulse | success-500 | Pulsing dot, live indicator |
| Sidebar bg | gray-900 or white | Dark sidebar or light sidebar |
| Selected nav item | brand-500 bg with white text | Active page indicator |
| Tag/badge bg | Various pastel tints | Tags use color-50 bg + color-700 text |

### Dark Mode (Phase 2 — not MVP)

Design the light theme first. Dark mode can be added post-launch by swapping the gray scale. Use CSS variables everywhere so the swap is mechanical.

---

## 3. TYPOGRAPHY

### Font Stack

```css
:root {
  /* Primary — for UI, body text, everything */
  --font-sans: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* Display — for large headings, hero text, landing page */
  --font-display: 'Outfit', var(--font-sans);

  /* Mono — for phone numbers, call IDs, timestamps, code */
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
}
```

**Why these fonts:**
- **DM Sans** — Geometric sans-serif that feels modern but warm. Has great readability at small sizes (important for dense dashboard data). Free on Google Fonts.
- **Outfit** — Variable-weight geometric font with personality. Makes headings feel designed, not generic. Free on Google Fonts.
- **JetBrains Mono** — Clean monospace for data display. Phone numbers and timestamps look sharp.

### Type Scale

```css
:root {
  /* Scale based on 16px base, 1.25 ratio */
  --text-xs:   0.75rem;    /* 12px — timestamps, badges */
  --text-sm:   0.8125rem;  /* 13px — secondary labels, table cells */
  --text-base: 0.875rem;   /* 14px — default body text in dashboard */
  --text-md:   1rem;       /* 16px — slightly larger body, form labels */
  --text-lg:   1.125rem;   /* 18px — section headings within pages */
  --text-xl:   1.25rem;    /* 20px — page sub-headings */
  --text-2xl:  1.5rem;     /* 24px — page titles */
  --text-3xl:  1.875rem;   /* 30px — dashboard greeting */
  --text-4xl:  2.25rem;    /* 36px — landing page hero */
  --text-5xl:  3rem;       /* 48px — marketing headlines */

  /* Line heights */
  --leading-tight:  1.25;
  --leading-snug:   1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* Font weights */
  --font-regular:  400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;
}
```

### Typography Patterns

| Element | Font | Size | Weight | Color | Line Height |
|---------|------|------|--------|-------|-------------|
| Dashboard greeting | Outfit | text-3xl (30px) | 600 | gray-900 | tight |
| Page title | Outfit | text-2xl (24px) | 600 | gray-800 | tight |
| Section heading | DM Sans | text-lg (18px) | 600 | gray-800 | snug |
| Card title | DM Sans | text-md (16px) | 600 | gray-800 | snug |
| Body text | DM Sans | text-base (14px) | 400 | gray-700 | normal |
| Secondary/meta text | DM Sans | text-sm (13px) | 400 | gray-500 | normal |
| Tiny labels/badges | DM Sans | text-xs (12px) | 500 | varies | tight |
| Phone numbers | JetBrains Mono | text-sm (13px) | 400 | gray-700 | tight |
| Stat numbers | Outfit | text-2xl (24px) | 700 | gray-900 | tight |
| Table cells | DM Sans | text-sm (13px) | 400 | gray-700 | snug |
| Button text | DM Sans | text-sm (13px) | 500 | white/gray-800 | tight |
| Nav items | DM Sans | text-sm (13px) | 500 | gray-500/white | tight |

---

## 4. SPACING & LAYOUT

### Spacing Scale

```css
:root {
  --space-0:   0;
  --space-0.5: 0.125rem;  /* 2px */
  --space-1:   0.25rem;   /* 4px */
  --space-1.5: 0.375rem;  /* 6px */
  --space-2:   0.5rem;    /* 8px */
  --space-3:   0.75rem;   /* 12px */
  --space-4:   1rem;      /* 16px */
  --space-5:   1.25rem;   /* 20px */
  --space-6:   1.5rem;    /* 24px */
  --space-8:   2rem;      /* 32px */
  --space-10:  2.5rem;    /* 40px */
  --space-12:  3rem;      /* 48px */
  --space-16:  4rem;      /* 64px */
  --space-20:  5rem;      /* 80px */
}
```

### Layout Structure

```
┌────────────────────────────────────────────────────────┐
│ Sidebar (240px fixed)  │  Main Content Area            │
│                        │                                │
│ [Logo]                 │  Header (56px)                 │
│                        │  ┌──────────────────────────┐ │
│ [Dashboard]            │  │ Page Title    [Actions]   │ │
│ [Calls]                │  └──────────────────────────┘ │
│ [Customers]            │                                │
│ [Orders]               │  Content (scrollable)         │
│ [Reminders]            │  padding: 24px                │
│ [Marketing]            │  max-width: 1200px            │
│ [Analytics]            │                                │
│                        │                                │
│ ────────               │                                │
│ [Settings]             │                                │
│ [Help]                 │                                │
│                        │                                │
│ [User avatar + name]   │                                │
└────────────────────────────────────────────────────────┘

Mobile (<768px):
  - Sidebar → bottom nav bar (5 icons) or hamburger menu
  - Content → full width, padding: 16px
  - Tables → horizontal scroll or card layout
```

### Grid System

```css
/* Content area grid for dashboard home, analytics */
.grid-2 { grid-template-columns: repeat(2, 1fr); gap: 16px; }
.grid-3 { grid-template-columns: repeat(3, 1fr); gap: 16px; }
.grid-4 { grid-template-columns: repeat(4, 1fr); gap: 16px; }

/* Stat cards: 4 columns on desktop, 2 on tablet, 1 on mobile */
@media (max-width: 1024px) { .grid-4 { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px)  { .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr; } }
```

---

## 5. COMPONENT DESIGN

### Radius & Shadows

```css
:root {
  /* Border radius — soft but not bubbly */
  --radius-sm:   4px;     /* Badges, small elements */
  --radius-md:   6px;     /* Buttons, inputs */
  --radius-lg:   8px;     /* Cards, dropdowns */
  --radius-xl:   12px;    /* Modals, large panels */
  --radius-2xl:  16px;    /* Feature cards, hero elements */
  --radius-full: 9999px;  /* Avatars, pills, dots */

  /* Shadows — subtle, warm-toned */
  --shadow-xs:  0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm:  0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md:  0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.04);
  --shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.06), 0 4px 6px rgba(0, 0, 0, 0.04);
  --shadow-xl:  0 20px 25px rgba(0, 0, 0, 0.08), 0 8px 10px rgba(0, 0, 0, 0.04);

  /* Ring (focus states) */
  --ring-brand: 0 0 0 2px var(--brand-100), 0 0 0 4px var(--brand-500);
  --ring-danger: 0 0 0 2px var(--danger-50), 0 0 0 4px var(--danger-500);
}
```

### Buttons

```
Variants:
  Primary     — bg: brand-500, text: white, hover: brand-600
  Secondary   — bg: white, border: gray-200, text: gray-700, hover: gray-50
  Ghost       — bg: transparent, text: gray-600, hover: gray-100
  Danger      — bg: danger-500, text: white, hover: danger-700
  Accent      — bg: accent-400, text: gray-900, hover: accent-500

Sizes:
  sm — h: 32px, px: 12px, text: 13px
  md — h: 36px, px: 16px, text: 13px (default)
  lg — h: 40px, px: 20px, text: 14px

States:
  Default → Hover (darken bg 1 step) → Active (darken 2 steps) → Disabled (opacity 0.5)
  Focus: show ring-brand

Icon buttons: square, same height, icon centered
Button + icon: icon left or right, 8px gap

Animation: transition: all 150ms ease;
```

### Inputs

```
Default:
  height: 36px
  padding: 0 12px
  border: 1px solid gray-200
  border-radius: radius-md
  font: text-base (14px), DM Sans
  bg: white
  placeholder color: gray-400

States:
  Focus:  border-color: brand-500, ring: ring-brand
  Error:  border-color: danger-500, ring: ring-danger
  Disabled: bg: gray-50, opacity: 0.6

Text area: same styling, min-height: 80px, resize: vertical
Select: same styling + custom chevron icon right-aligned

Labels:
  Above input, text-sm, font-medium, gray-700
  Required: red asterisk (*)
  Helper text: below input, text-xs, gray-500
  Error message: below input, text-xs, danger-500
```

### Cards

```
Default card:
  bg: white
  border: 1px solid gray-200
  border-radius: radius-lg (8px)
  padding: 20px
  shadow: shadow-sm

Hover card (clickable):
  + transition: all 150ms ease
  + hover: shadow-md, border-color: gray-300

Card sections:
  Header: border-bottom: 1px solid gray-150, padding-bottom: 16px
  Body: padding-top: 16px
  Footer: border-top: 1px solid gray-150, padding-top: 16px

Stat card:
  Same as default +
  Stat number: Outfit, text-2xl, font-bold, gray-900
  Stat label: text-sm, gray-500
  Trend arrow: text-xs, success-500 (up) or danger-500 (down)
```

### Badges & Tags

```
Badge (status indicator):
  padding: 2px 8px
  border-radius: radius-full
  font: text-xs, font-medium
  Variants:
    success: bg: success-50, text: success-700, border: 1px solid success-200
    warning: bg: warning-50, text: warning-700, border: 1px solid warning-200
    danger:  bg: danger-50,  text: danger-700,  border: 1px solid danger-200
    info:    bg: info-50,    text: info-700,    border: 1px solid info-200
    neutral: bg: gray-100,   text: gray-700,    border: 1px solid gray-200

Tag (customer tag):
  padding: 2px 10px
  border-radius: radius-full
  font: text-xs, font-medium
  bg: brand-50, text: brand-700, border: 1px solid brand-200
  With remove: + small X icon on right, hover: bg: brand-100

Loyalty badge:
  Same shape as tag
  Bronze: bg: #FDF2E6, text: #92600A, border: #E8C48A
  Silver: bg: #F3F3F3, text: #5A5A5A, border: #C4C4C4
  Gold:   bg: #FFF8E1, text: #8B6914, border: #F0D264
  Platinum: bg: #EEEEF8, text: #4A4A8A, border: #B8B8E0
```

### Avatars

```
Sizes: 24px (inline), 32px (list), 40px (profile), 64px (profile hero)
Shape: circle (border-radius: full)
Default (no image): bg: brand-100, text: brand-600, show initials (first+last)
With image: object-fit: cover, border: 2px solid white
Group (overlapping): -8px margin-left per avatar, z-index stacking
```

### Tables

```
Header row:
  bg: gray-50
  text: text-xs, font-medium, gray-500, uppercase, letter-spacing: 0.05em
  padding: 10px 16px
  border-bottom: 1px solid gray-200

Body rows:
  bg: white
  text: text-sm, gray-700
  padding: 12px 16px
  border-bottom: 1px solid gray-100
  hover: bg: gray-25

Selected row:
  bg: brand-50
  border-left: 3px solid brand-500

Sortable column header: cursor pointer, hover: text gray-800, + sort arrow icon

Pagination:
  Below table, right-aligned
  "Showing 1-20 of 142"
  [Prev] [1] [2] [3] ... [8] [Next]
```

### Modals

```
Overlay: bg: rgba(0, 0, 0, 0.4), backdrop-filter: blur(4px)
Modal:
  bg: white
  border-radius: radius-xl (12px)
  shadow: shadow-xl
  max-width: 480px (small), 640px (medium), 800px (large)
  padding: 24px
  animation: scale from 0.95 + fade in, 200ms ease-out

Header: title (text-lg, font-semibold) + close X button
Body: content area
Footer: right-aligned buttons, gap: 8px

Close triggers: X button, Escape key, click overlay (unless form has unsaved changes)
```

### Toasts / Notifications

```
Position: top-right, stacked vertically with 8px gap
Width: 360px

Structure:
  bg: white
  border-radius: radius-lg
  shadow: shadow-lg
  padding: 12px 16px
  border-left: 4px solid [semantic color]

Types:
  Success: border-left: success-500, icon: check circle
  Error: border-left: danger-500, icon: alert circle
  Warning: border-left: warning-500, icon: alert triangle
  Info: border-left: info-500, icon: info circle

Auto-dismiss: 5 seconds (success/info), persist until dismissed (error/warning)
Animation: slide in from right, fade out
```

---

## 6. ICONOGRAPHY

### Icon Library
Use **Lucide Icons** (lucide.dev) — clean, consistent, 24px grid, 1.5px stroke weight. Already available as a React package.

### Key Icons by Feature

```
Navigation:
  Dashboard    → LayoutDashboard
  Calls        → Phone
  Customers    → Users
  Orders       → ShoppingBag
  Reminders    → Bell
  Marketing    → Megaphone
  Analytics    → BarChart3
  Tasks        → CheckSquare
  Settings     → Settings
  Help         → HelpCircle

Call status:
  Incoming     → PhoneIncoming
  Active       → PhoneCall
  Completed    → PhoneOff
  Missed       → PhoneMissed

Actions:
  Add          → Plus
  Edit         → Pencil
  Delete       → Trash2
  Search       → Search
  Filter       → Filter
  Export       → Download
  More menu    → MoreVertical

Entities:
  Product      → Flower2 (or custom flower icon)
  Occasion     → Gift
  Date         → Calendar
  Address      → MapPin
  Budget       → DollarSign
  Sentiment    → Smile / Meh / Frown

Integrations:
  Google Cal   → Calendar
  Square       → CreditCard
  Email        → Mail
  SMS          → MessageSquare
  Webhook      → Webhook
  API          → Code
```

### Icon Usage Rules
- Nav icons: 20px, stroke: 1.5px
- Inline icons (in text): 16px, vertical-align: -2px
- Feature icons (in cards): 24px
- Empty state illustrations: 64-80px, use brand-200 stroke color
- Never use filled icons — always stroke/outline style for consistency

---

## 7. ANIMATIONS & MOTION

### General Principles

```css
:root {
  --transition-fast:   150ms ease;
  --transition-base:   200ms ease;
  --transition-slow:   300ms ease;
  --transition-spring: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Specific Animations

```css
/* Hover transitions (buttons, cards, links) */
.interactive {
  transition: all var(--transition-fast);
}

/* Page transitions */
.page-enter {
  animation: fadeInUp 200ms ease-out;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Modal entrance */
.modal-enter {
  animation: scaleIn 200ms ease-out;
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

/* Live call pulse dot */
.pulse-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--success-500);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50%      { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
}

/* Live transcript — words appearing */
.transcript-word {
  animation: wordFade 300ms ease-out;
}
@keyframes wordFade {
  from { opacity: 0; transform: translateY(2px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Entity detected — slide in from right */
.entity-detected {
  animation: slideInRight 400ms var(--transition-spring);
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Skeleton loading */
.skeleton {
  background: linear-gradient(90deg, var(--gray-100) 25%, var(--gray-150) 50%, var(--gray-100) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Screen pop notification */
.screen-pop {
  animation: slideInFromTop 400ms var(--transition-spring);
}
@keyframes slideInFromTop {
  from { opacity: 0; transform: translateY(-100%); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Chart data points appearing */
.chart-enter {
  animation: fadeScale 600ms ease-out;
}
@keyframes fadeScale {
  from { opacity: 0; transform: scale(0.8); }
  to   { opacity: 1; transform: scale(1); }
}
```

### Motion Rules
- **Hover**: 150ms, ease — never slower (feels sluggish)
- **Enter/appear**: 200-400ms, ease-out or spring
- **Exit/disappear**: 150-200ms, ease-in (faster than enter)
- **Loading states**: Use skeleton shimmer, not spinners (except for short operations)
- **Data updates**: Animate number changes (count up/down), not just snap
- **No motion sickness**: All animations respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. PAGE-SPECIFIC DESIGN PATTERNS

### Sidebar Navigation

```
Background: white (clean) or gray-900 (dark)
Width: 240px, collapsible to 64px (icon-only)

Logo area: 56px height, padding: 16px
  - CallContext logo (icon + wordmark)
  - Collapsed: icon only

Nav items:
  padding: 8px 12px
  border-radius: radius-md
  margin: 2px 8px
  Default: text gray-500, bg transparent
  Hover: bg gray-100 (light) or gray-800 (dark)
  Active: bg brand-50, text brand-700, font-weight 600
    + left border 3px brand-500 (or left rounded bg fill)

Section dividers: 1px gray-200, margin 8px 16px

Bottom section:
  User avatar (32px) + name + role
  Settings gear icon
  Collapse toggle
```

### Screen Pop Notification (During Calls)

```
Position: top-center of main content area
Width: 420px
Animation: slide down from top + spring bounce

┌────────────────────────────────────────┐
│ 🟢 Incoming call                       │
│                                        │
│ [Avatar] Maria Chen                    │
│ +1 (512) 555-0173                      │
│ Tags: [VIP] [Wedding Client]           │
│ Last: "Ordered roses for anniversary"  │
│ ⭐ Gold member — 1,240 pts             │
│                                        │
│ [View live →]              [Dismiss]   │
└────────────────────────────────────────┘

Background: white
Border: 2px solid success-500 (pulsing glow)
Shadow: shadow-xl + 0 0 20px rgba(16, 185, 129, 0.15)
```

### Live Call View (The Signature Page)

```
Layout: two-column on desktop, stacked on mobile

Left (320px): Customer card (compact)
  - Avatar, name, tags, loyalty badge
  - Quick stats: total calls, last order, preferences
  - Important dates
  - Pinned notes

Right (flexible): Live transcript
  - Auto-scrolling container
  - Speaker labels: "Customer" (left), "You" (right)
  - Final text: gray-800, normal weight
  - Interim text: gray-400, italic (updates in place)
  - Typing indicator: 3 animated dots

Bottom bar (full width): Live entities
  - Horizontal scrollable pills
  - Each entity: icon + label + value
  - Animation: new entities slide in from right with spring
  - Glow effect when new entity appears

Top bar: status
  - Pulsing green dot + "Live call" + timer (MM:SS)
  - Sentiment indicator (color-coded emoji)
  - Call actions: [Mute] [Add note] [End view]

Color atmosphere:
  - Subtle green gradient border or glow around the entire view
  - When sentiment negative: border shifts to warm/amber
  - The whole page should feel "alive" during a call
```

### Dashboard Home

```
Greeting: "Good morning, Sai!" — Outfit, text-3xl, gray-900
Subtitle: date, day of week — text-sm, gray-500

Row 1: Stat cards (4-column grid)
  [Calls today: 12 ↑23%] [New customers: 3] [Missed: 1] [Follow-ups: 2]

Row 2: Two-column
  Left: Today's reminders (list, max 5, "View all →")
  Right: Recent calls (list, max 5, with mini summaries)

Row 3: Mini chart
  Call volume sparkline (last 7 days) — subtle, not dominant
```

### Customer Profile

```
Hero section:
  Avatar (64px) + name (text-2xl) + phone (mono) + email
  Tags row (horizontal pills)
  Loyalty badge (large, with progress bar to next tier)
  [Edit] [Add tag] [Add note] buttons

Tab bar:
  [Overview] [Calls] [Orders] [Notes] [Activity]
  Active tab: brand-500 underline, 2px, with transition

Overview tab:
  Stats bar: 4 mini cards (total calls, orders, LTV, days since last contact)
  Preferences card: flowers, colors, allergies (editable inline)
  Important dates card: list with date, label, recurring badge, source badge
  AI insights card: "Upsell opportunity: premium arrangement for anniversary"

Calls tab:
  Chronological list of calls
  Each: date, duration, sentiment dot, 2-line AI summary
  Click → navigates to call detail

Notes tab:
  Pinned notes first (highlighted border)
  Add note form at top (expandable textarea + pin toggle)
  List of notes with timestamps
```

---

## 9. TAILWIND CONFIGURATION

```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#E8F5F0',
          100: '#C8E6D8',
          200: '#9BD4BC',
          300: '#6BBF9E',
          400: '#42A883',
          500: '#2D8F6F',
          600: '#247558',
          700: '#1B5B43',
          800: '#13412F',
          900: '#0B281D',
        },
        accent: {
          50:  '#FFF8EB',
          100: '#FEECC0',
          200: '#FDD889',
          300: '#FCC44F',
          400: '#F5AD1F',
          500: '#D99512',
          600: '#B5780E',
          700: '#8E5C0B',
          800: '#674108',
          900: '#3F2704',
        },
        warm: {
          25:  '#FCFCFB',
          50:  '#F9F8F6',
          100: '#F3F1ED',
          150: '#EBE9E3',
          200: '#E0DDD5',
          300: '#CBC7BC',
          400: '#A9A49A',
          500: '#858078',
          600: '#666259',
          700: '#4A473F',
          800: '#2E2C27',
          900: '#1A1917',
        },
      },
      borderRadius: {
        'sm':  '4px',
        'md':  '6px',
        'lg':  '8px',
        'xl':  '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'xs':  '0 1px 2px rgba(0,0,0,0.04)',
        'sm':  '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'md':  '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)',
        'lg':  '0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04)',
        'xl':  '0 20px 25px rgba(0,0,0,0.08), 0 8px 10px rgba(0,0,0,0.04)',
      },
      animation: {
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-in-right': 'slideInRight 400ms cubic-bezier(0.34,1.56,0.64,1)',
        'slide-in-top': 'slideInTop 400ms cubic-bezier(0.34,1.56,0.64,1)',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0.4)' },
          '50%': { boxShadow: '0 0 0 6px rgba(16,185,129,0)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInTop: {
          from: { opacity: '0', transform: 'translateY(-100%)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 10. RESPONSIVE BREAKPOINTS

```css
/* Tailwind defaults, extended */
sm:  640px    /* Large phones landscape */
md:  768px    /* Tablets portrait */
lg:  1024px   /* Tablets landscape, small laptops */
xl:  1280px   /* Desktops */
2xl: 1536px   /* Large desktops */
```

### Responsive Rules

| Component | Desktop (>1024) | Tablet (768-1024) | Mobile (<768) |
|-----------|----------------|-------------------|---------------|
| Sidebar | 240px fixed | 64px collapsed (icons) | Bottom nav bar or hamburger |
| Stat cards | 4 columns | 2 columns | 1 column (stacked) |
| Live call view | 2 columns (card + transcript) | 2 columns (narrower card) | Stacked (card on top) |
| Customer profile | Tabs horizontal | Tabs horizontal | Tabs → dropdown select |
| Tables | Full table | Horizontal scroll | Card layout per row |
| Analytics charts | Side by side | Full width stacked | Full width stacked |
| Campaign wizard | Sidebar steps + content | Full width steps | Full width steps |
| Modals | Centered, max-width | Centered, wider | Full screen bottom sheet |

---

## 11. LOADING & EMPTY STATES

### Loading Patterns

```
Skeleton screens (preferred):
  - Rectangles with shimmer animation
  - Match the layout shape of the content being loaded
  - Show within 100ms, data replaces it when ready

Spinner (for actions):
  - Use only for short operations (save, delete, send)
  - 16px spinner inside the button that triggered the action
  - Button text changes: "Save" → [spinner] "Saving..."

Progress bar (for long operations):
  - Export CSV, bulk operations
  - Horizontal bar at top of content area
  - Brand-500 fill, gray-200 track
```

### Empty States

```
Every list page needs an empty state:

Structure:
  - Icon: 64px, gray-300, related to the feature
  - Headline: text-lg, gray-800, descriptive
  - Description: text-sm, gray-500, actionable
  - CTA button: primary or secondary

Examples:
  Customers (empty):
    [Users icon, 64px]
    "No customers yet"
    "Customers are auto-created when they call. Make a test call to see it in action."
    [Make a test call →]

  Calls (empty):
    [Phone icon, 64px]
    "No calls recorded"
    "Set up your phone number to start capturing calls."
    [Set up phone →]

  Reminders (empty):
    [Bell icon, 64px]
    "No reminders"
    "Reminders are auto-created when AI detects dates during calls. You can also create them manually."
    [Create reminder]
```

---

## 12. LOGO & BRAND ASSETS

### Logo Concept

```
Icon: Abstract speech bubble + signal waves (communication + intelligence)
  - The speech bubble subtly incorporates a phone handset shape
  - Signal waves emanate from the top-right (representing AI/intelligence)
  - Uses brand-500 (teal green) as primary color
  - Can work as a standalone icon (favicon, app icon)

Wordmark: "CallContext" in Outfit font
  - "Call" in brand-500 (bold)
  - "Context" in gray-800 (medium weight)
  - Or fully in brand-500 for single-color applications

Lockup: Icon + wordmark side by side
  - Horizontal: icon left, wordmark right (primary use)
  - Stacked: icon above, wordmark below (square contexts)

Clear space: minimum 8px around the icon on all sides

Favicon: Icon only, brand-500 on white (16x16, 32x32)
Apple touch icon: Icon with brand-50 background, 180x180
OG image: Full lockup centered on brand-50 background, 1200x630
```

---

## 13. ACCESSIBILITY REQUIREMENTS

```
Color contrast:
  - All text must meet WCAG AA (4.5:1 for normal text, 3:1 for large text)
  - gray-500 on white = 4.6:1 ✓ (minimum for secondary text)
  - gray-700 on white = 7.8:1 ✓ (body text)
  - brand-500 on white = 4.2:1 ✓ (links — passes for large text, borderline for small)
  - white on brand-500 = 4.2:1 ✓ (button text)

Focus indicators:
  - All interactive elements must have visible focus rings
  - Use ring-brand (2px offset + 4px solid brand-500)
  - Never remove outline without replacing with visible alternative

Keyboard navigation:
  - All interactive elements reachable via Tab
  - Modals trap focus
  - Escape closes modals, dropdowns, popovers
  - Arrow keys navigate within menus, tabs, and radio groups

Screen readers:
  - All images have alt text
  - Icons have aria-label or sr-only text
  - Form inputs have associated labels
  - Dynamic content updates use aria-live regions
  - Buttons describe their action, not just "Click here"

Touch targets:
  - Minimum 44x44px touch area on mobile
  - 8px minimum spacing between adjacent touch targets
```
