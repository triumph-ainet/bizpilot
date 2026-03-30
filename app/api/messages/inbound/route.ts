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
    const supabase = createServerSupabase();
    const senderId = String(message.senderId || '').trim();
    const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');

    // Reuse latest session for this customer/vendor pair; otherwise create one now.
    let sessionToken: string | null = null;
    if (senderId) {
      const { data: existingSession } = await supabase
        .from('sessions')
        .select('id, token')
        .eq('vendor_id', vendorId)
        .eq('customer_identifier', senderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingSession?.token) {
        sessionToken = existingSession.token;
        await supabase
          .from('sessions')
          .update({ last_accessed: new Date().toISOString() })
          .eq('id', existingSession.id);
      } else {
        const { data: createdSession, error: sessionInsertError } = await supabase
          .from('sessions')
          .insert({
            vendor_id: vendorId,
            customer_identifier: senderId,
            customer_email: senderId.includes('@') ? senderId : null,
            last_accessed: new Date().toISOString(),
          })
          .select('id, token')
          .single();

        if (sessionInsertError) {
          console.warn('[messages/inbound] failed to create session', {
            vendorId,
            senderId,
            error: sessionInsertError.message,
          });
        }
        sessionToken = createdSession?.token || null;
      }
    }

    const sessionUrl = sessionToken
      ? appBaseUrl
        ? `${appBaseUrl}/session/${sessionToken}`
        : `/session/${sessionToken}`
      : null;

    const catalog = await getVendorProducts(vendorId).catch(() => []);
    const parsed = await parseOrder(message.text || '', catalog);

    if (parsed.items.length === 0) {
      const noOrderText =
        channel === 'whatsapp' && sessionUrl
          ? "Sorry, I couldn't find those items in our catalog. Could you check the product names and try again?\n\nContinue this chat anytime: " +
            sessionUrl
          : "Sorry, I couldn't find those items in our catalog. Could you check the product names and try again?";

      return NextResponse.json({
        ...adapter.formatReply({
          text: noOrderText,
        }),
        sessionUrl: channel === 'whatsapp' ? sessionUrl : null,
      });
    }

    const { order, items } = await createOrder(parsed, normalizedMessage, catalog);
    const invoice = await createInvoiceForOrder(order.id, order.total, items).catch(() => null);

    const sender = senderId;
    const appName = (process.env.NEXT_PUBLIC_APP_NAME || 'bizpilot.local').trim();
    const paymentEmail = sender.includes('@')
      ? sender
      : `${sender.replace(/[^a-zA-Z0-9]/g, '') || 'customer'}@${appName}`;

    const payment = await initializePayment(
      order.id,
      order.total * 100, // convert to kobo
      paymentEmail
    ).catch(() => ({
      paymentUrl: appBaseUrl ? `${appBaseUrl}/pay/${order.id}` : `/pay/${order.id}`,
      reference: order.id,
    }));

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

    if (sessionToken) {
      const { error: sessionUpdateError } = await supabase
        .from('sessions')
        .update({ order_id: order.id, last_accessed: new Date().toISOString() })
        .eq('token', sessionToken);

      if (sessionUpdateError) {
        console.warn('[messages/inbound] failed to update session order', {
          orderId: order.id,
          sessionToken,
          error: sessionUpdateError.message,
        });
      }
    }

    const baseConfirmationText = await generateOrderConfirmation(
      items.map((i) => ({ name: i.product_name, quantity: i.quantity, price: i.unit_price })),
      order.total,
      payment.paymentUrl,
      invoice?.invoice_number
    );

    const confirmationText =
      channel === 'whatsapp' && sessionUrl
        ? `${baseConfirmationText}\n\nContinue this chat anytime: ${sessionUrl}`
        : baseConfirmationText;

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

    const chatPath = `/chat/session/${vendorId}/${encodeURIComponent(message.senderId)}`;
    const chatUrl = appBaseUrl ? `${appBaseUrl}${chatPath}` : chatPath;

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
        id: order.id,
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
