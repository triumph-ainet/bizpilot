alter table vendors add column if not exists low_stock_threshold int default
alter table vendors add column if not exists email text;
create index if not exists idx_vendors_id on vendors(id);
