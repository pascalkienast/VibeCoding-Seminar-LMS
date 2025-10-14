"use client";
import MarkdownWithSurveys from "@/components/MarkdownWithSurveys";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";

interface Params { params: { week_number: string } }

export default function WeekDetail({ params }: Params) {
  const n = useMemo(() => Number(params.week_number), [params.week_number]);
  const [week, setWeek] = useState<{ week_number: number; title: string; body: string; date: string | null } | null>(null);

  useEffect(() => {
    getSupabaseBrowserClient()
      .from("weeks")
      .select("week_number, date, title, body")
      .eq("week_number", n)
      .single()
      .then(({ data }) => data && setWeek({ week_number: data.week_number, title: data.title, body: data.body || "", date: data.date ?? null }));
  }, [n]);

  const prev = (week?.week_number ?? n) - 1;
  const next = (week?.week_number ?? n) + 1;

  return (
    <RequireAuth>
      <article className="prose dark:prose-invert max-w-none">
        {!week ? (
          <div>Nicht gefunden</div>
        ) : (
          <>
            <h1>Woche {week.week_number}: {week.title}</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{week.date ? new Date(week.date).toLocaleDateString() : "—"}</p>
            <MarkdownWithSurveys markdown={week.body || ""} />
            <div className="flex gap-2 mt-6">
              <a className="btn-outline" href={`/lehrplan/${prev}`}>← Zurück</a>
              <a className="btn-outline" href={`/lehrplan/${next}`}>Weiter →</a>
            </div>
          </>
        )}
      </article>
    </RequireAuth>
  );
}


