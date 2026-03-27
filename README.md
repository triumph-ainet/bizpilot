# BizPilot

> **Run your business in autopilot.**
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
| Framework  | Next.js 16 (App Router)                  |
| Styling    | Tailwind CSS                             |
| Database   | Supabase (PostgreSQL + Realtime)         |
| AI         | Google Gemini (`gemini-2.5-flash-kite`) |
| Payments   | Interswitch Web Checkout + Webhooks     |
                            
| Deployment | Vercel                                   |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free)
- A [Gemini](https://ai.studio.google.com) API key
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
3. Paste the entire contents of `supabase/migrations/**`
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

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---


## Architecture

### The Channel Adapter Pattern

All messages — from any source — enter through a single endpoint and are normalized into one `InboundMessage` shape before any business logic runs.

```
Sim Chat UI ──┐
               ├──► /api/messages/inbound ──► AI ──► Orders ──► Payments ──► Inventory
WhatsApp* ─────┘
```

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
| **Software Engineer** [Fatiha Azeez](https://gitHub.com/devTiyah) All UI/UX pages, auth flows, vendor dashboard, CRUD API routes, Supabase schema, Vercel deployment       |
| **AI Engineer**  [Emmanuel Lafenwa](https://gitHub.com/leoemaxie)  | Gemini API integration, Interswitch payment service, channel adapters, TypeScript types, webhook handler |

---

## Built For

72 hours **Enyata Buildathon**