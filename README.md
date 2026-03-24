# BizPilot

> **AI operating system for African SME vendors.**
> Orders, payments, and inventory — handled automatically, using just photos and chat.

---

## The Problem

Over 75% of Nigerian SME commerce happens on WhatsApp. Vendors spend hours every day:

- Manually reading and responding to order messages
- Calculating totals by hand
- Chasing customers for payment confirmation
- Tracking inventory in notebooks or their head
- Losing sales because they missed a message

**BizPilot eliminates all of that.**

---

## What It Does

A vendor signs up in 2 minutes. She snaps a photo of her shelf — her catalog is built automatically. When a customer sends an order message, AI parses it, calculates the total, and generates a payment link via Interswitch. When the customer pays, the system automatically confirms the order, updates inventory, sends a receipt, and alerts the vendor if stock is running low.

The vendor does **nothing manually**.

```
Customer sends order → AI parses basket → Interswitch payment link sent
        ↓
Customer pays → Webhook fires → Inventory auto-updates → Receipt sent
        ↓
Low stock detected → Alert shown on vendor dashboard
```

---

## Features

| Feature                     | Description                                                         |
| --------------------------- | ------------------------------------------------------------------- |
| 📸 **Snap to Catalog**      | Photograph a product — Claude Vision extracts name, price, quantity |
| 🤖 **AI Order Parsing**     | Natural language orders parsed into structured baskets              |
| 💳 **Interswitch Checkout** | Real payment links via Interswitch Web Checkout API                 |
| 🔔 **Auto Inventory**       | Stock decrements automatically on payment confirmation              |
| ⚠️ **Low Stock Alerts**     | Threshold-based alerts shown on vendor dashboard                    |
| 🏦 **Bank Verification**    | Account name verified via Interswitch during onboarding             |
| 🌍 **WhatsApp-Ready**       | Adapter pattern means WhatsApp is a 1-day addition post-launch      |

---

## Tech Stack

| Layer      | Technology                               |
| ---------- | ---------------------------------------- |
| Framework  | Next.js 14 (App Router)                  |
| Styling    | Tailwind CSS                             |
| Database   | Supabase (PostgreSQL + Realtime)         |
| AI         | Anthropic Claude API (`claude-sonnet-4`) |
| Payments   | Interswitch Web Checkout + Webhooks      |
| Auth       | JWT (`jose`)                             |
| Deployment | Vercel                                   |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free)
- An [Anthropic](https://console.anthropic.com) API key
- An [Interswitch Developer](https://developer.interswitchgroup.com) account

---

### 1. Install dependencies

```bash
cd bizpilot
npm install
```

---

### 2. Set up the database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Paste the entire contents of `supabase/schema.sql`
4. Click **Run**

This creates all tables, indexes, RLS policies, and enables Realtime on the relevant tables.

---

### 3. Set up Interswitch

1. Sign up at [developer.interswitchgroup.com](https://developer.interswitchgroup.com)
2. Create a new application
3. Note your **Client ID**, **Secret Key**, **Merchant Code**, and **Pay Item ID**
4. Use the **sandbox** base URL for development:
   ```
   https://sandbox.interswitchng.com
   ```
5. Set your webhook URL in the Interswitch dashboard:
   ```
   https://your-domain.com/api/payment/webhook
   ```

> For local development, use [ngrok](https://ngrok.com) to expose your webhook:
>
> ```bash
> ngrok http 3000
> # Use the ngrok HTTPS URL as your webhook base
> ```

---

### 4. Configure environment variables

```bash
cp env.sample .env.local
```

Open `.env.local` and fill in all values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Gemini
GOOGLE_API_KEY=Aly-...

# Interswitch
INTERSWITCH_CLIENT_ID=IKIA...
INTERSWITCH_SECRET_KEY=...
INTERSWITCH_MERCHANT_CODE=MX...
INTERSWITCH_PAY_ITEM_ID=...
INTERSWITCH_BASE_URL=https://sandbox.interswitchng.com

# Auth
NEXTAUTH_SECRET=any-random-string-at-least-32-characters-long

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the register page.

---

## Project Structure

```
bizpilot/
├── src/
│   ├── app/                              # Next.js App Router pages + API routes
│   │   ├── auth/
│   │   │   ├── register/page.tsx         # Vendor sign up
│   │   │   └── login/page.tsx            # Vendor sign in
│   │   ├── onboarding/page.tsx           # 4-step onboarding wizard
│   │   ├── vendor/
│   │   │   ├── dashboard/page.tsx        # Revenue, orders, alerts
│   │   │   ├── catalog/
│   │   │   │   ├── page.tsx              # Product grid with stock bars
│   │   │   │   └── add/page.tsx          # Snap photo or type manually
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx              # Order list with status filters
│   │   │   │   └── [id]/page.tsx         # Order detail + payment info
│   │   │   └── settings/page.tsx         # Business + bank settings
│   │   ├── chat/page.tsx                 # Simulated WhatsApp UI (demo)
│   │   ├── store/[slug]/page.tsx         # Public customer-facing store
│   │   └── api/
│   │       ├── messages/
│   │       │   └── inbound/route.ts      ★ ALL channels enter here
│   │       ├── payment/
│   │       │   └── webhook/route.ts      ★ Interswitch posts here
│   │       ├── products/
│   │       │   ├── route.ts              # GET / POST products
│   │       │   └── extract/route.ts      # Claude Vision extraction
│   │       ├── vendors/
│   │       │   └── verify-account/       # Interswitch account lookup
│   │       └── auth/
│   │           ├── register/route.ts
│   │           └── login/route.ts
│   │
│   ├── lib/
│   │   ├── adapters/
│   │   │   └── index.ts                  # Channel adapter pattern
│   │   ├── services/
│   │   │   ├── ai.service.ts             # All Claude API calls
│   │   │   ├── payment.service.ts        # All Interswitch API calls
│   │   │   ├── inventory.service.ts      # Stock management
│   │   │   └── order.service.ts          # Order lifecycle
│   │   ├── types/index.ts                # Shared TypeScript types
│   │   ├── prompts.ts                    # All Claude prompts (centralised)
│   │   ├── supabase.ts                   # Supabase client (client + server)
│   │   └── utils.ts                      # cn() and helpers
│   │
│   └── components/
│       └── ui/index.tsx                  # Button, Input, Badge, Card, etc.
│
├── supabase/
│   └── schema.sql                        # Full DB schema
├── env.sample                            # Environment variable template
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Architecture

### The Channel Adapter Pattern

All messages — from any source — enter through a single endpoint and are normalized into one `InboundMessage` shape before any business logic runs.

```
Sim Chat UI ──┐
               ├──► /api/messages/inbound ──► AI ──► Orders ──► Payments ──► Inventory
WhatsApp* ─────┘
```

This means **adding WhatsApp requires zero changes** to AI parsing, order creation, payment, or inventory logic. See the WhatsApp section below.

### The Two Star Files

**`/api/messages/inbound/route.ts`**
Every customer message enters here. The flow: normalize channel → AI parses order → create order in DB → initialize Interswitch payment → return reply.

**`/api/payment/webhook/route.ts`**
Interswitch calls this on payment confirmation. The flow: verify HMAC signature → mark order paid → decrement stock → check low stock alerts → generate and store receipt.

---

## Payment Flow

```
1. Customer sends order message
2. Backend calls Interswitch Web Checkout API → receives payment URL
3. Payment URL is sent back to customer
4. Customer pays on Interswitch-hosted page (card / bank transfer / USSD)
5. Interswitch fires POST to /api/payment/webhook
6. Webhook verifies HMAC signature
7. Order marked paid → inventory decremented → receipt generated
```

**The vendor never touches the money.** It flows directly from customer → Interswitch → vendor's registered bank account. BizPilot is purely the payment initiator — it never holds funds.

**Missed webhook recovery** — For any order stuck in `pending` for more than 10 minutes, query Interswitch's transaction requery endpoint to catch webhooks that failed to deliver.

---

## Onboarding Flow

| Step                  | What happens                                                  |
| --------------------- | ------------------------------------------------------------- |
| **1 — Business**      | Business name, category, store slug, city                     |
| **2 — First Product** | Snap photo → Claude extracts details → vendor confirms        |
| **3 — Bank Details**  | Enter account number → Interswitch verifies account name live |
| **4 — Ready**         | Store link generated, shareable immediately                   |

The `onboarding_step` field ensures vendors who drop off mid-onboarding resume exactly where they left off on next login.

---

## Demo Script (3 minutes)

> _"Meet Aisha. She sells drinks on WhatsApp in Lagos."_

| Time | Action                                                                                                                     |
| ---- | -------------------------------------------------------------------------------------------------------------------------- |
| 0:00 | **Register** — create Aisha's Drinks Store with phone number                                                               |
| 0:30 | **Onboard** — snap shelf photo → AI extracts Pepsi 60cl, ₦300, 24 units → add GTBank account → account name verified       |
| 1:30 | **Chat** — customer types _"I want 2 Pepsi and 1 Indomie abeg"_ → AI replies with order summary + Interswitch payment link |
| 2:00 | **Pay** — hit **Simulate Payment** → inventory drops live on dashboard                                                     |
| 2:20 | **Dashboard** — ₦47,200 today's revenue, Coke low-stock alert, order status updated to PAID                                |
| 2:40 | **Pitch** — market size, roadmap, WhatsApp expansion                                                                       |

---

## Adding WhatsApp (Post-Hackathon)

**Step 1** — Apply for Meta WhatsApp Business API _(start early — approval takes 1–2 weeks)_

**Step 2** — Create `/src/lib/adapters/whatsapp.ts`:

```typescript
import { ChannelAdapter, InboundMessage, OutboundMessage } from '../types';

export class WhatsAppAdapter implements ChannelAdapter {
  normalize(raw: Record<string, unknown>): InboundMessage {
    const entry = (raw.entry as any)[0];
    const msg = entry.changes[0].value.messages[0];
    return {
      channel: 'whatsapp',
      senderId: msg.from,
      vendorId: entry.changes[0].value.metadata.phone_number_id,
      text: msg.text?.body,
      timestamp: new Date(Number(msg.timestamp) * 1000),
    };
  }

  formatReply(data: { text: string; paymentUrl?: string }): OutboundMessage {
    return {
      channel: 'whatsapp',
      recipientId: '',
      text: data.text,
      paymentUrl: data.paymentUrl,
    };
  }
}
```

**Step 3** — Register it in `/src/lib/adapters/index.ts`:

```typescript
import { WhatsAppAdapter } from './whatsapp';

export const adapters = {
  sim_chat: new SimChatAdapter(),
  whatsapp: new WhatsAppAdapter(), // ← one line
};
```

**Done.** Zero changes to AI, orders, payments, or inventory.

---

## Database Schema

| Table          | Purpose                                                    |
| -------------- | ---------------------------------------------------------- |
| `vendors`      | Store owners — business details, bank account, credentials |
| `products`     | Catalog — name, price, stock level, low stock threshold    |
| `orders`       | Orders — status, total, channel, customer identifier       |
| `order_items`  | Line items per order                                       |
| `payments`     | Interswitch reference, status, paid timestamp              |
| `messages`     | Full chat history per vendor (channel-agnostic)            |
| `stock_alerts` | Low stock records surfaced on dashboard                    |

Supabase **Realtime** is enabled on `orders`, `messages`, and `stock_alerts` — this powers live dashboard updates during the demo.

---

## Environment Variables

| Variable                        | Required | Description                                 |
| ------------------------------- | -------- | ------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✅       | Supabase project URL                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅       | Public anon key                             |
| `SUPABASE_SERVICE_ROLE_KEY`     | ✅       | Server-side key — never expose to client    |
| `GOOGLE_API_KEY`                | ✅       | Gemini API key                              |
| `INTERSWITCH_CLIENT_ID`         | ✅       | From Interswitch developer console          |
| `INTERSWITCH_SECRET_KEY`        | ✅       | For HMAC webhook signature verification     |
| `INTERSWITCH_MERCHANT_CODE`     | ✅       | Required for payment initialization         |
| `INTERSWITCH_PAY_ITEM_ID`       | ✅       | Payment item identifier                     |
| `INTERSWITCH_BASE_URL`          | ✅       | `https://sandbox.interswitchng.com` for dev |
| `NEXTAUTH_SECRET`               | ✅       | JWT signing secret — minimum 32 characters  |
| `NEXT_PUBLIC_APP_URL`           | ✅       | Full app URL including protocol             |

---

## Deployment

### Vercel (recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy preview
vercel

# Add all environment variables
vercel env add GOOGLE_API_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... repeat for all variables

# Deploy to production
vercel --prod
```

After deploying:

1. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
2. Update your Interswitch webhook URL to:
   ```
   https://your-app.vercel.app/api/payment/webhook
   ```

---

## Team

| Role                  | Responsibilities                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| **Software Engineer** | All UI/UX pages, auth flows, vendor dashboard, CRUD API routes, Supabase schema, Vercel deployment       |
| **AI Engineer**       | Gemini API integration, Interswitch payment service, channel adapters, TypeScript types, webhook handler |

---

## Built For

**Enyata Buildathon** · 72 hours · Next.js + Supabase + Claude API + Interswitch

---

> _"We help African SME vendors run their entire business — orders, payments, and inventory — using just photos and chat, with no manual work."_
