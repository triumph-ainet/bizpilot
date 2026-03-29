import type { ReportDocument } from '@/lib/services/reporting.types';

type Props = {
  document: ReportDocument;
};

export default function ReportDocumentView({ document }: Props) {
  return (
    <div className="min-h-screen bg-cream text-ink px-4 py-6 md:px-10 md:py-10">
      <div className="max-w-5xl mx-auto bg-white border border-cream-dark rounded-2xl shadow-card overflow-hidden">
        <header className="bg-green text-white px-6 py-5 md:px-10 md:py-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/75">
                Bizpilot Report
              </p>
              <h1 className="font-fraunces text-2xl md:text-3xl font-bold mt-2">
                {document.title}
              </h1>
              <p className="text-sm text-white/85 mt-1">{document.subtitle}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/30 flex items-center justify-center">
              <img src="/favicon.ico" alt="Bizpilot logo" className="w-8 h-8" />
            </div>
          </div>
        </header>

        <div className="px-6 py-6 md:px-10 md:py-8 space-y-8">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-cream rounded-xl p-4 border border-cream-dark">
              <div className="text-xs uppercase text-ink-mid">Vendor</div>
              <div className="font-fraunces text-lg mt-1">{document.vendorName}</div>
            </div>
            <div className="bg-cream rounded-xl p-4 border border-cream-dark">
              <div className="text-xs uppercase text-ink-mid">Generated At</div>
              <div className="font-medium mt-1">
                {new Date(document.generatedAt).toLocaleString()}
              </div>
            </div>
            <div className="bg-cream rounded-xl p-4 border border-cream-dark">
              <div className="text-xs uppercase text-ink-mid">Scope</div>
              <div className="font-medium mt-1">Last 180 days of stored data</div>
            </div>
          </section>

          {document.summary.length > 0 && (
            <section>
              <h2 className="font-fraunces text-xl mb-3">Executive Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {document.summary.map((item) => (
                  <article
                    key={item.label}
                    className="rounded-xl border border-cream-dark p-4 bg-cream"
                  >
                    <div className="text-xs uppercase text-ink-mid">{item.label}</div>
                    <div className="text-lg font-semibold mt-1">{item.value}</div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {document.sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-fraunces text-xl mb-3">{section.title}</h2>
              <div className="overflow-x-auto rounded-xl border border-cream-dark">
                <table className="min-w-full text-sm">
                  <thead className="bg-cream-dark text-ink">
                    <tr>
                      {section.columns.map((column) => (
                        <th
                          key={column}
                          className="text-left px-4 py-2.5 font-semibold whitespace-nowrap"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {section.rows.length === 0 && (
                      <tr>
                        <td colSpan={section.columns.length} className="px-4 py-3 text-ink-mid">
                          No data available for this section.
                        </td>
                      </tr>
                    )}
                    {section.rows.map((row, rowIndex) => (
                      <tr
                        key={`${section.title}-${rowIndex}`}
                        className="border-t border-cream-dark/70"
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={`${section.title}-${rowIndex}-${cellIndex}`}
                            className="px-4 py-2.5 whitespace-nowrap"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          {document.notes.length > 0 && (
            <section className="rounded-xl border border-amber/30 bg-amber-light/25 p-4">
              <h3 className="font-semibold text-sm mb-2">Notes</h3>
              <ul className="space-y-1.5 text-sm text-ink-mid list-disc pl-5">
                {document.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          )}

          <footer className="pt-3 border-t border-cream-dark text-xs text-ink-mid">
            Standardized format powered by Bizpilot analytics reporting.
          </footer>
        </div>
      </div>
    </div>
  );
}
