"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";
import Link from "next/link";

type Question = {
  id: number;
  title: string;
  author_id: string;
  is_resolved: boolean;
  created_at: string;
  author_username?: string;
  author_email?: string;
  answer_count: number;
};

export default function QAOverview() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const supabase = getSupabaseBrowserClient();

    // Fetch all questions
    const { data: questionsData, error } = await supabase
      .from("qa_questions")
      .select("id, title, author_id, is_resolved, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading questions:", error);
      setLoading(false);
      return;
    }

    if (!questionsData) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    // Enrich with author info and answer counts
    const enrichedQuestions = await Promise.all(
      questionsData.map(async (q) => {
        // Get author profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, email")
          .eq("id", q.author_id)
          .single();

        // Get answer count
        const { count } = await supabase
          .from("qa_answers")
          .select("id", { count: "exact", head: true })
          .eq("question_id", q.id);

        return {
          ...q,
          author_username: profile?.username || "Unbekannt",
          author_email: profile?.email || "",
          answer_count: count || 0,
        };
      })
    );

    setQuestions(enrichedQuestions);
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <RequireAuth>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Q&A</h1>
          <Link href="/forum/neu" className="btn">
            + Neue Frage stellen
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-neutral-500">Lädt...</div>
        ) : questions.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-neutral-500 mb-4">
              Noch keine Fragen vorhanden.
            </p>
            <Link href="/forum/neu" className="btn">
              Stelle die erste Frage!
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <Link
                key={q.id}
                href={`/forum/${q.id}`}
                className="card block hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Resolved indicator */}
                  <div className="flex-shrink-0 pt-1">
                    {q.is_resolved ? (
                      <span
                        className="text-green-500 text-xl"
                        title="Gelöst"
                      >
                        ✓
                      </span>
                    ) : (
                      <span
                        className="text-neutral-400 text-xl"
                        title="Offen"
                      >
                        ?
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="font-medium text-lg mb-1 truncate">
                      {q.title}
                    </h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
                      <span>
                        von{" "}
                        <a
                          href={`mailto:${q.author_email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {q.author_username}
                        </a>
                      </span>
                      <span>{formatDate(q.created_at)}</span>
                      <span>
                        {q.answer_count}{" "}
                        {q.answer_count === 1 ? "Antwort" : "Antworten"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
