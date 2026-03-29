'use client';

import { Sparkles, Package } from 'lucide-react';
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
      return `₦ ${Math.round(n)}`;
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow p-4">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="p-2 rounded"
          style={{ backgroundColor: 'var(--color-green-light)', color: 'var(--color-green)' }}
        >
          <Sparkles className="h-5 w-5" />
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
        className="w-full p-2 border rounded mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-green-light)]"
      />

      <div className="flex gap-2 mb-3">
        <button
          onClick={ask}
          disabled={loading}
          className="disabled:opacity-60 text-white px-3 py-2 rounded text-sm bg-[var(--color-green)] hover:bg-[var(--color-green-mid)]"
          style={{ transition: 'background-color 150ms' }}
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
                      <Package className="h-6 w-6" />
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
