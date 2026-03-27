# Backend Functionality Specification

## 🎯 Primary Mission
Build a **provider-agnostic** real-time call intelligence backend that:
1. Accepts audio streams from **any telephony provider** (Telnyx, Twilio, etc.)
2. Streams audio to **Deepgram** for live transcription
3. Runs **OpenAI** entity extraction for call intelligence
4. Pushes live updates to **dashboard** via WebSocket
5. Stores everything in **Supabase** database

---

## 🏛️ Architecture Philosophy

### **Provider Agnostic = Maximum Flexibility**

The backend **NEVER** hardcodes provider-specific logic. Instead:
- Providers send webhooks → Backend uses **adapters** to normalize
- Providers stream audio → Backend uses **adapters** to parse format
- Backend works with **normalized data structures** only
- Switch providers by changing frontend config (backend unchanged)

### **Division of Responsibilities**

| **Frontend (Next.js)** | **Backend (Go)** |
|------------------------|------------------|
| ✅ Receive webhooks from provider | ✅ Accept audio WebSocket from provider |
| ✅ Normalize webhook payload | ✅ Parse provider-specific audio format |
| ✅ Create call record in DB | ✅ Stream to Deepgram |
| ✅ Generate TwiML/TeXML response | ✅ Run AI entity extraction |
| ✅ Return response to provider | ✅ Push live updates to dashboard |
| ✅ Handle call status updates | ✅ Orchestrate call lifecycle |
| ✅ Handle recording webhooks | ✅ Store transcripts and entities |

**Why this split?**
- **Frontend**: Stateless, scales horizontally, handles webhooks fast
- **Backend**: Stateful WebSocket connections, long-running AI pipeline

---

## 🔌 Core Functionalities (Priority Order)

### **1. Audio Stream Handler** 🎙️ **[CRITICAL]**

**Endpoint:** `GET /api/stream/audio`

**What it does:**
- Accepts WebSocket connection from telephony provider
- Extracts metadata from query params: `?callId=xxx&shopId=yyy&provider=telnyx`
- Loads appropriate provider adapter (Telnyx vs Twilio)
- Parses incoming audio messages using adapter
- Forwards raw audio bytes to Deepgram
- Receives live transcripts from Deepgram
- Pushes transcripts to dashboard WebSocket

**Audio Format Handling:**
- **Telnyx**: 16kHz linear16 PCM (base64-encoded in JSON)
- **Twilio**: 8kHz mulaw (binary WebSocket frames)
- **Backend**: Provider adapter converts → uniform AudioStreamMessage → Deepgram

**Message Flow:**
```
Provider WebSocket → Backend receives message
                   ↓
Provider Adapter parses format
                   ↓
Extract: { type: "audio", data: Buffer, sampleRate: 16000 }
                   ↓
Forward audio bytes to Deepgram
                   ↓
Deepgram returns transcript
                   ↓
Hub broadcasts to dashboard WebSocket
```

---

### **2. Deepgram Streaming Integration** 🎧 **[CRITICAL]**

**Service:** `services/deepgram.go`

**What it does:**
- Creates a streaming transcription session per call
- Configures model: `nova-2`, smart formatting, punctuation, diarization
- Handles two audio formats (adapter tells backend which format):
  - **16kHz linear16** (Telnyx)
  - **8kHz mulaw** (Twilio)
- Keyword boosting for industry terms
- Processes interim results (gray "typing" indicators)
- Processes final results (append to transcript buffer)
- Speaker identification (0=customer, 1=business)

**Configuration:**
```go
DeepgramConfig{
  Model: "nova-2",
  Language: "en-US",
  SmartFormat: true,
  Punctuate: true,
  Diarize: true,
  InterimResults: true,
  UtteranceEndMs: 1000,
  Keywords: ["roses", "peonies", "arrangement", "delivery", "wedding"],
  SampleRate: dynamicFrom(provider.GetAudioFormat()),
  Encoding: dynamicFrom(provider.GetAudioFormat()),
}
```

**Output:**
```json
{
  "type": "transcript",
  "text": "I'd like to order roses for my anniversary",
  "isFinal": true,
  "speaker": "customer",
  "confidence": 0.98,
  "timestamp": "2026-03-26T10:30:15Z"
}
```

---

### **3. Dashboard WebSocket Server** 💻 **[CRITICAL]**

**Endpoint:** `GET /api/stream/dashboard/:shopId`

**What it does:**
- Accepts WebSocket connections from browser
- Authenticates via Supabase JWT token (query param: `?token=xxx`)
- Registers connection in Hub
- Pushes real-time updates:
  - Live transcripts (as they arrive from Deepgram)
  - Extracted entities (every 30s)
  - Call status changes
  - Post-call summary
- Keep-alive pings every 30s

**Message Types to Dashboard:**
```json
// Transcript chunk
{
  "type": "transcript",
  "callId": "uuid",
  "text": "I'd like roses",
  "isFinal": true,
  "speaker": "customer",
  "timestamp": "..."
}

// Entities (every 30s during call)
{
  "type": "entities",
  "callId": "uuid",
  "products": [{"name": "roses", "quantity": 24}],
  "occasion": "anniversary",
  "deliveryDate": "2026-03-28",
  "sentiment": "positive",
  "confidence": "partial"
}

// Call status
{
  "type": "status",
  "callId": "uuid",
  "status": "completed",
  "duration": 245
}

// Post-call summary
{
  "type": "summary",
  "callId": "uuid",
  "summary": "Customer ordered...",
  "followUpNeeded": true,
  "orderDetected": true
}
```

---

### **4. OpenAI Entity Extraction** 🤖 **[CRITICAL]**

**Service:** `services/openai.go`

**Two-phase extraction:**

**A. Real-time Extraction (during call):**
- Runs every 30 seconds
- Input: current transcript buffer (partial transcript)
- Model: `gpt-4o-mini`
- Prompt: Extract entities from partial transcript
- Output: Partial entities (may be incomplete)
- Push to dashboard immediately

**B. Post-call Full Analysis (after call ends):**
- Runs once when call completes
- Input: complete transcript
- Model: `gpt-4o-mini`
- Prompt: Full call analysis
- Output: Complete entities + summary + follow-ups + sentiment

**Extraction Schema:**
```json
{
  "products": [
    {"name": "roses", "quantity": 24, "color": "red"}
  ],
  "occasion": "anniversary",
  "deliveryDate": "2026-03-28",
  "deliveryAddress": "123 Main St, Austin TX",
  "customerName": "Maria Chen",
  "budget": 150,
  "preferences": ["warm colors", "no lilies"],
  "sentiment": "positive",
  "followUpNeeded": true,
  "followUpReason": "Needs to confirm delivery time",
  "importantDates": [
    {"date": "2026-03-28", "label": "Anniversary", "recurring": true}
  ],
  "orderDetected": true,
  "callSummary": "Customer ordered 2 dozen red roses...",
  "upsellOpportunity": "Premium vase"
}
```

---

### **5. WebSocket Hub (Connection Manager)** 🔀 **[CRITICAL]**

**Service:** `hub/hub.go`

**What it manages:**
```go
type Hub struct {
    // Provider audio connections (1 per active call)
    audioSessions map[string]*AudioSession  // callId → session
    
    // Dashboard browser connections (N per shop)
    dashboards map[string][]*DashboardConn  // shopId → connections
    
    mu sync.RWMutex  // Thread-safe access
}

type AudioSession struct {
    CallID           string
    ShopID           string
    ProviderConn     *websocket.Conn
    DeepgramConn     *deepgram.LiveConnection
    TranscriptBuffer string
    LastExtraction   time.Time
}

type DashboardConn struct {
    ShopID string
    Conn   *websocket.Conn
}
```

**Hub Operations:**
1. `RegisterAudioSession(callId, shopId, conn)` - Register provider connection
2. `RegisterDashboard(shopId, conn)` - Register browser connection
3. `BroadcastToDashboard(shopId, message)` - Send to all dashboards for shop
4. `GetAudioSession(callId)` - Get active call session
5. `CloseAudioSession(callId)` - Clean up after call ends
6. `RemoveDashboard(shopId, conn)` - Unregister browser

**Thread Safety:**
- All operations use RWMutex
- Broadcast loops skip dead connections
- Goroutines clean up resources on disconnect

---

### **6. Call Lifecycle Orchestration** 🔄 **[CRITICAL]**

**Service:** `pipeline/call.go`

**Orchestrates the full flow:**

```go
func HandleCall(callId, shopId string, audioConn *websocket.Conn, provider TelephonyProvider) {
    // 1. Initialize
    session := hub.RegisterAudioSession(callId, shopId, audioConn)
    defer hub.CloseAudioSession(callId)
    
    // 2. Start Deepgram
    audioFormat := provider.GetAudioFormat()
    dgConn := deepgram.NewStream(audioFormat)
    session.DeepgramConn = dgConn
    
    // 3. Start extraction timer (every 30s)
    extractTicker := time.NewTicker(30 * time.Second)
    defer extractTicker.Stop()
    
    // 4. Audio loop
    for {
        // Read from provider WebSocket
        rawMsg := audioConn.ReadMessage()
        
        // Parse using provider adapter
        audioMsg := provider.ParseAudioMessage(rawMsg)
        
        if audioMsg.Type == "audio" {
            // Forward to Deepgram
            dgConn.Send(audioMsg.AudioData)
        }
        
        // Check for Deepgram transcripts
        select {
        case transcript := <-dgConn.Transcripts():
            // Append to buffer
            if transcript.IsFinal {
                session.TranscriptBuffer += transcript.Text
            }
            
            // Push to dashboard
            hub.BroadcastToDashboard(shopId, transcript)
            
        case <-extractTicker.C:
            // Run entity extraction
            if len(session.TranscriptBuffer) > 50 {
                entities := openai.ExtractRealtime(session.TranscriptBuffer)
                hub.BroadcastToDashboard(shopId, entities)
            }
        }
        
        // Check if call ended
        if audioMsg.Type == "stop" {
            break
        }
    }
    
    // 5. Post-call processing
    analysis := openai.AnalyzeFull(session.TranscriptBuffer)
    supabase.UpdateCall(callId, analysis)
    supabase.UpdateCustomerProfile(shopId, customerId, analysis)
    
    // Auto-create orders/reminders if detected
    if analysis.OrderDetected {
        supabase.CreateOrder(...)
    }
}
```

---

### **7. Supabase Database Operations** 💾 **[CRITICAL]**

**Service:** `services/supabase.go`

**Core Functions Needed:**

```go
// Shop operations
GetShopByID(shopId string) (*Shop, error)
GetShopByPhoneNumber(phone string) (*Shop, error)

// Customer operations  
GetCustomerByPhone(shopId, phone string) (*Customer, error)
CreateCustomer(shopId, phone, firstName, lastName string) (*Customer, error)
UpdateCustomerProfile(customerId string, analysis *CallAnalysis) error

// Call operations
CreateCall(call *Call) (*Call, error)
UpdateCall(callId string, updates map[string]interface{}) error
GetCall(callId string) (*Call, error)

// Related entity creation
CreateOrder(order *Order) error
CreateReminder(reminder *Reminder) error
CreateTask(task *Task) error

// Realtime broadcasting
BroadcastRealtime(channel, event string, payload interface{}) error
```

**Customer Profile Merge Logic** (Critical!):
```go
// ONLY update NULL fields, NEVER overwrite existing data
if customer.FirstName == nil && analysis.CustomerName != "" {
    updates["first_name"] = extractFirstName(analysis.CustomerName)
}

// APPEND to preferences (deduplicate)
existingPrefs := customer.Preferences.Primary
for _, newPref := range analysis.Preferences {
    if !contains(existingPrefs, newPref) {
        existingPrefs = append(existingPrefs, newPref)
    }
}
updates["preferences"] = map[string]interface{}{
    "primary": existingPrefs,
    // ... merge secondary, restrictions too
}

// ALWAYS update last contact
updates["last_contact_date"] = time.Now()
```

---

### **8. Provider Adapters** 🔌 **[IMPORTANT]**

**Interface:** `providers/provider.go`

```go
type TelephonyProvider interface {
    Name() string
    
    // Audio format this provider uses
    GetAudioFormat() AudioFormat
    
    // Parse provider's audio WebSocket messages
    ParseAudioMessage(rawMsg []byte) (*AudioStreamMessage, error)
    
    // Verify webhook signatures (security)
    VerifyWebhookSignature(body []byte, signature string) bool
}

type AudioFormat struct {
    SampleRate int    // 8000 or 16000
    Encoding   string // "linear16" or "mulaw"
}
```

**Telnyx Adapter** (`providers/telnyx/adapter.go`):
```go
func (t *TelnyxAdapter) GetAudioFormat() AudioFormat {
    return AudioFormat{
        SampleRate: 16000,
        Encoding: "linear16",
    }
}

func (t *TelnyxAdapter) ParseAudioMessage(rawMsg []byte) (*AudioStreamMessage, error) {
    // Telnyx sends JSON: {"event": "media", "media": {"payload": "base64..."}}
    var msg TelnyxMediaMessage
    json.Unmarshal(rawMsg, &msg)
    
    audioData := base64.StdEncoding.DecodeString(msg.Media.Payload)
    
    return &AudioStreamMessage{
        Type: "audio",
        AudioData: audioData,
        SampleRate: 16000,
        Encoding: "linear16",
    }, nil
}
```

**Twilio Adapter** (`providers/twilio/adapter.go`):
```go
func (t *TwilioAdapter) GetAudioFormat() AudioFormat {
    return AudioFormat{
        SampleRate: 8000,
        Encoding: "mulaw",
    }
}

func (t *TwilioAdapter) ParseAudioMessage(rawMsg []byte) (*AudioStreamMessage, error) {
    // Twilio sends binary frames directly (no JSON wrapper)
    return &AudioStreamMessage{
        Type: "audio",
        AudioData: rawMsg,  // Already raw mulaw bytes
        SampleRate: 8000,
        Encoding: "mulaw",
    }, nil
}
```

---

### **9. Dashboard Real-Time Updates** 📡 **[CRITICAL]**

**Endpoint:** `GET /api/stream/dashboard/:shopId`

**Connection Flow:**
```
Browser connects with JWT token in query string
            ↓
Backend validates token with Supabase
            ↓
Register connection in Hub
            ↓
Send confirmation: {"type": "connected"}
            ↓
Listen for messages from Hub
            ↓
Forward all messages to browser
```

**Messages Pushed to Dashboard:**

1. **Live Transcript** (every 1-3 seconds):
```json
{
  "type": "transcript",
  "callId": "uuid",
  "text": "I'd like to order roses",
  "isFinal": true,
  "speaker": "customer"
}
```

2. **Entities Extracted** (every 30 seconds):
```json
{
  "type": "entities",
  "callId": "uuid",
  "products": [{"name": "roses", "quantity": 24}],
  "sentiment": "positive",
  "occasion": "anniversary"
}
```

3. **Call Summary** (after call ends):
```json
{
  "type": "summary",
  "callId": "uuid",
  "summary": "Customer ordered 2 dozen red roses...",
  "followUpNeeded": true
}
```

---

### **10. OpenAI Pipeline** 🧠 **[CRITICAL]**

**Two Extraction Modes:**

**A. Real-Time (every 30s during call):**
```go
// Input: partial transcript (may be incomplete)
// Output: partial entities (what we know so far)
// Push to dashboard immediately

func ExtractEntitiesRealtime(transcript string) (*Entities, error) {
    prompt := `Extract entities from this PARTIAL florist call transcript.
    
Transcript so far:
---
` + transcript + `
---

Return ONLY JSON (no markdown):
{
  "products": [{"name": "", "quantity": null, "color": ""}],
  "occasion": "",
  "delivery_date": "",
  "address": "",
  "budget": null,
  "preferences": [],
  "sentiment": "positive|neutral|negative"
}

Return null for unmentioned fields. This is a partial transcript.`

    // Call OpenAI, parse JSON response
}
```

**B. Post-Call (full analysis):**
```go
// Input: complete transcript
// Output: comprehensive analysis

func AnalyzeCallComplete(transcript string) (*CallAnalysis, error) {
    prompt := `Analyze this complete florist call transcript.

Transcript:
---
` + transcript + `
---

Return ONLY JSON:
{
  "customer_name": "",
  "products": [{...}],
  "delivery_address": "",
  "delivery_date": "",
  "occasion": "",
  "preferences": [],
  "budget": null,
  "call_summary": "",
  "sentiment": "",
  "follow_up_needed": true,
  "follow_up_reason": "",
  "important_dates": [{"date": "", "label": "", "recurring": true}],
  "order_detected": true,
  "upsell_opportunity": ""
}`

    // Call OpenAI, parse JSON response
}
```

---

### **11. WebSocket Hub Architecture** 🌐 **[CRITICAL]**

**Purpose:** Route messages between audio streams, Deepgram, and dashboards

**Structure:**
```go
type Hub struct {
    mu sync.RWMutex
    
    // Audio sessions: 1 per active call
    audioSessions map[string]*AudioSession
    
    // Dashboard connections: N per shop
    dashboards map[string][]*websocket.Conn
}

type AudioSession struct {
    CallID           string
    ShopID           string
    CustomerID       string
    ProviderConn     *websocket.Conn
    DeepgramConn     *deepgram.LiveConnection
    TranscriptBuffer strings.Builder
    LastExtraction   time.Time
    StartedAt        time.Time
}
```

**Key Methods:**
```go
// Register a new audio stream from provider
func (h *Hub) RegisterAudio(callId, shopId string, conn *websocket.Conn) *AudioSession

// Register a dashboard browser connection
func (h *Hub) RegisterDashboard(shopId string, conn *websocket.Conn)

// Broadcast message to all dashboards for a shop
func (h *Hub) BroadcastToDashboard(shopId string, message interface{})

// Get active audio session for a call
func (h *Hub) GetSession(callId string) (*AudioSession, bool)

// Clean up session when call ends
func (h *Hub) CloseSession(callId string)
```

**Concurrency Pattern:**
- Each audio session runs in its own goroutine
- Hub uses channels for inter-goroutine communication
- Broadcast is non-blocking (skips slow/dead connections)

---

### **12. Database Models** 📊 **[IMPORTANT]**

**File:** `models/types.go`

**Core Structs:**
```go
type Shop struct {
    ID          string                 `json:"id"`
    Name        string                 `json:"name"`
    PhoneNumber *string                `json:"phone_number"`
    Settings    map[string]interface{} `json:"settings"`
    CreatedAt   time.Time              `json:"created_at"`
}

type Customer struct {
    ID                string                 `json:"id"`
    ShopID            string                 `json:"shop_id"`
    Phone             string                 `json:"phone"`
    FirstName         *string                `json:"first_name"`
    LastName          *string                `json:"last_name"`
    Email             *string                `json:"email"`
    Preferences       map[string]interface{} `json:"preferences"`
    Tags              []string               `json:"tags"`
    LoyaltyTier       *string                `json:"loyalty_tier"`
    LifetimeValue     float64                `json:"lifetime_value"`
    LastContactDate   *time.Time             `json:"last_contact_date"`
}

type Call struct {
    ID                string                 `json:"id"`
    ShopID            string                 `json:"shop_id"`
    CustomerID        *string                `json:"customer_id"`
    Direction         string                 `json:"direction"`
    Status            string                 `json:"status"`
    StartedAt         time.Time              `json:"started_at"`
    EndedAt           *time.Time             `json:"ended_at"`
    DurationSeconds   *int                   `json:"duration_seconds"`
    Transcript        *string                `json:"transcript"`
    AISummary         *string                `json:"ai_summary"`
    Sentiment         *string                `json:"sentiment"`
    EntitiesExtracted map[string]interface{} `json:"entities_extracted"`
    FollowUpNeeded    bool                   `json:"follow_up_needed"`
}

type Entities struct {
    Products       []Product              `json:"products"`
    Occasion       string                 `json:"occasion"`
    DeliveryDate   string                 `json:"delivery_date"`
    DeliveryAddr   string                 `json:"delivery_address"`
    CustomerName   string                 `json:"customer_name"`
    Budget         *float64               `json:"budget"`
    Preferences    []string               `json:"preferences"`
    Sentiment      string                 `json:"sentiment"`
}

type CallAnalysis struct {
    *Entities
    CallSummary        string          `json:"call_summary"`
    FollowUpNeeded     bool            `json:"follow_up_needed"`
    FollowUpReason     string          `json:"follow_up_reason"`
    ImportantDates     []ImportantDate `json:"important_dates"`
    OrderDetected      bool            `json:"order_detected"`
    UpsellOpportunity  string          `json:"upsell_opportunity"`
}
```

---

## 🎯 What the Backend DOES vs DOESN'T Do

### ✅ Backend Responsibilities:

1. **Audio Stream Processing**
   - Accept WebSocket from telephony provider
   - Parse provider-specific audio format
   - Stream to Deepgram
   
2. **Real-Time Transcription**
   - Maintain Deepgram connection per call
   - Handle interim and final results
   - Buffer complete transcript
   
3. **AI Intelligence**
   - Extract entities every 30s (real-time)
   - Full analysis after call
   - Sentiment detection
   
4. **Dashboard Updates**
   - Push live transcripts to browser
   - Push extracted entities
   - Push call summaries
   
5. **Database Operations**
   - Update call records
   - Merge data into customer profiles
   - Auto-create orders/reminders

### ❌ Backend Does NOT Handle:

1. **Inbound Webhooks** - Frontend handles these (already built)
2. **Provider API Calls** - Frontend manages numbers and makes calls
3. **TwiML/TeXML Generation** - Frontend providers generate these
4. **Call Status Updates** - Frontend receives status webhooks
5. **Recording Webhooks** - Frontend handles download/upload

**Why?** Frontend is stateless and can scale horizontally. Backend focuses on stateful long-running connections.

---

## 🔗 Frontend ↔ Backend Integration

### Flow:

```
1. Provider calls customer's number
   ↓
2. Provider sends webhook → Frontend /api/telephony/answer
   ↓
3. Frontend:
   - Creates call in DB
   - Generates TwiML/TeXML with stream URL:
     <Stream url="wss://backend.railway.app/api/stream/audio?callId=xxx&shopId=yyy&provider=telnyx" />
   ↓
4. Provider connects to Backend WebSocket
   ↓
5. Backend starts pipeline:
   Audio → Deepgram → OpenAI → Dashboard
   ↓
6. Dashboard subscribes to backend WebSocket:
   wss://backend.railway.app/api/stream/dashboard/:shopId?token=jwt
   ↓
7. Browser receives live updates
```

### Environment Variables (Frontend):

```env
# Points to Go backend on Railway
NEXT_PUBLIC_BACKEND_WS_URL=wss://callcontext-backend.railway.app
BACKEND_HTTP_URL=https://callcontext-backend.railway.app
```

---

## 📊 Implementation Progress

### ✅ Completed:
- [x] Project structure
- [x] HTTP server (chi router)
- [x] Health check endpoint
- [x] Middleware (logging, CORS, panic recovery)
- [x] Configuration loader (provider-agnostic)
- [x] Dockerfile for Railway deployment
- [x] Architecture documentation

### 🔜 Next Steps (In Order):
1. **Models** - Define all types
2. **Supabase Service** - DB operations
3. **Provider Interface** - Adapter pattern
4. **WebSocket Hub** - Connection manager
5. **Audio Stream Handler** - Core pipeline
6. **Deepgram Integration** - Live transcription
7. **OpenAI Integration** - Entity extraction
8. **Dashboard WebSocket** - Browser updates
9. **End-to-end testing**

---

## 🎯 Success Criteria

Backend is **production-ready** when:
- ✅ Accepts audio from Telnyx
- ✅ Accepts audio from Twilio
- ✅ Live transcription appears on dashboard (< 2s latency)
- ✅ Entities extracted and displayed during call
- ✅ Post-call: customer profile auto-updates
- ✅ Post-call: orders auto-created
- ✅ Can switch providers without code changes

---

## 🚀 Ready to Build

The architecture is now **provider-agnostic** and focused on **core call intelligence**.

**Next action:** Build Phase 2 (Models + Supabase) to establish data layer.

Let me know if you want me to proceed!
