'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, InputHTMLAttributes, forwardRef } from 'react';
import { Home, Package, Receipt, MessageCircle, Settings } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'amber' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-dm font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

    const variants = {
      primary: 'bg-green text-white hover:bg-green-mid shadow-card',
      amber: 'bg-amber text-green hover:bg-amber-light shadow-amber',
      outline: 'bg-white border-2 border-cream-dark text-ink-mid hover:border-green-bright',
      ghost: 'bg-transparent text-ink-light hover:bg-cream',
      danger: 'bg-white border-2 border-red-500 text-red-500 hover:bg-red-50',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-5 py-4 text-base w-full',
      lg: 'px-6 py-5 text-lg w-full',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-semibold text-ink-light uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full bg-cream border-[1.5px] border-cream-dark rounded-xl px-4 py-3.5 font-dm text-[15px] text-ink placeholder:text-ink-light outline-none transition-colors duration-200 focus:border-green-bright',
          error && 'border-red-400 focus:border-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

type BadgeVariant = 'paid' | 'pending' | 'credit' | 'cancelled';

export function Badge({ variant }: { variant: BadgeVariant }) {
  const styles: Record<BadgeVariant, string> = {
    paid: 'bg-green-bright/10 text-green-light',
    pending: 'bg-amber/15 text-amber',
    credit: 'bg-blue-100 text-blue-600',
    cancelled: 'bg-red-100 text-red-500',
  };
  const labels: Record<BadgeVariant, string> = {
    paid: '✓ PAID',
    pending: 'PENDING',
    credit: 'CREDIT',
    cancelled: 'CANCELLED',
  };
  return (
    <span
      className={cn(
        'text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide',
        styles[variant]
      )}
    >
      {labels[variant]}
    </span>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-white rounded-2xl shadow-card', className)}>{children}</div>;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-5 h-5 border-2 border-cream-dark border-t-green-bright rounded-full animate-spin',
        className
      )}
    />
  );
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 bg-amber rounded-xl flex items-center justify-center font-fraunces font-black text-lg text-green">
        B
      </div>
      <span className={cn('font-fraunces font-bold text-xl', dark ? 'text-ink' : 'text-white')}>
        BizPilot
      </span>
    </div>
  );
}

export function StockBar({ quantity, threshold }: { quantity: number; threshold: number }) {
  const pct = Math.min(100, (quantity / Math.max(threshold * 4, 1)) * 100);
  const low = quantity <= threshold;
  return (
    <div className="flex items-center gap-2 mt-2">
      <span className={cn('text-[11px] font-medium', low ? 'text-red-500' : 'text-ink-light')}>
        {low ? `⚠ ${quantity} left` : `${quantity} left`}
      </span>
      <div className="flex-1 h-1 bg-cream-dark rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            low ? 'bg-red-400' : 'bg-green-bright'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function Avatar({
  name,
  size = 'md',
  color = 'amber',
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-14 h-14 text-xl' };
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-fraunces font-black bg-amber text-green',
        sizes[size]
      )}
    >
      {initials}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-green px-6 pt-14 pb-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-fraunces text-2xl font-extrabold text-white">{title}</h1>
        {children}
      </div>
      {subtitle && <p className="text-white/50 text-sm">{subtitle}</p>}
    </div>
  );
}

const NAV_ITEMS = [
  { href: '/vendor/dashboard', icon: <Home className="w-5 h-5" />, label: 'Home' },
  { href: '/vendor/catalog', icon: <Package className="w-5 h-5" />, label: 'Catalog' },
  { href: '/vendor/orders', icon: <Receipt className="w-5 h-5" />, label: 'Orders' },
  { href: '/chat', icon: <MessageCircle className="w-5 h-5" />, label: 'Chat' },
  { href: '/vendor/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
];

export function BottomNav({ active }: { active: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-cream-dark flex px-2 pb-6 pt-2.5 z-50 max-w-md mx-auto">
      {NAV_ITEMS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={cn(
            'flex-1 flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl transition-colors',
            active === item.href ? 'bg-green/6' : ''
          )}
        >
          <span className="text-xl">{item.icon}</span>
          <span
            className={cn(
              'text-[10px] font-semibold',
              active === item.href ? 'text-green' : 'text-ink-light'
            )}
          >
            {item.label}
          </span>
        </a>
      ))}
    </nav>
  );
}
