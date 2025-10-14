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
    if (!weekNumber || !title) return alert("Wochennummer und Titel sind erforderlich");
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
    alert("Woche erstellt");
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
    if (!editWeekNumber || !editTitle) return alert("Wochennummer und Titel sind erforderlich");
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
    alert("Woche aktualisiert");
  };

  const onDelete = async (id: number) => {
    if (!confirm("Diese Woche löschen? Dies kann nicht rückgängig gemacht werden.")) return;
    const { error } = await getSupabaseBrowserClient().from("weeks").delete().eq("id", id);
    if (error) return alert(error.message);
    if (editingId === id) cancelEdit();
    await refresh();
    alert("Woche gelöscht");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin · Lehrplan</h1>

      <div className="card space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className="block text-sm mb-1">Wochennummer</label>
            <input className="input" type="number" value={weekNumber || ""} onChange={(e) => setWeekNumber(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm mb-1">Datum</label>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Titel</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Zusammenfassung</label>
            <input className="input" value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Inhalt (Markdown)</label>
            <textarea className="textarea" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            <span className="text-sm">Veröffentlicht</span>
          </label>
        </div>
        <button className="btn w-fit" onClick={onCreate}>Woche erstellen</button>
      </div>

      <div className="grid gap-3">
        {weeks.map((w) => (
          <div key={w.id} className="card space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">Woche {w.week_number}: {w.title}</div>
              <div className="flex items-center gap-2">
                <button className="btn-outline-sm" onClick={() => startEdit(w)}>Bearbeiten</button>
                <button className="btn-outline-sm" onClick={() => onDelete(w.id)}>Löschen</button>
              </div>
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              {w.is_published ? "Veröffentlicht" : "Entwurf"} · {w.date ? new Date(w.date).toLocaleDateString() : "—"}
            </div>
            {editingId === w.id && (
              <div className="border-t pt-3 space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm mb-1">Wochennummer</label>
                    <input className="input" type="number" value={editWeekNumber || ""} onChange={(e) => setEditWeekNumber(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Datum</label>
                    <input className="input" type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Titel</label>
                    <input className="input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Zusammenfassung</label>
                    <input className="input" value={editSummary} onChange={(e) => setEditSummary(e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Inhalt (Markdown)</label>
                    <textarea className="textarea" value={editBody} onChange={(e) => setEditBody(e.target.value)} />
                  </div>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={editIsPublished} onChange={(e) => setEditIsPublished(e.target.checked)} />
                    <span className="text-sm">Veröffentlicht</span>
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


