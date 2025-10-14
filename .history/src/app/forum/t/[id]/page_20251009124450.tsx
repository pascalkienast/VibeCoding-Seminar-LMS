"use client";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";

interface Params { params: { id: string } }

export default function TopicDetail({ params }: Params) {
  const [topic, setTopic] = useState<{ id: number; title: string } | null>(null);
  const [posts, setPosts] = useState<Array<{ id: number; body: string; created_at: string }>>([]);
  const [reply, setReply] = useState("");
  const id = Number(params.id);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase
      .from("forum_topics")
      .select("id, title")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) setTopic({ id: data.id, title: data.title });
      });
    supabase
      .from("forum_posts")
      .select("id, body, created_at, author_id")
      .eq("topic_id", id)
      .order("created_at", { ascending: true })
      .then(({ data }) => setPosts((data || []).map((p: any) => ({ id: p.id, body: p.body, created_at: p.created_at }))));
  }, [id]);

  const onReply = async () => {
    if (!reply.trim() || !topic) return;
    const supabase = getSupabaseBrowserClient();
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) return;
    const { error } = await supabase.from("forum_posts").insert({ topic_id: topic.id, author_id: uid, body: reply });
    if (error) { alert(error.message); return; }
    setReply("");
    const { data } = await supabase
      .from("forum_posts")
      .select("id, body, created_at, author_id")
      .eq("topic_id", id)
      .order("created_at", { ascending: true });
    setPosts((data || []).map((p: any) => ({ id: p.id, body: p.body, created_at: p.created_at })));
  };

  return (
    <RequireAuth>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{topic?.title ?? "…"}</h1>
        <div className="grid gap-3">
          {posts.map((p) => (
            <div className="card" key={p.id}>
              <div className="text-xs text-neutral-500 mb-2">{new Date(p.created_at).toLocaleString()}</div>
              <div className="prose dark:prose-invert">
                <ReactMarkdown>{p.body}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
        <div className="card space-y-2">
          <label className="block text-sm">Antwort</label>
          <textarea className="textarea" value={reply} onChange={(e) => setReply(e.target.value)} />
          <button className="btn w-fit" onClick={onReply}>Senden</button>
        </div>
      </div>
    </RequireAuth>
  );
}


