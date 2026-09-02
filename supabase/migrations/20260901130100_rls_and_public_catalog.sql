-- GATE-03: fronteira de acesso publico, administrativo e interno.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.app_settings
    where admin_user_id = (select auth.uid())
  );
$$;

create or replace function private.is_product_published(target_product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.products product
    join public.categories category on category.id = product.category_id
    join public.publications publication on publication.product_id = product.id
    where product.id = target_product_id
      and product.active
      and category.active
      and publication.status = 'published'
      and publication.availability = 'available'
      and publication.published_at is not null
      and publication.published_at <= timezone('utc', now())
      and (publication.unpublished_at is null or publication.unpublished_at > timezone('utc', now()))
  );
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function private.is_admin() from public, anon, authenticated;
revoke all on function private.is_product_published(uuid) from public, anon, authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_product_published(uuid) to anon, authenticated;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.sources enable row level security;
alter table public.offers enable row level security;
alter table public.price_history enable row level security;
alter table public.offer_reviews enable row level security;
alter table public.publications enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.app_settings enable row level security;
alter table public.rate_guard enable row level security;

revoke all on all tables in schema public from anon, authenticated;

grant select (id, name, slug, parent_id, sort_order) on public.categories to anon;
grant select (id, name, description, brand, category_id, public_image_url) on public.products to anon;
grant select (id, product_id, sale_price, availability, status, published_at, unpublished_at)
  on public.publications to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

create policy "public reads active categories"
on public.categories for select to anon
using (active);

create policy "public reads published products"
on public.products for select to anon
using ((select private.is_product_published(id)));

create policy "public reads published publications"
on public.publications for select to anon
using (
  status = 'published'
  and availability = 'available'
  and published_at is not null
  and published_at <= timezone('utc', now())
  and (unpublished_at is null or unpublished_at > timezone('utc', now()))
);

create policy "admin manages categories"
on public.categories for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "admin manages products"
on public.products for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "admin manages sources"
on public.sources for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "admin manages offers"
on public.offers for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "admin manages price history"
on public.price_history for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "admin manages offer reviews"
on public.offer_reviews for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "admin manages publications"
on public.publications for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "admin manages orders"
on public.orders for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "admin manages order items"
on public.order_items for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "admin manages app settings"
on public.app_settings for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "admin manages rate guard"
on public.rate_guard for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create view public.public_catalog
with (security_invoker = true)
as
select
  product.id as product_id,
  publication.id as publication_id,
  product.name,
  product.description,
  product.brand,
  category.id as category_id,
  category.name as category_name,
  category.slug as category_slug,
  product.public_image_url,
  publication.sale_price,
  publication.availability
from public.products product
join public.categories category on category.id = product.category_id
join public.publications publication on publication.product_id = product.id
where product.active
  and category.active
  and publication.status = 'published'
  and publication.availability = 'available'
  and publication.published_at is not null
  and publication.published_at <= timezone('utc', now())
  and (publication.unpublished_at is null or publication.unpublished_at > timezone('utc', now()));

revoke all on public.public_catalog from public, anon, authenticated;
grant select on public.public_catalog to anon, authenticated;
