import { createServerSupabase } from '../supabase';
import { Invoice } from '../types';

export async function createInvoiceForOrder(
  orderId: string,
  amount?: number,
  items?: any[],
  dueDays = 3
): Promise<Invoice> {
  const supabase = createServerSupabase();

  const invoiceNumber = `INV-${orderId}-${Date.now()}`;
  const dueAt = new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      order_id: orderId,
      invoice_number: invoiceNumber,
      status: 'pending',
      amount: amount ?? 0,
      due_at: dueAt,
      items: items ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return invoice as Invoice;
}

export async function markInvoicePaid(invoiceNumber: string) {
  const supabase = createServerSupabase();

  const { data: invoice, error: findErr } = await supabase
    .from('invoices')
    .select('*')
    .eq('invoice_number', invoiceNumber)
    .single();

  if (findErr || !invoice) throw new Error('Invoice not found');

  const { data, error } = await supabase
    .from('invoices')
    .update({ status: 'paid' })
    .eq('invoice_number', invoiceNumber)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data as Invoice;
}

export async function getInvoiceById(id: string) {
  const supabase = createServerSupabase();
  const { data } = await supabase.from('invoices').select('*').eq('id', id).single();
  return data as Invoice | null;
}
