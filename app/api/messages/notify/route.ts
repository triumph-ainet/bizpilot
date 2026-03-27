import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { sendNotificationEmail } from '@/lib/services/email.service';

export async function POST(req: NextRequest) {
  try {
    const { vendorId, customer, message } = await req.json();
    if (!vendorId || !customer || !message) {
      return NextResponse.json({ error: 'vendorId, customer, message required' }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data } = await supabase
      .from('message_subscriptions')
      .select('email')
      .eq('vendor_id', vendorId)
      .eq('customer_identifier', customer);

    const emails = (data || []).map((r: any) => r.email).filter(Boolean);

    await Promise.all(
      emails.map((to: string) =>
        sendNotificationEmail(
          to,
          `New message from ${vendorId}`,
          `<p>You have a new message:</p><p>${message}</p>`
        ).catch((e) => console.warn('email error', e))
      )
    );

    return NextResponse.json({ success: true, sent: emails.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
