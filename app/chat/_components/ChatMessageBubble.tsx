'use client';

import { useState } from 'react';

type ChatMessage = {
  id: string;
  sender: string;
  content: string;
  created_at: string;
};

const PREVIEW_LENGTH = 200;

function formatMessageTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const [expanded, setExpanded] = useState(false);
  const isVendor = message.sender === 'vendor';
  const isLong = message.content.length > PREVIEW_LENGTH;
  const preview = `${message.content.slice(0, PREVIEW_LENGTH)}...`;
  const displayContent = expanded || !isLong ? message.content : preview;

  return (
    <div className={`flex ${isVendor ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[60%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isVendor
            ? 'bg-gradient-to-br from-green to-green-mid text-white'
            : 'border border-[#ece1d2] bg-white text-ink'
        }`}
      >
        <div className="whitespace-pre-line text-sm break-words overflow-hidden">
          {displayContent}
        </div>

        {isLong ? (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className={`mt-1 text-xs font-semibold transition ${
              isVendor ? 'text-white/90 hover:text-white' : 'text-green hover:text-green-mid'
            }`}
          >
            {expanded ? 'Read less' : 'Read more'}
          </button>
        ) : null}

        <div
          className={`mt-1 flex items-center justify-end gap-2 text-[10px] ${
            isVendor ? 'text-white/80' : 'text-ink-light'
          }`}
        >
          <span>{formatMessageTime(message.created_at)}</span>
          {isVendor ? <span className="text-xs">✓✓</span> : null}
        </div>
      </div>
    </div>
  );
}
