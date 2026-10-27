-- Orders, items, audit events, proofs and plumbing. Money is integer piasters.
-- Access model (docs/01 §5): anon has NO access to any table here.
-- Writes happen through Edge Functions with the service-role key; admins read/update via RLS.

-- Status machine (docs/02 §1)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum (
      'submitted','quoted','awaiting_payment','proof_uploaded','paid',
      'in_production','ready','delivered','cancelled','expired'
    );
  end if;
end $$;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  public_token text not null unique,
  status order_status not null default 'submitted',
  customer_name text not null,
  phone text not null,
  governorate text not null,
  address text,
  notes text,
  subtotal_piasters int not null check (subtotal_piasters >= 0),
  deposit_piasters int not null check (deposit_piasters >= 0),
  idempotency_key text not null unique,
  requires_manual_quote boolean not null default false,
  expires_at timestamptz,
  utm jsonb not null default '{}'::jsonb,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  -- Snapshot: catalog edits must never rewrite past orders.
  product_name text not null,
  variant jsonb not null default '{}'::jsonb,
  qty int not null check (qty > 0),
  unit_price_piasters int not null check (unit_price_piasters >= 0),
  line_total_piasters int generated always as (qty * unit_price_piasters) stored,
  print_spec jsonb,
  logo_path text
);

create table if not exists order_events (
  id bigserial primary key,
  order_id uuid not null references orders(id) on delete cascade,
  from_status order_status,
  to_status order_status not null,
  actor text not null,
  note text,
  at timestamptz not null default now()
);

create table if not exists payment_proofs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  file_path text not null,
  sha256 text not null,
  sender_hint text,
  amount_claimed_piasters int check (amount_claimed_piasters >= 0),
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  reject_reason text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists rate_limits (
  key text not null,
  window_start timestamptz not null,
  count int not null default 0 check (count >= 0),
  primary key (key, window_start)
);

create table if not exists telegram_staff (
  telegram_user_id bigint primary key,
  name text,
  role text not null default 'staff' check (role in ('staff','admin')),
  active boolean not null default true
);

create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz not null default now()
);

-- updated_at trigger (reuse the catalog helper)
drop trigger if exists orders_touch_updated_at on orders;
create trigger orders_touch_updated_at
  before update on orders
  for each row execute function public.touch_updated_at();

-- Admin check used by RLS. SECURITY DEFINER so it can read admins without recursion.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Indexes for staff screens and cron
create index if not exists orders_status_created_idx on orders (status, created_at desc);
create index if not exists orders_phone_idx on orders (phone);
create index if not exists orders_expires_idx on orders (expires_at) where status = 'awaiting_payment';
create index if not exists order_items_order_idx on order_items (order_id);
create index if not exists order_events_order_idx on order_events (order_id, at);
create index if not exists payment_proofs_order_idx on payment_proofs (order_id);
create index if not exists payment_proofs_sha_idx on payment_proofs (sha256);

-- RLS: enable everywhere; no anon policies exist on purpose.
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_events enable row level security;
alter table payment_proofs enable row level security;
alter table rate_limits enable row level security;
alter table telegram_staff enable row level security;
alter table admins enable row level security;

-- Admins may read and update orders; inserts/status writes come from Edge Functions.
create policy orders_admin_read on orders
  for select to authenticated using (public.is_admin());

create policy orders_admin_update on orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy order_items_admin_read on order_items
  for select to authenticated using (public.is_admin());

create policy order_events_admin_read on order_events
  for select to authenticated using (public.is_admin());

create policy payment_proofs_admin_read on payment_proofs
  for select to authenticated using (public.is_admin());

create policy payment_proofs_admin_update on payment_proofs
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy telegram_staff_admin_read on telegram_staff
  for select to authenticated using (public.is_admin());

create policy telegram_staff_admin_write on telegram_staff
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- An admin can see their own row (used by the /admin guard).
create policy admins_self_read on admins
  for select to authenticated using (user_id = auth.uid());

-- rate_limits: service-role only, intentionally no policies.
-- order_events is append-only: no update/delete policies.

-- Atomic fixed-window counter used by create-order. Returns the new count.
create or replace function public.bump_rate_limit(
  p_key text,
  p_window_start timestamptz
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count int;
begin
  insert into public.rate_limits (key, window_start, count)
  values (p_key, p_window_start, 1)
  on conflict (key, window_start)
    do update set count = public.rate_limits.count + 1
  returning count into current_count;

  return current_count;
end;
$$;

revoke all on function public.bump_rate_limit(text, timestamptz) from public;
grant execute on function public.bump_rate_limit(text, timestamptz) to service_role;
