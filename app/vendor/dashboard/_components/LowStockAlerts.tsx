'use client';

import React, { useState } from 'react';
import { CircleAlert } from 'lucide-react';

type Product = {
  id: string;
  product_id?: string;
  product_name?: string;
  name?: string;
  quantity: number;
  resolved?: boolean;
};

type Props = { products: Product[] };

export default function LowStockAlerts({ products }: Props) {
  const [items, setItems] = useState(products || []);

  if (!items || items.length === 0) return null;

  async function resolveAlert(id: string) {
    try {
      const res = await fetch('/api/stock-alerts/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((p) => (p.id === id ? { ...p, resolved: true } : p)));
      }
    } catch (e) {
      // ignore
    }
  }

  return (
    <>
      {items.map((p) => (
        <div
          key={p.id}
          className="bg-gradient-to-r from-orange-50 to-amber-50 border-[1.5px] border-amber/40 rounded-2xl px-4 py-3.5 flex items-center gap-3"
        >
          <CircleAlert className="w-7 h-7 text-red-500" />
          <div className="flex-1">
            <p className="font-bold text-sm text-orange-800">
              {p.product_name || p.name} is running low
            </p>
            <p className="text-xs text-orange-600 mt-0.5">Only {p.quantity} left · Restock soon</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => resolveAlert(p.id)}
              disabled={p.resolved}
              className="text-xs font-bold text-amber whitespace-nowrap bg-white/20 px-3 py-1 rounded"
            >
              {p.resolved ? 'Resolved' : 'Mark resolved'}
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
