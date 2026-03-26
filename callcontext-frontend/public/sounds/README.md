# Audio Files for CallContext

This directory contains audio files used by the notification system.

## Required Files

### `incoming-call.mp3`
**Purpose:** Ringtone that plays when a customer calls

**Specifications:**
- Format: MP3
- Duration: 2-5 seconds (will loop automatically)
- Volume: Medium level
- Type: Professional ringtone or chime sound

**How to add:**

1. **Option 1: Download a free ringtone**
   - Visit: https://mixkit.co/free-sound-effects/ringtone/
   - Or: https://freesound.org/search/?q=phone+ring
   - Download your preferred ringtone
   - Rename it to `incoming-call.mp3`
   - Place it in this directory

2. **Option 2: Use a simple beep (PowerShell)**
   ```powershell
   # This is a placeholder - you'll need to add a real MP3 file
   # You can record a simple tone using Windows Voice Recorder
   # or download from the links above
   ```

3. **Option 3: Create your own**
   - Use Audacity or any audio editor
   - Record a 2-3 second tone or chime
   - Export as MP3
   - Save as `incoming-call.mp3`

## Testing

Once you've added the audio file:

1. Go to http://localhost:3000/dashboard
2. Click the "Test Incoming Call" button (top-right)
3. You should hear the ringtone playing

## File Not Found?

If you see errors in the browser console about missing audio:
- Check that `incoming-call.mp3` exists in this exact directory
- Check file name spelling (case-sensitive on some systems)
- Try refreshing the page

## Custom Ringtones

To use a different ringtone:
- Replace `incoming-call.mp3` with your file
- Or update the path in `components/notifications/LiveCallNotifications.tsx`
