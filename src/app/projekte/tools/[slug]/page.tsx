"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Tool = {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  image_url: string | null;
  external_links: Array<{ label: string; url: string }>;
  presentation_date: string | null;
  max_presenters: number | null;
  created_at: string;
};

type Presenter = {
  id: string;
  user_id: string;
  joined_at: string;
  username?: string;
  email?: string;
};

type Comment = {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
  author_name?: string;
};

interface Params {
  params: { slug: string };
}

export default function ToolDetailPage({ params }: Params) {
  const router = useRouter();
  const [tool, setTool] = useState<Tool | null>(null);
  const [presenters, setPresenters] = useState<Presenter[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isPresenter, setIsPresenter] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTool();
  }, [params.slug]);

  const loadTool = async () => {
    const supabase = getSupabaseBrowserClient();

    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id || null;
    setCurrentUserId(userId);

    // Load tool
    const { data: toolData } = await supabase
      .from("tools")
      .select("*")
      .eq("slug", params.slug)
      .single();

    if (!toolData) {
      setLoading(false);
      return;
    }

    setTool(toolData);

    // Load presenters
    const { data: presentersData } = await supabase
      .from("tool_presenters")
      .select("*")
      .eq("tool_id", toolData.id)
      .order("joined_at", { ascending: true });

    if (presentersData) {
      // Enrich with usernames and emails
      const enrichedPresenters = await Promise.all(
        presentersData.map(async (p) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, email")
            .eq("id", p.user_id)
            .single();
          return { 
            ...p, 
            username: profile?.username || "Unbekannt",
            email: profile?.email || ""
          };
        })
      );
      setPresenters(enrichedPresenters);
      setIsPresenter(presentersData.some((p) => p.user_id === userId));
    }

    // Load comments
    const { data: commentsData } = await supabase
      .from("tool_comments")
      .select("*")
      .eq("tool_id", toolData.id)
      .order("created_at", { ascending: true });

    if (commentsData) {
      // Enrich with author names
      const enrichedComments = await Promise.all(
        commentsData.map(async (c) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", c.author_id)
            .single();
          return { ...c, author_name: profile?.username || "Unbekannt" };
        })
      );
      setComments(enrichedComments);
    }

    setLoading(false);
  };

  const handleJoin = async () => {
    if (!currentUserId || !tool) return;

    const supabase = getSupabaseBrowserClient();

    // Check if already at max capacity
    if (
      tool.max_presenters &&
      presenters.length >= tool.max_presenters
    ) {
      alert("Maximale Präsentatoren-Anzahl erreicht.");
      return;
    }

    const { error } = await supabase.from("tool_presenters").insert({
      tool_id: tool.id,
      user_id: currentUserId,
    });

    if (error) {
      alert(`Fehler: ${error.message}`);
    } else {
      loadTool();
    }
  };

  const handleLeave = async () => {
    if (!currentUserId || !tool) return;

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("tool_presenters")
      .delete()
      .eq("tool_id", tool.id)
      .eq("user_id", currentUserId);

    if (error) {
      alert(`Fehler: ${error.message}`);
    } else {
      loadTool();
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUserId || !tool) return;

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("tool_comments").insert({
      tool_id: tool.id,
      author_id: currentUserId,
      body: newComment,
    });

    if (error) {
      alert(`Fehler: ${error.message}`);
    } else {
      setNewComment("");
      loadTool();
    }
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="space-y-4">
          <p>Lädt...</p>
        </div>
      </RequireAuth>
    );
  }

  if (!tool) {
    return (
      <RequireAuth>
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">Tool nicht gefunden</h1>
          <Link href="/projekte" className="btn">
            Zurück zur Übersicht
          </Link>
        </div>
      </RequireAuth>
    );
  }

  const canJoin =
    !isPresenter &&
    (!tool.max_presenters || presenters.length < tool.max_presenters);

  return (
    <RequireAuth>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link
          href="/projekte"
          className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          ← Zurück zu Projekte & Tools
        </Link>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="inline-block px-3 py-1 mb-3 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                🛠️ Vibe Coding Tool
              </div>
              <h1 className="text-3xl font-bold mb-2">{tool.title}</h1>
              <div className="text-sm text-neutral-500 space-x-3">
                {tool.presentation_date && (
                  <span>
                    📅 Vortrag am:{" "}
                    {new Date(tool.presentation_date).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })} Uhr
                  </span>
                )}
              </div>
            </div>
          </div>

          {tool.image_url && (
            <img
              src={tool.image_url}
              alt={tool.title}
              className="w-full max-h-96 object-cover rounded-lg"
            />
          )}

          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            {tool.description}
          </p>
        </div>

        {/* External Links */}
        {tool.external_links && tool.external_links.length > 0 && (
          <div className="card space-y-2">
            <h3 className="font-medium">Links</h3>
            <div className="flex flex-wrap gap-2">
              {tool.external_links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-sm"
                >
                  🔗 {link.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Presenters Section */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">
              Präsentatoren ({presenters.length}
              {tool.max_presenters && ` / ${tool.max_presenters}`})
            </h3>
            {canJoin && (
              <button onClick={handleJoin} className="btn-sm">
                👋 Als Präsentator eintragen
              </button>
            )}
            {isPresenter && (
              <button onClick={handleLeave} className="btn-outline-sm">
                Austragen
              </button>
            )}
          </div>

          {presenters.length > 0 ? (
            <div className="space-y-2">
              {presenters.map((p, index) => (
                <div
                  key={p.id}
                  className="px-4 py-2 rounded-lg text-sm flex items-center justify-between bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800"
                >
                  <div>
                    <span className="font-medium">{p.username}</span>
                    {index === 0 && " 🥇"}
                    {index === 1 && " 🥈"}
                    {index === 2 && " 🥉"}
                  </div>
                  {p.email && (
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                      {p.email}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              Noch keine Präsentatoren eingetragen. Sei der Erste!
            </p>
          )}
        </div>

        {/* Info Box */}
        <div className="card bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            💡 <strong>Hinweis:</strong> Dieses Tool kann nur von Admins hinzugefügt werden. 
            Du kannst dich aber selbstständig als Präsentator eintragen und das Tool im Kurs vorstellen!
          </p>
        </div>

        {/* Content */}
        <div className="card prose dark:prose-invert max-w-none">
          <ReactMarkdown>{tool.content}</ReactMarkdown>
        </div>

        {/* Comments Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Kommentare ({comments.length})
          </h2>

          {comments.map((comment) => (
            <div key={comment.id} className="card space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{comment.author_name}</span>
                <span className="text-neutral-500">
                  {new Date(comment.created_at).toLocaleString("de-DE")}
                </span>
              </div>
              <div className="prose dark:prose-invert text-sm">
                <ReactMarkdown>{comment.body}</ReactMarkdown>
              </div>
            </div>
          ))}

          {/* Add Comment */}
          <div className="card space-y-2">
            <label className="block text-sm font-medium">
              Kommentar hinzufügen
            </label>
            <textarea
              className="textarea"
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Dein Kommentar..."
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="btn w-fit"
            >
              Kommentar senden
            </button>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

