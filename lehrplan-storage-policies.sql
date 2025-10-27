-- Storage bucket policies for 'lehrplan' bucket
-- Run these in Supabase SQL editor

-- Note: Make sure the 'lehrplan' bucket exists first!
-- Create it in the Supabase Dashboard: Storage > Create a new bucket > name: 'lehrplan' > public: false

begin;

-- Policy: Authenticated users can read files from lehrplan bucket
drop policy if exists "Authenticated users can read lehrplan files" on storage.objects;
create policy "Authenticated users can read lehrplan files"
on storage.objects for select
to authenticated
using (bucket_id = 'lehrplan');

-- Policy: Admins can upload files to lehrplan bucket
drop policy if exists "Admins can upload lehrplan files" on storage.objects;
create policy "Admins can upload lehrplan files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'lehrplan' 
  and exists (
    select 1 from public.profiles 
    where id = auth.uid() and role = 'admin'
  )
);

-- Policy: Admins can update files in lehrplan bucket
drop policy if exists "Admins can update lehrplan files" on storage.objects;
create policy "Admins can update lehrplan files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'lehrplan' 
  and exists (
    select 1 from public.profiles 
    where id = auth.uid() and role = 'admin'
  )
);

-- Policy: Admins can delete files from lehrplan bucket
drop policy if exists "Admins can delete lehrplan files" on storage.objects;
create policy "Admins can delete lehrplan files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'lehrplan' 
  and exists (
    select 1 from public.profiles 
    where id = auth.uid() and role = 'admin'
  )
);

commit;

