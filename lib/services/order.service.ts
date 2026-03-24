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

  return {
    order,
    items: (items || []).map((item) => ({ ...item, price: item.unit_price })),
  };
}

export async function markOrderPaid(
  paymentReference: string
): Promise<Order & { items: OrderItem[] }> {
  const supabase = createServerSupabase();

  const { data: payment } = await supabase
    .from('payments')
    .select('order_id')
    .eq('interswitch_reference', paymentReference)
    .single();

  if (!payment) throw new Error('Payment not found');

  const { data: order } = await supabase
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', payment.order_id)
    .select()
    .single();

  await supabase
    .from('payments')
    .update({ status: 'confirmed', paid_at: new Date().toISOString() })
    .eq('interswitch_reference', paymentReference);

  const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id);

  return { ...order, items: items || [] };
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
