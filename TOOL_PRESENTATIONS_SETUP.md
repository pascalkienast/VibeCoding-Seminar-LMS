# Tool Presentations Setup Guide

Dieses Feature ermöglicht es Studenten, sich für die Präsentation von Vibe Coding Tools einzutragen, um die Leistungsschein-Anforderung zu erfüllen.

## Voraussetzungen

- Supabase Projekt eingerichtet
- `public.is_admin()` Funktion vorhanden (aus `policy-fixes.sql`)
- Authentifizierung funktioniert

## Setup Schritte

### 1. SQL Schema erstellen

Führe `tools-presentation-setup.sql` im Supabase SQL Editor aus. Dies erstellt:

- `presentation_tools` – Tabelle für Tools (nur Admins können einfügen)
- `presentation_tool_presenters` – Tabelle für Präsentatoren (Studenten können sich eintragen)
- `presentation_tool_comments` – Kommentare zu Tools
- RLS Policies für Zugriffskontrolle
- Indexes für Performance

### 2. Tools hinzufügen (Admin/SQL)

Tools können **nur via SQL** hinzugefügt werden. Beispiel:

```sql
insert into public.presentation_tools (title, slug, description, content, presentation_date, max_presenters)
values 
  (
    'Figma',
    'figma',
    'Kollaboratives Design-Tool für UI/UX',
    '# Figma

Figma ist ein webbasiertes Design-Tool für Interface-Design und Prototyping.

## Features
- Echtzeit-Kollaboration
- Komponenten & Design-Systeme
- Prototyping & Interaktionen
- Dev-Handoff mit CSS/Code-Export

## Warum Figma?
- Browser-basiert (keine Installation)
- Kostenlos für Studenten
- Industry Standard

## Links
- [Figma Website](https://figma.com)
- [Figma Tutorial](https://help.figma.com)',
    '2025-01-27 14:00:00+01',
    3
  ),
  (
    'VS Code',
    'vs-code',
    'Leistungsstarker Code-Editor',
    '# Visual Studio Code

VS Code ist ein kostenloser, open-source Code-Editor von Microsoft.

## Features
- IntelliSense (Code-Vervollständigung)
- Integriertes Terminal
- Git Integration
- Extensions Marketplace

## Must-Have Extensions
- ESLint
- Prettier
- GitLens
- Live Server

## Links
- [VS Code Download](https://code.visualstudio.com)
- [Extension Marketplace](https://marketplace.visualstudio.com)',
    '2025-01-27 14:00:00+01',
    3
  );
```

### 3. Optional: Storage Bucket für Tool-Bilder

Falls du Bilder für Tools hochladen möchtest:

1. Gehe zu Supabase → Storage
2. Erstelle einen neuen Bucket: `presentation-tools`
3. Mache ihn **public**
4. Lade Bilder hoch
5. Nutze die URL im `image_url` Feld

```sql
update public.presentation_tools
set image_url = 'https://[projekt-id].supabase.co/storage/v1/object/public/presentation-tools/figma.png'
where slug = 'figma';
```

## Verwendung für Studenten

### 1. Übersicht ansehen

Studenten gehen auf `/projekte` und sehen:
- Info-Box mit Leistungsschein-Anforderungen
- Liste aller Projekte
- Liste aller verfügbaren Tools für Präsentationen

### 2. Als Präsentator eintragen

1. Tool auswählen und auf Details-Seite klicken
2. Button "Als Präsentator eintragen" klicken
3. Fertig! Name und Email werden angezeigt

### 3. Austragen

Studenten können sich jederzeit wieder austragen über den "Austragen" Button.

## Features

### Für Studenten
- ✅ Tools durchsuchen
- ✅ Als Präsentator eintragen (max. 3 pro Tool)
- ✅ Kommentare schreiben
- ✅ Email-Adressen der Co-Präsentatoren sehen
- ✅ Präsentationsdatum sehen
- ❌ Keine Tools erstellen (nur via SQL)

### Für Admins
- ✅ Tools via SQL hinzufügen
- ✅ Tools via SQL bearbeiten/löschen
- ✅ Max. Präsentatoren-Anzahl festlegen
- ✅ Präsentationsdatum festlegen

## Tabellen-Schema

### presentation_tools
```sql
- id (uuid)
- title (text)
- slug (text, unique)
- description (text)
- content (text, markdown)
- image_url (text, optional)
- external_links (jsonb, array of {label, url})
- presentation_date (timestamptz)
- max_presenters (int, default 3)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### presentation_tool_presenters
```sql
- id (uuid)
- tool_id (uuid, FK to presentation_tools)
- user_id (uuid, FK to auth.users)
- joined_at (timestamptz)
- UNIQUE(tool_id, user_id)
```

### presentation_tool_comments
```sql
- id (uuid)
- tool_id (uuid, FK to presentation_tools)
- author_id (uuid, FK to auth.users)
- body (text, markdown)
- created_at (timestamptz)
```

## Troubleshooting

### "permission denied for table presentation_tools"

Stelle sicher, dass:
1. RLS aktiviert ist
2. Policies erstellt wurden (siehe `tools-presentation-setup.sql`)
3. User authentifiziert ist

### "relation presentation_tools does not exist"

Führe `tools-presentation-setup.sql` im Supabase SQL Editor aus.

### Studenten können sich nicht eintragen

1. Prüfe ob der Student authentifiziert ist
2. Prüfe ob max_presenters erreicht ist
3. Prüfe ob der Student bereits eingetragen ist (unique constraint)

## Leistungsschein-Workflow

1. **Admin**: Tools via SQL hinzufügen mit Präsentationsdatum
2. **Student**: Entweder:
   - Eigenes Projekt erstellen (`/projekte/neu`)
   - ODER: Tool auswählen und als Präsentator eintragen
3. **Koordination**: Studenten sehen Email-Adressen der Co-Präsentatoren
4. **Präsentation**: Am 27.01. oder 03.02. 2025 präsentieren
5. **Leistungsschein**: Nach erfolgreicher Präsentation erhalten

## SQL Beispiele

### Alle Tools mit Präsentatoren-Anzahl
```sql
select 
  t.title,
  t.presentation_date,
  count(p.id) as presenter_count,
  t.max_presenters
from presentation_tools t
left join presentation_tool_presenters p on p.tool_id = t.id
group by t.id
order by t.presentation_date;
```

### Präsentatoren eines bestimmten Tools
```sql
select 
  prof.username,
  prof.email,
  p.joined_at
from presentation_tool_presenters p
join profiles prof on prof.id = p.user_id
join presentation_tools t on t.id = p.tool_id
where t.slug = 'figma'
order by p.joined_at;
```

### Tool löschen (inkl. aller Präsentatoren & Kommentare durch CASCADE)
```sql
delete from presentation_tools where slug = 'tool-slug';
```

