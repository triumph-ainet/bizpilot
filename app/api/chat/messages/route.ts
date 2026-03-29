import { NextRequest, NextResponse } from 'next/server';
import { getVendorSessionFromRequest } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const session = await getVendorSessionFromRequest(req);
  if (!session?.vendorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const customer = req.nextUrl.searchParams.get('customer');
  if (!customer) {
    return NextResponse.json({ error: 'customer is required' }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('messages')
    .select('id, sender, content, created_at')
    .eq('vendor_id', session.vendorId)
    .eq('customer_identifier', customer)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const session = await getVendorSessionFromRequest(req);
  if (!session?.vendorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { customer, content } = await req.json();
  if (!customer || !String(content || '').trim()) {
    return NextResponse.json({ error: 'customer and content are required' }, { status: 400 });
  }

  const message = String(content).trim();
  const supabase = createServerSupabase();

  const { error } = await supabase.from('messages').insert({
    vendor_id: session.vendorId,
    sender: 'vendor',
    channel: 'web_chat',
    content: message,
    customer_identifier: customer,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  fetch(`${req.nextUrl.origin}/api/messages/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendorId: session.vendorId, customer, message }),
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
