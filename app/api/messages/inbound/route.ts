import { NextRequest, NextResponse } from 'next/server';
import { adapters } from '@/lib/adapters';
import { parseOrder, generateOrderConfirmation } from '@/lib/services/ai.service';
import { createOrder } from '@/lib/services/order.service';
import { createInvoiceForOrder } from '@/lib/services/invoices.service';
import { initializePayment } from '@/lib/services/payment.service';
import { getVendorProducts } from '@/lib/services/inventory.service';
import { createServerSupabase } from '@/lib/supabase';
import { sendInvoiceEmail } from '@/lib/services/email.service';

async function resolveVendorId(vendorIdentifier: string) {
  const supabase = createServerSupabase();

  const { data: byId } = await supabase
    .from('vendors')
    .select('id')
    .eq('id', vendorIdentifier)
    .single();

  if (byId?.id) return byId.id;

  const { data: bySlug } = await supabase
    .from('vendors')
    .select('id')
    .eq('store_slug', vendorIdentifier)
    .single();

  return bySlug?.id || null;
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const channel = raw.channel || 'sim_chat';
    const adapter = adapters[channel as keyof typeof adapters] || adapters.sim_chat;
    const message = adapter.normalize(raw);
    const vendorId = await resolveVendorId(message.vendorId);
    if (!vendorId) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const normalizedMessage = { ...message, vendorId };
    const catalog = await getVendorProducts(vendorId).catch(() => []);
    const parsed = await parseOrder(message.text || '', catalog);

    if (parsed.items.length === 0) {
      return NextResponse.json(
        adapter.formatReply({
          text: "Sorry, I couldn't find those items in our catalog. Could you check the product names and try again?",
        })
      );
    }

    const { order, items } = await createOrder(parsed, normalizedMessage, catalog);
    const invoice = await createInvoiceForOrder(order.id, order.total, items).catch(() => null);

    const sender = String(message.senderId || '').trim();
    const appName = (process.env.NEXT_PUBLIC_APP_NAME || 'bizpilot.local').trim();
    const paymentEmail = sender.includes('@')
      ? sender
      : `${sender.replace(/[^a-zA-Z0-9]/g, '') || 'customer'}@${appName}`;

    const payment = await initializePayment(
      order.id,
      order.total * 100, // convert to kobo
      paymentEmail,
    ).catch(() => ({
      paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pay/${order.id}`,
      reference: order.id,
    }));

    const supabase = createServerSupabase();
    const { error: paymentInsertError } = await supabase.from('payments').insert({
      order_id: order.id,
      interswitch_reference: payment.reference,
      amount: order.total,
      status: 'pending',
    });

    if (paymentInsertError) {
      console.warn('[messages/inbound] failed to persist payment', {
        orderId: order.id,
        error: paymentInsertError.message,
      });
    }

    // Create a persistent session so customer can resume via a shareable link
    const { data: sessionData, error: sessionInsertError } = await supabase
      .from('sessions')
      .insert({
        vendor_id: vendorId,
        order_id: order.id,
        customer_identifier: message.senderId,
        customer_email:
          message.senderId && message.senderId.includes('@') ? message.senderId : null,
        last_accessed: new Date().toISOString(),
      })
      .select()
      .single();

    if (sessionInsertError) {
      console.warn('[messages/inbound] failed to create session', {
        orderId: order.id,
        error: sessionInsertError.message,
      });
    }

    const sessionToken = sessionData?.token || null;

    const confirmationText = await generateOrderConfirmation(
      items.map((i) => ({ name: i.product_name, quantity: i.quantity, price: i.unit_price })),
      order.total,
      payment.paymentUrl,
      invoice?.invoice_number
    );

    await supabase.from('messages').insert([
      {
        vendor_id: vendorId,
        sender: 'customer',
        channel,
        content: message.text || '',
        customer_identifier: message.senderId,
      },
      {
        vendor_id: vendorId,
        sender: 'ai',
        channel,
        content: confirmationText,
        customer_identifier: message.senderId,
      },
    ]);

    const reply = adapter.formatReply({ text: confirmationText, paymentUrl: payment.paymentUrl });

    const chatUrl = `${process.env.NEXT_PUBLIC_APP_URL}/chat/session/${vendorId}/${encodeURIComponent(
      message.senderId
    )}`;

    const sessionUrl = sessionToken
      ? `${process.env.NEXT_PUBLIC_APP_URL}/session/${sessionToken}`
      : null;

    if (message.senderId && message.senderId.includes('@')) {
      const { data: vendor } = await supabase
        .from('vendors')
        .select('business_name')
        .eq('id', vendorId)
        .single();

      const emailBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial; color:#111;">
          <h2 style="color:#0f766e;">Order confirmation from ${vendor?.business_name || 'Vendor'}</h2>
          <p style="white-space:pre-wrap;">${confirmationText}</p>
          ${sessionUrl ? `<p>Track your order: <a href="${sessionUrl}">${sessionUrl}</a></p>` : ''}
        </div>
      `;

      await sendInvoiceEmail(
        message.senderId,
        `Order confirmation - ${vendor?.business_name || 'BizPilot Store'}`,
        emailBody
      ).catch((err) => {
        console.warn('[messages/inbound] failed to send order confirmation email', err);
      });
    }

    return NextResponse.json({
      ...reply,
      chatUrl,
      sessionUrl,
      order: {
        items: items.map((i) => ({ name: i.product_name, qty: i.quantity, price: i.unit_price })),
        total: order.total,
        paymentUrl: payment.paymentUrl,
        invoiceNumber: invoice?.invoice_number || null,
      },
    });
  } catch (error) {
    console.error('[messages/inbound]', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
