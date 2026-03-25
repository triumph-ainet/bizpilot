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
    .select('id, business_name, store_slug, is_active')
    .eq('store_slug', slug)
    .single();

  if (error || !vendor || !vendor.is_active) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('vendor_id', vendor.id);

  return NextResponse.json({
    id: vendor.id,
    businessName: vendor.business_name,
    slug: vendor.store_slug,
    productCount: count || 0,
  });
}
