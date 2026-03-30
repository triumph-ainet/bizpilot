'use client';

import { useEffect, useRef, useState } from 'react';
import { Smile, SendHorizonalIcon, ChevronLeft } from 'lucide-react';
import EmojiPicker from '@/components/EmojiPicker';
import ChatMessageBubble from './ChatMessageBubble';

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const activeCustomerRef = useRef(customer);
  const shouldAutoScrollRef = useRef(true);

  function updateAutoScrollPreference() {
    const el = bodyRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
    shouldAutoScrollRef.current = distanceFromBottom < 48;
  }

  useEffect(() => {
    let mounted = true;
    activeCustomerRef.current = customer;
    shouldAutoScrollRef.current = true;
    setMessages([]);
    setInput('');
    setShowEmojiPicker(false);

    async function load() {
      try {
        const res = await fetch(`/api/chat/messages?customer=${encodeURIComponent(customer)}`);
        if (!res.ok) return;

        const data = (await res.json()) as Msg[];
        if (mounted && activeCustomerRef.current === customer) setMessages(data || []);
      } catch {
        // ignore transient fetch errors
      }

      fetch('/api/chat/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, customer }),
      }).catch(() => {});
    }

    load();
    const intervalId = setInterval(load, 3000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [vendorId, customer]);

  useEffect(() => {
    if (!shouldAutoScrollRef.current) return;
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [messages]);

  async function send() {
    if (!input.trim()) return;
    const text = input.trim();
    const selectedCustomer = customer;
    setLoading(true);
    setInput('');

    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: selectedCustomer, content: text }),
      });

      const res = await fetch(
        `/api/chat/messages?customer=${encodeURIComponent(selectedCustomer)}`
      );
      if (!res.ok) return;
      const data = (await res.json()) as Msg[];
      if (activeCustomerRef.current === selectedCustomer) {
        shouldAutoScrollRef.current = true;
        setMessages(data || []);
      }
    } catch {
      if (activeCustomerRef.current === selectedCustomer) setInput(text);
    } finally {
      if (activeCustomerRef.current === selectedCustomer) setLoading(false);
    }
  }

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-[#f9f4e9] to-[#f4eddf]">
      <div className="flex items-center gap-3 border-b border-[#e7dccb] bg-white/95 px-4 py-3 backdrop-blur-sm">
        <button
          onClick={() => onOpenContacts && onOpenContacts()}
          className="rounded-full p-1.5 text-ink md:hidden"
          aria-label="Open contacts"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green/10 text-xs font-bold text-green">
          {customer.trim().slice(-2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">{customer}</p>
          <p className="truncate text-xs text-ink-light">
            {lastSeen ? `Last activity ${new Date(lastSeen).toLocaleString()}` : 'Active now'}
          </p>
        </div>
      </div>

      <div
        ref={bodyRef}
        onScroll={updateAutoScrollPreference}
        className="chat-pattern flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-5 pb-28"
      >
        {messages.length === 0 && (
          <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-[#eadfce] bg-white/90 px-5 py-4 text-center shadow-sm">
            <p className="font-fraunces text-lg text-green">Start the conversation</p>
            <p className="mt-1 text-sm text-ink-light">
              Messages with this customer will appear here.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <ChatMessageBubble key={m.id} message={m} />
        ))}
      </div>

      <div className="sticky bottom-0 z-50 flex flex-shrink-0 items-center gap-2 border-t border-[#e7dccb] bg-[#f7f0e4] px-3 py-3 backdrop-blur-sm">
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker((s) => !s)}
            className="rounded-full p-2 text-ink-light transition hover:bg-white"
            aria-label="Toggle emoji picker"
          >
            <Smile className="w-5 h-5" />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-50">
              <EmojiPicker
                onSelect={(emoji) => {
                  setInput((v) => v + emoji);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}
        </div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          className="flex-2 rounded-full border border-[#e2d7c5] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-green-light"
          placeholder="Write a message"
        />
        <button
          onClick={send}
          disabled={loading}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-green text-white transition hover:bg-green-mid disabled:opacity-50"
          aria-label="Send message"
        >
          <SendHorizonalIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
