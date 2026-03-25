'use client';

import { Input, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Drinks & Snacks', 'Fashion', 'Food', 'Other'];

export default function BusinessStep({
  category,
  setCategory,
  slug,
  setSlug,
  city,
  setCity,
  onNext,
}: {
  category: string;
  setCategory: (s: string) => void;
  slug: string;
  setSlug: (s: string) => void;
  city: string;
  setCity: (s: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-ink-light uppercase tracking-wider">What do you sell?</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'rounded-xl py-3 text-center text-[13px] font-semibold border-[1.5px] transition-all',
                category === cat
                  ? 'bg-green text-white border-green'
                  : 'bg-white border-cream-dark text-ink-mid'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-ink-light uppercase tracking-wider">Your store link</label>
        <div className="flex items-center bg-white border-[1.5px] border-cream-dark rounded-xl px-4 py-3.5 gap-2 focus-within:border-green-bright transition-colors">
          <span className="text-ink-light text-[13px] whitespace-nowrap">bizpilot.co/</span>
          <input
            className="flex-1 text-[15px] font-dm text-ink outline-none bg-transparent"
            placeholder="your-store-name"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
          />
        </div>
      </div>

      <Input label="City" placeholder="e.g. Lagos, Abuja, Kano" value={city} onChange={(e) => setCity(e.target.value)} />

      <Button variant="amber" onClick={onNext} disabled={!category || !slug}>Continue →</Button>
    </div>
  );
}
