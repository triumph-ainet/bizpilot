import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vendor_id, order_id, customer_identifier, rating, comment } = body;
    if (!vendor_id) return NextResponse.json({ error: 'vendor_id required' }, { status: 400 });

    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('feedbacks')
      .insert({ vendor_id, order_id: order_id || null, customer_identifier: customer_identifier || null, rating: rating || null, comment: comment || null })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, feedback: data });
  } catch (e) {
    console.error('[feedback POST]', e);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
