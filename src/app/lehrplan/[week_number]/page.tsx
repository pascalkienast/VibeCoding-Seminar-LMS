"use client";
import MarkdownWithSurveys from "@/components/MarkdownWithSurveys";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";

interface Params { params: { week_number: string } }

type WeekFile = {
  id: number;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
};

export default function WeekDetail({ params }: Params) {
  const n = useMemo(() => Number(params.week_number), [params.week_number]);
  const [week, setWeek] = useState<{ id: number; week_number: number; title: string; body: string; date: string | null } | null>(null);
  const [files, setFiles] = useState<WeekFile[]>([]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    
    // Fetch week data
    supabase
      .from("weeks")
      .select("id, week_number, date, title, body")
      .eq("week_number", n)
      .single()
      .then(({ data }) => {
        if (data) {
          setWeek({ 
            id: data.id,
            week_number: data.week_number, 
            title: data.title, 
            body: data.body || "", 
            date: data.date ?? null 
          });
          
          // Fetch files for this week
          supabase
            .from("week_files")
            .select("*")
            .eq("week_id", data.id)
            .order("uploaded_at", { ascending: true })
            .then(({ data: filesData }) => {
              if (filesData) setFiles(filesData);
            });
        }
      });
  }, [n]);

  const downloadFile = async (filePath: string, fileName: string) => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.storage
      .from("lehrplan")
      .download(filePath);

    if (error) {
      alert(`Fehler beim Herunterladen: ${error.message}`);
      return;
    }

    // Create download link
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const prev = (week?.week_number ?? n) - 1;
  const next = (week?.week_number ?? n) + 1;

  return (
    <RequireAuth>
      <article className="prose dark:prose-invert max-w-none">
        {!week ? (
          <div>Nicht gefunden</div>
        ) : (
          <>
            <h1>Woche {week.week_number}: {week.title}</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{week.date ? new Date(week.date).toLocaleDateString() : "—"}</p>
            <MarkdownWithSurveys markdown={week.body || ""} />
            
            {files.length > 0 && (
              <div className="not-prose mt-8 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">📎 Dateien & Materialien</h3>
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-700 hover:border-violet-500 dark:hover:border-violet-500 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-2xl">📄</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{file.file_name}</div>
                          <div className="text-xs text-neutral-500">
                            {formatFileSize(file.file_size)} · {new Date(file.uploaded_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadFile(file.file_path, file.file_name)}
                        className="btn-outline-sm flex-shrink-0 ml-4"
                      >
                        Herunterladen
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2 mt-6">
              <a className="btn-outline" href={`/lehrplan/${prev}`}>← Zurück</a>
              <a className="btn-outline" href={`/lehrplan/${next}`}>Weiter →</a>
            </div>
          </>
        )}
      </article>
    </RequireAuth>
  );
}


