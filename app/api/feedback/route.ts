import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { buildFeedbackAlertHtml, sendInvoiceEmail } from '@/lib/services/email.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vendor_id, order_id, customer_identifier, rating, comment } = body;
    if (!vendor_id) return NextResponse.json({ error: 'vendor_id required' }, { status: 400 });

    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('feedbacks')
      .insert({
        vendor_id,
        order_id: order_id || null,
        customer_identifier: customer_identifier || null,
        rating: rating || null,
        comment: comment || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: vendor } = await supabase
      .from('vendors')
      .select('business_name, email')
      .eq('id', vendor_id)
      .single();

    if (vendor?.email) {
      const html = buildFeedbackAlertHtml({
        vendorName: vendor.business_name || 'Vendor',
        rating: rating || null,
        comment: comment || null,
        customerIdentifier: customer_identifier || null,
      });
      await sendInvoiceEmail(vendor.email, 'New customer feedback', html).catch((err) => {
        console.warn('[feedback POST] email send failed', err);
      });
    }

    return NextResponse.json({ success: true, feedback: data });
  } catch (e) {
    console.error('[feedback POST]', e);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
