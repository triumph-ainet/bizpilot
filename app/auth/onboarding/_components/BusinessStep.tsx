'use client';

import { useEffect, useState } from 'react';
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
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [slugMessage, setSlugMessage] = useState('');

  useEffect(() => {
    const candidate = slug.trim();

    if (!candidate) {
      setSlugStatus('idle');
      setSlugMessage('');
      return;
    }

    if (candidate.length < 3) {
      setSlugStatus('idle');
      setSlugMessage('Store link must be at least 3 characters');
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setSlugStatus('checking');
      setSlugMessage('Checking availability...');

      try {
        const res = await fetch(`/api/vendors/onboarding?slug=${encodeURIComponent(candidate)}`, {
          signal: controller.signal,
        });
        const data = await res.json();

        if (res.ok && data.available) {
          setSlugStatus('available');
          setSlugMessage('This store link is available');
          return;
        }

        setSlugStatus('taken');
        setSlugMessage(data?.error || 'This store link is already taken');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setSlugStatus('idle');
        setSlugMessage('Could not check link availability. Please try again.');
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [slug]);

  function normalizeSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
  }

  function handleContinue() {
    if (slugStatus !== 'available') return;
    onNext();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-ink-light uppercase tracking-wider">
          What do you sell?
        </label>
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
        <label className="text-xs font-semibold text-ink-light uppercase tracking-wider">
          Your store link
        </label>
        <div className="flex items-center bg-white border-[1.5px] border-cream-dark rounded-xl px-4 py-3.5 gap-2 focus-within:border-green-bright transition-colors">
          <span className="text-ink-light text-[13px] whitespace-nowrap">bizpilot.co/</span>
          <input
            className="flex-1 text-[15px] font-dm text-ink outline-none bg-transparent"
            placeholder="your-store-name"
            value={slug}
            onChange={(e) => setSlug(normalizeSlug(e.target.value))}
          />
        </div>
        {slugMessage && (
          <p
            className={cn(
              'text-xs mt-1',
              slugStatus === 'available' ? 'text-green-bright' : 'text-red-500'
            )}
          >
            {slugMessage}
          </p>
        )}
      </div>

      <Input
        label="City"
        placeholder="e.g. Lagos, Abuja, Kano"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <Button
        variant="amber"
        onClick={handleContinue}
        disabled={!category || slugStatus !== 'available'}
      >
        Continue →
      </Button>
    </div>
  );
}
