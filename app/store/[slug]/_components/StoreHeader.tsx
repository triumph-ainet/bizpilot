import React from 'react';
import { Zap } from 'lucide-react';

type Props = {
  storeName: string;
  isCatalogOpen: boolean;
  setIsCatalogOpen: (b: boolean) => void;
  onOpenCatalog: () => Promise<void>;
};

export default function StoreHeader({
  storeName,
  isCatalogOpen,
  setIsCatalogOpen,
  onOpenCatalog,
}: Props) {
  return (
    <>
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
            if (willOpen) await onOpenCatalog();
          }}
          className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-white/15 transition"
        >
          Show Catalog
        </button>
      </div>
    </>
  );
}
