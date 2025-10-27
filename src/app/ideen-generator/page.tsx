"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function IdeenGeneratorPage() {
  const [difficulty, setDifficulty] = useState(3);
  const [model, setModel] = useState("deepseek/deepseek-chat-v3-0324");
  const [idea, setIdea] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const difficultyLabels: Record<number, string> = {
    1: "Sehr Einfach",
    2: "Einfach",
    3: "Mittel",
    4: "Fortgeschritten",
    5: "Anspruchsvoll",
  };

  const modelOptions = [
    { value: "deepseek/deepseek-chat-v3-0324", label: "DeepSeek V3" },
    { value: "x-ai/grok-4-fast", label: "Grok 4 Fast" },
    { value: "minimax/minimax-m2:free", label: "MiniMax M2" }
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setIdea("");

    try {
      const response = await fetch("/api/generate-idea", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ difficulty, model }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Generieren der Idee");
      }

      const data = await response.json();
      setIdea(data.idea);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ideen-Generator</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Generiere kreative Projektideen für dein nächstes Vibe-Coding-Projekt
        </p>
      </div>

      <div className="card mb-6">
        <div className="mb-6">
          <label
            htmlFor="model-select"
            className="block text-sm font-medium mb-2"
          >
            KI-Modell
          </label>
          <select
            id="model-select"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={loading}
            className="input mb-6"
          >
            {modelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label
            htmlFor="difficulty-slider"
            className="block text-sm font-medium mb-4"
          >
            Schwierigkeitsgrad:{" "}
            <span className="text-neutral-600 dark:text-neutral-400 font-normal">
              {difficultyLabels[difficulty]}
            </span>
          </label>

          <div className="flex items-center gap-4">
            <span className="text-xs text-neutral-500">Anfänger</span>
            <input
              id="difficulty-slider"
              type="range"
              min="1"
              max="5"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-neutral-900 dark:accent-neutral-100"
              disabled={loading}
            />
            <span className="text-xs text-neutral-500">Experte</span>
          </div>

          <div className="flex justify-between mt-2 px-2 text-xs text-neutral-400">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Idee wird generiert...
            </span>
          ) : (
            "Neue Idee generieren"
          )}
        </button>
      </div>

      {error && (
        <div className="card mb-6 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <p className="text-red-800 dark:text-red-200">
            <strong>Fehler:</strong> {error}
          </p>
        </div>
      )}

      {idea && (
        <div className="card">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown>{idea}</ReactMarkdown>
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-outline"
            >
              Noch eine Idee generieren
            </button>
          </div>
        </div>
      )}

      {!idea && !loading && !error && (
        <div className="card text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-neutral-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <p className="text-neutral-600 dark:text-neutral-400">
            Wähle einen Schwierigkeitsgrad und klicke auf &quot;Neue Idee
            generieren&quot;
          </p>
        </div>
      )}
    </main>
  );
}

