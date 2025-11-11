# Projekte Feature Setup

Dieses Dokument beschreibt die vollständige Einrichtung des Projekte-Features.

## 1. Datenbank-Schema

Führe `projects-setup.sql` im Supabase SQL-Editor aus. Dies erstellt:
- `projects` Tabelle für Projektdaten
- `project_participants` Tabelle für Teilnehmer
- `project_comments` Tabelle für Kommentare
- RLS Policies für sichere Zugriffskontrolle
- Helper-Funktion `generate_project_slug()` für automatische Slug-Generierung
- **Trigger**: Fügt den Projekt-Ersteller automatisch als ersten Teilnehmer hinzu

## 2. Storage Bucket

Erstelle einen neuen Storage Bucket in Supabase:

1. Gehe zu **Storage** in deinem Supabase-Dashboard
2. Klicke auf **New bucket**
3. Name: `projects`
4. Public bucket: **Ja** (damit Bilder öffentlich sichtbar sind)
5. Klicke auf **Create bucket**

### Storage Policies

Nach dem Erstellen des Buckets, füge folgende Policies hinzu:

```sql
-- Allow authenticated users to upload images
create policy "authenticated_upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'projects' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access
create policy "public_read"
on storage.objects for select
to public
using (bucket_id = 'projects');

-- Allow users to delete their own uploads
create policy "user_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'projects' and
  (storage.foldername(name))[1] = auth.uid()::text
);
```

Alternative: Einfachere Public Bucket Policy (wenn obiges nicht funktioniert):

```sql
-- Allow any authenticated user to upload
create policy "authenticated_upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'projects');

-- Allow public read access
create policy "public_read"
on storage.objects for select
to public
using (bucket_id = 'projects');

-- Allow authenticated users to delete
create policy "authenticated_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'projects');
```

## 3. Features

### Für alle User:
- Projekte durchsuchen und ansehen
- Projektideen mit umfangreichen Informationen erstellen:
  - Titel, Kurz- und Langbeschreibung
  - Projektbild
  - Externe Links (GitHub, Website, etc.)
  - Teilnahmeeinstellungen
- Kommentare zu Projekten schreiben
- "Mitmachen"-Button, um Projekten beizutreten
- Projekte wieder verlassen
- Erstellungsdatum wird angezeigt

### Für Projekt-Ersteller:
- **Automatisch als erster Teilnehmer hinzugefügt** (mindestens 1 Teilnehmer)
- Maximale Teilnehmerzahl festlegen (oder unbegrenzt)
- Teilnahme komplett deaktivieren (nur zur Präsentation)
- **Eigene Projekte bearbeiten** (alle Felder inkl. Bild, Links, Einstellungen)
- Eigene Projekte löschen
- Visuell markiert in der Teilnehmerliste (⭐)

## 4. Routen

- `/projekte` - Übersicht aller Projekte
- `/projekte/neu` - Neues Projekt erstellen
- `/projekte/[slug]` - Projektdetails mit Kommentaren und Teilnehmern
- `/projekte/[slug]/bearbeiten` - Projekt bearbeiten (nur für Ersteller)

## 5. Technische Details

### Datenmodell

**projects:**
- `id` (uuid, PK)
- `creator_id` (uuid, FK → auth.users)
- `title` (text)
- `slug` (text, unique)
- `description` (text) - Kurzbeschreibung
- `content` (text) - Ausführliche Beschreibung (Markdown)
- `image_url` (text, nullable)
- `external_links` (jsonb) - Array von {label, url}
- `allow_participants` (boolean)
- `max_participants` (int, nullable) - null = unbegrenzt
- `created_at`, `updated_at` (timestamptz)

**project_participants:**
- `id` (uuid, PK)
- `project_id` (uuid, FK → projects)
- `user_id` (uuid, FK → auth.users)
- `joined_at` (timestamptz)
- Unique constraint auf (project_id, user_id)

**project_comments:**
- `id` (uuid, PK)
- `project_id` (uuid, FK → projects)
- `author_id` (uuid, FK → auth.users)
- `body` (text)
- `created_at` (timestamptz)

### Sicherheit (RLS)

- **Projekte**: Alle können lesen, nur Ersteller können bearbeiten/löschen
- **Teilnehmer**: Alle können lesen, User können nur sich selbst hinzufügen/entfernen
- **Kommentare**: Alle können lesen, nur Autoren können löschen

### UI/UX Highlights

- Responsive Design mit Grid-Layout
- Bildvorschau beim Upload
- Live-Teilnehmerzähler
- Markdown-Support für Beschreibungen und Kommentare
- Automatische Slug-Generierung aus Titel
- Visuelle Indikatoren für volle/geschlossene Projekte
- Ersteller wird automatisch als Teilnehmer hinzugefügt und visuell markiert (⭐)
- Erstellungsdatum in deutscher Datumsformatierung

## 6. Testing Checklist

Nach dem Setup teste folgende Szenarien:

- [ ] Projekt erstellen mit allen Feldern
- [ ] Projekt erstellen mit minimalem Input (nur Pflichtfelder)
- [ ] Bild hochladen und anzeigen
- [ ] Externe Links hinzufügen und öffnen
- [ ] **Eigenes Projekt bearbeiten** (Titel, Beschreibung, Bild, Links, Einstellungen)
- [ ] Versuch fremdes Projekt zu bearbeiten (sollte abgelehnt werden)
- [ ] Bild beim Bearbeiten austauschen
- [ ] Als anderer User dem Projekt beitreten
- [ ] Maximale Teilnehmerzahl erreichen
- [ ] Versuch beizutreten wenn voll (sollte abgelehnt werden)
- [ ] Projekt mit deaktivierter Teilnahme erstellen
- [ ] Kommentar hinzufügen
- [ ] Projekt verlassen
- [ ] Eigenes Projekt löschen

## 7. Troubleshooting

### Bilder werden nicht hochgeladen
- Prüfe, ob der `projects` Bucket existiert
- Prüfe Storage Policies
- Prüfe Dateigröße (Supabase hat Standard-Limits)

### "generate_project_slug" Funktion nicht gefunden
- Führe `projects-setup.sql` erneut aus
- Prüfe, ob die Funktion in der Supabase Dashboard unter "Database" → "Functions" existiert

### Teilnahme funktioniert nicht
- Prüfe RLS Policies auf `project_participants`
- Stelle sicher, dass User eingeloggt ist
- Prüfe Browser-Konsole für Fehler

### Slug-Duplikate
- Die Funktion `generate_project_slug()` sollte automatisch einen Counter anhängen
- Falls Probleme auftreten, Funktion in SQL neu definieren

