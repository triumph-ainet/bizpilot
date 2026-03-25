'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BottomNav } from '@/components/ui';
import { Store, Smartphone, Link, Landmark, ChartColumn, Lock } from 'lucide-react';

const SETTINGS_SECTIONS = [
  {
    items: [
      {
        icon: <Store className="w-5 h-5 text-emerald-700" />,
        bg: 'bg-emerald-50',
        label: 'Business Name',
        val: "Aisha's Drinks Store",
      },
      {
        icon: <Smartphone className="w-5 h-5 text-blue-700" />,
        bg: 'bg-blue-50',
        label: 'Phone Number',
        val: '+234 812 345 6789',
      },
      {
        icon: <Link className="w-5 h-5 text-pink-700" />,
        bg: 'bg-pink-50',
        label: 'Store Link',
        val: 'bizpilot.co/aisha-drinks',
      },
    ],
  },
  {
    items: [
      {
        icon: <Landmark className="w-5 h-5 text-purple-700" />,
        bg: 'bg-purple-50',
        label: 'Bank Account',
        val: 'GTBank · ****6789 · Verified ✓',
      },
      {
        icon: <ChartColumn className="w-5 h-5 text-yellow-700" />,
        bg: 'bg-yellow-50',
        label: 'Low Stock Threshold',
        val: 'Alert when below 5 units',
      },
    ],
  },
  {
    items: [
      {
        icon: <Lock className="w-5 h-5 text-indigo-700" />,
        bg: 'bg-indigo-50',
        label: 'Change Password',
        val: '',
      },
    ],
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  async function handleLogout() {
    setIsLoggingOut(true);
    setLogoutError('');

    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Logout failed');
      }

      router.replace('/auth/login');
      router.refresh();
    } catch (err: unknown) {
      setLogoutError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <div className="bg-green px-6 pt-14 pb-7">
        <h1 className="font-fraunces text-2xl font-extrabold text-white mb-5">Settings</h1>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber rounded-full flex items-center justify-center font-fraunces font-black text-2xl text-green">
            A
          </div>
          <div>
            <p className="font-fraunces text-[20px] font-bold text-white">Aisha Ibrahim</p>
            <p className="text-white/55 text-[13px]">Aisha&apos;s Drinks Store · Lagos</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        {SETTINGS_SECTIONS.map((section, si) => (
          <div key={si} className="bg-white rounded-2xl overflow-hidden shadow-card">
            {section.items.map((item, ii) => (
              <div
                key={item.label}
                className={`flex items-center gap-3.5 px-4 py-4 cursor-pointer hover:bg-cream transition-colors ${ii < section.items.length - 1 ? 'border-b border-cream-dark' : ''}`}
              >
                <div
                  className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-ink">{item.label}</p>
                  {item.val && <p className="text-xs text-ink-light mt-0.5 truncate">{item.val}</p>}
                </div>
                <span className="text-ink-light text-xl">›</span>
              </div>
            ))}
          </div>
        ))}

        {logoutError && (
          <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{logoutError}</p>
        )}

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full bg-white border-[1.5px] border-red-400 text-red-500 rounded-2xl py-4 font-dm font-semibold text-[15px] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? 'Logging out...' : 'Log Out'}
        </button>
      </div>

      <BottomNav active="/vendor/settings" />
    </div>
  );
}
