import { NextRequest, NextResponse } from 'next/server';
import { getVendorSessionFromRequest } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const session = await getVendorSessionFromRequest(req);
  if (!session?.vendorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabase();

  // load recent messages (descending) and dedupe per customer to get last message
  const { data } = await supabase
    .from('messages')
    .select('customer_identifier, content, sender, created_at')
    .eq('vendor_id', session.vendorId)
    .order('created_at', { ascending: false });

  const seen = new Set<string>();
  const contacts: Array<{
    customer: string;
    lastMessage?: string;
    lastAt?: string;
    unread?: number;
  }> = [];

  for (const m of (data || []) as any[]) {
    const customer = m.customer_identifier as string;
    if (seen.has(customer)) continue;
    seen.add(customer);

    // fetch last read timestamp for this vendor/customer
    const { data: lr } = await supabase
      .from('message_reads')
      .select('last_read')
      .eq('vendor_id', session.vendorId)
      .eq('customer_identifier', customer)
      .limit(1)
      .single();

    let unread = 0;
    try {
      const q = supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('vendor_id', session.vendorId)
        .eq('customer_identifier', customer)
        .eq('sender', 'customer');

      if (lr?.last_read) q.gt('created_at', lr.last_read as string);

      const { count } = await q;
      unread = Number(count || 0);
    } catch (e) {
      unread = 0;
    }

    contacts.push({ customer, lastMessage: m.content, lastAt: m.created_at, unread });
  }

  return NextResponse.json(contacts);
}
