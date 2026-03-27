"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsPrintable() {
  useEffect(() => {
    // small delay to allow render before print
    const t = setTimeout(() => window.print(), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="p-6 text-black bg-white">
      <h1 className="text-2xl font-bold mb-2">Analytics Report</h1>
      <p className="text-sm mb-4">Printable summary — use your browser's "Save as PDF" to generate a PDF.</p>

      <section className="mb-4">
        <h2 className="font-semibold">Summary</h2>
        <div className="mt-2">This report contains a snapshot of your store analytics. For a full export, use the CSV export on the Analytics page.</div>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">Most bought product</h2>
        <div className="mt-2">(See web dashboard for live details)</div>
      </section>

      <footer className="text-xs text-muted mt-8">Generated: {new Date().toLocaleString()}</footer>
    </div>
  );
}
