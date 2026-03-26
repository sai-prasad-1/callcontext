// ============================================
// Factory — returns the active provider based on env var
// ============================================

import type { TelephonyProvider } from './provider';
import type { TelephonyProviderType } from './types';

let _provider: TelephonyProvider | null = null;

export function getTelephonyProvider(): TelephonyProvider {
  if (_provider) return _provider;
  
  const providerType = (process.env.TELEPHONY_PROVIDER || 'telnyx') as TelephonyProviderType;
  
  switch (providerType) {
    case 'telnyx':
      const { TelnyxAdapter } = require('./adapters/telnyx');
      _provider = new TelnyxAdapter();
      break;
    case 'twilio':
      const { TwilioAdapter } = require('./adapters/twilio');
      _provider = new TwilioAdapter();
      break;
    default:
      throw new Error(`Unknown telephony provider: ${providerType}`);
  }
  
  return _provider;
}

// Re-export types for convenience
export type { TelephonyProvider } from './provider';
export * from './types';
