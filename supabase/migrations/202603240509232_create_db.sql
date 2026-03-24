-- BizPilot Database Schema
create table if not exists vendors (
  id                  uuid primary key default gen_random_uuid(),
  business_name       text not null,
  phone               text not null unique,
  password_hash       text not null,
  bank_name           text,
  bank_code           text,
  account_number      text,
  account_name        text,
  account_verified_at timestamptz,
  store_slug          text unique,
  onboarding_step     int default 1,
  is_active           boolean default true,
  created_at          timestamptz default now()
);

create table if not exists products (
  id                  uuid primary key default gen_random_uuid(),
  vendor_id           uuid references vendors(id) on delete cascade,
  name                text not null,
  price               numeric(10,2) not null,
  quantity            int not null default 0,
  image_url           text,
  low_stock_threshold int default 5,
  created_at          timestamptz default now()
);
create index on products(vendor_id);

create table if not exists orders (
  id                  uuid primary key default gen_random_uuid(),
  vendor_id           uuid references vendors(id) on delete cascade,
  customer_identifier text not null,
  channel             text not null default 'sim_chat',
  status              text not null default 'pending'
                        check (status in ('pending','paid','credit','cancelled')),
  total               numeric(10,2) not null default 0,
  created_at          timestamptz default now()
);
create index on orders(vendor_id);
create index on orders(status);

create table if not exists order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid references orders(id) on delete cascade,
  product_id   uuid references products(id),
  product_name text not null,
  quantity     int not null,
  unit_price   numeric(10,2) not null
);
create index on order_items(order_id);

create table if not exists payments (
  id                      uuid primary key default gen_random_uuid(),
  order_id                uuid references orders(id) on delete cascade unique,
  interswitch_reference   text not null,
  amount                  numeric(10,2) not null,
  status                  text default 'pending'
                            check (status in ('pending','confirmed','failed')),
  paid_at                 timestamptz
);
create index on payments(interswitch_reference);

create table if not exists messages (
  id         uuid primary key default gen_random_uuid(),
  vendor_id  uuid references vendors(id) on delete cascade,
  sender     text not null check (sender in ('customer','ai')),
  channel    text not null default 'sim_chat',
  content    text not null,
  created_at timestamptz default now()
);
create index on messages(vendor_id);

create table if not exists stock_alerts (
  id           uuid primary key default gen_random_uuid(),
  vendor_id    uuid references vendors(id) on delete cascade,
  product_id   uuid references products(id) on delete cascade unique,
  product_name text not null,
  quantity     int,
  threshold    int,
  resolved     boolean default false,
  created_at   timestamptz default now()
);

alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table stock_alerts;
alter publication supabase_realtime add table messages;

alter table vendors       enable row level security;
alter table products      enable row level security;
alter table orders        enable row level security;
alter table order_items   enable row level security;
alter table payments      enable row level security;
alter table messages      enable row level security;
alter table stock_alerts  enable row level security;