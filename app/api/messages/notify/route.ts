import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { sendNotificationEmail, buildNotificationHtml } from '@/lib/services/email.service';

export async function POST(req: NextRequest) {
  try {
    const { vendorId, customer, message } = await req.json();
    if (!vendorId || !customer || !message) {
      return NextResponse.json({ error: 'vendorId, customer, message required' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data: vendor } = await supabase
      .from('vendors')
      .select('id, business_name, email')
      .eq('id', vendorId)
      .single();

    const { data } = await supabase
      .from('message_subscriptions')
      .select('email')
      .eq('vendor_id', vendorId)
      .eq('customer_identifier', customer);

    const emails = (data || [])
      .map((r: { email: string | null }) => r.email)
      .filter((value): value is string => Boolean(value));

    const html = buildNotificationHtml({
      vendorName: vendor?.business_name || 'Vendor',
      customer,
      message,
      chatUrl: `${process.env.NEXT_PUBLIC_APP_URL}/chat/session/${vendorId}/${encodeURIComponent(customer)}`,
    });

    await Promise.all(
      emails.map((to: string) =>
        sendNotificationEmail(to, vendor?.business_name || 'Vendor', customer, message, html).catch(
          (e) => console.warn('email error', e)
        )
      )
    );

    return NextResponse.json({ success: true, sent: emails.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
