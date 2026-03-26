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
    <div style={{ maxWidth: 680, margin: '48px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>{success ? 'Payment Successful' : 'Payment Status'}</h1>
      {txnref ? (
        <p>
          Reference: <strong>{txnref}</strong>
        </p>
      ) : null}
      <p>
        {success
          ? 'Thank you — your payment was successful. You can close this window or return to the store.'
          : 'Payment not confirmed. If you were charged, contact support with the reference above.'}
      </p>
      <div style={{ marginTop: 20 }}>
        <a href="/" style={{ color: '#0366d6' }}>
          Return to store
        </a>
      </div>
    </div>
  );
}
