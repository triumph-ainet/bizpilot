'use client';

import { Download } from 'lucide-react';

export default function ExportCsvButton({ rows }: { rows: string[][] }) {
  function toCsv(rows: string[][]) {
    return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  }

  function handleClick() {
    const csv = toCsv(rows || []);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button onClick={handleClick} className="px-3 py-2 bg-green text-white rounded-md text-sm inline-flex items-center gap-2">
      <Download className="w-4 h-4" />
      <span>Export CSV</span>
    </button>
  );
}
