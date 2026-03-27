"use client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

type Item = { name: string; qty: number };

type Props = { items: Item[] };

export default function RechartsTopProducts({ items }: Props) {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <h3 className="text-sm font-semibold mb-2">Top Products</h3>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={items} margin={{ top: 5, right: 12, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip formatter={(v: any) => [v, 'Sold']} />
            <Legend />
            <Bar dataKey="qty" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
