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
    const recordingEvent = provider.parseRecordingWebhook(body, headers);

    const { data: call } = await supabase
      .from('calls')
      .select('id, shop_id')
      .eq('id', recordingEvent.callId)
      .single();

    if (!call) {
      console.error(`Call not found for recording: ${recordingEvent.callId}`);
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    const audioBuffer = await provider.downloadRecording(recordingEvent.recordingUrl);

    const fileName = `${call.shop_id}/${recordingEvent.callId}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('recordings')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Failed to upload recording:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload recording' },
        { status: 500 }
      );
    }

    await supabase
      .from('calls')
      .update({
        recording_url: recordingEvent.recordingUrl,
        recording_storage_path: fileName,
      })
      .eq('id', call.id);

    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/transcription/enqueue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ call_id: call.id }),
    });

    return NextResponse.json({ message: 'Recording saved and transcription queued' });
  } catch (error) {
    console.error('Recording webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process recording' },
      { status: 500 }
    );
  }
}
