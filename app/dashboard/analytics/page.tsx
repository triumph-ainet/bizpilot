import { getVendorSessionFromCookies } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import MostBoughtProduct from './_components/MostBoughtProduct';
import IncomeOverview from './_components/IncomeOverview';
import TopCustomer from './_components/TopCustomer';
import Financials from './_components/Financials';
import AIInsights from './_components/AIInsights';
import { generateProductSuggestions } from '@/lib/services/ai.service';
import { Product } from '@/lib/types';

export default async function AnalyticsPage() {
  const session = await getVendorSessionFromCookies();
  if (!session?.vendorId) {
    return <div className="p-6">Please sign in to view analytics.</div>;
  }

  const supabase = createServerSupabase();
  const vendorId = session.vendorId;

  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: ordersData }, { data: productsData }] = await Promise.all([
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('vendor_id', vendorId)
      .gte('created_at', startDate),
    supabase.from('products').select('*').eq('vendor_id', vendorId),
  ]);

  const orders = (ordersData || []) as any[];
  const products = (productsData || []) as Product[];

  // Most bought product
  const counts: Record<string, { name: string; qty: number }> = {};
  for (const o of orders) {
    const items = o.order_items || [];
    for (const it of items) {
      const id = it.product_id || it.product_name;
      counts[id] = counts[id] || { name: it.product_name || 'Unknown', qty: 0 };
      counts[id].qty += Number(it.quantity || 0);
    }
  }

  const most = Object.values(counts).sort((a, b) => b.qty - a.qty)[0] || { name: '—', qty: 0 };

  // Income for last 30 days
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const income = orders
    .filter((o) => o.status === 'paid' && o.created_at >= since30)
    .reduce((s, o) => s + Number(o.total || 0), 0);

  // Top customer
  const byCustomer: Record<string, number> = {};
  for (const o of orders.filter((o) => o.status === 'paid')) {
    const id = o.customer_identifier || 'Unknown';
    byCustomer[id] = (byCustomer[id] || 0) + Number(o.total || 0);
  }
  const topCustomerEntry = Object.entries(byCustomer).sort((a, b) => b[1] - a[1])[0] || [ '—', 0 ];

  // Inventory value & cash
  const inventoryValue = products.reduce((s, p) => s + Number(p.price || 0) * Number(p.quantity || 0), 0);
  const cash = orders.filter((o) => o.status === 'paid').reduce((s, o) => s + Number(o.total || 0), 0);

  // AI insights (best-effort)
  let aiInsights: { title: string; detail: string }[] = [];
  try {
    const catalog = products.map((p) => ({ id: p.id, name: p.name, price: Number(p.price) })) as Product[];
    const raw = await generateProductSuggestions(
      `Top product: ${most.name}. Low inventory items: ${products
        .filter((p) => p.quantity <= p.low_stock_threshold)
        .map((p) => p.name)
        .join(', ')}`,
      catalog,
      5
    );

    aiInsights = (raw || []).map((r: any, i: number) => ({ title: r.name || `Suggestion ${i + 1}`, detail: r.short_reason || '' }));
  } catch (e) {
    // ignore AI failures
    aiInsights = [];
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <MostBoughtProduct name={most.name} quantity={most.qty} />
        <IncomeOverview total={income} periodLabel="Last 30 days" />
        <TopCustomer name={topCustomerEntry[0]} totalSpent={Number(topCustomerEntry[1] || 0)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Financials inventoryValue={inventoryValue} cash={cash} />
        <AIInsights insights={aiInsights} />
      </div>
    </div>
  );
}
