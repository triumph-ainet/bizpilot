'use client';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import AnalyticsCard from './AnalyticsCard';

type Props = {
  data: { date: string; total: number }[];
};

const money = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

const moneyCompact = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export default function RechartsIncome({ data }: Props) {
  const total = data.reduce((sum, row) => sum + Number(row.total || 0), 0);
  const average = data.length ? total / data.length : 0;

  return (
    <AnalyticsCard className="p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-fraunces text-lg" style={{ color: 'var(--color-ink)' }}>
            Income (Last 30 days)
          </h3>
          <p className="text-xs" style={{ color: 'var(--color-ink-mid)' }}>
            Daily paid order revenue trend
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-sm" style={{ color: 'var(--color-green-mid)' }}>
            {moneyCompact.format(total)}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-ink-mid)' }}>
            Avg/day {moneyCompact.format(average)}
          </p>
        </div>
      </div>

      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientIncome" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--color-green-mid)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--color-green-mid)" stopOpacity="0.01" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(13,61,46,0.08)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--color-ink-mid)' }}
              tickFormatter={(value: string) => {
                const d = new Date(value);
                return Number.isNaN(d.getTime())
                  ? value
                  : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
              }}
              tickMargin={8}
              minTickGap={20}
            />
            <YAxis
              tickFormatter={(v: number) => moneyCompact.format(Number(v || 0))}
              tick={{ fontSize: 11, fill: 'var(--color-ink-mid)' }}
              width={72}
            />
            <Tooltip
              formatter={(v: number) => [money.format(Number(v || 0)), 'Income']}
              labelFormatter={(label: string) => {
                const d = new Date(label);
                return Number.isNaN(d.getTime())
                  ? label
                  : d.toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    });
              }}
              contentStyle={{
                backgroundColor: 'var(--color-cream)',
                border: '1px solid rgba(13,61,46,0.12)',
                borderRadius: '12px',
                color: 'var(--color-ink)',
                boxShadow: '0 10px 30px rgba(13, 61, 46, 0.12)',
              }}
              itemStyle={{ color: 'var(--color-ink)' }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--color-green-mid)"
              fill="url(#gradientIncome)"
              strokeWidth={2.25}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="var(--color-green-mid)"
              strokeWidth={2.5}
              dot={{ r: 2, fill: 'var(--color-green-mid)', strokeWidth: 0 }}
              activeDot={{ r: 4, stroke: 'white', strokeWidth: 2 }}
              opacity={0.9}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCard>
  );
}
