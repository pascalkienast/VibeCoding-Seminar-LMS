-- Seed data for presentation_tools
-- Run this after tools-presentation-setup.sql
-- These are AI-powered coding and development tools students can present

insert into public.presentation_tools (title, slug, description, content, presentation_date, max_presenters, external_links)
values 
(
  'Cursor',
  'cursor',
  'Der IDE-basierte AI-Coding-Assistant – Leistungsstark & Kollaborativ',
  '# Cursor – AI-Powered IDE

Cursor ist ein KI-gestützter Code-Editor, der auf VS Code basiert und speziell für AI-Assisted Coding optimiert wurde. Entwickelt für professionelle Entwickler, die die Produktivität durch KI-Integration maximieren wollen.

## 🌟 Hauptfeatures

### Tab-Vervollständigung
- **Intelligente Code-Completion**: KI schlägt Code-Snippets in Echtzeit vor
- **Multi-Line Suggestions**: Ganze Funktionen und Blöcke werden vorgeschlagen
- **Kontextbewusstsein**: Versteht deine Codebase durch Embeddings

### Agent-Modus
- **Autonome Code-Änderungen**: Agent kann selbstständig Files bearbeiten
- **Deep Codebase Understanding**: Nutzt Embedding-Modelle für tiefes Verständnis
- **BugBot**: Automatische Analyse und Behebung von Code-Fehlern

### Cmd+K Edit Mode
- **Inline-Editing**: Markiere Code und gib Anweisungen in natürlicher Sprache
- **Refactoring**: Automatisches Umschreiben und Optimieren von Code
- **Multi-File Changes**: Änderungen über mehrere Dateien hinweg

## 🎯 Use Cases

- Full-Stack Development mit Next.js, React, Node.js
- Refactoring großer Codebasen
- Code-Reviews mit AI-Unterstützung
- Pair Programming mit KI als Co-Pilot

## 📊 Pricing

- **Hobby**: Kostenlos mit 2.000 Completions/Monat
- **Pro**: $20/Monat – Unlimited completions
- **Business**: Team-Features mit zentraler Verwaltung

## 🔗 Mehr erfahren

[Cursor Website](https://cursor.com)  
[Cursor Features](https://cursor.com/features)  
[DataCamp Tutorial](https://www.datacamp.com/tutorial/cursor-ai-code-editor)',
  '2025-01-27 14:00:00+01',
  3,
  '[
    {"label": "Cursor Website", "url": "https://cursor.com"},
    {"label": "Features Demo", "url": "https://cursor.com/features"},
    {"label": "Tutorial", "url": "https://www.datacamp.com/tutorial/cursor-ai-code-editor"}
  ]'::jsonb
),
(
  'GitHub Copilot & Codespaces',
  'github-copilot-codespaces',
  'Microsofts KI-Tool – Integration in VS Code & Cloud-Entwicklungsumgebungen',
  '# GitHub Copilot & Codespaces

GitHub Copilot ist Microsofts KI-Pair-Programmer, der direkt in deinem Editor arbeitet. In Kombination mit GitHub Codespaces erhältst du eine vollständige Cloud-Entwicklungsumgebung.

## 🤖 GitHub Copilot

### Was ist Copilot?
Ein AI-Coding-Assistant, der auf OpenAI Codex basiert und direkt in VS Code, JetBrains, Neovim und mehr integriert ist.

### Features
- **Code-Suggestions**: Intelligente Vorschläge während du tippst
- **Comment-to-Code**: Schreibe Kommentare, Copilot generiert Code
- **Test Generation**: Automatische Erstellung von Unit-Tests
- **Documentation**: Auto-generierte Code-Dokumentation
- **Chat Interface**: Frage Copilot direkt nach Hilfe

### Agent Mode (NEU)
- **Agentic AI**: Copilot kann jetzt selbstständig komplexe Aufgaben lösen
- **Multi-Step Reasoning**: Plant und führt mehrschrittige Änderungen aus
- **Available in Codespaces**: Direkt in der Cloud nutzbar

## ☁️ GitHub Codespaces

### Cloud Development Environment
Eine vollständige Dev-Umgebung im Browser oder in VS Code.

### Vorteile
- **Instant Setup**: Keine lokale Installation nötig
- **Standardisierte Umgebungen**: `devcontainer.json` für Team-Konsistenz
- **Zugriff von überall**: Web-Browser oder Desktop-App
- **Powerful Resources**: Wählbare CPU/RAM-Konfigurationen

### Copilot + Codespaces = 🚀
- Copilot direkt in Codespaces integriert
- Perfekt für Remote-Teams
- Onboarding neuer Entwickler in Minuten

## 🎓 Für Studenten

**GitHub Education Pack**:
- GitHub Copilot **kostenlos** für verifizierte Studenten
- Codespaces mit kostenlosen Stunden pro Monat
- Zugriff auf Premium-Features

## 💰 Pricing

- **Individual**: $10/Monat (oder kostenlos für Studenten)
- **Business**: $19/Monat pro User
- **Enterprise**: Custom Pricing

## 🔗 Ressourcen

[GitHub Copilot](https://github.com/features/copilot)  
[Codespaces](https://github.com/features/codespaces)  
[Student Pack](https://education.github.com/pack)',
  '2025-01-27 14:00:00+01',
  3,
  '[
    {"label": "GitHub Copilot", "url": "https://github.com/features/copilot"},
    {"label": "Codespaces", "url": "https://github.com/features/codespaces"},
    {"label": "Education Pack", "url": "https://education.github.com/pack"},
    {"label": "Documentation", "url": "https://docs.github.com/en/copilot"}
  ]'::jsonb
),
(
  'DeepSite',
  'deepsite',
  'AI Website Builder mit DeepSeek V3 – Von Text zu Website ohne Code',
  '# DeepSite – AI-Powered Website Builder

DeepSite ist ein KI-gestützter Website-Generator, der auf dem **DeepSeek V3** Modell basiert. Erstelle professionelle Websites aus einfachen Text-Beschreibungen – ohne jegliche Programmier-Kenntnisse.

## 🎨 Was ist DeepSite?

Ein vollständig AI-gesteuerter Website-Builder, der natürliche Sprache in funktionsfähige Websites verwandelt.

### Powered by DeepSeek
- Nutzt das **DeepSeek-R1** und **DeepSeek V3** Modell
- Open Source KI-Modell aus China
- Extrem kostengünstig und performant

## ✨ Features

### No-Code Development
- **Text-to-Website**: Beschreibe deine Idee, DeepSite baut die Site
- **Instant Preview**: Sieh Änderungen in Echtzeit
- **Export Code**: Lade den generierten Code herunter

### Vielseitige Website-Typen
- Portfolio-Websites
- Landing Pages
- E-Commerce Stores
- Educational Platforms
- Business Websites
- Blogs & Content-Sites

### Professional Results
- Responsive Design (Mobile-First)
- Modern UI/UX Patterns
- SEO-Optimiert
- Performance-Optimiert

## 🆚 LocalSite – Open Source Alternative

**LocalSite** ist eine vollständig lokale, Open-Source-Alternative zu DeepSite:
- Läuft komplett offline auf deinem Computer
- Nutzt lokale LLMs via Ollama oder LM Studio
- Privacy-First Ansatz
- Community-getrieben

## 🎯 Perfekt für

- Designer ohne Code-Kenntnisse
- Rapid Prototyping
- MVPs und Landing Pages
- Freelancer & Agencies
- Non-Profit Organisations

## 💡 Vorteile gegenüber traditionellen Builders

- **Schneller**: Website in Minuten statt Stunden
- **Intelligenter**: KI versteht deine Absicht
- **Flexibler**: Natürliche Sprache statt Template-Auswahl
- **Open Source Basis**: DeepSeek ist Open Source

## 💰 Pricing

- **Free Tier**: Begrenzte Generations
- **Pro**: Unbegrenzte Generationen mit Premium-Features

## 🔗 Links

[DeepSite V2](https://deepsitev2.com)  
[DeepSite Design](https://deepsite.design)  
[LocalSite (Open Source)](https://github.com/localsite)',
  '2025-01-27 14:00:00+01',
  3,
  '[
    {"label": "DeepSite V2", "url": "https://deepsitev2.com"},
    {"label": "DeepSite Design", "url": "https://deepsite.design"},
    {"label": "LocalSite GitHub", "url": "https://www.reddit.com/r/LocalLLaMA/comments/1kifny6/ive_made_a_local_alternative_to_deepsite_called/"}
  ]'::jsonb
),
(
  'Lovable',
  'lovable',
  'Web-basiertes Vibe Coding – Full-Stack Apps aus Prompts',
  '# Lovable.dev – The AI-Powered Full-Stack Builder

Lovable ist ein webbasierter AI-App-Builder, der komplette Full-Stack-Anwendungen aus natürlichen Sprach-Prompts generiert. Von der Idee zur fertigen Web-App in Minuten.

## 🚀 Was macht Lovable besonders?

### End-to-End Development
- **Frontend & Backend**: Komplette Full-Stack Apps
- **Database Integration**: Automatisches Setup von Supabase
- **Authentication**: User-Management out-of-the-box
- **Deployment**: One-Click Deploy

### AI-First Approach
- Prompt-basierte Entwicklung
- Iterative Verfeinerung durch Chat
- Intelligent Scaffolding
- Auto-generated Components

## ✨ Features

### Real-Time Collaboration
- **Multiplayer Coding**: Team-Mitglieder gleichzeitig am Projekt
- **Live Preview**: Änderungen sofort sichtbar
- **AI Chat**: Gemeinsam mit KI entwickeln

### Modern Tech Stack
- **React** mit TypeScript
- **Tailwind CSS** für Styling
- **Supabase** als Backend
- **Vercel** für Hosting

### Rich Component Library
- Pre-built UI Components
- Responsive Layouts
- Animations & Interactions
- Form Handling

## 🎯 Use Cases

### Perfekt für
- **Rapid Prototyping**: MVP in Stunden statt Wochen
- **Landing Pages**: Marketing-Sites mit CMS
- **Internal Tools**: Admin Dashboards, CRM
- **SaaS MVPs**: Subscription-basierte Apps

### Beispiel-Apps aus der Community
- Trading Journals
- E-Commerce Stores
- Portfolio Websites
- Educational Platforms
- Content Management Systems

## 🆚 Vergleich mit Alternativen

**Lovable vs. Bolt.new**:
- Lovable: Stärker im Full-Stack (inkl. Backend)
- Bolt: Fokus auf Frontend-Prototyping

**Lovable vs. v0**:
- Lovable: Komplette Apps mit Deployment
- v0: UI-Komponenten für Next.js

## 💡 Pricing

- **Free Tier**: Begrenzte Projekte und Features
- **Pro**: $20/Monat – Unlimited projects
- **Team**: Ab $50/Monat – Collaboration Features

## 🔗 Mehr erfahren

[Lovable Website](https://lovable.dev)  
[Templates](https://lovable.dev/templates)  
[Documentation](https://docs.lovable.dev)',
  '2025-02-03 14:00:00+01',
  3,
  '[
    {"label": "Lovable Website", "url": "https://lovable.dev"},
    {"label": "Templates", "url": "https://lovable.dev/templates"},
    {"label": "Docs", "url": "https://docs.lovable.dev"},
    {"label": "Review", "url": "https://refine.dev/blog/lovable-ai/"}
  ]'::jsonb
),
(
  'bolt.new',
  'bolt-new',
  'Schnelles Prototyping von StackBlitz – Full-Stack im Browser',
  '# bolt.new by StackBlitz

bolt.new ist eine AI-powered Entwicklungsplattform von StackBlitz, die vollständige Web-Apps direkt im Browser erstellt. Prompt, run, edit, deploy – alles in einem Tool.

## 🎯 Was ist bolt.new?

Eine revolutionäre Entwicklungsumgebung, in der KI nicht nur Code generiert, sondern die **komplette Entwicklungsumgebung kontrolliert**.

### AI with Environment Control
- **Volle Kontrolle**: KI kann Dateien erstellen, editieren, Terminal ausführen
- **Package Installation**: NPM-Pakete automatisch installieren
- **Live Server**: Instant Preview der laufenden App
- **Hot Reload**: Änderungen sofort sichtbar

## ✨ Features

### Full-Stack in the Browser
- **Frontend Frameworks**: React, Vue, Svelte, Solid
- **Backend**: Node.js, Express, API Routes
- **Databases**: SQLite, in-browser DBs
- **Build Tools**: Vite, Webpack, etc.

### Prompt-to-App Workflow
1. **Beschreibe deine Idee** in natürlicher Sprache
2. **KI generiert** die komplette App-Struktur
3. **Iteriere** durch weitere Prompts
4. **Deploy** auf StackBlitz oder exportiere Code

### Real-Time Debugging
- Live Browser-Console
- Error Messages in der UI
- File Explorer mit Code-Editor
- Terminal-Zugriff

## 🚀 Perfekt für

### Rapid Prototyping
- **Designer**: Teste UI-Ideen sofort
- **PMs**: Erstelle funktionale Mockups
- **Developers**: Quick POCs für Kundenprojekte
- **Students**: Lerne durch Experimentieren

### Production-Ready Code
- Clean, well-structured code
- Best Practices eingebaut
- TypeScript Support
- Modern Tooling

## 🆚 vs. Andere Tools

**bolt.new vs. Cursor**:
- Bolt: Browser-basiert, keine Installation
- Cursor: Desktop IDE mit mehr Kontrolle

**bolt.new vs. Lovable**:
- Bolt: Fokus auf Prototyping & Entwickler
- Lovable: End-to-End mit Backend-Services

## 💡 Integration mit StackBlitz

### Nahtloser Übergang
- **"Open in StackBlitz"**: Projekt in vollwertige IDE öffnen
- **GitHub Sync**: Direkt in Repository pushen
- **Team Collaboration**: Shared Workspaces

### WebContainers
bolt.new läuft auf **WebContainers** – einer vollständigen Node.js-Runtime im Browser!

## 💰 Pricing

- **Free**: Unbegrenzte öffentliche Projekte
- **Pro**: $8/Monat für private Projekte
- **Enterprise**: Custom Solutions für Teams

## 🔗 Links & Ressourcen

[bolt.new](https://bolt.new)  
[StackBlitz](https://stackblitz.com)  
[GitHub](https://github.com/stackblitz/bolt.new)',
  '2025-02-03 14:00:00+01',
  3,
  '[
    {"label": "bolt.new", "url": "https://bolt.new"},
    {"label": "StackBlitz", "url": "https://stackblitz.com"},
    {"label": "GitHub Repo", "url": "https://github.com/stackblitz/bolt.new"},
    {"label": "Case Study", "url": "https://evilmartians.com/chronicles/bolt-new-from-stackblitz-how-they-surfed-the-ai-wave-with-no-wipeouts"}
  ]'::jsonb
),
(
  'v0 by Vercel',
  'v0',
  'Vercels Frontend-Generator – UI-Komponenten aus Prompts',
  '# v0 by Vercel – AI UI Generator

v0 ist Vercels AI-powered Generative UI Tool, das hochwertige Frontend-Code aus natürlichen Sprach-Beschreibungen erstellt. Fokus auf React/Next.js und Produktion-ready Code.

## 🎨 Was ist v0?

Ein spezialisiertes Tool für **UI-Generierung**, entwickelt vom Team hinter Next.js und Vercel.

### Core Capabilities
- **UI Components**: Von Buttons bis komplexe Dashboards
- **Full Pages**: Komplette Page-Layouts
- **Client Logic**: State Management & Interactions
- **Responsive Design**: Mobile-First Approach

## ✨ Key Features

### Next.js Optimiert
- **shadcn/ui Components**: Pre-built Komponentenbibliothek
- **Tailwind CSS**: Utility-First Styling
- **TypeScript**: Type-safe Code
- **Server Components**: Next.js 14+ Features

### Production-Ready Code
- Clean & Well-Structured
- Accessibility (a11y) Standards
- SEO-Friendly
- Performance-Optimiert

### Iterative Refinement
1. **Prompt eingeben**: "Create a pricing page with 3 tiers"
2. **Generierung**: v0 erstellt mehrere Varianten
3. **Auswählen & Iterieren**: Wähle beste Version, verfeinere
4. **Export**: In dein Next.js-Projekt integrieren

## 🔌 CLI Integration

### "Blocks" Feature
```bash
npx v0 add <block-id>
```
- Installiert Komponenten direkt in dein Projekt
- Inkl. Dependencies und Types
- Ready to use!

## 🎯 Use Cases

### Perfect für
- **Next.js Developers**: Native Integration
- **Design System Teams**: Konsistente UI-Patterns
- **Agencies**: Schnelle Client-Prototypes
- **Startups**: MVP Landing Pages

### Beispiele
- Marketing Landing Pages
- SaaS Dashboards
- E-Commerce Product Pages
- Portfolio Websites
- Admin Interfaces

## 🆚 Alternativen

**v0 vs. bolt.new**:
- v0: UI-fokussiert, Next.js-optimiert
- Bolt: Full-Stack im Browser

**v0 vs. Lovable**:
- v0: Komponenten für bestehende Apps
- Lovable: Komplette Apps von Grund auf

## 💰 Credit System

v0 nutzt ein **Credit-basiertes** Pricing:
- **Free Tier**: 200 Credits/Monat
- **Premium**: $20/Monat – 3.000 Credits
- Pro Generation: ~10 Credits

## 🏢 Vercel Integration

### Seamless Deploy
- Direkt zu Vercel deployen
- Edge Functions Support
- Analytics Integration
- Enterprise Access Control

## 🔗 Ressourcen

[v0.dev](https://v0.dev)  
[Templates](https://v0.app/templates)  
[Vercel](https://vercel.com)',
  '2025-02-03 14:00:00+01',
  3,
  '[
    {"label": "v0 Website", "url": "https://v0.dev"},
    {"label": "Templates", "url": "https://v0.app/templates"},
    {"label": "Vercel", "url": "https://vercel.com"},
    {"label": "Pricing Guide", "url": "https://uibakery.io/blog/vercel-v0-pricing-explained-what-you-get-and-how-it-compares"}
  ]'::jsonb
),
(
  'Replit',
  'replit',
  'Cloud IDE mit AI Agent – Code, Build, Deploy in einem Tool',
  '# Replit – AI-Powered Cloud Development

Replit ist eine vollständige Cloud-Entwicklungsplattform mit integriertem AI-Agent. Von der Idee bis zum Deployment – alles im Browser.

## 🌐 Was ist Replit?

Eine **Cloud-basierte IDE** mit AI-Unterstützung, Real-Time-Kollaboration und One-Click-Deployment.

### All-in-One Platform
- **Code Editor**: Voller IDE im Browser
- **Runtime**: Unterstützt 50+ Programmiersprachen
- **AI Agent**: Autonomous coding assistant
- **Hosting**: Deploy mit einem Klick
- **Databases**: Integrierte DB-Lösungen

## 🤖 Replit Agent

### Autonomous AI Developer
- **Idea-to-App**: Beschreibe dein Projekt, Agent baut es
- **Multi-Step Reasoning**: Plant komplexe Änderungen
- **Full Project Lifecycle**: Von Setup bis Deployment
- **Collaboration**: Arbeitet mit dir zusammen

### Supported Models
- **Claude Sonnet 3.5/3.7**: Hohe Qualität
- **OpenAI GPT-4o**: Vielseitig
- **DeepSeek**: Schnell & kostengünstig

## 🚀 Features

### Real-Time Collaboration
- **Multiplayer Editing**: Google Docs für Code
- **Live Cursor Tracking**: Sieh wo dein Team arbeitet
- **Shared Terminal**: Gemeinsamer Zugriff
- **Voice/Video Chat**: Integrierte Kommunikation

### Mobile & Desktop Apps
- **Code on the Go**: iOS & Android Apps
- **Monitor Deployments**: Push-Notifications
- **Repository Management**: GitHub Integration
- **Full-Featured**: Nicht nur ein Viewer!

### Deployment Made Easy
- **Autoscale Deployments**: Automatisches Scaling
- **Custom Domains**: Eigene Domain verbinden
- **Environment Variables**: Sichere Secrets-Verwaltung
- **24/7 Uptime**: Production-Ready Hosting

## 🎓 Education Features

### Perfect für Lernende
- **Interactive Tutorials**: Learn by doing
- **Bounty Program**: Verdiene durch Lernen
- **Community**: 30M+ Developer Community
- **Templates**: 1000+ Starter-Projekte

### Classroom Tools
- **Team Workspaces**: Für Kurse und Bootcamps
- **Assignment Management**: Homework-Features
- **Auto-Grading**: KI-gestützte Bewertung

## 💰 Pricing

### Free Tier
- Unlimited Public Apps
- Basic Workspace Resources
- Community Support

### Starter ($25/month)
- Private Apps
- More Resources (2 vCPU, 4GB RAM)
- Advanced AI Models

### Pro ($50/month)
- Full Replit Agent Access
- 4 vCPU, 8GB RAM
- 50GB Storage
- Reserved VMs für Production Apps

## 🔗 Links

[Replit Website](https://replit.com)  
[Documentation](https://docs.replit.com)  
[Community](https://replit.com/community)',
  '2025-02-03 14:00:00+01',
  3,
  '[
    {"label": "Replit Website", "url": "https://replit.com"},
    {"label": "Agent Demo", "url": "https://replit.com/ai"},
    {"label": "Templates", "url": "https://replit.com/templates"},
    {"label": "Review", "url": "https://www.baytechconsulting.com/blog/replit-an-analysis-of-the-ai-powered-cloud-development-platform"}
  ]'::jsonb
),
(
  'VibeCode App',
  'vibecode-app',
  'Mobile App für App-Entwicklung – Build Apps on Your Phone',
  '# VibeCode – Build Apps That Build Apps

VibeCode ist die erste **Mobile App**, mit der du vollwertige Apps direkt auf deinem Smartphone erstellen kannst – ohne eine Zeile Code zu schreiben.

## 📱 Was ist VibeCode?

Eine revolutionäre iOS/Android-App, die **AI-Powered App Development** auf dein Handy bringt.

### Core Concept
**Your ideas deserve to be apps.**  
Verwandle deine Vision in Minuten in eine funktionierende App – nicht in Monaten.

## ✨ Features

### Prompt-to-App
- **Natural Language**: Beschreibe deine App-Idee
- **Instant Generation**: App wird in Echtzeit generiert
- **Live Preview**: Teste sofort auf deinem Gerät

### Powered by Claude Code
- Nutzt **Claude Sonnet** – das beste Coding-Modell
- Agent-basierte Entwicklung
- Intelligente Code-Generierung

### Pinch to Build Menu
Einzigartige **Long-Press Geste** zum Customizen:
- **Design**: Farben, Layouts, Styles anpassen
- **Haptics**: Feedback-Effekte hinzufügen
- **Features**: Sorting, Categories, Reminders
- **Advanced**: Komplexere Funktionen einbauen

## 🎯 Was kannst du bauen?

### Productivity Apps
- To-Do Listen
- Note-Taking Apps
- Habit Trackers
- Time Management Tools

### Social Apps
- Chat Apps
- Community Builders
- Messaging Platforms

### Content Apps
- Image Generators
- Video Editors
- Content Creators

### Utility Apps
- Weather Apps
- Calculators & Converters
- Timers & Stopwatches

### Entertainment
- Games
- Trivia Apps
- Interactive Experiences

### AI-Powered Apps
- Nutze neueste AI-Modelle
- Intelligent User Experiences

## 🚀 Deploy & Share

### App Store Deployment
- **Publish**: Direkt zum App Store deployen
- **Reach Millions**: Potenziell weltweite Nutzer
- **Monetize**: Verdiene mit deiner App

### SSH Export
- **Code Editor Integration**: Verbinde mit Cursor, VS Code
- **Source Code Download**: Exportiere dein Projekt
- **Full Control**: Weitere Entwicklung lokal

## 💰 Transparent Pricing

### Wholesale Credit System
- **Pay What We Pay**: Du zahlst nur für die AI-Nutzung
- **No Hidden Costs**: Volle Transparenz
- **Credit-Based**: Flexibles System

## 👥 Community

- **Thousands of Builders**: Aktive Community
- **Shared Apps**: Lerne von anderen
- **Support**: Discord & Community-Help

## 🎓 Perfect für

- **Non-Coders**: Keine Programmier-Kenntnisse nötig
- **Rapid Prototyping**: Ideen schnell testen
- **Mobile-First Development**: Direkt am Smartphone
- **Students**: Lerne App-Entwicklung hands-on
- **Indie Developers**: Solo-Projects einfach umsetzen

## 🔗 Ressourcen

[VibeCode Docs](https://www.vibecodeapp.com/docs)  
[App Store](https://apps.apple.com/app/vibecode)  
[Community Discord](https://discord.gg/vibecode)',
  '2025-02-03 14:00:00+01',
  3,
  '[
    {"label": "VibeCode Docs", "url": "https://www.vibecodeapp.com/docs"},
    {"label": "Download App", "url": "https://www.vibecodeapp.com"},
    {"label": "Creating First App", "url": "https://www.vibecodeapp.com/docs/creating-your-first-app"}
  ]'::jsonb
);

