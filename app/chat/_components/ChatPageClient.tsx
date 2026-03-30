'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ChatWindow from './ChatWindowClient';

type Contact = { customer: string; lastMessage?: string; lastAt?: string; unread?: number };

function formatContactTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function initialsFromCustomer(customer: string) {
  return customer?.trim().slice(-2, 0).toUpperCase() || 'CU';
}

export default function ChatPageClient({
  vendorId,
  initialContacts,
}: {
  vendorId: string;
  initialContacts: Contact[];
}) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts || []);
  const [selected, setSelected] = useState<string | null>(initialContacts?.[0]?.customer || null);
  const [showContacts, setShowContacts] = useState<boolean>(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch('/api/chat/contacts');
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) {
          setContacts(data || []);
          if (!selected && data?.[0]) setSelected(data[0].customer);
        }
      } catch {
        // ignore
      }
    }

    load();
    const id = setInterval(load, 15000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [selected]);

  function choose(c: string) {
    setSelected(c);
    setShowContacts(false);
  }

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    const query = search.toLowerCase();
    return contacts.filter((c) => {
      const message = c.lastMessage?.toLowerCase() || '';
      return c.customer.toLowerCase().includes(query) || message.includes(query);
    });
  }, [contacts, search]);

  const selectedContact = contacts.find((x) => x.customer === selected) || null;

  return (
    <div className="px-4 pb-2 md:px-8">
      <div className="mx-auto flex h-[calc(100vh-14rem)] min-h-[540px] max-w-7xl overflow-hidden rounded-3xl border border-[#eadfce] bg-white shadow-card-lg">
        {/* Desktop sidebar */}
        <aside className="hidden w-[22rem] border-r border-[#ede3d4] bg-[#fdfaf4] md:flex md:flex-col">
          <div className="border-b border-[#ede3d4] px-5 pt-5 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="font-fraunces text-xl font-bold text-green">Conversations</h2>
              <span className="rounded-full bg-green px-2 py-1 text-[11px] font-semibold text-white">
                {contacts.length}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-light">Prioritized by latest activity</p>
          </div>

          <div className="p-4 pb-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer or message"
              className="w-full rounded-xl border border-[#e6ddcf] bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-green-light"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {filteredContacts.map((c) => (
              <button
                key={c.customer}
                onClick={() => choose(c.customer)}
                className={`mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                  selected === c.customer
                    ? 'bg-white shadow-[0_8px_20px_rgba(26,92,68,0.12)] ring-1 ring-green/10'
                    : 'hover:bg-white'
                }`}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green/10 text-xs font-bold text-green">
                  {initialsFromCustomer(c.customer)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="truncate font-medium text-ink">{c.customer}</div>
                    <div className="ml-3 text-[11px] text-ink-light">
                      {formatContactTime(c.lastAt)}
                    </div>
                  </div>
                  <div className="mt-1 truncate text-sm text-ink-light">
                    {c.lastMessage?.slice(0, 35) || 'No messages yet'}
                  </div>
                </div>
                {c.unread ? (
                  <div className="ml-1 rounded-full bg-amber px-2 py-1 text-[11px] font-bold text-white">
                    {c.unread}
                  </div>
                ) : null}
              </button>
            ))}
            {filteredContacts.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-ink-light">
                {contacts.length ? 'No results for that search.' : 'No chats yet.'}
              </div>
            )}
          </div>
        </aside>

        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-cream">
          {/* Mobile: contacts drawer */}
          {showContacts && (
            <div
              className="md:hidden fixed inset-0 z-40 bg-black/30"
              onClick={() => setShowContacts(false)}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-[84vw] max-w-sm bg-[#fdfaf4] p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-2 px-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-mid">
                    Chats
                  </p>
                  <h3 className="font-fraunces text-2xl font-bold text-green">Conversations</h3>
                </div>
                <div className="mb-3 p-1">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by customer or message"
                    className="w-full rounded-xl border border-[#e6ddcf] bg-white px-3 py-2 text-sm text-ink outline-none"
                  />
                </div>
                <div className="overflow-y-auto h-[calc(100vh-6rem)]">
                  {filteredContacts.map((c) => (
                    <button
                      key={c.customer}
                      onClick={() => choose(c.customer)}
                      className={`mb-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                        selected === c.customer ? 'bg-white ring-1 ring-green/10' : 'hover:bg-white'
                      }`}
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green/10 text-xs font-bold text-green">
                        {initialsFromCustomer(c.customer)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-ink truncate">{c.customer}</div>
                          <div className="text-xs text-ink-light">
                            {formatContactTime(c.lastAt)}
                          </div>
                        </div>
                        <div className="mt-1 truncate text-sm text-ink-light">
                          {c.lastMessage || 'No messages yet'}
                        </div>
                      </div>
                      {c.unread ? (
                        <div className="ml-1 rounded-full bg-amber px-2 py-1 text-[11px] font-bold text-white">
                          {c.unread}
                        </div>
                      ) : null}
                    </button>
                  ))}
                  {filteredContacts.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-ink-light">
                      No matching conversations.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex min-h-0 flex-1 flex-col">
            {selected ? (
              <ChatWindow
                key={selected}
                vendorId={vendorId}
                customer={selected}
                lastSeen={selectedContact?.lastAt}
                onOpenContacts={() => setShowContacts(true)}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-ink-light">
                Select a conversation
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
