'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, PencilLine, Sparkles, Check } from 'lucide-react';
import CameraCapture from '../_components/CameraCapture';
import { Button, Input, Spinner } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function AddProductPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'snap' | 'manual'>('snap');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', price: '', quantity: '', threshold: '5' });

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setImageFile(file);
    setExtracting(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/products/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: (reader.result as string).split(',')[1],
            mimeType: file.type,
          }),
        });
        const data = await res.json();
        setForm((f) => ({
          ...f,
          name: data.name || '',
          price: data.estimated_price?.toString() || '',
          quantity: data.quantity?.toString() || '',
        }));
      } finally {
        setExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const filePath = `product-images/${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
        const { error: uploadErr } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile, { upsert: true });
        if (uploadErr) throw new Error(uploadErr.message);

        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
        imageUrl = (urlData as any)?.publicUrl || (urlData as any)?.publicUrl || '';
      }
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          quantity: Number(form.quantity),
          low_stock_threshold: Number(form.threshold),
          image_url: imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      router.push('/vendor/catalog');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-green px-6 pt-14 pb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/60 text-sm mb-4"
        >
          ‹ Back to Catalog
        </button>
        <h1 className="font-fraunces text-2xl font-extrabold text-white">Add Product</h1>
      </div>

      <div className="px-6 py-5 space-y-4 pb-10">
        {/* Mode toggle */}
        <div className="bg-white rounded-2xl p-1.5 grid grid-cols-2 gap-1 shadow-card">
          {(['snap', 'manual'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all',
                mode === m ? 'bg-green text-white shadow-card' : 'text-ink-light'
              )}
            >
              {m === 'snap' ? (
                <>
                  <Camera className="w-4 h-4" /> Snap Photo
                </>
              ) : (
                <>
                  <PencilLine className="w-4 h-4" /> Type Manually
                </>
              )}
            </button>
          ))}
        </div>

        {/* Image area */}
        {mode === 'snap' && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImage}
            />
            {imagePreview ? (
              <div className="relative w-full h-44 bg-white rounded-2xl overflow-hidden shadow-card flex items-center justify-center">
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
            ) : (
              <>
                {/* Choice buttons: Camera or Upload */}
                {!showCamera ? (
                  <div className="w-full bg-white rounded-2xl p-4 flex flex-col gap-3 items-center shadow-card">
                    <div className="w-full grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowCamera(true)}
                        className="flex-1 bg-green text-white rounded-xl py-4 flex flex-col items-center justify-center gap-2 font-semibold"
                      >
                        <Camera className="w-5 h-5" />
                        Use Camera
                      </button>
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="flex-1 bg-white border border-ink-light rounded-xl py-4 flex flex-col items-center justify-center gap-2 font-semibold text-ink-light"
                      >
                        <span className="text-lg">📁</span>
                        Upload Photo
                      </button>
                    </div>
                    <div className="text-sm text-ink-light">Tip: Camera works best for single product images.</div>
                  </div>
                ) : (
                  <div className="w-full">
                    <CameraCapture onCapture={(blob, dataUrl) => {
                      setShowCamera(false);
                      setImageFile(blob as File);
                      setImagePreview(dataUrl);
                      // trigger extraction using same logic as file input
                      const reader = new FileReader();
                      setExtracting(true);
                      reader.onload = async () => {
                        try {
                          const res = await fetch('/api/products/extract', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              imageBase64: (reader.result as string).split(',')[1],
                              mimeType: 'image/jpeg',
                            }),
                          });
                          const data = await res.json();
                          setForm((f) => ({
                            ...f,
                            name: data.name || '',
                            price: data.estimated_price?.toString() || '',
                            quantity: data.quantity?.toString() || '',
                          }));
                        } finally {
                          setExtracting(false);
                        }
                      };
                      reader.readAsDataURL(blob as Blob);
                    }} />
                    <div className="text-center mt-2">
                      <button onClick={() => setShowCamera(false)} className="text-sm text-ink-light">Switch to upload</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Extracted / manual form */}
        {(form.name || mode === 'manual') && (
          <div className="bg-white rounded-2xl p-5 border-[1.5px] border-green-bright relative shadow-card space-y-4">
            {mode === 'snap' && (
              <span className="absolute -top-2.5 left-5 bg-green-bright text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI EXTRACTED - tap to edit
                </span>
              </span>
            )}
            <Input
              label="Product Name"
              placeholder="e.g. Pepsi 60cl"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Price (₦)"
                type="number"
                placeholder="300"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
              <Input
                label="Quantity"
                type="number"
                placeholder="24"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              />
            </div>
            <Input
              label="Low Stock Alert (units)"
              type="number"
              placeholder="5"
              value={form.threshold}
              onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))}
            />
          </div>
        )}

        {form.name && (
          <Button variant="amber" loading={saving} onClick={handleSave}>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Add to Catalog
            </span>
          </Button>
        )}

        {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>}

        {mode === 'snap' && imagePreview && (
          <button
            onClick={() => {
              setImagePreview(null);
              setForm({ name: '', price: '', quantity: '', threshold: '5' });
            }}
            className="w-full text-center text-sm text-ink-light py-2"
          >
            Retake photo
          </button>
        )}
      </div>
    </div>
  );
}
