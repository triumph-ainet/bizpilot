import { getVendorSessionFromCookies } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import MostBoughtProduct from './_components/MostBoughtProduct';
import IncomeOverview from './_components/IncomeOverview';
import TopCustomer from './_components/TopCustomer';
import Financials from './_components/Financials';
import AIInsights from './_components/AIInsights';
import IncomeChart from './_components/IncomeChart';
import RechartsIncome from './_components/RechartsIncome';
import RechartsTopProducts from './_components/RechartsTopProducts';
import Link from 'next/link';
import { generateProductSuggestions } from '@/lib/services/ai.service';
import { Product } from '@/lib/types';

const aiCache = new Map<string, { ts: number; value: any }>();

function toCsv(rows: string[][]) {
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
}

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
  const days = 30;
  const since30 = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
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
  let aiError: string | null = null;
  try {
    // simple in-memory cache per server instance (short TTL)
    const cacheKey = `suggestions:${session.vendorId}:${most.name}`;
    const cached = aiCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < 1000 * 60 * 5) {
      aiInsights = cached.value;
    } else {
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
      aiCache.set(cacheKey, { ts: Date.now(), value: aiInsights });
    }
  } catch (e: any) {
    aiError = (e && e.message) || 'AI unavailable';
    aiInsights = [];
  }

  // Build daily income series for last `days`
  const dayBuckets: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split('T')[0];
    dayBuckets[key] = 0;
  }
  for (const o of orders.filter((o) => o.status === 'paid')) {
    const key = o.created_at.split('T')[0];
    if (key in dayBuckets) dayBuckets[key] += Number(o.total || 0);
  }
  const series = Object.keys(dayBuckets).map((k) => ({ date: k, total: dayBuckets[k] }));
  const topProducts = Object.values(counts)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6)
    .map((p) => ({ name: p.name, qty: p.qty }));

  // CSV rows for export
  const csvRows = [
    ['date', 'order_id', 'customer', 'status', 'total'],
    ...orders.map((o) => [o.created_at, o.id, o.customer_identifier, o.status, o.total]),
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Analytics</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const csv = toCsv(csvRows);
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `analytics_${new Date().toISOString().slice(0,10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-2 bg-green text-white rounded-md text-sm"
          >
            Export CSV
          </button>
          <Link href="/dashboard/analytics/report" className="px-3 py-2 bg-white border rounded-md text-sm">
            Printable Report
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <MostBoughtProduct name={most.name} quantity={most.qty} />
        <IncomeOverview total={income} periodLabel="Last 30 days" />
        <TopCustomer name={topCustomerEntry[0]} totalSpent={Number(topCustomerEntry[1] || 0)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <IncomeChart series={series} />
        <Financials inventoryValue={inventoryValue} cash={cash} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <RechartsIncome data={series} />
        <RechartsTopProducts items={topProducts} />
      </div>

      <div className="mt-4">
        <AIInsights insights={aiInsights} error={aiError} />
      </div>
    </div>
  );
}
