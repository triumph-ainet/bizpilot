'use client';

import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';

export default function ProductStep({
  extracted,
  setExtracted,
  onNext,
}: {
  extracted: { name: string; estimated_price: number | null; quantity: number | null } | null;
  setExtracted: (v: any) => void;
  onNext: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);

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

  return (
    <div className="space-y-4">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSnap} />

      {!imagePreview ? (
        <button onClick={() => fileRef.current?.click()} className="w-full bg-white border-2 border-dashed border-cream-dark rounded-2xl py-10 flex flex-col items-center gap-3 hover:border-green-bright hover:bg-green-bright/5 transition-all">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center">
            <Camera className="w-8 h-8 text-ink-light" />
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
          <span className="absolute -top-2.5 left-5 bg-green-bright text-white text-[10px] font-bold px-3 py-0.5 rounded-full tracking-wide">✨ AI EXTRACTED</span>
          {[
            { key: 'Product Name', val: extracted.name },
            { key: 'Price', val: extracted.estimated_price ? `₦${extracted.estimated_price}` : 'Tap to add' },
            { key: 'Quantity', val: extracted.quantity ? `${extracted.quantity} units` : 'Tap to add' },
          ].map((row) => (
            <div key={row.key} className="flex justify-between items-center py-2.5 border-b border-cream-dark last:border-0">
              <span className="text-xs text-ink-light">{row.key}</span>
              <span className="text-[15px] font-semibold text-ink">{row.val}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="flex-1">Retake</Button>
        <Button size="sm" onClick={onNext} disabled={!extracted} className="flex-1">✓ Looks right!</Button>
      </div>

      <button onClick={onNext} className="w-full text-center text-sm text-ink-light py-2">Skip for now →</button>
    </div>
  );
}
