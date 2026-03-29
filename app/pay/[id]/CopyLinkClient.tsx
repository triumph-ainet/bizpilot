'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui';

export default function CopyLinkClient({ paymentUrl }: { paymentUrl: string }) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
      showToast('Link copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast('Failed to copy link', 'error');
    }
  };

  return (
    <div className="rounded-xl border border-[var(--color-cream-dark)] bg-white p-3 sm:p-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-light)]">
        Or copy your payment link
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={paymentUrl}
          aria-label="Payment URL"
          className="flex-1 rounded-lg border border-[var(--color-cream-dark)] bg-[var(--color-cream)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-green-light)]"
        />
        <button
          onClick={handleCopy}
          className="rounded-lg border border-[var(--color-cream-dark)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-green)] transition-colors hover:bg-[var(--color-cream)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-green-bright)] focus-visible:ring-offset-2"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
