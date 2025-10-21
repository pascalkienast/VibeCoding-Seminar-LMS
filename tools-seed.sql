-- Seed data for tools table
-- Vibe-Coding Tools für das Seminar

-- Browser-basierte Vibe-Coding Plattformen
INSERT INTO tools (title, url, description) VALUES
('Bolt.new', 'https://bolt.new/', 'Prompt-to-App Platform: Verwandle Ideen durch konversationelle Eingabeaufforderungen schnell in funktionale Prototypen. Perfekt für schnelles Prototyping ohne Setup.'),
('Lovable', 'https://lovable.dev/', 'Full-Stack App Generator: Von der Idee zur vollständigen App. Konvertiert sogar Figma-Designs und Screenshots direkt in Code. Ideal für Laien und Profis mit React, Tailwind und Vite.'),
('v0 by Vercel', 'https://v0.dev/chat', 'UI/Frontend-Generator für Next.js: Generiere moderne React-Komponenten und UI-Elemente durch natürliche Sprache. Perfekt für schnelle Interface-Entwicklung.'),
('Replit', 'https://replit.com/', 'Kollaborative Browser-IDE: Browserbasiertes Codieren mit Unterstützung für zahlreiche Programmiersprachen. Ideal für Teamarbeit und sofortiges Deployment ohne lokales Setup.'),
('Firebase Studio', 'https://studio.firebase.google.com/', 'Agentische Cloud-Dev-Umgebung: KI-gestützte Entwicklungsplattform von Google für schnelle Cloud-App-Entwicklung mit integrierten Backend-Services.'),
('Tempo', 'https://www.tempo.new/', 'React-App-Builder mit AI-Flows: Erstelle React-Anwendungen mit visuellen AI-gestützten Workflows. Vereinfacht komplexe Entwicklungsprozesse.'),
('StackBlitz', 'https://stackblitz.com/', 'Instant Full-Stack IDE: WebContainer-basierte Browser-IDE, die Node.js direkt im Browser ausführt. Sofort startklar ohne Installation.'),

-- KI-gestützte IDEs & Code-Editoren
('Cursor', 'https://www.cursor.com/', 'KI-Code-Editor mit Agent-Features: Angepasste VS Code-Version mit Code-Generierung, -Erklärung und Completion. Der intelligente Coding-Partner für moderne Entwicklung.'),
('Windsurf', 'https://codeium.com/windsurf', 'Agentischer IDE mit Live-Previews: KI-gestützter IDE von Codeium mit agentenbasiertem Workflow, Live-Vorschauen und One-Click-Deploys.'),
('Zed', 'https://zed.dev/', 'Kollaborativer Editor mit AI-Assist: Ultraschneller, moderner Code-Editor mit Echtzeit-Kollaboration und KI-Unterstützung.'),
('GitHub Copilot', 'https://github.com/features/copilot', 'AI Pair Programmer: Dein intelligenter Coding-Partner, der Code-Vorschläge in Echtzeit liefert. Kostenlos über GitHub Student Developer Pack.'),

-- CLI & Terminal-basierte Agent Tools
('aider', 'https://aider.chat/', 'AI Pair Programming im Terminal: Kommandozeilen-basierter KI-Assistent für Coding. Arbeitet direkt mit deinen lokalen Dateien und Git-Repositories.'),
('Goose', 'https://block.github.io/goose/', 'Lokaler AI-Agent mit MCP: Open-Source Coding-Agent mit Model Context Protocol-Unterstützung für erweiterte Funktionalität.'),
('MyCoder.ai', 'https://github.com/drivecore/mycoder', 'Open-Source AI-Coding Assistant: Freier KI-Assistent für Entwickler, vollständig anpassbar und erweiterbar.'),

-- Deployment & Hosting (Free Tiers)
('Vercel', 'https://vercel.com/', 'Web Deploy & Previews: Erstklassiges Hosting für Frontend-Frameworks wie Next.js. Automatische Deployments und Preview-URLs für jede Branch.'),
('Netlify', 'https://www.netlify.com/', 'Web Deploy & Serverless Functions: Einfaches Hosting mit integrierter CI/CD-Pipeline und Serverless-Funktionen für Backend-Logic.'),
('Supabase', 'https://supabase.com/', 'Open-Source Firebase Alternative: Postgres-Datenbank, Authentication, Storage und Realtime-Subscriptions. Perfektes Backend-as-a-Service.'),
('Firebase', 'https://firebase.google.com/', 'Google Cloud Platform für Apps: Umfassende Suite mit Auth, Firestore-Datenbank, Storage, Hosting und Analytics.'),
('Cloudflare Pages', 'https://pages.cloudflare.com/', 'Statisches Hosting + Edge Workers: Blitzschnelles globales Hosting mit Serverless-Functions am Edge für minimale Latenz.'),
('Deno Deploy', 'https://deno.com/deploy', 'Edge Runtime für JavaScript/TypeScript: Moderne Runtime am Edge für superschnelle Web-Apps mit TypeScript-First-Ansatz.'),

-- Design-to-Code Tools
('Napkins.dev', 'https://www.napkins.dev/', 'Screenshot-to-Code: Konvertiere Screenshots und Designs automatisch in sauberen, funktionalen Code. Beschleunigt UI-Entwicklung massiv.'),
('Framer AI', 'https://www.framer.com/ai/', 'AI-gestützter Website-Builder: Kombiniert visuellen Editor mit KI, die komplette Websites aus einer einzigen Eingabeaufforderung generiert.'),
('HeroUI Chat', 'https://heroui.chat/', 'UI-Komponenten-Generator: Generiere schöne, moderne UI-Komponenten durch Chat-Interface. Spart Zeit bei Komponenten-Design.'),

-- Weitere AI App Builder
('Softgen', 'https://softgen.ai/', 'Prompt-to-Full-Stack: Erstelle vollständige Full-Stack-Anwendungen aus natürlichsprachlichen Beschreibungen.'),
('Lazy AI', 'https://getlazy.ai/', 'Business-Apps aus Prompts: Entwickle Business-Anwendungen ohne Code durch intelligente Prompt-Verarbeitung.'),
('Creatr', 'https://getcreatr.com/', 'Web-Apps generieren & deployen: Von der Idee zum Deployment in Minuten. Vollständig integrierter Workflow.'),
('Rocket.new', 'https://www.rocket.new/', 'Web & Mobile Apps Builder: Cross-Platform App-Entwicklung durch Prompts. Web und Mobile aus einer Quelle.'),
('CHAI.new', 'https://chai.new/', 'Prompt-to-AI-Agent Builder (Langbase): Erstelle eigene AI-Agents und Apps mit Chain-of-Thought-Prompting.'),

-- Utilities & Spezialtools
('GitHub Student Pack', 'https://education.github.com/pack', 'Developer Tools Bundle für Studenten: Umfangsreiches Paket mit kostenlosen Pro-Versionen von Developer-Tools, Cloud-Credits und Premium-Services.'),
('JetBrains Student License', 'https://www.jetbrains.com/community/education/#students', 'Professionelle IDE-Suite kostenlos: Zugang zu allen JetBrains IDEs (IntelliJ, PyCharm, WebStorm, etc.) für Studenten.'),
('Figma Education', 'https://www.figma.com/education/', 'Professional Design Tool Free: Figma Pro kostenlos für Studenten. Collaborative Interface Design und Prototyping.'),
('Notion for Students', 'https://www.notion.so/students', 'Workspace & Dokumentation: Kostenloser Premium-Plan für Studenten. Ideal für Projektverwaltung und Dokumentation.'),
('CodeSandbox', 'https://codesandbox.io/', 'Cloud Development Environment: Instant Dev-Umgebungen im Browser mit Template-Support und Team-Kollaboration.'),
('Glitch', 'https://glitch.com/', 'Editor + Instant Hosting: Entwickle und hoste Node.js und Static-Apps direkt im Browser mit Community-Features.'),
('PostHog', 'https://posthog.com/', 'Product Analytics & Events: Open-Source Analytics-Platform mit Event-Tracking, Feature-Flags und Session-Recording.'),
('Sentry', 'https://sentry.io/', 'Error Monitoring & Tracking: Echtzeit-Fehlerüberwachung für Apps. Finde und fixe Bugs bevor User sie melden.');

