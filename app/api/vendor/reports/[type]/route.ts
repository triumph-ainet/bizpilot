import { NextRequest, NextResponse } from 'next/server';
import { getVendorSessionFromRequest } from '@/lib/auth';
import { generateReport, reportDocumentToCsv } from '@/lib/services/reporting.service';
import { isReportType } from '@/lib/services/reporting.types';

type RouteParams = {
  params: Promise<{ type: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getVendorSessionFromRequest(request);
  if (!session?.vendorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type } = await params;
  if (!isReportType(type)) {
    return NextResponse.json({ error: 'Unknown report type' }, { status: 404 });
  }

  const report = await generateReport(session.vendorId, type);
  const csv = reportDocumentToCsv(report);
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `${type}_report_${stamp}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store, max-age=0',
    },
  });
}
