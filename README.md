Vibe Coding LMS (MVP)

Setup
- Create `.env.local` and fill values:
  - `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anonymous key
  - `SUPABASE_SERVICE_ROLE_KEY` – Supabase service role key
  - `OPENROUTER_API_KEY` – OpenRouter API key (for Ideen-Generator feature)
- Run schema in Supabase SQL editor (in order):
  1. `implementation-guide.sql` (base schema)
  2. `add-email-to-profiles.sql` (adds email field to profiles for easier access)
- Create Storage buckets:
  - `avatars` (for user profile pictures)
  - `lehrplan` (for weekly course materials) – see `LEHRPLAN_FILES_SETUP.md` for complete setup
  - `projects` (for project images) – see `PROJECTS_SETUP.md` for complete setup

Development
```bash
npm run dev
```

Key routes
- `/login`, `/register`
- `/` News (public detail later)
- `/api/auth/register` invite-only registration
- `/projekte` Project collaboration platform
- `/ideen-generator` AI-powered idea and problem generator

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

## Ideen- & Problem-Generator

AI-powered tool to generate project ideas and problem statements for Vibe Coding projects.

- Route: `/ideen-generator`

- Features
  - **Projektideen generieren**: Generate creative project ideas with technology suggestions, features, and learning goals
  - **Problemstellungen generieren**: Generate realistic problem statements suitable for Design Thinking approaches
  - Select from multiple AI models (DeepSeek V3, Grok 4 Fast, MiniMax M2)
  - Adjustable difficulty levels (1-5) for beginners to experts
  - Markdown-formatted output
  - Real-time generation with loading states

- Setup
  - Requires `OPENROUTER_API_KEY` environment variable
  - Add to `.env.local`: `OPENROUTER_API_KEY=your_api_key_here`
  - Get API key from [OpenRouter](https://openrouter.ai/)

- Use Cases
  - Generate inspiration for new Vibe Coding projects
  - Create problem statements for Design Thinking workshops
  - Find suitable projects based on skill level
  - Practice with realistic challenges

## Projects Feature

Collaborative project platform where users can share project ideas and team up. Also includes a tool presentation feature for Leistungsschein requirements.

### Leistungsschein Requirements

To receive a Leistungsschein (certificate of achievement), students must give a presentation on **January 27, 2025** or **February 3, 2025**.

**Two options:**
1. **Present your own project** – Create and present a project you're working on
2. **Present a Vibe Coding tool** – Choose from available tools and present it to the class

### Routes
  - `/projekte` – browse all projects and available tools for presentation
  - `/projekte/neu` – create a new project
  - `/projekte/[slug]` – project details with comments and participation
  - `/projekte/[slug]/bearbeiten` – edit project (creator only)
  - `/projekte/tool-vortraege/[slug]` – tool presentation details

### Project Features
  - Create detailed project proposals with:
    - Title, short and long descriptions (Markdown supported)
    - Project images
    - External links (GitHub, website, etc.)
    - Participation settings
  - Comment on projects
  - Join projects with "Mitmachen" button
  - View creation date in German format
  - **Participant display**: Shows username and email address for coordination
  - Project creators:
    - **Automatically added as first participant** (marked with ⭐)
    - Can **edit their projects** (all fields including images)
    - Can set maximum participant limit (or unlimited)
    - Can disable participation (presentation-only mode)
    - Can delete their own projects
  - View all project participants with email addresses
  - Leave projects you've joined

### Tool Presentation Features
  - View available Vibe Coding tools for presentation
  - Register as a presenter for a tool (max 3 presenters per tool)
  - View presentation dates (January 27 or February 3)
  - See who else is presenting the same tool with email addresses
  - Comment on tool presentations
  - **Admin-only**: Tools can only be added via SQL (no UI for creating tools)

### Setup
  - Run `projects-setup.sql` in Supabase SQL editor for projects
  - Run `tools-presentation-setup.sql` in Supabase SQL editor for tool presentations
  - Create `projects` storage bucket (public)
  - See `PROJECTS_SETUP.md` for complete setup instructions

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
  -e OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY \
  vibecode:latest
```

Environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anonymous key (public)
- `SUPABASE_SERVICE_ROLE_KEY` – Supabase service role key (server only; DO NOT expose to the browser)
- `OPENROUTER_API_KEY` – OpenRouter API key for AI features (server only; optional, required for Ideen-Generator)

You can create `.env.local` for local dev (`npm run dev`), or use `--env-file` to pass envs into `docker run`.
