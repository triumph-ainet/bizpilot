import { NextRequest, NextResponse } from 'next/server';
import { getVendorSessionFromRequest } from '@/lib/auth';
import { getVendorOrders } from '@/lib/services/order.service';

export async function GET(req: NextRequest) {
  const session = await getVendorSessionFromRequest(req);
  if (!session?.vendorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get('status') || undefined;
  const orders = await getVendorOrders(session.vendorId, status);
  return NextResponse.json(orders);
}
