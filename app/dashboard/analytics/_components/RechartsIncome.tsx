"use client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

type Props = {
  data: { date: string; total: number }[];
};

export default function RechartsIncome({ data }: Props) {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <h3 className="text-sm font-semibold mb-2">Income (30 days)</h3>
      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 12, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={(v) => `${v}`} />
            <Tooltip formatter={(v: any) => [`₦ ${Number(v).toLocaleString()}`, 'Income']} />
            <Line type="monotone" dataKey="total" stroke="#16a34a" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
