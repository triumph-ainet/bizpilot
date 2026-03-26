import { useSearchParams } from 'next/navigation';

export default function PaymentCallbackPage() {
  const params = useSearchParams();
  const txnref = params.get('txnref') || params.get('transactionreference') || '';
  const resp = params.get('resp') || params.get('response') || '';

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
