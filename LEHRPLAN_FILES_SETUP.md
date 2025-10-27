# Lehrplan File Upload Setup

This guide explains how to enable file uploads for weekly lehrplan entries.

## Features

- **Admin Panel**: Upload multiple files per week
- **User View**: Download files attached to each week
- **File Management**: View file sizes, delete files
- **Security**: RLS policies ensure only admins can upload/delete, all authenticated users can download

## Setup Steps

### 1. Create Storage Bucket

In Supabase Dashboard:
1. Go to **Storage**
2. Click **Create a new bucket**
3. Name: `lehrplan`
4. **Public**: `false` (important for security)
5. Click **Create bucket**

### 2. Run Database Migration

Run `lehrplan-files.sql` in the Supabase SQL editor:

```bash
# This creates the week_files table and RLS policies
```

The migration creates:
- `week_files` table to store file metadata
- RLS policies for authenticated read access
- RLS policies for admin write access

### 3. Configure Storage Policies

Run `lehrplan-storage-policies.sql` in the Supabase SQL editor:

```bash
# This sets up storage bucket policies
```

The storage policies allow:
- ✅ Authenticated users can **read** files
- ✅ Admins can **upload** files
- ✅ Admins can **update** files
- ✅ Admins can **delete** files

### 4. Verify Setup

1. **Test as admin**:
   - Go to `/admin/weeks`
   - You should see "Dateien (0)" for each week
   - Click "Datei(en) hinzufügen" to upload files
   
2. **Test as student**:
   - Go to `/lehrplan/[week_number]` for a week with files
   - You should see "📎 Dateien & Materialien" section
   - Click "Herunterladen" to download files

## Database Schema

### week_files table

```sql
create table public.week_files (
  id bigserial primary key,
  week_id bigint not null references public.weeks(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  uploaded_by uuid references auth.users,
  uploaded_at timestamptz default now()
);
```

## File Organization

Files are stored in the bucket with the following structure:
```
lehrplan/
  week-1/
    1234567890-lecture-slides.pdf
    1234567891-homework.pdf
  week-2/
    1234567892-reading.pdf
```

Each file is prefixed with a timestamp to ensure uniqueness.

## Admin Panel Usage

### Upload Files

1. Navigate to `/admin/weeks`
2. Find the week you want to add files to
3. Click **"Datei(en) hinzufügen"**
4. Select one or multiple files
5. Files will upload and appear in the list

### Delete Files

1. Find the file in the week's file list
2. Click **"Löschen"**
3. Confirm deletion
4. File is removed from both storage and database

## User View

When viewing a week at `/lehrplan/[week_number]`:

- If files exist, a "📎 Dateien & Materialien" section appears
- Each file shows:
  - File name
  - File size
  - Upload date
  - Download button
- Clicking "Herunterladen" triggers a browser download

## Security

- **Storage bucket is private**: Files are not publicly accessible via URL
- **RLS on week_files**: Database queries respect user roles
- **Storage policies**: Only admins can upload/delete, authenticated users can read
- **No direct URLs**: Files must be downloaded through authenticated API calls

## Troubleshooting

### "Failed to upload" error
- Verify the `lehrplan` bucket exists
- Check that storage policies are correctly applied
- Ensure you're logged in as admin

### "Failed to download" error
- Verify you're authenticated
- Check that the file exists in storage
- Verify read policies are applied

### Files not showing
- Check that `week_files` table exists
- Verify RLS policies allow reads for authenticated users
- Ensure files were successfully uploaded (check Supabase Storage dashboard)

## Updating from Previous Version

If you're updating an existing installation:

1. Run `lehrplan-files.sql` to add the new table
2. Run `lehrplan-storage-policies.sql` to set up storage access
3. The admin and user pages have been automatically updated
4. No changes needed to existing weeks data

