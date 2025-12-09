-- Add email to profiles table for easier access
-- Run this in Supabase SQL editor

-- 1) Add email column to profiles
alter table public.profiles add column if not exists email text;

-- 2) Create unique index on email
create unique index if not exists idx_profiles_email on public.profiles(email);

-- 3) Update existing profiles with email from auth.users
-- This requires security definer function as we need access to auth.users
create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Set email from auth.users when profile is created/updated
  select email into new.email
  from auth.users
  where id = new.id;
  
  return new;
end;
$$;

-- 4) Create trigger to automatically sync email
drop trigger if exists on_profile_sync_email on public.profiles;
create trigger on_profile_sync_email
  before insert or update on public.profiles
  for each row
  execute function public.sync_profile_email();

-- 5) Backfill existing profiles with emails
do $$
declare
  profile_record record;
  user_email text;
begin
  for profile_record in select id from public.profiles where email is null
  loop
    select email into user_email
    from auth.users
    where id = profile_record.id;
    
    if user_email is not null then
      update public.profiles
      set email = user_email
      where id = profile_record.id;
    end if;
  end loop;
end $$;

-- 6) Make email not null after backfill
alter table public.profiles alter column email set not null;

