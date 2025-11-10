# YouTube Embedding in News

This guide explains how to embed YouTube videos in news articles.

## Setup

1. Run the SQL migration in your Supabase SQL editor:

```sql
-- File: add-youtube-to-news.sql
alter table public.news add column if not exists youtube_url text;

comment on column public.news.youtube_url is 'Optional YouTube video URL or video ID to embed in the news article';
```

2. The feature is now ready to use!

## Usage

### Adding YouTube Videos to News Articles

1. Navigate to `/admin/news` as an admin user
2. When creating or editing a news article, you'll see a new field: **YouTube URL (optional)**
3. Enter one of the following formats:

   - Full YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Short URL: `https://youtu.be/dQw4w9WgXcQ`
   - Direct video ID: `dQw4w9WgXcQ`

4. Click "News erstellen" to create or "Speichern" to save changes
5. The video will be displayed at the top of the news article, below the title

### Viewing News with YouTube Videos

When users visit `/news/[slug]`, if a YouTube URL is present:
- The video is displayed as a responsive embed (16:9 aspect ratio)
- The embed supports fullscreen, autoplay controls, and other YouTube features
- The video appears above the markdown content
- If the URL is invalid, an error message is shown to the user

## Technical Details

### Components

- **YouTubeEmbed** (`src/components/YouTubeEmbed.tsx`): React component that handles YouTube video embedding
  - Extracts video IDs from various URL formats
  - Creates responsive 16:9 embedded players
  - Shows error messages for invalid URLs

### Database Schema

The `youtube_url` column is added to the `public.news` table:

```sql
youtube_url text  -- Optional YouTube video URL or video ID
```

### URL Format Support

The component intelligently extracts video IDs from:

1. **Standard format**: `https://www.youtube.com/watch?v=VIDEO_ID`
2. **Short format**: `https://youtu.be/VIDEO_ID`
3. **Embed format**: `https://www.youtube.com/embed/VIDEO_ID`
4. **Direct ID**: `VIDEO_ID` (11 alphanumeric characters with dash/underscore)

### Responsive Design

The YouTube embed uses a 16:9 aspect ratio container with:
- 100% width relative to parent
- Absolute positioning for the iframe
- Rounded corners and border styling
- Full compatibility with dark mode

## Example

Creating a news article with a YouTube video:

1. **Slug**: `welcome-to-vibecode`
2. **Title**: `Welcome to VibeCoding!`
3. **Excerpt**: `Check out our introduction video`
4. **YouTube URL**: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
5. **Content**: Your markdown content here...

The result will display the video prominently at the top of the article, followed by the markdown content.

## Notes

- YouTube URLs are optional - news articles work normally without them
- Videos are embedded using YouTube's privacy-enhanced embed domain
- The embed includes standard YouTube controls (play, pause, volume, fullscreen, etc.)
- Videos are responsive and work on all device sizes
- The feature integrates seamlessly with existing news functionality (markdown, HTML mode, surveys, etc.)

