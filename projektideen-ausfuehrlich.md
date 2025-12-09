# Vibe Coding Projektideen für EMW-Studierende
## Wintersemester 2025/2026

---

## 🎯 Projektübersicht nach Schwierigkeitsgrad

| Schwierigkeit | Zeitaufwand | Empfohlene Tools |
|--------------|-------------|------------------|
| ⭐ Einsteiger | 3-5 Stunden | Lovable, v0.dev, bolt.new |
| ⭐⭐ Mittel | 5-10 Stunden | Cursor, Firebase Studio |
| ⭐⭐⭐ Fortgeschritten | 10-20 Stunden | Cursor + MCP, Mehrere Tools kombiniert |

---

## 1. Webseiten & Portfolio-Projekte

### 1.1 Open Source Webseite mit DeepSite
**Schwierigkeit:** ⭐ Einsteiger  
**Tool:** [DeepSite auf Hugging Face](https://huggingface.co/spaces/enzostvs/deepsite)  
**Beschreibung:** DeepSite ist ein komplett Open-Source Website-Builder auf Hugging Face, der DeepSeek-V3 nutzt. Du beschreibst einfach, welche Website du möchtest, und die KI generiert vollständig funktionsfähigen HTML/CSS/JS-Code.

**Konkrete Umsetzung:**
- Erstelle eine Landing Page für ein fiktives EMW-Forschungsprojekt
- Baue eine Infoseite über ein medientheoretisches Konzept (z.B. "Black Box" nach Pasquale)
- Erstelle eine Fan-Page für einen Medientheoretiker oder eine Medientheoretikerin

**Medienwissenschaftlicher Bezug:** Reflexion über Open Source vs. proprietäre KI-Systeme, Transparenz in der Softwareentwicklung

**Ressourcen:**
- https://huggingface.co/spaces/enzostvs/deepsite
- Komplett kostenlos und Open Source
- Kein Account nötig

---

### 1.2 Persönlicher Lebenslauf als interaktive Webseite
**Schwierigkeit:** ⭐ Einsteiger  
**Tools:** Lovable, v0.dev, oder Google AI Studio (ehemals Project IDX)

**Variante A: Mit Lovable**
- Lovable eignet sich besonders für visuell ansprechende, moderne Designs
- Prompt-Beispiel: *"Erstelle eine moderne Portfolio-Webseite für eine Medienwissenschafts-Studentin. Die Seite soll Abschnitte für Über Mich, Projekte, Publikationen und Kontakt haben. Nutze ein minimalistisches Design mit sanften Farbverläufen."*

**Variante B: Mit v0.dev (Vercel)**
- v0 generiert React/Next.js-Komponenten
- Besonders gut für moderne UI-Komponenten
- Prompt-Beispiel: *"Create a creative portfolio website for a media studies student with an animated hero section, project cards with hover effects, and a timeline showing academic career."*

**Erweiterungsideen:**
- Integration eines Blog-Bereichs für Seminarreflexionen
- Dark/Light Mode Toggle
- Animierte Skill-Bars für Software-Kenntnisse
- Interaktive Timeline des Studiums

---

## 2. Games & Interaktive Erlebnisse

### 2.1 Retro RPG mit dem Farm Asset Pack
**Schwierigkeit:** ⭐⭐ Mittel  
**Tools:** Cursor AI + Phaser.js oder vanilla JavaScript  
**Assets:** Farm RPG - Tiny Asset Pack (bereitgestellt)

**Schritt-für-Schritt-Anleitung:**

1. **Assets vorbereiten:**
   - Das RAR-Archiv entpacken
   - Tilemap Editor nutzen: [SpriteFusion](https://www.spritefusion.com/)
   - Erstelle eine Karte mit Tiles (Boden, Wege, Gebäude, Vegetation)

2. **Game Concept wählen:**
   - **Option A: Farming Simulation** - Pflanzen anbauen, ernten, verkaufen
   - **Option B: Story-RPG** - Ein kleines Dorf mit NPCs und einer Quest
   - **Option C: Tower Defense** - Schütze deine Farm vor Monstern

3. **Technische Umsetzung mit Cursor:**
   ```
   Prompt-Beispiel für Cursor:
   "Erstelle ein 2D-Browsergame mit Phaser.js. 
   Ich habe Sprite-Assets als PNG-Dateien. 
   Der Spieler soll eine Figur steuern können (WASD), 
   die sich auf einer Tilemap bewegt. 
   Füge Kollisionserkennung für Hindernisse hinzu."
   ```

**Referenz-Videos:**
- [RPG mit Google AI Studio](https://youtu.be/EKZ7mrqAHgY)
- [RPG mit Cursor](https://youtu.be/_d4EqpG_dFk)

**Medienwissenschaftlicher Bezug:** 
- Geschichte der Videospiele und Pixel-Art-Ästhetik
- Gamification als Kulturtechnik
- Indie Game Development als demokratisierte Kulturproduktion

---

### 2.2 AI Dungeon Clone - Text Adventure mit KI
**Schwierigkeit:** ⭐⭐ Mittel  
**Tools:** Cursor/Lovable + OpenRouter API (Key wird bereitgestellt)

**Konzept:** Ein textbasiertes Adventure, bei dem die KI auf deine Eingaben reagiert und die Geschichte dynamisch weitererzählt.

**Technische Komponenten:**
- Frontend: Chat-Interface (ähnlich wie ChatGPT)
- Backend: API-Calls zu einem LLM über OpenRouter
- System-Prompt: Definiert Genre, Setting und Regeln
- State Management: Speichern des Spielverlaufs

**Genre-Ideen:**
- **Medientheorie-Adventure:** Reise durch die Geschichte der Medien
- **Cyberpunk-Noir:** Investigativer Journalist in einer dystopischen Zukunft
- **Campus-Mystery:** Löse ein Rätsel auf dem Uni-Campus
- **Zeitreise:** Besuche historische Medienmomente (Gutenberg, Lumière, ARPANET)

**Prompt-Beispiel für die KI:**
```
"Du bist der Erzähler eines interaktiven Text-Adventures. 
Das Setting ist eine Medienarchäologische Expedition ins Jahr 1895.
Der Spieler ist ein Medienhistoriker, der die Geburt des Kinos miterlebt.
Reagiere auf Spielereingaben mit atmosphärischen Beschreibungen.
Biete am Ende jeder Antwort 3-4 mögliche Aktionen an."
```

**Medienwissenschaftlicher Bezug:**
- Interaktive Narrative und Emergent Storytelling
- Geschichte der Computerspiele (Zork, Colossal Cave Adventure)
- KI als Ko-Autor

---

### 2.3 Browser-Minigame-Sammlung
**Schwierigkeit:** ⭐ Einsteiger bis ⭐⭐ Mittel  
**Tools:** bolt.new, Lovable, oder v0.dev

**Spielideen für schnelle Umsetzung:**
- **Medien-Memory:** Paare finden (Theoretiker + Theorie, Medium + Erfinder)
- **Typing Game:** Medienzitate so schnell wie möglich tippen
- **Quiz-Roulette:** Zufällige Fragen aus der Mediengeschichte
- **Snake mit Twist:** Sammle "gute Medien", vermeide "Fake News"
- **Flappy Bird Clone:** Als Pixel-Vogel durch medientheoretische Hürden fliegen

---

## 3. KI-Experimente & Chatbots

### 3.1 KI chattet mit KI - Der autonome Dialog
**Schwierigkeit:** ⭐⭐ Mittel  
**Tools:** Cursor + OpenRouter API (Key bereitgestellt)

**Konzept:** Zwei KI-Instanzen führen einen automatischen Dialog zu einem vorgegebenen Thema.

**Technische Umsetzung:**
```
Architektur:
┌─────────────┐     Antwort A     ┌─────────────┐
│   KI #1     │ ───────────────→  │   KI #2     │
│ (Perspektive│                   │ (Perspektive│
│    "Pro")   │ ←───────────────  │   "Contra") │
└─────────────┘     Antwort B     └─────────────┘
```

**Szenario-Ideen:**
- **Medienethik-Debatte:** Pro vs. Contra Social Media
- **Historischer Dialog:** McLuhan trifft auf Kittler
- **Zukunftsvision:** Optimist vs. Pessimist über KI
- **Kunstkritik:** Zwei KIs bewerten generierte Bilder
- **Philosophie-Salon:** Platons Sokrates-Dialoge, aber mit KI

**Features:**
- Einstellbare Geschwindigkeit des Dialogs
- Export der Konversation als PDF
- Verschiedene "Persönlichkeiten" durch System-Prompts
- Sentiment-Analyse der Dialoge

**Medienwissenschaftlicher Bezug:**
- Turing-Test und künstliche Intelligenz
- Dialogphilosophie und maschinelle Kommunikation
- Emergente Eigenschaften in KI-Systemen

---

### 3.2 Persönlicher Studienassistent-Chatbot
**Schwierigkeit:** ⭐⭐ Mittel  
**Tools:** Lovable oder bolt.new + OpenRouter API

**Konzept:** Ein spezialisierter Chatbot, der Fragen zum EMW-Studium beantwortet.

**Training/Kontext:**
- Seminarplan als Kontext
- Wichtige Texte und Zusammenfassungen
- FAQ zum Studiengang
- Termine und Deadlines

**Features:**
- Fragen zur Medientheorie beantworten
- Literaturempfehlungen geben
- Terminübersicht für das Semester
- Prüfungsvorbereitungs-Tipps

---

## 4. Daten & Visualisierung

### 4.1 Klimadaten-Dashboard
**Schwierigkeit:** ⭐⭐ Mittel  
**Tools:** Cursor + React/Next.js oder bolt.new

**Datenquellen (kostenlos):**
- [OpenWeatherMap API](https://openweathermap.org/api)
- [NASA Climate Data](https://climate.nasa.gov/vital-signs/)
- [Deutscher Wetterdienst Open Data](https://opendata.dwd.de/)

**Visualisierungs-Ideen:**
- Temperaturentwicklung der letzten 100 Jahre
- CO2-Konzentration im Zeitverlauf
- Vergleich verschiedener Städte/Regionen
- Interaktive Weltkarte mit Klimazonen

**Technische Komponenten:**
- API-Anbindung für Live-Daten
- Chart-Bibliothek (Chart.js, Recharts)
- Responsive Design für mobile Geräte
- Filteroptionen (Zeitraum, Region)

**Medienwissenschaftlicher Bezug:**
- Datenvisualisierung als Medienpraktik
- Infografiken und ihre Überzeugungskraft
- Medialisierung von Wissenschaft

---

### 4.2 FSR EMW Protokoll-Analyse
**Schwierigkeit:** ⭐⭐⭐ Fortgeschritten  
**Tools:** Cursor + Python oder JavaScript
**Daten:** FSR-Protokolle als Markdown-Dateien (bereitgestellt)

**Analyse-Möglichkeiten:**
- **Themen-Tracking:** Welche Themen wurden wie oft besprochen?
- **Sentiment-Analyse:** Wie ist die Stimmung in den Protokollen?
- **Wortfrequenz:** Welche Begriffe tauchen am häufigsten auf?
- **Timeline:** Entwicklung bestimmter Themen über die Zeit
- **Netzwerk-Analyse:** Wer arbeitet mit wem zusammen?

**Output-Formate:**
- Interaktives Web-Dashboard
- Word Clouds
- Zeitachsen-Visualisierung
- Statistik-Reports

**Medienwissenschaftlicher Bezug:**
- Textmining und digitale Methoden
- Diskursanalyse mit digitalen Tools
- Wissenschaftliche Selbstreflexion

---

## 5. Quiz & Lernplattformen

### 5.1 Das EMW Quiz!
**Schwierigkeit:** ⭐ Einsteiger  
**Tools:** Lovable, bolt.new, oder v0.dev

**Spielmodi:**
- **Klassisches Quiz:** Multiple Choice mit Timer
- **Wer wird Millionär?** Mit Joker-System
- **Duell-Modus:** Zwei Spieler gegeneinander
- **Endless Mode:** Bis zum ersten Fehler

**Kategorien:**
- Mediengeschichte (Von der Schrift zum Internet)
- Medientheorie (McLuhan, Kittler, Flusser, Chun...)
- EMW-Spezifisch (Professorinnen, Seminare, Campus)
- Aktuelle Medienentwicklungen
- Film & Fernsehen
- Games & digitale Kultur

**Features:**
- Highscore-Tabelle
- Verschiedene Schwierigkeitsgrade
- Erklärungen nach jeder Frage
- Social Share ("Ich habe 8/10 im EMW-Quiz!")


---

## 6. Mobile Apps

### 6.1 Eigene App mit VibeCode App
**Schwierigkeit:** ⭐⭐ Mittel  
**Tool:** [VibeCode App](https://www.vibecodeapp.com/)

**Was ist die VibeCode App?**
Eine mobile App (iOS/Android), mit der man direkt auf dem Smartphone eigene Apps per Sprachbefehlen oder Text erstellen kann. Die erstellten Apps können dann tatsächlich veröffentlicht werden.

**Projektideen für Mobile:**
- **EMW Stundenplan App:** Alle Kurse und Räume im Überblick
- **Medientagebuch:** Täglich dokumentieren, welche Medien man konsumiert
- **Campus Navigator:** Wegbeschreibungen auf dem Uni-Gelände
- **Seminar-Feedback App:** Anonymes Feedback nach jeder Sitzung
- **Lesezeit-Tracker:** Wie viel Zeit verbringst du mit welchen Texten?

**Dokumentation:** https://www.vibecodeapp.com/docs

---

## 7. Kreative & Experimentelle Projekte

### 7.1 Interaktive Medientheorie-Timeline
**Schwierigkeit:** ⭐⭐ Mittel  
**Tools:** Cursor oder Lovable

**Konzept:** Eine visuelle, interaktive Timeline der Mediengeschichte.

**Features:**
- Zoombare Zeitachse (von Höhlenmalerei bis TikTok)
- Klickbare Events mit Detailinformationen
- Filteroptionen (nach Medium, Region, Theoretiker)
- Verknüpfungen zwischen Ereignissen
- Eingebettete Bilder, Videos, Audio-Samples

**Zeitperioden:**
- Vor-Geschichte (Höhlenmalerei, Sprache)
- Schriftkultur (Alphabete, Druck)
- Elektronische Medien (Telegraph, Radio, TV)
- Digitale Revolution (Computer, Internet)
- Social Media & KI

---

### 7.2 Fake News Detektor (Educational)
**Schwierigkeit:** ⭐⭐⭐ Fortgeschritten  
**Tools:** Cursor + OpenRouter API

**Konzept:** Ein Tool, das Texte auf typische Fake-News-Merkmale analysiert.

**Analyse-Kriterien:**
- Sprachliche Auffälligkeiten (Clickbait, emotionale Sprache)
- Quellenangaben vorhanden?
- Datum und Autor erkennbar?
- Faktenchecks verfügbar?

**Output:**
- Vertrauenswürdigkeits-Score
- Detaillierte Analyse-Erklärung
- Tipps zur weiteren Recherche
- Links zu Faktencheckern

**Medienwissenschaftlicher Bezug:**
- Medienkompetenz und kritisches Denken
- Algorithmen und Filterblasen
- Verantwortung in der Medienproduktion

---

### 7.3 Generative Art Gallery
**Schwierigkeit:** ⭐⭐ Mittel  
**Tools:** bolt.new oder Lovable + Bildgenerierungs-API

**Konzept:** Eine Online-Galerie mit KI-generierten Kunstwerken zu medientheoretischen Themen.

**Themen für Bildgenerierung:**
- "Die Zukunft der Medien" nach verschiedenen Denkern
- Visualisierung abstrakter Konzepte (Remediation, Hypertext, etc.)
- "Was wäre wenn?" - Alternative Mediengeschichten
- Portraits berühmter Medientheoretiker im Stil verschiedener Kunstepochen

---

### 7.4 Podcast-Transkriptions-Tool
**Schwierigkeit:** ⭐⭐⭐ Fortgeschritten  
**Tools:** Cursor + Whisper API (OpenAI) oder kostenlose Alternativen

**Features:**
- Upload von Audio-Dateien
- Automatische Transkription
- Speaker Diarization (Wer spricht wann?)
- Zusammenfassung des Inhalts
- Suche im Transkript
- Export als Text/PDF

---

## 8. Kollaborative Projekte

### 8.1 EMW Lexikon / Wiki
**Schwierigkeit:** ⭐⭐ Mittel  
**Tools:** Cursor + Next.js oder Supabase

**Konzept:** Ein kollaboratives Nachschlagewerk für EMW-Begriffe.

**Features:**
- Artikel zu Medientheoretikern, Konzepten, Medien
- Verknüpfungen zwischen Einträgen
- Suchfunktion
- Bearbeitungshistorie
- Export-Funktion für Seminararbeiten

---

### 8.2 Gemeinsames Lesetagebuch
**Schwierigkeit:** ⭐⭐ Mittel  
**Tools:** Lovable oder bolt.new + Supabase

**Features:**
- Buchnotizen und Zitate speichern
- Bewertungen und Empfehlungen
- Diskussionsforum zu einzelnen Texten
- Leselisten erstellen und teilen

---

## 📋 Projekt-Checkliste für Abgabe

Jedes Projekt sollte folgende Elemente enthalten:

- [ ] **Funktionierender Prototyp** (online zugänglich)
- [ ] **Dokumentation** der verwendeten Tools und Prompts
- [ ] **Reflexion** über den Entwicklungsprozess (max. 2 Seiten)
- [ ] **Screenshots/Video** der Anwendung
- [ ] **Kritische Einordnung** (Was hat gut funktioniert? Was nicht?)

---

## 🛠️ Tool-Empfehlungen nach Projekttyp

| Projekttyp | Primäres Tool | Alternative |
|-----------|--------------|-------------|
| Statische Website | DeepSite, v0.dev | bolt.new |
| Interaktive Web-App | Lovable | Cursor + React |
| Game | Cursor + Phaser.js | bolt.new |
| Mobile App | VibeCode App | Rork |
| Datenvisualisierung | Cursor | Firebase Studio |
| Chatbot/KI | Cursor + API | bolt.new |
| Backend-lastig | Cursor | Firebase Studio |

---

## 📚 Weiterführende Ressourcen

- **Awesome Vibe Coding:** https://github.com/filipecalegario/awesome-vibe-coding
- **Phaser.js (Game Dev):** https://phaser.io/
- **SpriteFusion (Tilemap Editor):** https://www.spritefusion.com/
- **OpenRouter (KI-APIs):** https://openrouter.ai/
- **Supabase (Backend/Database):** https://supabase.com/
- **Vercel (Hosting):** https://vercel.com/

---

*Letzte Aktualisierung: Dezember 2025*

