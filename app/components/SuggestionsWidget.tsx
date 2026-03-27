'use client';
import { useState } from 'react';

export default function SuggestionsWidget({ vendorId }: { vendorId: string }) {
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  async function ask() {
    if (!intent) return;
    setLoading(true);
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: vendorId, intent }),
      });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (e) {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded shadow p-4">
      <h3 className="text-sm font-semibold mb-2">Need help choosing?</h3>
      <input value={intent} onChange={(e)=>setIntent(e.target.value)} placeholder="Describe what you want..." className="w-full p-2 border rounded mb-3 text-sm" />
      <div className="flex gap-2 mb-3">
        <button onClick={ask} className="bg-emerald-600 text-white px-3 py-2 rounded">Suggest</button>
        {loading && <span className="text-sm text-slate-500">Thinking...</span>}
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((s, idx) => (
            <div key={idx} className="p-2 border rounded bg-slate-50 flex justify-between items-center">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-slate-500">{s.short_reason}</div>
              </div>
              <div className="text-sm font-semibold">₦{s.estimated_price}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
