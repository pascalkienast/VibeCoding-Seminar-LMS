begin;

-- Tables for surveys
create table if not exists public.surveys (
  id bigserial primary key,
  token text unique,
  title text not null,
  description text,
  is_anonymous boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.survey_questions (
  id bigserial primary key,
  survey_id bigint not null references public.surveys(id) on delete cascade,
  order_index integer not null default 1,
  type text not null check (type in (
    'short_text','long_text','single_choice','multiple_choice','scale'
  )),
  label text not null,
  description text,
  required boolean not null default false,
  options jsonb,
  min_value integer,
  max_value integer,
  allow_other boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.survey_responses (
  id bigserial primary key,
  survey_id bigint not null references public.surveys(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.survey_answers (
  id bigserial primary key,
  response_id bigint not null references public.survey_responses(id) on delete cascade,
  question_id bigint not null references public.survey_questions(id) on delete cascade,
  answer jsonb not null,
  created_at timestamptz not null default now(),
  unique (response_id, question_id)
);

-- Helpful indexes
create index if not exists idx_survey_questions_survey on public.survey_questions(survey_id);
create index if not exists idx_survey_responses_survey on public.survey_responses(survey_id);
create index if not exists idx_survey_answers_response on public.survey_answers(response_id);

-- Token trigger to default to id::text for easy <Umfrage{id}> usage
create or replace function public.ensure_survey_token_after()
returns trigger
language plpgsql
as $$
begin
  if new.token is null or length(trim(new.token)) = 0 then
    update public.surveys set token = new.id::text where id = new.id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_set_survey_token_after on public.surveys;
create trigger trg_set_survey_token_after
after insert on public.surveys
for each row execute function public.ensure_survey_token_after();

-- Enable RLS
alter table public.surveys enable row level security;
alter table public.survey_questions enable row level security;
alter table public.survey_responses enable row level security;
alter table public.survey_answers enable row level security;

-- Admin policies (reuse public.is_admin(uid) from policy-fixes.sql)
drop policy if exists surveys_admin_all on public.surveys;
create policy surveys_admin_all on public.surveys for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists survey_questions_admin_all on public.survey_questions;
create policy survey_questions_admin_all on public.survey_questions for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists survey_responses_admin_all on public.survey_responses;
create policy survey_responses_admin_all on public.survey_responses for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists survey_answers_admin_all on public.survey_answers;
create policy survey_answers_admin_all on public.survey_answers for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Public reads for active surveys (needed to render forms on public news pages)
drop policy if exists surveys_public_read_active on public.surveys;
create policy surveys_public_read_active on public.surveys for select
  using (is_active = true);

drop policy if exists survey_questions_public_read_active on public.survey_questions;
create policy survey_questions_public_read_active on public.survey_questions for select
  using (exists (
    select 1 from public.surveys s where s.id = survey_id and s.is_active = true
  ));

-- Allow inserts of responses: anonymous and non-anonymous
drop policy if exists survey_responses_insert_authed on public.survey_responses;
create policy survey_responses_insert_authed on public.survey_responses for insert
  with check (exists (
    select 1 from public.surveys s
    where s.id = survey_id
      and s.is_active = true
      and s.is_anonymous = false
      and auth.uid() is not null
      and user_id = auth.uid()
  ));

drop policy if exists survey_responses_insert_anonymous on public.survey_responses;
create policy survey_responses_insert_anonymous on public.survey_responses for insert
  with check (exists (
    select 1 from public.surveys s
    where s.id = survey_id
      and s.is_active = true
      and s.is_anonymous = true
  ) and user_id is null);

-- Insert answers if response belongs to you or is anonymous (and survey active)
drop policy if exists survey_answers_insert_authed on public.survey_answers;
create policy survey_answers_insert_authed on public.survey_answers for insert
  with check (exists (
    select 1 from public.survey_responses r
    join public.surveys s on s.id = r.survey_id
    where r.id = response_id
      and s.is_active = true
      and s.is_anonymous = false
      and auth.uid() is not null
      and r.user_id = auth.uid()
  ));

drop policy if exists survey_answers_insert_anonymous on public.survey_answers;
create policy survey_answers_insert_anonymous on public.survey_answers for insert
  with check (exists (
    select 1 from public.survey_responses r
    join public.surveys s on s.id = r.survey_id
    where r.id = response_id
      and s.is_active = true
      and s.is_anonymous = true
      and r.user_id is null
  ));

commit;


