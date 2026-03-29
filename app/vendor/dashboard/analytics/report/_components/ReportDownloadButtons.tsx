'use client';

import { useState } from 'react';
import type { ReportType } from '@/lib/services/reporting.types';

type Props = {
  type: ReportType;
};

export default function ReportDownloadButtons({ type }: Props) {
  const [busy, setBusy] = useState<'pdf' | 'csv' | null>(null);

  function openPdf() {
    setBusy('pdf');
    window.open(
      `/vendor/dashboard/analytics/report/${type}?print=1`,
      '_blank',
      'noopener,noreferrer'
    );
    setTimeout(() => setBusy(null), 300);
  }

  function downloadCsv() {
    setBusy('csv');
    window.location.href = `/api/vendor/reports/${type}`;
    setTimeout(() => setBusy(null), 300);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={openPdf}
        disabled={busy !== null}
        className="px-3 py-2 rounded-md text-sm font-semibold bg-green text-white hover:bg-green-mid disabled:opacity-60"
      >
        {busy === 'pdf' ? 'Opening PDF...' : 'Download PDF'}
      </button>
      <button
        type="button"
        onClick={downloadCsv}
        disabled={busy !== null}
        className="px-3 py-2 rounded-md text-sm font-semibold border border-green text-green hover:bg-cream-dark disabled:opacity-60"
      >
        {busy === 'csv' ? 'Preparing CSV...' : 'Download CSV'}
      </button>
    </div>
  );
}
