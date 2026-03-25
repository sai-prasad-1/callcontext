# Automation Rules Feature

## Overview

The automation rules feature enables CallContext to automatically engage customers at the right time with smart triggers and actions. This feature includes 6 pre-built automation rules that can be enabled/disabled and customized by users.

## Components Built

### 1. Database Migration

**File**: `supabase/migrations/012_scheduled_actions_table.sql`

Creates the `scheduled_actions` table to store pending, completed, and failed automation executions. Includes:
- Action type (SMS, email, task, reminder, customer update)
- Action configuration (JSONB)
- Execution time
- Status tracking
- Error logging
- Row-level security policies

### 2. Constants & Types

**File**: `lib/constants/automation-rules.ts`

Defines 6 pre-built automation rules:
1. **Welcome SMS** - Send welcome message 1 hour after new customer joins
2. **Post-Delivery Follow-up** - Check in 2 days after order delivery
3. **Birthday Outreach** - Send birthday wishes on customer's birthday
4. **Win Back Inactive** - Re-engage customers inactive for 90+ days
5. **Review Request** - Request review 7 days after positive call
6. **Follow-up Task** - Create task when call marked for follow-up

### 3. API Routes

#### Main Routes
- `GET /api/automations` - Fetch all rules with settings and stats
- `PATCH /api/automations/[ruleId]` - Update rule settings (enabled/template)
- `GET /api/automations/[ruleId]/history` - Get execution history

#### Cron Route
- `GET /api/cron/process-automations` - Process pending scheduled actions

**File**: `app/api/cron/process-automations/route.ts`

Processes scheduled actions:
- Sends SMS via Vonage (when configured)
- Sends emails via Resend
- Creates tasks in tasks table
- Creates reminders in reminders table
- Updates customer records

### 4. Trigger Helpers

**File**: `lib/automations/triggers.ts`

Helper functions to create scheduled actions:
- `triggerAutomation()` - Generic trigger with delay
- `triggerWelcomeSMS()` - Welcome new customers
- `triggerPostDeliveryFollowup()` - Post-delivery engagement
- `triggerFollowupTask()` - Create follow-up tasks
- `triggerReviewRequest()` - Request reviews
- `renderTemplate()` - Template variable substitution

### 5. Integration Points

Updated existing API routes to trigger automations:

**customers/route.ts** (POST)
- Triggers welcome SMS automation when new customer is created

**orders/[id]/route.ts** (PATCH)
- Triggers post-delivery follow-up when order status changes to "delivered"

**calls/[id]/route.ts** (PATCH)
- Triggers follow-up task when `follow_up_needed` is set to true
- Triggers review request when sentiment changes to "positive"

### 6. UI Components

#### Page
**File**: `app/dashboard/automations/page.tsx`
- Server component for automations dashboard

#### Components
1. **AutomationsListClient** - Main list view with loading/empty states
2. **AutomationCard** - Individual rule card with:
   - Toggle switch for enable/disable
   - Visual status indicators
   - Stats display (pending, completed, failed)
   - Edit template button
   - View history button
   - Colored badges for triggers and actions

3. **AutomationHistoryModal** - Execution history with:
   - Paginated list of executions
   - Status indicators (completed, failed, pending)
   - Error messages
   - Execution timestamps

4. **EditTemplateModal** - Template editor with:
   - Textarea for message customization
   - Variable reference guide
   - Save/cancel actions

## Template Variables

Templates support the following variables:
- `{{first_name}}` - Customer's first name
- `{{shop_name}}` - Shop name
- `{{customer_name}}` - Full customer name
- `{{call_summary}}` - AI summary of call
- `{{review_link}}` - Review link URL

## Database Schema

```sql
CREATE TABLE scheduled_actions (
  id UUID PRIMARY KEY,
  shop_id UUID REFERENCES shops(id),
  rule_id TEXT NOT NULL,
  action_type TEXT CHECK (action_type IN ('send_sms', 'send_email', 'create_task', 'create_reminder', 'update_customer')),
  action_config JSONB NOT NULL,
  execute_at TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

## Setup Instructions

### 1. Run Migration
```bash
# Apply the migration
supabase db push
```

### 2. Configure Cron Job
Add to Vercel cron configuration or use external cron service:
```
GET /api/cron/process-automations
Authorization: Bearer <CRON_SECRET>
```

Recommended: Run every 5-15 minutes

### 3. Environment Variables
Required:
- `CRON_SECRET` - Secret for cron authentication
- `RESEND_API_KEY` - For email sending
- `VONAGE_API_KEY` - (Optional) For SMS sending
- `VONAGE_API_SECRET` - (Optional) For SMS sending

### 4. Access the Feature
Navigate to `/dashboard/automations` to:
- View all automation rules
- Enable/disable rules
- Customize message templates
- View execution history and stats

## Usage Flow

1. **Customer Creates Account** → Welcome SMS scheduled for 1 hour later
2. **Order Marked Delivered** → Follow-up SMS scheduled for 48 hours later
3. **Call Marked Follow-up** → Task created immediately
4. **Call Sentiment = Positive** → Review request scheduled for 7 days later
5. **Cron Job Runs** → Processes all pending scheduled actions

## Default Settings

All rules start with default settings stored in `shops.settings.automations`:
```json
{
  "automations": {
    "welcome_sms": {
      "enabled": true,
      "template": "Hi {{first_name}}! Thanks for contacting {{shop_name}}..."
    },
    "post_delivery_followup": {
      "enabled": true,
      "template": "Hi {{first_name}}, how was your recent order..."
    }
    // ... etc
  }
}
```

## Future Enhancements

Potential additions:
- Custom rule builder
- A/B testing for templates
- Advanced scheduling (business hours, timezone-aware)
- SMS/email preview before sending
- Detailed analytics dashboard
- Rule conditions and filters
- Integration with external services (Mailchimp, Twilio, etc.)

## Notes

- SMS sending requires Vonage API configuration
- Email sending uses Resend API
- All automations respect customer communication preferences
- Failed executions are logged with error messages
- Scheduled actions can be cancelled before execution
