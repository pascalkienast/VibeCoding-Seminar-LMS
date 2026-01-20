"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";
import WysiwygEditor from "@/components/WysiwygEditor";
import FileUpload, { UploadedFile } from "@/components/FileUpload";
import Link from "next/link";

export default function NewQuestion() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Bitte gib einen Titel ein");
      return;
    }

    if (!body.trim() || body === "<p></p>") {
      setError("Bitte beschreibe deine Frage");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        setError("Nicht eingeloggt");
        setSubmitting(false);
        return;
      }

      // Create question
      const { data: question, error: questionError } = await supabase
        .from("qa_questions")
        .insert({
          title: title.trim(),
          body,
          author_id: userData.user.id,
        })
        .select("id")
        .single();

      if (questionError) {
        throw new Error(questionError.message);
      }

      // Add attachments if any
      if (files.length > 0 && question) {
        const attachments = files.map((f) => ({
          question_id: question.id,
          file_name: f.file_name,
          file_url: f.file_url,
          file_type: f.file_type,
          file_size: f.file_size,
          uploaded_by: userData.user.id,
        }));

        const { error: attachError } = await supabase
          .from("qa_attachments")
          .insert(attachments);

        if (attachError) {
          console.error("Error adding attachments:", attachError);
          // Don't throw - question was created successfully
        }
      }

      router.push(`/forum/${question.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Erstellen");
      setSubmitting(false);
    }
  };

  return (
    <RequireAuth>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/forum"
            className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            ← Zurück
          </Link>
          <h1 className="text-2xl font-semibold">Neue Frage stellen</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block font-medium">
              Titel <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              className="input"
              placeholder="Was ist deine Frage?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-neutral-500">
              Formuliere eine klare, konkrete Frage
            </p>
          </div>

          {/* Body */}
          <div className="space-y-2">
            <label className="block font-medium">
              Beschreibung <span className="text-red-500">*</span>
            </label>
            <WysiwygEditor
              content={body}
              onChange={setBody}
              placeholder="Beschreibe deine Frage ausführlich. Was hast du bereits versucht? Welche Fehlermeldungen bekommst du?"
              minHeight="200px"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="block font-medium">Dateien anhängen</label>
            <FileUpload files={files} onFilesChange={setFiles} />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn"
            >
              {submitting ? "Wird erstellt..." : "Frage veröffentlichen"}
            </button>
            <Link href="/forum" className="btn-outline">
              Abbrechen
            </Link>
          </div>
        </form>
      </div>
    </RequireAuth>
  );
}


