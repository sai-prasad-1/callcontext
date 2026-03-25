# Daily Email Digest System

## Overview
Automated daily email digest system that sends shop owners a summary of their business metrics, reminders, pending orders, and overdue tasks every morning at 8 AM local time.

## Files Created

### 1. `lib/resend/client.ts`
Resend email client configuration. Requires `RESEND_API_KEY` environment variable.

### 2. `lib/email/daily-digest.tsx`
Email template generator with inline CSS for email client compatibility. Generates a beautiful HTML email with:
- Header with shop name and date
- 4 stat cards: calls, new customers, missed calls, revenue
- Today's reminders (max 5)
- Pending orders (max 5)
- Overdue tasks with red badges (max 5)
- "View Dashboard" CTA button
- Footer

### 3. `app/api/cron/daily-digest/route.ts`
Cron route handler that:
- Verifies `CRON_SECRET` from Authorization header
- Queries all shops
- For each shop:
  - Checks if it's 8 AM in the shop's local timezone
  - Fetches yesterday's stats with week-over-week comparison
  - Fetches today's reminders, pending orders, and overdue tasks
  - Gets shop owner email from Supabase Auth
  - Generates HTML email
  - Sends via Resend
- Returns: `{ processed: number, sent: number, errors: [] }`

### 4. `vercel.json`
Vercel cron configuration with three cron jobs:
- `/api/cron/daily-digest` - runs hourly (checks for 8 AM per shop)
- `/api/cron/process-reminders` - runs hourly
- `/api/cron/process-automations` - runs every 15 minutes

## Environment Variables Required

Add these to your `.env.local` and production environment:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
CRON_SECRET=your-secure-random-string
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
```

## Dependencies Installed

- `resend` (already installed)
- `date-fns-tz` (newly installed for timezone handling)

## How It Works

1. **Vercel Cron** triggers `/api/cron/daily-digest` every hour
2. The route handler queries all shops and checks their local time
3. If a shop's local time is 8:00 AM, it proceeds with data collection:
   - Yesterday's call count (with week-over-week % change)
   - New customers added yesterday
   - Missed calls yesterday
   - Revenue from yesterday's orders
   - Today's pending reminders
   - Pending orders with upcoming delivery dates
   - Overdue tasks
4. The HTML email is generated with all data
5. Email is sent to the shop owner via Resend
6. Results are logged and returned

## Testing Locally

```bash
# Set up environment variables
cp .env.example .env.local
# Add RESEND_API_KEY, CRON_SECRET, and other vars

# Run the dev server
npm run dev

# Test the cron endpoint
curl http://localhost:3000/api/cron/daily-digest \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Deployment Notes

1. Add all environment variables to Vercel project settings
2. Vercel will automatically detect `vercel.json` and set up cron jobs
3. The cron runs in UTC, but the logic handles timezone conversion per shop
4. Monitor logs in Vercel dashboard for errors
5. Email deliverability depends on Resend domain configuration

## Customization

To modify the email design, edit `lib/email/daily-digest.tsx`:
- Change colors by updating the inline styles
- Add/remove sections by modifying the template
- Adjust stats by changing the query logic in the route handler

## Future Enhancements

- Add email preferences (frequency, content sections)
- Support for custom digest times (not just 8 AM)
- Weekly/monthly digest options
- Email analytics tracking
- A/B testing for subject lines
- Personalized recommendations
