import { NextRequest, NextResponse } from 'next/server';
import { getVendorSessionFromRequest } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const session = await getVendorSessionFromRequest(req);
  if (!session?.vendorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabase();
  const { data } = await supabase
    .from('messages')
    .select('customer_identifier, content, sender, created_at')
    .eq('vendor_id', session.vendorId)
    .order('created_at', { ascending: false });

  const seen = new Set<string>();
  const contacts: Array<{ customer: string; lastMessage?: string; lastAt?: string }> = [];

  (data || []).forEach((m: any) => {
    if (!seen.has(m.customer_identifier)) {
      seen.add(m.customer_identifier);
      contacts.push({ customer: m.customer_identifier, lastMessage: m.content, lastAt: m.created_at });
    }
  });

  return NextResponse.json(contacts);
}
