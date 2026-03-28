type Props = {
  name: string;
  totalSpent: number;
};

export default function TopCustomer({ name, totalSpent }: Props) {
  return (
    <div
      className="bg-white p-6 rounded-lg shadow-card border"
      style={{ borderColor: 'var(--color-cream-dark)' }}
    >
      <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-ink)' }}>
        Top Customer
      </h3>
      <div
        className="text-lg font-fraunces font-bold leading-tight"
        style={{ color: 'var(--color-ink)' }}
      >
        {name || '—'}
      </div>
      <div className="mt-2">
        <div className="text-sm font-bold" style={{ color: 'var(--color-green-mid)' }}>
          ₦ {totalSpent.toLocaleString()}
        </div>
        <div className="text-xs text-ink-mid mt-1">Total spent</div>
      </div>
    </div>
  );
}
