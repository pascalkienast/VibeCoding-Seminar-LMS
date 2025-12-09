-- Tools Presentation feature setup for Leistungsschein
-- Run this in Supabase SQL editor

-- 1) Presentation Tools table (only admins can insert via SQL)
create table if not exists public.presentation_tools (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text not null,
  content text not null,
  image_url text,
  external_links jsonb default '[]'::jsonb, -- array of {label, url}
  presentation_date timestamptz, -- 27.01. or 03.02.
  max_presenters int default 3, -- max people who can present this tool
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Presentation tool presenters (participants who will present the tool)
create table if not exists public.presentation_tool_presenters (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references public.presentation_tools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(tool_id, user_id)
);

-- 3) Presentation tool comments
create table if not exists public.presentation_tool_comments (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references public.presentation_tools(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- 4) Indexes
create index if not exists idx_presentation_tools_slug on public.presentation_tools(slug);
create index if not exists idx_presentation_tool_presenters_tool on public.presentation_tool_presenters(tool_id);
create index if not exists idx_presentation_tool_presenters_user on public.presentation_tool_presenters(user_id);
create index if not exists idx_presentation_tool_comments_tool on public.presentation_tool_comments(tool_id);

-- 5) RLS Policies
alter table public.presentation_tools enable row level security;
alter table public.presentation_tool_presenters enable row level security;
alter table public.presentation_tool_comments enable row level security;

-- Presentation Tools: Everyone can read, only admins can insert/update/delete (via SQL)
drop policy if exists "presentation_tools_select" on public.presentation_tools;
create policy "presentation_tools_select" on public.presentation_tools for select using (true);

drop policy if exists "presentation_tools_insert" on public.presentation_tools;
create policy "presentation_tools_insert" on public.presentation_tools for insert 
  with check (public.is_admin(auth.uid()));

drop policy if exists "presentation_tools_update" on public.presentation_tools;
create policy "presentation_tools_update" on public.presentation_tools for update 
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "presentation_tools_delete" on public.presentation_tools;
create policy "presentation_tools_delete" on public.presentation_tools for delete 
  using (public.is_admin(auth.uid()));

-- Presenters: Everyone can read, authenticated users can join (insert), users can leave (delete own)
drop policy if exists "presentation_tool_presenters_select" on public.presentation_tool_presenters;
create policy "presentation_tool_presenters_select" on public.presentation_tool_presenters for select using (true);

drop policy if exists "presentation_tool_presenters_insert" on public.presentation_tool_presenters;
create policy "presentation_tool_presenters_insert" on public.presentation_tool_presenters for insert 
  with check (auth.uid() = user_id);

drop policy if exists "presentation_tool_presenters_delete" on public.presentation_tool_presenters;
create policy "presentation_tool_presenters_delete" on public.presentation_tool_presenters for delete 
  using (auth.uid() = user_id);

-- Comments: Everyone can read, authenticated users can create, authors can delete
drop policy if exists "presentation_tool_comments_select" on public.presentation_tool_comments;
create policy "presentation_tool_comments_select" on public.presentation_tool_comments for select using (true);

drop policy if exists "presentation_tool_comments_insert" on public.presentation_tool_comments;
create policy "presentation_tool_comments_insert" on public.presentation_tool_comments for insert 
  with check (auth.uid() = author_id);

drop policy if exists "presentation_tool_comments_delete" on public.presentation_tool_comments;
create policy "presentation_tool_comments_delete" on public.presentation_tool_comments for delete 
  using (auth.uid() = author_id);

-- Example: Insert sample tools (only admins or via service role)
-- Uncomment and modify as needed:
/*
insert into public.presentation_tools (title, slug, description, content, presentation_date, max_presenters)
values 
  ('Figma', 'figma', 'Design-Tool für UI/UX', 'Figma ist ein kollaboratives Design-Tool...', '2025-01-27 14:00:00+01', 3),
  ('VS Code', 'vs-code', 'Code-Editor', 'Visual Studio Code ist ein leistungsstarker Editor...', '2025-01-27 14:00:00+01', 3),
  ('Git & GitHub', 'git-github', 'Versionskontrolle', 'Git ist ein Versionskontrollsystem...', '2025-02-03 14:00:00+01', 3);
*/

