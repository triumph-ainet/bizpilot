-- Add message_subscriptions table to store email subscriptions for customer chats

CREATE TABLE IF NOT EXISTS message_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id uuid NOT NULL,
  customer_identifier text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_message_subscriptions_vendor_customer ON message_subscriptions(vendor_id, customer_identifier);
