"use client";

import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Msg = { id: string; sender: string; content: string; created_at: string };

export default function ChatWindow({ vendorId, customer }: { vendorId: string; customer: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
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
        .channel(`messages:${vendorId}:${customer}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `vendor_id=eq.${vendorId},customer_identifier=eq.${customer}`,
          },
          (payload) => setMessages((m) => [...m, payload.new as Msg])
        )
        .subscribe();
    }

    load();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [vendorId, customer]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [messages]);

  async function send() {
    if (!input.trim()) return;
    const text = input;
    setInput('');
    await supabase.from('messages').insert({
      vendor_id: vendorId,
      sender: 'vendor',
      channel: 'web_chat',
      content: text,
      customer_identifier: customer,
    });

    // notify subscribers
    fetch('/api/messages/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId, customer, message: text }),
    }).catch(() => {});
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="bg-green px-4 pt-14 pb-3.5 flex items-center gap-3 text-white">
        <a href="/chat" className="text-white">Back</a>
        <div className="flex-1">
          <p className="font-bold">{customer}</p>
          <p className="text-xs">Chat</p>
        </div>
      </div>

      <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'vendor' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-xl ${m.sender === 'vendor' ? 'bg-[#d9fdd3]' : 'bg-white'}`}>
              <div className="whitespace-pre-line">{m.content}</div>
              <div className="text-[10px] text-ink-light mt-1">{new Date(m.created_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-cream-dark px-3 py-2.5 pb-6 flex items-center gap-2.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          className="flex-1 bg-white rounded-full px-4 py-3 outline-none"
          placeholder="Type a message..."
        />
        <button onClick={send} className="bg-green text-white px-4 py-2 rounded-lg">Send</button>
      </div>
    </div>
  );
}
