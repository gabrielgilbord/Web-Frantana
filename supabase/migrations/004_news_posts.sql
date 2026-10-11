-- Novedades / blog editorial Frantana
create table if not exists public.news_posts (
  id text primary key,
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  cover_image text,
  category text not null default 'noticia'
    check (category in ('lanzamiento','promocion','noticia','otro')),
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_posts_published_idx
  on public.news_posts (published, published_at desc nulls last);

alter table public.news_posts enable row level security;

drop policy if exists "Public read published news" on public.news_posts;
create policy "Public read published news"
  on public.news_posts for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Admin write news" on public.news_posts;
create policy "Admin write news"
  on public.news_posts for all
  to authenticated
  using (true)
  with check (true);

grant select on public.news_posts to anon, authenticated;
