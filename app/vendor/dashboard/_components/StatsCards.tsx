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
    <div className="grid grid-cols-3 gap-2.5">
      {items.map((s) => (
        <Card key={s.label} className="p-3.5">
          <div className="mb-2 text-ink-mid">{s.icon}</div>
          <div className={`font-fraunces text-[22px] font-black ${s.red ? 'text-red-500' : 'text-ink'}`}>
            {s.val}
          </div>
          <div className="text-[11px] text-ink-light mt-0.5">{s.label}</div>
        </Card>
      ))}
    </div>
  );
}
