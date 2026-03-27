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

    const { data: vendor } = await supabase.from('vendors').select('id, store_name, contact_email').eq('id', vendorId).single();

    const { data } = await supabase
      .from('message_subscriptions')
      .select('email')
      .eq('vendor_id', vendorId)
      .eq('customer_identifier', customer);

    const emails = (data || []).map((r: any) => r.email).filter(Boolean);

    const html = buildNotificationHtml({ vendorName: vendor?.store_name || 'Vendor', customer, message, chatUrl: `${process.env.NEXT_PUBLIC_APP_URL}/chat/session/${vendorId}/${encodeURIComponent(customer)}` });

    await Promise.all(
      emails.map((to: string) =>
        sendNotificationEmail(to, vendor?.store_name || 'Vendor', customer, message, html).catch((e) => console.warn('email error', e))
      )
    );

    return NextResponse.json({ success: true, sent: emails.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
