import { createServerSupabase } from '@/lib/supabase';
import { getVendorSessionFromCookies } from '@/lib/auth';
import Link from 'next/link';
import { Package, Hourglass, TriangleAlert, CircleAlert, Hand } from 'lucide-react';
import { BottomNav, Badge, Card } from '@/components/ui';
import { DashboardStats, Order } from '@/lib/types';

async function getDashboardData(vendorId: string) {
  const supabase = createServerSupabase();
  const today = new Date().toISOString().split('T')[0];

  const [ordersRes, productsRes] = await Promise.all([
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('vendor_id', vendorId)
      .gte('created_at', today)
      .order('created_at', { ascending: false }),
    supabase.from('products').select('*').eq('vendor_id', vendorId),
  ]);

  const orders = ordersRes.data || [];
  const products = productsRes.data || [];
  const paidOrders = orders.filter((o) => o.status === 'paid');
  const todayRevenue = paidOrders.reduce((s, o) => s + o.total, 0);
  const lowStockCount = products.filter((p) => p.quantity <= p.low_stock_threshold).length;
  const lowStockProducts = products.filter((p) => p.quantity <= p.low_stock_threshold);

  return {
    stats: {
      todayRevenue,
      todayOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
      lowStockCount,
      revenueChange: 23,
    } as DashboardStats,
    recentOrders: orders.slice(0, 5) as Order[],
    lowStockProducts,
  };
}

const EMPTY_DASHBOARD = {
  stats: {
    todayRevenue: 0,
    todayOrders: 0,
    pendingOrders: 0,
    lowStockCount: 0,
    revenueChange: 0,
  },
  recentOrders: [] as Order[],
  lowStockProducts: [] as Array<{ id: string; name: string; quantity: number; low_stock_threshold: number }>,
};

const AVATAR_COLORS: Record<string, string> = {
  paid: 'bg-orange-100 text-orange-600',
  pending: 'bg-green-100 text-green-700',
  credit: 'bg-indigo-100 text-indigo-600',
};

export default async function DashboardPage() {
  const session = await getVendorSessionFromCookies();
  let data = EMPTY_DASHBOARD;
  try {
    if (session?.vendorId) {
      data = await getDashboardData(session.vendorId);
    }
  } catch {
    data = EMPTY_DASHBOARD;
  }

  const { stats, recentOrders, lowStockProducts } = data;
  const initials = (id: string) => id.replace('+234', '').slice(-4, -2).toUpperCase() || 'CU';

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <div className="bg-green px-6 pt-14 pb-20 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-cream rounded-t-[50%]" />
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="text-white/60 text-[13px]">Good morning,</p>
            <h1 className="font-fraunces text-[22px] font-bold text-white inline-flex items-center gap-1.5">
              Aisha&apos;s Store <Hand className="w-5 h-5 text-amber" />
            </h1>
          </div>
          <div className="w-10 h-10 bg-amber rounded-full flex items-center justify-center font-fraunces font-black text-lg text-green">
            A
          </div>
        </div>
        <p className="text-white/50 text-xs mb-1.5">Today&apos;s Revenue</p>
        <div className="font-fraunces text-[40px] font-black text-white tracking-tight leading-none">
          <span className="text-xl font-semibold opacity-70">₦</span>
          {stats.todayRevenue.toLocaleString()}
        </div>
        <div className="inline-flex items-center gap-1.5 bg-green-bright/20 text-green-bright text-xs font-semibold px-3 py-1 rounded-full mt-3">
          ↑ {stats.revenueChange}% from yesterday
        </div>
      </div>

      <div className="px-6 -mt-2 relative z-10 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            {
              icon: <Package className="w-5 h-5" />,
              val: stats.todayOrders,
              label: 'Orders today',
            },
            { icon: <Hourglass className="w-5 h-5" />, val: stats.pendingOrders, label: 'Pending' },
            {
              icon: <TriangleAlert className="w-5 h-5" />,
              val: stats.lowStockCount,
              label: 'Low stock',
              red: true,
            },
          ].map((s) => (
            <Card key={s.label} className="p-3.5">
              <div className="mb-2 text-ink-mid">{s.icon}</div>
              <div
                className={`font-fraunces text-[22px] font-black ${s.red ? 'text-red-500' : 'text-ink'}`}
              >
                {s.val}
              </div>
              <div className="text-[11px] text-ink-light mt-0.5">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Low stock alerts */}
        {lowStockProducts.map((p) => (
          <div
            key={p.id}
            className="bg-gradient-to-r from-orange-50 to-amber-50 border-[1.5px] border-amber/40 rounded-2xl px-4 py-3.5 flex items-center gap-3"
          >
            <CircleAlert className="w-7 h-7 text-red-500" />
            <div className="flex-1">
              <p className="font-bold text-sm text-orange-800">{p.name} is running low</p>
              <p className="text-xs text-orange-600 mt-0.5">
                Only {p.quantity} left · Restock soon
              </p>
            </div>
            <button className="text-xs font-bold text-amber whitespace-nowrap">Restock</button>
          </div>
        ))}

        {/* Recent orders */}
        <div>
          <div className="flex justify-between items-center mb-3.5">
            <h2 className="font-bold text-[15px] text-ink">Recent Orders</h2>
            <Link href="/vendor/orders" className="text-xs text-green-bright font-semibold">
              See all →
            </Link>
          </div>
          <div className="space-y-2.5">
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/vendor/orders/${order.id}`}>
                <Card className="p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${AVATAR_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {initials(order.customer_identifier)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-ink">{order.customer_identifier}</p>
                    <p className="text-xs text-ink-light mt-0.5 truncate">
                      {order.items?.map((i) => `${i.quantity}× ${i.product_name}`).join(', ')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-fraunces font-bold text-[15px] text-ink">
                      ₦{order.total.toLocaleString()}
                    </p>
                    <div className="flex justify-end mt-1">
                      <Badge variant={order.status} />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="/vendor/dashboard" />
    </div>
  );
}
