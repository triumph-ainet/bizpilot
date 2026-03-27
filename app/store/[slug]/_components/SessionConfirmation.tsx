'use client';

import React, { useState } from 'react';
import { CheckCircle, Copy, Share2 } from 'lucide-react';

export default function SessionConfirmation({
  sessionUrl,
  onOpenShare,
}: {
  sessionUrl: string;
  onOpenShare?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  function extractToken(url: string) {
    try {
      const u = new URL(url);
      return u.pathname.split('/').pop() || null;
    } catch {
      const parts = url.split('/');
      return parts[parts.length - 1] || null;
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(sessionUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  }

  async function saveEmail() {
    const token = extractToken(sessionUrl);
    if (!token || !email) return;
    setSaving(true);
    try {
      await fetch(`/api/session/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setEmail('');
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 text-sm text-ink-light">
      <div className="flex items-center justify-center gap-2">
        <CheckCircle className="w-6 h-6 text-green" />
        <div className="break-words">
          <div>You can resume your order here:</div>
          <div className="mt-1 flex items-center gap-2">
            <a
              href={sessionUrl}
              className="text-green break-all underline"
              target="_blank"
              rel="noreferrer"
            >
              {sessionUrl}
            </a>
            <button onClick={copy} className="p-1 bg-white/5 rounded">
              <Copy className="w-4 h-4" />
            </button>
            <button onClick={onOpenShare} className="p-1 bg-white/5 rounded" aria-label="Share">
              <Share2 className="w-4 h-4" />
            </button>
            {copied && <span className="text-[12px] text-green ml-2">Copied</span>}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email to receive updates (optional)"
          className="px-3 py-2 rounded-lg border border-ink-light text-sm"
        />
        <button
          onClick={saveEmail}
          disabled={saving || !email}
          className="bg-green text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
