-- Catalog tables + RLS. Money is integer piasters (قروش). See docs/01 §4.

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null,
  sort int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  slug text not null unique,
  name_ar text not null,
  description_ar text,
  material text,
  min_qty int not null default 1 check (min_qty > 0),
  sizes jsonb not null default '[]'::jsonb,
  handle_types jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists price_tiers (
  product_id uuid not null references products(id) on delete cascade,
  min_qty int not null check (min_qty > 0),
  unit_price_piasters int not null check (unit_price_piasters >= 0),
  primary key (product_id, min_qty)
);

create table if not exists portfolio_items (
  id uuid primary key default gen_random_uuid(),
  image_path text not null,
  caption_ar text,
  client_label text,
  approved boolean not null default false,
  product_id uuid references products(id) on delete set null,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists app_config (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default false
);

-- updated_at trigger for products
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on products;
create trigger products_touch_updated_at
  before update on products
  for each row execute function public.touch_updated_at();

-- RLS
alter table categories enable row level security;
alter table products enable row level security;
alter table price_tiers enable row level security;
alter table portfolio_items enable row level security;
alter table app_config enable row level security;

-- anon/public read of active catalog
create policy categories_public_read on categories
  for select to anon, authenticated using (active = true);

create policy products_public_read on products
  for select to anon, authenticated using (active = true);

create policy price_tiers_public_read on price_tiers
  for select to anon, authenticated using (
    exists (select 1 from products p where p.id = price_tiers.product_id and p.active)
  );

create policy portfolio_public_read on portfolio_items
  for select to anon, authenticated using (approved = true);

create policy app_config_public_read on app_config
  for select to anon, authenticated using (is_public = true);

-- admins (placeholder; is_admin() defined in a later migration)
-- Admin write policies are added once admins/is_admin exist. For now, only service role writes.
EOF
echo "migration written"; wc -l supabase/migrations/0001_catalog.sql