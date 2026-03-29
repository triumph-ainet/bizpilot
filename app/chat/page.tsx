import { getVendorSessionFromCookies } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import ChatPageClient from './_components/ChatPageClient';
import { BottomNav } from '@/components/ui';

type Contact = { customer: string; lastMessage?: string; lastAt?: string; unread?: number };

export default async function ChatPage() {
  const session = await getVendorSessionFromCookies();
  if (!session?.vendorId) return <div className="p-6">Unauthorized</div>;

  const supabase = createServerSupabase();

  const { data } = await supabase
    .from('messages')
    .select('customer_identifier, content, sender, created_at')
    .eq('vendor_id', session.vendorId)
    .order('created_at', { ascending: false });

  const seen = new Set<string>();
  const contacts: Contact[] = [];

  for (const m of (data || []) as any[]) {
    const customer = m.customer_identifier as string;
    if (seen.has(customer)) continue;
    seen.add(customer);

    const { data: lr } = await supabase
      .from('message_reads')
      .select('last_read')
      .eq('vendor_id', session.vendorId)
      .eq('customer_identifier', customer)
      .limit(1)
      .single();

    let unread = 0;
    try {
      const q = supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('vendor_id', session.vendorId)
        .eq('customer_identifier', customer)
        .eq('sender', 'customer');

      if (lr?.last_read) q.gt('created_at', lr.last_read as string);

      const { count } = await q;
      unread = Number(count || 0);
    } catch (e) {
      unread = 0;
    }

    contacts.push({ customer, lastMessage: m.content, lastAt: m.created_at, unread });
  }

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="bg-green px-6 pt-6 pb-5">
        <h1 className="font-fraunces text-2xl font-extrabold text-white">Chats</h1>
      </div>

      <ChatPageClient vendorId={session.vendorId} initialContacts={contacts} />

      <BottomNav active="/chat" />
    </div>
  );
}
