import Link from 'next/link';
import { REPORT_DEFINITIONS } from './_types/report-definitions';
import ReportDownloadButtons from './_components/ReportDownloadButtons';

export default function AnalyticsReportHubPage() {
  return (
    <div className="min-h-screen bg-cream text-ink px-4 py-6 md:px-10 md:py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="rounded-2xl bg-green text-white p-6 md:p-8 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-white/75">
                Bizpilot Reports Center
              </p>
              <h1 className="font-fraunces text-3xl md:text-4xl mt-2">
                Standardized Business Reports
              </h1>
              <p className="text-sm md:text-base text-white/85 mt-2 max-w-3xl">
                Get instant insights with our pre-built reports designed to help you understand your sales trends, customer behavior, and inventory performance.
                Each report is generated only when you click download.
              </p>
            </div>
            <img
              src="/favicon.ico"
              alt="Bizpilot logo"
              className="w-14 h-14 rounded-lg bg-white/10 p-2"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REPORT_DEFINITIONS.map((report) => (
            <article
              key={report.type}
              className="bg-white border border-cream-dark rounded-2xl p-5 shadow-sm"
            >
              <h2 className="font-fraunces text-2xl text-green">{report.title}</h2>
              <p className="text-sm text-ink-mid mt-2 mb-4">{report.description}</p>
              <ReportDownloadButtons type={report.type} />
            </article>
          ))}
        </div>

        <div>
          <Link
            href="/vendor/dashboard/analytics"
            className="inline-flex px-4 py-2 border border-green text-green rounded-md text-sm font-semibold hover:bg-cream-dark"
          >
            Back to Analytics Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
