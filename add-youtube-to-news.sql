-- Add YouTube embedding capability to news table
-- Run this in Supabase SQL editor to add youtube_url column

alter table public.news add column if not exists youtube_url text;

comment on column public.news.youtube_url is 'Optional YouTube video URL or video ID to embed in the news article';

