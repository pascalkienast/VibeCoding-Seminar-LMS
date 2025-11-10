-- Storage policies for projects bucket
-- Run this in Supabase SQL editor AFTER creating the 'projects' storage bucket

-- Drop existing policies if any
drop policy if exists "authenticated_upload" on storage.objects;
drop policy if exists "public_read_projects" on storage.objects;
drop policy if exists "authenticated_delete" on storage.objects;

-- Allow any authenticated user to upload to projects bucket
create policy "authenticated_upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'projects');

-- Allow public read access to projects bucket
create policy "public_read_projects"
on storage.objects for select
to public
using (bucket_id = 'projects');

-- Allow authenticated users to delete from projects bucket
-- Note: In practice, only project creators should delete images when deleting projects
create policy "authenticated_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'projects');

