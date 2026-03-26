import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const supabase = createServerSupabase();

  const { data: vendor, error } = await supabase
    .from('vendors')
    .select('id, is_active')
    .eq('store_slug', slug)
    .single();

  if (error || !vendor || !vendor.is_active) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, name, price, quantity, image_url')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false });

  if (pErr) {
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }

  return NextResponse.json(products || []);
}
