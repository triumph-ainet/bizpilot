import { Star } from 'lucide-react';

export default function FeedbackList({ feedback }: { feedback: any[] }) {
  if (!feedback || feedback.length === 0) return <div className="text-sm text-slate-500">No feedback yet</div>;

  return (
    <div className="space-y-4">
      {feedback.map((f) => (
        <div key={f.id} className="p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="font-semibold text-slate-900">{f.customer_identifier || 'Customer'}</div>
              <div className="text-s text-slate-400 mt-1">{new Date(f.created_at).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded">
              <span className="text-sm font-bold text-amber-700">{f.rating ?? '-'}</span>
              <Star className='w-4 h-4 fill-amber-400 text-amber-400'/>
            </div>
          </div>
          {f.comment && <p className="mt-3 text-sm text-slate-700 leading-relaxed">{f.comment}</p>}
        </div>
      ))}
    </div>
  );
}
