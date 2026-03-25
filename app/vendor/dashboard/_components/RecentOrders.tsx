import React from 'react';
import Link from 'next/link';
import { Card, Badge } from '@/components/ui';

type OrderStatus = 'paid' | 'pending' | 'credit' | 'cancelled';

const AVATAR_COLORS: Record<OrderStatus, string> = {
  paid: 'bg-orange-100 text-orange-600',
  pending: 'bg-green-100 text-green-700',
  credit: 'bg-indigo-100 text-indigo-600',
  cancelled: 'bg-red-100 text-red-600',
};

type OrderItem = { quantity: number; product_name: string };
type Order = { id: string; customer_identifier: string; items?: OrderItem[]; total: number; status: OrderStatus };

type Props = { orders: Order[]; initialsFor: (id: string) => string };

export default function RecentOrders({ orders, initialsFor }: Props) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3.5">
        <h2 className="font-bold text-[15px] text-ink">Recent Orders</h2>
        <Link href="/vendor/orders" className="text-xs text-green-bright font-semibold">
          See all →
        </Link>
      </div>
      <div className="space-y-2.5">
        {orders.map((order) => (
          <Link key={order.id} href={`/vendor/orders/${order.id}`}>
            <Card className="p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${AVATAR_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}
              >
                {initialsFor(order.customer_identifier)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-ink">{order.customer_identifier}</p>
                <p className="text-xs text-ink-light mt-0.5 truncate">{order.items?.map((i) => `${i.quantity}× ${i.product_name}`).join(', ')}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-fraunces font-bold text-[15px] text-ink">₦{order.total.toLocaleString()}</p>
                <div className="flex justify-end mt-1">
                  <Badge variant={order.status} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
