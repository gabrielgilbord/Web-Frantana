-- FRANTANA · schema + seed de prueba (SQL Editor → Run)
-- Incluye ocupación de calendario (público + privados sin título),
-- tienda demo y un booking de ejemplo.
-- Tras ejecutar: descomenta SUPABASE_SERVICE_ROLE_KEY en .env.local
-- para que la app lea/escriba desde Supabase en lugar de site.json.

create extension if not exists "pgcrypto";

-- ——— schema (idempotent) ———
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
  id text primary key,
  title text not null,
  date date not null,
  time time,
  city text not null,
  venue text not null,
  lat double precision,
  lng double precision,
  image text,
  ticket_url text,
  ticket_status text not null default 'tba'
    check (ticket_status in ('available','limited','sold_out','free','cancelled','tba')),
  published boolean not null default false,
  blocks_calendar boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.concerts add column if not exists lat double precision;
alter table public.concerts add column if not exists lng double precision;
alter table public.concerts add column if not exists image text;
alter table public.concerts add column if not exists blocks_calendar boolean not null default true;

create table if not exists public.gallery_images (
  id text primary key,
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
  id text primary key,
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
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  name text not null,
  sku text not null unique,
  price_cents int not null check (price_cents >= 0),
  currency text not null default 'EUR',
  stock int not null default 0 check (stock >= 0),
  attributes jsonb not null default '{}'::jsonb
);

create table if not exists public.orders (
  id text primary key,
  status text not null default 'draft'
    check (status in ('draft','pending_payment','paid','fulfilled','cancelled','refunded')),
  email text not null,
  items jsonb not null default '[]'::jsonb,
  total_cents int not null default 0,
  currency text not null default 'EUR',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

alter table public.site_content enable row level security;
alter table public.concerts enable row level security;
alter table public.gallery_images enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "Public read published concerts" on public.concerts;
create policy "Public read published concerts"
  on public.concerts for select using (published = true);

drop policy if exists "Public read published gallery" on public.gallery_images;
create policy "Public read published gallery"
  on public.gallery_images for select using (published = true);

drop policy if exists "Public read site content" on public.site_content;
create policy "Public read site content"
  on public.site_content for select using (true);

drop policy if exists "Public read published products when shop enabled" on public.products;
create policy "Public read published products when shop enabled"
  on public.products for select using (published = true);

drop policy if exists "Public read variants of published products" on public.product_variants;
create policy "Public read variants of published products"
  on public.product_variants for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.published = true
    )
  );

drop policy if exists "Admin write concerts" on public.concerts;
create policy "Admin write concerts" on public.concerts for all to authenticated using (true) with check (true);
drop policy if exists "Admin write gallery" on public.gallery_images;
create policy "Admin write gallery" on public.gallery_images for all to authenticated using (true) with check (true);
drop policy if exists "Admin write content" on public.site_content;
create policy "Admin write content" on public.site_content for all to authenticated using (true) with check (true);
drop policy if exists "Admin write products" on public.products;
create policy "Admin write products" on public.products for all to authenticated using (true) with check (true);
drop policy if exists "Admin write variants" on public.product_variants;
create policy "Admin write variants" on public.product_variants for all to authenticated using (true) with check (true);
drop policy if exists "Admin write orders" on public.orders;
create policy "Admin write orders" on public.orders for all to authenticated using (true) with check (true);
drop policy if exists "Admin write bookings" on public.bookings;
create policy "Admin write bookings" on public.bookings for all to authenticated using (true) with check (true);

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

-- ——— content ———
insert into public.site_content (
  id, hero_subtitle, home_intro_title, home_intro_body,
  about_title, about_body, about_story_title, about_story_body,
  music_intro, spotify_embed_url, spotify_artist_url,
  contact_email, social, seo_description
) values (
  'main',
  'Cantante y compositor canario. Escenarios, canciones y presencia en vivo.',
  'Desde Gran Canaria',
  'Frantana es cantante y compositor canario. Creció en la música desde muy joven, forjó oficio en agrupaciones y ha llevado su voz por escenarios del archipiélago y del norte de la península, siempre ligado a la música popular de Canarias.',
  'Sobre Frantana',
  'Artista y compositor natural de Gran Canaria.',
  'En escena',
  'La escena es el centro: directo, show y conexión con el público.',
  'Escucha la música de Frantana.',
  'https://open.spotify.com/embed/artist/6RcC4X6S7nvTvj0d31VVCw?utm_source=generator&theme=0',
  'https://open.spotify.com/artist/6RcC4X6S7nvTvj0d31VVCw',
  'Frantanaoriginal@gmail.com',
  '{"instagram":"https://www.instagram.com/frantana/","facebook":"https://www.facebook.com/share/1Wn4FBbQaV/","spotify":"https://open.spotify.com/artist/6RcC4X6S7nvTvj0d31VVCw","youtube":null,"tiktok":null,"appleMusic":null}'::jsonb,
  'Frantana — cantante y compositor canario. Música, conciertos y novedades. Web oficial.'
)
on conflict (id) do update set
  hero_subtitle = excluded.hero_subtitle,
  updated_at = now();

-- ——— concerts (public + private holds) ———
insert into public.concerts (
  id, title, date, time, city, venue, lat, lng, image,
  ticket_url, ticket_status, published, blocks_calendar, notes
) values
  ('demo-past-2025-06-14-tfe', '[DEMO] Ensayo público — histórico', '2025-06-14', '20:30',
   'Santa Cruz de Tenerife', 'Sala demo (fixture)', 28.4636, -16.2518,
   '/media/gallery/frantana/04.jpg', null, 'tba', true, true, 'Fixture pasado'),
  ('evt-2026-11-15-lpa', 'Frantana en vivo', '2026-11-15', '22:00',
   'Las Palmas de Gran Canaria', 'Teatro Pérez Galdós', 28.10055, -15.41555,
   '/media/gallery/frantana/06.jpg', null, 'free', true, true, 'Fecha demo'),
  ('demo-future-2026-12-12-gc', '[DEMO] Noche de diciembre', '2026-12-12', '21:30',
   'Telde', 'Espacio demo (fixture)', 27.9985, -15.4187,
   '/media/gallery/frantana/02.jpg', null, 'tba', true, true, 'Fixture futura'),
  ('demo-future-2027-02-21-lpa', '[DEMO] Febrero en escena', '2027-02-21', '20:00',
   'Las Palmas de Gran Canaria', 'Auditorio demo (fixture)', 28.1335, -15.4382,
   '/media/gallery/frantana/07.jpg', null, 'tba', true, true, 'Fixture futura'),
  ('demo-future-2027-05-08-tf', '[DEMO] Primavera en Tenerife', '2027-05-08', '22:00',
   'Puerto de la Cruz', 'Plaza demo (fixture)', 28.4134, -16.5486,
   '/media/gallery/frantana/08.jpg', null, 'tba', true, true, 'Fixture futura'),
  ('hold-2026-10-25-privada', '[PRIVADO] Fiesta familiar', '2026-10-25', '21:00',
   'Las Palmas de Gran Canaria', 'Domicilio privado', null, null, null,
   null, 'tba', false, true, 'Hold privado — ocupa calendario sin publicar'),
  ('hold-2026-12-05-boda', '[PRIVADO] Boda', '2026-12-05', '19:00',
   'Maspalomas', 'Finca privada', null, null, null,
   null, 'tba', false, true, 'Hold privado boda'),
  ('hold-2027-01-17-corp', '[PRIVADO] Corporativo', '2027-01-17', '20:30',
   'Telde', 'Hotel (privado)', null, null, null,
   null, 'tba', false, true, 'Hold corporativo'),
  ('draft-2027-03-01-idea', 'Borrador sin bloquear', '2027-03-01', null,
   'Las Palmas de Gran Canaria', 'Por definir', null, null, null,
   null, 'tba', false, false, 'Borrador: no ocupa calendario')
on conflict (id) do update set
  title = excluded.title,
  date = excluded.date,
  published = excluded.published,
  blocks_calendar = excluded.blocks_calendar,
  updated_at = now();

-- ——— gallery ———
insert into public.gallery_images (id, src, alt, width, height, published, sort_order, credit)
values
  ('ig-01', '/media/gallery/frantana/shot-01.jpg', 'Frantana', 1800, 2705, true, 1, '@frantana'),
  ('ig-02', '/media/gallery/frantana/shot-02.jpg', 'Frantana', 1800, 2705, true, 2, '@frantana'),
  ('ig-03', '/media/gallery/frantana/shot-03.jpg', 'Frantana', 1800, 2705, true, 3, '@frantana'),
  ('ig-04', '/media/gallery/frantana/shot-04.jpg', 'Frantana', 1800, 1197, true, 4, '@frantana'),
  ('ig-05', '/media/gallery/frantana/shot-05.jpg', 'Frantana', 1800, 2705, true, 5, '@frantana')
on conflict (id) do update set
  src = excluded.src,
  alt = excluded.alt,
  width = excluded.width,
  height = excluded.height,
  published = excluded.published,
  sort_order = excluded.sort_order,
  credit = excluded.credit;

-- ——— shop ———
insert into public.products (id, name, slug, description, category, images, published, featured)
values
  ('prod-camiseta-noche', 'Camiseta Noche Frantana', 'camiseta-noche-frantana',
   'Camiseta demo de merchandising. Diseño nocturno con tipografía FRANTANA.',
   'merch', array['/media/gallery/frantana/shot-01.jpg','/media/gallery/frantana/shot-02.jpg'], true, true),
  ('prod-hoodie-isla', 'Hoodie Isla', 'hoodie-isla',
   'Sudadera demo con identidad de isla.',
   'merch', array['/media/gallery/frantana/shot-03.jpg','/media/gallery/frantana/shot-05.jpg'], true, true),
  ('prod-digital-como', 'Como te quiero yo — Digital', 'como-te-quiero-yo-digital',
   'Descarga digital demo del tema.',
   'digital', array['/media/gallery/frantana/shot-01.jpg'], true, false),
  ('prod-poster-vivo', 'Póster En Vivo', 'poster-en-vivo',
   'Póster editorial demo.',
   'merch', array['/media/gallery/frantana/shot-04.jpg','/media/gallery/frantana/shot-02.jpg'], true, false)
on conflict (id) do update set
  name = excluded.name,
  published = excluded.published,
  featured = excluded.featured,
  updated_at = now();

insert into public.product_variants (id, product_id, name, sku, price_cents, currency, stock, attributes)
values
  ('var-cam-s', 'prod-camiseta-noche', 'S', 'FRT-TEE-S', 2500, 'EUR', 12, '{"size":"S"}'::jsonb),
  ('var-cam-m', 'prod-camiseta-noche', 'M', 'FRT-TEE-M', 2500, 'EUR', 20, '{"size":"M"}'::jsonb),
  ('var-cam-l', 'prod-camiseta-noche', 'L', 'FRT-TEE-L', 2500, 'EUR', 15, '{"size":"L"}'::jsonb),
  ('var-hood-m', 'prod-hoodie-isla', 'M', 'FRT-HOOD-M', 4900, 'EUR', 8, '{"size":"M"}'::jsonb),
  ('var-hood-l', 'prod-hoodie-isla', 'L', 'FRT-HOOD-L', 4900, 'EUR', 6, '{"size":"L"}'::jsonb),
  ('var-dig-como', 'prod-digital-como', 'MP3 / FLAC', 'FRT-DIG-CTQY', 99, 'EUR', 999, '{"format":"digital"}'::jsonb),
  ('var-poster-a2', 'prod-poster-vivo', 'A2', 'FRT-POST-A2', 1800, 'EUR', 30, '{"size":"A2"}'::jsonb)
on conflict (id) do update set stock = excluded.stock, price_cents = excluded.price_cents;

-- ——— sample booking ———
insert into public.bookings (
  id, access_token, name, email, phone, event_type,
  preferred_date, preferred_time, city, venue, message, messages, status
) values (
  'book-demo-seed',
  'tok-demo-seed-frantana',
  'María Demo',
  'maria.demo@example.com',
  '+34 600 000 000',
  'boda',
  '2026-11-22',
  '20:00',
  'Las Palmas de Gran Canaria',
  'Salón Costa',
  'Boda íntima, formato acústico ~90 min.',
  '[{"id":"msg-demo-0","from":"client","body":"Boda íntima, formato acústico ~90 min.","createdAt":"2026-10-01T16:00:00.000Z"}]'::jsonb,
  'new'
)
on conflict (id) do nothing;

update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now()),
    raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'admin@frantana.es';
