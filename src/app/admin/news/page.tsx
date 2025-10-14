"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type News = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  is_public: boolean;
  published_at: string | null;
};

export default function AdminNewsPage() {
  const [items, setItems] = useState<News[]>([]);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSlug, setEditSlug] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);

  const refresh = async () => {
    const { data } = await getSupabaseBrowserClient()
      .from("news")
      .select("id, slug, title, excerpt, body, is_public, published_at")
      .order("published_at", { ascending: false })
      .limit(50);
    setItems(data || []);
  };

  useEffect(() => { refresh(); }, []);

  const onCreate = async () => {
    if (!slug || !title || !body) return alert("slug, title, body required");
    const supabase = getSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    const author_id = userData.user?.id ?? null;
    const { error } = await supabase.from("news").insert({
      slug,
      title,
      excerpt: excerpt || null,
      body,
      is_public: isPublic,
      published_at: new Date().toISOString(),
      author_id,
    });
    if (error) return alert(error.message);
    setSlug("");
    setTitle("");
    setExcerpt("");
    setBody("");
    setIsPublic(false);
    await refresh();
    alert("News created");
  };

  const startEdit = (n: News) => {
    setEditingId(n.id);
    setEditSlug(n.slug);
    setEditTitle(n.title);
    setEditExcerpt(n.excerpt ?? "");
    setEditBody(n.body ?? "");
    setEditIsPublic(!!n.is_public);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditSlug("");
    setEditTitle("");
    setEditExcerpt("");
    setEditBody("");
    setEditIsPublic(false);
  };

  const onUpdate = async () => {
    if (!editingId) return;
    if (!editSlug || !editTitle || !editBody) return alert("slug, title, body required");
    const { error } = await getSupabaseBrowserClient()
      .from("news")
      .update({
        slug: editSlug,
        title: editTitle,
        excerpt: editExcerpt || null,
        body: editBody,
        is_public: editIsPublic,
      })
      .eq("id", editingId);
    if (error) return alert(error.message);
    await refresh();
    cancelEdit();
    alert("News updated");
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this news item? This cannot be undone.")) return;
    const { error } = await getSupabaseBrowserClient().from("news").delete().eq("id", id);
    if (error) return alert(error.message);
    if (editingId === id) cancelEdit();
    await refresh();
    alert("News deleted");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin · News</h1>

      <div className="card space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className="block text-sm mb-1">Slug</label>
            <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Excerpt</label>
            <input className="input" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Body (Markdown)</label>
            <textarea className="textarea" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            <span className="text-sm">Public</span>
          </label>
        </div>
        <button className="btn w-fit" onClick={onCreate}>Create News</button>
      </div>

      <div className="grid gap-3">
        {items.map((n) => (
          <div key={n.id} className="card space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">{n.title}</div>
              <div className="flex items-center gap-2">
                <button className="btn-outline-sm" onClick={() => startEdit(n)}>Edit</button>
                <button className="btn-outline-sm" onClick={() => onDelete(n.id)}>Delete</button>
                <a className="btn-outline-sm" href={`/news/${n.slug}`}>Open</a>
              </div>
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              {n.is_public ? "Public" : "Members"} · {n.published_at ? new Date(n.published_at).toLocaleString() : "—"}
            </div>
            {n.excerpt && <div className="text-sm mt-1">{n.excerpt}</div>}

            {editingId === n.id && (
              <div className="border-t pt-3 space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm mb-1">Slug</label>
                    <input className="input" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Title</label>
                    <input className="input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Excerpt</label>
                    <input className="input" value={editExcerpt} onChange={(e) => setEditExcerpt(e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Body (Markdown)</label>
                    <textarea className="textarea" value={editBody} onChange={(e) => setEditBody(e.target.value)} />
                  </div>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={editIsPublic} onChange={(e) => setEditIsPublic(e.target.checked)} />
                    <span className="text-sm">Public</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button className="btn" onClick={onUpdate}>Save</button>
                  <button className="btn-outline" onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


