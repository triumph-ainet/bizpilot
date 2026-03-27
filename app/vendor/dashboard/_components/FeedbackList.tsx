import React from 'react';

export default function FeedbackList({ feedback }: { feedback: any[] }) {
  if (!feedback || feedback.length === 0) return <div className="text-sm text-slate-500">No feedback yet</div>;

  return (
    <div className="space-y-3">
      {feedback.map((f) => (
        <div key={f.id} className="p-3 bg-white rounded border">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium">{f.customer_identifier || 'Customer'}</div>
              <div className="text-xs text-slate-500">{new Date(f.created_at).toLocaleString()}</div>
            </div>
            <div className="text-sm font-semibold">{f.rating ?? '-'}★</div>
          </div>
          {f.comment && <p className="mt-2 text-sm text-slate-700">{f.comment}</p>}
        </div>
      ))}
    </div>
  );
}
