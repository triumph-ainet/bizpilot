import { getVendorSessionFromCookies } from '@/lib/auth';
import DashboardHeader from './_components/DashboardHeader';
import StatsCards from './_components/StatsCards';
import LowStockAlerts from './_components/LowStockAlerts';
import RecentOrders from './_components/RecentOrders';
import FeedbackList from './_components/FeedbackList';
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

  const { vendor, stats, recentOrders, lowStockProducts } = data;
  const feedbacks = (data as any).feedbacks || [];
  const initials = vendor
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-cream pb-24">
      <DashboardHeader
        vendorName={vendor}
        initials={initials}
        todayRevenue={stats.todayRevenue}
        revenueChange={stats.revenueChange}
      />

      <div className="px-6 -mt-2 relative z-10 space-y-6">
        <StatsCards stats={stats} />
        <div className="grid grid-cols-1 gap-6">
          <LowStockAlerts
            products={lowStockProducts as Array<{ id: string; name: string; quantity: number }>}
          />

          <RecentOrders orders={recentOrders as any[]} initialsFor={() => initials} />

          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-medium mb-3">Recent Feedback</h2>
            <FeedbackList feedback={feedbacks} />
          </div>
        </div>
      </div>

      <BottomNav active="/vendor/dashboard" />
    </div>
  );
}
