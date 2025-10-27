import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { difficulty, model } = await request.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key nicht konfiguriert" },
        { status: 500 }
      );
    }

    const difficultyDescriptions: Record<number, string> = {
      1: "sehr einfach für absolute Anfänger, die gerade erst mit dem Programmieren beginnen",
      2: "einfach für Anfänger mit ersten Grundkenntnissen",
      3: "mittelschwer für Lernende mit grundlegenden Programmierkenntnissen",
      4: "fortgeschritten für Entwickler mit solider Erfahrung",
      5: "anspruchsvoll für erfahrene Entwickler mit guten Kenntnissen",
    };

    const prompt = `Du bist ein kreativer Projektideen-Generator für "Vibe Coding" - eine intuitive, flow-basierte Art des Programmierens, bei der man schnell prototypen erstellt und iteriert.

Generiere EINE konkrete Projektidee mit dem Schwierigkeitsgrad: ${difficultyDescriptions[difficulty] || difficultyDescriptions[3]}.

Die Projektidee sollte:
- Spaß machen und motivierend sein
- Für Vibe Coding geeignet sein (schnell prototypierbar, visuell/interaktiv wenn möglich)
- Einen klaren praktischen Nutzen oder Lerneffekt haben
- Mit modernen Web-Technologien umsetzbar sein (z.B. React, Next.js, TypeScript, Python, etc.)

Formatiere die Antwort GENAU so:

**Projektidee:** [Ein prägnanter, einprägsamer Titel]

**Beschreibung:**
[2-3 Sätze, die das Projekt beschreiben und warum es interessant ist]

**Technologien:**
- [Technologie 1]
- [Technologie 2]
- [Technologie 3]
(maximal 4-5 Technologien)

**Funktionen:**
- [Funktion 1]
- [Funktion 2]
- [Funktion 3]
(3-5 Kernfunktionen)

**Lernziele:**
- [Lernziel 1]
- [Lernziel 2]
- [Lernziel 3]
(2-4 Hauptlernziele)

**Vibe-Faktor:**
[1-2 Sätze darüber, warum dieses Projekt perfekt für Vibe Coding ist - was macht es intuitiv, schnell prototypierbar und spaßig?]

Antworte NUR auf Deutsch und halte dich strikt an das Format.`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || "deepseek/deepseek-chat-v3-0324",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 1000,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json(
        { error: "Fehler beim Generieren der Idee" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const idea = data.choices?.[0]?.message?.content;

    if (!idea) {
      return NextResponse.json(
        { error: "Keine Idee generiert" },
        { status: 500 }
      );
    }

    return NextResponse.json({ idea });
  } catch (error) {
    console.error("Error in generate-idea API:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

