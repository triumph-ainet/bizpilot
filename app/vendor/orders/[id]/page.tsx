import { Badge } from '@/components/ui';
import { FileText, Check } from 'lucide-react';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  // In production: fetch order from DB by params.id
  const order = {
    ref: '#ORD-0018',
    customer: 'Tunde Kareem',
    time: 'Today, 9:38 AM',
    status: 'paid' as const,
    items: [
      { name: '2× Pepsi 60cl', amount: 600 },
      { name: '1× Indomie Big', amount: 250 },
      { name: '1× Cabin Biscuit', amount: 150 },
    ],
    total: 1000,
    payment: {
      method: 'Interswitch Checkout',
      ref: 'ISW-20240323-0018',
      paidAt: '9:41 AM',
      status: 'Confirmed',
    },
    customer: { name: 'Tunde Kareem', channel: 'Chat (Sim)', phone: '+234 812 345 6789' },
  };

  return (
    <div className="min-h-screen bg-cream pb-10">
      {/* Header */}
      <div className="bg-green px-6 pt-14 pb-7">
        <a href="/vendor/orders" className="flex items-center gap-2 text-white/60 text-sm mb-4">
          ‹ Back to Orders
        </a>
        <p className="text-white/50 text-xs mb-1">
          {order.ref} · {order.time}
        </p>
        <h1 className="font-fraunces text-2xl font-extrabold text-white">{order.customer}</h1>
        <div className="mt-2">
          <Badge variant={order.status} />
        </div>
      </div>

      <div className="px-6 py-5 space-y-3.5">
        {/* Order items */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <p className="text-[11px] font-bold text-ink-light uppercase tracking-wider mb-3.5">
            Order Items
          </p>
          <div className="space-y-0">
            {order.items.map((item) => (
              <div
                key={item.name}
                className="flex justify-between items-center py-2.5 border-b border-cream-dark text-sm"
              >
                <span className="text-ink-mid">{item.name}</span>
                <span className="font-semibold text-ink">₦{item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-3.5 border-t-2 border-cream-dark mt-1">
            <span className="font-bold text-[15px] text-ink">Total</span>
            <span className="font-fraunces font-black text-2xl text-ink">
              ₦{order.total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payment info */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <p className="text-[11px] font-bold text-ink-light uppercase tracking-wider mb-3.5">
            Payment
          </p>
          {[
            { key: 'Method', val: order.payment.method },
            { key: 'Reference', val: order.payment.ref, small: true },
            { key: 'Paid at', val: order.payment.paidAt },
            {
              key: 'Status',
              val: (
                <span className="inline-flex items-center gap-1">
                  <Check className="w-4 h-4" /> Confirmed
                </span>
              ),
              green: true,
            },
          ].map((row) => (
            <div
              key={row.key}
              className="flex justify-between items-center py-2.5 border-b border-cream-dark last:border-0 text-sm"
            >
              <span className="text-ink-mid">{row.key}</span>
              <span
                className={`font-semibold ${row.green ? 'text-green-light' : 'text-ink'} ${row.small ? 'text-xs' : ''}`}
              >
                {row.val}
              </span>
            </div>
          ))}
        </div>

        {/* Customer info */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <p className="text-[11px] font-bold text-ink-light uppercase tracking-wider mb-3.5">
            Customer
          </p>
          {[
            { key: 'Name', val: order.customer.name },
            { key: 'Channel', val: order.customer.channel },
            { key: 'Phone', val: order.customer.phone },
          ].map((row) => (
            <div
              key={row.key}
              className="flex justify-between items-center py-2.5 border-b border-cream-dark last:border-0 text-sm"
            >
              <span className="text-ink-mid">{row.key}</span>
              <span className="font-semibold text-ink">{row.val}</span>
            </div>
          ))}
        </div>

        <button className="w-full bg-white border-[1.5px] border-cream-dark rounded-2xl py-4 font-dm font-semibold text-sm text-ink-mid inline-flex items-center justify-center gap-1.5">
          <FileText className="w-4 h-4" /> Download Receipt
        </button>
      </div>
    </div>
  );
}
