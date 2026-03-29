"use client";

import React, { useEffect, useState } from "react";
import ChatWindow from "./ChatWindowClient";

type Contact = { customer: string; lastMessage?: string; lastAt?: string; unread?: number };

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

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/chat/contacts");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) {
          setContacts(data || []);
          if (!selected && data?.[0]) setSelected(data[0].customer);
        }
      } catch (e) {
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

  const selectedContact = contacts.find((x) => x.customer === selected) || null;

  return (
    <div className="px-4 py-4">
      <div className="shadow-card rounded-2xl overflow-hidden bg-white flex h-[75vh]">
        {/* Desktop sidebar */}
        <aside className="w-80 border-r border-gray-100 bg-white hidden md:flex flex-col">
          <div className="p-4 border-b flex items-center gap-3">
            <div className="font-bold text-lg">Chats</div>
            <div className="ml-auto text-xs text-ink-light">Online</div>
          </div>

          <div className="p-3">
            <input
              placeholder="Search or start new chat"
              className="w-full bg-cream px-3 py-2 rounded-full text-sm outline-none"
            />
          </div>

          <div className="overflow-y-auto flex-1">
            {contacts.map((c) => (
              <button
                key={c.customer}
                onClick={() => choose(c.customer)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-cream/60 transition ${
                  selected === c.customer ? "bg-cream/80" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-ink break-all">{c.customer}</div>
                    <div className="text-xs text-ink-light">{c.lastAt ? new Date(c.lastAt).toLocaleTimeString() : ""}</div>
                  </div>
                  <div className="text-sm text-ink-light truncate mt-1">{c.lastMessage}</div>
                </div>
                {c.unread ? (
                  <div className="ml-2 bg-green text-white text-xs font-bold px-2 py-1 rounded-full">{c.unread}</div>
                ) : null}
              </button>
            ))}
            {contacts.length === 0 && <div className="p-4 text-sm text-ink-light">No chats yet</div>}
          </div>
        </aside>

        <main className="flex-1 bg-cream relative">
          {/* Mobile: contacts drawer */}
          {showContacts && (
            <div className="md:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setShowContacts(false)}>
              <div className="absolute left-0 top-0 bottom-0 w-80 bg-white p-4" onClick={(e) => e.stopPropagation()}>
                <div className="p-1 mb-3">
                  <input
                    placeholder="Search or start new chat"
                    className="w-full bg-cream px-3 py-2 rounded-full text-sm outline-none"
                  />
                </div>
                <div className="overflow-y-auto h-[calc(100vh-6rem)]">
                  {contacts.map((c) => (
                    <button
                      key={c.customer}
                      onClick={() => choose(c.customer)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-cream/60 transition ${
                        selected === c.customer ? "bg-cream/80" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-ink break-all">{c.customer}</div>
                          <div className="text-xs text-ink-light">{c.lastAt ? new Date(c.lastAt).toLocaleTimeString() : ""}</div>
                        </div>
                        <div className="text-sm text-ink-light truncate mt-1">{c.lastMessage}</div>
                      </div>
                      {c.unread ? (
                        <div className="ml-2 bg-green text-white text-xs font-bold px-2 py-1 rounded-full">{c.unread}</div>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col">
            {selected ? (
              <ChatWindow
                vendorId={vendorId}
                customer={selected}
                lastSeen={selectedContact?.lastAt}
                onOpenContacts={() => setShowContacts(true)}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-ink-light">Select a conversation</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
