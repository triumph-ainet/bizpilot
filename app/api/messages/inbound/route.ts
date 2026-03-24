import { NextRequest, NextResponse } from 'next/server';
import { adapters } from '@/adapters';
import { parseOrder, generateOrderConfirmation } from '@/lib/services/ai.service';
import { createOrder } from '@/lib/services/order.service';
import { initializePayment } from '@/lib/services/payment.service';
import { getVendorProducts } from '@/lib/services/inventory.service';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const channel = raw.channel || 'sim_chat';
    const adapter = adapters[channel as keyof typeof adapters] || adapters.sim_chat;
    const message = adapter.normalize(raw);
    const catalog = await getVendorProducts(message.vendorId).catch(() => []);
    const parsed = await parseOrder(message.text || '', catalog);

    if (parsed.items.length === 0) {
      return NextResponse.json(
        adapter.formatReply({
          text: "Sorry, I couldn't find those items in our catalog. Could you check the product names and try again?",
        })
      );
    }

    const { order, items } = await createOrder(parsed, message, catalog);
    const payment = await initializePayment(
      order.id,
      order.total * 100, // convert to kobo
      `${message.senderId}@bizpilot.co`
    ).catch(() => ({
      paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pay/${order.id}`,
      reference: order.id,
    }));

    const supabase = createServerSupabase();
    await supabase.from('payments').insert({
      order_id: order.id,
      interswitch_reference: payment.reference,
      amount: order.total,
      status: 'pending',
    });

    const confirmationText = await generateOrderConfirmation(
      items.map((i) => ({ name: i.product_name, quantity: i.quantity, price: i.unit_price })),
      order.total,
      payment.paymentUrl
    );

    await supabase.from('messages').insert([
      { vendor_id: message.vendorId, sender: 'customer', channel, content: message.text || '' },
      { vendor_id: message.vendorId, sender: 'ai', channel, content: confirmationText },
    ]);

    const reply = adapter.formatReply({ text: confirmationText, paymentUrl: payment.paymentUrl });

    return NextResponse.json({
      ...reply,
      order: {
        items: items.map((i) => ({ name: i.product_name, qty: i.quantity, price: i.unit_price })),
        total: order.total,
        paymentUrl: payment.paymentUrl,
      },
    });
  } catch (error) {
    console.error('[messages/inbound]', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
