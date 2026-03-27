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

  // If there's a session for this order, try to notify the customer with a session link
  try {
    const { sendNotificationEmail, sendInvoiceEmail } = await import('@/lib/services/email.service');
    const { data: session } = await supabase.from('sessions').select('*').eq('order_id', id).limit(1).single();
    const sessionUrl = session?.token ? `${process.env.NEXT_PUBLIC_APP_URL}/session/${session.token}` : null;

    const recipient = session?.customer_email || (order.customer_identifier && order.customer_identifier.includes('@') ? order.customer_identifier : null);
    if (recipient) {
      const vendor = await supabase.from('vendors').select('business_name').eq('id', session?.vendor_id || order.vendor_id).single();
      const vendorName = vendor?.data?.business_name || 'Vendor';
      const msg = `Your order status changed to ${status}.`;
      await sendNotificationEmail(recipient, vendorName, order.customer_identifier, msg, sessionUrl ? `<p><a href="${sessionUrl}">Open your order</a></p>` : undefined).catch(() => null);
    }
  } catch (e) {
    // Don't block on email failures
    console.warn('[orders][notify] failed to send notification', e);
  }

  return NextResponse.json(order);
}
