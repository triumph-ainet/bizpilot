import React from 'react';
import { CheckCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui';
import SuggestionsWidget from '../../../components/SuggestionsWidget';
import FeedbackWidget from '../../../components/FeedbackWidget';
import SessionConfirmation from './SessionConfirmation';
import ShareModal from './ShareModal';

type Props = {
  slug: string;
  storeReady: boolean;
  vendorId?: string;
  order: string;
  setOrder: (s: string) => void;
  phone: string;
  setPhone: (s: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  sent: boolean;
  setSent: (b: boolean) => void;
  sessionUrl: string | null;
  showShareModal: boolean;
  setShowShareModal: (b: boolean) => void;
  submitError: string;
};

export default function OrderForm({
  slug,
  storeReady,
  vendorId,
  order,
  setOrder,
  phone,
  setPhone,
  loading,
  onSubmit,
  sent,
  setSent,
  sessionUrl,
  showShareModal,
  setShowShareModal,
  submitError,
}: Props) {
  if (sent && storeReady) {
    return (
      <div className="bg-white rounded-3xl p-7 shadow-card-lg text-center">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green" />
        <h2 className="font-fraunces text-xl font-bold text-ink mb-2">Order Received!</h2>
        <p className="text-sm text-ink-light leading-relaxed">
          We&apos;ve received your order and a payment link will be sent to your WhatsApp shortly.
        </p>
        {sessionUrl && (
          <>
            <SessionConfirmation
              sessionUrl={sessionUrl}
              onOpenShare={() => setShowShareModal(true)}
            />
            {showShareModal && (
              <ShareModal sessionUrl={sessionUrl} onClose={() => setShowShareModal(false)} />
            )}
          </>
        )}

        {vendorId && (
          <div className="mt-6">
            <FeedbackWidget
              vendorId={vendorId}
              orderId={null}
              customerIdentifier={`+234${phone}`}
            />
          </div>
        )}

        <button
          onClick={() => {
            setSent(false);
            setOrder('');
            setPhone('');
          }}
          className="mt-5 text-sm text-green-light font-semibold"
        >
          Place another order
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="bg-white rounded-3xl p-6 shadow-card-lg space-y-4 mb-5">
        <div>
          <h2 className="font-fraunces text-xl font-bold text-ink mb-1.5">Place Your Order</h2>
          <p className="text-[13px] text-ink-light leading-relaxed">
            Just type what you want — our AI handles the rest. Payment link will be sent to you
            instantly.
          </p>
          {vendorId && (
            <div className="mt-3">
              <SuggestionsWidget vendorId={vendorId} />
            </div>
          )}
        </div>

        <textarea
          className="w-full bg-cream border-[1.5px] border-cream-dark rounded-2xl px-4 py-3.5 font-dm text-[15px] text-ink placeholder:text-ink-light outline-none resize-none h-24 focus:border-green-bright transition-colors"
          placeholder="e.g. I want 2 Pepsi and 1 Indomie abeg..."
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          required
        />

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-ink-light uppercase tracking-wider">
            Your WhatsApp Number
          </label>
          <div className="flex gap-2.5">
            <div className="flex items-center gap-1.5 bg-cream border-[1.5px] border-cream-dark rounded-xl px-3 py-3.5 text-[15px] font-medium text-ink whitespace-nowrap">
              <Globe className="w-4 h-4" />
              +234
            </div>
            <input
              className="flex-1 bg-cream border-[1.5px] border-cream-dark rounded-xl px-4 py-3.5 font-dm text-[15px] text-ink placeholder:text-ink-light outline-none focus:border-green-bright transition-colors"
              type="tel"
              placeholder="081 234 5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <Button variant="amber" loading={loading} type="submit" disabled={!storeReady}>
          Send My Order →
        </Button>

        {submitError && (
          <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{submitError}</p>
        )}
      </div>
    </form>
  );
}
