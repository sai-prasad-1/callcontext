# API & Webhooks Implementation

This document describes the API keys, REST API v1, and webhooks implementation for CallContext.

## Features

### 1. API Key Management
- Create and manage API keys for REST API access
- Keys are securely hashed (SHA-256) and only shown once upon creation
- Track usage: last used date and total request count
- Revoke keys when needed
- Owner-only access control

### 2. REST API v1
- Authenticated using API keys via `X-API-Key` header
- Rate limiting: 100 requests per minute per shop
- Automatic tracking of API key usage

#### Available Endpoints

**Customers**
- `GET /api/v1/customers` - List customers (pagination, search)
- `POST /api/v1/customers` - Create customer
- `GET /api/v1/customers/[id]` - Get customer details
- `PATCH /api/v1/customers/[id]` - Update customer
- `DELETE /api/v1/customers/[id]` - Delete customer

**Calls**
- `GET /api/v1/calls` - List calls (pagination, filters)
- `GET /api/v1/calls/[id]` - Get call details

**Orders**
- `GET /api/v1/orders` - List orders (pagination, filters)
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/[id]` - Get order details
- `PATCH /api/v1/orders/[id]` - Update order

**Reminders**
- `GET /api/v1/reminders` - List reminders (pagination, filters)
- `POST /api/v1/reminders` - Create reminder
- `GET /api/v1/reminders/[id]` - Get reminder details
- `PATCH /api/v1/reminders/[id]` - Update reminder
- `DELETE /api/v1/reminders/[id]` - Delete reminder

### 3. Webhooks
- Configure webhook endpoints to receive real-time events
- HMAC-SHA256 signature verification using webhook secret
- Automatic retry with exponential backoff (3 attempts: 1s, 2s, 4s)
- Delivery history tracking with full payload and response logging
- Active/inactive toggle for each endpoint
- Test webhook functionality

#### Available Events
- `customer.created` - New customer created
- `customer.updated` - Customer information updated
- `call.completed` - Call finished
- `order.created` - New order created
- `order.updated` - Order status or details updated

#### Webhook Payload Format
```json
{
  "id": "webhook-delivery-id",
  "event": "customer.created",
  "data": {
    // Event-specific data
  },
  "timestamp": "2026-03-26T10:30:00Z"
}
```

#### Headers Sent
- `X-Webhook-Signature` - HMAC-SHA256 signature of the payload
- `X-Webhook-Event` - Event type (e.g., "customer.created")

## Database Schema

### `api_keys` Table
```sql
- id: UUID (primary key)
- shop_id: UUID (foreign key to shops)
- name: TEXT (user-friendly name)
- key_hash: TEXT (SHA-256 hash of the key)
- key_prefix: TEXT (first 10 chars for display)
- last_used_at: TIMESTAMPTZ (nullable)
- total_requests: INTEGER (default 0)
- revoked: BOOLEAN (default false)
- created_at: TIMESTAMPTZ
```

## File Structure

### Backend
```
app/api/
├── api-keys/
│   ├── route.ts                    # GET (list), POST (create)
│   └── [id]/route.ts              # DELETE (revoke)
├── v1/
│   ├── middleware.ts              # API key authentication
│   ├── customers/
│   │   ├── route.ts               # GET, POST
│   │   └── [id]/route.ts          # GET, PATCH, DELETE
│   ├── calls/
│   │   ├── route.ts               # GET
│   │   └── [id]/route.ts          # GET
│   ├── orders/
│   │   ├── route.ts               # GET, POST
│   │   └── [id]/route.ts          # GET, PATCH
│   └── reminders/
│       ├── route.ts               # GET, POST
│       └── [id]/route.ts          # GET, PATCH, DELETE
└── webhooks/
    ├── route.ts                   # GET (list), POST (create)
    └── [id]/
        ├── route.ts               # PATCH (update), DELETE
        ├── test/route.ts          # POST (send test webhook)
        └── deliveries/route.ts    # GET (delivery history)
```

### Frontend
```
app/dashboard/settings/api/
└── page.tsx                       # API settings page

components/settings/
├── ApiSettingsClient.tsx          # Main client wrapper
├── ApiKeyManager.tsx              # API key management UI
├── WebhookManager.tsx             # Webhook management UI
└── WebhookDeliveryModal.tsx       # Webhook delivery history modal
```

### Libraries
```
lib/
├── webhooks/
│   └── dispatch.ts                # Webhook dispatch helper
└── types/
    └── database.ts                # Updated with api_keys types
```

## Usage Guide

### For Shop Owners

1. **Navigate to Settings > API**
   - Only shop owners can access this page

2. **Create an API Key**
   - Click "Create Key"
   - Enter a descriptive name
   - Copy the generated key (shown only once!)
   - Store it securely

3. **Create a Webhook**
   - Click "Create Webhook"
   - Enter your endpoint URL
   - Select events to subscribe to
   - Add optional description
   - Copy the secret (shown only once!)
   - Use the secret to verify webhook signatures

4. **Test Webhooks**
   - Click "Test" on any webhook
   - Check delivery history to see results

### For Developers

#### Using the REST API

```bash
# Example: List customers
curl -H "X-API-Key: ck_your_api_key_here" \
  https://your-domain.com/api/v1/customers

# Example: Create customer
curl -X POST \
  -H "X-API-Key: ck_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "first_name": "John"}' \
  https://your-domain.com/api/v1/customers
```

#### Verifying Webhook Signatures

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}

// In your webhook handler
app.post('/webhooks/callcontext', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const event = req.headers['x-webhook-event'];
  
  if (!verifyWebhookSignature(req.body, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook
  console.log(`Received ${event}:`, req.body);
  res.status(200).send('OK');
});
```

## Security

- API keys are hashed using SHA-256 before storage
- Only the key prefix is stored in plain text for display
- Keys are shown only once during creation
- Rate limiting: 100 requests per minute per shop
- Webhook signatures use HMAC-SHA256 for verification
- Row Level Security (RLS) enforces shop-level access control

## Environment Variables Required

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Migration

To apply the database migration:

```bash
# Run the migration
psql -h your-host -U your-user -d your-database -f supabase/migrations/011_api_keys_table.sql
```

Or if using Supabase CLI:

```bash
supabase db push
```

## Triggering Webhooks Programmatically

Use the `dispatchWebhook` helper in your code:

```typescript
import { dispatchWebhook } from "@/lib/webhooks/dispatch";

// After creating a customer
await dispatchWebhook({
  shopId: customer.shop_id,
  event: "customer.created",
  data: customer,
});
```

## Rate Limits

- REST API: 100 requests per minute per shop
- Webhook retries: 3 attempts with exponential backoff

## Future Enhancements

- API key scopes/permissions (read-only, specific resources)
- Webhook event filtering by customer tags or other criteria
- API usage analytics dashboard
- Webhook replay functionality
- Custom rate limits per API key
