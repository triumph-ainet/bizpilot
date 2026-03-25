import { createServerSupabase } from '@/lib/supabase';
import { DashboardStats, Order } from '@/lib/types';

export async function fetchDashboardData(vendorId: string) {
  const supabase = createServerSupabase();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [ordersRes, productsRes, prevOrdersRes] = await Promise.all([
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('vendor_id', vendorId)
      .gte('created_at', today)
      .order('created_at', { ascending: false }),
    supabase.from('products').select('*').eq('vendor_id', vendorId),
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('vendor_id', vendorId)
      .gte('created_at', yesterday)
      .lt('created_at', today),
  ]);

  const orders = ordersRes.data || [];
  const products = productsRes.data || [];
  const prevOrders = prevOrdersRes.data || [];

  const paidOrders = orders.filter((o: any) => o.status === 'paid');
  const todayRevenue = paidOrders.reduce((s: number, o: any) => s + (o.total || 0), 0);

  const prevPaid = prevOrders.filter((o: any) => o.status === 'paid');
  const prevRevenue = prevPaid.reduce((s: number, o: any) => s + (o.total || 0), 0);

  const revenueChange = prevRevenue === 0 ? (todayRevenue === 0 ? 0 : 100) : Math.round(((todayRevenue - prevRevenue) / prevRevenue) * 100);

  return {
    stats: {
      todayRevenue,
      todayOrders: orders.length,
      pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
      lowStockCount: products.filter((p: any) => p.quantity <= p.low_stock_threshold).length,
      revenueChange,
    } as DashboardStats,
    recentOrders: orders.slice(0, 5) as Order[],
    lowStockProducts: products.filter((p: any) => p.quantity <= p.low_stock_threshold),
  };
}

export const EMPTY_DASHBOARD = {
  stats: {
    todayRevenue: 0,
    todayOrders: 0,
    pendingOrders: 0,
    lowStockCount: 0,
    revenueChange: 0,
  } as DashboardStats,
  recentOrders: [] as Order[],
  lowStockProducts: [] as Array<{ id: string; name: string; quantity: number; low_stock_threshold: number }>,
};
