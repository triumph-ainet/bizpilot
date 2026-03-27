import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { verifyPayment } from '@/lib/services/payment.service';
import { markOrderPaid } from '@/lib/services/order.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference, order_id } = body;
    const supabase = createServerSupabase();

    let ref = reference;
    if (!ref && order_id) {
      const { data: p } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', order_id)
        .single()
      ref = p?.interswitch_reference || null;
    }

    if (!ref)
      return NextResponse.json({ error: 'reference or order_id required' }, { status: 400 });

    const result = await verifyPayment(ref).catch(() => null);
    if (!result) return NextResponse.json({ error: 'failed to verify' }, { status: 500 });

    // If transaction successful, trigger order/payment processing
    const respCode =
      result.ResponseCode || result.resp || (result.response && result.response.resp) || null;
    if (respCode === '00') {
      try {
        const order = await markOrderPaid(ref);
        return NextResponse.json({ success: true, status: 'paid', order });
      } catch (e) {
        return NextResponse.json(
          { success: false, message: 'failed to mark paid', error: String(e) },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, status: 'not_paid', raw: result });
  } catch (e) {
    console.error('[payment/status]', e);
    return NextResponse.json({ error: 'Failed to check payment' }, { status: 500 });
  }
}
