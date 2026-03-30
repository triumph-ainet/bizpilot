'use client';

import { useEffect, useState, useRef } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Msg = { id: string; sender: string; content: string; created_at: string };

export default function ChatFloating({ vendorId }: { vendorId?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [phone, setPhone] = useState('');
  const mounted = useRef(false);

  useEffect(() => {
    if (!vendorId) return;
    let channel: any;
    async function load() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('vendor_id', vendorId)
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
            filter: `vendor_id=eq.${vendorId}`,
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
  }, [vendorId]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function send() {
    if (!input.trim() || !vendorId) return;
    const customer_identifier = phone || `guest-${Date.now()}`;
    await supabase.from('messages').insert({
      vendor_id: vendorId,
      sender: 'customer',
      channel: 'web_chat',
      content: input,
      customer_identifier,
    });
    setInput('');
    if (!mounted.current) return;
    setOpen(true);
  }

  return (
    <div>
      {open && (
        <div className="fixed right-4 bottom-20 w-80 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
          <div className="px-3 py-2 flex items-center justify-between bg-green text-white">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="font-bold">Chat with vendor</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 flex-1 overflow-y-auto max-h-64 space-y-2 break-words">
            {messages.map((m) => (
              <div key={m.id} className={m.sender === 'customer' ? 'text-right' : 'text-left'}>
                <div
                  className={`inline-block px-3 py-2 rounded-xl max-w-[80%] break-words whitespace-pre-wrap ${m.sender === 'customer' ? 'bg-[#d9fdd3]' : 'bg-white'}`}
                >
                  {m.content}
                </div>
                <div className="text-[10px] text-ink-light mt-0.5">
                  {new Date(m.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-cream-dark flex flex-col gap-2">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              maxLength={11}
              placeholder="WhatsApp number"
              className="w-full px-3 py-2 rounded-lg border border-ink-light bg-cream placeholder:italic placeholder:text-ink-light text-sm"
              required
            />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write a message... (Shift+Enter for newline)"
              required
              className="w-full px-3 py-2 rounded-lg resize-none h-24 border border-ink-light bg-white placeholder:text-ink-light shadow-sm focus:outline-none focus:ring-2 focus:ring-green"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <div className="flex justify-end">
              <button
                onClick={send}
                className="bg-green text-white px-4 py-2 rounded-lg shadow-md hover:brightness-90 transition"
                aria-label="Send message"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((s) => !s)}
        className="fixed right-4 bottom-4 bg-green text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
        aria-label="Chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
