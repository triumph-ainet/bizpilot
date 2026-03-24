'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { Logo, Button, Input } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      router.push('/vendor/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-green relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(61,186,138,0.15),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(245,166,35,0.1),transparent_50%)]" />
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border border-white/6" />

      <div className="relative px-7 pt-14 pb-10 flex flex-col min-h-screen">
        <Logo />

        <div className="mt-12 mb-10">
          <h1 className="font-fraunces text-[36px] font-black text-white leading-[1.15]">
            Welcome <em className="text-amber not-italic">back.</em>
          </h1>
          <p className="text-white/55 text-sm mt-2">Sign in to manage your store.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl p-7 shadow-card-lg space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-ink-light uppercase tracking-wider">
                Phone Number
              </label>
              <div className="flex gap-2.5">
                <div className="flex items-center gap-1.5 bg-cream border-[1.5px] border-cream-dark rounded-xl px-3 py-3.5 text-[15px] font-medium text-ink text-center whitespace-nowrap">
                  <Globe className="w-4 h-4" />
                  +234
                </div>
                <input
                  className="flex-1 bg-cream border-[1.5px] border-cream-dark rounded-xl px-4 py-3.5 font-dm text-[15px] text-ink placeholder:text-ink-light outline-none focus:border-green-bright transition-colors"
                  type="tel"
                  placeholder="081 234 5678"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  required
                />
              </div>
            </div>

            <Input
              label="Password"
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />

            {error && (
              <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>
            )}

            <Button loading={loading} type="submit">
              Sign In →
            </Button>

            <p className="text-center text-sm text-ink-light">
              Forgot password?{' '}
              <span className="text-green-light font-semibold cursor-pointer">Reset it</span>
            </p>
          </div>
        </form>

        <p className="text-center mt-5 text-sm text-white/50">
          New here?{' '}
          <a href="/auth/register" className="text-amber font-semibold">
            Create your store
          </a>
        </p>
      </div>
    </div>
  );
}
