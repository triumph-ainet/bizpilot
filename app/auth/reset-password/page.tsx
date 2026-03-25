'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo, Button, Input, useToast } from '@/components/ui';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!token) throw new Error('Missing reset token');
      if (form.password.length < 8) throw new Error('Password must be at least 8 characters');
      if (form.password !== form.confirmPassword) throw new Error('Passwords do not match');

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: form.password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not reset password');

      showToast('Password updated successfully. Please sign in.', 'success');
      router.push(data.redirectTo || '/auth/login');
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
            Choose a new <em className="text-amber not-italic">password.</em>
          </h1>
          <p className="text-white/55 text-sm mt-2">
            Use at least 8 characters for better security.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl p-7 shadow-card-lg space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="Enter a new password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your new password"
              value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              required
            />

            {error && (
              <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>
            )}

            <Button loading={loading} type="submit">
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
