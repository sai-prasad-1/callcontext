// ============================================
// Core types shared across all telephony providers
// ============================================

export type TelephonyProviderType = 'telnyx' | 'twilio';

// What you get when a call comes in (webhook payload, normalized)
export interface InboundCallEvent {
  callId: string;              // Provider's unique call ID
  from: string;                // Caller phone number (E.164)
  to: string;                  // Your provisioned number (E.164)
  direction: 'inbound' | 'outbound';
  timestamp: Date;
  rawPayload: Record<string, any>;  // Original webhook body for debugging
}

// What you get when a call status changes
export interface CallStatusEvent {
  callId: string;
  status: 'ringing' | 'answered' | 'completed' | 'missed' | 'failed';
  duration?: number;           // Duration in seconds (on completed)
  timestamp: Date;
  rawPayload: Record<string, any>;
}

// What you get when a recording is ready
export interface RecordingReadyEvent {
  callId: string;
  recordingId: string;
  recordingUrl: string;        // Provider's URL to download recording
  duration: number;            // Recording duration in seconds
  rawPayload: Record<string, any>;
}

// Instructions for how to handle an inbound call
export interface CallRoutingInstructions {
  steps: CallRoutingStep[];
}

export type CallRoutingStep =
  | { type: 'say'; text: string; language?: string }
  | { type: 'conference'; name: string; record: boolean; eventUrl: string }
  | { type: 'stream'; websocketUrl: string; headers?: Record<string, string> }
  | { type: 'connect_phone'; number: string; callerId: string; eventUrl: string }
  | { type: 'hangup' };

// Audio stream message from the WebSocket
export interface AudioStreamMessage {
  type: 'audio' | 'start' | 'stop' | 'error';
  callId: string;
  audioData?: Buffer;          // Raw audio bytes (PCM or mulaw)
  sampleRate?: number;         // 8000 or 16000
  encoding?: 'linear16' | 'mulaw';
  metadata?: Record<string, any>;
}

// Provisioned phone number
export interface ProvisionedNumber {
  phoneNumber: string;         // E.164 format
  providerId: string;          // Provider's internal ID for this number
  country: string;             // ISO 2-letter country code
  type: 'local' | 'toll_free';
  monthlyRate: number;         // In USD
}

// SMS send result
export interface SMSSendResult {
  messageId: string;
  to: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  error?: string;
}
