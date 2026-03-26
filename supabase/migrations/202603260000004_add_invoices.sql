-- Add invoices table
create table if not exists invoices (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid references orders(id) on delete cascade unique,
  invoice_number   text not null unique,
  status           text not null default 'pending' check (status in ('pending','paid','cancelled')),
  amount           numeric(10,2) not null default 0,
  due_at           timestamptz,
  items            jsonb,
  pdf_url          text,
  created_at       timestamptz default now()
);
create index on invoices(order_id);

alter publication supabase_realtime add table invoices;

alter table invoices enable row level security;
