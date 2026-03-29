'use client';

import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Msg = { id: string; sender: string; content: string; created_at: string };

export default function ChatWindow({
  vendorId,
  customer,
  lastSeen,
  onOpenContacts,
}: {
  vendorId: string;
  customer: string;
  lastSeen?: string | null;
  onOpenContacts?: () => void;
}) {
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

      // mark as read
      fetch('/api/chat/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, customer }),
      }).catch(() => {});

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
    <div className="flex-1 bg-cream flex flex-col">
      <div className="bg-green px-4 pt-4 pb-3 flex items-center gap-3 text-white">
        <button onClick={() => onOpenContacts && onOpenContacts()} className="text-white md:hidden">
          Back
        </button>
        <div className="flex-1">
          <p className="font-bold break-all">{customer}</p>
          <p className="text-xs">
            {lastSeen ? `Last seen ${new Date(lastSeen).toLocaleString()}` : 'Online'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="opacity-90">⋮</button>
        </div>
      </div>

      <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === 'vendor' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`relative max-w-[80%] px-4 py-2 rounded-2xl ${
                m.sender === 'vendor' ? 'bg-[#dcf8c6] text-ink' : 'bg-white text-ink'
              }`}
            >
              <div className="whitespace-pre-line text-sm">{m.content}</div>
              <div className="text-[10px] text-ink-light mt-1 flex items-center gap-2 justify-end">
                <span>
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {m.sender === 'vendor' ? <span className="text-xs text-green">✓✓</span> : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-cream-dark px-3 py-3 border-t border-gray-200 flex items-center gap-3">
        <button className="text-ink-light px-2">😊</button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          className="flex-1 bg-white rounded-full px-4 py-2 outline-none text-sm"
          placeholder="Type a message"
        />
        <button
          onClick={send}
          className="bg-green text-white w-10 h-10 rounded-full flex items-center justify-center"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
