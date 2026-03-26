import { NextRequest, NextResponse } from 'next/server';
import { getVendorSessionFromRequest } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getVendorSessionFromRequest(_req);
  if (!session?.vendorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const supabase = createServerSupabase();
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('vendor_id', session.vendorId)
    .single();

  if (error || !product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getVendorSessionFromRequest(req);
  if (!session?.vendorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id } = await context.params;
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('products')
    .update({
      name: body.name,
      price: body.price !== undefined ? Number(body.price) : undefined,
      quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
      image_url: body.image_url !== undefined ? body.image_url : undefined,
      low_stock_threshold:
        body.low_stock_threshold !== undefined ? Number(body.low_stock_threshold) : undefined,
    })
    .eq('id', id)
    .eq('vendor_id', session.vendorId)
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: 'Failed to update' }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getVendorSessionFromRequest(_req);
  if (!session?.vendorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('vendor_id', session.vendorId);
  if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 400 });
  return NextResponse.json({ success: true });
}
