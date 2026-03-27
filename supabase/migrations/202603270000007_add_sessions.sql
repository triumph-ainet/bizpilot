-- Add sessions table to persist customer sessions and shareable links
create table if not exists sessions (
  id                uuid primary key default gen_random_uuid(),
  vendor_id         uuid references vendors(id) on delete cascade,
  order_id          uuid references orders(id) on delete set null,
  token             text not null unique default gen_random_uuid(),
  customer_identifier text,
  customer_email    text,
  last_accessed     timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
create index on sessions(vendor_id);
create index on sessions(order_id);
create index on sessions(token);

alter publication supabase_realtime add table sessions;

alter table sessions enable row level security;
