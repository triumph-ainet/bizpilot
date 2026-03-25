'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { BottomNav, StockBar } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/types';

const FILTERS = ['All', 'In Stock', 'Low Stock', 'Out of Stock'] as const;
type Filter = (typeof FILTERS)[number];

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load products');
        setProducts(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      if (term && !p.name.toLowerCase().includes(term)) return false;
      if (activeFilter === 'In Stock') return p.quantity > p.low_stock_threshold;
      if (activeFilter === 'Low Stock') return p.quantity > 0 && p.quantity <= p.low_stock_threshold;
      if (activeFilter === 'Out of Stock') return p.quantity <= 0;
      return true;
    });
  }, [products, activeFilter, search]);

  const counts = useMemo(() => {
    const outOfStock = products.filter((p) => p.quantity <= 0).length;
    const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= p.low_stock_threshold).length;
    const inStock = products.filter((p) => p.quantity > p.low_stock_threshold).length;
    return { all: products.length, inStock, lowStock, outOfStock };
  }, [products]);

  const filterLabel = (filter: Filter) => {
    if (filter === 'All') return `All (${counts.all})`;
    if (filter === 'In Stock') return `In Stock (${counts.inStock})`;
    if (filter === 'Low Stock') return `Low Stock (${counts.lowStock})`;
    return `Out of Stock (${counts.outOfStock})`;
  };

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
          <Search className="w-4 h-4" />
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
              {filterLabel(f)}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 gap-3">
          {!loading && !error && filtered.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden shadow-card active:scale-95 transition-transform cursor-pointer"
            >
              <div className="h-24 flex items-center justify-center bg-emerald-50">
                <span className="font-fraunces font-black text-2xl text-green-light">
                  {product.name.slice(0, 1).toUpperCase()}
                </span>
              </div>
              <div className="p-3">
                <p className="font-bold text-[13px] text-ink leading-tight">{product.name}</p>
                <p className="font-fraunces font-bold text-[17px] text-green-light mt-1">
                  ₦{Number(product.price).toLocaleString()}
                </p>
                <StockBar quantity={product.quantity} threshold={product.low_stock_threshold} />
              </div>
            </div>
          ))}

          {!loading && !error && filtered.length === 0 && (
            <div className="col-span-2 bg-white rounded-2xl p-6 text-center text-sm text-ink-light shadow-card">
              No products match this filter yet.
            </div>
          )}

          {loading && (
            <div className="col-span-2 bg-white rounded-2xl p-6 text-center text-sm text-ink-light shadow-card">
              Loading your catalog...
            </div>
          )}

          {error && (
            <div className="col-span-2 bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-sm text-red-600">
              {error}
            </div>
          )}

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
