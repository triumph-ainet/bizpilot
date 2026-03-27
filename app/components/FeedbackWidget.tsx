'use client';
import { useState } from 'react';

export default function FeedbackWidget({ vendorId, orderId, customerIdentifier }: { vendorId: string; orderId?: string | null; customerIdentifier?: string | null }) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function submit() {
    setStatus('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: vendorId, order_id: orderId, customer_identifier: customerIdentifier, rating, comment }),
      });
      const data = await res.json();
      if (data.success) setStatus('sent');
      else setStatus('error');
    } catch (e) {
      setStatus('error');
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded shadow p-4">
      <h3 className="text-sm font-semibold mb-2">Rate your experience</h3>
      <div className="flex items-center gap-2 mb-3">
        {[1,2,3,4,5].map((n)=> (
          <button key={n} onClick={()=>setRating(n)} className={`px-2 py-1 rounded ${rating===n? 'bg-amber-300':'bg-slate-100'}`}>{n}★</button>
        ))}
      </div>
      <textarea value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="Leave a short comment (optional)" className="w-full p-2 border rounded mb-3 text-sm" />
      <div className="flex items-center gap-2">
        <button onClick={submit} className="bg-blue-600 text-white px-3 py-2 rounded">Submit</button>
        {status === 'sending' && <span className="text-sm text-slate-500">Sending...</span>}
        {status === 'sent' && <span className="text-sm text-green-600">Thanks for the feedback!</span>}
        {status === 'error' && <span className="text-sm text-red-600">Failed to send</span>}
      </div>
    </div>
  );
}
