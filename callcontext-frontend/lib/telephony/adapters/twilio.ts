// ============================================
// Twilio implementation of TelephonyProvider
// Uses TwiML (XML) + REST API
// ============================================

import type { TelephonyProvider } from '../provider';
import type {
  InboundCallEvent,
  CallStatusEvent,
  RecordingReadyEvent,
  CallRoutingInstructions,
  AudioStreamMessage,
  ProvisionedNumber,
  SMSSendResult,
} from '../types';

const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01';

export class TwilioAdapter implements TelephonyProvider {
  readonly name = 'twilio';
  private accountSid: string;
  private authToken: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID!;
    this.authToken = process.env.TWILIO_AUTH_TOKEN!;
    if (!this.accountSid || !this.authToken) {
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required');
    }
  }

  private get authHeader(): string {
    return 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
  }

  private async apiRequest(method: string, path: string, body?: Record<string, string>) {
    const url = `${TWILIO_API_BASE}/Accounts/${this.accountSid}${path}.json`;
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': this.authHeader,
      },
    };

    if (body) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      options.body = new URLSearchParams(body).toString();
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twilio API error ${response.status}: ${error}`);
    }
    return response.json();
  }

  // ── Inbound Call Handling ──────────────────────

  parseInboundCallWebhook(body: any, headers: Record<string, string>): InboundCallEvent {
    return {
      callId: body.CallSid,
      from: body.From,
      to: body.To,
      direction: body.Direction === 'inbound' ? 'inbound' : 'outbound',
      timestamp: new Date(),
      rawPayload: body,
    };
  }

  parseStatusWebhook(body: any, headers: Record<string, string>): CallStatusEvent {
    const statusMap: Record<string, CallStatusEvent['status']> = {
      'ringing': 'ringing',
      'in-progress': 'answered',
      'completed': 'completed',
      'busy': 'missed',
      'no-answer': 'missed',
      'failed': 'failed',
      'canceled': 'missed',
    };

    return {
      callId: body.CallSid,
      status: statusMap[body.CallStatus] || 'completed',
      duration: body.CallDuration ? parseInt(body.CallDuration) : undefined,
      timestamp: new Date(),
      rawPayload: body,
    };
  }

  parseRecordingWebhook(body: any, headers: Record<string, string>): RecordingReadyEvent {
    return {
      callId: body.CallSid,
      recordingId: body.RecordingSid,
      recordingUrl: body.RecordingUrl + '.mp3',
      duration: parseInt(body.RecordingDuration || '0'),
      rawPayload: body,
    };
  }

  generateCallResponse(instructions: CallRoutingInstructions): string {
    let twiml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n';

    for (const step of instructions.steps) {
      switch (step.type) {
        case 'say':
          twiml += `  <Say language="${step.language || 'en-US'}">${this.escapeXml(step.text)}</Say>\n`;
          break;

        case 'stream':
          twiml += `  <Start>\n`;
          twiml += `    <Stream url="${step.websocketUrl}">\n`;
          if (step.headers) {
            for (const [key, value] of Object.entries(step.headers)) {
              twiml += `      <Parameter name="${key}" value="${value}" />\n`;
            }
          }
          twiml += `    </Stream>\n`;
          twiml += `  </Start>\n`;
          break;

        case 'connect_phone':
          twiml += `  <Dial callerId="${step.callerId}" action="${step.eventUrl}">\n`;
          twiml += `    <Number>${step.number}</Number>\n`;
          twiml += `  </Dial>\n`;
          break;

        case 'conference':
          twiml += `  <Dial action="${step.eventUrl}">\n`;
          twiml += `    <Conference`;
          if (step.record) twiml += ` record="record-from-start"`;
          twiml += ` startConferenceOnEnter="true" endConferenceOnExit="true">`;
          twiml += `${step.name}</Conference>\n`;
          twiml += `  </Dial>\n`;
          break;

        case 'hangup':
          twiml += `  <Hangup />\n`;
          break;
      }
    }

    twiml += '</Response>';
    return twiml;
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha1', this.authToken)
      .update(body)
      .digest('base64');
    return signature === expectedSignature;
  }

  // ── Audio Streaming ────────────────────────────

  parseAudioStreamMessage(rawMessage: Buffer | string): AudioStreamMessage {
    const data = typeof rawMessage === 'string' ? JSON.parse(rawMessage) : JSON.parse(rawMessage.toString());

    if (data.event === 'start') {
      return {
        type: 'start',
        callId: data.start?.callSid || data.streamSid,
        metadata: data.start,
      };
    }

    if (data.event === 'stop') {
      return {
        type: 'stop',
        callId: data.streamSid,
      };
    }

    if (data.event === 'media') {
      return {
        type: 'audio',
        callId: data.streamSid,
        audioData: Buffer.from(data.media.payload, 'base64'),
        sampleRate: 8000,
        encoding: 'mulaw',
      };
    }

    return { type: 'error', callId: '' };
  }

  getStreamAudioFormat() {
    return { sampleRate: 8000, encoding: 'mulaw' as const };
  }

  // ── Recordings ─────────────────────────────────

  async downloadRecording(recordingUrl: string): Promise<Buffer> {
    const response = await fetch(recordingUrl, {
      headers: { 'Authorization': this.authHeader },
    });
    if (!response.ok) throw new Error(`Failed to download recording: ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  }

  // ── Number Management ──────────────────────────

  async searchNumbers(country: string, areaCode?: string, limit: number = 10): Promise<ProvisionedNumber[]> {
    const params: Record<string, string> = {};
    if (areaCode) params.AreaCode = areaCode;
    params.Limit = limit.toString();

    const queryString = new URLSearchParams(params).toString();
    const data = await this.apiRequest('GET',
      `/AvailablePhoneNumbers/${country}/Local?${queryString}`);

    return data.available_phone_numbers.map((num: any) => ({
      phoneNumber: num.phone_number,
      providerId: num.phone_number,
      country,
      type: 'local' as const,
      monthlyRate: 1.15,
    }));
  }

  async provisionNumber(phoneNumber: string): Promise<ProvisionedNumber> {
    const data = await this.apiRequest('POST', '/IncomingPhoneNumbers', {
      PhoneNumber: phoneNumber,
    });

    return {
      phoneNumber: data.phone_number,
      providerId: data.sid,
      country: data.iso_country,
      type: 'local',
      monthlyRate: 1.15,
    };
  }

  async releaseNumber(phoneNumber: string): Promise<void> {
    const data = await this.apiRequest('GET',
      `/IncomingPhoneNumbers?PhoneNumber=${encodeURIComponent(phoneNumber)}`);
    if (data.incoming_phone_numbers.length > 0) {
      const sid = data.incoming_phone_numbers[0].sid;
      await this.apiRequest('DELETE', `/IncomingPhoneNumbers/${sid}`);
    }
  }

  async configureNumber(phoneNumber: string, config: {
    answerUrl: string;
    statusUrl: string;
  }): Promise<void> {
    const data = await this.apiRequest('GET',
      `/IncomingPhoneNumbers?PhoneNumber=${encodeURIComponent(phoneNumber)}`);
    if (data.incoming_phone_numbers.length > 0) {
      const sid = data.incoming_phone_numbers[0].sid;
      await this.apiRequest('POST', `/IncomingPhoneNumbers/${sid}`, {
        VoiceUrl: config.answerUrl,
        VoiceMethod: 'POST',
        StatusCallback: config.statusUrl,
        StatusCallbackMethod: 'POST',
      });
    }
  }

  // ── SMS ────────────────────────────────────────

  async sendSMS(from: string, to: string, body: string): Promise<SMSSendResult> {
    try {
      const data = await this.apiRequest('POST', '/Messages', {
        From: from,
        To: to,
        Body: body,
      });

      return {
        messageId: data.sid,
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
