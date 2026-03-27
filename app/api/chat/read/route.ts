import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { vendorId, customer } = await req.json();
    if (!vendorId || !customer) return NextResponse.json({ error: 'vendorId and customer required' }, { status: 400 });

    const supabase = createServerSupabase();
    const now = new Date().toISOString();

    // upsert last_read
    await supabase.from('message_reads').upsert({ vendor_id: vendorId, customer_identifier: customer, last_read: now }, { onConflict: '(vendor_id, customer_identifier)' });

    return NextResponse.json({ success: true, last_read: now });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
