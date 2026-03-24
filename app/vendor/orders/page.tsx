'use client';

import { useState } from 'react';
import { BottomNav, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

const STATUS_FILTERS = ['All (18)', 'Paid (13)', 'Pending (3)', 'Credit (2)'];

const DEMO_ORDERS = [
  {
    id: '1',
    ref: '#ORD-0018',
    time: '2 mins ago',
    customer: 'Tunde Kareem',
    total: 900,
    status: 'paid' as const,
    channel: 'Chat',
    items: [
      { name: '2× Pepsi 60cl', price: '₦600' },
      { name: '1× Indomie Big', price: '₦250' },
      { name: '1× Cabin Biscuit', price: '₦150' },
    ],
  },
  {
    id: '2',
    ref: '#ORD-0017',
    time: '14 mins ago',
    customer: 'Fatima Okafor',
    total: 2650,
    status: 'pending' as const,
    channel: 'Chat',
    items: [
      { name: '5× Maltina 60cl', price: '₦2,000' },
      { name: '2× Cabin Biscuit', price: '₦300' },
    ],
  },
  {
    id: '3',
    ref: '#ORD-0016',
    time: '1 hr ago',
    customer: 'Emeka Madu',
    total: 1350,
    status: 'credit' as const,
    channel: 'Chat',
    items: [
      { name: '1× Indomie Big', price: '₦250' },
      { name: '3× Coke 50cl', price: '₦900' },
    ],
  },
  {
    id: '4',
    ref: '#ORD-0015',
    time: '2 hrs ago',
    customer: 'Ngozi Eze',
    total: 600,
    status: 'paid' as const,
    channel: 'Chat',
    items: [{ name: '2× Pepsi 60cl', price: '₦600' }],
  },
];

const STATUS_FOOTER: Record<string, string> = {
  paid: 'text-green-light',
  pending: 'text-amber',
  credit: 'text-blue-500',
  cancelled: 'text-red-400',
};

const STATUS_FOOTER_TEXT: Record<string, string> = {
  paid: 'Payment confirmed',
  pending: 'Awaiting payment',
  credit: 'Collect later',
  cancelled: 'Order cancelled',
};

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState('All (18)');

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <div className="bg-green px-6 pt-14 pb-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-fraunces text-2xl font-extrabold text-white">Orders</h1>
          <span className="text-white/60 text-[13px]">Today · 18</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                'flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all',
                activeFilter === f
                  ? 'bg-white text-green border-white'
                  : 'bg-white/10 text-white/70 border-white/15'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-5 space-y-3">
        {DEMO_ORDERS.map((order) => (
          <a key={order.id} href={`/vendor/orders/${order.id}`}>
            <div className="bg-white rounded-2xl p-4 shadow-card active:scale-[0.98] transition-transform">
              {/* Top row */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-[11px] text-ink-light">
                    {order.ref} · {order.time}
                  </p>
                  <p className="font-bold text-[15px] text-ink mt-0.5">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-fraunces font-bold text-[18px] text-ink">
                    ₦{order.total.toLocaleString()}
                  </p>
                  <div className="flex justify-end mt-1">
                    <Badge variant={order.status} />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-cream rounded-xl px-3 py-2.5 mb-3 space-y-1">
                {order.items.map((item) => (
                  <div key={item.name} className="flex justify-between text-[13px] text-ink-mid">
                    <span>{item.name}</span>
                    <span>{item.price}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-ink-light">
                  <div className="w-1.5 h-1.5 bg-[#25D366] rounded-full" />
                  via {order.channel}
                </div>
                <span className={cn('text-xs font-bold', STATUS_FOOTER[order.status])}>
                  {STATUS_FOOTER_TEXT[order.status]}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      <BottomNav active="/vendor/orders" />
    </div>
  );
}
