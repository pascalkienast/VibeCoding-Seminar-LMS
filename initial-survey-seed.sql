begin;

-- Create initial survey from umfrage.md
-- Assumes surveys schema from surveys.sql is already applied.

-- Create survey (anonymous)
insert into public.surveys (title, description, is_anonymous, is_active)
values (
  'Umfrage: Vibe-Coding-Seminar WS 2025/2026',
  'Anonyme Umfrage zur Planung des Seminars. Danke fürs Mitmachen!',
  true,
  true
);

-- Workaround for psql-less execution: define variable via CTE
-- If running in Supabase SQL editor, use DO block instead for robust id capture.

-- Section 1: Schwerpunkte/Interessen (multiple choice with other)
with s as (
  select id as survey_id from public.surveys where title = 'Umfrage: Vibe-Coding-Seminar WS 2025/2026' order by id desc limit 1
)
insert into public.survey_questions (survey_id, order_index, type, label, description, required, options, allow_other)
select s.survey_id, 1, 'multiple_choice', 'Schwerpunkte/Interessen im Studium', 'Mehrfachauswahl möglich', true,
       jsonb_build_array(
         'keine fixen Schwerpunkte/Interessen',
         'Film/Video', 'Digitale Medien/Internet', 'Audio/Sound', 'Performance/Theater',
         'Medientheorie', 'Game Studies', 'Literatur/Text', 'Visuelle Kultur/Kunst', 'Politik/Aktivismus'
       ), true from s;

-- Section 2.1: Programmierkenntnisse (single choice)
with s as (
  select id as survey_id from public.surveys where title = 'Umfrage: Vibe-Coding-Seminar WS 2025/2026' order by id desc limit 1
)
insert into public.survey_questions (survey_id, order_index, type, label, description, required, options)
select s.survey_id, 2, 'single_choice', 'Wie würdest du deine Programmierkenntnisse einschätzen?', null, true,
       jsonb_build_array('Keine – habe noch nie programmiert','Grundkenntnisse – habe mal HTML/CSS etc. ausprobiert','Fortgeschritten – kann ganze Programme/Websites selbst bauen') from s;

-- Section 2.2: Sprachen/Tools (long text)
with s as (
  select id as survey_id from public.surveys where title = 'Umfrage: Vibe-Coding-Seminar WS 2025/2026' order by id desc limit 1
)
insert into public.survey_questions (survey_id, order_index, type, label, description, required)
select s.survey_id, 3, 'long_text', 'Falls du schon mal programmiert hast: Mit welchen Sprachen/Tools?', 'Freitext oder "keine"', false from s;

-- Section 2.3: KI-Tools Erfahrung (multiple choice with other)
with s as (
  select id as survey_id from public.surveys where title = 'Umfrage: Vibe-Coding-Seminar WS 2025/2026' order by id desc limit 1
)
insert into public.survey_questions (survey_id, order_index, type, label, description, required, options, allow_other)
select s.survey_id, 4, 'multiple_choice', 'Hast du bereits Erfahrung mit KI-Tools?', null, false,
       jsonb_build_array(
         'Nein, noch nie genutzt',
         'Ja, ChatGPT/Claude für Texte',
         'Ja, KI für Bilder (Midjourney, DALL-E, etc.)',
         'Ja, KI für Code/Programmierung',
         'Ja, KI für Audio/Video'
       ), true from s;

-- Section 2.4: Technik-Affinität (scale 1..10)
with s as (
  select id as survey_id from public.surveys where title = 'Umfrage: Vibe-Coding-Seminar WS 2025/2026' order by id desc limit 1
)
insert into public.survey_questions (survey_id, order_index, type, label, description, required, min_value, max_value)
select s.survey_id, 5, 'scale', 'Wie technik-affin würdest du dich selbst beschreiben?', '1 (eher analog) — 10 (digital native)', false, 1, 10 from s;

-- Section 3.1: Haltung zu KI (single choice)
with s as (
  select id as survey_id from public.surveys where title = 'Umfrage: Vibe-Coding-Seminar WS 2025/2026' order by id desc limit 1
)
insert into public.survey_questions (survey_id, order_index, type, label, description, required, options)
select s.survey_id, 6, 'single_choice', 'Wie stehst du grundsätzlich zu KI-Tools in der kreativen Arbeit?', null, false,
       jsonb_build_array('Sehr positiv','Eher positiv','Ambivalent','Eher skeptisch','Sehr kritisch','Weiß noch nicht / keine Meinung') from s;

-- Section 3.2: Bedenken (multiple choice with other)
with s as (
  select id as survey_id from public.surveys where title = 'Umfrage: Vibe-Coding-Seminar WS 2025/2026' order by id desc limit 1
)
insert into public.survey_questions (survey_id, order_index, type, label, description, required, options, allow_other)
select s.survey_id, 7, 'multiple_choice', 'Was sind deine größten Bedenken bezüglich KI?', 'Mehrfachauswahl möglich', false,
       jsonb_build_array(
         'Urheberrecht / Copyright-Fragen',
         'Verlust von Arbeitsplätzen',
         'Datenschutz und Privatsphäre',
         'Bias und Diskriminierung',
         'Umweltauswirkungen (Energieverbrauch)',
         'Verlust des eigenständigen Denkens',
         'Verlust von Kultur (AI Slop)',
         '"Black Box" – nicht nachvollziehbar',
         'Konzentration von Macht bei Tech-Konzernen',
         'Habe keine Bedenken'
       ), true from s;

-- Section 3.3: Satz ergänzen (long text)
with s as (
  select id as survey_id from public.surveys where title = 'Umfrage: Vibe-Coding-Seminar WS 2025/2026' order by id desc limit 1
)
insert into public.survey_questions (survey_id, order_index, type, label, description, required)
select s.survey_id, 8, 'long_text', 'Ergänze: "Die Aussage \"Jetzt kann jede*r programmieren\" finde ich…"', 'Freitext', false from s;

-- Section 3.4: Wichtigkeit kritische Auseinandersetzung (scale 1..10)
with s as (
  select id as survey_id from public.surveys where title = 'Umfrage: Vibe-Coding-Seminar WS 2025/2026' order by id desc limit 1
)
insert into public.survey_questions (survey_id, order_index, type, label, description, required, min_value, max_value)
select s.survey_id, 9, 'scale', 'Wie wichtig ist dir die kritische Auseinandersetzung mit KI im Seminar?', '1 (unwichtig) — 10 (sehr wichtig)', false, 1, 10 from s;

-- Section 4.1: Motivation (single choice with other)
with s as (
  select id as survey_id from public.surveys where title = 'Umfrage: Vibe-Coding-Seminar WS 2025/2026' order by id desc limit 1
)
insert into public.survey_questions (survey_id, order_index, type, label, description, required, options, allow_other)
select s.survey_id, 10, 'single_choice', 'Warum hast du dich für dieses Seminar eingeschrieben?', null, false,
       jsonb_build_array(
         'Möchte eine eigene App/Website bauen',
         'Neugier auf neue Technologien',
         'Berufliche Perspektiven',
         'Kritische Auseinandersetzung mit KI',
         'Hat in meinen Stundenplan gepasst',
         'Klingt nach weniger Arbeit als andere Seminare',
         'Freund*innen haben sich auch eingeschrieben'
       ), true from s;

-- Section 4.2: Was entwickeln (multiple choice with other)
with s as (
  select id as survey_id from public.surveys where title = 'Umfrage: Vibe-Coding-Seminar WS 2025/2026' order by id desc limit 1
)
insert into public.survey_questions (survey_id, order_index, type, label, description, required, options, allow_other)
select s.survey_id, 11, 'multiple_choice', 'Was würdest du am liebsten im Seminar entwickeln?', null, false,
       jsonb_build_array(
         'Eine Website/Portfolio', 'Eine Mobile App', 'Ein Spiel', 'Ein interaktives Kunstprojekt',
         'Ein Tool/Hilfsmittel für den Alltag', 'Etwas mit Audio/Musik', 'Etwas mit Text/Literatur',
         'Etwas politisch-aktivistisches', 'Weiß noch nicht'
       ), true from s;

-- Section 4.3: Konkrete Projektidee (long text)
with s as (
  select id as survey_id from public.surveys where title = 'Umfrage: Vibe-Coding-Seminar WS 2025/2026' order by id desc limit 1
)
insert into public.survey_questions (survey_id, order_index, type, label, description, required)
select s.survey_id, 12, 'long_text', 'Gibt es eine konkrete App-/Projekt-Idee, die du schon im Kopf hast?', '1-3 Sätze oder "noch nicht"', false from s;

-- Section 4.4: Zeitaufwand (single choice)
with s as (
  select id as survey_id from public.surveys where title = 'Umfrage: Vibe-Coding-Seminar WS 2025/2026' order by id desc limit 1
)
insert into public.survey_questions (survey_id, order_index, type, label, description, required, options)
select s.survey_id, 13, 'single_choice', 'Wie viel Zeit möchtest du ins Seminar investieren?', null, false,
       jsonb_build_array('Minimal – nur das Nötigste','vielleicht ein paar Stunden zusätzlich zu den Seminar-Terminen','So viel es geht - ich will richtig was bauen!') from s;

-- Section 5.1: Lernstil (multiple choice)
with s as (
  select id as survey_id from public.surveys where title = 'Umfrage: Vibe-Coding-Seminar WS 2025/2026' order by id desc limit 1
)
insert into public.survey_questions (survey_id, order_index, type, label, description, required, options)
select s.survey_id, 14, 'multiple_choice', 'Wie lernst du am liebsten?', 'Mehrfachauswahl möglich', false,
       jsonb_build_array('Learning by doing – direkt ausprobieren','Theorie zuerst, dann Praxis','In der Gruppe mit anderen','Alleine / selbstständig','Mit klaren Schritt-für-Schritt-Anleitungen','Experimentell und explorativ','Durch Lektüre und Reflexion') from s;

-- Section 5.2: Zusatzangebote (multiple choice)
with s as (
  select id as survey_id from public.surveys where title = 'Umfrage: Vibe-Coding-Seminar WS 2025/2026' order by id desc limit 1
)
insert into public.survey_questions (survey_id, order_index, type, label, description, required, options)
select s.survey_id, 15, 'multiple_choice', 'Hättest du Interesse an optionalen Zusatzangeboten?', null, false,
       jsonb_build_array('Zusätzliche technische Tutorials (z.B. Videos)','Vertiefende Lektüre (theoretisch)','Sprechstunden für 1:1 Hilfe','Gemeinsame Coding-Sessions außerhalb der Seminarzeit','Gastvorträge von Expert*innen','Einen Kanal für gemeinsamen Austausch (z.Bsp. eine Gruppe etc.)','Nein, die regulären Sitzungen reichen') from s;

-- Section 6.1: OS (single choice)
with s as (
  select id as survey_id from public.surveys where title = 'Umfrage: Vibe-Coding-Seminar WS 2025/2026' order by id desc limit 1
)
insert into public.survey_questions (survey_id, order_index, type, label, description, required, options)
select s.survey_id, 16, 'single_choice', 'Welches Betriebssystem nutzt du auf deinem Laptop?', null, false,
       jsonb_build_array('macOS','Windows','Linux','ChromeOS','Habe keinen eigenen Laptop') from s;

-- Section 6.2: Internet (single choice)
with s as (
  select id as survey_id from public.surveys where title = 'Umfrage: Vibe-Coding-Seminar WS 2025/2026' order by id desc limit 1
)
insert into public.survey_questions (survey_id, order_index, type, label, description, required, options)
select s.survey_id, 17, 'single_choice', 'Hast du zuverlässigen Internetzugang zu Hause?', null, false,
       jsonb_build_array('Ja, sehr gut','Ja, manchmal instabil','Nein, eher problematisch') from s;

-- Section 7: Wünsche & Anmerkungen (long text)
with s as (
  select id as survey_id from public.surveys where title = 'Umfrage: Vibe-Coding-Seminar WS 2025/2026' order by id desc limit 1
)
insert into public.survey_questions (survey_id, order_index, type, label, description, required)
select s.survey_id, 18, 'long_text', 'Wünsche & Anmerkungen (optional)', 'Freitext, anonym', false from s;

commit;


