# Featured Tools Setup

Diese Anleitung beschreibt, wie das Featured Tools Carousel-System eingerichtet wird.

## Datenbank Setup

1. Führe das SQL-Skript in der Supabase SQL Editor aus:
   ```bash
   featured-tools-setup.sql
   ```

2. Das Skript erstellt:
   - `featured_tools` Tabelle
   - RLS Policies für Lese-/Schreibzugriff
   - Storage Bucket `featured-tools` für Bilder

## Storage Bucket

Falls der Bucket nicht automatisch erstellt wird:

1. Gehe zu Supabase Dashboard → Storage
2. Erstelle einen neuen Bucket namens `featured-tools`
3. Setze den Bucket auf `public: true`

## Features

### Admin Interface (`/admin/featured-tools`)

Admins können Featured Tools erstellen und bearbeiten mit:

- **Titel** (erforderlich)
- **Kurzbeschreibung** (erforderlich) - wird prominent im Carousel angezeigt
- **Lange Beschreibung** (optional) - zusätzliche Details
- **Bild-Upload** - Bilder werden im `featured-tools` Storage Bucket gespeichert
- **YouTube URL** (optional) - für Video-Embeds im Carousel
- **Mehrere Links** - mit Label und URL, z.B. "Zur Website", "Dokumentation", "Tutorial"
- **Sortierung** - bestimmt die Reihenfolge im Carousel
- **Aktiv/Inaktiv** - nur aktive Tools werden angezeigt

### Carousel auf `/tools`

- Zeigt aktive Featured Tools in einem automatisch rotierenden Carousel
- Navigation via Pfeile und Dot-Indikatoren
- Auto-Play pausiert bei manueller Navigation
- Responsive Design mit Grid-Layout
- Bilder und/oder YouTube-Videos können angezeigt werden
- Multiple Action-Links werden prominent dargestellt

### Wichtig

- **Keine Kommentare** bei Featured Tools (nur bei normalen Tools im Grid darunter)
- Nur Admins können Featured Tools erstellen/bearbeiten
- Alle authentifizierten Nutzer können Featured Tools sehen
- Featured Tools erscheinen ÜBER der bestehenden Tools-Grid-Liste

## Verwendung

1. Als Admin zu `/admin/featured-tools` gehen
2. "Neues Featured Tool" klicken
3. Formulardaten ausfüllen (Titel, Beschreibungen, Bild, Links, etc.)
4. Optional: YouTube-URL für Video-Embed hinzufügen
5. Mehrere Links hinzufügen (z.B. "Website", "Dokumentation", "Demo")
6. Sortierung festlegen (niedrigere Zahlen erscheinen zuerst)
7. Als "Aktiv" markieren
8. Speichern

Das Featured Tool erscheint nun im Carousel auf der `/tools` Seite.

## Schema Details

```sql
featured_tools (
  id bigserial primary key,
  title text not null,
  description text not null,              -- Kurzbeschreibung
  long_description text,                   -- Längere Details
  youtube_url text,                        -- Optional: YouTube Embed
  links jsonb default '[]',                -- Array of {label, url}
  image_url text,                          -- Vom Storage Bucket
  sort_order int default 0,                -- Carousel Reihenfolge
  is_active boolean default true,          -- Sichtbarkeit
  created_by uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)
```

