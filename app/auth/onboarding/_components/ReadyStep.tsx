'use client';

import { Button } from '@/components/ui';

export default function ReadyStep({ slug, loading, onFinish }: { slug: string; loading: boolean; onFinish: () => void; }) {
  return (
    <div className="space-y-5">
      <div className="text-center py-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-bright to-green-mid flex items-center justify-center text-4xl mx-auto mb-4 shadow-[0_8px_32px_rgba(61,186,138,0.35)]">🚀</div>
        <h2 className="font-fraunces text-2xl font-black text-ink">Your store is live!</h2>
        <p className="text-sm text-ink-light mt-1">Start sharing your link and receiving orders</p>
      </div>

      <div className="bg-green rounded-2xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-white/60 text-xs">Share with customers</p>
          <p className="text-white font-semibold text-[15px] mt-0.5">bizpilot.co/{slug || 'your-store'}</p>
        </div>
        <button className="bg-amber text-green text-xs font-bold px-3.5 py-2 rounded-lg">Copy</button>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-card space-y-3">
        <p className="text-xs font-bold text-ink-light uppercase tracking-wider">What happens next</p>
        {[{ icon: '💬', text: 'Customer sends you an order' }, { icon: '🤖', text: 'AI replies and sends payment link' }, { icon: '✅', text: 'Payment confirmed, inventory updated' }].map((item) => (
          <div key={item.text} className="flex items-center gap-3 text-sm text-ink-mid">
            <div className="w-7 h-7 bg-green-bright/12 rounded-full flex items-center justify-center text-sm flex-shrink-0">{item.icon}</div>
            {item.text}
          </div>
        ))}
      </div>

      <Button variant="amber" loading={loading} onClick={onFinish}>Go to My Dashboard →</Button>
    </div>
  );
}
