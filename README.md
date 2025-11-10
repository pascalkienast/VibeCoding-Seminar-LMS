Vibe Coding LMS (MVP)

Setup
- Copy `.env.example` to `.env.local` and fill values:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Run schema in Supabase SQL editor: `implementation-guide.sql`.
- Create Storage buckets:
  - `avatars` (for user profile pictures)
  - `lehrplan` (for weekly course materials) – see `LEHRPLAN_FILES_SETUP.md` for complete setup

Development
```bash
npm run dev
```

Key routes
- `/login`, `/register`
- `/` News (public detail later)
- `/api/auth/register` invite-only registration

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Admin Features

Admin UI is available to users whose `profiles.role = 'admin'`.

- Routes
  - `/admin` – dashboard
  - `/admin/news` – create, edit, delete news posts (slug, title, excerpt, body, youtube_url, public)
    - **YouTube embedding**: Add YouTube video URLs to news articles (supports youtube.com/watch?v=ID, youtu.be/ID, or direct video IDs)
  - `/admin/weeks` – create, edit, delete Lehrplan weeks (number, date, title, summary, body, published)
    - **File uploads**: Upload files/materials for each week (stored in Supabase `lehrplan` bucket)
  - `/admin/featured-tools` – manage featured tools carousel (title, description, images, videos, multiple links)
  - `/admin/invites` – create invite codes (hashed client‑side), choose role and max uses

- Navigation
  - The top‑right navbar shows an `Admin` button only for admins.

- Access control (Supabase RLS)
  - Run `policy-fixes.sql` in the Supabase SQL editor to install safe, idempotent policies:
    - Adds helper `public.is_admin(uid uuid)` (security definer)
    - Enables admin write access on `news`, `weeks`, forum tables and `invite_codes` with USING + WITH CHECK
    - Ensures `weeks` can be read by authenticated users only

- Grant admin role
  - Option 1: Create an invite with role `admin` at `/admin/invites` and register using that code.
  - Option 2: Promote an existing user in SQL:

```sql
update public.profiles set role = 'admin' where id = 'USER_UUID';
```

- YouTube video embedding in news
  - Admins can add YouTube URLs when creating/editing news at `/admin/news`
  - Supports multiple URL formats: `youtube.com/watch?v=ID`, `youtu.be/ID`, or direct video IDs
  - Videos are displayed as responsive embeds in news articles at `/news/[slug]`
  - Setup: Run `add-youtube-to-news.sql` in Supabase SQL editor

- File uploads for weeks
  - Admins can upload files to weeks at `/admin/weeks`
  - Students can download files when viewing a week at `/lehrplan/[week_number]`
  - Setup: see `LEHRPLAN_FILES_SETUP.md`
  - Requires: `lehrplan` bucket, `lehrplan-files.sql` and `lehrplan-storage-policies.sql`

- Featured Tools Carousel
  - Admins can create featured tools with rich content at `/admin/featured-tools`
  - Featured tools appear in a carousel at the top of `/tools`
  - Supports: long descriptions, images, YouTube videos, multiple action links
  - Only active featured tools are displayed to users
  - No comments on featured tools (comments remain only on regular tools in the grid below)
  - Setup: Run `featured-tools-setup.sql` in Supabase SQL editor
  - Requires: `featured-tools` storage bucket for images
  - See `FEATURED_TOOLS_SETUP.md` for complete setup instructions

- Troubleshooting
  - If inserts/updates fail as admin, re‑run `policy-fixes.sql` to refresh policies.
  - If you see "policy already exists", the script now `drop policy if exists ...` before creating.
  - Ensure the authenticated user has a `profiles` row with `role='admin'` and sign out/in to refresh the session.


## Docker

Build a production image (uses multi-stage build + Next.js standalone output). Provide public envs at build time for client code. Do NOT pass service role key at build time.

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY \
  -t vibecode:latest .
```

Run the container with required runtime env vars. The service role key must only be provided at runtime:

```bash
docker run --rm -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY \
  -e SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY \
  vibecode:latest
```

Environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anonymous key (public)
- `SUPABASE_SERVICE_ROLE_KEY` – Supabase service role key (server only; DO NOT expose to the browser)

You can create `.env.local` from `.env.example` for local dev (`npm run dev`), or use `--env-file` to pass envs into `docker run`.
