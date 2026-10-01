-- FRANTANA · migration 002
-- Occupancy calendar, text IDs, bookings, shop columns.
-- Apply in Supabase SQL Editor (or supabase db push) AFTER 001_initial.

create extension if not exists "pgcrypto";

-- ——— concerts: map/image + calendar hold flag; allow text ids ———
alter table public.concerts
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists image text,
  add column if not exists blocks_calendar boolean not null default true;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'concerts'
      and column_name = 'id' and data_type = 'uuid'
  ) then
    alter table public.concerts alter column id type text using id::text;
  end if;
end $$;

-- ——— products / variants / gallery / orders: text ids ———
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products'
      and column_name = 'id' and data_type = 'uuid'
  ) then
    alter table public.product_variants drop constraint if exists product_variants_product_id_fkey;
    alter table public.products alter column id type text using id::text;
    alter table public.product_variants alter column id type text using id::text;
    alter table public.product_variants alter column product_id type text using product_id::text;
    alter table public.product_variants
      add constraint product_variants_product_id_fkey
      foreign key (product_id) references public.products(id) on delete cascade;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'gallery_images'
      and column_name = 'id' and data_type = 'uuid'
  ) then
    alter table public.gallery_images alter column id type text using id::text;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders'
      and column_name = 'id' and data_type = 'uuid'
  ) then
    alter table public.orders alter column id type text using id::text;
  end if;
end $$;

alter table public.orders
  add column if not exists stripe_checkout_session_id text,
  add column if not exists items jsonb not null default '[]'::jsonb;

-- ——— bookings ———
create table if not exists public.bookings (
  id text primary key,
  access_token text not null unique,
  name text not null,
  email text not null,
  phone text,
  event_type text not null
    check (event_type in ('privado','boda','corporativo','fiesta','otro')),
  preferred_date date,
  preferred_time text,
  city text not null,
  venue text,
  message text not null,
  messages jsonb not null default '[]'::jsonb,
  status text not null default 'new'
    check (status in ('new','read','replied','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

drop policy if exists "Admin write bookings" on public.bookings;
create policy "Admin write bookings"
  on public.bookings for all
  to authenticated
  using (true)
  with check (true);

-- Service role bypasses RLS; anon has no direct select on private holds.
-- Public occupancy RPC (dates only, no titles).
create or replace function public.get_occupancy(
  from_d date default current_date,
  to_d date default null
)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(row_to_json(t) order by t.date), '[]'::json)
  from (
    select
      c.date::text as date,
      case when c.published then 'public' else 'private' end as status
    from public.concerts c
    where c.date >= from_d
      and (to_d is null or c.date <= to_d)
      and c.ticket_status is distinct from 'cancelled'
      and (
        c.published = true
        or (c.published = false and c.blocks_calendar = true)
      )
  ) t;
$$;

revoke all on function public.get_occupancy(date, date) from public;
grant execute on function public.get_occupancy(date, date) to anon, authenticated, service_role;
