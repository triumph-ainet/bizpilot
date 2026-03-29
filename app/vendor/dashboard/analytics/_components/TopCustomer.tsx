import { Crown, Wallet } from 'lucide-react';
import AnalyticsCard from './AnalyticsCard';

type Props = {
  name: string;
  totalSpent: number;
};

export default function TopCustomer({ name, totalSpent }: Props) {
  return (
    <AnalyticsCard>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="text-xs uppercase tracking-[0.18em]"
            style={{ color: 'var(--color-ink-light)' }}
          >
            Customer Value
          </p>
          <h3 className="mt-1 text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
            Top Customer
          </h3>
        </div>
        <div
          className="flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ backgroundColor: 'var(--color-cream)', color: 'var(--color-amber)' }}
        >
          <Crown className="h-3.5 w-3.5" />
          VIP
        </div>
      </div>

      <p
        className="mt-4 text-xl font-fraunces font-semibold leading-tight"
        style={{ color: 'var(--color-ink)' }}
      >
        {name || 'No paying customer yet'}
      </p>

      <div
        className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
        style={{ backgroundColor: 'var(--color-cream-dark)', color: 'var(--color-green-mid)' }}
      >
        <Wallet className="h-3.5 w-3.5" />₦ {totalSpent.toLocaleString()} total spent
      </div>
    </AnalyticsCard>
  );
}
