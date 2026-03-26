import { NextResponse } from 'next/server';
import { createInvoiceForOrder } from '@/lib/services/invoices.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, amount, items } = body;
    if (!orderId)
      return NextResponse.json({ success: false, error: 'orderId required' }, { status: 400 });

    const invoice = await createInvoiceForOrder(orderId, amount, items);
    return NextResponse.json({ success: true, data: invoice });
  } catch (err: any) {
    console.error('Failed to create invoice', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
