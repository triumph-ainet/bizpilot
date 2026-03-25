'use client';

import { VendorSettings } from './types';

export default function Header({ settings }: { settings: VendorSettings }) {
  const vendorInitial = settings.businessName?.charAt(0).toUpperCase() || 'A';
  return (
    <div className="bg-green px-6 pt-14 pb-7">
      <h1 className="font-fraunces text-2xl font-extrabold text-white mb-5">Settings</h1>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-amber rounded-full flex items-center justify-center font-fraunces font-black text-2xl text-green">
          {vendorInitial}
        </div>
        <div>
          <p className="font-fraunces text-[20px] font-bold text-white">{settings.businessName}</p>
          <p className="text-white/55 text-[13px]">{settings.businessName} · Lagos</p>
        </div>
      </div>
    </div>
  );
}
