-- Policy fixes to avoid recursive RLS on profiles and allow public reads for published weeks
begin;

-- Helper function to check admin without triggering RLS recursion
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles p where p.id = uid and p.role = 'admin'
  );
$$;

-- Recreate policies to use public.is_admin(...) instead of selecting the same table in-policy
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles for all using (public.is_admin(auth.uid()));

drop policy if exists news_admin_write on public.news;
create policy news_admin_write on public.news for all using (public.is_admin(auth.uid()));

drop policy if exists weeks_admin_write on public.weeks;
create policy weeks_admin_write on public.weeks for all using (public.is_admin(auth.uid()));

drop policy if exists forum_categories_admin_write on public.forum_categories;
create policy forum_categories_admin_write on public.forum_categories for all using (public.is_admin(auth.uid()));

drop policy if exists forum_topics_admin_write on public.forum_topics;
create policy forum_topics_admin_write on public.forum_topics for all using (public.is_admin(auth.uid()));

drop policy if exists forum_posts_admin_write on public.forum_posts;
create policy forum_posts_admin_write on public.forum_posts for all using (public.is_admin(auth.uid()));

drop policy if exists invite_codes_admin_all on public.invite_codes;
create policy invite_codes_admin_all on public.invite_codes for all using (public.is_admin(auth.uid()));

-- Allow read of weeks only for authed users (client uses session). Remove public read.
drop policy if exists weeks_read_published on public.weeks;
create policy weeks_read_students on public.weeks for select using (auth.uid() is not null);

commit;


