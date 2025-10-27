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

type WeekFile = {
  id: number;
  week_id: number;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
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
  const [weekFiles, setWeekFiles] = useState<Record<number, WeekFile[]>>({});
  const [uploading, setUploading] = useState<number | null>(null);

  const refresh = async () => {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase
      .from("weeks")
      .select("id, week_number, date, title, summary, body, is_published")
      .order("week_number", { ascending: true });
    setWeeks(data || []);
    
    // Fetch files for all weeks
    if (data && data.length > 0) {
      const { data: files } = await supabase
        .from("week_files")
        .select("*")
        .order("uploaded_at", { ascending: true });
      
      if (files) {
        const filesByWeek: Record<number, WeekFile[]> = {};
        files.forEach((file) => {
          if (!filesByWeek[file.week_id]) {
            filesByWeek[file.week_id] = [];
          }
          filesByWeek[file.week_id].push(file);
        });
        setWeekFiles(filesByWeek);
      }
    }
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

  const onFileUpload = async (weekId: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(weekId);
    const supabase = getSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name;
        const filePath = `week-${weekId}/${Date.now()}-${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("lehrplan")
          .upload(filePath, file);

        if (uploadError) {
          alert(`Fehler beim Hochladen von ${fileName}: ${uploadError.message}`);
          continue;
        }

        // Save metadata to database
        const { error: dbError } = await supabase.from("week_files").insert({
          week_id: weekId,
          file_name: fileName,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: userId,
        });

        if (dbError) {
          alert(`Fehler beim Speichern der Metadaten für ${fileName}: ${dbError.message}`);
        }
      }

      await refresh();
      alert("Datei(en) erfolgreich hochgeladen");
    } finally {
      setUploading(null);
    }
  };

  const onFileDelete = async (fileId: number, filePath: string) => {
    if (!confirm("Diese Datei löschen?")) return;

    const supabase = getSupabaseBrowserClient();

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("lehrplan")
      .remove([filePath]);

    if (storageError) {
      alert(`Fehler beim Löschen aus dem Speicher: ${storageError.message}`);
      return;
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("week_files")
      .delete()
      .eq("id", fileId);

    if (dbError) {
      alert(`Fehler beim Löschen der Metadaten: ${dbError.message}`);
      return;
    }

    await refresh();
    alert("Datei gelöscht");
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
            
            {/* Files section */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Dateien ({weekFiles[w.id]?.length || 0})</label>
                <label className="btn-outline-sm cursor-pointer">
                  {uploading === w.id ? "Wird hochgeladen..." : "Datei(en) hinzufügen"}
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    disabled={uploading === w.id}
                    onChange={(e) => onFileUpload(w.id, e.target.files)}
                  />
                </label>
              </div>
              {weekFiles[w.id] && weekFiles[w.id].length > 0 && (
                <div className="space-y-1">
                  {weekFiles[w.id].map((file) => (
                    <div key={file.id} className="flex items-center justify-between text-sm bg-neutral-100 dark:bg-neutral-800 p-2 rounded">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="truncate">{file.file_name}</span>
                        <span className="text-xs text-neutral-500 flex-shrink-0">{formatFileSize(file.file_size)}</span>
                      </div>
                      <button
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs flex-shrink-0 ml-2"
                        onClick={() => onFileDelete(file.id, file.file_path)}
                      >
                        Löschen
                      </button>
                    </div>
                  ))}
                </div>
              )}
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


