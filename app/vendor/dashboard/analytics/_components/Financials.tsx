type Props = {
  inventoryValue: number;
  cash: number;
};

import { Landmark, WalletCards } from 'lucide-react';
import AnalyticsCard from './AnalyticsCard';

export default function Financials({ inventoryValue, cash }: Props) {
  const assets = inventoryValue + cash;
  const liabilities = 0;
  const equity = assets - liabilities;
  const inventoryShare = assets > 0 ? Math.round((inventoryValue / assets) * 100) : 0;

  return (
    <AnalyticsCard>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--color-ink-light)' }}>
            Financial Health
          </p>
          <h3 className="mt-1 text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
            Balance Summary
          </h3>
        </div>
        <div
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{ backgroundColor: 'var(--color-cream-dark)', color: 'var(--color-green-mid)' }}
        >
          <Landmark className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--color-cream)' }}>
          <span className="text-xs font-semibold" style={{ color: 'var(--color-ink-mid)' }}>Inventory</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>₦ {inventoryValue.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--color-cream)' }}>
          <span className="text-xs font-semibold" style={{ color: 'var(--color-ink-mid)' }}>Cash</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>₦ {cash.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--color-cream-dark)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, Math.max(6, inventoryShare))}%`,
            background:
              'linear-gradient(90deg, var(--color-green-mid) 0%, var(--color-green-bright) 100%)',
          }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--color-ink-light)' }}>
            Total Assets
          </p>
          <p className="mt-1 text-xl font-fraunces font-semibold" style={{ color: 'var(--color-green-mid)' }}>
            ₦ {assets.toLocaleString()}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: 'var(--color-cream)', color: 'var(--color-amber)' }}>
          <WalletCards className="h-3.5 w-3.5" />
          Equity ₦ {equity.toLocaleString()}
        </div>
      </div>
    </AnalyticsCard>
  );
}
