-- Add message_reads to store last_read timestamp per vendor/customer

CREATE TABLE IF NOT EXISTS message_reads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id uuid NOT NULL,
  customer_identifier text NOT NULL,
  last_read timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_message_reads_vendor_customer ON message_reads (vendor_id, customer_identifier);
