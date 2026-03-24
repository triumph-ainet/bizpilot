'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

export default function StorePage({ params }: { params: { slug: string } }) {
  const [order, setOrder] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/messages/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'sim_chat',
          vendorId: params.slug,
          senderId: `+234${phone}`,
          text: order,
        }),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-green relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(61,186,138,0.2),transparent_50%),radial-gradient(circle_at_20%_80%,rgba(245,166,35,0.15),transparent_50%)]" />

      <div className="relative px-7 pt-16 pb-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-white/80 mb-5 tracking-wider uppercase">
          ⚡ Powered by BizPilot
        </div>

        <h1 className="font-fraunces text-[34px] font-black text-white leading-tight mb-2">
          Aisha's Drinks
          <br />
          Store
        </h1>
        <p className="text-white/55 text-sm mb-9">
          Lagos · Fast delivery · Orders processed automatically
        </p>

        {sent ? (
          <div className="bg-white rounded-3xl p-7 shadow-card-lg text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="font-fraunces text-xl font-bold text-ink mb-2">Order Received!</h2>
            <p className="text-sm text-ink-light leading-relaxed">
              We've received your order and a payment link will be sent to your WhatsApp shortly.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setOrder('');
                setPhone('');
              }}
              className="mt-5 text-sm text-green-light font-semibold"
            >
              Place another order
            </button>
          </div>
        ) : (
          <form onSubmit={handleOrder}>
            <div className="bg-white rounded-3xl p-6 shadow-card-lg space-y-4 mb-5">
              <div>
                <h2 className="font-fraunces text-xl font-bold text-ink mb-1.5">
                  Place Your Order
                </h2>
                <p className="text-[13px] text-ink-light leading-relaxed">
                  Just type what you want — our AI handles the rest. Payment link will be sent to
                  you instantly.
                </p>
              </div>

              <textarea
                className="w-full bg-cream border-[1.5px] border-cream-dark rounded-2xl px-4 py-3.5 font-dm text-[15px] text-ink placeholder:text-ink-light outline-none resize-none h-24 focus:border-green-bright transition-colors"
                placeholder="e.g. I want 2 Pepsi and 1 Indomie abeg..."
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                required
              />

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-ink-light uppercase tracking-wider">
                  Your WhatsApp Number
                </label>
                <div className="flex gap-2.5">
                  <div className="bg-cream border-[1.5px] border-cream-dark rounded-xl px-3 py-3.5 text-[15px] font-medium text-ink whitespace-nowrap">
                    🇳🇬 +234
                  </div>
                  <input
                    className="flex-1 bg-cream border-[1.5px] border-cream-dark rounded-xl px-4 py-3.5 font-dm text-[15px] text-ink placeholder:text-ink-light outline-none focus:border-green-bright transition-colors"
                    type="tel"
                    placeholder="081 234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button variant="amber" loading={loading} type="submit">
                Send My Order →
              </Button>
            </div>
          </form>
        )}

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-6">
          {[
            { icon: '🔒', text: 'Secure payments' },
            { icon: '⚡', text: 'Instant confirmation' },
            { icon: '🏦', text: 'Interswitch powered' },
          ].map((t) => (
            <div key={t.text} className="flex items-center gap-1.5 text-xs text-white/55">
              <span>{t.icon}</span>
              <span>{t.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
