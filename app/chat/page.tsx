"use client";

import { useEffect, useState } from 'react';
import { BottomNav } from '@/components/ui';

type Contact = { customer: string; lastMessage?: string; lastAt?: string; unread?: number };

export default function ChatPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    fetch('/api/chat/contacts')
      .then((r) => r.json())
      .then((data) => setContacts(data))
      .catch(() => setContacts([]));
  }, []);

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="bg-green px-6 pt-14 pb-5">
        <h1 className="font-fraunces text-2xl font-extrabold text-white">Chats</h1>
      </div>

      <div className="px-6 py-5 space-y-3">
        {contacts.map((c) => (
          <a key={c.customer} href={`/chat/${encodeURIComponent(c.customer)}`}>
            <div className="bg-white rounded-2xl p-4 shadow-card active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber rounded-full flex items-center justify-center font-bold text-base text-green">
                  {c.customer.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center gap-3">
                    <div>
                      <p className="font-bold text-ink">{c.customer}</p>
                      <p className="text-sm text-ink-light mt-1 truncate w-[260px]">{c.lastMessage}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-ink-light">{c.lastAt ? new Date(c.lastAt).toLocaleString() : ''}</p>
                      {c.unread ? (
                        <div className="mt-2 ml-auto inline-flex items-center justify-center bg-green text-white text-xs font-bold px-2 py-1 rounded-full">
                          {c.unread}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
        ))}

        {contacts.length === 0 && (
          <div className="bg-white rounded-2xl p-5 text-sm text-ink-light text-center shadow-card">No chats yet</div>
        )}
      </div>

      <BottomNav active="/chat" />
    </div>
  );
}
