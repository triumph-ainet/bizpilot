import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase';
import ChatSessionClient from '@/app/chat/session/_components/ChatSessionClient';

type SessionPageProps = {
  params: Promise<{ token: string }>;
};

export default async function SessionPage({ params }: SessionPageProps) {
  const { token } = await params;
  const supabase = createServerSupabase();

  const { data: session } = await supabase
    .from('sessions')
    .select(
      'id, order_id, vendor_id, customer_identifier, customer_email, last_accessed, created_at'
    )
    .eq('token', token)
    .limit(1)
    .single();

  if (!session) {
    notFound();
  }

  const vendorId = session.vendor_id as string | null;
  const customer = session.customer_identifier as string | null;
  if (!vendorId || !customer) {
    notFound();
  }

  return <ChatSessionClient vendor={vendorId} customer={customer} />;
}
