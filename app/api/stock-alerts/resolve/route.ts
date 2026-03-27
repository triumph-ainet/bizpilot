import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const supabase = createServerSupabase();
    const { error } = await supabase.from('stock_alerts').update({ resolved: true }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[stock-alerts/resolve]', e);
    return NextResponse.json({ error: 'Failed to resolve alert' }, { status: 500 });
  }
}
