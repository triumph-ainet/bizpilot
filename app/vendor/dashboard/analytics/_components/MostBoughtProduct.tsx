type Props = {
  name: string;
  quantity: number;
};

import AnalyticsCard from './AnalyticsCard';
import { Package, TrendingUp } from 'lucide-react';

export default function MostBoughtProduct({ name, quantity }: Props) {
  return (
    <AnalyticsCard>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="text-xs uppercase tracking-[0.18em]"
            style={{ color: 'var(--color-ink-light)' }}
          >
            Most Bought
          </p>
          <h3 className="mt-1 text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
            Product
          </h3>
        </div>
        <div
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{ backgroundColor: 'var(--color-cream-dark)', color: 'var(--color-green-mid)' }}
        >
          <Package className="h-4 w-4" />
        </div>
      </div>

      <p
        className="mt-4 text-xl font-fraunces font-semibold leading-tight"
        style={{ color: 'var(--color-ink)' }}
      >
        {name || 'No product yet'}
      </p>

      <div
        className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
        style={{ backgroundColor: 'var(--color-cream)', color: 'var(--color-green-mid)' }}
      >
        <TrendingUp className="h-3.5 w-3.5" />
        {quantity.toLocaleString()} sold
      </div>
    </AnalyticsCard>
  );
}
