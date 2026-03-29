import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

export default function AnalyticsCard({ children, className = '' }: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-card transition-transform duration-200 hover:-translate-y-0.5 ${className}`}
      style={{ borderColor: 'var(--color-cream-dark)' }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{
          background:
            'linear-gradient(90deg, var(--color-green-mid) 0%, var(--color-green-bright) 55%, var(--color-amber) 100%)',
        }}
      />
      {children}
    </div>
  );
}
