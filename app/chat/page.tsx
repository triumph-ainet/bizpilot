'use client';

import { useState, useRef, useEffect } from 'react';
import { BottomNav } from '@/components/ui';
import {
  ChevronLeft,
  ShoppingCart,
  CreditCard,
  CheckCheck,
  RefreshCw,
  Send,
  Menu,
  HandHelping,
} from 'lucide-react';

type Msg = {
  id: string;
  role: 'customer' | 'ai';
  text: string;
  time: string;
  type?: 'text' | 'order-summary';
  order?: {
    items: { name: string; qty: number; price: number }[];
    total: number;
    paymentUrl?: string;
  };
};

const INITIAL_MESSAGES: Msg[] = [
  {
    id: '1',
    role: 'customer',
    text: 'Hi! I want to order some things',
    time: '9:30 AM',
  },
  {
    id: '2',
    role: 'ai',
    text: "Welcome to Aisha's Drinks Store! What would you like to order today?",
    time: '9:30 AM',
  },
  {
    id: '3',
    role: 'customer',
    text: 'I want 2 Pepsi, 1 big Indomie and 1 Cabin biscuit abeg',
    time: '9:38 AM',
  },
  {
    id: '4',
    role: 'ai',
    text: '',
    time: '9:39 AM',
    type: 'order-summary',
    order: {
      items: [
        { name: 'Pepsi 60cl', qty: 2, price: 300 },
        { name: 'Indomie Big', qty: 1, price: 250 },
        { name: 'Cabin Biscuit', qty: 1, price: 150 },
      ],
      total: 1000,
      paymentUrl: '#',
    },
  },
];

const now = () => new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [paid, setPaid] = useState(false);
  const [sending, setSending] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  async function sendMessage() {
    if (!input.trim() || sending) return;
    const userMsg: Msg = { id: Date.now().toString(), role: 'customer', text: input, time: now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setSending(true);
    setTyping(true);

    try {
      const res = await fetch('/api/messages/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'sim_chat',
          vendorId: 'demo-vendor',
          senderId: 'demo-customer',
          text: input,
        }),
      });
      const data = await res.json();
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          text: data.text || 'Got it! Let me process your order.',
          time: now(),
          type: data.order ? 'order-summary' : 'text',
          order: data.order,
        },
      ]);
    } catch {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          text: 'Got it! Processing your order...',
          time: now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function simulatePayment() {
    if (paid) return;
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setPaid(true);
      setMessages((m) => [
        ...m,
        {
          id: Date.now().toString(),
          role: 'ai',
          time: now(),
          text: 'Payment confirmed! ₦1,000 received.\n\nYour order is being prepared. Thank you!\n\nReceipt: ISW-20240323-0018',
        },
      ]);
    }, 1800);
  }

  return (
    <div className="min-h-screen bg-[#e5ddd5] flex flex-col">
      {/* Header */}
      <div className="bg-green px-4 pt-14 pb-3.5 flex items-center gap-3">
        <a href="/vendor/dashboard" className="text-white">
          <ChevronLeft className="w-7 h-7" />
        </a>
        <div className="relative">
          <div className="w-10 h-10 bg-amber rounded-full flex items-center justify-center font-bold text-base text-green">
            TK
          </div>
          <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-[#4dff91] rounded-full border-2 border-green" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-[15px] text-white">Tunde Kareem</p>
          <p className="text-xs text-white/60">Aisha's Drinks Store</p>
        </div>
        <div className="text-white/60">
          <Menu className="w-5 h-5" />
        </div>
      </div>

      {/* Demo sim banner */}
      {!paid && (
        <div className="bg-gradient-to-r from-amber to-[#e5951a] px-4 py-2.5 flex items-center justify-between">
          <p className="text-xs font-semibold text-green inline-flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Demo Mode - Simulate a payment
          </p>
          <button
            onClick={simulatePayment}
            className="bg-green text-white text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
          >
            Pay Now <CheckCheck className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div
        ref={bodyRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2 chat-pattern"
      >
        <div className="self-center bg-white/60 text-[11px] text-ink-light px-3 py-1 rounded-xl">
          Today
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
          >
            {msg.type === 'order-summary' && msg.order ? (
              <div className="max-w-[88%] bg-white rounded-2xl overflow-hidden shadow-md">
                <div className="bg-green px-4 py-2.5 text-[13px] font-bold text-white">
                  <span className="inline-flex items-center gap-1.5">
                    <ShoppingCart className="w-4 h-4" />
                    Order Summary
                  </span>
                </div>
                <div className="p-4 space-y-1.5">
                  {msg.order.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex justify-between text-[13px] text-ink-mid border-b border-cream-dark pb-1.5"
                    >
                      <span>
                        {item.qty}× {item.name}
                      </span>
                      <span>₦{(item.qty * item.price).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-[15px] text-ink pt-1">
                    <span>Total</span>
                    <span>₦{msg.order.total.toLocaleString()}</span>
                  </div>
                </div>
                <button className="w-full bg-green text-white py-3 text-sm font-bold flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" /> Pay ₦{msg.order.total.toLocaleString()} via
                  Interswitch
                </button>
              </div>
            ) : (
              <div
                className={`max-w-[82%] px-3.5 py-2.5 rounded-[18px] shadow-sm text-sm leading-relaxed ${
                  msg.role === 'ai'
                    ? 'bg-white text-ink rounded-bl-[4px]'
                    : 'bg-[#d9fdd3] text-ink rounded-br-[4px]'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-ink-light">{msg.time}</span>
                  {msg.role === 'ai' && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white rounded-[18px] rounded-bl-[4px] px-4 py-3 shadow-sm flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-ink-light rounded-full animate-bounce-dot"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {paid && (
          <div className="self-center bg-white/60 text-[11px] text-ink-mid px-4 py-2 rounded-xl flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Inventory updated automatically
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-cream-dark px-3 py-2.5 pb-6 flex items-center gap-2.5">
        <input
          className="flex-1 bg-white rounded-full px-4 py-3 font-dm text-[15px] text-ink outline-none placeholder:text-ink-light"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="w-11 h-11 bg-green rounded-full flex items-center justify-center text-white text-lg flex-shrink-0 active:scale-90 transition-transform"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
