'use client';

import { useEffect, useMemo, useState } from 'react';
import { BottomNav, Badge } from '@/components/ui';
import OrderChat from './_components/OrderChat';
import { cn } from '@/lib/utils';
import { Order } from '@/lib/types';

const STATUS_FILTERS = ['all', 'paid', 'pending', 'credit', 'cancelled'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/orders', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load orders');
        setOrders(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') return orders;
    return orders.filter((order) => order.status === activeFilter);
  }, [orders, activeFilter]);

  const counts = useMemo(() => {
    const countBy = (status: string) => orders.filter((o) => o.status === status).length;
    return {
      all: orders.length,
      paid: countBy('paid'),
      pending: countBy('pending'),
      credit: countBy('credit'),
      cancelled: countBy('cancelled'),
    };
  }, [orders]);

  const filterLabel = (filter: StatusFilter) => {
    if (filter === 'all') return `All (${counts.all})`;
    return `${filter[0].toUpperCase()}${filter.slice(1)} (${counts[filter]})`;
  };

  const formatTime = (createdAt: string) => {
    return new Date(createdAt).toLocaleString('en-NG', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <div className="bg-green px-6 pt-14 pb-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-fraunces text-2xl font-extrabold text-white">Orders</h1>
          <span className="text-white/60 text-[13px]">Total · {orders.length}</span>
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
              {filterLabel(f)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-5 space-y-3">
        {!loading &&
          !error &&
          filteredOrders.map((order) => (
            <a key={order.id} href={`/vendor/orders/${order.id}`}>
              <div className="bg-white rounded-2xl p-4 shadow-card active:scale-[0.98] transition-transform">
                {/* Top row */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[11px] text-ink-light">
                      #{order.id.slice(0, 8).toUpperCase()} · {formatTime(order.created_at)}
                    </p>
                    <p className="font-bold text-[15px] text-ink mt-0.5">
                      {order.customer_identifier}
                    </p>
                  </div>
                  <div className="text-right flex items-start gap-2">
                    <p className="font-fraunces font-bold text-[18px] text-ink">
                      ₦{order.total.toLocaleString()}
                    </p>
                    <div className="flex justify-end mt-1">
                      <Badge variant={order.status} />
                    </div>
                    <div className="ml-2">
                      <OrderChat vendorId={order.vendor_id} customer={order.customer_identifier} />
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-cream rounded-xl px-3 py-2.5 mb-3 space-y-1">
                  {(order.items || []).slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between text-[13px] text-ink-mid">
                      <span>
                        {item.quantity}× {item.product_name}
                      </span>
                      <span>₦{Number(item.unit_price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  {(order.items || []).length > 3 && (
                    <div className="text-xs text-ink-light">
                      + {(order.items || []).length - 3} more item(s)
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-ink-light">
                    <div className="w-1.5 h-1.5 bg-[#25D366] rounded-full" />
                    via {order.channel === 'sim_chat' ? 'Storefront' : order.channel}
                  </div>
                  <span className={cn('text-xs font-bold', STATUS_FOOTER[order.status])}>
                    {STATUS_FOOTER_TEXT[order.status]}
                  </span>
                </div>
              </div>
            </a>
          ))}

        {loading && (
          <div className="bg-white rounded-2xl p-5 text-sm text-ink-light text-center shadow-card">
            Loading orders...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-600 text-center">
            {error}
          </div>
        )}

        {!loading && !error && filteredOrders.length === 0 && (
          <div className="bg-white rounded-2xl p-5 text-sm text-ink-light text-center shadow-card">
            No orders found for this filter.
          </div>
        )}
      </div>

      <BottomNav active="/vendor/orders" />
    </div>
  );
}
