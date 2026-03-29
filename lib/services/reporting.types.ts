export const REPORT_TYPES = [
  'sales',
  'inventory',
  'orders',
  'customers',
  'financial',
  'operational',
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export type ReportSection = {
  title: string;
  columns: string[];
  rows: Array<Array<string | number>>;
};

export type ReportDocument = {
  type: ReportType;
  vendorName: string;
  title: string;
  subtitle: string;
  generatedAt: string;
  summary: Array<{ label: string; value: string }>;
  sections: ReportSection[];
  notes: string[];
};

export function isReportType(value: string): value is ReportType {
  return (REPORT_TYPES as readonly string[]).includes(value);
}
