'use client';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import AnalyticsCard from './AnalyticsCard';

type Item = { name: string; qty: number };

type Props = { items: Item[] };

export default function RechartsTopProducts({ items }: Props) {
  const total = items.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const top = items[0];

  return (
    <AnalyticsCard className="p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-fraunces text-lg" style={{ color: 'var(--color-ink)' }}>
            Top products
          </h3>
          <p className="text-xs" style={{ color: 'var(--color-ink-mid)' }}>
            Best-performing items by units sold
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-sm" style={{ color: 'var(--color-green-mid)' }}>
            {total.toLocaleString()} units
          </p>
          <p className="text-xs" style={{ color: 'var(--color-ink-mid)' }}>
            Leader: {top ? `${top.name} (${top.qty})` : 'N/A'}
          </p>
        </div>
      </div>

      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={items} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="topProductsBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-green-bright)" />
                <stop offset="100%" stopColor="var(--color-green-mid)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(13,61,46,0.08)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'var(--color-ink-mid)' }}
              tickFormatter={(value: string) => (value.length > 10 ? `${value.slice(0, 10)}...` : value)}
              tickMargin={8}
              minTickGap={16}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-ink-mid)' }} />
            <Tooltip
              formatter={(v: number) => [`${Number(v || 0).toLocaleString()} units`, 'Sold']}
              labelFormatter={(label: string) => `Product: ${label}`}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid rgba(13,61,46,0.12)',
                backgroundColor: 'var(--color-cream)',
                boxShadow: '0 10px 30px rgba(13, 61, 46, 0.12)',
              }}
            />
            <Bar dataKey="qty" fill="url(#topProductsBar)" radius={[10, 10, 4, 4]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCard>
  );
}
