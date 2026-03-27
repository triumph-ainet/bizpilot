import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: vendorId } = await context.params;
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ feedback: data || [] });
  } catch (e) {
    console.error('[feedback GET]', e);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}
