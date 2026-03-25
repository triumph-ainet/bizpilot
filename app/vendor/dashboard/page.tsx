import { getVendorSessionFromCookies } from '@/lib/auth';
import DashboardHeader from './_components/DashboardHeader';
import StatsCards from './_components/StatsCards';
import LowStockAlerts from './_components/LowStockAlerts';
import RecentOrders from './_components/RecentOrders';
import { BottomNav } from '@/components/ui';
import { fetchDashboardData, EMPTY_DASHBOARD } from '@/lib/services/dashboard.service';

export default async function DashboardPage() {
  const session = await getVendorSessionFromCookies();
  let data = EMPTY_DASHBOARD;
  try {
    if (session?.vendorId) {
      data = await fetchDashboardData(session.vendorId);
    }
  } catch (err) {
    data = EMPTY_DASHBOARD;
  }

  const { stats, recentOrders, lowStockProducts } = data;
  const initials = (id: string) => (id ? id.replace('+234', '').slice(-4, -2).toUpperCase() : 'CU');
  const vendorName = 'Your store';

  return (
    <div className="min-h-screen bg-cream pb-24">
      <DashboardHeader
        vendorName={vendorName}
        initials={initials(session?.phone || '')}
        todayRevenue={stats.todayRevenue}
        revenueChange={stats.revenueChange}
      />

      <div className="px-6 -mt-2 relative z-10 space-y-6">
        <StatsCards stats={stats} />

        <LowStockAlerts
          products={lowStockProducts as Array<{ id: string; name: string; quantity: number }>}
        />

        <RecentOrders orders={recentOrders as any[]} initialsFor={initials} />
      </div>

      <BottomNav active="/vendor/dashboard" />
    </div>
  );
}
