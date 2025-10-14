"use client";
import MarkdownWithSurveys from "@/components/MarkdownWithSurveys";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";

interface Params { params: { week_number: string } }

export default function WeekDetail({ params }: Params) {
  const n = useMemo(() => Number(params.week_number), [params.week_number]);
  const [week, setWeek] = useState<{ week_number: number; title: string; body: string } | null>(null);

  useEffect(() => {
    getSupabaseBrowserClient()
      .from("weeks")
      .select("week_number, title, body")
      .eq("week_number", n)
      .single()
      .then(({ data }) => data && setWeek({ week_number: data.week_number, title: data.title, body: data.body || "" }));
  }, [n]);

  const prev = (week?.week_number ?? n) - 1;
  const next = (week?.week_number ?? n) + 1;

  return (
    <RequireAuth>
      <article className="prose dark:prose-invert max-w-none">
        {!week ? (
          <div>Not found</div>
        ) : (
          <>
            <h1>Woche {week.week_number}: {week.title}</h1>
            <MarkdownWithSurveys markdown={week.body || ""} />
            <div className="flex gap-2 mt-6">
              <a className="btn-outline" href={`/lehrplan/${prev}`}>← Prev</a>
              <a className="btn-outline" href={`/lehrplan/${next}`}>Next →</a>
            </div>
          </>
        )}
      </article>
    </RequireAuth>
  );
}


