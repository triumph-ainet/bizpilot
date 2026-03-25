import { NextRequest, NextResponse } from 'next/server';
import { getVendorSessionFromRequest } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';

const ALLOWED_STATUSES = new Set(['pending', 'paid', 'credit', 'cancelled']);

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getVendorSessionFromRequest(_req);
  if (!session?.vendorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = createServerSupabase();
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*), payments(*)')
    .eq('id', id)
    .eq('vendor_id', session.vendorId)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getVendorSessionFromRequest(req);
  if (!session?.vendorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { status } = await req.json();
  if (!ALLOWED_STATUSES.has(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { id } = await context.params;
  const supabase = createServerSupabase();
  const { data: order, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .eq('vendor_id', session.vendorId)
    .select('*, order_items(*), payments(*)')
    .single();

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}
