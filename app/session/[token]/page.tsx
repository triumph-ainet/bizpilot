import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase';

type SessionPageProps = {
  params: Promise<{ token: string }>;
};

export default async function SessionPage({ params }: SessionPageProps) {
  const { token } = await params;
  const supabase = createServerSupabase();

  const { data: session } = await supabase
    .from('sessions')
    .select(
      'id, order_id, vendor_id, customer_identifier, customer_email, last_accessed, created_at'
    )
    .eq('token', token)
    .limit(1)
    .single();

  if (!session) {
    notFound();
  }

  const orderId = session.order_id as string | null;
  const vendorId = session.vendor_id as string | null;
  const customer = session.customer_identifier as string | null;
  const chatUrl =
    vendorId && customer ? `/chat/session/${vendorId}/${encodeURIComponent(customer)}` : null;
  const payUrl = orderId ? `/pay/${orderId}` : null;
  const formattedDate = session.last_accessed || session.created_at;

  return (
    <main className="min-h-screen bg-[var(--color-cream)] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl rounded-[var(--radius-3xl)] border border-[var(--color-cream-dark)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
        <p className="inline-flex rounded-full bg-[var(--color-cream-dark)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--color-green)]">
          Order session
        </p>

        <h1 className="mt-3 font-fraunces text-2xl text-[var(--color-green)] sm:text-3xl">
          Continue your order
        </h1>

        <p className="mt-2 text-sm text-[var(--color-ink-mid)]">
          Use this page to continue chatting with the vendor and complete your payment.
        </p>

        <div className="mt-6 rounded-2xl border border-[var(--color-cream-dark)] bg-[var(--color-cream)] p-4 text-sm text-[var(--color-ink)]">
          {session.customer_email ? (
            <p>
              Updates email: <span className="font-semibold">{session.customer_email}</span>
            </p>
          ) : (
            <p>No email saved yet for this session.</p>
          )}
          {formattedDate && (
            <p className="mt-2 text-[var(--color-ink-light)]">
              Last activity: {new Date(formattedDate).toLocaleString('en-NG')}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {payUrl && (
            <Link
              href={payUrl}
              className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--color-green)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--color-green-mid)] sm:w-auto"
            >
              Open payment
            </Link>
          )}
          {chatUrl && (
            <Link
              href={chatUrl}
              className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--color-green)] px-4 py-3 text-sm font-semibold text-[var(--color-green)] hover:bg-[var(--color-green)]/5 sm:w-auto"
            >
              Continue chat
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
