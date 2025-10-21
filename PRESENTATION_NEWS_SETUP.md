# Presentation News Article Setup

## Summary
Successfully added the presentation from 21.10.2025 as a news article that displays HTML content in an iframe.

## Changes Made

### 1. Files Copied to Public Directory
- ✅ `praesentation-21-10-2025.html` → `/public/praesentation-21-10-2025.html`
- ✅ `bilder/` folder → `/public/bilder/` (contains all presentation images)

### 2. Code Changes

#### `/src/app/news/[slug]/page.tsx`
- Added `is_html` field to the database query
- Added conditional rendering:
  - If `is_html` is true: renders HTML content using `dangerouslySetInnerHTML`
  - If `is_html` is false: uses existing markdown rendering with `MarkdownWithSurveys`
- Added back navigation link for HTML content

#### `/Dockerfile`
- Added comment clarifying that public directory includes presentations and images
- No functional change (already copied public directory correctly)

#### `/initial-seed.sql`
- Added `is_html` column to news table (with default false)
- Added new news article insert for the presentation

### 3. New Files Created

#### `/add-presentation-news.sql`
Standalone SQL file for existing databases that already ran initial-seed.sql. Contains:
- ALTER TABLE to add `is_html` column
- INSERT statement for the presentation news article

## Database Schema Change

```sql
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS is_html boolean DEFAULT false;
```

## To Deploy

### For New Databases
Run the updated `initial-seed.sql` - it now includes the presentation article.

### For Existing Databases
Run `add-presentation-news.sql` in Supabase SQL Editor to add:
1. The `is_html` column
2. The presentation news article

### Deploy Application
1. Rebuild the application (the public files are now included)
2. If using Docker, rebuild the image - Dockerfile already copies public directory correctly

## How It Works

1. The presentation HTML is served as a static file from `/public/`
2. Images are referenced as `/bilder/filename.png` (also in `/public/`)
3. The news article embeds the presentation in an iframe
4. Users can navigate the presentation using arrow keys
5. A link allows opening in fullscreen

## Access

Once deployed and SQL is run, the presentation will be available at:
- News list: `/news` (will show in the list)
- Direct link: `/news/praesentation-erste-sitzung-21-10-2025`
- Fullscreen presentation: `/praesentation-21-10-2025.html`

## Notes

- The `is_html` field is now available for any news article that needs custom HTML content
- Security: Using `dangerouslySetInnerHTML` is acceptable here since content comes from your database (controlled by admins)
- Images in presentation use relative paths (`../bilder/`) which work because both presentation and images are in `/public/`

