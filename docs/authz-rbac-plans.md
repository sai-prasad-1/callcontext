# Authorization: RBAC, Plans, and Feature Gates

This document describes how **role-based access control (RBAC)** and **subscription plans** work together in CallContext, and how to extend them safely.

## Mental model

Two independent checks apply to gated capabilities:

1. **Role (RBAC)** — *Who is this user in the shop?* What actions are they allowed to attempt?
2. **Plan (entitlements)** — *What has the shop paid for?* Which capabilities are enabled for this subscription tier?

A feature is **allowed** only when **both** pass:

```text
allowed = roleAllows(role, feature) AND planAllows(plan, feature)
```

**Important:** UI hiding and nav filtering improve UX; **server-side enforcement** (RLS + API guards) is what actually protects data and actions.

---

## Database layer

### `shop_memberships`

Stores which users belong to which shop and in what capacity.

| Column       | Notes |
|-------------|--------|
| `shop_id`   | FK → `shops.id` |
| `user_id`   | FK → `auth.users.id` |
| `role`      | `owner`, `manager`, `staff`, `analyst` |
| `status`    | `active`, `invited`, `suspended` |
| `invited_by`| Optional FK for future invite flow |

- **Unique** on `(shop_id, user_id)`.
- **Migrations:** `supabase/migrations/005_rbac_shop_memberships.sql`
  - Backfills an **owner** row for every existing shop.
  - **Trigger** on `shops` **AFTER INSERT**: creates owner membership for new shops (signup / admin inserts).

### `shop_ids_for_current_user()`

SQL function (**SECURITY DEFINER**, `search_path = public`) that returns all `shop_id` values the current session may access:

- Shops where `owner_id = auth.uid()`
- **Union** active rows in `shop_memberships` for `user_id = auth.uid()`

**Migration:** `supabase/migrations/006_rls_shop_access_and_memberships.sql`

The function body filters explicitly on `auth.uid()` so it does not leak cross-tenant data. It is granted to `authenticated` only.

### RLS updates (006)

- **Tenant tables** (customers, calls, orders, etc.): policies use  
  `shop_id IN (SELECT public.shop_ids_for_current_user())`  
  instead of only `shops.owner_id = auth.uid()`, so **staff with active membership** can access shop data.
- **`shops`**: SELECT for any accessible shop; UPDATE for **owner** or **owner/manager** membership (see migration for exact rules).
- **`shop_memberships`**: SELECT for relevant users/managers; INSERT/UPDATE/DELETE restricted to **shop owner** (invite tooling can evolve later).
- **`waitlist`**: SELECT for authenticated users who have at least one accessible shop.

Apply migrations in order (see `supabase/README.md`).

---

## Application layer (`callcontext-frontend`)

### Module layout

| File | Responsibility |
|------|----------------|
| `lib/authz/features.ts` | **`Feature`** — canonical string keys for capabilities (`Feature.CALLS_ACCESS`, etc.). **`ALL_FEATURES`** list. |
| `lib/authz/roles.ts` | **`ShopRole`**, **`ROLE_FEATURES`** — per-role set of allowed features (plan not applied here). **`parseShopRole`**, **`roleAllowsFeature`**. |
| `lib/authz/plans.ts` | **`SubscriptionPlan`**, **`FEATURE_MIN_PLAN`** — minimum plan tier per feature (inclusive). **`planAllowsFeature`**, **`parseSubscriptionPlan`**, **`planMeetsMinimum`**. |
| `lib/authz/evaluate.ts` | **`canAccessFeature`**, **`listAllowedFeatures`** — combines role + plan. |
| `lib/authz/server.ts` | **`getDashboardAccess(supabase, userId)`** — resolves primary shop + role + plan + computed **`allowedFeatures`**. |
| `lib/authz/guard.ts` | **`forbiddenUnlessFeature(role, plan, feature)`** — returns `NextResponse` 403 or `null` for Route Handlers. |
| `lib/authz/index.ts` | Re-exports for convenient imports. |

### Resolving dashboard context

`getDashboardAccess`:

1. Loads the **first** active `shop_memberships` row for the user (ordered by `created_at`), with nested `shops` fields.
2. If none (e.g. migrations not applied yet), **falls back** to a shop where `owner_id = user.id`.

Returns `null` if the user has no shop — the dashboard layout redirects to signup.

### API: current access snapshot

- **`GET /api/me/access`** (`app/api/me/access/route.ts`)  
  Returns JSON: `shop`, `role`, `plan`, `allowedFeatures`.  
  Useful for client hydration or debugging; **do not** rely on it alone for authorization of mutations.

### API: billing & team (dashboard)

- **`PATCH /api/shop/billing`** — Shop **owner** only. Merges `usage_billing_enabled` and `preferred_billing_mode` (`subscription` | `usage` | `hybrid`) into `shops.settings` JSON.
- **`GET /api/shop/team`** — Lists `shop_memberships` for the current shop; enriches emails via Auth Admin when `SUPABASE_SERVICE_ROLE_KEY` is set.
- **`POST /api/shop/team`** — **Owner or manager** with plan-gated **`Feature.TEAM_INVITE`**. Invites new emails or links existing users (via **`lookup_user_id_by_email`**, migration `007`) and inserts membership using the service role.

Pay-per-minute list price for UI and estimates: **`lib/billing/pricing.ts`** (`PAY_PER_MINUTE_USD = 0.05`). Stripe metered billing is not wired yet; toggles persist to **`shops.settings`** for product logic and future sync.

### UI: navigation gating

- `lib/utils/constants.ts` — **`NAV_ITEMS`** and **`NAV_BOTTOM`** include a **`feature`** (`FeatureKey`) per item and use **`/dashboard/...`** paths.
- **`Sidebar`** and **`MobileNav`** receive **`allowedFeatures`** from `app/dashboard/layout.tsx` and hide items the user cannot access.

---

## How to add a new gated capability

1. **`lib/authz/features.ts`** — Add a new entry to **`Feature`** (and it will be included in **`ALL_FEATURES`**).
2. **`lib/authz/roles.ts`** — Grant the feature in **`ROLE_FEATURES`** for each role that should have it (owners already get **`ALL_FEATURES`**).
3. **`lib/authz/plans.ts`** — If the capability is paid-only, set **`FEATURE_MIN_PLAN[feature] = SubscriptionPlan.XXX`**.
4. **Nav** — Add or tag items in **`NAV_ITEMS` / `NAV_BOTTOM`** with the **`feature`** key.
5. **Server routes** — After resolving `role` and `plan` for the shop (same source as `getDashboardAccess`), call:

   ```ts
   const denied = forbiddenUnlessFeature(role, plan, Feature.YOUR_FEATURE);
   if (denied) return denied;
   ```

6. **Tests** — Add cases in **`lib/authz/evaluate.test.ts`** for representative role/plan combinations.

---

## Roles (summary)

| Role     | Intent |
|----------|--------|
| `owner`  | Full feature set; billing and team management where defined. |
| `manager`| Broad operational access; excludes selected owner-only items (see `ROLE_FEATURES`). |
| `staff`  | Day-to-day ops (calls, customers, orders, reminders, tasks, settings shell). |
| `analyst`| Read-oriented + analytics-oriented features. |

Adjust **`ROLE_FEATURES`** as the product grows; keep comments in code minimal unless behavior is non-obvious.

---

## Plans (summary)

Plans mirror `shops.subscription_plan`: `trial`, `starter`, `pro`, `growth`.

**`FEATURE_MIN_PLAN`** defines the **minimum** tier that unlocks a feature. Features with **no** entry in **`FEATURE_MIN_PLAN`** are not plan-gated (only RBAC applies).

Tier ordering is defined in **`planMeetsMinimum`** / **`PLAN_RANK`** in `plans.ts`.

---

## Security checklist

- [ ] Every sensitive **mutation** checks **`forbiddenUnlessFeature`** (or equivalent) server-side.
- [ ] Data access still goes through **Supabase RLS** with **`shop_ids_for_current_user()`**.
- [ ] **Service role** usage bypasses RLS — restrict to trusted server code only.
- [ ] New tables with `shop_id` get policies consistent with 006 (or a follow-up migration).

---

## Related files

- Migrations: `supabase/migrations/005_rbac_shop_memberships.sql`, `006_rls_shop_access_and_memberships.sql`
- Supabase guide: `supabase/README.md` (migration order)
- Tests: `callcontext-frontend/lib/authz/evaluate.test.ts`

---

## Future work (not implemented)

- Invite / accept-invite flows and broader **`shop_memberships`** write policies for managers.
- Multi-shop switcher (user picks active `shop_id`; session or cookie).
- Usage meters (minutes, seats) enforced beside static plan gates.
- Stripe webhooks updating `subscription_plan` / status.
