# Projekte Feature - Quick Start Guide

## Setup in 3 Schritten

### 1. Datenbank-Schema erstellen
Öffne den Supabase SQL Editor und führe aus:
```
projects-setup.sql
```

### 2. Storage Bucket erstellen
1. Gehe zu **Storage** im Supabase Dashboard
2. Klicke **New bucket**
3. Name: `projects`
4. **Public bucket**: ✅ JA
5. Klicke **Create bucket**

### 3. Storage Policies setzen
Im Supabase SQL Editor:
```
projects-storage-policies.sql
```

## Fertig! 🎉

Die Projekte-Seite ist jetzt unter `/projekte` verfügbar.

## Features im Überblick

### Als User kannst du:
- ✅ Projektideen mit Bildern, Links und ausführlichen Beschreibungen erstellen
- ✅ Anderen Projekten beitreten ("Mitmachen"-Button)
- ✅ Kommentare zu Projekten schreiben
- ✅ Projekte durchsuchen und filtern
- ✅ Erstellungsdatum jedes Projekts sehen

### Als Projekt-Ersteller kannst du:
- ✅ **Wirst automatisch als erster Teilnehmer hinzugefügt** (mit ⭐ markiert)
- ✅ Maximale Teilnehmerzahl festlegen (z.B. "max. 5 Personen")
- ✅ Teilnahme komplett deaktivieren (nur zur Präsentation)
- ✅ **Dein Projekt jederzeit bearbeiten** (alle Felder, inkl. Bild)
- ✅ Dein Projekt jederzeit löschen

## Verwendung

### Neues Projekt erstellen:
1. Gehe zu `/projekte`
2. Klicke auf **"+ Neues Projekt"**
3. Fülle das Formular aus:
   - **Titel** (Pflicht): z.B. "KI-gestützter Lernassistent"
   - **Kurzbeschreibung** (Pflicht): Wird in der Übersicht angezeigt
   - **Ausführliche Beschreibung** (Pflicht): Vollständige Projektbeschreibung (Markdown unterstützt)
   - **Projektbild** (Optional): Visuelles Highlight
   - **Links** (Optional): GitHub, Website, Docs, etc.
   - **Teilnahmeeinstellungen**:
     - ☑️ "Andere dürfen mitmachen" aktivieren/deaktivieren
     - Max. Teilnehmerzahl festlegen (leer = unbegrenzt)
4. Klicke **"Projekt erstellen"**

### Einem Projekt beitreten:
1. Öffne ein Projekt bei `/projekte/[slug]`
2. Klicke auf **"👋 Mitmachen"**
3. Du erscheinst nun in der Teilnehmerliste

### Projekt verlassen:
1. Öffne das Projekt
2. Klicke auf **"Verlassen"**

### Kommentar schreiben:
1. Scrolle zum Kommentarbereich am Ende der Projektseite
2. Schreibe deinen Kommentar (Markdown unterstützt)
3. Klicke **"Kommentar senden"**

### Eigenes Projekt bearbeiten:
1. Öffne dein Projekt bei `/projekte/[slug]`
2. Klicke auf **"✏️ Bearbeiten"** (oben rechts, nur für Ersteller sichtbar)
3. Ändere beliebige Felder (Titel, Beschreibung, Bild, Links, Einstellungen)
4. Klicke **"Änderungen speichern"**
5. Du wirst zurück zur Projektseite geleitet

## Beispiel-Projekt

```
Titel: Studentische Lern-App mit KI

Kurzbeschreibung:
Eine mobile App, die mit KI personalisierte Lernpläne erstellt und Studierende beim 
effektiven Lernen unterstützt.

Beschreibung:
# Über das Projekt
Wir entwickeln eine App, die Studierenden hilft, ihre Lernzeit optimal zu nutzen.

## Features
- KI-gestützte Lernplan-Erstellung
- Pomodoro-Timer mit Statistiken
- Karteikarten-System
- Lerngruppen-Finder

## Tech Stack
- Frontend: React Native
- Backend: Node.js + Express
- KI: OpenAI API
- Datenbank: PostgreSQL

## Wer wir suchen
- 1-2 Frontend-Entwickler (React Native)
- 1 Backend-Entwickler
- 1 UI/UX Designer

Bild: [App-Mockup hochladen]

Links:
- GitHub: https://github.com/team/lern-app
- Figma: https://figma.com/file/xyz
- Docs: https://notion.so/project-docs

Teilnahme: ✅ Aktiviert
Max. Teilnehmer: 5
```

## Troubleshooting

### Problem: Bilder werden nicht hochgeladen
**Lösung**: 
- Prüfe, ob der `projects` Bucket existiert
- Prüfe, ob er als **public** markiert ist
- Führe `projects-storage-policies.sql` erneut aus

### Problem: "generate_project_slug not found"
**Lösung**: Führe `projects-setup.sql` erneut aus

### Problem: Kann nicht "Mitmachen" klicken
**Mögliche Gründe**:
- Du bist der Ersteller (Ersteller sind **automatisch als erster Teilnehmer dabei** und werden mit einem ⭐ markiert)
- Maximale Teilnehmerzahl erreicht
- Teilnahme wurde vom Ersteller deaktiviert
- Du bist bereits Teilnehmer

### Problem: Ersteller wird nicht in Teilnehmerliste angezeigt
**Lösung**: Führe `projects-setup.sql` erneut aus - der Trigger `on_project_created` fügt den Ersteller automatisch als Teilnehmer hinzu. Für bestehende Projekte:
```sql
-- Ersteller nachträglich als Teilnehmer hinzufügen
insert into public.project_participants (project_id, user_id)
select id, creator_id
from public.projects
where creator_id not in (
  select user_id from public.project_participants where project_id = projects.id
);
```

### Problem: RLS Policy Fehler
**Lösung**: 
```sql
-- Stelle sicher, dass RLS aktiviert ist
alter table public.projects enable row level security;
alter table public.project_participants enable row level security;
alter table public.project_comments enable row level security;

-- Führe dann projects-setup.sql erneut aus
```

## Nächste Schritte

Nach dem Setup kannst du:
1. Ein Test-Projekt erstellen
2. Mit einem zweiten Account dem Projekt beitreten
3. Kommentare testen
4. Teilnehmerlimits testen

Viel Erfolg! 🚀

