import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema
const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().optional(),
  phone: z.string().optional(),
  business_name: z.string().optional(),
  business_type: z.string().optional(),
  referral_source: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = waitlistSchema.parse(body);

    // Create Supabase client (anon for public access)
    const supabase = await createClient();

    // Check if email already exists
    const { data: existing, error: existingError } = await supabase
      .from('waitlist')
      .select('id, email, position')
      .eq('email', validatedData.email)
      .single() as { data: { id: string; email: string; position: number } | null; error: any };

    if (existing && !existingError) {
      return NextResponse.json(
        { 
          error: 'This email is already on the waitlist',
          position: existing.position 
        },
        { status: 409 }
      );
    }

    // Get current waitlist count for position
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    const position = (count || 0) + 1;

    // Insert into waitlist
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        email: validatedData.email,
        full_name: validatedData.full_name || null,
        phone: validatedData.phone || null,
        business_name: validatedData.business_name || null,
        business_type: validatedData.business_type || null,
        referral_source: validatedData.referral_source || null,
        position,
        status: 'pending'
      })
      .select('id, email, referral_code, position')
      .single() as { data: { id: string; email: string; referral_code: string; position: number } | null; error: any };

    if (error) {
      console.error('Waitlist insertion error:', error);
      return NextResponse.json(
        { error: 'Failed to join waitlist. Please try again.' },
        { status: 500 }
      );
    }

    // TODO: Send welcome email with referral code
    // TODO: Notify team of new waitlist signup

    return NextResponse.json({
      success: true,
      message: 'Successfully joined waitlist',
      position: data.position,
      referral_code: data.referral_code
    });

  } catch (error) {
    console.error('Waitlist API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve waitlist stats (public)
export async function GET() {
  try {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      total_on_waitlist: count || 0
    });

  } catch (error) {
    console.error('Waitlist stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist stats' },
      { status: 500 }
    );
  }
}
