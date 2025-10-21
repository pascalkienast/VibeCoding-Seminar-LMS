-- Initial seed data for Vibe Coding LMS
-- Run this in the Supabase SQL editor (service role context)

begin;

-- Ensure pgcrypto for bcrypt-compatible crypt()
create extension if not exists pgcrypto;

-- Invite codes: store bcrypt-style hashes using pgcrypto's blowfish (bf)
-- Admin invite (use the literal code ADMIN-INIT-2025 when registering)
insert into public.invite_codes (code_hash, label, role, max_uses, used_count, expires_at, created_by)
values (crypt('ADMIN-INIT-2025', gen_salt('bf', 10)), 'admin_init', 'admin', 10, 0, null, null)
on conflict (code_hash) do nothing;

-- Student invite (use STUDENT-INIT-2025)
insert into public.invite_codes (code_hash, label, role, max_uses, used_count, expires_at, created_by)
values (crypt('EMW', gen_salt('bf', 10)), 'student_init', 'student', 500, 0, null, null)
on conflict (code_hash) do nothing;

-- Forum categories
insert into public.forum_categories (slug, title, description, sort_order, created_by)
values
  ('ankuendigungen', 'Ankündigungen', 'Wichtige Infos und Updates zum Kurs', 0, null),
  ('allgemein', 'Allgemein', 'Allgemeine Diskussionen und Fragen', 1, null),
  ('projekte', 'Projekte', 'Austausch zu Gruppenprojekten und Ideen', 2, null)
on conflict (slug) do nothing;

-- Pinned welcome topic in Ankündigungen
insert into public.forum_topics (category_id, title, is_locked, is_pinned, author_id)
select c.id, 'Willkommen im Forum', false, true, null
from public.forum_categories c
where c.slug = 'ankuendigungen'
on conflict do nothing;

-- Welcome post in the welcome topic
insert into public.forum_posts (topic_id, author_id, body)
select t.id, null, $$Willkommen! Bitte nutzt dieses Forum für Fragen, Ankündigungen und Austausch.

Beachtet die Netiquette: respektvoll, konstruktiv, hilfreich. Viel Spaß im Kurs!$$
from public.forum_topics t
join public.forum_categories c on c.id = t.category_id
where c.slug = 'ankuendigungen' and t.title = 'Willkommen im Forum'
on conflict do nothing;

-- Add is_html column to news table if it doesn't exist
alter table public.news add column if not exists is_html boolean default false;

-- Initial news post
insert into public.news (slug, title, excerpt, body, is_public, published_at, author_id)
values (
  'kursstart-vibe-coding-2025',
  'Kursstart: Vibe Coding – KI-gestützte App-Entwicklung',
  'Willkommen! Alle Infos zum Start und Ablauf des Seminars.',
  $$Willkommen im Seminar "Vibe Coding: KI-gestützte App-Entwicklung jenseits klassischer Programmierung". 

Wir experimentieren mit Tools wie Cursor, Lovable, v0 und mehr, und diskutieren Chancen und Grenzen. 
Alle Termine siehe Lehrplan.$$,
  true,
  now(),
  null
)
on conflict (slug) do nothing;

-- Presentation news post with embedded HTML
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

-- Lehrplan (weeks)
-- Marked published to show on /lehrplan
insert into public.weeks (week_number, date, title, summary, body, is_published, created_by)
values
  (1, '2025-10-21', 'Einführung – Die Vibe Coding Revolution',
    'Begriff, Live-Demo, Setup der Tools',
    $$Inhalt:
- Was ist Vibe Coding? Historie und Begriff
- Live-Demo: Eine App in 10 Minuten

Praktisch:
- Erste Experimente mit Code-Generierung
- Accounts/Setup für die Tools

Lektüre:
- Karpathy (2025): The Age of Vibe Coding (Thread)$$,
    true, null),
  (2, '2025-10-28', 'Tools des Wandels – Das neue Entwickler-Ökosystem',
    'Überblick KI-Coding-Tools, Deep Dive Cursor',
    $$Inhalt:
- Überblick der Vibe Coding Tools 2025
- Deep Dive: Cursor Agent Mode

Praktisch:
- Hands-on Workshop mit Cursor
- Mini-Projekte (To-Do, persönliche Website)

Aufgabe:
- Tool-Exploration für nächste Woche$$,
    true, null),
  (3, '2025-11-04', 'No-Code trifft AI-Code – neue Paradigmen',
    'Kurzpräsentationen, Toolvergleich, Coding-Session',
    $$Inhalt:
- Tool-Präsentationen (5 Min)
- No-Code vs. AI-Code

Praktisch:
- Coding-Session mit verschiedenen Tools
- Vergleich der Ergebnisse

Aufgabe:
- Bis 25.11. Gruppenbildung für Projekte$$,
    true, null),
  (4, '2025-11-11', 'Black Box Problematik – Wenn Code unsichtbar wird',
    'Sicherheitslücken, technische Schulden, Debugging',
    $$Inhalt:
- Black Box Society (Frank Pasquale)
- Sicherheitslücken in KI-Code
- Fallstudien

Praktisch:
- Code Review Session
- Debugging-Übungen

Gast:
- Geplant: HPI-Input zu Cyber-Security$$,
    true, null),
  (5, '2025-11-25', 'MCP Servers – Die Brücke zwischen KI und Software',
    'Model Context Protocol, Integration, Gruppenbildung',
    $$Inhalt:
- Model Context Protocol: Universalschnittstelle
- Beispiele: Unity, Blender, Web MCP

Praktisch:
- MCP Server Setup und Experimente
- Finale Gruppenbildung

Projektideen:
- Brainstorming und Konzeptentwicklung$$,
    true, null),
  (6, '2025-12-02', 'Hands-on Workshop – Fortgeschrittene Vibe Coding Techniken',
    'Advanced Prompting, Multi-Tool-Workflows, Kollaboration',
    $$Inhalt:
- Advanced Prompting
- Multi-Tool Workflows
- Version Control und Kollaboration mit KI

Praktisch:
- Intensive Projektarbeit
- 1:1 Troubleshooting

Peer Review:
- informelle Zwischenstände$$,
    true, null),
  (7, '2025-12-09', 'Medientheorie: Vergessene Geschichte des Codings',
    'ENIAC, Militärmetaphern, Grace Hopper, Software als Ideologie',
    $$Inhalt:
- ENIAC "Girls" und weitere Pionierinnen
- Militärische Metaphern (Master/Slave, Daemon, Kill)
- Grace Hopper, automatisches Programmieren
- Wendy Hui Kyong Chun

Praktisch:
- Spurensuche mit KI-Tools
- Sprachanalyse im Code
- Historische Kontextualisierung$$,
    true, null),
  (8, '2025-12-16', 'Ethik und Verantwortung – Bias bis Rechtsfragen',
    'Bias-Tests, Haftung, Urheberrecht, Open vs. Proprietär',
    $$Inhalt:
- Gender-Bias in KI-Systemen
- Haftung für diskriminierende Outputs
- Urheberrecht bei KI-Code
- Open Source vs. proprietär

Praktisch:
- Bias-Experimente mit Tools
- Vergleich Cursor vs. Lovable
- Ethische Guidelines fürs Projekt$$,
    true, null),
  (9, '2026-01-06', 'Beyond Web – KI-Coding für Games und interaktive Medien',
    'Game Dev, Asset-Generierung, Plattformen, Prototyping',
    $$Inhalt:
- Vibe Coding für Games
- 2D/3D Asset-Generierung
- Unity, Roblox u.a.

Praktisch:
- Kurzer Game Jam
- Projektarbeit / Feinschliff$$,
    true, null),
  (10, '2026-01-13', 'Real-World Applications – Von der Idee zum Produkt',
    'Case Studies, Deployment, Stores, Monetarisierung',
    $$Inhalt:
- Erfolgreiche Vibe-Coding-Projekte
- Deployment & Hosting
- App-/Play-Store
- Monetarisierung

Praktisch:
- Deployment Workshop
- Finalisierung$$,
    true, null),
  (11, '2026-01-20', 'Die Zukunft des Codens – Trends und Rollen',
    'Prompt Engineers, neue Berufsbilder, Ausblick 2026',
    $$Inhalt:
- Von Programmierern zu Prompt Engineers?
- Neue Berufsbilder
- Neue Tools am Horizont
- Post-Code-Ära

Praktisch:
- Letzte Verbesserungen
- Ausarbeitung Präsentationen$$,
    true, null),
  (12, '2026-01-27', 'Projektpräsentationen Teil 1',
    '4–5 Gruppen, Live-Demos, Peer-Feedback',
    $$Ablauf:
- 4–5 Gruppenpräsentationen (15 Min + 10 Min Diskussion)
- Live-Demos
- Peer-Feedback und Reflexion

Bewertung:
- Kreativität, Technik, Reflexion, Präsentation$$,
    true, null),
  (13, '2026-02-03', 'Projektpräsentationen Teil 2 & Abschluss',
    'Weitere Gruppen, Vernissage, Seminarabschluss',
    $$Ablauf:
- Weitere Präsentationen
- Gemeinsame Reflexion
- Digitale Vernissage: Alle Projekte online
- Diskussion: Was haben wir gelernt?$$,
    true, null)
on conflict (week_number) do nothing;

commit;


