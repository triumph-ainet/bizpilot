'use client';

import { useState } from 'react';
import { Logo, Button, Input, useToast } from '@/components/ui';

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successLink, setSuccessLink] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessLink('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send reset link');

      setSuccessLink(data.resetUrl || '');
      showToast('If the account exists, a reset link is ready.', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-green relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(61,186,138,0.15),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(245,166,35,0.1),transparent_50%)]" />
      <div className="relative px-7 pt-14 pb-10 flex flex-col min-h-screen">
        <Logo />

        <div className="mt-12 mb-10">
          <h1 className="font-fraunces text-[36px] font-black text-white leading-[1.15]">
            Reset your <em className="text-amber not-italic">password.</em>
          </h1>
          <p className="text-white/55 text-sm mt-2">Enter your email to get a reset link.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl p-7 shadow-card-lg space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && (
              <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>
            )}

            {successLink && (
              <div className="bg-green-50 rounded-xl px-4 py-3 text-sm text-green-900">
                <p className="font-semibold">Reset link generated:</p>
                <a className="underline break-all" href={successLink}>
                  {successLink}
                </a>
              </div>
            )}

            <Button loading={loading} type="submit">
              Send Reset Link
            </Button>
          </div>
        </form>

        <p className="text-center mt-5 text-sm text-white/50">
          Remember your password?{' '}
          <a href="/auth/login" className="text-amber font-semibold">
            Back to login
          </a>
        </p>
      </div>
    </div>
  );
}
