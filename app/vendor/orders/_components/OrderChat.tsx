'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Msg = { id: string; sender: string; content: string; created_at: string };

export default function OrderChat({ vendorId, customer }: { vendorId: string; customer: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    async function loadUnread() {
      try {
        const res = await fetch('/api/chat/contacts');
        if (!res.ok) return;
        const data = await res.json();
        const match = (data || []).find((c: any) => c.customer === customer);
        if (mounted) setUnread(match?.unread || 0);
      } catch (e) {
        // ignore
      }
    }
    loadUnread();
    return () => {
      mounted = false;
    };
  }, [vendorId, customer]);

  useEffect(() => {
    if (!open) return;
    let channel: any;
    async function load() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('customer_identifier', customer)
        .order('created_at', { ascending: true });
      setMessages(data || []);

      channel = supabase
        .channel('public:messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `vendor_id=eq.${vendorId},customer_identifier=eq.${customer}`,
          },
          (payload) => {
            setMessages((m) => [...m, payload.new as Msg]);
          }
        )
        .subscribe();
    }
    load();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [open, vendorId, customer]);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    (async () => {
      try {
        await fetch('/api/chat/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vendorId, customer }),
        });
        if (mounted) setUnread(0);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [open, vendorId, customer]);

  async function send() {
    if (!input.trim()) return;
    await supabase
      .from('messages')
      .insert({
        vendor_id: vendorId,
        sender: 'vendor',
        channel: 'web_chat',
        content: input,
        customer_identifier: customer,
      });
    setInput('');
    // notify any subscribed emails for this customer
    try {
      fetch('/api/messages/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, customer, message: input }),
      });
    } catch (e) {
      console.warn('notify failed', e);
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="relative text-green"
      >
        <MessageSquare className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-green text-white text-[10px] px-1 rounded-full">{unread}</span>
        )}
      </button>

      {/* mark read when opened */}
      {open &&
        (async () => {
          try {
            await fetch('/api/chat/read', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ vendorId, customer }),
            });
            setUnread(0);
          } catch {}
        })()}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-3 py-2 flex items-center justify-between bg-green text-white">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Customer Chat
              </div>
              <button onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 max-h-72 overflow-y-auto space-y-2">
              {messages.map((m) => (
                <div key={m.id} className={m.sender === 'vendor' ? 'text-right' : 'text-left'}>
                  <div
                    className={`inline-block px-3 py-2 rounded-xl ${m.sender === 'vendor' ? 'bg-[#d9fdd3]' : 'bg-white'}`}
                  >
                    {m.content}
                  </div>
                  <div className="text-[10px] text-ink-light mt-0.5">
                    {new Date(m.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-cream-dark flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Reply..."
                className="flex-1 px-3 py-2 rounded-lg"
                onKeyDown={(e) => e.key === 'Enter' && send()}
              />
              <button onClick={send} className="bg-green text-white px-3 py-2 rounded-lg">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
