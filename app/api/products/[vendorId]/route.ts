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

    if (payload.resp !== '00') {
      return NextResponse.json({ received: true, status: 'ignored' });
    }

    const order = await markOrderPaid(payload.txnref);

    await decrementBatch(order.items);

    const lowStockProducts = await checkLowStock(order.vendor_id);
    const receipt = await generateReceipt(order.customer_identifier, order.total, payload.txnref);

    const supabase = createServerSupabase();
    await supabase.from('messages').insert({
      vendor_id: order.vendor_id,
      sender: 'ai',
      channel: order.channel,
      content: receipt,
    });

    // 7. If low stock, create alert records
    if (lowStockProducts.length > 0) {
      await supabase.from('stock_alerts').upsert(
        lowStockProducts.map((p) => ({
          vendor_id: order.vendor_id,
          product_id: p.id,
          product_name: p.name,
          quantity: p.quantity,
          threshold: p.low_stock_threshold,
        })),
        { onConflict: 'product_id' }
      );
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
