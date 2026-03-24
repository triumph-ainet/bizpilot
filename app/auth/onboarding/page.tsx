'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';

const STEPS = ['Business', 'Products', 'Payments', 'Ready'];
const CATEGORIES = ['🥤 Drinks & Snacks', '👗 Fashion', '🍲 Food', '📦 Other'];
const BANKS = [
  { name: 'GTBank', code: '058' },
  { name: 'Access Bank', code: '044' },
  { name: 'First Bank', code: '011' },
  { name: 'Zenith Bank', code: '057' },
  { name: 'UBA', code: '033' },
  { name: 'Opay', code: '100004' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 1 state
  const [category, setCategory] = useState('');
  const [slug, setSlug] = useState('');
  const [city, setCity] = useState('');

  // Step 2 state
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<{
    name: string;
    estimated_price: number | null;
    quantity: number | null;
  } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Step 3 state
  const [bankCode, setBankCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [verifiedName, setVerifiedName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  async function handleImageSnap(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setExtracting(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const mimeType = file.type;
      try {
        const res = await fetch('/api/products/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType }),
        });
        const data = await res.json();
        setExtracted(data);
      } catch {
        setExtracted({ name: 'Unknown Product', estimated_price: null, quantity: null });
      } finally {
        setExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  }

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
      if (!res.ok) throw new Error(data.error);
      setVerifiedName(data.accountName);
    } catch (err: unknown) {
      setVerifyError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  }

  async function handleFinish() {
    setLoading(true);
    try {
      await fetch('/api/vendors/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          slug,
          city,
          bankCode,
          bankName,
          accountNumber,
          accountName: verifiedName,
          step: 4,
        }),
      });
      router.push('/vendor/dashboard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-green px-6 pt-14 pb-6">
        {/* Step track */}
        <div className="flex gap-1.5 mb-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-300',
                i < step ? 'bg-amber' : i === step ? 'bg-white' : 'bg-white/20'
              )}
            />
          ))}
        </div>
        <h1 className="font-fraunces text-[26px] font-black text-white leading-tight">
          {step === 0 && (
            <>
              Tell us about
              <br />
              your <em className="text-amber not-italic">business</em>
            </>
          )}
          {step === 1 && (
            <>
              Add your
              <br />
              first <em className="text-amber not-italic">product</em>
            </>
          )}
          {step === 2 && (
            <>
              Where should
              <br />
              we send <em className="text-amber not-italic">payments?</em>
            </>
          )}
          {step === 3 && (
            <>
              You're all
              <br />
              <em className="text-amber not-italic">set!</em> 🎉
            </>
          )}
        </h1>
        <p className="text-white/55 text-[13px] mt-1.5">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>

      <div className="px-6 py-6 animate-fade-up">
        {/* ── STEP 1: Business details ── */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-ink-light uppercase tracking-wider">
                What do you sell?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      'rounded-xl py-3 text-center text-[13px] font-semibold border-[1.5px] transition-all',
                      category === cat
                        ? 'bg-green text-white border-green'
                        : 'bg-white border-cream-dark text-ink-mid'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-ink-light uppercase tracking-wider">
                Your store link
              </label>
              <div className="flex items-center bg-white border-[1.5px] border-cream-dark rounded-xl px-4 py-3.5 gap-2 focus-within:border-green-bright transition-colors">
                <span className="text-ink-light text-[13px] whitespace-nowrap">bizpilot.co/</span>
                <input
                  className="flex-1 text-[15px] font-dm text-ink outline-none bg-transparent"
                  placeholder="your-store-name"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                />
              </div>
            </div>

            <Input
              label="City"
              placeholder="e.g. Lagos, Abuja, Kano"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            <Button variant="amber" onClick={() => setStep(1)} disabled={!category || !slug}>
              Continue →
            </Button>
          </div>
        )}

        {/* ── STEP 2: Snap product ── */}
        {step === 1 && (
          <div className="space-y-4">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSnap}
            />

            {!imagePreview ? (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full bg-white border-2 border-dashed border-cream-dark rounded-2xl py-10 flex flex-col items-center gap-3 hover:border-green-bright hover:bg-green-bright/5 transition-all"
              >
                <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center text-3xl">
                  📸
                </div>
                <div>
                  <p className="font-semibold text-ink">Snap a photo</p>
                  <p className="text-sm text-ink-light mt-1">AI extracts name, price & quantity</p>
                </div>
              </button>
            ) : (
              <div className="relative w-full h-44 bg-white rounded-2xl overflow-hidden shadow-card flex items-center justify-center text-6xl">
                <img src={imagePreview} alt="product" className="w-full h-full object-cover" />
                {extracting && (
                  <div className="absolute inset-0 bg-green/60 flex items-end p-4">
                    <div className="bg-white/95 rounded-xl px-3 py-2 flex items-center gap-2 text-sm font-semibold text-green">
                      <Spinner className="w-3.5 h-3.5 border-t-green" />
                      AI is reading your photo...
                    </div>
                  </div>
                )}
              </div>
            )}

            {extracted && !extracting && (
              <div className="bg-white rounded-2xl p-5 border-[1.5px] border-green-bright relative shadow-card">
                <span className="absolute -top-2.5 left-5 bg-green-bright text-white text-[10px] font-bold px-3 py-0.5 rounded-full tracking-wide">
                  ✨ AI EXTRACTED
                </span>
                {[
                  { key: 'Product Name', val: extracted.name },
                  {
                    key: 'Price',
                    val: extracted.estimated_price ? `₦${extracted.estimated_price}` : 'Tap to add',
                  },
                  {
                    key: 'Quantity',
                    val: extracted.quantity ? `${extracted.quantity} units` : 'Tap to add',
                  },
                ].map((row) => (
                  <div
                    key={row.key}
                    className="flex justify-between items-center py-2.5 border-b border-cream-dark last:border-0"
                  >
                    <span className="text-xs text-ink-light">{row.key}</span>
                    <span className="text-[15px] font-semibold text-ink">{row.val}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                className="flex-1"
              >
                Retake
              </Button>
              <Button size="sm" onClick={() => setStep(2)} disabled={!extracted} className="flex-1">
                ✓ Looks right!
              </Button>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full text-center text-sm text-ink-light py-2"
            >
              Skip for now →
            </button>
          </div>
        )}

        {/* ── STEP 3: Bank details ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-card space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-ink-light uppercase tracking-wider">
                  Select Bank
                </label>
                <select
                  className="w-full bg-cream border-[1.5px] border-cream-dark rounded-xl px-4 py-3.5 font-dm text-[15px] text-ink outline-none focus:border-green-bright transition-colors"
                  value={bankCode}
                  onChange={(e) => {
                    const bank = BANKS.find((b) => b.code === e.target.value);
                    setBankCode(e.target.value);
                    setBankName(bank?.name || '');
                    setVerifiedName('');
                  }}
                >
                  <option value="">Choose your bank...</option>
                  {BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
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
                  onChange={(e) => {
                    setAccountNumber(e.target.value);
                    setVerifiedName('');
                    setVerifyError('');
                  }}
                />
                {accountNumber.length === 10 && bankCode && !verifiedName && (
                  <Button
                    size="sm"
                    variant="outline"
                    loading={verifying}
                    onClick={handleVerifyAccount}
                    className="mt-1"
                  >
                    Verify Account
                  </Button>
                )}
              </div>

              {verifyError && (
                <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{verifyError}</p>
              )}

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
              <span className="text-base">🔒</span>
              <p className="text-xs text-ink-mid leading-relaxed">
                Your payments are settled directly by Interswitch. BizPilot never holds your money.
              </p>
            </div>

            <Button onClick={() => setStep(3)} disabled={!verifiedName}>
              Confirm & Continue →
            </Button>
          </div>
        )}

        {/* ── STEP 4: Ready ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-bright to-green-mid flex items-center justify-center text-4xl mx-auto mb-4 shadow-[0_8px_32px_rgba(61,186,138,0.35)]">
                🚀
              </div>
              <h2 className="font-fraunces text-2xl font-black text-ink">Your store is live!</h2>
              <p className="text-sm text-ink-light mt-1">
                Start sharing your link and receiving orders
              </p>
            </div>

            <div className="bg-green rounded-2xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Share with customers</p>
                <p className="text-white font-semibold text-[15px] mt-0.5">
                  bizpilot.co/{slug || 'your-store'}
                </p>
              </div>
              <button className="bg-amber text-green text-xs font-bold px-3.5 py-2 rounded-lg">
                Copy
              </button>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-card space-y-3">
              <p className="text-xs font-bold text-ink-light uppercase tracking-wider">
                What happens next
              </p>
              {[
                { icon: '💬', text: 'Customer sends you an order' },
                { icon: '🤖', text: 'AI replies and sends payment link' },
                { icon: '✅', text: 'Payment confirmed, inventory updated' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 text-sm text-ink-mid">
                  <div className="w-7 h-7 bg-green-bright/12 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    {item.icon}
                  </div>
                  {item.text}
                </div>
              ))}
            </div>

            <Button variant="amber" loading={loading} onClick={handleFinish}>
              Go to My Dashboard →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
