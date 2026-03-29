import { createServerSupabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';
import type { ReportDocument, ReportType, ReportSection } from './reporting.types';

type OrderItemRow = {
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
};

type OrderRow = {
  id: string;
  status: 'pending' | 'paid' | 'credit' | 'cancelled';
  total: number;
  created_at: string;
  customer_identifier: string;
  order_items?: OrderItemRow[];
};

type PaymentRow = {
  order_id: string;
  status: 'pending' | 'confirmed' | 'failed';
  amount: number;
  paid_at: string | null;
};

type StockAlertRow = {
  product_id: string;
  product_name: string;
  created_at: string;
  resolved: boolean;
};

type SharedReportData = {
  vendorName: string;
  orders: OrderRow[];
  products: Product[];
  payments: PaymentRow[];
  stockAlerts: StockAlertRow[];
};

const CACHE_TTL_MS = 60_000;
const reportCache = new Map<string, { ts: number; value: SharedReportData }>();
const inFlight = new Map<string, Promise<SharedReportData>>();

const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

function sum(values: number[]) {
  return values.reduce((acc, value) => acc + value, 0);
}

function toDayKey(isoDate: string) {
  return isoDate.slice(0, 10);
}

function toWeekKey(isoDate: string) {
  const d = new Date(isoDate);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}

function buildRowsFromMap(input: Record<string, number>) {
  return Object.entries(input)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => [key, value]);
}

function csvEscape(value: string | number) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export function reportDocumentToCsv(document: ReportDocument): string {
  const lines: string[] = [];

  lines.push(`${csvEscape(document.title)},${csvEscape(document.subtitle)}`);
  lines.push(`${csvEscape('Generated At')},${csvEscape(document.generatedAt)}`);
  lines.push('');

  if (document.summary.length > 0) {
    lines.push(csvEscape('Summary'));
    lines.push(
      ...document.summary.map((item) => `${csvEscape(item.label)},${csvEscape(item.value)}`)
    );
    lines.push('');
  }

  for (const section of document.sections) {
    lines.push(csvEscape(section.title));
    lines.push(section.columns.map((col) => csvEscape(col)).join(','));
    lines.push(...section.rows.map((row) => row.map((cell) => csvEscape(cell)).join(',')));
    lines.push('');
  }

  if (document.notes.length > 0) {
    lines.push(csvEscape('Notes'));
    lines.push(...document.notes.map((note) => csvEscape(note)));
  }

  return lines.join('\n');
}

async function loadSharedReportData(vendorId: string): Promise<SharedReportData> {
  const cacheKey = `report:${vendorId}`;
  const cached = reportCache.get(cacheKey);

  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.value;
  }

  if (inFlight.has(cacheKey)) {
    return inFlight.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    const supabase = createServerSupabase();
    const since = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();

    const [vendorRes, ordersRes, productsRes, alertsRes] = await Promise.all([
      supabase.from('vendors').select('business_name').eq('id', vendorId).single(),
      supabase
        .from('orders')
        .select(
          'id,status,total,created_at,customer_identifier,order_items(product_id,product_name,quantity,unit_price)'
        )
        .eq('vendor_id', vendorId)
        .gte('created_at', since),
      supabase
        .from('products')
        .select('id,vendor_id,name,price,quantity,image_url,low_stock_threshold,created_at')
        .eq('vendor_id', vendorId),
      supabase
        .from('stock_alerts')
        .select('product_id,product_name,created_at,resolved')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(1000),
    ]);

    const vendorName = vendorRes.data?.business_name || 'Vendor';
    const orders = (ordersRes.data || []) as OrderRow[];
    const products = (productsRes.data || []) as Product[];
    const stockAlerts = (alertsRes.data || []) as StockAlertRow[];

    let payments: PaymentRow[] = [];
    if (orders.length > 0) {
      const orderIds = orders.map((order) => order.id);
      const { data: paymentRows } = await supabase
        .from('payments')
        .select('order_id,status,amount,paid_at')
        .in('order_id', orderIds);
      payments = (paymentRows || []) as PaymentRow[];
    }

    const value = { vendorName, orders, products, payments, stockAlerts };
    reportCache.set(cacheKey, { ts: Date.now(), value });
    return value;
  })();

  inFlight.set(cacheKey, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    inFlight.delete(cacheKey);
  }
}

function salesReport(data: SharedReportData): ReportDocument {
  const paidOrders = data.orders.filter((order) => order.status === 'paid');
  const now = Date.now();

  const daily = sum(
    paidOrders
      .filter((order) => now - new Date(order.created_at).getTime() <= 24 * 60 * 60 * 1000)
      .map((order) => Number(order.total || 0))
  );
  const weekly = sum(
    paidOrders
      .filter((order) => now - new Date(order.created_at).getTime() <= 7 * 24 * 60 * 60 * 1000)
      .map((order) => Number(order.total || 0))
  );
  const monthly = sum(
    paidOrders
      .filter((order) => now - new Date(order.created_at).getTime() <= 30 * 24 * 60 * 60 * 1000)
      .map((order) => Number(order.total || 0))
  );

  const revenueByProduct: Record<string, number> = {};
  for (const order of paidOrders) {
    for (const item of order.order_items || []) {
      const key = item.product_name || 'Unknown';
      revenueByProduct[key] =
        (revenueByProduct[key] || 0) + Number(item.quantity) * Number(item.unit_price);
    }
  }

  const byHour: Record<string, number> = {};
  for (const order of data.orders) {
    const h = new Date(order.created_at).getUTCHours();
    const key = `${String(h).padStart(2, '0')}:00`;
    byHour[key] = (byHour[key] || 0) + 1;
  }

  const paidViaLink = data.orders.filter((order) => order.status === 'paid').length;
  const paidOnCredit = data.orders.filter((order) => order.status === 'credit').length;

  const sections: ReportSection[] = [
    {
      title: 'Revenue Summary',
      columns: ['Period', 'Revenue'],
      rows: [
        ['Daily (24h)', naira.format(daily)],
        ['Weekly (7d)', naira.format(weekly)],
        ['Monthly (30d)', naira.format(monthly)],
      ],
    },
    {
      title: 'Revenue by Product',
      columns: ['Product', 'Revenue'],
      rows: Object.entries(revenueByProduct)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([name, revenue]) => [name, naira.format(revenue)]),
    },
    {
      title: 'Peak Order Hours',
      columns: ['Hour', 'Orders'],
      rows: buildRowsFromMap(byHour)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .slice(0, 24),
    },
    {
      title: 'Payment Method Breakdown',
      columns: ['Method', 'Orders'],
      rows: [
        ['Payment Link', paidViaLink],
        ['Credit', paidOnCredit],
      ],
    },
  ];

  return {
    type: 'sales',
    vendorName: data.vendorName,
    title: 'Sales Report',
    subtitle: `${data.vendorName} sales analytics`,
    generatedAt: new Date().toISOString(),
    summary: [
      { label: 'Paid Orders', value: String(paidOrders.length) },
      { label: 'Monthly Revenue', value: naira.format(monthly) },
    ],
    sections,
    notes: [
      'Payment link counts are inferred from orders marked as paid.',
      'All metrics are limited to data currently stored in the application database.',
    ],
  };
}

function inventoryReport(data: SharedReportData): ReportDocument {
  const paidOrders = data.orders.filter((order) => order.status === 'paid');
  const since30 = Date.now() - 30 * 24 * 60 * 60 * 1000;

  const qty30ByProduct: Record<string, number> = {};
  for (const order of paidOrders.filter(
    (order) => new Date(order.created_at).getTime() >= since30
  )) {
    for (const item of order.order_items || []) {
      const key = item.product_id || item.product_name;
      qty30ByProduct[key] = (qty30ByProduct[key] || 0) + Number(item.quantity || 0);
    }
  }

  const stockLevels = data.products
    .map((product) => [
      product.name,
      Number(product.quantity || 0),
      Number(product.low_stock_threshold || 0),
    ])
    .sort((a, b) => Number(a[1]) - Number(b[1]));

  const lowStockHits: Record<string, number> = {};
  for (const alert of data.stockAlerts) {
    lowStockHits[alert.product_name] = (lowStockHits[alert.product_name] || 0) + 1;
  }

  const stockRunway = data.products
    .map((product) => {
      const key = product.id || product.name;
      const sold30 = qty30ByProduct[key] || 0;
      const avgPerDay = sold30 / 30;
      const days = avgPerDay > 0 ? Number(product.quantity || 0) / avgPerDay : 999;
      return [
        product.name,
        sold30,
        avgPerDay.toFixed(2),
        days >= 999 ? 'No recent sales' : Math.floor(days),
      ];
    })
    .sort((a, b) => {
      const av = typeof a[3] === 'number' ? a[3] : Number.MAX_SAFE_INTEGER;
      const bv = typeof b[3] === 'number' ? b[3] : Number.MAX_SAFE_INTEGER;
      return av - bv;
    });

  return {
    type: 'inventory',
    vendorName: data.vendorName,
    title: 'Inventory Report',
    subtitle: `${data.vendorName} inventory analytics`,
    generatedAt: new Date().toISOString(),
    summary: [
      { label: 'Products', value: String(data.products.length) },
      {
        label: 'Low Stock Products',
        value: String(
          data.products.filter((product) => product.quantity <= product.low_stock_threshold).length
        ),
      },
    ],
    sections: [
      {
        title: 'Current Stock Levels',
        columns: ['Product', 'In Stock', 'Low Stock Threshold'],
        rows: stockLevels,
      },
      {
        title: 'Low Stock Frequency',
        columns: ['Product', 'Times Hit Threshold'],
        rows: Object.entries(lowStockHits)
          .sort((a, b) => b[1] - a[1])
          .map(([name, hits]) => [name, hits]),
      },
      {
        title: 'Estimated Stock Remaining',
        columns: ['Product', 'Units Sold (30d)', 'Avg Units/Day', 'Estimated Days Left'],
        rows: stockRunway,
      },
      {
        title: 'Restock History',
        columns: ['Status', 'Detail'],
        rows: [
          [
            'Not Available',
            'Restock events are not currently persisted in a dedicated stock movement table.',
          ],
        ],
      },
    ],
    notes: ['Stock remaining uses paid-order sales velocity from the last 30 days.'],
  };
}

function orderReport(data: SharedReportData): ReportDocument {
  const byDay: Record<string, number> = {};
  const byWeek: Record<string, number> = {};
  const byStatus: Record<string, number> = { pending: 0, paid: 0, credit: 0, cancelled: 0 };

  for (const order of data.orders) {
    byDay[toDayKey(order.created_at)] = (byDay[toDayKey(order.created_at)] || 0) + 1;
    byWeek[toWeekKey(order.created_at)] = (byWeek[toWeekKey(order.created_at)] || 0) + 1;
    byStatus[order.status] = (byStatus[order.status] || 0) + 1;
  }

  const aov = average(data.orders.map((order) => Number(order.total || 0)));

  const creditByCustomer: Record<string, number> = {};
  for (const order of data.orders.filter((order) => order.status === 'credit')) {
    const key = order.customer_identifier || 'Unknown';
    creditByCustomer[key] = (creditByCustomer[key] || 0) + Number(order.total || 0);
  }

  const customerStats: Record<string, { count: number; spend: number }> = {};
  for (const order of data.orders) {
    const key = order.customer_identifier || 'Unknown';
    customerStats[key] = customerStats[key] || { count: 0, spend: 0 };
    customerStats[key].count += 1;
    customerStats[key].spend += Number(order.total || 0);
  }

  return {
    type: 'orders',
    vendorName: data.vendorName,
    title: 'Order Report',
    subtitle: `${data.vendorName} order analytics`,
    generatedAt: new Date().toISOString(),
    summary: [
      { label: 'Total Orders', value: String(data.orders.length) },
      { label: 'Average Order Value', value: naira.format(aov) },
    ],
    sections: [
      {
        title: 'Order Volume by Day',
        columns: ['Day', 'Orders'],
        rows: buildRowsFromMap(byDay),
      },
      {
        title: 'Order Volume by Week',
        columns: ['Week Starting', 'Orders'],
        rows: buildRowsFromMap(byWeek),
      },
      {
        title: 'Order Status Breakdown',
        columns: ['Status', 'Count'],
        rows: Object.entries(byStatus),
      },
      {
        title: 'Credit Ledger',
        columns: ['Customer', 'Outstanding Amount'],
        rows: Object.entries(creditByCustomer)
          .sort((a, b) => b[1] - a[1])
          .map(([customer, amount]) => [customer, naira.format(amount)]),
      },
      {
        title: 'Most Frequent Customers',
        columns: ['Customer', 'Orders', 'Total Spend'],
        rows: Object.entries(customerStats)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 25)
          .map(([customer, stats]) => [customer, stats.count, naira.format(stats.spend)]),
      },
    ],
    notes: [],
  };
}

function customerReport(data: SharedReportData): ReportDocument {
  const paidOrCredit = data.orders.filter(
    (order) => order.status === 'paid' || order.status === 'credit'
  );
  const customerOrders: Record<string, number> = {};
  const customerSpend: Record<string, number> = {};

  for (const order of paidOrCredit) {
    const key = order.customer_identifier || 'Unknown';
    customerOrders[key] = (customerOrders[key] || 0) + 1;
    customerSpend[key] = (customerSpend[key] || 0) + Number(order.total || 0);
  }

  const customers = Object.keys(customerOrders);
  const retained = customers.filter((customer) => customerOrders[customer] > 1).length;

  const weeklyFirstSeen: Record<string, string> = {};
  const byWeek = new Map<string, { newCount: number; returningCount: number }>();
  const sorted = [...paidOrCredit].sort((a, b) => a.created_at.localeCompare(b.created_at));

  for (const order of sorted) {
    const customer = order.customer_identifier || 'Unknown';
    const week = toWeekKey(order.created_at);
    if (!byWeek.has(week)) byWeek.set(week, { newCount: 0, returningCount: 0 });

    if (!weeklyFirstSeen[customer]) {
      weeklyFirstSeen[customer] = week;
      byWeek.get(week)!.newCount += 1;
    } else {
      byWeek.get(week)!.returningCount += 1;
    }
  }

  return {
    type: 'customers',
    vendorName: data.vendorName,
    title: 'Customer Report',
    subtitle: `${data.vendorName} customer analytics`,
    generatedAt: new Date().toISOString(),
    summary: [
      { label: 'Active Customers', value: String(customers.length) },
      {
        label: 'Retention Rate',
        value: customers.length > 0 ? `${Math.round((retained / customers.length) * 100)}%` : '0%',
      },
    ],
    sections: [
      {
        title: 'Top Customers by Spend',
        columns: ['Customer', 'Total Spend', 'Order Count'],
        rows: Object.entries(customerSpend)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 25)
          .map(([customer, spend]) => [
            customer,
            naira.format(spend),
            customerOrders[customer] || 0,
          ]),
      },
      {
        title: 'Customer Retention',
        columns: ['Metric', 'Value'],
        rows: [
          ['Customers with 2+ Orders', retained],
          ['Total Customers', customers.length],
        ],
      },
      {
        title: 'New vs Returning by Week',
        columns: ['Week Starting', 'New Customers', 'Returning Orders'],
        rows: [...byWeek.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([week, values]) => [week, values.newCount, values.returningCount]),
      },
    ],
    notes: ['Customer metrics are based on paid and credit orders.'],
  };
}

function financialReport(data: SharedReportData): ReportDocument {
  const grossRevenue = sum(data.orders.map((order) => Number(order.total || 0)));
  const netRevenue = sum(
    data.orders
      .filter((order) => order.status === 'paid' || order.status === 'credit')
      .map((order) => Number(order.total || 0))
  );
  const cancelledValue = sum(
    data.orders
      .filter((order) => order.status === 'cancelled')
      .map((order) => Number(order.total || 0))
  );
  const outstandingCredit = sum(
    data.orders
      .filter((order) => order.status === 'credit')
      .map((order) => Number(order.total || 0))
  );

  const settlements: Record<string, number> = {};
  for (const payment of data.payments.filter(
    (payment) => payment.status === 'confirmed' && payment.paid_at
  )) {
    const key = toDayKey(payment.paid_at || '');
    settlements[key] = (settlements[key] || 0) + Number(payment.amount || 0);
  }

  const cashflow: Record<string, { paid: number; credit: number }> = {};
  for (const order of data.orders) {
    const key = toDayKey(order.created_at);
    if (!cashflow[key]) cashflow[key] = { paid: 0, credit: 0 };
    if (order.status === 'paid') cashflow[key].paid += Number(order.total || 0);
    if (order.status === 'credit') cashflow[key].credit += Number(order.total || 0);
  }

  return {
    type: 'financial',
    vendorName: data.vendorName,
    title: 'Financial Report',
    subtitle: `${data.vendorName} finance analytics`,
    generatedAt: new Date().toISOString(),
    summary: [
      { label: 'Gross Revenue', value: naira.format(grossRevenue) },
      { label: 'Net Revenue', value: naira.format(netRevenue) },
      { label: 'Outstanding Credit', value: naira.format(outstandingCredit) },
    ],
    sections: [
      {
        title: 'Gross vs Net Revenue',
        columns: ['Metric', 'Amount'],
        rows: [
          ['Gross Revenue', naira.format(grossRevenue)],
          ['Net Revenue', naira.format(netRevenue)],
          ['Cancelled/Failed Value', naira.format(cancelledValue)],
        ],
      },
      {
        title: 'Settlement History',
        columns: ['Date', 'Amount Received'],
        rows: buildRowsFromMap(settlements).map((row) => [row[0], naira.format(Number(row[1]))]),
      },
      {
        title: 'Daily Cash Flow',
        columns: ['Date', 'Paid Inflow', 'Credit Issued'],
        rows: Object.entries(cashflow)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([day, values]) => [day, naira.format(values.paid), naira.format(values.credit)]),
      },
    ],
    notes: ['Net revenue includes paid and credit orders and excludes cancelled orders.'],
  };
}

function operationalReport(data: SharedReportData): ReportDocument {
  const completedOrders = data.orders.filter(
    (order) => order.status === 'paid' || order.status === 'credit'
  ).length;
  const parsingAccuracy =
    data.orders.length > 0 ? Math.round((completedOrders / data.orders.length) * 100) : 0;

  const paymentDelaysMins = data.payments
    .filter((payment) => payment.status === 'confirmed' && payment.paid_at)
    .map((payment) => {
      const order = data.orders.find((item) => item.id === payment.order_id);
      if (!order || !payment.paid_at) return null;
      const deltaMs = new Date(payment.paid_at).getTime() - new Date(order.created_at).getTime();
      return Math.max(0, Math.round(deltaMs / 60000));
    })
    .filter((value): value is number => value !== null);

  const avgPaymentMins = Math.round(average(paymentDelaysMins));

  const manualIntervention = data.orders
    .filter((order) => {
      const ageMs = Date.now() - new Date(order.created_at).getTime();
      return (
        order.status === 'cancelled' || (order.status === 'pending' && ageMs >= 30 * 60 * 1000)
      );
    })
    .map((order) => [
      order.id,
      order.customer_identifier || 'Unknown',
      order.status,
      toDayKey(order.created_at),
    ]);

  return {
    type: 'operational',
    vendorName: data.vendorName,
    title: 'Operational Report',
    subtitle: `${data.vendorName} operations analytics`,
    generatedAt: new Date().toISOString(),
    summary: [
      { label: 'AI Parsing Accuracy (Proxy)', value: `${parsingAccuracy}%` },
      {
        label: 'Avg Order to Payment Confirmation',
        value: Number.isFinite(avgPaymentMins) ? `${avgPaymentMins} mins` : 'N/A',
      },
    ],
    sections: [
      {
        title: 'AI Parsing Accuracy',
        columns: ['Metric', 'Value'],
        rows: [
          ['Parsed Orders', data.orders.length],
          ['Completed (Paid or Credit)', completedOrders],
          ['Accuracy Proxy', `${parsingAccuracy}%`],
        ],
      },
      {
        title: 'Order to Payment Confirmation Time',
        columns: ['Metric', 'Value'],
        rows: [
          ['Average Minutes', Number.isFinite(avgPaymentMins) ? avgPaymentMins : 'N/A'],
          ['Confirmed Payments Sample Size', paymentDelaysMins.length],
        ],
      },
      {
        title: 'Orders Requiring Manual Intervention',
        columns: ['Order ID', 'Customer', 'Status', 'Created Date'],
        rows: manualIntervention,
      },
    ],
    notes: [
      'Parsing accuracy is reported as a proxy using completed outcomes from parsed orders.',
      'To track true parsing misses, persist failed parse attempts in a dedicated table.',
    ],
  };
}

export async function generateReport(vendorId: string, type: ReportType): Promise<ReportDocument> {
  const data = await loadSharedReportData(vendorId);

  switch (type) {
    case 'sales':
      return salesReport(data);
    case 'inventory':
      return inventoryReport(data);
    case 'orders':
      return orderReport(data);
    case 'customers':
      return customerReport(data);
    case 'financial':
      return financialReport(data);
    case 'operational':
      return operationalReport(data);
    default:
      return salesReport(data);
  }
}
