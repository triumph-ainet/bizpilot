import { NextRequest, NextResponse } from 'next/server';
import { addProduct, getVendorProducts } from '@/lib/services/inventory.service';
import { getVendorSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getVendorSessionFromRequest(req);
  if (!session?.vendorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const products = await getVendorProducts(session.vendorId);
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getVendorSessionFromRequest(req);
    if (!session?.vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const product = await addProduct(session.vendorId, {
      name: body.name,
      price: Number(body.price),
      quantity: Number(body.quantity),
      image_url: body.image_url || null,
      low_stock_threshold: Number(body.low_stock_threshold) || 5,
    });

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
