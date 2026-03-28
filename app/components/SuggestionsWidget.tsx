'use client';

import { useState } from 'react';

type Suggestion = {
  id?: string | number;
  name: string;
  short_reason?: string;
  estimated_price?: number | string;
  image_url?: string;
};

export default function SuggestionsWidget({ vendorId }: { vendorId: string }) {
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function ask() {
    if (!intent.trim()) return;
    setLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: vendorId, intent }),
      });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (e) {
      setError('Could not fetch suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setIntent('');
    setSuggestions([]);
    setError(null);
  }

  function formatPrice(p?: number | string) {
    if (p == null) return '';
    const n = typeof p === 'string' ? parseFloat(p) : p;
    if (Number.isNaN(n)) return '';
    try {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `₦${Math.round(n)}`;
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded shadow p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-emerald-50 rounded text-emerald-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l.286.88a1 1 0 00.95.69h.927c.969 0 1.371 1.24.588 1.81l-.75.548a1 1 0 00-.36 1.118l.287.88c.3.92-.755 1.688-1.538 1.118l-.75-.548a1 1 0 00-1.176 0l-.75.548c-.783.57-1.838-.198-1.539-1.118l.287-.88a1 1 0 00-.36-1.118l-.75-.548C3.103 6.737 3.505 5.497 4.474 5.497h.927a1 1 0 00.95-.69l.286-.88z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Need help choosing?</h3>
          <p className="text-xs text-slate-500">
            Describe what you want and we’ll suggest products that fit.
          </p>
        </div>
      </div>

      <label htmlFor="intent" className="sr-only">
        Describe what you want
      </label>
      <input
        id="intent"
        value={intent}
        onChange={(e) => setIntent(e.target.value)}
        placeholder="e.g. affordable running shoes for wide feet"
        className="w-full p-2 border rounded mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
      />

      <div className="flex gap-2 mb-3">
        <button
          onClick={ask}
          disabled={loading}
          className="bg-emerald-600 disabled:opacity-60 text-white px-3 py-2 rounded text-sm"
        >
          {loading ? 'Thinking…' : 'Suggest'}
        </button>
        <button onClick={clear} className="bg-slate-100 text-slate-700 px-3 py-2 rounded text-sm">
          Clear
        </button>
      </div>

      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}

      <div aria-live="polite">
        {loading && <div className="text-sm text-slate-500">Searching for suggestions…</div>}

        {!loading && !error && intent.trim() !== '' && suggestions.length === 0 && (
          <div className="text-sm text-slate-500">
            No suggestions found — try a different description.
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-2">
            {suggestions.map((s, idx) => (
              <div
                key={s.id ?? idx}
                className="p-3 border rounded bg-slate-50 flex items-center gap-3"
              >
                <div className="w-12 h-12 bg-white rounded overflow-hidden flex-shrink-0">
                  {s.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.image_url} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                      📦
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{s.name}</div>
                  {s.short_reason && (
                    <div className="text-xs text-slate-500 truncate">{s.short_reason}</div>
                  )}
                </div>

                <div className="text-sm font-semibold text-slate-800">
                  {formatPrice(s.estimated_price)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
