-- Week files table and storage policies
-- Run this in Supabase SQL editor

begin;

-- Create week_files table
create table if not exists public.week_files (
  id bigserial primary key,
  week_id bigint not null references public.weeks(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  uploaded_by uuid references auth.users,
  uploaded_at timestamptz default now()
);

-- RLS policies for week_files
alter table public.week_files enable row level security;

-- Authenticated users can read week files
drop policy if exists week_files_read on public.week_files;
create policy week_files_read on public.week_files 
  for select 
  using (auth.uid() is not null);

-- Admins can insert, update, delete week files
drop policy if exists week_files_admin_write on public.week_files;
create policy week_files_admin_write on public.week_files 
  for all 
  using (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

commit;

-- Storage policies for 'lehrplan' bucket
-- Note: Run these separately in the Supabase dashboard under Storage > Policies
-- or use the Supabase storage API

-- Policy: Authenticated users can read files from lehrplan bucket
-- CREATE POLICY "Authenticated users can read lehrplan files"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (bucket_id = 'lehrplan');

-- Policy: Admins can upload files to lehrplan bucket
-- CREATE POLICY "Admins can upload lehrplan files"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'lehrplan' 
--   AND EXISTS (
--     SELECT 1 FROM public.profiles 
--     WHERE id = auth.uid() AND role = 'admin'
--   )
-- );

-- Policy: Admins can update files in lehrplan bucket
-- CREATE POLICY "Admins can update lehrplan files"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (
--   bucket_id = 'lehrplan' 
--   AND EXISTS (
--     SELECT 1 FROM public.profiles 
--     WHERE id = auth.uid() AND role = 'admin'
--   )
-- );

-- Policy: Admins can delete files from lehrplan bucket
-- CREATE POLICY "Admins can delete lehrplan files"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (
--   bucket_id = 'lehrplan' 
--   AND EXISTS (
--     SELECT 1 FROM public.profiles 
--     WHERE id = auth.uid() AND role = 'admin'
--   )
-- );

