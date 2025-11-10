-- Featured Tools Setup
-- Run this in Supabase SQL Editor

-- Create featured_tools table
create table if not exists public.featured_tools (
  id bigserial primary key,
  title text not null,
  description text not null,
  long_description text,
  youtube_url text,
  links jsonb default '[]'::jsonb, -- Array of {label, url}
  image_url text,
  sort_order int default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.featured_tools enable row level security;

-- Everyone can read active featured tools
drop policy if exists featured_tools_read_all on public.featured_tools;
create policy featured_tools_read_all on public.featured_tools 
  for select using (is_active = true or auth.uid() is not null);

-- Only admins can manage featured tools
drop policy if exists featured_tools_admin_write on public.featured_tools;
create policy featured_tools_admin_write on public.featured_tools 
  for all using (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Create storage bucket for featured tool images (run in SQL editor)
-- Note: You may need to create this bucket manually in Supabase Storage UI
-- Bucket name: featured-tools

-- Storage policies for featured-tools bucket
-- Allow public read access
insert into storage.buckets (id, name, public)
values ('featured-tools', 'featured-tools', true)
on conflict (id) do nothing;

-- Allow admins to upload
drop policy if exists "Admin users can upload featured tool images" on storage.objects;
create policy "Admin users can upload featured tool images"
on storage.objects for insert
with check (
  bucket_id = 'featured-tools' 
  and exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Allow admins to update
drop policy if exists "Admin users can update featured tool images" on storage.objects;
create policy "Admin users can update featured tool images"
on storage.objects for update
using (
  bucket_id = 'featured-tools'
  and exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Allow admins to delete
drop policy if exists "Admin users can delete featured tool images" on storage.objects;
create policy "Admin users can delete featured tool images"
on storage.objects for delete
using (
  bucket_id = 'featured-tools'
  and exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Allow public read
drop policy if exists "Public users can view featured tool images" on storage.objects;
create policy "Public users can view featured tool images"
on storage.objects for select
using (bucket_id = 'featured-tools');

