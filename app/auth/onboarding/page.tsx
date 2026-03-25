'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StepHeader from './_components/StepHeader';
import BusinessStep from './_components/BusinessStep';
import ProductStep from './_components/ProductStep';
import BankStep from './_components/BankStep';
import ReadyStep from './_components/ReadyStep';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [category, setCategory] = useState('');
  const [slug, setSlug] = useState('');
  const [city, setCity] = useState('');

  // Step 2
  const [extracted, setExtracted] = useState<any | null>(null);

  // Step 3
  const [bankCode, setBankCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [verifiedName, setVerifiedName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  async function handleFinish() {
    setLoading(true);
    try {
      const res = await fetch('/api/vendors/onboarding', {
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
      if (!res.ok) throw new Error('Failed to complete onboarding');
      router.push('/vendor/dashboard');
    } catch {
      setVerifyError('Could not complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <StepHeader step={step} />

      <div className="px-6 py-6 animate-fade-up">
        {step === 0 && (
          <BusinessStep
            category={category}
            setCategory={setCategory}
            slug={slug}
            setSlug={setSlug}
            city={city}
            setCity={setCity}
            onNext={() => setStep(1)}
          />
        )}

        {step === 1 && (
          <ProductStep
            extracted={extracted}
            setExtracted={setExtracted}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <BankStep
            bankCode={bankCode}
            setBankCode={setBankCode}
            bankName={bankName}
            setBankName={setBankName}
            accountNumber={accountNumber}
            setAccountNumber={setAccountNumber}
            verifiedName={verifiedName}
            setVerifiedName={setVerifiedName}
            verifying={verifying}
            setVerifying={setVerifying}
            verifyError={verifyError}
            setVerifyError={setVerifyError}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && <ReadyStep slug={slug} loading={loading} onFinish={handleFinish} />}
      </div>
    </div>
  );
}
