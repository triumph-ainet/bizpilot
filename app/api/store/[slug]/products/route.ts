import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
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

  try {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '12');
    const start = Math.max(0, (page - 1) * limit);
    const end = start + limit - 1;

    // get total count
    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id);

    const { data: products, error: pErr } = await supabase
      .from('products')
      .select('id, name, price, quantity, image_url')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })
      .range(start, end);

    if (pErr) {
      return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
    }

    return NextResponse.json({ products: products || [], count: count || 0 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}
