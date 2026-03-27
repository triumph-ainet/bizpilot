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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          {success ? (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0-12a9 9 0 110 18 9 9 0 010-18z"
                />
              </svg>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">
          {success ? 'Payment Successful' : 'Payment Pending'}
        </h1>

        {txnref && (
          <div className="bg-slate-50 rounded-md p-4 mb-6 border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">Transaction Reference</p>
            <p className="font-mono text-sm font-semibold text-slate-900 break-all">{txnref}</p>
          </div>
        )}

        <p className="text-slate-700 text-center mb-8 leading-relaxed">
          {success
            ? 'Thank you for your payment. Your transaction has been completed successfully. You can now close this window or return to the store.'
            : 'Your payment status is pending confirmation. If you were charged, please contact support with the reference ID above.'}
        </p>

        <div className="space-y-3">
          <a
            href="/"
            className="w-full inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors duration-200"
          >
            Return to Store
          </a>
          {!success && (
            <a
              href="/support"
              className="w-full inline-block bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium py-3 px-4 rounded-lg text-center transition-colors duration-200"
            >
              Contact Support
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
