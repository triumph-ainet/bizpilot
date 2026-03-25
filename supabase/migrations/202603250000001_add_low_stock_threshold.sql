-- Add low_stock_threshold to vendors table if it doesn't exist
alter table vendors add column if not exists low_stock_threshold int default 5;

-- Add email column for potential future use
alter table vendors add column if not exists email text;

-- Create index for faster lookups
create index if not exists idx_vendors_id on vendors(id);
