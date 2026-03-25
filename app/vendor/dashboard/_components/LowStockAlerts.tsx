import React from 'react';
import { CircleAlert } from 'lucide-react';

type Product = { id: string; name: string; quantity: number };

type Props = { products: Product[] };

export default function LowStockAlerts({ products }: Props) {
  if (!products || products.length === 0) return null;

  return (
    <>
      {products.map((p) => (
        <div
          key={p.id}
          className="bg-gradient-to-r from-orange-50 to-amber-50 border-[1.5px] border-amber/40 rounded-2xl px-4 py-3.5 flex items-center gap-3"
        >
          <CircleAlert className="w-7 h-7 text-red-500" />
          <div className="flex-1">
            <p className="font-bold text-sm text-orange-800">{p.name} is running low</p>
            <p className="text-xs text-orange-600 mt-0.5">Only {p.quantity} left · Restock soon</p>
          </div>
          <button className="text-xs font-bold text-amber whitespace-nowrap">Restock</button>
        </div>
      ))}
    </>
  );
}
