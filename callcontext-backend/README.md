# CallContext Backend (Go)

Real-time call intelligence backend built with Go. Handles telephony webhooks, audio streaming, live transcription, and AI entity extraction for CallContext SaaS.

## Architecture

```
Vonage (Phone System)
    ↓ webhooks
Go Backend (Railway)
    ↓ streams
Deepgram (Transcription)
    ↓ analysis
OpenAI (Entity Extraction)
    ↓ saves to
Supabase (Database)
    ↓ real-time updates
Next.js Frontend (Vercel)
```

## Features

- **Vonage Integration**: Inbound call webhooks, NCCO responses, recording management
- **WebSocket Audio Streaming**: Bidirectional audio for Vonage + dashboard connections
- **Real-time Transcription**: Deepgram streaming with live interim results
- **AI Entity Extraction**: OpenAI GPT-4 for products, dates, addresses, sentiment
- **Supabase Integration**: Direct PostgreSQL access via REST API
- **Customer Profile Management**: Auto-merge extracted data into customer profiles
- **Webhook Delivery**: Fire-and-forget outbound webhooks with retries
- **Daily Digest Emails**: Cron-triggered reminder digests via Resend

## Tech Stack

- **Language**: Go 1.22+
- **HTTP Framework**: chi v5
- **WebSocket**: gorilla/websocket
- **AI/ML**: Deepgram SDK, OpenAI SDK
- **Database**: Supabase (PostgreSQL via REST)
- **Deployment**: Railway (Docker)

## Project Structure

```
callcontext-backend/
├── main.go                 # Entry point, router setup
├── config/
│   └── config.go          # Environment variable loading
├── handlers/
│   ├── health.go          # Health check endpoint
│   ├── vonage.go          # Vonage webhook handlers
│   ├── stream.go          # Audio WebSocket handler
│   ├── dashboard.go       # Dashboard WebSocket handler
│   └── cron.go            # Cron job handlers
├── services/
│   ├── supabase.go        # Supabase DB operations
│   ├── deepgram.go        # Deepgram streaming
│   ├── openai.go          # OpenAI entity extraction
│   ├── vonage.go          # Vonage API client
│   ├── storage.go         # Supabase Storage
│   ├── webhook.go         # Outbound webhook delivery
│   └── email.go           # Resend email client
├── pipeline/
│   └── call.go            # Call lifecycle orchestration
├── hub/
│   └── hub.go             # WebSocket connection manager
├── models/
│   └── types.go           # Shared types and structs
└── middleware/
    ├── logging.go         # Request logging + CORS
    └── auth.go            # JWT/API key verification
```

## Setup

### 1. Prerequisites

- Go 1.22 or higher
- Supabase project (with schema migrated)
- Vonage account with application configured
- Deepgram API key
- OpenAI API key
- Resend API key

### 2. Install Dependencies

```bash
cd callcontext-backend
go mod download
```

### 3. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Server
PORT=8080
ENVIRONMENT=development
BASE_URL=https://your-railway-app.railway.app

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_ANON_KEY=eyJhbGc...

# Vonage
VONAGE_API_KEY=abc123
VONAGE_API_SECRET=def456
VONAGE_APP_ID=xyz789
VONAGE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----

# Deepgram
DEEPGRAM_API_KEY=your-key-here

# OpenAI
OPENAI_API_KEY=sk-...

# Resend
RESEND_API_KEY=re_...

# Security
WEBHOOK_SIGNING_SECRET=random-secret-string
CRON_SECRET=random-cron-secret
```

### 4. Run Locally

```bash
go run main.go
```

Server starts on `http://localhost:8080`

Test health check:
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "service": "callcontext-backend"
}
```

## Deployment (Railway)

### 1. Connect Repository

1. Go to [Railway](https://railway.app)
2. Create new project
3. Connect your GitHub repository
4. Select `callcontext-backend/` as root directory

### 2. Set Environment Variables

In Railway dashboard, add all variables from `.env.example`:

```
PORT=8080
ENVIRONMENT=production
BASE_URL=https://your-app.railway.app
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
...
```

### 3. Deploy

Railway automatically:
- Detects Dockerfile
- Builds the image
- Deploys to production
- Provides a public URL

### 4. Configure Vonage Webhooks

Update your Vonage application with your Railway URL:

- **Answer URL**: `https://your-app.railway.app/api/vonage/answer`
- **Event URL**: `https://your-app.railway.app/api/vonage/event`
- **Recording URL**: `https://your-app.railway.app/api/vonage/recording`

## Development Workflow

### Build Order (Implementation Phases)

✅ **Phase 1: Foundation** (Complete)
- [x] main.go + config + health endpoint
- [x] Router setup with chi
- [x] Middleware (logging, CORS, panic recovery)
- [x] Dockerfile

🔨 **Phase 2: Models & Supabase** (Next)
- [ ] models/types.go - All DB entities
- [ ] services/supabase.go - DB operations
- [ ] Test DB connectivity

⏳ **Phase 3: Vonage Webhooks**
- [ ] handlers/vonage.go - Answer, event, recording
- [ ] NCCO response generation
- [ ] Two-party state consent logic

⏳ **Phase 4: WebSocket Infrastructure**
- [ ] hub/hub.go - Connection manager
- [ ] handlers/stream.go - Audio WebSocket
- [ ] handlers/dashboard.go - Dashboard WebSocket

⏳ **Phase 5: AI Pipeline**
- [ ] services/deepgram.go - Streaming transcription
- [ ] services/openai.go - Entity extraction
- [ ] pipeline/call.go - Call orchestration

⏳ **Phase 6: Storage & Webhooks**
- [ ] services/storage.go - Recording management
- [ ] services/webhook.go - Outbound webhooks

⏳ **Phase 7: Cron & Email**
- [ ] services/email.go - Resend integration
- [ ] handlers/cron.go - Daily digest

### Testing Endpoints

```bash
# Health check
curl http://localhost:8080/health

# Test Vonage answer (will be implemented)
curl "http://localhost:8080/api/vonage/answer?to=%2B15551234567&from=%2B15559876543&uuid=test-uuid"

# Test event webhook (will be implemented)
curl -X POST http://localhost:8080/api/vonage/event \
  -H "Content-Type: application/json" \
  -d '{"status": "answered", "uuid": "test-uuid"}'
```

## Monitoring

Railway provides built-in:
- **Logs**: Real-time structured JSON logs
- **Metrics**: CPU, memory, network usage
- **Deployments**: Git-based rollbacks

Access logs:
```bash
# View live logs in Railway dashboard
# Or use Railway CLI:
railway logs
```

## Architecture Decisions

### Why Go?
- **Performance**: Native concurrency for WebSocket connections
- **Simplicity**: Single binary deployment, no runtime dependencies
- **WebSocket**: Excellent goroutine support for concurrent streams
- **Memory**: Low memory footprint vs. Node.js

### Why chi Router?
- **Idiomatic**: Pure http.Handler interface
- **Lightweight**: Minimal overhead
- **Middleware**: Clean composable middleware

### Why Direct HTTP for Supabase?
- **No ORM overhead**: Direct PostgREST calls
- **Type safety**: Go structs with JSON tags
- **Flexibility**: Full control over queries

## Troubleshooting

### Server won't start
- Check all required env vars are set
- Verify port 8080 is available
- Check logs for panic messages

### Railway deployment fails
- Verify Dockerfile builds locally: `docker build -t test .`
- Check Railway environment variables are set
- Review Railway build logs

### WebSocket connections fail
- Ensure BASE_URL uses wss:// protocol for production
- Check CORS origins include your frontend URL
- Verify firewall allows WebSocket connections

## Next Steps

1. **Implement Phase 2**: Create models and Supabase service
2. **Test DB connectivity**: Verify all Supabase operations work
3. **Implement Vonage handlers**: Answer, event, recording webhooks
4. **Set up ngrok**: Test Vonage webhooks locally
5. **Implement WebSocket hub**: Connect Vonage audio → Deepgram → Dashboard

---

**Status**: 🏗️ Phase 1 Complete - Foundation ready for development

**Last Updated**: March 26, 2026
