import { notFound } from 'next/navigation';
import { getVendorSessionFromCookies } from '@/lib/auth';
import { generateReport } from '@/lib/services/reporting.service';
import { isReportType } from '@/lib/services/reporting.types';
import AutoPrint from '../_components/AutoPrint';
import ReportDocumentView from '../_components/ReportDocumentView';

type Props = {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ print?: string }>;
};

export default async function ReportDocumentPage({ params, searchParams }: Props) {
  const [resolvedParams, resolvedSearch] = await Promise.all([params, searchParams]);
  const typeParam = resolvedParams.type;

  if (!isReportType(typeParam)) {
    notFound();
  }

  const session = await getVendorSessionFromCookies();
  if (!session?.vendorId) {
    return <div className="p-6">Please sign in to download reports.</div>;
  }

  const report = await generateReport(session.vendorId, typeParam);
  const shouldPrint = resolvedSearch.print === '1';

  return (
    <>
      <AutoPrint enabled={shouldPrint} />
      <ReportDocumentView document={report} />
    </>
  );
}
