'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function FeedbackWidget({
  vendorId,
  orderId,
  customerIdentifier,
}: {
  vendorId: string;
  orderId?: string | null;
  customerIdentifier?: string | null;
}) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendorId,
          order_id: orderId,
          customer_identifier: customerIdentifier,
          rating,
          comment,
        }),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data?.success) {
        setStatus('sent');
        setComment('');
        setRating(null);
      } else {
        setStatus('error');
        setError(data?.message || 'Failed to send feedback');
      }
    } catch (e) {
      setStatus('error');
      setError('Could not send feedback — please try again.');
    } finally {
      setSending(false);
    }
  }

  function clear() {
    setComment('');
    setRating(null);
    setStatus('idle');
    setError(null);
  }

  return (
    <div className="w-full max-w-md bg-white rounded shadow p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-amber-50 rounded text-amber-600">
          <Sparkles className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-sm font-semibold">Rate your experience</h3>
          <p className="text-xs text-slate-500">Your feedback helps vendors improve service.</p>
        </div>
      </div>

      <div className="mb-3">
        <span className="text-sm font-medium block mb-2">Your rating</span>
        <div role="radiogroup" aria-label="Rating" className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-pressed={rating === n}
              className={`px-3 py-2 rounded text-sm focus:outline-none ${rating === n ? 'bg-amber-300 text-slate-900' : 'bg-slate-100 text-slate-700'}`}
            >
              {n}★
            </button>
          ))}
        </div>
      </div>

      <label htmlFor="fb-comment" className="sr-only">
        Feedback comment
      </label>
      <textarea
        id="fb-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a short comment (optional)"
        className="w-full p-2 border rounded mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-100"
        rows={3}
      />

      <div className="flex items-center gap-2">
        <button
          onClick={submit}
          disabled={sending}
          className="disabled:opacity-60 text-white px-3 py-2 rounded text-sm bg-[var(--color-green)] hover:bg-[var(--color-green-mid)]"
        >
          {sending ? 'Sending…' : 'Submit feedback'}
        </button>

        <button onClick={clear} className="bg-slate-100 text-slate-700 px-3 py-2 rounded text-sm">
          Clear
        </button>

        {status === 'sent' && (
          <span className="text-sm text-green-600">Thanks — your feedback was sent.</span>
        )}
        {status === 'error' && (
          <span className="text-sm text-red-600">{error ?? 'Failed to send'}</span>
        )}
      </div>
    </div>
  );
}
