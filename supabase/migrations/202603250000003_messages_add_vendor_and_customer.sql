-- Allow vendor sender and add customer_identifier to messages
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_check;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS customer_identifier text;
ALTER TABLE messages ADD CONSTRAINT messages_sender_check CHECK (sender in ('customer','ai','vendor','system'));
CREATE INDEX IF NOT EXISTS messages_customer_identifier_idx ON messages(customer_identifier);
