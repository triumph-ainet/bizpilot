import type { ReportType } from '@/lib/services/reporting.types';

export type ReportDefinition = {
  type: ReportType;
  title: string;
  description: string;
};

export const REPORT_DEFINITIONS: ReportDefinition[] = [
  {
    type: 'sales',
    title: 'Sales Report',
    description:
      'Daily, weekly, and monthly revenue, product-level sales contribution, peak order hours, and payment method breakdown.',
  },
  {
    type: 'inventory',
    title: 'Inventory Report',
    description:
      'Current stock positions, low-stock frequency, estimated stock runway from velocity, and available restock signals.',
  },
  {
    type: 'orders',
    title: 'Order Report',
    description:
      'Order volume trends, status mix, average order value, credit ledger, and most frequent customers by count and spend.',
  },
  {
    type: 'customers',
    title: 'Customer Report',
    description:
      'Top spenders, repeat-customer retention, and weekly new-versus-returning customer mix.',
  },
  {
    type: 'financial',
    title: 'Financial Report',
    description:
      'Gross and net revenue, outstanding credit, settlement timeline, and daily cash flow snapshot.',
  },
  {
    type: 'operational',
    title: 'Operational Report',
    description:
      'AI parsing success proxy, order-to-payment speed, and manual intervention workload.',
  },
];
