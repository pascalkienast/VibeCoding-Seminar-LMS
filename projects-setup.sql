-- Projects feature setup
-- Run this in Supabase SQL editor

-- 1) Projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  slug text unique not null,
  description text not null,
  content text not null,
  image_url text,
  external_links jsonb default '[]'::jsonb, -- array of {label, url}
  allow_participants boolean default true,
  max_participants int, -- null = unlimited
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Project participants
create table if not exists public.project_participants (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(project_id, user_id)
);

-- 3) Project comments
create table if not exists public.project_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- 4) Indexes
create index if not exists idx_projects_creator on public.projects(creator_id);
create index if not exists idx_projects_slug on public.projects(slug);
create index if not exists idx_project_participants_project on public.project_participants(project_id);
create index if not exists idx_project_participants_user on public.project_participants(user_id);
create index if not exists idx_project_comments_project on public.project_comments(project_id);

-- 5) RLS Policies
alter table public.projects enable row level security;
alter table public.project_participants enable row level security;
alter table public.project_comments enable row level security;

-- Projects: Everyone can read, authenticated users can create, creators can update/delete
drop policy if exists "projects_select" on public.projects;
create policy "projects_select" on public.projects for select using (true);

drop policy if exists "projects_insert" on public.projects;
create policy "projects_insert" on public.projects for insert 
  with check (auth.uid() = creator_id);

drop policy if exists "projects_update" on public.projects;
create policy "projects_update" on public.projects for update 
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

drop policy if exists "projects_delete" on public.projects;
create policy "projects_delete" on public.projects for delete 
  using (auth.uid() = creator_id);

-- Participants: Everyone can read, authenticated users can join (insert), users can leave (delete own)
drop policy if exists "participants_select" on public.project_participants;
create policy "participants_select" on public.project_participants for select using (true);

drop policy if exists "participants_insert" on public.project_participants;
create policy "participants_insert" on public.project_participants for insert 
  with check (auth.uid() = user_id);

drop policy if exists "participants_delete" on public.project_participants;
create policy "participants_delete" on public.project_participants for delete 
  using (auth.uid() = user_id);

-- Comments: Everyone can read, authenticated users can create, authors can delete
drop policy if exists "project_comments_select" on public.project_comments;
create policy "project_comments_select" on public.project_comments for select using (true);

drop policy if exists "project_comments_insert" on public.project_comments;
create policy "project_comments_insert" on public.project_comments for insert 
  with check (auth.uid() = author_id);

drop policy if exists "project_comments_delete" on public.project_comments;
create policy "project_comments_delete" on public.project_comments for delete 
  using (auth.uid() = author_id);

-- 6) Function to generate slug from title
create or replace function public.generate_project_slug(title text)
returns text
language plpgsql
as $$
declare
  base_slug text;
  final_slug text;
  counter int := 0;
begin
  -- Convert to lowercase, replace spaces/special chars with hyphens
  base_slug := lower(trim(regexp_replace(title, '[^a-zA-Z0-9äöüÄÖÜß]+', '-', 'g'), '-'));
  final_slug := base_slug;
  
  -- Check uniqueness and append counter if needed
  while exists (select 1 from public.projects where slug = final_slug) loop
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  end loop;
  
  return final_slug;
end;
$$;

-- 7) Trigger to automatically add creator as participant
create or replace function public.add_creator_as_participant()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Add creator to participants table
  insert into public.project_participants (project_id, user_id)
  values (new.id, new.creator_id);
  return new;
end;
$$;

drop trigger if exists on_project_created on public.projects;
create trigger on_project_created
  after insert on public.projects
  for each row
  execute function public.add_creator_as_participant();

