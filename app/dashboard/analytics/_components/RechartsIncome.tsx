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

type Props = {
  data: { date: string; total: number }[];
};

export default function RechartsIncome({ data }: Props) {
  return (
    <div
      className="bg-white p-6 rounded-lg shadow-card border"
      style={{ borderColor: 'var(--color-cream-dark)' }}
    >
      <h3 className="text-base font-fraunces mb-4 text-ink" style={{ color: 'var(--color-ink)' }}>
        Income (30 days)
      </h3>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="gradientIncome" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--color-green-mid)" stopOpacity="0.18" />
                <stop offset="100%" stopColor="var(--color-green-mid)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,61,46,0.06)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-ink-mid)' }} />
            <YAxis
              tickFormatter={(v: number) => `₦ ${Number(v).toLocaleString()}`}
              tick={{ fontSize: 11, fill: 'var(--color-ink-mid)' }}
            />
            <Tooltip
              formatter={(v: any) => [`₦ ${Number(v).toLocaleString()}`, 'Income']}
              labelFormatter={(label) => `${label}`}
              contentStyle={{
                backgroundColor: 'var(--color-cream)',
                border: '1px solid rgba(13,61,46,0.06)',
                borderRadius: '8px',
                color: 'var(--color-ink)',
              }}
              itemStyle={{ color: 'var(--color-ink)' }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--color-green-mid)"
              fill="url(#gradientIncome)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="var(--color-green-mid)"
              strokeWidth={2}
              dot={false}
              opacity={0.9}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
