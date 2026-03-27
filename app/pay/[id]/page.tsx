import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase';

export default async function PayPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: payment } = await supabase
    .from('payments')
    .select('*, orders(*)')
    .eq('order_id', params.id)
    .limit(1)
    .single()

  const paymentRecord: any = payment || null;
  const paymentUrl = paymentRecord?.interswitch_reference ? `${process.env.INTERSWITCH_BASE_URL}/collections/api/v1/pay?txnref=${paymentRecord.interswitch_reference}` : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-semibold mb-3">Checkout</h1>
        <p className="text-sm text-slate-600 mb-4">
          {paymentRecord?.orders?.total
            ? `Order total: ₦${paymentRecord.orders.total}`
            : 'Order details not found.'}
        </p>

        {paymentUrl ? (
          <>
            <a
              href={paymentUrl}
              className="w-full inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg text-center mb-3"
              target="_blank"
              rel="noreferrer"
            >
              Pay Now
            </a>

            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <p className="text-xs text-slate-500 mb-2">Or copy this payment link:</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={paymentUrl}
                  className="flex-1 rounded p-2 text-sm border border-slate-200 bg-white"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(paymentUrl)}
                  className="px-3 py-2 bg-slate-200 rounded text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-sm text-amber-600">Payment link unavailable.</div>
        )}

        <div className="mt-6">
          <Link href="/" className="text-sm text-slate-600 hover:underline">
            Return to store
          </Link>
        </div>
      </div>
    </div>
  );
}
