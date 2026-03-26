import { NextRequest, NextResponse } from "next/server";
import { getTelephonyProvider } from "@/lib/telephony";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import crypto from "crypto";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TWO_PARTY_STATES = new Set([
  'CA', 'CT', 'DE', 'FL', 'IL', 'MD', 'MA', 'MT', 'NV', 'NH', 'PA', 'WA', 'MI', 'VT'
]);

export async function POST(request: NextRequest) {
  const provider = getTelephonyProvider();
  
  let body: any;
  const contentType = request.headers.get('content-type') || '';
  
  if (contentType.includes('application/json')) {
    body = await request.json();
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    body = Object.fromEntries(formData.entries());
  } else {
    body = await request.json();
  }

  const headers = Object.fromEntries(request.headers);

  try {
    const callEvent = provider.parseInboundCallWebhook(body, headers);

    const { data: shop } = await supabase
      .from('shops')
      .select('*')
      .eq('vonage_number', callEvent.to)
      .single();

    if (!shop) {
      const response = provider.generateCallResponse({
        steps: [
          { type: 'say', text: 'Sorry, this number is not configured.' },
          { type: 'hangup' },
        ],
      });
      return new NextResponse(
        typeof response === 'string' ? response : JSON.stringify(response),
        { 
          headers: { 
            'Content-Type': typeof response === 'string' ? 'text/xml' : 'application/json' 
          } 
        }
      );
    }

    let customer = await supabase
      .from('customers')
      .select('*')
      .eq('shop_id', shop.id)
      .eq('phone', callEvent.from)
      .single()
      .then(res => res.data);

    if (!customer) {
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({
          shop_id: shop.id,
          phone: callEvent.from,
          first_contact_date: new Date().toISOString(),
          preferences: { primary: [], secondary: [], restrictions: [], notes: '' },
        })
        .select()
        .single();
      customer = newCustomer;
    }

    const callId = crypto.randomUUID();

    await supabase.from('calls').insert({
      id: callId,
      shop_id: shop.id,
      customer_id: customer?.id || null,
      direction: 'inbound',
      status: 'ringing',
      started_at: new Date().toISOString(),
      from_number: callEvent.from,
      to_number: callEvent.to,
    });

    const steps: any[] = [];

    if (TWO_PARTY_STATES.has(shop.state || '') && (shop.settings as any)?.consent_mode !== 'silent') {
      steps.push({
        type: 'say',
        text: (shop.settings as any)?.custom_greeting || `Thanks for calling ${shop.name}. This call may be recorded.`,
      });
    }

    if (process.env.RAILWAY_HOST) {
      steps.push({
        type: 'stream',
        websocketUrl: `wss://${process.env.RAILWAY_HOST}/audio-stream`,
        headers: {
          shop_id: shop.id,
          call_id: callId,
          caller: callEvent.from,
        },
      });
    }

    const forwardingNumber = (shop.settings as any)?.forwarding_to || shop.phone;
    if (forwardingNumber) {
      steps.push({
        type: 'connect_phone',
        number: forwardingNumber,
        callerId: callEvent.to,
        eventUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/telephony/status?call_id=${callId}`,
      });
    } else {
      steps.push({
        type: 'say',
        text: 'Sorry, no forwarding number is configured.',
      });
      steps.push({ type: 'hangup' });
    }

    const response = provider.generateCallResponse({ steps });

    return new NextResponse(
      typeof response === 'string' ? response : JSON.stringify(response),
      { 
        headers: { 
          'Content-Type': typeof response === 'string' ? 'text/xml' : 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Answer webhook error:', error);
    const response = provider.generateCallResponse({
      steps: [
        { type: 'say', text: 'Sorry, an error occurred. Please try again later.' },
        { type: 'hangup' },
      ],
    });
    return new NextResponse(
      typeof response === 'string' ? response : JSON.stringify(response),
      { 
        headers: { 
          'Content-Type': typeof response === 'string' ? 'text/xml' : 'application/json' 
        } 
      }
    );
  }
}
