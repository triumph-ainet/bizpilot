'use client';

import React, { useEffect, useState } from 'react';
import { Zap, Lock, Shield } from 'lucide-react';
import ChatFloating from './_components/ChatFloating';
import CatalogPanel from './_components/CatalogPanel';
import OrderForm from './_components/OrderForm';
import StoreHeader from './_components/StoreHeader';

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
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
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
      setPaymentUrl(data?.order?.paymentUrl || data.paymentUrl || null);
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
      const res = await fetch(`/api/store/${slug}/products?page=${pageToLoad}&limit=${limit}`, {
        cache: 'no-store',
      });
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
        <StoreHeader
          storeName={storeName}
          isCatalogOpen={isCatalogOpen}
          setIsCatalogOpen={setIsCatalogOpen}
          onOpenCatalog={() => loadCatalog(1)}
        />

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

        {isCatalogOpen && (
          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-4 text-white/90 max-w-4xl">
            <CatalogPanel
              loadingCatalog={loadingCatalog}
              catalogError={catalogError}
              products={products}
              page={page}
              limit={limit}
              totalCount={totalCount}
              loadCatalog={loadCatalog}
              addToOrder={addToOrder}
            />
          </div>
        )}

        <OrderForm
          slug={slug}
          storeReady={storeReady}
          vendorId={vendorId}
          order={order}
          setOrder={setOrder}
          phone={phone}
          setPhone={setPhone}
          loading={loading}
          onSubmit={handleOrder}
          sent={sent}
          setSent={setSent}
          sessionUrl={sessionUrl}
          paymentUrl={paymentUrl}
          showShareModal={showShareModal}
          setShowShareModal={setShowShareModal}
          submitError={submitError}
        />

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

      <ChatFloating vendorId={vendorId} />
    </div>
  );
}
