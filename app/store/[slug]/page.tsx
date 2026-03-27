'use client';

import React, { useEffect, useState } from 'react';
import { Lock, Zap, Shield, CheckCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui';
import ChatFloating from './_components/ChatFloating';

export default function StorePage({ params }: { params: { slug: string } }) {
  const { slug } = (React as any).use(params);
  const [storeName, setStoreName] = useState('Vendor Store');
  const [vendorId, setVendorId] = useState<string | undefined>(undefined);
  const [storeReady, setStoreReady] = useState(false);
  const [storeError, setStoreError] = useState('');
  const [order, setOrder] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [emailForSession, setEmailForSession] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function loadStore() {
      setStoreReady(false);
      setStoreError('');
      try {
        const res = await fetch(`/api/store/${slug}`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Store not found');
        setStoreName(data.businessName || 'Vendor Store');
        setVendorId(data.id);
        setStoreReady(true);
      } catch (err: unknown) {
        setStoreError(err instanceof Error ? err.message : 'Store not found');
      }
    }

    loadStore();
  }, [slug]);

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/messages/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'sim_chat',
          vendorId: slug,
          senderId: `+234${phone}`,
          text: order,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit order');

      setSent(true);
      setSessionUrl(data.sessionUrl || null);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Could not submit order');
    } finally {
      setLoading(false);
    }
  }

  async function loadCatalog(pageToLoad = 1) {
    setLoadingCatalog(true);
    setCatalogError('');
    try {
      const res = await fetch(`/api/store/${slug}/products?page=${pageToLoad}&limit=${limit}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load catalog');
      setProducts(data.products || []);
      setTotalCount(data.count || 0);
      setPage(pageToLoad);
    } catch (err: unknown) {
      setCatalogError(err instanceof Error ? err.message : 'Failed to load catalog');
    } finally {
      setLoadingCatalog(false);
    }
  }

  function addToOrder(p: any) {
    const line = `1 x ${p.name}`;
    setOrder((prev) => (prev && prev.trim() ? prev + `\n${line}` : line));
  }

  return (
    <div className="min-h-screen bg-green relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(61,186,138,0.2),transparent_50%),radial-gradient(circle_at_20%_80%,rgba(245,166,35,0.15),transparent_50%)]" />

      <div className="relative px-7 pt-16 pb-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-white/80 mb-5 tracking-wider uppercase">
          <Zap className="w-4 h-4" /> Powered by BizPilot
        </div>

        <h1 className="font-fraunces text-[34px] font-black text-white leading-tight mb-2">
          {storeName}
        </h1>
        <p className="text-white/55 text-sm mb-9">
          Lagos · Fast delivery · Orders processed automatically
        </p>

        <div className="mb-6">
          <button
            onClick={async () => {
              const willOpen = !isCatalogOpen;
              setIsCatalogOpen(willOpen);
              if (willOpen) {
                await loadCatalog(1);
              }
            }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-white/15 transition"
          >
            Show Catalog
          </button>
        </div>

        {!storeReady && !storeError && (
          <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white/80 text-sm mb-5">
            Loading store...
          </div>
        )}

        {storeError && (
          <div className="bg-red-50 rounded-2xl px-4 py-3 text-red-600 text-sm mb-5">
            {storeError}
          </div>
        )}

        {sent && storeReady ? (
          <div className="bg-white rounded-3xl p-7 shadow-card-lg text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green" />
            <h2 className="font-fraunces text-xl font-bold text-ink mb-2">Order Received!</h2>
            <p className="text-sm text-ink-light leading-relaxed">
              We&apos;ve received your order and a payment link will be sent to your WhatsApp
              shortly.
            </p>
            {sessionUrl && (
              <div className="mt-4 text-sm text-ink-light">
                <p className="break-words">You can resume your order here:</p>
                <a href={sessionUrl} className="text-green break-all" target="_blank" rel="noreferrer">
                  {sessionUrl}
                </a>

                <div className="mt-3 flex items-center justify-center gap-2">
                  <input
                    value={emailForSession}
                    onChange={(e) => setEmailForSession(e.target.value)}
                    placeholder="Enter email to receive updates (optional)"
                    className="px-3 py-2 rounded-lg border border-ink-light text-sm"
                  />
                  <button
                    onClick={async () => {
                      if (!sessionUrl) return;
                      const token = sessionUrl.split('/').pop();
                      if (!token || !emailForSession) return;
                      try {
                        await fetch(`/api/session/${token}`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: emailForSession }),
                        });
                        setEmailForSession('');
                      } catch {
                        // ignore
                      }
                    }}
                    className="bg-green text-white px-3 py-2 rounded-lg text-sm"
                  >
                    Save
                  </button>
                </div>
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
        ) : (
          <form onSubmit={handleOrder}>
            <div className="bg-white rounded-3xl p-6 shadow-card-lg space-y-4 mb-5">
              <div>
                <h2 className="font-fraunces text-xl font-bold text-ink mb-1.5">
                  Place Your Order
                </h2>
                <p className="text-[13px] text-ink-light leading-relaxed">
                  Just type what you want — our AI handles the rest. Payment link will be sent to
                  you instantly.
                </p>
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
        )}

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-6">
          {[
            { icon: <Shield />, text: 'Secure payments' },
            { icon: <Zap />, text: 'Instant confirmation' },
            { icon: <Lock />, text: 'Interswitch powered' },
          ].map((t) => (
            <div key={t.text} className="flex items-center gap-1.5 text-xs text-white/55">
              <span>{t.icon}</span>
              <span>{t.text}</span>
            </div>
          ))}
        </div>
        </div>

        {isCatalogOpen && (
          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-4 text-white/90 max-w-4xl">
            {loadingCatalog ? (
              <div className="text-sm">Loading catalog...</div>
            ) : catalogError ? (
              <div className="text-sm text-red-400">{catalogError}</div>
            ) : products.length === 0 ? (
              <div className="text-sm">No products found.</div>
            ) : (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {products.map((p) => (
                    <div key={p.id} className="bg-white/6 rounded-xl p-3 flex flex-col">
                      <div className="h-28 mb-3 bg-white/5 rounded-md overflow-hidden flex items-center justify-center">
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image_url} alt={p.name} className="object-cover w-full h-full" />
                        ) : (
                          <div className="text-xs text-white/60">No image</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white/95">{p.name}</div>
                        <div className="text-xs text-white/60">₦{p.price}</div>
                        <div className="text-xs text-white/60">Qty: {p.quantity}</div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <Button variant="amber" size="sm" onClick={() => addToOrder(p)} disabled={p.quantity <= 0}>
                          Add
                        </Button>
                        <div className="text-xs text-white/70">{p.quantity <= 0 ? 'Out of stock' : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-white/75">
                  <div>Showing {Math.min(page * limit, totalCount)} of {totalCount}</div>
                  <div className="flex gap-2">
                    <button onClick={() => loadCatalog(page - 1)} disabled={page <= 1} className="px-3 py-1 bg-white/10 rounded-lg text-sm">Prev</button>
                    <button onClick={() => loadCatalog(page + 1)} disabled={page >= Math.ceil(totalCount / limit)} className="px-3 py-1 bg-white/10 rounded-lg text-sm">Next</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      <ChatFloating vendorId={vendorId} />
    </div>
  );
}
