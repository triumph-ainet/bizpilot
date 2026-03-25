'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui';
import { Order, Payment } from '@/lib/types';

type OrderWithRelations = Order & {
  payments?: Payment[];
};

const STATUS_ACTIONS: Array<{ label: string; value: Order['status'] }> = [
  { label: 'Mark Paid', value: 'paid' },
  { label: 'Mark Credit', value: 'credit' },
  { label: 'Cancel Order', value: 'cancelled' },
  { label: 'Set Pending', value: 'pending' },
];

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/orders/${params.id}`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load order');
        setOrder(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) loadOrder();
  }, [params.id]);

  async function updateStatus(status: Order['status']) {
    if (!order) return;
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      setOrder(data);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSaving(false);
    }
  }

  const total = useMemo(() => {
    if (!order?.items) return 0;
    return order.items.reduce((sum, item) => sum + Number(item.unit_price) * item.quantity, 0);
  }, [order]);

  return (
    <div className="min-h-screen bg-cream pb-10">
      <div className="bg-green px-6 pt-14 pb-7">
        <button onClick={() => router.push('/vendor/orders')} className="flex items-center gap-2 text-white/60 text-sm mb-4">
          {'<'} Back to Orders
        </button>

        <p className="text-white/50 text-xs mb-1">{order ? `#${order.id.slice(0, 8).toUpperCase()}` : 'Order'}</p>
        <h1 className="font-fraunces text-2xl font-extrabold text-white">
          {order?.customer_identifier || 'Order details'}
        </h1>
        {order && (
          <div className="mt-2">
            <Badge variant={order.status} />
          </div>
        )}
      </div>

      <div className="px-6 py-5 space-y-3.5">
        {loading && <div className="bg-white rounded-2xl p-5 text-sm text-ink-light text-center">Loading...</div>}

        {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-600 text-center">{error}</div>}

        {order && (
          <>
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <p className="text-[11px] font-bold text-ink-light uppercase tracking-wider mb-3.5">Order Items</p>
              <div className="space-y-0">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2.5 border-b border-cream-dark text-sm">
                    <span className="text-ink-mid">{item.quantity}× {item.product_name}</span>
                    <span className="font-semibold text-ink">₦{Number(item.unit_price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3.5 border-t-2 border-cream-dark mt-1">
                <span className="font-bold text-[15px] text-ink">Total</span>
                <span className="font-fraunces font-black text-2xl text-ink">₦{Number(total).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-card">
              <p className="text-[11px] font-bold text-ink-light uppercase tracking-wider mb-3.5">Order Meta</p>
              <div className="flex justify-between items-center py-2.5 border-b border-cream-dark text-sm">
                <span className="text-ink-mid">Channel</span>
                <span className="font-semibold text-ink">{order.channel}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-cream-dark text-sm">
                <span className="text-ink-mid">Created</span>
                <span className="font-semibold text-ink">{new Date(order.created_at).toLocaleString('en-NG')}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 text-sm">
                <span className="text-ink-mid">Payment</span>
                <span className="font-semibold text-ink">{order.payments?.[0]?.status || 'pending'}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-card">
              <p className="text-[11px] font-bold text-ink-light uppercase tracking-wider mb-3.5">Process Order</p>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_ACTIONS.map((action) => (
                  <button
                    key={action.value}
                    disabled={saving || order.status === action.value}
                    onClick={() => updateStatus(action.value)}
                    className="rounded-xl py-3 text-sm font-semibold border border-cream-dark disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : action.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
