-- Projektideen Seed für Vibe Coding LMS
-- Führe dieses Script im Supabase SQL Editor aus
-- WICHTIG: Ersetze 'ADMIN_USER_ID' mit der UUID eines Admin-Users aus deiner profiles-Tabelle

-- Variante 1: Mit expliziter Admin-UUID (empfohlen)
-- Finde zuerst deine Admin-UUID mit: SELECT id FROM profiles WHERE role = 'admin' LIMIT 1;
-- Dann ersetze unten 'ADMIN_USER_ID' durch diese UUID

-- Variante 2: Automatisch ersten Admin verwenden
DO $$
DECLARE
    admin_id uuid;
BEGIN
    -- Hole die ID des ersten Admin-Users
    SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
    
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Kein Admin-User gefunden! Bitte zuerst einen Admin erstellen.';
    END IF;

    -- =====================================================
    -- KATEGORIE 1: WEBSEITEN & PORTFOLIO-PROJEKTE
    -- =====================================================

    INSERT INTO projects (title, slug, description, content, creator_id, allow_participants, max_participants)
    VALUES (
        'Open Source Webseite mit DeepSite',
        'open-source-webseite-deepsite',
        'Erstelle eine komplett Open-Source Website mit DeepSite auf Hugging Face - ohne Account, kostenlos und transparent.',
        E'## Projektbeschreibung\n\nDeepSite ist ein komplett Open-Source Website-Builder auf Hugging Face, der DeepSeek-V3 nutzt. Du beschreibst einfach, welche Website du möchtest, und die KI generiert vollständig funktionsfähigen HTML/CSS/JS-Code.\n\n## Konkrete Umsetzungsideen\n\n- Erstelle eine Landing Page für ein fiktives EMW-Forschungsprojekt\n- Baue eine Infoseite über ein medientheoretisches Konzept (z.B. "Black Box" nach Pasquale)\n- Erstelle eine Fan-Page für einen Medientheoretiker oder eine Medientheoretikerin\n\n## Medienwissenschaftlicher Bezug\n\nReflexion über Open Source vs. proprietäre KI-Systeme, Transparenz in der Softwareentwicklung\n\n## Ressourcen\n\n- https://huggingface.co/spaces/enzostvs/deepsite\n- Komplett kostenlos und Open Source\n- Kein Account nötig\n\n**Schwierigkeit:** ⭐ Einsteiger\n**Zeitaufwand:** 3-5 Stunden',
        admin_id,
        true,
        4
    ) ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projects (title, slug, description, content, creator_id, allow_participants, max_participants)
    VALUES (
        'Persönlicher Lebenslauf als interaktive Webseite',
        'lebenslauf-interaktive-webseite',
        'Erstelle dein Portfolio als moderne, interaktive Webseite mit Lovable oder v0.dev - mit Animationen und Dark Mode.',
        E'## Projektbeschreibung\n\nErstelle eine interaktive Portfolio-Webseite, die dich und deine Arbeit präsentiert.\n\n## Variante A: Mit Lovable\n\nLovable eignet sich besonders für visuell ansprechende, moderne Designs.\n\n**Prompt-Beispiel:**\n> "Erstelle eine moderne Portfolio-Webseite für eine Medienwissenschafts-Studentin. Die Seite soll Abschnitte für Über Mich, Projekte, Publikationen und Kontakt haben. Nutze ein minimalistisches Design mit sanften Farbverläufen."\n\n## Variante B: Mit v0.dev (Vercel)\n\nv0 generiert React/Next.js-Komponenten und ist besonders gut für moderne UI-Komponenten.\n\n**Prompt-Beispiel:**\n> "Create a creative portfolio website for a media studies student with an animated hero section, project cards with hover effects, and a timeline showing academic career."\n\n## Erweiterungsideen\n\n- Integration eines Blog-Bereichs für Seminarreflexionen\n- Dark/Light Mode Toggle\n- Animierte Skill-Bars für Software-Kenntnisse\n- Interaktive Timeline des Studiums\n\n**Schwierigkeit:** ⭐ Einsteiger\n**Tools:** Lovable, v0.dev, Google AI Studio',
        admin_id,
        true,
        4
    ) ON CONFLICT (slug) DO NOTHING;

    -- =====================================================
    -- KATEGORIE 2: GAMES & INTERAKTIVE ERLEBNISSE
    -- =====================================================

    INSERT INTO projects (title, slug, description, content, creator_id, allow_participants, max_participants)
    VALUES (
        'Retro RPG mit dem Farm Asset Pack',
        'retro-rpg-farm-asset-pack',
        'Entwickle ein 2D-Browsergame mit Cursor AI und Phaser.js - Assets werden bereitgestellt!',
        E'## Projektbeschreibung\n\nEntwickle ein Retro-RPG Browsergame mit dem bereitgestellten Farm Asset Pack.\n\n## Schritt-für-Schritt-Anleitung\n\n### 1. Assets vorbereiten\n- Das RAR-Archiv entpacken\n- Tilemap Editor nutzen: [SpriteFusion](https://www.spritefusion.com/)\n- Erstelle eine Karte mit Tiles (Boden, Wege, Gebäude, Vegetation)\n\n### 2. Game Concept wählen\n- **Option A: Farming Simulation** - Pflanzen anbauen, ernten, verkaufen\n- **Option B: Story-RPG** - Ein kleines Dorf mit NPCs und einer Quest\n- **Option C: Tower Defense** - Schütze deine Farm vor Monstern\n\n### 3. Technische Umsetzung mit Cursor\n\n```\nPrompt-Beispiel für Cursor:\n"Erstelle ein 2D-Browsergame mit Phaser.js. \nIch habe Sprite-Assets als PNG-Dateien. \nDer Spieler soll eine Figur steuern können (WASD), \ndie sich auf einer Tilemap bewegt. \nFüge Kollisionserkennung für Hindernisse hinzu."\n```\n\n## Referenz-Videos\n- [RPG mit Google AI Studio](https://youtu.be/EKZ7mrqAHgY)\n- [RPG mit Cursor](https://youtu.be/_d4EqpG_dFk)\n\n## Medienwissenschaftlicher Bezug\n- Geschichte der Videospiele und Pixel-Art-Ästhetik\n- Gamification als Kulturtechnik\n- Indie Game Development als demokratisierte Kulturproduktion\n\n**Schwierigkeit:** ⭐⭐ Mittel\n**Tools:** Cursor AI + Phaser.js\n**Zeitaufwand:** 5-10 Stunden',
        admin_id,
        true,
        4
    ) ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projects (title, slug, description, content, creator_id, allow_participants, max_participants)
    VALUES (
        'AI Dungeon Clone - Text Adventure mit KI',
        'ai-dungeon-clone-text-adventure',
        'Baue ein textbasiertes Adventure, bei dem die KI auf deine Eingaben reagiert und die Geschichte dynamisch weitererzählt.',
        E'## Projektbeschreibung\n\nEin textbasiertes Adventure, bei dem die KI auf deine Eingaben reagiert und die Geschichte dynamisch weitererzählt.\n\n## Technische Komponenten\n- Frontend: Chat-Interface (ähnlich wie ChatGPT)\n- Backend: API-Calls zu einem LLM über OpenRouter\n- System-Prompt: Definiert Genre, Setting und Regeln\n- State Management: Speichern des Spielverlaufs\n\n## Genre-Ideen\n- **Medientheorie-Adventure:** Reise durch die Geschichte der Medien\n- **Cyberpunk-Noir:** Investigativer Journalist in einer dystopischen Zukunft\n- **Campus-Mystery:** Löse ein Rätsel auf dem Uni-Campus\n- **Zeitreise:** Besuche historische Medienmomente (Gutenberg, Lumière, ARPANET)\n\n## Prompt-Beispiel für die KI\n\n```\n"Du bist der Erzähler eines interaktiven Text-Adventures. \nDas Setting ist eine Medienarchäologische Expedition ins Jahr 1895.\nDer Spieler ist ein Medienhistoriker, der die Geburt des Kinos miterlebt.\nReagiere auf Spielereingaben mit atmosphärischen Beschreibungen.\nBiete am Ende jeder Antwort 3-4 mögliche Aktionen an."\n```\n\n## Medienwissenschaftlicher Bezug\n- Interaktive Narrative und Emergent Storytelling\n- Geschichte der Computerspiele (Zork, Colossal Cave Adventure)\n- KI als Ko-Autor\n\n**Schwierigkeit:** ⭐⭐ Mittel\n**Tools:** Cursor/Lovable + OpenRouter API (Key wird bereitgestellt)',
        admin_id,
        true,
        4
    ) ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projects (title, slug, description, content, creator_id, allow_participants, max_participants)
    VALUES (
        'Browser-Minigame-Sammlung',
        'browser-minigame-sammlung',
        'Erstelle eine Sammlung kleiner Browser-Spiele mit EMW-Themen: Memory, Typing Game, Quiz-Roulette und mehr.',
        E'## Projektbeschreibung\n\nEine Sammlung schnell umsetzbarer Browser-Minigames mit EMW-Bezug.\n\n## Spielideen\n\n- **Medien-Memory:** Paare finden (Theoretiker + Theorie, Medium + Erfinder)\n- **Typing Game:** Medienzitate so schnell wie möglich tippen\n- **Quiz-Roulette:** Zufällige Fragen aus der Mediengeschichte\n- **Snake mit Twist:** Sammle "gute Medien", vermeide "Fake News"\n- **Flappy Bird Clone:** Als Pixel-Vogel durch medientheoretische Hürden fliegen\n\n## Technische Umsetzung\n\nMit Tools wie bolt.new oder Lovable kannst du diese Spiele in wenigen Stunden erstellen.\n\n**Schwierigkeit:** ⭐ Einsteiger bis ⭐⭐ Mittel\n**Tools:** bolt.new, Lovable, oder v0.dev\n**Zeitaufwand:** 3-8 Stunden je nach Komplexität',
        admin_id,
        true,
        4
    ) ON CONFLICT (slug) DO NOTHING;

    -- =====================================================
    -- KATEGORIE 3: KI-EXPERIMENTE & CHATBOTS
    -- =====================================================

    INSERT INTO projects (title, slug, description, content, creator_id, allow_participants, max_participants)
    VALUES (
        'KI chattet mit KI - Der autonome Dialog',
        'ki-chattet-mit-ki-autonomer-dialog',
        'Zwei KI-Instanzen führen einen automatischen Dialog - z.B. McLuhan trifft auf Kittler!',
        E'## Projektbeschreibung\n\nZwei KI-Instanzen führen einen automatischen Dialog zu einem vorgegebenen Thema.\n\n## Architektur\n\n```\n┌─────────────┐     Antwort A     ┌─────────────┐\n│   KI #1     │ ───────────────→  │   KI #2     │\n│ (Perspektive│                   │ (Perspektive│\n│    "Pro")   │ ←───────────────  │   "Contra") │\n└─────────────┘     Antwort B     └─────────────┘\n```\n\n## Szenario-Ideen\n\n- **Medienethik-Debatte:** Pro vs. Contra Social Media\n- **Historischer Dialog:** McLuhan trifft auf Kittler\n- **Zukunftsvision:** Optimist vs. Pessimist über KI\n- **Kunstkritik:** Zwei KIs bewerten generierte Bilder\n- **Philosophie-Salon:** Platons Sokrates-Dialoge, aber mit KI\n\n## Features\n\n- Einstellbare Geschwindigkeit des Dialogs\n- Export der Konversation als PDF\n- Verschiedene "Persönlichkeiten" durch System-Prompts\n- Sentiment-Analyse der Dialoge\n\n## Medienwissenschaftlicher Bezug\n- Turing-Test und künstliche Intelligenz\n- Dialogphilosophie und maschinelle Kommunikation\n- Emergente Eigenschaften in KI-Systemen\n\n**Schwierigkeit:** ⭐⭐ Mittel\n**Tools:** Cursor + OpenRouter API (Key bereitgestellt)',
        admin_id,
        true,
        4
    ) ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projects (title, slug, description, content, creator_id, allow_participants, max_participants)
    VALUES (
        'Persönlicher Studienassistent-Chatbot',
        'studienassistent-chatbot-emw',
        'Ein spezialisierter Chatbot, der Fragen zum EMW-Studium beantwortet und Literatur empfiehlt.',
        E'## Projektbeschreibung\n\nEin spezialisierter Chatbot, der Fragen zum EMW-Studium beantwortet.\n\n## Training/Kontext\n\n- Seminarplan als Kontext\n- Wichtige Texte und Zusammenfassungen\n- FAQ zum Studiengang\n- Termine und Deadlines\n\n## Features\n\n- Fragen zur Medientheorie beantworten\n- Literaturempfehlungen geben\n- Terminübersicht für das Semester\n- Prüfungsvorbereitungs-Tipps\n\n**Schwierigkeit:** ⭐⭐ Mittel\n**Tools:** Lovable oder bolt.new + OpenRouter API',
        admin_id,
        true,
        3
    ) ON CONFLICT (slug) DO NOTHING;

    -- =====================================================
    -- KATEGORIE 4: DATEN & VISUALISIERUNG
    -- =====================================================

    INSERT INTO projects (title, slug, description, content, creator_id, allow_participants, max_participants)
    VALUES (
        'Klimadaten-Dashboard',
        'klimadaten-dashboard-visualisierung',
        'Visualisiere Klimadaten mit interaktiven Charts - von der Temperaturentwicklung bis zur CO2-Konzentration.',
        E'## Projektbeschreibung\n\nEin interaktives Dashboard zur Visualisierung von Klimadaten.\n\n## Datenquellen (kostenlos)\n\n- [OpenWeatherMap API](https://openweathermap.org/api)\n- [NASA Climate Data](https://climate.nasa.gov/vital-signs/)\n- [Deutscher Wetterdienst Open Data](https://opendata.dwd.de/)\n\n## Visualisierungs-Ideen\n\n- Temperaturentwicklung der letzten 100 Jahre\n- CO2-Konzentration im Zeitverlauf\n- Vergleich verschiedener Städte/Regionen\n- Interaktive Weltkarte mit Klimazonen\n\n## Technische Komponenten\n\n- API-Anbindung für Live-Daten\n- Chart-Bibliothek (Chart.js, Recharts)\n- Responsive Design für mobile Geräte\n- Filteroptionen (Zeitraum, Region)\n\n## Medienwissenschaftlicher Bezug\n\n- Datenvisualisierung als Medienpraktik\n- Infografiken und ihre Überzeugungskraft\n- Medialisierung von Wissenschaft\n\n**Schwierigkeit:** ⭐⭐ Mittel\n**Tools:** Cursor + React/Next.js oder bolt.new',
        admin_id,
        true,
        4
    ) ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projects (title, slug, description, content, creator_id, allow_participants, max_participants)
    VALUES (
        'FSR EMW Protokoll-Analyse',
        'fsr-emw-protokoll-analyse',
        'Analysiere alle FSR-Protokolle mit Textmining: Themen-Tracking, Sentiment-Analyse, Word Clouds und mehr.',
        E'## Projektbeschreibung\n\nAnalysiere die FSR EMW Protokolle mit digitalen Methoden.\n\n## Daten\n\nFSR-Protokolle als Markdown-Dateien (werden bereitgestellt)\n\n## Analyse-Möglichkeiten\n\n- **Themen-Tracking:** Welche Themen wurden wie oft besprochen?\n- **Sentiment-Analyse:** Wie ist die Stimmung in den Protokollen?\n- **Wortfrequenz:** Welche Begriffe tauchen am häufigsten auf?\n- **Timeline:** Entwicklung bestimmter Themen über die Zeit\n- **Netzwerk-Analyse:** Wer arbeitet mit wem zusammen?\n\n## Output-Formate\n\n- Interaktives Web-Dashboard\n- Word Clouds\n- Zeitachsen-Visualisierung\n- Statistik-Reports\n\n## Medienwissenschaftlicher Bezug\n\n- Textmining und digitale Methoden\n- Diskursanalyse mit digitalen Tools\n- Wissenschaftliche Selbstreflexion\n\n**Schwierigkeit:** ⭐⭐⭐ Fortgeschritten\n**Tools:** Cursor + Python oder JavaScript',
        admin_id,
        true,
        3
    ) ON CONFLICT (slug) DO NOTHING;

    -- =====================================================
    -- KATEGORIE 5: QUIZ & LERNPLATTFORMEN
    -- =====================================================

    INSERT INTO projects (title, slug, description, content, creator_id, allow_participants, max_participants)
    VALUES (
        'Das EMW Quiz!',
        'das-emw-quiz-lernspiel',
        'Ein interaktives Quiz zu Mediengeschichte, Medientheorie und EMW-Wissen - mit verschiedenen Spielmodi.',
        E'## Projektbeschreibung\n\nEin interaktives Quiz rund um die Europäische Medienwissenschaft.\n\n## Spielmodi\n\n- **Klassisches Quiz:** Multiple Choice mit Timer\n- **Wer wird Millionär?** Mit Joker-System\n- **Duell-Modus:** Zwei Spieler gegeneinander\n- **Endless Mode:** Bis zum ersten Fehler\n\n## Kategorien\n\n- Mediengeschichte (Von der Schrift zum Internet)\n- Medientheorie (McLuhan, Kittler, Flusser, Chun...)\n- EMW-Spezifisch (Professorinnen, Seminare, Campus)\n- Aktuelle Medienentwicklungen\n- Film & Fernsehen\n- Games & digitale Kultur\n\n## Features\n\n- Highscore-Tabelle\n- Verschiedene Schwierigkeitsgrade\n- Erklärungen nach jeder Frage\n- Social Share ("Ich habe 8/10 im EMW-Quiz!")\n\n**Schwierigkeit:** ⭐ Einsteiger\n**Tools:** Lovable, bolt.new, oder v0.dev',
        admin_id,
        true,
        4
    ) ON CONFLICT (slug) DO NOTHING;

    -- =====================================================
    -- KATEGORIE 6: MOBILE APPS
    -- =====================================================

    INSERT INTO projects (title, slug, description, content, creator_id, allow_participants, max_participants)
    VALUES (
        'Mobile App mit VibeCode App',
        'mobile-app-vibecode-app',
        'Erstelle eine echte mobile App direkt auf deinem Smartphone mit der VibeCode App - und veröffentliche sie!',
        E'## Projektbeschreibung\n\nMit der VibeCode App kannst du direkt auf dem Smartphone eigene Apps per Sprachbefehlen oder Text erstellen.\n\n## Was ist die VibeCode App?\n\nEine mobile App (iOS/Android), mit der man direkt auf dem Smartphone eigene Apps per Sprachbefehlen oder Text erstellen kann. Die erstellten Apps können dann tatsächlich veröffentlicht werden.\n\n## Projektideen für Mobile\n\n- **EMW Stundenplan App:** Alle Kurse und Räume im Überblick\n- **Medientagebuch:** Täglich dokumentieren, welche Medien man konsumiert\n- **Campus Navigator:** Wegbeschreibungen auf dem Uni-Gelände\n- **Seminar-Feedback App:** Anonymes Feedback nach jeder Sitzung\n- **Lesezeit-Tracker:** Wie viel Zeit verbringst du mit welchen Texten?\n\n## Dokumentation\n\nhttps://www.vibecodeapp.com/docs\n\n**Schwierigkeit:** ⭐⭐ Mittel\n**Tool:** [VibeCode App](https://www.vibecodeapp.com/)',
        admin_id,
        true,
        4
    ) ON CONFLICT (slug) DO NOTHING;

    -- =====================================================
    -- KATEGORIE 7: KREATIVE & EXPERIMENTELLE PROJEKTE
    -- =====================================================

    INSERT INTO projects (title, slug, description, content, creator_id, allow_participants, max_participants)
    VALUES (
        'Interaktive Medientheorie-Timeline',
        'interaktive-medientheorie-timeline',
        'Eine visuelle, zoombare Timeline der Mediengeschichte - von der Höhlenmalerei bis TikTok.',
        E'## Projektbeschreibung\n\nEine visuelle, interaktive Timeline der Mediengeschichte.\n\n## Features\n\n- Zoombare Zeitachse (von Höhlenmalerei bis TikTok)\n- Klickbare Events mit Detailinformationen\n- Filteroptionen (nach Medium, Region, Theoretiker)\n- Verknüpfungen zwischen Ereignissen\n- Eingebettete Bilder, Videos, Audio-Samples\n\n## Zeitperioden\n\n- Vor-Geschichte (Höhlenmalerei, Sprache)\n- Schriftkultur (Alphabete, Druck)\n- Elektronische Medien (Telegraph, Radio, TV)\n- Digitale Revolution (Computer, Internet)\n- Social Media & KI\n\n**Schwierigkeit:** ⭐⭐ Mittel\n**Tools:** Cursor oder Lovable',
        admin_id,
        true,
        4
    ) ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projects (title, slug, description, content, creator_id, allow_participants, max_participants)
    VALUES (
        'Fake News Detektor (Educational)',
        'fake-news-detektor-educational',
        'Ein Tool, das Texte auf typische Fake-News-Merkmale analysiert und Medienkompetenz fördert.',
        E'## Projektbeschreibung\n\nEin Tool, das Texte auf typische Fake-News-Merkmale analysiert.\n\n## Analyse-Kriterien\n\n- Sprachliche Auffälligkeiten (Clickbait, emotionale Sprache)\n- Quellenangaben vorhanden?\n- Datum und Autor erkennbar?\n- Faktenchecks verfügbar?\n\n## Output\n\n- Vertrauenswürdigkeits-Score\n- Detaillierte Analyse-Erklärung\n- Tipps zur weiteren Recherche\n- Links zu Faktencheckern\n\n## Medienwissenschaftlicher Bezug\n\n- Medienkompetenz und kritisches Denken\n- Algorithmen und Filterblasen\n- Verantwortung in der Medienproduktion\n\n**Schwierigkeit:** ⭐⭐⭐ Fortgeschritten\n**Tools:** Cursor + OpenRouter API',
        admin_id,
        true,
        3
    ) ON CONFLICT (slug) DO NOTHING;


    INSERT INTO projects (title, slug, description, content, creator_id, allow_participants, max_participants)
    VALUES (
        'Podcast-Transkriptions-Tool',
        'podcast-transkriptions-tool',
        'Transkribiere Podcasts automatisch, erkenne Sprecher und erstelle durchsuchbare Archive.',
        E'## Projektbeschreibung\n\nEin Tool zur automatischen Transkription und Analyse von Podcasts.\n\n## Features\n\n- Upload von Audio-Dateien\n- Automatische Transkription\n- Speaker Diarization (Wer spricht wann?)\n- Zusammenfassung des Inhalts\n- Suche im Transkript\n- Export als Text/PDF\n\n## Technische Umsetzung\n\nNutze die Whisper API (OpenAI) oder kostenlose Alternativen für die Transkription.\n\n**Schwierigkeit:** ⭐⭐⭐ Fortgeschritten\n**Tools:** Cursor + Whisper API (OpenAI) oder kostenlose Alternativen',
        admin_id,
        true,
        3
    ) ON CONFLICT (slug) DO NOTHING;

    -- =====================================================
    -- KATEGORIE 8: KOLLABORATIVE PROJEKTE
    -- =====================================================

    INSERT INTO projects (title, slug, description, content, creator_id, allow_participants, max_participants)
    VALUES (
        'EMW Lexikon / Wiki',
        'emw-lexikon-wiki-kollaborativ',
        'Ein kollaboratives Nachschlagewerk für EMW-Begriffe, Theoretiker und Konzepte.',
        E'## Projektbeschreibung\n\nEin kollaboratives Nachschlagewerk für EMW-Begriffe.\n\n## Features\n\n- Artikel zu Medientheoretikern, Konzepten, Medien\n- Verknüpfungen zwischen Einträgen\n- Suchfunktion\n- Bearbeitungshistorie\n- Export-Funktion für Seminararbeiten\n\n## Kategorien\n\n- Medientheoretiker*innen (Biografie, Hauptwerke, Konzepte)\n- Medienkonzepte (Definition, Geschichte, Kritik)\n- Mediengeschichte (Ereignisse, Erfindungen)\n- EMW-spezifisch (Seminare, Projekte, Traditionen)\n\n**Schwierigkeit:** ⭐⭐ Mittel\n**Tools:** Cursor + Next.js oder Supabase',
        admin_id,
        true,
        5
    ) ON CONFLICT (slug) DO NOTHING;

    INSERT INTO projects (title, slug, description, content, creator_id, allow_participants, max_participants)
    VALUES (
        'Gemeinsames Lesetagebuch',
        'gemeinsames-lesetagebuch-emw',
        'Eine Plattform zum Teilen von Buchnotizen, Zitaten und Leseempfehlungen im Studium.',
        E'## Projektbeschreibung\n\nEine kollaborative Plattform für Lesenotizen und Buchempfehlungen.\n\n## Features\n\n- Buchnotizen und Zitate speichern\n- Bewertungen und Empfehlungen\n- Diskussionsforum zu einzelnen Texten\n- Leselisten erstellen und teilen\n- Tagging-System für Themen\n\n## Nutzungsszenarien\n\n- Seminar-Lektüren gemeinsam annotieren\n- Prüfungsvorbereitungs-Gruppen\n- Buchclubs für Medientheorie\n- Persönliche Wissensdatenbank\n\n**Schwierigkeit:** ⭐⭐ Mittel\n**Tools:** Lovable oder bolt.new + Supabase',
        admin_id,
        true,
        5
    ) ON CONFLICT (slug) DO NOTHING;

    RAISE NOTICE 'Erfolgreich % Projektideen eingefügt!', 17;
END $$;

-- Optional: Überprüfe die eingefügten Projekte
-- SELECT title, slug, allow_participants, max_participants FROM projects ORDER BY created_at DESC;

