import { createServerSupabase } from '../supabase';
import { Order, OrderItem, ParsedOrder, InboundMessage, Product } from '../types';

export async function createOrder(
  parsed: ParsedOrder,
  message: InboundMessage,
  catalog: Product[]
): Promise<{ order: Order; items: (OrderItem & { price: number })[] }> {
  const supabase = createServerSupabase();

  const matchedItems = parsed.items
    .map((parsedItem) => {
      const product = catalog.find(
        (p) =>
          p.name.toLowerCase().includes(parsedItem.name.toLowerCase()) ||
          parsedItem.name.toLowerCase().includes(p.name.toLowerCase())
      );
      return product ? { product, quantity: parsedItem.quantity } : null;
    })
    .filter(Boolean) as { product: Product; quantity: number }[];

  const total = matchedItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      vendor_id: message.vendorId,
      customer_identifier: message.senderId,
      channel: message.channel,
      status: 'pending',
      total,
    })
    .select()
    .single();

  if (orderError) throw new Error(orderError.message);

  const itemsToInsert = matchedItems.map((i) => ({
    order_id: order.id,
    product_id: i.product.id,
    product_name: i.product.name,
    quantity: i.quantity,
    unit_price: i.product.price,
  }));

  const { data: items } = await supabase.from('order_items').insert(itemsToInsert).select();

  // If any requested quantity exceeds available inventory, create stock_alerts
  for (const mi of matchedItems) {
    try {
      const { data: prod } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', mi.product.id)
        .single();

      const available = prod?.quantity ?? 0;
      if (available <= 0 || mi.quantity > available) {
        await supabase.from('stock_alerts').upsert(
          {
            vendor_id: mi.product.vendor_id,
            product_id: mi.product.id,
            product_name: mi.product.name,
            quantity: available,
            threshold: mi.product.low_stock_threshold,
            resolved: false,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'product_id' }
        );
      }
    } catch (e) {
      // ignore inventory alert failures
      console.warn('Failed to create stock alert', e);
    }
  }
  return {
    order,
    items: (items || []).map((item) => ({ ...item, price: item.unit_price })),
  };
}

export async function markOrderPaid(
  paymentReference: string
): Promise<Order & { items: OrderItem[] }> {
  const supabase = createServerSupabase();
  // Find payment and ensure we only process once
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('interswitch_reference', paymentReference)
    .single();

  if (!payment) throw new Error('Payment not found');

  // If payment already confirmed, return existing order + items (idempotent)
  if (payment.status === 'confirmed') {
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('id', payment.order_id)
      .single();

    const { data: existingItems } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', payment.order_id);

    return { ...(existingOrder as Order), items: existingItems || [] };
  }

  // Mark payment as confirmed (only if not already) and update order status
  const now = new Date().toISOString();
  const { error: payErr } = await supabase
    .from('payments')
    .update({ status: 'confirmed', paid_at: now })
    .eq('interswitch_reference', paymentReference)
    .neq('status', 'confirmed');

  if (payErr) throw new Error(payErr.message);

  const { data: order } = await supabase
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', payment.order_id)
    .neq('status', 'paid')
    .select()
    .single();

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', payment.order_id);

  return { ...(order as Order), items: items || [] };
}

export async function getVendorOrders(vendorId: string, status?: string): Promise<Order[]> {
  const supabase = createServerSupabase();
  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data } = await query;
  return data || [];
}
