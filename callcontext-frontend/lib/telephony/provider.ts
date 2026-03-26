// ============================================
// The abstract interface — all providers implement this
// ============================================

import type {
  InboundCallEvent,
  CallStatusEvent,
  RecordingReadyEvent,
  CallRoutingInstructions,
  AudioStreamMessage,
  ProvisionedNumber,
  SMSSendResult,
} from './types';

export interface TelephonyProvider {
  readonly name: string;       // 'telnyx' | 'twilio'

  // ── Inbound Call Handling ──────────────────────
  
  // Parse the webhook payload into a normalized InboundCallEvent
  parseInboundCallWebhook(body: any, headers: Record<string, string>): InboundCallEvent;
  
  // Parse a status update webhook into a normalized CallStatusEvent
  parseStatusWebhook(body: any, headers: Record<string, string>): CallStatusEvent;
  
  // Parse a recording-ready webhook into a normalized RecordingReadyEvent
  parseRecordingWebhook(body: any, headers: Record<string, string>): RecordingReadyEvent;
  
  // Convert our generic routing instructions into provider-specific response
  // Returns: TwiML XML string (Twilio) or TeXML string (Telnyx)
  generateCallResponse(instructions: CallRoutingInstructions): string | object;
  
  // Verify webhook signature (ensure the request is really from the provider)
  verifyWebhookSignature(body: string, signature: string): boolean;

  // ── Audio Streaming ────────────────────────────
  
  // Parse an incoming WebSocket message from the provider into normalized format
  parseAudioStreamMessage(rawMessage: Buffer | string): AudioStreamMessage;
  
  // Get the audio format this provider streams in
  getStreamAudioFormat(): { sampleRate: number; encoding: 'linear16' | 'mulaw' };

  // ── Recordings ─────────────────────────────────
  
  // Download a recording from the provider (returns audio buffer)
  downloadRecording(recordingUrl: string): Promise<Buffer>;

  // ── Number Management ──────────────────────────
  
  // Search for available numbers in a given area code
  searchNumbers(country: string, areaCode?: string, limit?: number): Promise<ProvisionedNumber[]>;
  
  // Purchase/provision a number
  provisionNumber(phoneNumber: string): Promise<ProvisionedNumber>;
  
  // Release/cancel a number
  releaseNumber(phoneNumber: string): Promise<void>;
  
  // Configure webhooks for a number (where inbound calls should be sent)
  configureNumber(phoneNumber: string, config: {
    answerUrl: string;
    statusUrl: string;
  }): Promise<void>;

  // ── SMS ────────────────────────────────────────
  
  // Send a single SMS message
  sendSMS(from: string, to: string, body: string): Promise<SMSSendResult>;
}
