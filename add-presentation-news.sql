-- Add presentation news article to existing database
-- Run this in Supabase SQL editor if you already ran initial-seed.sql

-- Add is_html column to news table if it doesn't exist
alter table public.news add column if not exists is_html boolean default false;

-- Insert presentation news post with embedded HTML
insert into public.news (slug, title, excerpt, body, is_public, published_at, author_id, is_html)
values (
  'praesentation-erste-sitzung-21-10-2025',
  '📊 Präsentation: Erste Sitzung vom 21.10.2025',
  'Die vollständige Präsentation zur ersten Sitzung "Vibe Coding - KI-gestützte App-Entwicklung jenseits klassischer Programmierung"',
  '<iframe src="/praesentation-21-10-2025.html" style="width: 100%; height: 90vh; border: 2px solid #333; border-radius: 8px;" allowfullscreen></iframe>
<div style="margin-top: 1rem; padding: 1rem; background: rgba(139, 92, 246, 0.1); border-radius: 6px;">
  <p style="margin: 0;"><strong>Tipp:</strong> Nutze die Pfeiltasten ← → zum Navigieren durch die Präsentation</p>
  <p style="margin-top: 0.5rem;"><a href="/praesentation-21-10-2025.html" target="_blank" style="color: #00ffff;">📺 Präsentation im Vollbild öffnen</a></p>
</div>',
  true,
  '2025-10-21 16:25:00',
  null,
  true
)
on conflict (slug) do nothing;

