import { NextRequest, NextResponse } from "next/server";
import { getTelephonyProvider } from "@/lib/telephony";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const provider = getTelephonyProvider();
  const callId = request.nextUrl.searchParams.get('call_id');

  if (!callId) {
    return NextResponse.json({ error: 'Missing call_id' }, { status: 400 });
  }

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
    const statusEvent = provider.parseStatusWebhook(body, headers);

    switch (statusEvent.status) {
      case 'answered':
        await supabase
          .from('calls')
          .update({ status: 'active' })
          .eq('id', callId);
        break;

      case 'completed':
        await supabase
          .from('calls')
          .update({
            status: 'completed',
            ended_at: new Date().toISOString(),
            duration_seconds: statusEvent.duration,
          })
          .eq('id', callId);
        break;

      case 'missed':
        await supabase
          .from('calls')
          .update({
            status: 'missed',
            ended_at: new Date().toISOString(),
          })
          .eq('id', callId);
        break;

      case 'failed':
        await supabase
          .from('calls')
          .update({
            status: 'failed',
            ended_at: new Date().toISOString(),
          })
          .eq('id', callId);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Status webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process status' },
      { status: 500 }
    );
  }
}
