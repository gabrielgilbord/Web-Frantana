-- FRANTANA Supabase schema
-- Apply in Supabase SQL editor or via CLI when connecting a project.
-- Never expose service_role keys in the frontend.

create extension if not exists "pgcrypto";

create table if not exists public.site_content (
  id text primary key default 'main',
  hero_subtitle text not null default '',
  home_intro_title text not null default '',
  home_intro_body text not null default '',
  about_title text not null default '',
  about_body text not null default '',
  about_story_title text not null default '',
  about_story_body text not null default '',
  music_intro text not null default '',
  spotify_embed_url text,
  spotify_artist_url text,
  contact_email text,
  contact_phone text,
  social jsonb not null default '{}'::jsonb,
  seo_description text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.concerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  time time,
  city text not null,
  venue text not null,
  ticket_url text,
  ticket_status text not null default 'tba'
    check (ticket_status in ('available','limited','sold_out','free','cancelled','tba')),
  published boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  alt text not null,
  width int not null default 1600,
  height int not null default 1067,
  published boolean not null default false,
  sort_order int not null default 0,
  credit text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  category text not null check (category in ('merch','digital','physical_music')),
  images text[] not null default '{}',
  published boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text not null unique,
  price_cents int not null check (price_cents >= 0),
  currency text not null default 'EUR',
  stock int not null default 0 check (stock >= 0),
  attributes jsonb not null default '{}'::jsonb
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft'
    check (status in ('draft','pending_payment','paid','fulfilled','cancelled','refunded')),
  email text not null,
  items jsonb not null default '[]'::jsonb,
  total_cents int not null default 0,
  currency text not null default 'EUR',
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Storage bucket for gallery / product images (create via dashboard too)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

alter table public.site_content enable row level security;
alter table public.concerts enable row level security;
alter table public.gallery_images enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;

-- Public read of published content only
create policy "Public read published concerts"
  on public.concerts for select
  using (published = true);

create policy "Public read published gallery"
  on public.gallery_images for select
  using (published = true);

create policy "Public read site content"
  on public.site_content for select
  using (true);

create policy "Public read published products when shop enabled"
  on public.products for select
  using (published = true);

create policy "Public read variants of published products"
  on public.product_variants for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.published = true
    )
  );

-- Admin writes: authenticated users only (map admin via auth.users)
create policy "Admin write concerts"
  on public.concerts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin write gallery"
  on public.gallery_images for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin write content"
  on public.site_content for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin write products"
  on public.products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin write variants"
  on public.product_variants for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin write orders"
  on public.orders for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Public read media"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "Admin upload media"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "Admin update media"
  on storage.objects for update
  using (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "Admin delete media"
  on storage.objects for delete
  using (bucket_id = 'media' and auth.role() = 'authenticated');
