import { Button } from '@/components/ui';

type Props = {
  loadingCatalog: boolean;
  catalogError: string;
  products: any[];
  page: number;
  limit: number;
  totalCount: number;
  loadCatalog: (p: number) => void;
  addToOrder: (p: any) => void;
};

export default function CatalogPanel({
  loadingCatalog,
  catalogError,
  products,
  page,
  limit,
  totalCount,
  loadCatalog,
  addToOrder,
}: Props) {
  if (loadingCatalog) return <div className="text-sm">Loading catalog...</div>;
  if (catalogError) return <div className="text-sm text-red-400">{catalogError}</div>;
  if (!products || products.length === 0) return <div className="text-sm">No products found.</div>;

  return (
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
              <Button
                variant="amber"
                size="sm"
                onClick={() => addToOrder(p)}
                disabled={p.quantity <= 0}
              >
                Add
              </Button>
              <div className="text-xs text-white/70">{p.quantity <= 0 ? 'Out of stock' : ''}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-white/75">
        <div>
          Showing {Math.min(page * limit, totalCount)} of {totalCount}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadCatalog(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 bg-white/10 rounded-lg text-sm"
          >
            Prev
          </button>
          <button
            onClick={() => loadCatalog(page + 1)}
            disabled={page >= Math.ceil(totalCount / limit)}
            className="px-3 py-1 bg-white/10 rounded-lg text-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
