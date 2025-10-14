## Vibe Coding LMS — Mobile‑First Web App Implementation Guide

This guide turns your three sketches into a lean, mobile‑first web app. Scope is intentionally simple: invite‑code registration, news (with public article view), Lehrplan (weekly content), bulletin‑board forum, and a profile page. Two roles: student and admin.

### Primary UX (from sketches)

- Auth screen: Login + Register. Registration requires a valid invite code.
- Tabs/menu: Home (News), Lehrplan, Forum, Profile (avatar icon). Admin sees an Admin link.
- Home/News: list of articles; each article has a public detail page that works without login (for surveys before course start). After reading, users can register/login.
- Lehrplan: week list and a week detail page with prev/next arrows.
- Forum: bulletin board with top‑level categories (each has a description), users create topics within a category, then reply.
- Profile: change password, upload avatar, edit “about me”.
- Admin: create/edit news, weeks, categories; moderate forum; manage invites.

---

### Recommended Tech Stack (mobile‑first web)

- Framework: Next.js (App Router) + TypeScript
- UI: Tailwind CSS + shadcn/ui components; mobile bottom‑nav (Home, Lehrplan, Forum, Profile)
- Auth + DB + Storage: Supabase (Postgres, Auth, Storage, Row‑Level Security)
- Forms & Validation: React Hook Form + Zod
- Content Editor: Markdown textarea (simple) with preview; keep it lightweight
- Images: Supabase Storage bucket `avatars` (publicly readable via signed URLs)
- PWA: `next-pwa` for installable, offline‑friendly shell and icons
- Deployment: Vercel (preview + production), custom domain (e.g., `vibecode.paskie.me`)
- Observability: Vercel Analytics; optional Sentry for errors

Why: This stack ships fast, is cheap/free at the scale of a seminar, and keeps the auth/DB/storage surface area small. Supabase RLS handles most permissions without a custom backend.

---

### Minimal Data Model (SQL sketch)

Create these tables in Supabase (enable RLS on all):

```sql
-- Roles
create type user_role as enum ('student', 'admin');

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  role user_role not null default 'student',
  about text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Invite codes (store only hashes)
create table public.invite_codes (
  id bigserial primary key,
  code_hash text not null unique,
  label text,
  role user_role not null default 'student',
  max_uses int default 1,
  used_count int not null default 0,
  expires_at timestamptz,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

-- News
create table public.news (
  id bigserial primary key,
  slug text not null unique,
  title text not null,
  excerpt text,
  body text not null,          -- markdown
  is_public boolean not null default false,
  published_at timestamptz,
  author_id uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Lehrplan (weeks)
create table public.weeks (
  id bigserial primary key,
  week_number int not null unique,
  date date,
  title text not null,
  summary text,
  body text,                   -- markdown
  is_published boolean not null default false,
  created_by uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Forum
create table public.forum_categories (
  id bigserial primary key,
  slug text not null unique,
  title text not null,
  description text not null,
  sort_order int default 0,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

create table public.forum_topics (
  id bigserial primary key,
  category_id bigint references public.forum_categories on delete cascade,
  title text not null,
  is_locked boolean not null default false,
  is_pinned boolean not null default false,
  author_id uuid references auth.users,
  last_post_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.forum_posts (
  id bigserial primary key,
  topic_id bigint references public.forum_topics on delete cascade,
  author_id uuid references auth.users,
  body text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
```

Row‑Level Security policies (examples):

```sql
alter table public.profiles enable row level security;
create policy profiles_self_read on public.profiles for select using (auth.uid() = id);
create policy profiles_self_update on public.profiles for update using (auth.uid() = id);
create policy profiles_admin_all on public.profiles for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

alter table public.news enable row level security;
create policy news_public_or_auth on public.news for select using (is_public or auth.uid() is not null);
create policy news_admin_write on public.news for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

alter table public.weeks enable row level security;
create policy weeks_read_students on public.weeks for select using (auth.uid() is not null);
create policy weeks_admin_write on public.weeks for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

alter table public.forum_categories enable row level security;
create policy forum_categories_read on public.forum_categories for select using (auth.uid() is not null);
create policy forum_categories_admin_write on public.forum_categories for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

alter table public.forum_topics enable row level security;
create policy forum_topics_read on public.forum_topics for select using (auth.uid() is not null);
create policy forum_topics_create on public.forum_topics for insert with check (auth.uid() is not null);
create policy forum_topics_author_update on public.forum_topics for update using (author_id = auth.uid());
create policy forum_topics_admin_write on public.forum_topics for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

alter table public.forum_posts enable row level security;
create policy forum_posts_read on public.forum_posts for select using (auth.uid() is not null);
create policy forum_posts_create on public.forum_posts for insert with check (auth.uid() is not null);
create policy forum_posts_author_update on public.forum_posts for update using (author_id = auth.uid());
create policy forum_posts_admin_write on public.forum_posts for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
```

Invite codes: keep table private to admins. You will verify codes server‑side (see Registration flow) and increment `used_count`.

---

### Routing & Pages

- Public
  - `/news` (list)
  - `/news/[slug]` (public detail + “Register” CTA)
  - `/login`, `/register`
- Authenticated (students + admins)
  - `/` → Home/News list (if logged in)
  - `/lehrplan` (list of weeks)
  - `/lehrplan/[week_number]` (detail with prev/next)
  - `/forum` (categories)
  - `/forum/c/[slug]` (topics list)
  - `/forum/t/[id]` (topic + replies)
  - `/profile` (avatar, about, change password)
- Admin
  - `/admin` dashboard
  - `/admin/news`, `/admin/weeks`, `/admin/forum`, `/admin/invites`

Mobile navigation: persistent bottom tab bar (Home, Lehrplan, Forum, Profile). Admin link appears in profile dropdown.

---

### Auth & Registration (invite‑only)

Configuration
- In Supabase Auth settings: disable public email signups.
- Registration happens only via a server route using the Supabase service key.

Flow
1) Register form fields: inviteCode, email, username, password, confirmPassword
2) POST `/api/auth/register` (server route)
   - Hash the provided code (e.g., bcrypt/argon2) and compare to `invite_codes.code_hash`
   - Validate: not expired, `used_count < max_uses`
   - Create user via Supabase Admin API (email + password)
   - Insert `profiles` row for the new user with role from invite
   - Increment `invite_codes.used_count`
3) Login: standard Supabase client auth

Password change: from `/profile`, call Supabase `updateUser({ password })` (user must be re‑authenticated) inside a server action.

Avatar upload: upload to Storage bucket `avatars/USER_ID/*.png` and store the public URL in `profiles.avatar_url`.

---

### Feature Implementation Notes

Home/News
- List `news` (paginate); card shows title/excerpt, “More” link
- Detail page is public if `is_public=true`

Lehrplan
- Index lists all `weeks` (published only)
- Week detail shows markdown body; prev/next arrows compute by `week_number`

Forum (bulletin board)
- Categories index displays `forum_categories` with description text (e.g., “Projects” with submission instructions)
- Inside a category: list `forum_topics` sorted by pinned desc, then last_post_at desc
- Topic page: list `forum_posts`; reply box at bottom; admins can pin/lock

Profile
- Edit username, about, avatar; change password section

Admin
- CRUD UIs for news, weeks, categories; basic moderation (pin/lock/delete)
- Invite management: create single‑use and multi‑use codes; show usage counts

---

### Access Control Summary

- News: public read when `is_public=true`, otherwise auth required; admins write
- Weeks: students/admins read; admins write
- Forum: students/admins read/write; authors can edit their own posts; admins moderate
- Profiles: users can read/update their own; admins can read/update all
- Invite codes: only admins can CRUD; never exposed to clients in plaintext

---

### Build Steps (high level)

1) Project setup
- Create Next.js app (App Router, TypeScript). Add Tailwind and shadcn/ui.
- Add Supabase client (`@supabase/supabase-js`), React Hook Form, Zod, `next-pwa`.

2) Supabase
- Create project; disable public signups
- Create tables and RLS policies above
- Create Storage bucket `avatars` (public read via signed URLs)
- Generate service role key and client anon key; store in Vercel env vars

3) Auth flows
- Build `/login` and `/register` pages
- Implement `/api/auth/register` server route using the service key and the invite flow described
- After login, redirect to `/` (Home)

4) Core pages
- News list/detail (public detail)
- Weeks list/detail with prev/next
- Forum categories/topics/topic detail with reply composer
- Profile edit page (avatar upload, about, password)

5) Admin pages
- CRUD for news, weeks, forum categories; topic moderation
- Invite management (create, list, invalidate)

6) Mobile‑first UI polish
- Bottom tab bar; large tap targets; 16px baseline grid; prefers‑color‑scheme dark mode
- Markdown rendering for bodies; sanitize HTML

7) PWA + Deployment
- Add icons/splash, manifest, service worker via `next-pwa`
- Deploy to Vercel; set env vars; add domain `vibecode.paskie.me`

---

### Environment Variables (Vercel)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)

---

### Definition of Done (MVP)

- Users can register with a valid invite code, log in, and see tabs
- Public news article opens without login; includes survey link
- Weeks list/detail render and are editable by admins
- Forum supports categories → topics → replies; admins can pin/lock
- Profile allows avatar upload, about edit, password change
- RLS prevents unauthorized writes; admin can manage everything

---

### Optional Extensions (later)

- Mentions and notifications (email/Discord) for replies or announcements
- Simple full‑text search across news, weeks, and forum
- Rate‑limited anonymous Q&A category (moderated)
- Export data (CSV) for archiving; backup strategy via Supabase

