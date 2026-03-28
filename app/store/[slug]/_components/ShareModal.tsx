'use client';

import { X, Copy, Share2 } from 'lucide-react';

export default function ShareModal({
  sessionUrl,
  onClose,
}: {
  sessionUrl: string;
  onClose: () => void;
}) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(sessionUrl);
    } catch {
      // ignore
    }
  }

  async function share() {
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title: 'Resume your order', url: sessionUrl });
      } catch {
        // user cancelled
      }
    } else {
      await copy();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-[90%] max-w-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Share link</h3>
          <button onClick={onClose} className="p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-sm break-words mb-4">
          <a href={sessionUrl} target="_blank" rel="noreferrer" className="text-green underline">
            {sessionUrl}
          </a>
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={copy} className="px-3 py-2 rounded border">
            <Copy className="inline-block w-4 h-4 mr-2" /> Copy
          </button>
          <button onClick={share} className="px-3 py-2 rounded bg-green text-white">
            <Share2 className="inline-block w-4 h-4 mr-2" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
