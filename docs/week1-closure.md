# Week 1 Closure

Production URL: [https://callcontext.vercel.app/](https://callcontext.vercel.app/)

## Completed in Closure Pass

- Set Next.js Turbopack root explicitly in `callcontext-frontend/next.config.ts` to avoid workspace-root ambiguity.
- Updated metadata base URL to production in `callcontext-frontend/app/layout.tsx`.
- Added auth callback flow tests:
  - Recovery token verification redirect
  - Invalid recovery token redirect messaging
  - Open-redirect protection for `next` parameter

## Supabase Auth Dashboard Verification

In Supabase Dashboard (`Authentication` -> `URL Configuration`), confirm:

- Site URL: `https://callcontext.vercel.app`
- Additional Redirect URLs:
  - `http://localhost:3000/api/auth/callback`
  - `https://callcontext.vercel.app/api/auth/callback`
  - `http://localhost:3000/reset-password`
  - `https://callcontext.vercel.app/reset-password`

## Known Development Constraints

- Supabase email sends can return `429 over_email_send_rate_limit` during repeated auth tests.
- The app now returns user-friendly guidance for rate-limited signup/reset attempts.

