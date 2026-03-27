-- Add feedback and ratings table
create table if not exists feedbacks (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references vendors(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  customer_identifier text,
  rating int check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

create index if not exists idx_feedbacks_vendor on feedbacks(vendor_id);
create index if not exists idx_feedbacks_order on feedbacks(order_id);

-- expose via realtime
alter publication supabase_realtime add table feedbacks;