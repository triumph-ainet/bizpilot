'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { StockBar, Button, Input, Spinner, useToast } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import CameraCapture from './CameraCapture';
import { Product } from '@/lib/types';

export default function ProductCard({
  product,
  onDeleted,
  onUpdated,
}: {
  product: Product;
  onDeleted: (id: string) => void;
  onUpdated: (p: Product) => void;
}) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: product.name,
    price: String(product.price),
    quantity: String(product.quantity),
    threshold: String(product.low_stock_threshold),
    imagePreview: product.image_url || null,
    imageFile: null as File | Blob | null,
  });

  async function handleDelete() {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${product.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      onDeleted(product.id);
      toast.showToast('Product deleted', 'success');
    } catch (err: unknown) {
      toast.showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      let imageUrl = form.imagePreview;
      if (form.imageFile) {
        const fileName = `product-images/${Date.now()}_${product.id}.jpg`;
        const { error: uploadErr } = await supabase.storage
          .from('product-images')
          .upload(fileName, form.imageFile as Blob, { upsert: true });
        if (uploadErr) throw new Error(uploadErr.message);
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
        imageUrl = (urlData as any)?.publicUrl || imageUrl;
      }

      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
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
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      onUpdated(data);
      setEditing(false);
      toast.showToast('Product updated', 'success');
    } catch (err: unknown) {
      toast.showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card transition-transform">
      <div className="h-24 flex items-center justify-center bg-emerald-50 overflow-hidden">
        {form.imagePreview ? (
          <img
            src={String(form.imagePreview)}
            alt={form.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-fraunces font-black text-2xl text-green-light">
            {product.name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>

      <div className="p-3">
        {!editing ? (
          <>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-[13px] text-ink leading-tight">{product.name}</p>
                <p className="font-fraunces font-bold text-[17px] text-green-light mt-1">
                  ₦{Number(product.price).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => setEditing(true)} className="text-ink-light">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={handleDelete} className="text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <StockBar quantity={product.quantity} threshold={product.low_stock_threshold} />
          </>
        ) : (
          <div className="space-y-3">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Price"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <Input
                label="Quantity"
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
            <Input
              label="Low stock threshold"
              type="number"
              value={form.threshold}
              onChange={(e) => setForm({ ...form, threshold: e.target.value })}
            />

            <div className="space-y-2">
              <div className="text-sm text-ink-light">Replace image (camera or file)</div>
              <CameraCapture
                onCapture={(blob, dataUrl) =>
                  setForm({ ...form, imageFile: blob, imagePreview: dataUrl })
                }
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-white border-2 border-cream-dark rounded-2xl py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-amber text-green rounded-2xl py-2 font-semibold"
                >
                  {saving ? <Spinner className="w-4 h-4" /> : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
