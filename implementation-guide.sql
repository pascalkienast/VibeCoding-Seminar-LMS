-- Supabase SQL schema from implementation-guide.md
-- Roles
drop type if exists user_role cascade;
create type user_role as enum ('student', 'admin');

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  role user_role not null default 'student',
  about text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Invite codes (store only hashes)
create table if not exists public.invite_codes (
  id bigserial primary key,
  code_hash text not null unique,
  label text,
  role user_role not null default 'student',
  max_uses int default 1,
  used_count int not null default 0,
  expires_at timestamptz,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

-- News
create table if not exists public.news (
  id bigserial primary key,
  slug text not null unique,
  title text not null,
  excerpt text,
  body text not null,
  youtube_url text,
  is_public boolean not null default false,
  published_at timestamptz,
  author_id uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Lehrplan (weeks)
create table if not exists public.weeks (
  id bigserial primary key,
  week_number int not null unique,
  date date,
  title text not null,
  summary text,
  body text,
  is_published boolean not null default false,
  created_by uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Forum
create table if not exists public.forum_categories (
  id bigserial primary key,
  slug text not null unique,
  title text not null,
  description text not null,
  sort_order int default 0,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

create table if not exists public.forum_topics (
  id bigserial primary key,
  category_id bigint references public.forum_categories on delete cascade,
  title text not null,
  is_locked boolean not null default false,
  is_pinned boolean not null default false,
  author_id uuid references auth.users,
  last_post_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.forum_posts (
  id bigserial primary key,
  topic_id bigint references public.forum_topics on delete cascade,
  author_id uuid references auth.users,
  body text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- RLS policies
alter table public.profiles enable row level security;
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles for select using (auth.uid() = id);
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update using (auth.uid() = id);
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

alter table public.news enable row level security;
drop policy if exists news_public_or_auth on public.news;
create policy news_public_or_auth on public.news for select using (is_public or auth.uid() is not null);
drop policy if exists news_admin_write on public.news;
create policy news_admin_write on public.news for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

alter table public.weeks enable row level security;
drop policy if exists weeks_read_students on public.weeks;
create policy weeks_read_students on public.weeks for select using (auth.uid() is not null);
drop policy if exists weeks_admin_write on public.weeks;
create policy weeks_admin_write on public.weeks for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

alter table public.forum_categories enable row level security;
drop policy if exists forum_categories_read on public.forum_categories;
create policy forum_categories_read on public.forum_categories for select using (auth.uid() is not null);
drop policy if exists forum_categories_admin_write on public.forum_categories;
create policy forum_categories_admin_write on public.forum_categories for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

alter table public.forum_topics enable row level security;
drop policy if exists forum_topics_read on public.forum_topics;
create policy forum_topics_read on public.forum_topics for select using (auth.uid() is not null);
drop policy if exists forum_topics_create on public.forum_topics;
create policy forum_topics_create on public.forum_topics for insert with check (auth.uid() is not null);
drop policy if exists forum_topics_author_update on public.forum_topics;
create policy forum_topics_author_update on public.forum_topics for update using (author_id = auth.uid());
drop policy if exists forum_topics_admin_write on public.forum_topics;
create policy forum_topics_admin_write on public.forum_topics for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

alter table public.forum_posts enable row level security;
drop policy if exists forum_posts_read on public.forum_posts;
create policy forum_posts_read on public.forum_posts for select using (auth.uid() is not null);
drop policy if exists forum_posts_create on public.forum_posts;
create policy forum_posts_create on public.forum_posts for insert with check (auth.uid() is not null);
drop policy if exists forum_posts_author_update on public.forum_posts;
create policy forum_posts_author_update on public.forum_posts for update using (author_id = auth.uid());
drop policy if exists forum_posts_admin_write on public.forum_posts;
create policy forum_posts_admin_write on public.forum_posts for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Invite codes: admin only
alter table public.invite_codes enable row level security;
drop policy if exists invite_codes_admin_all on public.invite_codes;
create policy invite_codes_admin_all on public.invite_codes for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Featured Tools (for carousel on tools page)
create table if not exists public.featured_tools (
  id bigserial primary key,
  title text not null,
  description text not null,
  long_description text,
  youtube_url text,
  links jsonb default '[]'::jsonb,
  image_url text,
  sort_order int default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.featured_tools enable row level security;
drop policy if exists featured_tools_read_all on public.featured_tools;
create policy featured_tools_read_all on public.featured_tools 
  for select using (is_active = true or auth.uid() is not null);
drop policy if exists featured_tools_admin_write on public.featured_tools;
create policy featured_tools_admin_write on public.featured_tools 
  for all using (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
