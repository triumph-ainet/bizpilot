type Insight = {
  title: string;
  detail: string;
};

type Props = {
  insights: Insight[];
  error?: string | null;
};

import { Bot, Sparkles, TriangleAlert } from 'lucide-react';
import AnalyticsCard from './AnalyticsCard';

export default function AIInsights({ insights, error }: Props) {
  return (
    <AnalyticsCard>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--color-ink-light)' }}>
            Smart Assistant
          </p>
          <h3 className="mt-1 text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
            AI Insights & Recommendations
          </h3>
        </div>
        <div
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{ backgroundColor: 'var(--color-cream-dark)', color: 'var(--color-green-mid)' }}
        >
          <Bot className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {error && (
          <div
            className="flex items-start gap-2 rounded-xl border px-3 py-2 text-sm"
            style={{
              backgroundColor: 'rgba(245,166,35,0.1)',
              borderColor: 'rgba(245,166,35,0.35)',
              color: 'var(--color-ink)',
            }}
          >
            <TriangleAlert className="mt-0.5 h-4 w-4" style={{ color: 'var(--color-amber)' }} />
            <span>AI error: {error}</span>
          </div>
        )}
        {!error && insights.length === 0 && (
          <div className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-cream-dark)', color: 'var(--color-ink-mid)' }}>
            No insights available yet. New recommendations will appear as more order data comes in.
          </div>
        )}
        {insights.map((ins, i) => (
          <div
            key={i}
            className="rounded-2xl border p-3"
            style={{
              borderColor: 'var(--color-cream-dark)',
              background:
                'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(250,246,240,0.65) 100%)',
            }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--color-amber)' }} />
              <div className="font-semibold text-sm" style={{ color: 'var(--color-ink)' }}>{ins.title}</div>
            </div>
            <div className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--color-ink-mid)' }}>
              {ins.detail}
            </div>
          </div>
        ))}
      </div>
    </AnalyticsCard>
  );
}
