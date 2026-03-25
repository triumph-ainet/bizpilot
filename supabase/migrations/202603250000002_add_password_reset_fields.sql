alter table vendors add column if not exists password_reset_token text;
alter table vendors add column if not exists password_reset_expires_at timestamptz;

create index if not exists idx_vendors_password_reset_token on vendors(password_reset_token);
