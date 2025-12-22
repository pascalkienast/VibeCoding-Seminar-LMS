-- Q&A System Setup
-- Run this in Supabase SQL editor

begin;

-- Q&A Questions table (replaces forum_topics)
create table if not exists public.qa_questions (
  id bigserial primary key,
  author_id uuid references auth.users on delete cascade not null,
  title text not null,
  body text not null,
  is_resolved boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Q&A Answers table (replaces forum_posts, with threading support)
create table if not exists public.qa_answers (
  id bigserial primary key,
  question_id bigint references public.qa_questions on delete cascade not null,
  parent_answer_id bigint references public.qa_answers on delete cascade,
  author_id uuid references auth.users on delete cascade not null,
  body text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Q&A Attachments table for file uploads
create table if not exists public.qa_attachments (
  id bigserial primary key,
  question_id bigint references public.qa_questions on delete cascade,
  answer_id bigint references public.qa_answers on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text,
  file_size bigint,
  uploaded_by uuid references auth.users on delete set null,
  created_at timestamptz default now(),
  constraint qa_attachments_question_or_answer check (
    (question_id is not null and answer_id is null) or
    (question_id is null and answer_id is not null)
  )
);

-- Create indexes for better query performance
create index if not exists idx_qa_questions_author on public.qa_questions(author_id);
create index if not exists idx_qa_questions_created on public.qa_questions(created_at desc);
create index if not exists idx_qa_answers_question on public.qa_answers(question_id);
create index if not exists idx_qa_answers_parent on public.qa_answers(parent_answer_id);
create index if not exists idx_qa_attachments_question on public.qa_attachments(question_id);
create index if not exists idx_qa_attachments_answer on public.qa_attachments(answer_id);

-- RLS Policies for qa_questions
alter table public.qa_questions enable row level security;

drop policy if exists qa_questions_read on public.qa_questions;
create policy qa_questions_read on public.qa_questions 
  for select using (auth.uid() is not null);

drop policy if exists qa_questions_create on public.qa_questions;
create policy qa_questions_create on public.qa_questions 
  for insert with check (auth.uid() is not null and auth.uid() = author_id);

drop policy if exists qa_questions_update_own on public.qa_questions;
create policy qa_questions_update_own on public.qa_questions 
  for update using (auth.uid() = author_id);

drop policy if exists qa_questions_delete_own on public.qa_questions;
create policy qa_questions_delete_own on public.qa_questions 
  for delete using (auth.uid() = author_id);

drop policy if exists qa_questions_admin_all on public.qa_questions;
create policy qa_questions_admin_all on public.qa_questions 
  for all using (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- RLS Policies for qa_answers
alter table public.qa_answers enable row level security;

drop policy if exists qa_answers_read on public.qa_answers;
create policy qa_answers_read on public.qa_answers 
  for select using (auth.uid() is not null);

drop policy if exists qa_answers_create on public.qa_answers;
create policy qa_answers_create on public.qa_answers 
  for insert with check (auth.uid() is not null and auth.uid() = author_id);

drop policy if exists qa_answers_update_own on public.qa_answers;
create policy qa_answers_update_own on public.qa_answers 
  for update using (auth.uid() = author_id);

drop policy if exists qa_answers_delete_own on public.qa_answers;
create policy qa_answers_delete_own on public.qa_answers 
  for delete using (auth.uid() = author_id);

drop policy if exists qa_answers_admin_all on public.qa_answers;
create policy qa_answers_admin_all on public.qa_answers 
  for all using (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- RLS Policies for qa_attachments
alter table public.qa_attachments enable row level security;

drop policy if exists qa_attachments_read on public.qa_attachments;
create policy qa_attachments_read on public.qa_attachments 
  for select using (auth.uid() is not null);

drop policy if exists qa_attachments_create on public.qa_attachments;
create policy qa_attachments_create on public.qa_attachments 
  for insert with check (auth.uid() is not null);

drop policy if exists qa_attachments_delete_own on public.qa_attachments;
create policy qa_attachments_delete_own on public.qa_attachments 
  for delete using (auth.uid() = uploaded_by);

drop policy if exists qa_attachments_admin_all on public.qa_attachments;
create policy qa_attachments_admin_all on public.qa_attachments 
  for all using (
    exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

commit;

-- Storage bucket for Q&A files
-- Note: Run this separately or create bucket manually in Supabase Storage UI
insert into storage.buckets (id, name, public)
values ('qa-files', 'qa-files', true)
on conflict (id) do nothing;

-- Storage policies for qa-files bucket
drop policy if exists "Authenticated users can upload qa files" on storage.objects;
create policy "Authenticated users can upload qa files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'qa-files');

drop policy if exists "Public can view qa files" on storage.objects;
create policy "Public can view qa files"
on storage.objects for select
to public
using (bucket_id = 'qa-files');

drop policy if exists "Users can delete own qa files" on storage.objects;
create policy "Users can delete own qa files"
on storage.objects for delete
to authenticated
using (bucket_id = 'qa-files' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Admins can manage all qa files" on storage.objects;
create policy "Admins can manage all qa files"
on storage.objects for all
to authenticated
using (
  bucket_id = 'qa-files' 
  and exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
