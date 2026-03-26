import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/services/payment.service';
import { markOrderPaid } from '@/lib/services/order.service';
import { decrementBatch, checkLowStock } from '@/lib/services/inventory.service';
import { generateReceipt } from '@/lib/services/ai.service';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const isValid = verifyWebhookSignature(payload);
    if (!isValid) {
      console.warn('[webhook] Invalid signature');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Only process successful payments
    if (payload.resp !== '00') {
      return NextResponse.json({ received: true, status: 'ignored' });
    }

    const supabase = createServerSupabase();

    // Use a DB-side transactional function to process payment atomically
    const { data: procResult, error: procErr } = await supabase.rpc('process_payment', {
      txnref: payload.txnref,
    });

    if (procErr) {
      console.error('[webhook] process_payment rpc failed', procErr);
      return NextResponse.json({ received: true, status: 'rpc_error' }, { status: 500 });
    }

    const result = procResult as any;
    if (!result || result.status === 'no_payment') {
      return NextResponse.json({ received: true, status: 'no_payment_record' });
    }

    if (result.status === 'already_processed') {
      return NextResponse.json({ received: true, status: 'already_processed' });
    }

    const order = result.order as any;
    const items = result.items as any[] | null;

    const lowStockProducts = items ? items.filter((it: any) => Number(it.quantity) > 0) : [];

    const receipt = await generateReceipt(
      order.customer_identifier,
      Number(order.total || 0),
      payload.txnref
    );
    const supabase2 = createServerSupabase();
    await supabase2.from('messages').insert({
      vendor_id: order.vendor_id,
      sender: 'ai',
      channel: order.channel,
      content: receipt,
    });

    // Try to send email if customer_identifier looks like an email
    try {
      if (order.customer_identifier && order.customer_identifier.includes('@')) {
        const { sendInvoiceEmail } = await import('@/lib/services/email.service');
        await sendInvoiceEmail(
          order.customer_identifier,
          `Receipt - ${payload.txnref}`,
          `<p>${receipt}</p>`
        ).catch(() => null);
      }
    } catch (e) {
      console.warn('Failed to send receipt email', e);
    }

    return NextResponse.json({
      received: true,
      orderId: order.id,
      lowStockAlerts: lowStockProducts.length,
    });
  } catch (error) {
    console.error('[webhook]', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
