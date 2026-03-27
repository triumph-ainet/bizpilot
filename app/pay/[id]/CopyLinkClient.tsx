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
    <div className="bg-slate-50 p-3 rounded border border-slate-200">
      <p className="text-xs text-slate-500 mb-2">Or copy this payment link:</p>
      <div className="flex gap-2">
        <input
          readOnly
          value={paymentUrl}
          className="flex-1 rounded p-2 text-sm border border-slate-200 bg-white"
        />
        <button onClick={handleCopy} className="px-3 py-2 bg-slate-200 rounded text-sm">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
