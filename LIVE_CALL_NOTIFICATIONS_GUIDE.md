# Live Call Notifications System

## Overview

CallContext now includes a real-time call notification system that alerts users when customers call, complete with:
- **Browser notifications** (with permission)
- **Audio alerts** (looping ringtone)
- **Visual notifications** (animated card with caller info)
- **Test mode** (simulate incoming calls from the dashboard)

---

## Features

### 1. **Live Call Detection**
- Polls `/api/calls/live` every 2 seconds
- Detects calls with status `ringing` or `active` from the last 5 minutes
- Automatically shows notification when new calls arrive

### 2. **Browser Notifications**
- Requests permission on first load
- Shows system notification with caller name/phone
- Notification persists until dismissed (requireInteraction: true)
- Tagged by call ID to prevent duplicates

### 3. **Audio Alert**
- Plays looping audio file on incoming call: `/public/sounds/incoming-call.mp3`
- Stops when call is dismissed or when user clicks "View Call"
- Only one audio alert plays at a time

### 4. **Visual Notification Card**
- Animated bounce effect
- Shows:
  - Caller avatar (initials)
  - Name or phone number
  - Call start time (relative)
  - Quick actions: "View Call" and "View Customer"
- Dismissible with X button
- "Dismiss All" button when multiple calls are active

### 5. **Test Mode**
- **Test button** on dashboard (top-right of greeting)
- Click to simulate an incoming call
- Randomly selects from 5 test customers
- Call automatically completes after 30 seconds

---

## Setup Instructions

### Step 1: Add Audio File

You need to add a ringtone audio file. Place it at:

```
callcontext-frontend/public/sounds/incoming-call.mp3
```

**Recommended audio:**
- **Format:** MP3 (for best browser compatibility)
- **Duration:** 2-5 seconds (it will loop)
- **Volume:** Medium (not too loud)
- **Tone:** Professional ringtone or chime

**Free ringtone sources:**
- https://mixkit.co/free-sound-effects/ringtone/
- https://freesound.org/search/?q=phone+ring
- https://www.zapsplat.com/sound-effect-category/ringtones/

**Quick setup (if you don't have audio yet):**
```bash
# Create directory
mkdir -p callcontext-frontend/public/sounds

# Download a sample ringtone (example using curl)
curl -L "https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/office_phone_modern_ring_single_001.mp3?_=1" -o callcontext-frontend/public/sounds/incoming-call.mp3
```

---

### Step 2: Test the System

1. **Start your dev server** (if not running):
   ```bash
   cd callcontext-frontend
   npm run dev
   ```

2. **Navigate to the dashboard**:
   ```
   http://localhost:3000/dashboard
   ```

3. **Click "Test Incoming Call" button** (top-right of the page)

4. **Expected behavior:**
   - Audio starts playing (looping)
   - Browser asks for notification permission (if first time)
   - Visual notification card appears (top-right corner)
   - System notification shows (if permission granted)

5. **Dismiss the notification** by:
   - Clicking "View Call" (goes to call details)
   - Clicking "View Customer" (goes to customer profile)
   - Clicking the X button

---

## API Routes

### `GET /api/calls/live`
**Purpose:** Fetch active/ringing calls from the last 5 minutes

**Auth:** Required (uses shop_id from session)

**Response:**
```json
{
  "calls": [
    {
      "id": "uuid",
      "customer_id": "uuid",
      "customer_name": "Maria Chen",
      "customer_phone": "+1 (512) 555-0173",
      "started_at": "2024-03-25T14:30:00Z",
      "status": "ringing"
    }
  ]
}
```

---

### `POST /api/calls/test`
**Purpose:** Simulate an incoming call for testing

**Auth:** Required

**Response:**
```json
{
  "message": "Test call simulated",
  "call": {
    "id": "uuid",
    "customer_name": "Maria Chen",
    "customer_phone": "+1 (512) 555-0173",
    "status": "ringing"
  }
}
```

**Behavior:**
- Creates a new call record with status `ringing`
- Randomly picks from 5 test customers
- Creates customer if doesn't exist
- Automatically completes call after 30 seconds

---

## Components

### `LiveCallNotifications.tsx`
**Location:** `components/notifications/LiveCallNotifications.tsx`

**What it does:**
- Client component that polls for live calls
- Manages audio playback
- Handles browser notification permissions
- Renders notification cards
- Integrated into dashboard layout (shows on all dashboard pages)

**Key features:**
- Polling interval: 2000ms (2 seconds)
- Permission request banner (dismisses after user grants/denies)
- Audio ref management (prevents memory leaks)
- Keyboard accessible (dismiss with X button)

---

### `TestCallButton.tsx`
**Location:** `components/debug/TestCallButton.tsx`

**What it does:**
- Trigger button to simulate incoming calls
- Shows loading state while creating test call
- Displays success/error message

**Usage:**
```tsx
import { TestCallButton } from "@/components/debug/TestCallButton";

<TestCallButton />
```

---

## Browser Compatibility

### Audio Support
- ✅ Chrome/Edge (all versions)
- ✅ Firefox 3.5+
- ✅ Safari 3.1+
- ⚠️ Mobile Safari (requires user interaction first)

### Notification API Support
- ✅ Chrome 42+
- ✅ Firefox 44+
- ✅ Edge 14+
- ✅ Safari 7+
- ❌ iOS Safari (not supported, audio only)

---

## Customization

### Change Polling Interval
Edit `LiveCallNotifications.tsx`:

```tsx
// Poll every 5 seconds instead of 2
const interval = setInterval(pollForCalls, 5000);
```

### Change Audio File
Replace the file at `/public/sounds/incoming-call.mp3`

Or update the path in `LiveCallNotifications.tsx`:

```tsx
const audio = new Audio("/sounds/your-custom-ringtone.mp3");
```

### Change Notification Style
Edit `LiveCallNotifications.tsx` card markup:
- Colors: `bg-gradient-to-r from-brand-500 to-brand-600`
- Animation: `animate-bounce-gentle`
- Border: `border-2 border-brand-500`

---

## Production Considerations

### 1. **WebSocket Alternative (Future)**
For better real-time performance in production, consider:
- Supabase Realtime subscriptions
- WebSocket connection to backend
- Server-Sent Events (SSE)

Current polling solution (2s interval) is suitable for:
- Small teams (< 10 concurrent users)
- Low call volume (< 20 calls/hour)

### 2. **Audio Autoplay Policy**
Modern browsers block audio autoplay. The audio will only play if:
- User has interacted with the page (clicked anything)
- User granted permission to notifications

**Best practice:** Show a banner asking users to "Click anywhere to enable call alerts" on first load.

### 3. **Notification Permissions**
- Firefox/Chrome: persist forever after grant
- Safari: may ask again after 7 days of no interaction
- Always gracefully handle permission denial (audio still plays)

### 4. **Mobile Considerations**
- iOS Safari doesn't support Web Notifications API
- Audio autoplay is heavily restricted on mobile
- Consider push notifications via service worker for mobile

---

## Troubleshooting

### Audio not playing
1. Check if file exists: `callcontext-frontend/public/sounds/incoming-call.mp3`
2. Open browser console and look for errors
3. Try clicking anywhere on the page first (autoplay policy)
4. Check audio element in DevTools: right-click notification → Inspect → find `<audio>` element

### Notifications not showing
1. Check browser permission: DevTools → Application → Notifications
2. Try clicking "Enable Notifications" button
3. Check OS notification settings (Windows/Mac may block browser notifications)

### Test button not working
1. Check browser console for API errors
2. Verify you're authenticated (logged in)
3. Check that shop exists in database
4. Try refreshing the page

### Calls not detected automatically
1. Verify database has calls with status `ringing` or `active`
2. Check `started_at` timestamp is within last 5 minutes
3. Open Network tab and watch `/api/calls/live` requests (should poll every 2s)
4. Verify `shop_id` matches your session

---

## Future Enhancements

- [ ] WebSocket/Realtime subscription (no polling)
- [ ] Service worker for push notifications (mobile)
- [ ] Call queue management (hold/transfer)
- [ ] Custom ringtone upload per shop
- [ ] "Do Not Disturb" mode toggle
- [ ] Call routing rules (auto-assign to team member)
- [ ] Notification sound preview in settings
- [ ] Desktop app integration (Electron)

---

## Summary

The live call notification system is now fully functional. Users will receive:
- Visual + audio alerts when customers call
- Browser notifications (if permission granted)
- Quick access to call details and customer profile

**To activate:** Add the audio file and click "Test Incoming Call" on the dashboard!
