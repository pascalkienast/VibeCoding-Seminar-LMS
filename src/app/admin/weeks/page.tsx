"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type Week = {
  id: number;
  week_number: number;
  date: string | null;
  title: string;
  summary?: string | null;
  body?: string | null;
  is_published: boolean;
};

export default function AdminWeeksPage() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [weekNumber, setWeekNumber] = useState<number>(0);
  const [date, setDate] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editWeekNumber, setEditWeekNumber] = useState<number>(0);
  const [editDate, setEditDate] = useState<string>("");
  const [editTitle, setEditTitle] = useState<string>("");
  const [editSummary, setEditSummary] = useState<string>("");
  const [editBody, setEditBody] = useState<string>("");
  const [editIsPublished, setEditIsPublished] = useState<boolean>(false);

  const refresh = async () => {
    const { data } = await getSupabaseBrowserClient()
      .from("weeks")
      .select("id, week_number, date, title, summary, body, is_published")
      .order("week_number", { ascending: true });
    setWeeks(data || []);
  };

  useEffect(() => { refresh(); }, []);

  const onCreate = async () => {
    if (!weekNumber || !title) return alert("week_number and title required");
    const supabase = getSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    const created_by = userData.user?.id ?? null;
    const { error } = await supabase.from("weeks").insert({
      week_number: weekNumber,
      date: date || null,
      title,
      summary: summary || null,
      body: body || null,
      is_published: isPublished,
      created_by,
    });
    if (error) return alert(error.message);
    setWeekNumber(0);
    setDate("");
    setTitle("");
    setSummary("");
    setBody("");
    setIsPublished(false);
    await refresh();
    alert("Week created");
  };

  const startEdit = (w: Week) => {
    setEditingId(w.id);
    setEditWeekNumber(w.week_number);
    setEditDate(w.date ?? "");
    setEditTitle(w.title);
    setEditSummary(w.summary ?? "");
    setEditBody(w.body ?? "");
    setEditIsPublished(!!w.is_published);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditWeekNumber(0);
    setEditDate("");
    setEditTitle("");
    setEditSummary("");
    setEditBody("");
    setEditIsPublished(false);
  };

  const onUpdate = async () => {
    if (!editingId) return;
    if (!editWeekNumber || !editTitle) return alert("week_number and title required");
    const { error } = await getSupabaseBrowserClient()
      .from("weeks")
      .update({
        week_number: editWeekNumber,
        date: editDate || null,
        title: editTitle,
        summary: editSummary || null,
        body: editBody || null,
        is_published: editIsPublished,
      })
      .eq("id", editingId);
    if (error) return alert(error.message);
    await refresh();
    cancelEdit();
    alert("Week updated");
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this week? This cannot be undone.")) return;
    const { error } = await getSupabaseBrowserClient().from("weeks").delete().eq("id", id);
    if (error) return alert(error.message);
    if (editingId === id) cancelEdit();
    await refresh();
    alert("Week deleted");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin · Lehrplan</h1>

      <div className="card space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className="block text-sm mb-1">Week Number</label>
            <input className="input" type="number" value={weekNumber || ""} onChange={(e) => setWeekNumber(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm mb-1">Date</label>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Summary</label>
            <input className="input" value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Body (Markdown)</label>
            <textarea className="textarea" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            <span className="text-sm">Published</span>
          </label>
        </div>
        <button className="btn w-fit" onClick={onCreate}>Create Week</button>
      </div>

      <div className="grid gap-3">
        {weeks.map((w) => (
          <div key={w.id} className="card space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">Woche {w.week_number}: {w.title}</div>
              <div className="flex items-center gap-2">
                <button className="btn-outline-sm" onClick={() => startEdit(w)}>Edit</button>
                <button className="btn-outline-sm" onClick={() => onDelete(w.id)}>Delete</button>
              </div>
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              {w.is_published ? "Published" : "Draft"} · {w.date ? new Date(w.date).toLocaleDateString() : "—"}
            </div>
            {editingId === w.id && (
              <div className="border-t pt-3 space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm mb-1">Week Number</label>
                    <input className="input" type="number" value={editWeekNumber || ""} onChange={(e) => setEditWeekNumber(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Date</label>
                    <input className="input" type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Title</label>
                    <input className="input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Summary</label>
                    <input className="input" value={editSummary} onChange={(e) => setEditSummary(e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Body (Markdown)</label>
                    <textarea className="textarea" value={editBody} onChange={(e) => setEditBody(e.target.value)} />
                  </div>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={editIsPublished} onChange={(e) => setEditIsPublished(e.target.checked)} />
                    <span className="text-sm">Published</span>
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


