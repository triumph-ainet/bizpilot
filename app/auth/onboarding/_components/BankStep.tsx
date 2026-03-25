'use client';

import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { Input, Button } from '@/components/ui';

export default function BankStep({
  bankCode,
  setBankCode,
  bankName,
  setBankName,
  accountNumber,
  setAccountNumber,
  verifiedName,
  setVerifiedName,
  verifying,
  setVerifying,
  verifyError,
  setVerifyError,
  onNext,
}: any) {
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoadingBanks(true);
    fetch('/api/payment/banks')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setBanks(data?.data || []);
      })
      .catch(() => setBanks([]))
      .finally(() => mounted && setLoadingBanks(false));
    return () => {
      mounted = false;
    };
  }, []);

  async function handleVerifyAccount() {
    if (!accountNumber || !bankCode) return;
    setVerifying(true);
    setVerifyError('');
    try {
      const res = await fetch('/api/vendors/verify-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, bankCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      setVerifiedName(data.accountName || data?.account_name || '');
    } catch (err: any) {
      setVerifyError(err?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-card space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-ink-light uppercase tracking-wider">Select Bank</label>
          <select
            className="w-full bg-cream border-[1.5px] border-cream-dark rounded-xl px-4 py-3.5 font-dm text-[15px] text-ink outline-none focus:border-green-bright transition-colors"
            value={bankCode}
            onChange={(e) => {
              const b = banks.find((x) => x.code === e.target.value);
              setBankCode(e.target.value);
              setBankName(b?.name || '');
              setVerifiedName('');
            }}
          >
            <option value="">{loadingBanks ? 'Loading banks...' : 'Choose your bank...'}</option>
            {banks.map((b) => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Input
            label="Account Number"
            type="text"
            placeholder="10-digit account number"
            value={accountNumber}
            maxLength={10}
            onChange={(e) => { setAccountNumber(e.target.value); setVerifiedName(''); setVerifyError(''); }}
          />
          {accountNumber.length === 10 && bankCode && !verifiedName && (
            <Button size="sm" variant="outline" loading={verifying} onClick={handleVerifyAccount} className="mt-1">Verify Account</Button>
          )}
        </div>

        {verifyError && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{verifyError}</p>}

        {verifiedName && (
          <div className="bg-green-bright/10 border border-green-bright/30 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-green-bright text-xl">✓</span>
            <div>
              <p className="font-bold text-sm text-ink">{verifiedName}</p>
              <p className="text-xs text-ink-light">Account verified via Interswitch</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-green/6 rounded-xl p-3.5 flex gap-2.5 items-start">
        <span className="text-base"><Lock className="w-5 h-5" /></span>
        <p className="text-xs text-ink-mid leading-relaxed">Your payments are settled directly by Interswitch. BizPilot never holds your money.</p>
      </div>

      <Button onClick={onNext} disabled={!verifiedName}>Confirm & Continue →</Button>

      <button onClick={onNext} className="w-full text-center text-sm text-ink-light py-2">Skip for now, set up in Settings later →</button>
    </div>
  );
}
