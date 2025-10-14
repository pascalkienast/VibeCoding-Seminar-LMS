"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";

interface Params { params: { slug: string } }

export default function CategoryTopics({ params }: Params) {
  const [category, setCategory] = useState<{ id: number; title: string } | null>(null);
  const [topics, setTopics] = useState<Array<{ id: number; title: string }>>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase
      .from("forum_categories")
      .select("id, title")
      .eq("slug", params.slug)
      .single()
      .then(({ data }) => {
        if (data) {
          setCategory({ id: data.id, title: data.title });
          supabase
            .from("forum_topics")
            .select("id, title, is_locked, is_pinned, last_post_at")
            .eq("category_id", data.id)
            .order("is_pinned", { ascending: false })
            .order("last_post_at", { ascending: false })
            .then(({ data }) => setTopics((data || []).map((t: any) => ({ id: t.id, title: t.title }))));
        }
      });
  }, [params.slug]);

  const onCreateTopic = async () => {
    if (!category || !newTitle.trim()) return;
    const supabase = getSupabaseBrowserClient();
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) return;
    const { data: topic, error: errTopic } = await supabase
      .from("forum_topics")
      .insert({ category_id: category.id, title: newTitle, author_id: uid })
      .select("id")
      .single();
    if (errTopic || !topic) { alert(errTopic?.message || "Failed to create topic"); return; }
    if (newBody.trim()) {
      await supabase.from("forum_posts").insert({ topic_id: topic.id, author_id: uid, body: newBody });
    }
    setNewTitle("");
    setNewBody("");
    // refresh list
    const { data } = await supabase
      .from("forum_topics")
      .select("id, title, is_locked, is_pinned, last_post_at")
      .eq("category_id", category.id)
      .order("is_pinned", { ascending: false })
      .order("last_post_at", { ascending: false });
    setTopics((data || []).map((t: any) => ({ id: t.id, title: t.title })));
  };

  return (
    <RequireAuth>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{category?.title ?? "…"}</h1>
        <div className="grid gap-3">
          {topics.map((t) => (
            <a key={t.id} href={`/forum/t/${t.id}`} className="card block">
              <h2 className="font-medium">{t.title}</h2>
            </a>
          ))}
        </div>
        <div className="card space-y-2">
          <h2 className="font-medium">Neues Thema</h2>
          <input className="input" placeholder="Titel" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <textarea className="textarea" placeholder="Eröffnungsbeitrag (optional)" value={newBody} onChange={(e) => setNewBody(e.target.value)} />
          <button className="btn w-fit" onClick={onCreateTopic}>Thema erstellen</button>
        </div>
      </div>
    </RequireAuth>
  );
}


