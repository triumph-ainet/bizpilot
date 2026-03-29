import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/services/payment.service';
import { generateReceipt } from '@/lib/services/ai.service';
import { createServerSupabase } from '@/lib/supabase';
import { buildLowStockAlertHtml, sendInvoiceEmail } from '@/lib/services/email.service';

type WebhookProcessItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
};

type WebhookProcessOrder = {
  id: string;
  vendor_id: string;
  channel: string;
  customer_identifier: string;
  total: number;
};

type WebhookProcessResult = {
  status: string;
  order?: WebhookProcessOrder;
  items?: WebhookProcessItem[];
};

type StockAlertRow = {
  product_name: string;
  quantity: number | null;
  threshold: number | null;
};

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

    const result = procResult as WebhookProcessResult | null;
    if (!result || result.status === 'no_payment') {
      return NextResponse.json({ received: true, status: 'no_payment_record' });
    }

    if (result.status === 'already_processed') {
      return NextResponse.json({ received: true, status: 'already_processed' });
    }

    if (!result.order) {
      return NextResponse.json({ received: true, status: 'missing_order' }, { status: 500 });
    }

    const order = result.order;
    const items = result.items || [];

    const purchasedProductIds = items.map((it) => it.product_id).filter(Boolean);

    const { data: vendor } = await supabase
      .from('vendors')
      .select('id, business_name, email')
      .eq('id', order.vendor_id)
      .single();

    const vendorName = vendor?.business_name || 'Vendor';

    const { data: stockAlerts } = purchasedProductIds.length
      ? await supabase
          .from('stock_alerts')
          .select('product_name, quantity, threshold')
          .eq('vendor_id', order.vendor_id)
          .eq('resolved', false)
          .in('product_id', purchasedProductIds)
      : { data: [] as StockAlertRow[] };

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
      const { buildReceiptHtml } = await import('@/lib/services/email.service');

      // If customer_identifier is an email, send receipt there
      if (order.customer_identifier && order.customer_identifier.includes('@')) {
        const html = buildReceiptHtml({
          vendorName,
          receiptText: receipt,
        });
        await sendInvoiceEmail(
          order.customer_identifier,
          `Receipt - ${payload.txnref}`,
          html
        ).catch(() => null);
      }

      // Also look up any session tied to this order and email the session link if we have an email
      const { data: session } = await supabase2
        .from('sessions')
        .select('*')
        .eq('order_id', order.id)
        .limit(1)
        .single();

      const sessionEmail = session?.customer_email || null;
      if (sessionEmail) {
        const sessionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/session/${session.token}`;
        const html = buildReceiptHtml({
          vendorName,
          receiptText: receipt,
          sessionUrl,
        });
        await sendInvoiceEmail(
          sessionEmail,
          `Your order is confirmed - ${payload.txnref}`,
          html
        ).catch(() => null);
      }
    } catch (e) {
      console.warn('Failed to send receipt email', e);
    }

    if (vendor?.email && stockAlerts && stockAlerts.length > 0) {
      const html = buildLowStockAlertHtml({
        vendorName,
        alerts: stockAlerts.map((alert) => ({
          productName: alert.product_name,
          quantity: Number(alert.quantity || 0),
          threshold: Number(alert.threshold || 0),
        })),
      });

      await sendInvoiceEmail(vendor.email, 'Low stock alert', html).catch((err) => {
        console.warn('[webhook] failed to send low stock email', err);
      });
    }

    return NextResponse.json({
      received: true,
      orderId: order.id,
      lowStockAlerts: stockAlerts?.length || 0,
    });
  } catch (error) {
    console.error('[webhook]', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
