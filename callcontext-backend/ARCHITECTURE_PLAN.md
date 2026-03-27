# CallContext Backend - Provider-Agnostic Architecture Plan

## 🎯 Core Focus: Call Intelligence Pipeline

**Primary Goal:** Real-time call transcription, AI analysis, and dashboard updates - provider-agnostic.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Telephony Provider                            │
│              (Telnyx, Twilio, or Future Providers)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Webhooks (HTTP)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Go Backend (Railway)                         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Provider   │  │   Provider   │  │   Provider   │         │
│  │   Adapter    │  │   Adapter    │  │   Adapter    │         │
│  │   (Telnyx)   │  │   (Twilio)   │  │   (Future)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                            │                                     │
│                            ↓                                     │
│              ┌─────────────────────────┐                        │
│              │  WebSocket Hub          │                        │
│              │  (Connection Manager)   │                        │
│              └─────────────────────────┘                        │
│                     │            │                              │
│         Audio Stream│            │Live Updates                  │
│                     ↓            ↓                              │
│         ┌───────────────┐  ┌──────────────┐                    │
│         │   Deepgram    │  │  Dashboard   │                    │
│         │  Transcription│  │  WebSocket   │                    │
│         └───────────────┘  └──────────────┘                    │
│                │                    ↑                            │
│                │ Transcript         │ Updates                   │
│                ↓                    │                            │
│         ┌─────────────────────────────┐                         │
│         │   AI Pipeline               │                         │
│         │   - OpenAI Extraction       │                         │
│         │   - Customer Profile Merge  │                         │
│         │   - Auto-create Orders      │                         │
│         └─────────────────────────────┘                         │
│                         │                                        │
│                         ↓                                        │
│                 ┌───────────────┐                               │
│                 │   Supabase    │                               │
│                 │   Database    │                               │
│                 └───────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Real-time Updates
                              ↓
                    ┌───────────────────┐
                    │  Next.js Frontend │
                    │     (Vercel)      │
                    └───────────────────┘
```

---

## 🏗️ Backend Architecture (Provider-Agnostic)

### Core Principle:
**The backend should NEVER care which telephony provider is used.**  
All provider-specific logic lives in adapters. The core pipeline works with normalized data structures.

---

## 📦 Updated Project Structure

```
callcontext-backend/
├── main.go                          # Entry point
├── config/
│   └── config.go                    # Load env vars (no Vonage-specific vars)
│
├── providers/
│   ├── provider.go                  # TelephonyProvider interface
│   ├── telnyx/
│   │   ├── adapter.go               # Telnyx implementation
│   │   └── websocket.go             # Telnyx WebSocket message parsing
│   ├── twilio/
│   │   ├── adapter.go               # Twilio implementation
│   │   └── websocket.go             # Twilio WebSocket message parsing
│   └── factory.go                   # Get provider by name
│
├── handlers/
│   ├── health.go                    # Health check
│   ├── webhooks.go                  # Universal webhook handlers
│   ├── stream.go                    # Audio WebSocket (provider-agnostic)
│   └── dashboard.go                 # Dashboard WebSocket
│
├── services/
│   ├── supabase.go                  # Database operations
│   ├── deepgram.go                  # Transcription streaming
│   ├── openai.go                    # AI entity extraction
│   ├── storage.go                   # Recording management
│   └── realtime.go                  # Push updates to frontend
│
├── pipeline/
│   └── call.go                      # Orchestrates: audio → AI → DB → dashboard
│
├── hub/
│   └── hub.go                       # WebSocket connection manager
│
├── models/
│   └── types.go                     # Shared types (Call, Customer, etc.)
│
└── middleware/
    ├── logging.go                   # Request logging + CORS
    └── auth.go                      # JWT validation
```

---

## 🎯 Core Features to Build (Priority Order)

### **Phase 1: Foundation** ✅ COMPLETE
- [x] main.go + config + health
- [x] Router setup
- [x] Middleware (logging, CORS, panic recovery)

### **Phase 2: Models & Database** 🔜 NEXT
- [ ] models/types.go - All DB entity structs
- [ ] services/supabase.go - Database operations
- [ ] Test Supabase connectivity

### **Phase 3: Provider Abstraction** 🔜
- [ ] providers/provider.go - Interface definition
- [ ] providers/telnyx/adapter.go - Telnyx implementation
- [ ] providers/twilio/adapter.go - Twilio implementation
- [ ] providers/factory.go - Dynamic provider loading

### **Phase 4: WebSocket Infrastructure** 🔜
- [ ] hub/hub.go - Connection manager
- [ ] handlers/stream.go - Audio WebSocket (provider-agnostic)
- [ ] handlers/dashboard.go - Dashboard WebSocket

### **Phase 5: AI Pipeline** 🔜 CORE FEATURE
- [ ] services/deepgram.go - Streaming transcription
- [ ] services/openai.go - Entity extraction + sentiment
- [ ] pipeline/call.go - Orchestrate audio → transcript → entities → DB

### **Phase 6: Webhook Handlers** 🔜
- [ ] handlers/webhooks.go - Universal inbound webhooks
- [ ] Use provider adapters to normalize payloads
- [ ] Update call records in DB

### **Phase 7: Storage & Polish** ⏳ LATER
- [ ] services/storage.go - Recording download/upload
- [ ] Error handling polish
- [ ] Logging improvements

---

## 🔄 How It Works (Provider-Agnostic Flow)

### 1. **Inbound Call Arrives**
```
Provider → POST /api/telephony/answer
          ↓
Backend detects provider (Telnyx vs Twilio) from webhook format
          ↓
Provider adapter normalizes webhook → InboundCallEvent
          ↓
Create call record in Supabase
          ↓
Send screen pop to dashboard
          ↓
Generate provider-specific response (TeXML or TwiML)
          ↓
Return XML/JSON to provider with:
  - Audio stream WebSocket URL
  - Recording instructions
  - Forwarding instructions
```

### 2. **Audio Streaming** (CORE PIPELINE)
```
Provider opens WebSocket → ws://backend/api/stream/audio?provider=telnyx
                           ↓
Provider adapter parses audio messages → AudioStreamMessage {
  type: 'audio',
  audioData: Buffer,
  sampleRate: 16000,
  encoding: 'linear16'
}
                           ↓
Hub forwards audio → Deepgram streaming connection
                           ↓
Deepgram returns transcript chunks (interim + final)
                           ↓
Pipeline appends to transcript buffer
                           ↓
Every 30s: Run OpenAI entity extraction on buffer
                           ↓
Push to dashboard: {
  type: 'transcript',
  text: "Customer wants roses for anniversary",
  isFinal: true,
  speaker: "customer"
}
                           ↓
Push to dashboard: {
  type: 'entities',
  products: [{name: "roses", qty: 24}],
  occasion: "anniversary",
  sentiment: "positive"
}
```

### 3. **Post-Call Processing**
```
Call ends → Provider sends status webhook
          ↓
Run full transcript analysis with OpenAI
          ↓
Extract: summary, entities, sentiment, follow-ups, dates
          ↓
Update customer profile (merge logic)
          ↓
Auto-create: orders, reminders, tasks
          ↓
Download recording from provider
          ↓
Upload to Supabase Storage
          ↓
Push final update to dashboard
```

---

## 🔌 Provider Adapters (Go Implementation)

### Interface Definition (`providers/provider.go`)

```go
type TelephonyProvider interface {
    Name() string
    
    // Webhook parsing
    ParseInboundWebhook(body []byte, headers map[string]string) (*InboundCallEvent, error)
    ParseStatusWebhook(body []byte, headers map[string]string) (*CallStatusEvent, error)
    ParseRecordingWebhook(body []byte, headers map[string]string) (*RecordingReadyEvent, error)
    
    // Response generation
    GenerateCallResponse(instructions *CallRoutingInstructions) (interface{}, error)
    
    // Audio streaming
    ParseAudioMessage(rawMsg []byte) (*AudioStreamMessage, error)
    GetAudioFormat() AudioFormat
    
    // Recording
    DownloadRecording(url string) ([]byte, error)
    
    // Webhook verification
    VerifySignature(body []byte, signature string) bool
}

type AudioFormat struct {
    SampleRate int    // 8000 or 16000
    Encoding   string // "linear16" or "mulaw"
}
```

### Telnyx Adapter Features:
- **Audio:** 16kHz linear16 PCM
- **Webhooks:** JSON format
- **Call Control:** TeXML (XML responses)
- **WebSocket:** Base64-encoded audio in JSON messages

### Twilio Adapter Features:
- **Audio:** 8kHz mulaw
- **Webhooks:** Form-urlencoded
- **Call Control:** TwiML (XML responses)
- **WebSocket:** Binary audio frames

---

## 🎯 Core Pipeline Focus (What to Build First)

### **Critical Path (Minimum Viable Call Intelligence):**

1. **Webhook Handler** → Receive call → Create DB record → Return provider response
2. **Audio WebSocket** → Accept provider connection → Parse audio format
3. **Deepgram Integration** → Stream audio → Get live transcripts
4. **Dashboard WebSocket** → Push transcripts to browser in real-time
5. **OpenAI Extraction** → Extract entities every 30s → Push to dashboard
6. **Post-Call Analysis** → Full summary + customer profile update

### **Can Be Added Later:**
- Recording download/upload
- Outbound webhooks to customers
- Daily digest emails
- SMS functionality
- Advanced call routing

---

## 🚀 Implementation Plan (Revised)

### **Step 1: Models & Types** (30 min)
- Define all Go structs matching Supabase schema
- Define provider-agnostic types (InboundCallEvent, etc.)
- Define audio format types

### **Step 2: Supabase Service** (1 hour)
- Implement core DB operations
- GetShop, GetCustomer, CreateCustomer
- InsertCall, UpdateCall
- UpdateCustomerProfile with merge logic
- BroadcastRealtime to push screen pops

### **Step 3: Provider Interface** (1 hour)
- Define TelephonyProvider interface
- Implement Telnyx adapter (webhook parsing + TeXML generation)
- Implement Twilio adapter (webhook parsing + TwiML generation)
- Factory function to load provider by env var

### **Step 4: Webhook Handlers** (30 min)
- Universal `/api/telephony/answer` endpoint
- Detect provider from request format
- Use adapter to parse → normalize → respond
- Create call record and send screen pop

### **Step 5: WebSocket Hub** (1 hour)
- Connection manager for audio streams and dashboard
- Thread-safe with goroutines
- Route messages between provider ↔ Deepgram ↔ dashboard

### **Step 6: Deepgram Integration** (1 hour)
- Initialize streaming session per call
- Configure for provider's audio format (16kHz linear16 or 8kHz mulaw)
- Handle interim and final transcripts
- Push to dashboard in real-time

### **Step 7: Audio Streaming** (1 hour)
- Accept WebSocket from provider
- Parse audio using provider adapter
- Forward to Deepgram
- Handle connection lifecycle

### **Step 8: OpenAI Pipeline** (1 hour)
- Real-time extraction (every 30s during call)
- Post-call full analysis
- Customer profile merge logic
- Auto-create orders/reminders

### **Step 9: Dashboard WebSocket** (30 min)
- Accept browser connections
- JWT authentication
- Push transcript + entities in real-time

### **Step 10: Testing & Polish** (1 hour)
- End-to-end test with ngrok
- Error handling
- Logging improvements

---

## 📋 Updated Routes (Provider-Agnostic)

### Core Routes:
```
GET  /health                           # Health check

POST /api/telephony/answer             # Inbound call (all providers)
POST /api/telephony/status             # Status updates (all providers)
POST /api/telephony/recording          # Recording ready (all providers)

GET  /api/stream/audio                 # Audio WebSocket (provider-agnostic)
GET  /api/stream/dashboard/:shopId     # Dashboard WebSocket
```

### Provider Detection:
Backend detects provider from:
1. **Query param**: `?provider=telnyx`
2. **Request format** (JSON = Telnyx, form = Twilio)
3. **Header signature** (different signature headers)

---

## 🔧 Updated Configuration

### Environment Variables (Backend):
```env
# Server
PORT=8080
ENVIRONMENT=development
BASE_URL=https://your-app.railway.app

# Supabase
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ANON_KEY=...

# AI Services
DEEPGRAM_API_KEY=...
OPENAI_API_KEY=...

# Telephony Providers (Backend uses these for verification only)
TELNYX_PUBLIC_KEY=...         # For webhook signature verification
TWILIO_AUTH_TOKEN=...         # For webhook signature verification

# Security
WEBHOOK_SIGNING_SECRET=...    # For outbound webhooks
CRON_SECRET=...               # For cron triggers
```

**Note:** Backend doesn't need provider API keys for making calls - only for verifying webhooks. The frontend handles call initiation.

---

## 🎨 Frontend Integration

### Frontend Already Has:
✅ `lib/telephony/provider.ts` - Provider interface  
✅ `lib/telephony/adapters/telnyx.ts` - Telnyx implementation  
✅ `lib/telephony/adapters/twilio.ts` - Twilio implementation  
✅ `lib/telephony/index.ts` - Provider factory  
✅ `/api/telephony/answer` - Universal webhook handler  
✅ `/api/telephony/status` - Status webhook handler  
✅ `/api/telephony/recording` - Recording webhook handler  

### Frontend Needs:
- Backend WebSocket URL for audio streaming
- Backend WebSocket URL for dashboard updates

### Flow:
```
1. Provider sends webhook → Frontend /api/telephony/answer
   ↓
2. Frontend creates call record in Supabase
   ↓
3. Frontend generates response with:
   - Stream URL: ws://backend/api/stream/audio?callId=xxx&shopId=yyy
   ↓
4. Provider connects to backend WebSocket
   ↓
5. Backend streams to Deepgram → OpenAI → Dashboard
```

---

## ⚡ Core Pipeline Implementation Priority

### **High Priority (Core Intelligence):**
1. ✅ HTTP server + config + health
2. 🔜 Database models + Supabase service
3. 🔜 Provider adapters (Telnyx + Twilio)
4. 🔜 Audio WebSocket handler
5. 🔜 Deepgram streaming integration
6. 🔜 Dashboard WebSocket
7. 🔜 OpenAI entity extraction
8. 🔜 Call lifecycle orchestration

### **Medium Priority (Enhancements):**
9. ⏳ Recording download/upload
10. ⏳ Customer profile auto-merge
11. ⏳ Auto-create orders/reminders
12. ⏳ Webhook signature verification

### **Low Priority (Nice-to-Have):**
13. ⏳ Outbound webhooks to customers
14. ⏳ Daily digest emails
15. ⏳ SMS handling
16. ⏳ Call analytics aggregation

---

## 🔄 Provider Adapter Pattern (Go)

### Example: Telnyx Audio Message
```go
// Telnyx sends audio as:
{
  "event": "media",
  "media": {
    "payload": "base64-encoded-audio",
    "track": "inbound"
  }
}

// Adapter normalizes to:
AudioStreamMessage{
  Type: "audio",
  CallID: "xxx",
  AudioData: decoded-bytes,
  SampleRate: 16000,
  Encoding: "linear16",
}
```

### Example: Twilio Audio Message
```go
// Twilio sends binary frames directly

// Adapter normalizes to:
AudioStreamMessage{
  Type: "audio",
  CallID: "xxx",
  AudioData: raw-bytes,
  SampleRate: 8000,
  Encoding: "mulaw",
}
```

---

## 🎯 Revised Build Order (Provider-Agnostic)

### **Immediate Next Steps:**

1. **Build Models** (`models/types.go`)
   - Shop, Customer, Call, Entities, AudioStreamMessage
   - Match Supabase schema exactly

2. **Build Supabase Service** (`services/supabase.go`)
   - Core DB operations
   - GetShop, GetCustomer, CreateCall, UpdateCall
   - Test connectivity

3. **Build Provider Interface** (`providers/provider.go`)
   - Define TelephonyProvider interface
   - Define normalized event types

4. **Build Telnyx Adapter** (`providers/telnyx/adapter.go`)
   - Parse Telnyx webhooks → normalized events
   - Parse Telnyx audio messages → AudioStreamMessage
   - Return audio format: 16kHz linear16

5. **Build WebSocket Hub** (`hub/hub.go`)
   - Manage audio connections (from provider)
   - Manage dashboard connections (from browser)
   - Thread-safe routing

6. **Build Audio Handler** (`handlers/stream.go`)
   - Accept WebSocket from provider
   - Detect provider from query param or message format
   - Use adapter to parse audio
   - Forward to Deepgram

7. **Build Deepgram Service** (`services/deepgram.go`)
   - Initialize streaming with provider's audio format
   - Handle transcripts (interim + final)
   - Push to dashboard via Hub

8. **Build OpenAI Service** (`services/openai.go`)
   - Real-time extraction (30s intervals)
   - Post-call full analysis
   - Return structured entities

9. **Build Pipeline** (`pipeline/call.go`)
   - Orchestrate the full flow
   - Buffer management
   - Error recovery

10. **Integration Testing**
    - Test with Telnyx (primary)
    - Test with Twilio (backup)
    - Verify provider switching works

---

## 📊 Success Criteria

The backend is "done" when:
- ✅ Telnyx call → audio streams → Deepgram → live transcript on dashboard
- ✅ Twilio call → audio streams → Deepgram → live transcript on dashboard
- ✅ AI extracts products, dates, sentiment in real-time
- ✅ Post-call: customer profile auto-updates
- ✅ Can switch providers by changing env var only

---

## 🚀 Ready to Build?

Should I proceed with:
1. **Phase 2: Models + Supabase** (build all the data types and DB operations)?
2. **Phase 3: Provider Abstraction** (build the adapter pattern)?
3. **Full Pipeline** (build everything end-to-end)?

Let me know and I'll start building immediately!
