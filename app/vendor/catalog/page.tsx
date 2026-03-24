'use client';

import { useState } from 'react';
import { BottomNav, StockBar, PageHeader } from '@/components/ui';
import { cn } from '@/lib/utils';

const DEMO_PRODUCTS = [
  {
    id: '1',
    name: 'Pepsi 60cl',
    price: 300,
    quantity: 24,
    low_stock_threshold: 5,
    emoji: '🥤',
    bg: 'bg-emerald-50',
  },
  {
    id: '2',
    name: 'Maltina 60cl',
    price: 400,
    quantity: 18,
    low_stock_threshold: 5,
    emoji: '🟡',
    bg: 'bg-orange-50',
  },
  {
    id: '3',
    name: 'Coke 50cl',
    price: 300,
    quantity: 4,
    low_stock_threshold: 5,
    emoji: '🔴',
    bg: 'bg-red-50',
  },
  {
    id: '4',
    name: 'Indomie Big',
    price: 250,
    quantity: 36,
    low_stock_threshold: 5,
    emoji: '🍜',
    bg: 'bg-purple-50',
  },
  {
    id: '5',
    name: 'Cabin Biscuit',
    price: 150,
    quantity: 6,
    low_stock_threshold: 7,
    emoji: '🍪',
    bg: 'bg-indigo-50',
  },
  {
    id: '6',
    name: 'Peak Milk 170g',
    price: 500,
    quantity: 12,
    low_stock_threshold: 5,
    emoji: '🥛',
    bg: 'bg-blue-50',
  },
];

const FILTERS = ['All (12)', 'Drinks', 'Food', 'Low Stock'];

export default function CatalogPage() {
  const [activeFilter, setActiveFilter] = useState('All (12)');
  const [search, setSearch] = useState('');

  const filtered = DEMO_PRODUCTS.filter((p) => {
    if (search) return p.name.toLowerCase().includes(search.toLowerCase());
    if (activeFilter === 'Low Stock') return p.quantity <= p.low_stock_threshold;
    return true;
  });

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <div className="bg-green px-6 pt-14 pb-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-fraunces text-2xl font-extrabold text-white">My Catalog</h1>
          <a
            href="/vendor/catalog/add"
            className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center text-white text-xl border border-white/20"
          >
            +
          </a>
        </div>
        <div className="bg-white/12 border border-white/15 rounded-xl px-4 py-3 flex items-center gap-2.5 text-white/70 text-sm">
          <span>🔍</span>
          <input
            className="bg-transparent outline-none flex-1 text-white placeholder:text-white/50 font-dm text-[15px]"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                'flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium border-[1.5px] transition-all',
                activeFilter === f
                  ? 'bg-green border-green text-white'
                  : 'bg-white border-cream-dark text-ink-mid'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden shadow-card active:scale-95 transition-transform cursor-pointer"
            >
              <div className={cn('h-24 flex items-center justify-center text-5xl', product.bg)}>
                {product.emoji}
              </div>
              <div className="p-3">
                <p className="font-bold text-[13px] text-ink leading-tight">{product.name}</p>
                <p className="font-fraunces font-bold text-[17px] text-green-light mt-1">
                  ₦{product.price}
                </p>
                <StockBar quantity={product.quantity} threshold={product.low_stock_threshold} />
              </div>
            </div>
          ))}

          {/* Add product card */}
          <a
            href="/vendor/catalog/add"
            className="border-2 border-dashed border-cream-dark rounded-2xl flex flex-col items-center justify-center gap-2 min-h-[160px] hover:border-green-bright hover:bg-green-bright/4 transition-all cursor-pointer"
          >
            <span className="text-3xl text-ink-light">+</span>
            <span className="text-[13px] font-semibold text-ink-light">Add Product</span>
          </a>
        </div>
      </div>

      {/* FAB */}
      <a
        href="/vendor/catalog/add"
        className="fixed bottom-24 right-6 w-14 h-14 bg-amber rounded-full flex items-center justify-center text-2xl text-green font-bold shadow-amber z-40"
      >
        +
      </a>

      <BottomNav active="/vendor/catalog" />
    </div>
  );
}
