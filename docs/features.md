# CallContext — Complete Feature Brainstorm & Product Blueprint
## From Call Intelligence → Full Small-Shop CRM + Marketing Ecosystem

---

## Vision Statement

CallContext starts as a **call intelligence tool for florists**, but the real product is a **lightweight CRM for phone-first small businesses** — florists, bakeries, salons, auto shops, veterinary clinics — any local business where the phone rings 20-50 times a day and every call is a revenue opportunity. The platform captures customer relationships from calls, then gives shop owners tools to nurture those relationships: loyalty programs, reminders, marketing, and integrations with the tools they already use.

---

## PART 1: CORE CALL INTELLIGENCE (MVP Week 1–7)

### 1.1 Telephony & Call Routing

| Feature | Description | Priority |
|---------|-------------|----------|
| Vonage virtual number provisioning | Auto-provision a local number per shop on signup | P0 |
| Inbound call forwarding | Route calls to shop owner's real phone seamlessly | P0 |
| State-based consent automation | Auto-detect 2-party vs 1-party state, play/skip disclosure | P0 |
| Custom greeting message | Shop owner records or types a custom greeting | P1 |
| Business hours routing | Route to voicemail or alternate number outside hours | P1 |
| Multi-line support | Handle multiple simultaneous calls (up to 3) | P2 |
| Outbound click-to-call | Call customers from dashboard, auto-log the conversation | P2 |
| Voicemail transcription | When calls go unanswered, transcribe voicemail and push as notification | P2 |
| Call queue with hold music | Simple queue when owner is on another call | P3 |
| IVR menu builder | "Press 1 for orders, 2 for delivery status" | P3 |

### 1.2 Real-Time Transcription & Analysis

| Feature | Description | Priority |
|---------|-------------|----------|
| Live streaming transcription | Deepgram Nova-3 streaming, < 300ms latency | P0 |
| Speaker diarization | Identify customer vs shop owner in transcript | P0 |
| Real-time entity extraction | Products, dates, addresses, occasions every 30s | P0 |
| Post-call full analysis | Complete summary, sentiment, follow-up flags | P0 |
| Live sentiment indicator | Green/yellow/red mood gauge during call | P1 |
| AI suggestion cards | "Customer mentioned anniversary — suggest premium arrangement" | P1 |
| Florist vocabulary tuning | Custom dictionary for flower names, arrangement types | P1 |
| Multi-language support | Spanish as second language (large US florist market) | P2 |
| Keyword alerts | Notify when customer says "complaint", "refund", "competitor" | P2 |
| Call scoring | Rate call quality (did owner mention upsell? Confirm delivery?) | P3 |

### 1.3 Screen Pop & Live Dashboard

| Feature | Description | Priority |
|---------|-------------|----------|
| Caller ID screen pop | Instant notification with customer name, history, preferences | P0 |
| Live transcript panel | Words appearing in real-time during call | P0 |
| Live entity panel | Detected products, dates, addresses update during call | P0 |
| Call timer and status bar | Active/ended indicator with duration | P0 |
| Customer card during call | Full profile visible while talking | P0 |
| Quick-note during call | Type notes that get saved to customer profile | P1 |
| One-click order creation | Button to start an order from detected entities | P1 |
| Previous call summary | "Last time they ordered roses for their mother's birthday" | P1 |
| AI-suggested talking points | "Ask about the wedding flowers they mentioned last time" | P2 |
| Screen pop on mobile | Push notification to phone app with caller info | P2 |

---

## PART 2: CRM — CUSTOMER RELATIONSHIP MANAGEMENT (MVP Week 7–12)

### 2.1 Customer Profiles

| Feature | Description | Priority |
|---------|-------------|----------|
| Auto-created profiles | Profile auto-generated from first call with extracted data | P0 |
| Contact details | Phone, email, address (auto-extracted + manual edit) | P0 |
| Call history timeline | Every call with date, duration, summary, recording link | P0 |
| Preferences & notes | Favorite flowers, allergies, style preferences | P0 |
| Important dates | Birthdays, anniversaries, recurring occasions | P0 |
| Order history | Past orders linked from calls (manual + auto-detected) | P1 |
| Customer tags | "VIP", "Wedding client", "Corporate", "Frequent buyer" | P1 |
| Lifetime value tracking | Total spend, average order, frequency | P1 |
| Merge duplicate contacts | Match by phone number, suggest duplicates by name | P1 |
| Customer photo/avatar | Upload or auto-fetch from Gravatar | P3 |
| Household/company grouping | Link related contacts ("John & Mary Smith") | P2 |
| Communication preferences | Prefers text vs email vs phone | P2 |

### 2.2 Customer Segmentation & Lists

| Feature | Description | Priority |
|---------|-------------|----------|
| Smart segments | Auto-group: "Customers who ordered 3+ times this year" | P1 |
| Tag-based filtering | Filter by any combination of tags | P0 |
| Date-based segments | "Customers with upcoming anniversaries in next 30 days" | P1 |
| Spending tiers | Auto-tier: Bronze (<$100/yr), Silver ($100-500), Gold ($500+) | P1 |
| Recency segments | "Haven't ordered in 6+ months" (win-back targets) | P1 |
| Custom list builder | Drag-and-drop segment builder with AND/OR logic | P2 |
| Segment export | Export any segment as CSV for external use | P1 |
| Segment size tracking | Show how segments grow/shrink over time | P3 |

### 2.3 Notes, Tasks & Activity Feed

| Feature | Description | Priority |
|---------|-------------|----------|
| Manual notes on profiles | Rich text notes with timestamps | P0 |
| Activity feed per customer | Chronological: calls, orders, notes, reminders, emails | P0 |
| Tasks/to-dos | "Follow up with Mrs. Chen about wedding consultation" | P1 |
| Task reminders | Push notification + email when task is due | P1 |
| @mention in notes | Tag other team members in notes (for multi-user shops) | P3 |
| Pinned notes | Pin important info to top of profile (e.g., "severe allergy to lilies") | P1 |

---

## PART 3: SMART REMINDERS & AUTOMATION ENGINE (MVP Week 8–9)

### 3.1 Reminder System

| Feature | Description | Priority |
|---------|-------------|----------|
| Auto-detected date reminders | AI detects "my wife's birthday is March 15" → auto-create reminder | P0 |
| Recurring reminders | Annual reminders for birthdays, anniversaries | P0 |
| Advance notice configuration | Remind 1 week, 3 days, or 1 day before event | P0 |
| Reminder dashboard widget | Today's reminders front-and-center on dashboard home | P0 |
| Push notification reminders | Browser + mobile push for upcoming dates | P1 |
| Email digest of reminders | Daily morning email: "3 customer occasions this week" | P1 |
| Snooze / dismiss reminders | Snooze for 1 day / 1 week / dismiss | P1 |
| Bulk reminder creation | Import a CSV of customer birthdays | P2 |
| Holiday reminders | Auto-suggest: "Valentine's Day in 2 weeks — 47 customers bought roses last year" | P2 |

### 3.2 Automation Rules Engine (Post-MVP, but architect for it)

| Feature | Description | Priority |
|---------|-------------|----------|
| Trigger → Action framework | "When [event] happens, do [action]" | P2 |
| Welcome message automation | Auto-send "Thanks for your first order" text after first call with order | P2 |
| Win-back automation | Auto-flag customers inactive for 90 days, suggest outreach | P2 |
| Post-delivery follow-up | "How were the flowers?" text 2 days after delivery date | P2 |
| Birthday auto-outreach | Auto-send "Your anniversary is coming up!" 2 weeks before | P2 |
| Trigger types | New customer, first order, order completed, date approaching, customer inactive, tag added | P2 |
| Action types | Send SMS, send email, create task, add tag, notify owner | P2 |

---

## PART 4: LOYALTY PROGRAM (Post-MVP Phase 1)

### 4.1 Points-Based Loyalty

| Feature | Description | Priority |
|---------|-------------|----------|
| Points earning | 1 point per $1 spent (configurable) | P2 |
| Points tracking per customer | Visible on customer profile and during calls | P2 |
| Reward tiers | Bronze / Silver / Gold / Platinum with auto-upgrade | P2 |
| Points redemption | "$X off" or "free delivery" at configurable thresholds | P2 |
| Points balance notification | "You're 50 points away from a free arrangement!" | P3 |
| Referral points | Bonus points when a customer refers a new customer | P3 |
| Double points events | Owner can run "double points this weekend" promotions | P3 |

### 4.2 Loyalty Cards & Display

| Feature | Description | Priority |
|---------|-------------|----------|
| Digital loyalty card | Mobile-friendly card customers can save to Apple/Google Wallet | P2 |
| QR code check-in | Customer scans QR at counter to log visit/purchase | P3 |
| Loyalty tier badge | Visual badge on customer profile during calls | P2 |
| Leaderboard (optional) | "Your top 10 customers this month" for owner's dashboard | P3 |

---

## PART 5: MARKETING & OUTREACH (Post-MVP Phase 1-2)

### 5.1 SMS Marketing

| Feature | Description | Priority |
|---------|-------------|----------|
| Broadcast SMS | Send text to a segment: "Valentine's Day special — 20% off roses" | P1 |
| Personalized SMS templates | "Hi {first_name}, your anniversary is coming up on {date}!" | P1 |
| SMS opt-in/opt-out management | TCPA compliance, easy unsubscribe | P0 (if SMS) |
| Scheduled sends | Schedule SMS for optimal time (e.g., Tuesday 10am) | P2 |
| SMS reply handling | Route customer replies to dashboard as conversations | P2 |
| SMS analytics | Delivery rate, response rate, opt-out rate | P2 |
| Two-way texting | Full conversation thread in dashboard | P2 |

### 5.2 Email Marketing

| Feature | Description | Priority |
|---------|-------------|----------|
| Email campaigns to segments | "Spring Collection" email to all customers | P1 |
| Pre-built email templates | Holiday-themed, seasonal, promotional templates | P1 |
| Drag-and-drop email builder | Simple WYSIWYG email composer | P2 |
| Personalization tokens | {first_name}, {last_order_date}, {loyalty_points} | P1 |
| Email analytics | Open rate, click rate, unsubscribe rate | P2 |
| Automated drip sequences | Welcome series, post-purchase series, win-back series | P3 |
| A/B testing subject lines | Send two variants, auto-pick winner | P3 |

### 5.3 Marketing Materials & Assets

| Feature | Description | Priority |
|---------|-------------|----------|
| Promotional flyer generator | AI-generated flyers from a prompt: "Mother's Day sale, 15% off" | P2 |
| Social media post generator | AI writes + designs posts for Instagram/Facebook | P2 |
| Event announcement templates | "Grand opening", "Holiday hours", "New collection" | P2 |
| Printable coupon generator | QR-code coupons: "Show this for $10 off" | P3 |
| Review request automation | "Loved your flowers? Leave us a review on Google!" with link | P2 |
| Google Business Profile integration | Auto-post promotions to Google Business | P3 |

---

## PART 6: ANALYTICS & REPORTING DASHBOARD (MVP Week 8–9)

### 6.1 Call Analytics

| Feature | Description | Priority |
|---------|-------------|----------|
| Daily/weekly/monthly call volume | Trend chart of total calls | P0 |
| Average call duration | Track over time | P0 |
| Busiest hours heatmap | When do most calls come in? | P1 |
| Missed call tracking | How many calls went unanswered? | P1 |
| Call-to-order conversion | % of calls that resulted in an order | P2 |
| First-time vs returning callers | Ratio and trend | P1 |
| Peak day analysis | Busiest days of the week/month | P1 |

### 6.2 Customer Analytics

| Feature | Description | Priority |
|---------|-------------|----------|
| New customers this month/week | Count + trend | P0 |
| Customer retention rate | % of customers who ordered again within 12 months | P2 |
| Top customers by revenue | Leaderboard | P1 |
| Most common occasions | Pie chart: birthday 35%, anniversary 20%, sympathy 15%... | P1 |
| Most popular products | What flowers/arrangements are mentioned most | P1 |
| Average customer lifetime value | Revenue per customer over their lifetime | P2 |
| Customer acquisition source | "Where are new customers coming from?" (referral, search, walk-in) | P3 |

### 6.3 Revenue Insights

| Feature | Description | Priority |
|---------|-------------|----------|
| Revenue from calls (estimated) | Sum of detected order values from transcripts | P2 |
| Revenue per call | Average detected order value | P2 |
| Upsell success rate | How often AI-suggested upsells are mentioned by owner | P3 |
| Monthly revenue trend | Chart of estimated revenue from call intelligence | P2 |
| Seasonal comparison | "February revenue vs last February" | P3 |

---

## PART 7: INTEGRATIONS & ECOSYSTEM (Post-MVP, architect now)

### 7.1 Integration Architecture

The integration layer should be designed as a **plugin/connector system** so third-party tools can plug in without touching core code.

```
Core CallContext Platform
          ↓
    Integration Hub (API + Webhooks + OAuth)
          ↓
    ┌─────┴─────────────────────────────────┐
    ↓         ↓         ↓         ↓         ↓
  POS      Calendar   Delivery  Accounting  Marketing
  Systems  Tools      Services  Software    Platforms
```

**Design Principles:**
- Every integration is a "connector" with a standard interface
- Connectors have: auth config, data sync direction, field mapping, webhook endpoints
- All integrations log to an activity feed so the owner can see what synced
- Graceful degradation: if an integration is down, core features still work

### 7.2 POS & Order Management Integrations

| Integration | What it does | Priority |
|-------------|-------------|----------|
| Square POS | Sync orders, match to customer profiles, pull transaction data | P1 |
| Shopify (for online orders) | Match online orders to phone customers | P2 |
| Clover POS | Same as Square for Clover users | P2 |
| Generic CSV order import | For shops with any other POS: upload CSV of orders | P1 |
| Manual order entry | Quick form to log an order from the dashboard | P0 |
| QuickBooks sync | Push customer + order data to QuickBooks | P2 |
| Xero sync | Same for Xero users | P3 |

### 7.3 Calendar & Scheduling

| Integration | What it does | Priority |
|-------------|-------------|----------|
| Google Calendar sync | Push delivery dates, consultation appointments to GCal | P1 |
| Apple Calendar (iCal) | Export reminders as .ics files | P2 |
| Calendly / Acuity | Let customers book consultations from a link | P3 |
| Holiday calendar | Auto-load US holidays, florist peak days | P1 |

### 7.4 Communication Tools

| Integration | What it does | Priority |
|-------------|-------------|----------|
| Twilio SMS (alternative) | Send SMS via Twilio if shop prefers | P2 |
| Mailchimp export | Push segments to Mailchimp for email campaigns | P2 |
| Constant Contact export | Same for Constant Contact users | P3 |
| WhatsApp Business | Two-way messaging for shops that use WhatsApp | P3 |
| Slack notifications | Push call summaries and alerts to a Slack channel | P2 |

### 7.5 Delivery & Logistics

| Integration | What it does | Priority |
|-------------|-------------|----------|
| Google Maps / routing | Optimize delivery routes from extracted addresses | P2 |
| DoorDash Drive | Request on-demand delivery for arrangements | P3 |
| FTD / Teleflora relay | For orders that need to be relayed to another florist | P3 |
| Delivery confirmation tracking | Track "delivered" status, notify customer | P2 |

### 7.6 Review & Reputation

| Integration | What it does | Priority |
|-------------|-------------|----------|
| Google Reviews | Auto-request review after positive calls (sentiment = positive) | P2 |
| Yelp | Monitor mentions, respond from dashboard | P3 |
| Facebook Reviews | Same for Facebook page reviews | P3 |

### 7.7 Open API & Webhooks

| Feature | Description | Priority |
|---------|-------------|----------|
| REST API | Expose customer, call, order, reminder data via API | P2 |
| Webhook system | Push events (new_call, new_customer, reminder_due) to external URLs | P2 |
| Zapier integration | Connect to 5000+ apps via Zapier triggers/actions | P2 |
| API key management | Generate, revoke, rate-limit API keys per shop | P2 |
| Webhook retry & logging | Auto-retry failed webhooks, show delivery log | P3 |

---

## PART 8: SETTINGS, ADMIN & COMPLIANCE (MVP Week 11–12)

### 8.1 Shop Settings

| Feature | Description | Priority |
|---------|-------------|----------|
| Shop profile | Name, address, phone, business hours, timezone | P0 |
| Phone number management | View assigned number, request new number | P0 |
| Call forwarding configuration | Primary number, backup number, voicemail | P0 |
| Consent mode | Auto-set by state, manual override available | P0 |
| Custom greeting editor | Text-to-speech preview, or upload audio file | P1 |
| Notification preferences | What triggers push/email notifications | P1 |
| Recording retention policy | Auto-delete after 30/60/90/365 days | P1 |
| Business hours schedule | Set open/close hours per day of week | P1 |

### 8.2 Billing & Plans

| Feature | Description | Priority |
|---------|-------------|----------|
| Stripe subscription management | Subscribe, upgrade, downgrade, cancel | P0 |
| 14-day free trial | Full access, no credit card required to start | P0 |
| Usage dashboard | Calls this month, storage used, API calls | P1 |
| Plan tiers | Starter ($49): 300 calls/mo, Pro ($69): 1000 calls/mo, Growth ($99): unlimited + marketing tools | P0 |
| Overage handling | Soft limit: notify at 80%, pause recording at 120% | P1 |
| Annual billing discount | 20% off for annual prepay | P2 |
| Referral program | "Refer a florist, get 1 month free" | P2 |

### 8.3 Data & Privacy

| Feature | Description | Priority |
|---------|-------------|----------|
| Customer data export (CSV) | Export all customer data on demand | P0 |
| Full data deletion | Delete all data for CCPA/GDPR compliance | P0 |
| Recording encryption at rest | AES-256 encryption for all stored recordings | P0 |
| Audit log | Who accessed what data and when | P2 |
| Data processing agreement | DPA available for GDPR-affected customers | P2 |
| Consent log | Record of every consent disclosure played | P1 |
| Right to deletion for end-customers | Customers can request their call data be deleted | P1 |

### 8.4 Team & Permissions (Post-MVP)

| Feature | Description | Priority |
|---------|-------------|----------|
| Multi-user access | Invite team members with email | P2 |
| Role-based permissions | Owner, Manager (no billing), Staff (view-only) | P2 |
| Per-user call assignment | Route certain callers to specific staff | P3 |
| Activity log per user | Track who did what | P2 |

---

## PART 9: ONBOARDING & GROWTH (MVP Week 10, 13–16)

### 9.1 Onboarding Flow

| Feature | Description | Priority |
|---------|-------------|----------|
| Sign-up wizard | 4-step: Shop info → State/consent → Phone setup → Test call | P0 |
| Auto number provisioning | Provision Vonage number matching shop's area code | P0 |
| Call forwarding instructions | Per-carrier guides (AT&T, Verizon, T-Mobile, etc.) | P0 |
| Test call feature | "Call your number now to test" with real-time verification | P0 |
| Welcome email sequence | 5-email drip: welcome, setup tips, first week guide, feature highlights, check-in | P1 |
| In-app onboarding tour | Guided tooltips on first dashboard visit | P1 |
| Sample data mode | Pre-loaded demo customers so empty state isn't confusing | P2 |
| Video walkthrough library | 2-3 minute videos for each major feature | P2 |

### 9.2 Landing Page & Marketing Site

| Feature | Description | Priority |
|---------|-------------|----------|
| Landing page | Hero, features, pricing, testimonials, CTA | P0 |
| Pricing page | Compare Starter / Pro / Growth plans | P0 |
| Blog | SEO-optimized articles for florist business owners | P1 |
| Case studies | "How Green Thumb Florist increased repeat orders by 40%" | P2 |
| ROI calculator | "Enter your call volume → See how much revenue you're missing" | P2 |
| Live demo booking | Calendly embed for personal demo calls | P1 |

---

## PART 10: MOBILE EXPERIENCE (Post-MVP Phase 2)

### 10.1 Progressive Web App (PWA)

| Feature | Description | Priority |
|---------|-------------|----------|
| Mobile-optimized dashboard | Responsive design works on phone screens | P0 |
| Push notifications on mobile | Call alerts, reminders, task due dates | P1 |
| Add to home screen | PWA install prompt | P1 |
| Offline customer lookup | Cache recent customers for offline access | P3 |
| Quick call log | Swipe to log a call outcome from mobile | P2 |

### 10.2 Native App (Future)

| Feature | Description | Priority |
|---------|-------------|----------|
| iOS app | Native app with push notifications | P3 |
| Android app | Same for Android | P3 |
| Apple Watch complication | See caller name on wrist when phone rings | Future |
| Widget for home screen | "3 reminders today, 12 calls so far" | Future |

---

## PART 11: AI-POWERED FEATURES (Post-MVP, high differentiation)

### 11.1 AI Assistant

| Feature | Description | Priority |
|---------|-------------|----------|
| Natural language search | "Show me all customers who ordered sympathy flowers in December" | P2 |
| AI-generated call summaries | Paragraph-style summaries, not just extracted entities | P0 |
| Suggested follow-ups | "Mrs. Park's daughter's recital is next week — suggest a bouquet" | P2 |
| Auto-draft marketing messages | "Write an SMS for Valentine's Day to customers who bought roses last year" | P2 |
| Conversation coaching | Post-call tips: "Try mentioning delivery options earlier in the conversation" | P3 |
| Trend detection | "You're getting more sympathy orders than usual — consider a sympathy collection page" | P3 |

### 11.2 AI for Operations

| Feature | Description | Priority |
|---------|-------------|----------|
| Demand forecasting | "Based on call patterns, expect 40% more orders next week (Mother's Day)" | P3 |
| Inventory suggestions | "Rose orders are up 60% — consider ordering extra stock" | P3 |
| Pricing insights | "Customers rarely push back on arrangements over $75 — you may be underpricing" | Future |
| Staffing suggestions | "Tuesday and Wednesday mornings are your busiest call windows" | P2 |

---

## PART 12: EXPANSION PATH — BEYOND FLORISTS

### 12.1 Vertical Adaptation

The CRM is built vertical-first (florists) but the architecture supports horizontal expansion. Key customization points:

| Vertical | Custom vocabulary | Key entities | Loyalty twist |
|----------|------------------|-------------|---------------|
| Florists | Flower names, arrangements, occasions | Products, delivery date, address, occasion | "Buy 9, get 10th free" |
| Bakeries | Cake types, flavors, dietary restrictions | Products, pickup date, dietary needs, party size | Punch card for coffee/pastries |
| Salons | Service types, stylists, products | Appointment, stylist preference, service history | "Every 5th haircut free" |
| Auto shops | Car make/model, service types, parts | Vehicle info, service due date, mileage | Oil change loyalty card |
| Vet clinics | Breeds, medications, procedures | Pet info, vaccination schedule, allergies | Annual wellness plan discount |
| Restaurants | Menu items, dietary needs, party size | Reservation date, party size, preferences | Frequent diner rewards |

### 12.2 White-Label & Platform Play (Future)

| Feature | Description |
|---------|-------------|
| White-label option | Resellers can brand it as their own |
| Industry template marketplace | Community-contributed templates per vertical |
| App marketplace | Third-party developers build integrations |
| Partner API | POS companies embed CallContext into their product |

---

## DATABASE SCHEMA OVERVIEW

### Core Tables

```
shops
├── id, name, address, state, timezone
├── vonage_number, forwarding_to
├── consent_mode (auto/silent/always)
├── subscription_plan, stripe_customer_id
├── business_hours (JSONB)
└── settings (JSONB)

customers
├── id, shop_id, phone, email
├── first_name, last_name
├── address, city, state, zip
├── preferences (JSONB: flowers, colors, allergies)
├── tags (array)
├── loyalty_tier, loyalty_points
├── lifetime_value, total_orders
├── first_contact_date, last_contact_date
└── communication_preference (sms/email/phone)

calls
├── id, shop_id, customer_id
├── vonage_call_id, direction (inbound/outbound)
├── started_at, ended_at, duration
├── recording_url, transcript (text)
├── ai_summary, sentiment
├── entities_extracted (JSONB)
├── follow_up_needed (boolean)
└── tags (array)

orders (linked from calls or manual entry)
├── id, shop_id, customer_id, call_id
├── products (JSONB array)
├── delivery_date, delivery_address
├── occasion, special_instructions
├── total_amount, status
└── created_at

reminders
├── id, shop_id, customer_id
├── title, description
├── reminder_date, advance_days
├── recurring (boolean), recurrence_pattern
├── status (pending/sent/dismissed/snoozed)
└── created_by (auto/manual)

notes
├── id, shop_id, customer_id, call_id
├── content, pinned (boolean)
├── created_by (user_id)
└── created_at

tasks
├── id, shop_id, customer_id
├── title, description
├── due_date, status (open/done)
├── assigned_to (user_id)
└── created_at

loyalty_transactions
├── id, shop_id, customer_id
├── type (earn/redeem/adjust/expire)
├── points, description
├── order_id (nullable)
└── created_at

campaigns
├── id, shop_id
├── name, type (sms/email)
├── segment_id, template_id
├── content, subject (email only)
├── scheduled_at, sent_at
├── stats (JSONB: sent, delivered, opened, clicked)
└── status (draft/scheduled/sent)

integrations
├── id, shop_id
├── provider (square/google_calendar/mailchimp/etc)
├── credentials (encrypted JSONB)
├── config (JSONB: field mappings, sync direction)
├── last_synced_at, status
└── created_at

webhook_endpoints
├── id, shop_id
├── url, events (array of event types)
├── secret (for signature verification)
├── active (boolean)
└── created_at
```

---

## PHASED DELIVERY ROADMAP

### Phase 1: MVP Core (Week 1–16) — $49/mo Starter Plan
- Call routing, recording, real-time transcription
- Customer profiles (auto-created from calls)
- Call history with playback and transcripts
- Smart reminders (auto-detected dates)
- Dashboard analytics (basic call stats)
- Onboarding wizard, Stripe billing

### Phase 2: CRM Power-Ups (Month 5–6) — Upgrade to $69/mo Pro Plan
- Customer segmentation & smart lists
- SMS marketing (broadcast + personalized)
- Email campaigns (template-based)
- Google Calendar integration
- Square POS integration
- Loyalty program (basic points + tiers)

### Phase 3: Growth Engine (Month 7–9) — $99/mo Growth Plan
- Automation rules engine (triggers → actions)
- AI-powered marketing copy generation
- Review request automation
- Zapier integration (opens 5000+ connections)
- REST API + webhooks
- Multi-user team access

### Phase 4: Platform (Month 10–12)
- Additional POS integrations (Clover, Shopify)
- Delivery routing optimization
- Demand forecasting
- Vertical expansion (bakeries, salons)
- Mobile native app (PWA first, then iOS)
- White-label option for resellers

---

## PRICING STRATEGY

| Plan | Price | Target | Key Features |
|------|-------|--------|-------------|
| **Starter** | $49/mo | Solo florist, <300 calls/mo | Calls, transcription, profiles, reminders, basic analytics |
| **Pro** | $69/mo | Busy shop, <1000 calls/mo | + Segments, SMS & email marketing, integrations, loyalty program |
| **Growth** | $99/mo | Growing business, unlimited | + Automations, API, multi-user, AI marketing, Zapier |
| **Enterprise** | Custom | Multi-location | White-label, custom integrations, dedicated support |

All plans include: 14-day free trial, call recording & transcription, customer profiles, smart reminders.

**Add-on pricing:**
- Extra SMS credits: $0.02/message beyond plan allotment
- Additional phone numbers: $2.99/mo each
- Call recording storage beyond 90 days: $4.99/mo

---

## COMPETITIVE MOAT

What makes CallContext hard to replicate:

1. **Call intelligence is the data flywheel** — Every call enriches customer profiles automatically. Competitors require manual data entry.
2. **Built for phone-first businesses** — Not a general CRM with a phone add-on. The phone call IS the interface.
3. **AI that understands florists** — Tuned vocabulary, occasion detection, seasonal awareness.
4. **Zero behavior change required** — Shop owner keeps answering their phone the same way. Everything happens in the background.
5. **Network effects from integrations** — The more tools connected, the harder to leave.
6. **Vertical-specific templates** — Marketing templates, loyalty programs, and automations designed for each vertical.
