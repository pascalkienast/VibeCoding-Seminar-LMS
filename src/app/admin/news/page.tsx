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
  youtube_url: string | null;
};

export default function AdminNewsPage() {
  const [items, setItems] = useState<News[]>([]);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSlug, setEditSlug] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editYoutubeUrl, setEditYoutubeUrl] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);

  const refresh = async () => {
    const { data } = await getSupabaseBrowserClient()
      .from("news")
      .select("id, slug, title, excerpt, body, is_public, published_at, youtube_url")
      .order("published_at", { ascending: false })
      .limit(50);
    setItems(data || []);
  };

  useEffect(() => { refresh(); }, []);

  const onCreate = async () => {
    if (!slug || !title || !body) return alert("Slug, Titel und Inhalt sind erforderlich");
    const supabase = getSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    const author_id = userData.user?.id ?? null;
    const { error } = await supabase.from("news").insert({
      slug,
      title,
      excerpt: excerpt || null,
      body,
      youtube_url: youtubeUrl || null,
      is_public: isPublic,
      published_at: new Date().toISOString(),
      author_id,
    });
    if (error) return alert(error.message);
    setSlug("");
    setTitle("");
    setExcerpt("");
    setBody("");
    setYoutubeUrl("");
    setIsPublic(false);
    await refresh();
    alert("News erstellt");
  };

  const startEdit = (n: News) => {
    setEditingId(n.id);
    setEditSlug(n.slug);
    setEditTitle(n.title);
    setEditExcerpt(n.excerpt ?? "");
    setEditBody(n.body ?? "");
    setEditYoutubeUrl(n.youtube_url ?? "");
    setEditIsPublic(!!n.is_public);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditSlug("");
    setEditTitle("");
    setEditExcerpt("");
    setEditBody("");
    setEditYoutubeUrl("");
    setEditIsPublic(false);
  };

  const onUpdate = async () => {
    if (!editingId) return;
    if (!editSlug || !editTitle || !editBody) return alert("Slug, Titel und Inhalt sind erforderlich");
    const { error } = await getSupabaseBrowserClient()
      .from("news")
      .update({
        slug: editSlug,
        title: editTitle,
        excerpt: editExcerpt || null,
        body: editBody,
        youtube_url: editYoutubeUrl || null,
        is_public: editIsPublic,
      })
      .eq("id", editingId);
    if (error) return alert(error.message);
    await refresh();
    cancelEdit();
    alert("News aktualisiert");
  };

  const onDelete = async (id: number) => {
    if (!confirm("Diesen News-Eintrag löschen? Dies kann nicht rückgängig gemacht werden.")) return;
    const { error } = await getSupabaseBrowserClient().from("news").delete().eq("id", id);
    if (error) return alert(error.message);
    if (editingId === id) cancelEdit();
    await refresh();
    alert("News gelöscht");
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
            <label className="block text-sm mb-1">Titel</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Auszug</label>
            <input className="input" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">YouTube URL (optional)</label>
            <input 
              className="input" 
              value={youtubeUrl} 
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... oder Video-ID"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Unterstützt: youtube.com/watch?v=ID, youtu.be/ID, oder direkt die Video-ID
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Inhalt (Markdown)</label>
            <textarea className="textarea" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            <span className="text-sm">Öffentlich</span>
          </label>
        </div>
        <button className="btn w-fit" onClick={onCreate}>News erstellen</button>
      </div>

      <div className="grid gap-3">
        {items.map((n) => (
          <div key={n.id} className="card space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">{n.title}</div>
              <div className="flex items-center gap-2">
                <button className="btn-outline-sm" onClick={() => startEdit(n)}>Bearbeiten</button>
                <button className="btn-outline-sm" onClick={() => onDelete(n.id)}>Löschen</button>
                <a className="btn-outline-sm" href={`/news/${n.slug}`}>Öffnen</a>
              </div>
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              {n.is_public ? "Öffentlich" : "Mitglieder"} · {n.published_at ? new Date(n.published_at).toLocaleString() : "—"}
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
                    <label className="block text-sm mb-1">Titel</label>
                    <input className="input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Auszug</label>
                    <input className="input" value={editExcerpt} onChange={(e) => setEditExcerpt(e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">YouTube URL (optional)</label>
                    <input 
                      className="input" 
                      value={editYoutubeUrl} 
                      onChange={(e) => setEditYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... oder Video-ID"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Unterstützt: youtube.com/watch?v=ID, youtu.be/ID, oder direkt die Video-ID
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Inhalt (Markdown)</label>
                    <textarea className="textarea" value={editBody} onChange={(e) => setEditBody(e.target.value)} />
                  </div>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={editIsPublic} onChange={(e) => setEditIsPublic(e.target.checked)} />
                    <span className="text-sm">Öffentlich</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button className="btn" onClick={onUpdate}>Speichern</button>
                  <button className="btn-outline" onClick={cancelEdit}>Abbrechen</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


