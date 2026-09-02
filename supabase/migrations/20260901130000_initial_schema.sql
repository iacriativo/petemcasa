-- GATE-03: estrutura relacional inicial do MVP Pet em Casa.
-- Dados internos e acesso publico serao protegidos na migration seguinte.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 100),
  slug text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  parent_id uuid references public.categories(id) on delete restrict,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (parent_id is null or parent_id <> id)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 180),
  description text,
  brand text,
  category_id uuid references public.categories(id) on delete restrict,
  public_image_url text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 1 and 100),
  base_url text not null check (base_url ~ '^https://'),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete restrict,
  source_id uuid not null references public.sources(id) on delete restrict,
  source_url text not null check (source_url ~ '^https://'),
  collected_price numeric(12, 2) not null check (collected_price > 0),
  original_price numeric(12, 2) check (original_price is null or original_price > 0),
  promotion_data jsonb,
  availability text not null default 'unknown'
    check (availability in ('available', 'unavailable', 'unknown')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'published', 'rejected', 'expired', 'unavailable')),
  collected_at timestamptz not null default timezone('utc', now()),
  last_verified_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (id, product_id),
  check (expires_at is null or expires_at >= collected_at)
);

create table public.price_history (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete restrict,
  observed_price numeric(12, 2) not null check (observed_price > 0),
  original_price numeric(12, 2) check (original_price is null or original_price > 0),
  availability text not null
    check (availability in ('available', 'unavailable', 'unknown')),
  collected_at timestamptz not null default timezone('utc', now())
);

create table public.offer_reviews (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete restrict,
  admin_user_id uuid not null references auth.users(id) on delete restrict,
  status text not null check (status in ('approved', 'rejected')),
  notes text,
  reviewed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.publications (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null unique,
  product_id uuid not null references public.products(id) on delete restrict,
  sale_price numeric(12, 2) not null check (sale_price > 0),
  availability text not null default 'available'
    check (availability in ('available', 'unavailable')),
  pricing_type text not null default 'markup'
    check (pricing_type in ('markup', 'manual')),
  pricing_value numeric(8, 2) not null default 30
    check (pricing_value >= 0),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'unpublished')),
  published_at timestamptz,
  unpublished_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (offer_id, product_id)
    references public.offers (id, product_id) on delete restrict,
  check (unpublished_at is null or published_at is not null),
  check (unpublished_at is null or unpublished_at >= published_at)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  pet_name text not null check (char_length(trim(pet_name)) between 1 and 100),
  block text not null check (char_length(trim(block)) between 1 and 30),
  unit_number text not null check (char_length(trim(unit_number)) between 1 and 30),
  total numeric(12, 2) not null check (total > 0),
  status text not null default 'CRIADO'
    check (status in ('CRIADO', 'ENCAMINHADO_WHATSAPP', 'EM_ATENDIMENTO', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO')),
  client_order_token uuid not null unique,
  order_token uuid not null unique default gen_random_uuid(),
  whatsapp_sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price > 0),
  subtotal numeric(12, 2) generated always as (quantity * unit_price) stored,
  product_name_snapshot text not null check (char_length(trim(product_name_snapshot)) between 1 and 180),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.app_settings (
  id smallint primary key default 1 check (id = 1),
  condominium_name text not null check (char_length(trim(condominium_name)) between 1 and 160),
  whatsapp_number text not null check (whatsapp_number ~ '^[0-9]{10,15}$'),
  admin_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.rate_guard (
  id uuid primary key default gen_random_uuid(),
  client_ip inet not null,
  window_start timestamptz not null,
  request_count integer not null default 1 check (request_count > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (client_ip, window_start)
);

create index categories_active_sort_order_idx on public.categories (active, sort_order, name);
create index products_category_id_idx on public.products (category_id);
create index offers_source_id_idx on public.offers (source_id);
create index offers_product_id_idx on public.offers (product_id);
create index offers_status_idx on public.offers (status, collected_at desc);
create index price_history_offer_id_idx on public.price_history (offer_id, collected_at desc);
create index offer_reviews_offer_id_idx on public.offer_reviews (offer_id, reviewed_at desc);
create index publications_catalog_idx on public.publications (status, published_at, unpublished_at);
create index orders_status_created_at_idx on public.orders (status, created_at desc);
create index order_items_order_id_idx on public.order_items (order_id);
create index rate_guard_window_start_idx on public.rate_guard (window_start);

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger sources_set_updated_at
before update on public.sources
for each row execute function public.set_updated_at();

create trigger offers_set_updated_at
before update on public.offers
for each row execute function public.set_updated_at();

create trigger publications_set_updated_at
before update on public.publications
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger app_settings_set_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

create trigger rate_guard_set_updated_at
before update on public.rate_guard
for each row execute function public.set_updated_at();
