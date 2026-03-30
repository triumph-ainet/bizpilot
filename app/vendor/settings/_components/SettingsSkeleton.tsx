'use client';

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3.5 px-4 py-4 border-b border-cream-dark last:border-b-0">
      <div className="w-10 h-10 rounded-xl bg-cream-dark animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-28 rounded bg-cream-dark animate-pulse" />
        <div className="h-3 w-40 rounded bg-cream-dark animate-pulse" />
      </div>
      <div className="h-4 w-3 rounded bg-cream-dark animate-pulse" />
    </div>
  );
}

export default function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-card">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-card">
        <SkeletonRow />
        <SkeletonRow />
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-card">
        <SkeletonRow />
      </div>
    </div>
  );
}
