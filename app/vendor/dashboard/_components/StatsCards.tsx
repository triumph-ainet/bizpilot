import React from 'react';
import { Package, Hourglass, TriangleAlert } from 'lucide-react';
import { Card } from '@/components/ui';
import { DashboardStats } from '@/lib/types';

type Props = { stats: DashboardStats };

export default function StatsCards({ stats }: Props) {
  const items = [
    { icon: <Package className="w-5 h-5" />, val: stats.todayOrders, label: 'Orders today' },
    { icon: <Hourglass className="w-5 h-5" />, val: stats.pendingOrders, label: 'Pending' },
    { icon: <TriangleAlert className="w-5 h-5" />, val: stats.lowStockCount, label: 'Low stock', red: true },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((s) => (
        <Card key={s.label} className="p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
          <div className={`mb-3 inline-flex p-2 rounded-lg ${s.red ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-ink-mid'}`}>{s.icon}</div>
          <div className={`font-fraunces text-3xl font-semibold ${s.red ? 'text-red-600' : 'text-ink'}`}>
            {s.val}
          </div>
          <div className="text-xs text-ink-light mt-2 font-medium">{s.label}</div>
        </Card>
      ))}
    </div>
  );
}
