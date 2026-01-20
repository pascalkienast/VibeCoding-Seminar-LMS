"use client";
import { useEffect, useState, use } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";
import WysiwygEditor from "@/components/WysiwygEditor";
import FileUpload, { UploadedFile, AttachmentList } from "@/components/FileUpload";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Attachment = {
  id: number;
  file_name: string;
  file_url: string;
  file_type?: string;
};

type Answer = {
  id: number;
  question_id: number;
  parent_answer_id: number | null;
  author_id: string;
  body: string;
  created_at: string;
  author_username?: string;
  author_email?: string;
  attachments: Attachment[];
  replies: Answer[];
};

type Question = {
  id: number;
  title: string;
  body: string;
  author_id: string;
  is_resolved: boolean;
  created_at: string;
  author_username?: string;
  author_email?: string;
  attachments: Attachment[];
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function QuestionDetail({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const questionId = Number(id);

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Reply state
  const [replyingTo, setReplyingTo] = useState<number | null>(null); // null = reply to question, number = reply to answer
  const [replyBody, setReplyBody] = useState("");
  const [replyFiles, setReplyFiles] = useState<UploadedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuestion();
  }, [questionId]);

  const loadQuestion = async () => {
    const supabase = getSupabaseBrowserClient();

    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    setCurrentUserId(userData.user?.id || null);

    // Load question
    const { data: questionData, error: questionError } = await supabase
      .from("qa_questions")
      .select("*")
      .eq("id", questionId)
      .single();

    if (questionError || !questionData) {
      console.error("Error loading question:", questionError);
      setLoading(false);
      return;
    }

    // Get author profile
    const { data: authorProfile } = await supabase
      .from("profiles")
      .select("username, email")
      .eq("id", questionData.author_id)
      .single();

    // Get question attachments
    const { data: questionAttachments } = await supabase
      .from("qa_attachments")
      .select("id, file_name, file_url, file_type")
      .eq("question_id", questionId);

    setQuestion({
      ...questionData,
      author_username: authorProfile?.username || "Unbekannt",
      author_email: authorProfile?.email || "",
      attachments: questionAttachments || [],
    });

    // Load answers
    await loadAnswers();
    setLoading(false);
  };

  const loadAnswers = async () => {
    const supabase = getSupabaseBrowserClient();

    // Get all answers for this question
    const { data: answersData } = await supabase
      .from("qa_answers")
      .select("*")
      .eq("question_id", questionId)
      .order("created_at", { ascending: true });

    if (!answersData) {
      setAnswers([]);
      return;
    }

    // Enrich with author info and attachments
    const enrichedAnswers = await Promise.all(
      answersData.map(async (a) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, email")
          .eq("id", a.author_id)
          .single();

        const { data: attachments } = await supabase
          .from("qa_attachments")
          .select("id, file_name, file_url, file_type")
          .eq("answer_id", a.id);

        return {
          ...a,
          author_username: profile?.username || "Unbekannt",
          author_email: profile?.email || "",
          attachments: attachments || [],
          replies: [] as Answer[],
        };
      })
    );

    // Build threaded structure
    const rootAnswers: Answer[] = [];
    const answerMap = new Map<number, Answer>();

    enrichedAnswers.forEach((a) => answerMap.set(a.id, a));

    enrichedAnswers.forEach((a) => {
      if (a.parent_answer_id === null) {
        rootAnswers.push(a);
      } else {
        const parent = answerMap.get(a.parent_answer_id);
        if (parent) {
          parent.replies.push(a);
        }
      }
    });

    setAnswers(rootAnswers);
  };

  const handleSubmitAnswer = async () => {
    if (!replyBody.trim() || replyBody === "<p></p>") return;

    setSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        alert("Nicht eingeloggt");
        setSubmitting(false);
        return;
      }

      // Create answer
      const { data: answer, error: answerError } = await supabase
        .from("qa_answers")
        .insert({
          question_id: questionId,
          parent_answer_id: replyingTo,
          author_id: userData.user.id,
          body: replyBody,
        })
        .select("id")
        .single();

      if (answerError) {
        throw new Error(answerError.message);
      }

      // Add attachments if any
      if (replyFiles.length > 0 && answer) {
        const attachments = replyFiles.map((f) => ({
          answer_id: answer.id,
          file_name: f.file_name,
          file_url: f.file_url,
          file_type: f.file_type,
          file_size: f.file_size,
          uploaded_by: userData.user.id,
        }));

        await supabase.from("qa_attachments").insert(attachments);
      }

      // Reset form and reload
      setReplyBody("");
      setReplyFiles([]);
      setReplyingTo(null);
      await loadAnswers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Fehler beim Senden");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleResolved = async () => {
    if (!question || currentUserId !== question.author_id) return;

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("qa_questions")
      .update({ is_resolved: !question.is_resolved })
      .eq("id", question.id);

    if (error) {
      alert("Fehler: " + error.message);
    } else {
      setQuestion({ ...question, is_resolved: !question.is_resolved });
    }
  };

  const handleDeleteQuestion = async () => {
    if (!question || currentUserId !== question.author_id) return;
    if (!confirm("Möchtest du diese Frage wirklich löschen?")) return;

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("qa_questions")
      .delete()
      .eq("id", question.id);

    if (error) {
      alert("Fehler: " + error.message);
    } else {
      router.push("/forum");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="text-center py-8 text-neutral-500">Lädt...</div>
      </RequireAuth>
    );
  }

  if (!question) {
    return (
      <RequireAuth>
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">Frage nicht gefunden</h1>
          <Link href="/forum" className="btn">
            Zurück zur Übersicht
          </Link>
        </div>
      </RequireAuth>
    );
  }

  const isAuthor = currentUserId === question.author_id;

  return (
    <RequireAuth>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back link */}
        <Link
          href="/forum"
          className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          ← Zurück zur Übersicht
        </Link>

        {/* Question */}
        <div className="card space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {question.is_resolved && (
                  <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded text-sm">
                    ✓ Gelöst
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold">{question.title}</h1>
            </div>
            {isAuthor && (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handleToggleResolved}
                  className="btn-outline-sm"
                >
                  {question.is_resolved ? "Als offen markieren" : "Als gelöst markieren"}
                </button>
                <button
                  onClick={handleDeleteQuestion}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Löschen
                </button>
              </div>
            )}
          </div>

          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Gefragt von{" "}
            <a
              href={`mailto:${question.author_email}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {question.author_username}
            </a>{" "}
            am {formatDate(question.created_at)}
          </div>

          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: question.body }}
          />

          <AttachmentList 
            files={question.attachments.map(att => ({
              id: att.id.toString(),
              file_name: att.file_name,
              file_url: att.file_url,
              file_type: att.file_type,
            }))} 
          />
        </div>

        {/* Answers Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {answers.length} {answers.length === 1 ? "Antwort" : "Antworten"}
          </h2>

          {answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              currentUserId={currentUserId}
              onReply={(id) => setReplyingTo(id)}
              replyingTo={replyingTo}
              formatDate={formatDate}
              depth={0}
            />
          ))}
        </div>

        {/* Reply Form */}
        <div className="card space-y-4">
          <h3 className="font-medium">
            {replyingTo === null
              ? "Deine Antwort"
              : `Antwort auf Kommentar #${replyingTo}`}
          </h3>

          {replyingTo !== null && (
            <button
              onClick={() => setReplyingTo(null)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Stattdessen auf die Frage antworten
            </button>
          )}

          <WysiwygEditor
            content={replyBody}
            onChange={setReplyBody}
            placeholder="Schreibe deine Antwort..."
            minHeight="120px"
          />

          <FileUpload files={replyFiles} onFilesChange={setReplyFiles} />

          <button
            onClick={handleSubmitAnswer}
            disabled={submitting || !replyBody.trim() || replyBody === "<p></p>"}
            className="btn"
          >
            {submitting ? "Wird gesendet..." : "Antwort senden"}
          </button>
        </div>
      </div>
    </RequireAuth>
  );
}

// Recursive Answer Component
interface AnswerCardProps {
  answer: Answer;
  currentUserId: string | null;
  onReply: (id: number) => void;
  replyingTo: number | null;
  formatDate: (date: string) => string;
  depth: number;
}

function AnswerCard({
  answer,
  currentUserId,
  onReply,
  replyingTo,
  formatDate,
  depth,
}: AnswerCardProps) {
  const [deleting, setDeleting] = useState(false);
  const isAuthor = currentUserId === answer.author_id;
  const maxDepth = 3;

  const handleDelete = async () => {
    if (!confirm("Möchtest du diese Antwort löschen?")) return;
    setDeleting(true);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("qa_answers")
      .delete()
      .eq("id", answer.id);

    if (error) {
      alert("Fehler: " + error.message);
      setDeleting(false);
    } else {
      // Reload page to refresh answers
      window.location.reload();
    }
  };

  return (
    <div
      className={`${depth > 0 ? "ml-6 border-l-2 border-neutral-200 dark:border-neutral-700 pl-4" : ""}`}
    >
      <div
        className={`card space-y-3 ${replyingTo === answer.id ? "ring-2 ring-blue-500" : ""}`}
      >
        <div className="flex items-center justify-between text-sm">
          <span>
            <a
              href={`mailto:${answer.author_email}`}
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {answer.author_username}
            </a>
            <span className="text-neutral-500 dark:text-neutral-400 ml-2">
              {formatDate(answer.created_at)}
            </span>
          </span>
          <div className="flex gap-2">
            {depth < maxDepth && (
              <button
                onClick={() => onReply(answer.id)}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Antworten
              </button>
            )}
            {isAuthor && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                {deleting ? "..." : "Löschen"}
              </button>
            )}
          </div>
        </div>

        <div
          className="prose dark:prose-invert max-w-none text-sm"
          dangerouslySetInnerHTML={{ __html: answer.body }}
        />

        <AttachmentList 
          files={answer.attachments.map(att => ({
            id: att.id.toString(),
            file_name: att.file_name,
            file_url: att.file_url,
            file_type: att.file_type,
          }))} 
        />
      </div>

      {/* Nested Replies */}
      {answer.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {answer.replies.map((reply) => (
            <AnswerCard
              key={reply.id}
              answer={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              replyingTo={replyingTo}
              formatDate={formatDate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}


