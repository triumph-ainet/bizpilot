import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { sendNotificationEmail } from '@/lib/services/email.service';

export async function POST(req: NextRequest) {
  try {
    const { vendorId, customer, email } = await req.json();
    if (!vendorId || !customer || !email) {
      return NextResponse.json({ error: 'vendorId, customer and email required' }, { status: 400 });
    }

    const supabase = createServerSupabase();
    await supabase.from('message_subscriptions').insert({ vendor_id: vendorId, customer_identifier: customer, email });

    // Send confirmation email
    const subject = 'Chat notifications enabled';
    const html = `<p>You will receive email notifications for new messages for chat with ${customer}.</p>`;
    try {
      await sendNotificationEmail(email, subject, html, vendorId, customer);
    } catch (e) {
      // swallow but continue
      console.warn('Notification send failed', e);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
