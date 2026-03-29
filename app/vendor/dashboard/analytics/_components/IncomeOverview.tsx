import AnalyticsCard from './AnalyticsCard';

type Props = {
  total: number;
  periodLabel: string;
};

export default function IncomeOverview({ total, periodLabel }: Props) {
  return (
    <AnalyticsCard>
      <p
        className="text-xs uppercase tracking-[0.18em]"
        style={{ color: 'var(--color-ink-light)' }}
      >
        Income Snapshot
      </p>
      <h3 className="mt-1 text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
        {periodLabel}
      </h3>

      <p
        className="mt-4 text-3xl font-fraunces font-bold"
        style={{ color: 'var(--color-green-mid)' }}
      >
        ₦ {total.toLocaleString()}
      </p>

      <div
        className="mt-4 h-2 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: 'var(--color-cream-dark)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, Math.max(8, Math.log10(Math.max(total, 10)) * 22))}%`,
            background:
              'linear-gradient(90deg, var(--color-green-mid) 0%, var(--color-green-bright) 100%)',
          }}
        />
      </div>
    </AnalyticsCard>
  );
}
