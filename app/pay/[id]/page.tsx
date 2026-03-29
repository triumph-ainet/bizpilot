import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase';
import CopyLinkClient from './CopyLinkClient';

export default async function PayPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: payment } = await supabase
    .from('payments')
    .select('*, orders(*)')
    .eq('order_id', params.id)
    .limit(1)
    .single();

  const paymentRecord: any = payment || null;
  const orderTotal = Number(paymentRecord?.orders?.total ?? 0);
  const hasOrderTotal = Number.isFinite(orderTotal) && orderTotal > 0;
  const formattedTotal = hasOrderTotal
    ? new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(orderTotal)
    : null;

  const paymentUrl = paymentRecord?.interswitch_reference
    ? `${process.env.INTERSWITCH_BASE_URL}/collections/api/v1/pay?txnref=${paymentRecord.interswitch_reference}`
    : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-cream)] px-4 py-8 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-[var(--color-amber-light)] blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[var(--color-green-bright)]/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-xl items-center justify-center">
        <section className="animate-[var(--animate-fade-up)] w-full rounded-[var(--radius-3xl)] border border-[var(--color-cream-dark)] bg-white/95 p-6 shadow-[var(--shadow-card)] backdrop-blur sm:p-8">
          <p className="mb-3 inline-flex items-center rounded-full bg-[var(--color-cream-dark)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--color-green)]">
            Secure checkout
          </p>

          <h1 className="font-fraunces text-2xl leading-tight text-[var(--color-green)] sm:text-3xl">
            Complete your payment
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-mid)]">
            Use the secure payment gateway to finish this order. The payment page opens in a new tab.
          </p>

          <div className="mt-6 rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] p-4 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-light)]">
              Order summary
            </p>
            {formattedTotal ? (
              <p className="mt-2 text-2xl font-semibold text-[var(--color-green)]">₦{formattedTotal}</p>
            ) : (
              <p className="mt-2 text-sm text-[var(--color-ink-mid)]">Order details are not available.</p>
            )}
          </div>

          <div className="mt-6 space-y-3">
            {paymentUrl ? (
              <>
                <a
                  href={paymentUrl}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--color-green)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-green-mid)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-green-bright)] focus-visible:ring-offset-2"
                  target="_blank"
                  rel="noreferrer"
                >
                  Pay now
                </a>

                <CopyLinkClient paymentUrl={paymentUrl} />
              </>
            ) : (
              <div className="rounded-xl border border-[var(--color-amber)]/40 bg-[var(--color-amber-light)]/40 px-4 py-3 text-sm text-[var(--color-ink)]">
                Payment link is currently unavailable. Please return to the store and try again.
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-[var(--color-cream-dark)] pt-4">
            <Link
              href="/"
              className="text-sm font-medium text-[var(--color-green)] transition-colors hover:text-[var(--color-green-light)]"
            >
              Return to store
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
