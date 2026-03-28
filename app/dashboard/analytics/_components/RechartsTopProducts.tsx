'use client';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

type Item = { name: string; qty: number };

type Props = { items: Item[] };

export default function RechartsTopProducts({ items }: Props) {
  return (
    <div
      className="bg-white p-4 rounded-md shadow-card border"
      style={{ borderColor: 'var(--color-cream-dark)' }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-ink)' }}>
        Top Products
      </h3>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={items} margin={{ top: 6, right: 12, left: 0, bottom: 6 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,61,46,0.04)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-ink-mid)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--color-ink-mid)' }} />
            <Tooltip
              formatter={(v: any) => [v, 'Sold']}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid rgba(13,61,46,0.06)',
                backgroundColor: 'var(--color-cream)',
              }}
            />
            <Legend />
            <Bar dataKey="qty" fill="var(--color-green-mid)" radius={[8, 8, 8, 8]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
