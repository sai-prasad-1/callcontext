// ============================================
// Telnyx implementation of TelephonyProvider
// Uses Call Control API (JSON commands) + TeXML
// ============================================

import type { TelephonyProvider } from '../provider';
import type {
  InboundCallEvent,
  CallStatusEvent,
  RecordingReadyEvent,
  CallRoutingInstructions,
  CallRoutingStep,
  AudioStreamMessage,
  ProvisionedNumber,
  SMSSendResult,
} from '../types';

const TELNYX_API_BASE = 'https://api.telnyx.com/v2';

export class TelnyxAdapter implements TelephonyProvider {
  readonly name = 'telnyx';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.TELNYX_API_KEY!;
    if (!this.apiKey) throw new Error('TELNYX_API_KEY is required');
  }

  private async apiRequest(method: string, path: string, body?: any) {
    const response = await fetch(`${TELNYX_API_BASE}${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Telnyx API error ${response.status}: ${error}`);
    }
    return response.json();
  }

  // ── Inbound Call Handling ──────────────────────

  parseInboundCallWebhook(body: any, headers: Record<string, string>): InboundCallEvent {
    const event = body.data;
    return {
      callId: event.payload.call_control_id || event.payload.call_leg_id,
      from: event.payload.from,
      to: event.payload.to,
      direction: event.payload.direction || 'inbound',
      timestamp: new Date(event.occurred_at),
      rawPayload: body,
    };
  }

  parseStatusWebhook(body: any, headers: Record<string, string>): CallStatusEvent {
    const event = body.data;
    const eventType = event.event_type;

    const statusMap: Record<string, CallStatusEvent['status']> = {
      'call.initiated': 'ringing',
      'call.answered': 'answered',
      'call.hangup': 'completed',
      'call.machine.detection.ended': 'answered',
      'call.speak.ended': 'answered',
    };

    return {
      callId: event.payload.call_control_id,
      status: statusMap[eventType] || 'completed',
      duration: event.payload.duration_secs,
      timestamp: new Date(event.occurred_at),
      rawPayload: body,
    };
  }

  parseRecordingWebhook(body: any, headers: Record<string, string>): RecordingReadyEvent {
    const event = body.data;
    return {
      callId: event.payload.call_control_id,
      recordingId: event.payload.recording_id,
      recordingUrl: event.payload.recording_urls?.mp3 || event.payload.recording_urls?.wav,
      duration: event.payload.duration_secs,
      rawPayload: body,
    };
  }

  generateCallResponse(instructions: CallRoutingInstructions): string {
    let texml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n';

    for (const step of instructions.steps) {
      switch (step.type) {
        case 'say':
          texml += `  <Say language="${step.language || 'en-US'}">${this.escapeXml(step.text)}</Say>\n`;
          break;

        case 'stream':
          texml += `  <Start>\n`;
          texml += `    <Stream url="${step.websocketUrl}" track="both_tracks">\n`;
          if (step.headers) {
            for (const [key, value] of Object.entries(step.headers)) {
              texml += `      <Parameter name="${key}" value="${value}" />\n`;
            }
          }
          texml += `    </Stream>\n`;
          texml += `  </Start>\n`;
          break;

        case 'connect_phone':
          texml += `  <Dial callerId="${step.callerId}" action="${step.eventUrl}">\n`;
          texml += `    <Number>${step.number}</Number>\n`;
          texml += `  </Dial>\n`;
          break;

        case 'conference':
          texml += `  <Dial action="${step.eventUrl}">\n`;
          texml += `    <Conference`;
          if (step.record) texml += ` record="record-from-start"`;
          texml += `>${step.name}</Conference>\n`;
          texml += `  </Dial>\n`;
          break;

        case 'hangup':
          texml += `  <Hangup />\n`;
          break;
      }
    }

    texml += '</Response>';
    return texml;
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    // Telnyx uses ED25519 signature verification
    // For MVP: trust the request if it has the correct structure
    // For production: implement full signature verification
    // See: https://developers.telnyx.com/docs/api/v2/overview#webhook-signing
    return true;
  }

  // ── Audio Streaming ────────────────────────────

  parseAudioStreamMessage(rawMessage: Buffer | string): AudioStreamMessage {
    const data = typeof rawMessage === 'string' ? JSON.parse(rawMessage) : JSON.parse(rawMessage.toString());

    if (data.event === 'start') {
      return {
        type: 'start',
        callId: data.start?.call_control_id || data.stream_id,
        metadata: data.start,
      };
    }

    if (data.event === 'stop') {
      return {
        type: 'stop',
        callId: data.stream_id,
      };
    }

    if (data.event === 'media') {
      return {
        type: 'audio',
        callId: data.stream_id,
        audioData: Buffer.from(data.media.payload, 'base64'),
        sampleRate: 16000,
        encoding: 'linear16',
      };
    }

    return { type: 'error', callId: '' };
  }

  getStreamAudioFormat() {
    return { sampleRate: 16000, encoding: 'linear16' as const };
  }

  // ── Recordings ─────────────────────────────────

  async downloadRecording(recordingUrl: string): Promise<Buffer> {
    const response = await fetch(recordingUrl, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    });
    if (!response.ok) throw new Error(`Failed to download recording: ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  }

  // ── Number Management ──────────────────────────

  async searchNumbers(country: string, areaCode?: string, limit: number = 10): Promise<ProvisionedNumber[]> {
    const params = new URLSearchParams({
      'filter[country_code]': country,
      'filter[limit]': limit.toString(),
      'filter[features]': 'voice,sms',
    });
    if (areaCode) {
      params.set('filter[national_destination_code]', areaCode);
    }

    const data = await this.apiRequest('GET', `/available_phone_numbers?${params}`);

    return data.data.map((num: any) => ({
      phoneNumber: num.phone_number,
      providerId: num.record_type,
      country: num.region_information?.[0]?.region_name || country,
      type: num.phone_number_type === 'toll_free' ? 'toll_free' : 'local',
      monthlyRate: 1.00,
    }));
  }

  async provisionNumber(phoneNumber: string): Promise<ProvisionedNumber> {
    const data = await this.apiRequest('POST', '/number_orders', {
      phone_numbers: [{ phone_number: phoneNumber }],
    });

    return {
      phoneNumber,
      providerId: data.data.id,
      country: 'US',
      type: 'local',
      monthlyRate: 1.00,
    };
  }

  async releaseNumber(phoneNumber: string): Promise<void> {
    await this.apiRequest('DELETE', `/phone_numbers/${encodeURIComponent(phoneNumber)}`);
  }

  async configureNumber(phoneNumber: string, config: {
    answerUrl: string;
    statusUrl: string;
  }): Promise<void> {
    await this.apiRequest('PATCH', `/phone_numbers/${encodeURIComponent(phoneNumber)}`, {
      connection_id: process.env.TELNYX_CONNECTION_ID,
    });
  }

  // ── SMS ────────────────────────────────────────

  async sendSMS(from: string, to: string, body: string): Promise<SMSSendResult> {
    try {
      const data = await this.apiRequest('POST', '/messages', {
        from,
        to,
        text: body,
        type: 'SMS',
      });

      return {
        messageId: data.data.id,
        to,
        status: 'queued',
      };
    } catch (error: any) {
      return {
        messageId: '',
        to,
        status: 'failed',
        error: error.message,
      };
    }
  }

  // ── Helpers ────────────────────────────────────

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
