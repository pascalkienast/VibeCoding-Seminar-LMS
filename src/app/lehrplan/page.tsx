"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";

export default function WeeksPage() {
  const [weeks, setWeeks] = useState<Array<{ week_number: number; title: string; date: string | null }>>([]);
  useEffect(() => {
    getSupabaseBrowserClient()
      .from("weeks")
      .select("week_number, date, title, is_published")
      .eq("is_published", true)
      .order("week_number", { ascending: true })
      .then(({ data }) => setWeeks((data || []).map((w: any) => ({ week_number: w.week_number, title: w.title, date: w.date ?? null }))));
  }, []);

  return (
    <RequireAuth>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Lehrplan</h1>
        <div className="grid gap-3">
          {weeks.map((w) => (
            <a key={w.week_number} href={`/lehrplan/${w.week_number}`} className="card block">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium">Woche {w.week_number}: {w.title}</h2>
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {w.date ? new Date(w.date).toLocaleDateString() : "—"}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </RequireAuth>
  );
}


