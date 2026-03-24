import { createServerSupabase } from '../supabase';
import { Product, OrderItem } from '../types';

export async function decrementBatch(items: OrderItem[]): Promise<void> {
  const supabase = createServerSupabase();

  for (const item of items) {
    const { data: product } = await supabase
      .from('products')
      .select('quantity')
      .eq('id', item.product_id)
      .single();

    if (!product) continue;

    const newQty = Math.max(0, product.quantity - item.quantity);
    await supabase.from('products').update({ quantity: newQty }).eq('id', item.product_id);
  }
}

export async function checkLowStock(vendorId: string): Promise<Product[]> {
  const supabase = createServerSupabase();

  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendorId)
    .filter('quantity', 'lte', 'low_stock_threshold');

  return data || [];
}

export async function addProduct(
  vendorId: string,
  product: Pick<Product, 'name' | 'price' | 'quantity' | 'image_url' | 'low_stock_threshold'>
): Promise<Product> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('products')
    .insert({ ...product, vendor_id: vendorId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getVendorProducts(vendorId: string): Promise<Product[]> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  return data || [];
}
