'use client';

import { useEffect, useRef, useState } from 'react';
import { Smile, SendHorizonalIcon, ChevronLeft } from 'lucide-react';
import EmojiPicker from '@/components/EmojiPicker';

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

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch(`/api/chat/messages?customer=${encodeURIComponent(customer)}`);
        if (!res.ok) return;

        const data = (await res.json()) as Msg[];
        if (mounted) setMessages(data || []);
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
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [messages]);

  async function send() {
    if (!input.trim()) return;
    const text = input.trim();
    setLoading(true);
    setInput('');

    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer, content: text }),
      });

      const res = await fetch(`/api/chat/messages?customer=${encodeURIComponent(customer)}`);
      if (!res.ok) return;
      const data = (await res.json()) as Msg[];
      setMessages(data || []);
    } catch {
      setInput(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex-1 bg-cream flex flex-col min-h-0">
      <div className="bg-green px-4 pt-4 pb-3 flex items-center gap-3 text-white">
        <button onClick={() => onOpenContacts && onOpenContacts()} className="text-white md:hidden">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="font-bold break-all">{customer}</p>
          <p className="text-xs font-dm">
            {lastSeen ? `Last seen ${new Date(lastSeen).toLocaleString()}` : 'Online'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="opacity-90">⋮</button>
        </div>
      </div>

      <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 pb-28">
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

      <div className="bg-cream-dark px-3 py-3 border-t border-gray-200 flex items-center gap-3 sticky bottom-0 z-50 flex-shrink-0">
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker((s) => !s)}
            className="text-ink-light px-2"
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
          className="flex-1 bg-white rounded-full px-4 py-2 outline-none text-sm"
          placeholder="Type a message"
        />
        <button
          onClick={send}
          disabled={loading}
          className="bg-green text-white w-10 h-10 rounded-full flex items-center justify-center"
        >
          <SendHorizonalIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
