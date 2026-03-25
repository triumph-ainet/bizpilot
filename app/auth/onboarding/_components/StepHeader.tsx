'use client';

import { PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = ['Business', 'Products', 'Payments', 'Ready'];

export default function StepHeader({ step }: { step: number }) {
  return (
    <div className="bg-green px-6 pt-14 pb-6">
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
            <em className="text-amber not-italic">set!</em>{' '}
            <PartyPopper className="inline w-5 h-5 text-amber align-[-2px]" />
          </>
        )}
      </h1>
      <p className="text-white/55 text-[13px] mt-1.5">Step {step + 1} of {STEPS.length}</p>
    </div>
  );
}
