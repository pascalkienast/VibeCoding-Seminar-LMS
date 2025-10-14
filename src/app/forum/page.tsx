"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";

export default function ForumCategories() {
  const [cats, setCats] = useState<Array<{ id: number; slug: string; title: string; description: string }>>([]);
  useEffect(() => {
    getSupabaseBrowserClient()
      .from("forum_categories")
      .select("id, slug, title, description")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setCats(data || []));
  }, []);

  return (
    <RequireAuth>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Forum</h1>
        <div className="grid gap-3">
          {cats.map((c) => (
            <a key={c.id} href={`/forum/c/${c.slug}`} className="card block">
              <h2 className="font-medium">{c.title}</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{c.description}</p>
            </a>
          ))}
        </div>
      </div>
    </RequireAuth>
  );
}


