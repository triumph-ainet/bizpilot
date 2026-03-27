"use client";

import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Msg = { id: string; sender: string; content: string; created_at: string };

export default function ChatSessionClient({ vendor, customer }: { vendor: string; customer: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [email, setEmail] = useState('');
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let channel: any;
    async function load() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('vendor_id', vendor)
        .eq('customer_identifier', customer)
        .order('created_at', { ascending: true });
      setMessages(data || []);

      channel = supabase
        .channel(`public:messages:${vendor}:${customer}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `vendor_id=eq.${vendor},customer_identifier=eq.${customer}`,
          },
          (payload) => setMessages((m) => [...m, payload.new as Msg])
        )
        .subscribe();
    }

    load();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [vendor, customer]);

  useEffect(() => bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight }), [messages]);

  async function sendCustomerMessage() {
    if (!input.trim()) return;
    const text = input;
    setInput('');
    await fetch('/api/messages/inbound', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: 'web_chat', vendorId: vendor, senderId: customer, text }),
    }).catch(() => {});
  }

  async function subscribeEmail() {
    if (!email.includes('@')) return;
    await fetch('/api/chat/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId: vendor, customer, email }),
    }).catch(() => {});
  }

  return (
    <div className="min-h-screen bg-[#e5ddd5] flex flex-col">
      <div className="bg-green px-4 pt-14 pb-3.5 flex items-center gap-3 text-white">
        <div className="flex-1">
          <p className="font-bold">{customer}</p>
          <p className="text-xs">Chat with vendor</p>
        </div>
      </div>

      <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'vendor' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-xl ${m.sender === 'vendor' ? 'bg-white' : 'bg-[#d9fdd3]'}`}>
              <div className="whitespace-pre-line">{m.content}</div>
              <div className="text-[10px] text-ink-light mt-1">{new Date(m.created_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-cream-dark px-3 py-2.5 pb-3 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendCustomerMessage()}
            className="flex-1 bg-white rounded-full px-4 py-3 outline-none"
            placeholder="Type a message..."
          />
          <button onClick={sendCustomerMessage} className="bg-green text-white px-4 py-2 rounded-lg">Send</button>
        </div>
        <div className="flex gap-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email to get notified"
            className="flex-1 bg-white rounded-full px-4 py-3 outline-none text-sm"
          />
          <button onClick={subscribeEmail} className="bg-amber text-green px-3 py-2 rounded-lg">Notify</button>
        </div>
      </div>
    </div>
  );
}
