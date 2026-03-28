import { CheckCircle, Info } from 'lucide-react';

export default function PaymentCallbackPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const getParam = (key: string) => {
    const val = searchParams[key];
    if (Array.isArray(val)) return val[0] ?? '';
    return val ?? '';
  };

  const txnref = getParam('txnref') || getParam('transactionreference') || '';
  const resp = getParam('resp') || getParam('response') || '';

  const success = resp === '00';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          {success ? (
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
              style={{ backgroundColor: 'var(--color-green-light)' }}
            >
              <CheckCircle
                className="w-10 h-10"
                style={{ color: 'var(--color-green)' }}
                aria-hidden
              />
            </div>
          ) : (
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
              style={{ backgroundColor: 'var(--color-amber-light)' }}
            >
              <Info className="w-10 h-10" style={{ color: 'var(--color-amber)' }} aria-hidden />
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            {success ? 'Payment Successful' : 'Payment Pending'}
          </h1>

          <p className="text-sm text-slate-600 max-w-prose mx-auto">
            {success
              ? 'Thank you — we received your payment. Your order will be processed shortly.'
              : 'We are waiting for confirmation from your bank. This may take a few minutes.'}
          </p>
        </div>

        {txnref && (
          <div className="bg-slate-50 rounded-md p-4 mb-6 border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">Transaction reference</p>
            <p className="font-mono text-sm font-semibold text-slate-900 break-all">{txnref}</p>
          </div>
        )}

        <div className="space-y-3">
          <a
            href="/"
            className="w-full inline-block text-white font-medium py-3 px-4 rounded-lg text-center transition-colors duration-200 bg-[var(--color-green)] hover:bg-[var(--color-green-mid)]"
          >
            Return to Store
          </a>

          {!success && (
            <a
              href="/support"
              className="w-full inline-block bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-3 px-4 rounded-lg text-center transition-colors duration-200"
            >
              Contact Support
            </a>
          )}

          <div className="text-xs text-slate-500 text-center">
            {success
              ? 'If you need help, contact the vendor or check your orders page.'
              : 'If you were charged and the status does not update, contact support with the reference above.'}
          </div>
        </div>
      </div>
    </div>
  );
}
