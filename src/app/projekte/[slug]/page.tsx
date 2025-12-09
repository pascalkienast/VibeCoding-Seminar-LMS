"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  image_url: string | null;
  creator_id: string;
  allow_participants: boolean;
  max_participants: number | null;
  external_links: Array<{ label: string; url: string }>;
  created_at: string;
};

type Participant = {
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
  params: Promise<{ slug: string }>;
}

export default function ProjectDetailPage({ params }: Params) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    params.then((p) => {
      setSlug(p.slug);
    });
  }, [params]);

  useEffect(() => {
    if (slug) {
      loadProject();
    }
  }, [slug]);

  const loadProject = async () => {
    const supabase = getSupabaseBrowserClient();

    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id || null;
    setCurrentUserId(userId);

    // Load project
    const { data: projectData } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!projectData) {
      setLoading(false);
      return;
    }

    setProject(projectData);
    setIsCreator(userId === projectData.creator_id);

    // Load participants
    const { data: participantsData } = await supabase
      .from("project_participants")
      .select("*")
      .eq("project_id", projectData.id);

    if (participantsData) {
      // Enrich with usernames and emails
      const enrichedParticipants = await Promise.all(
        participantsData.map(async (p) => {
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
      setParticipants(enrichedParticipants);
      setIsParticipant(participantsData.some((p) => p.user_id === userId));
    }

    // Load comments
    const { data: commentsData } = await supabase
      .from("project_comments")
      .select("*")
      .eq("project_id", projectData.id)
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
    if (!currentUserId || !project) return;

    const supabase = getSupabaseBrowserClient();

    // Check if already at max capacity
    if (
      project.max_participants &&
      participants.length >= project.max_participants
    ) {
      alert("Maximale Teilnehmerzahl erreicht.");
      return;
    }

    const { error } = await supabase.from("project_participants").insert({
      project_id: project.id,
      user_id: currentUserId,
    });

    if (error) {
      alert(`Fehler: ${error.message}`);
    } else {
      loadProject();
    }
  };

  const handleLeave = async () => {
    if (!currentUserId || !project) return;

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("project_participants")
      .delete()
      .eq("project_id", project.id)
      .eq("user_id", currentUserId);

    if (error) {
      alert(`Fehler: ${error.message}`);
    } else {
      loadProject();
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUserId || !project) return;

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("project_comments").insert({
      project_id: project.id,
      author_id: currentUserId,
      body: newComment,
    });

    if (error) {
      alert(`Fehler: ${error.message}`);
    } else {
      setNewComment("");
      loadProject();
    }
  };

  const handleDelete = async () => {
    if (!project || !isCreator) return;
    if (!confirm("Möchtest du dieses Projekt wirklich löschen?")) return;

    const supabase = getSupabaseBrowserClient();

    // Delete image from storage if exists
    if (project.image_url) {
      const fileName = project.image_url.split("/").pop();
      if (fileName) {
        await supabase.storage.from("projects").remove([fileName]);
      }
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    if (error) {
      alert(`Fehler: ${error.message}`);
    } else {
      router.push("/projekte");
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

  if (!project) {
    return (
      <RequireAuth>
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">Projekt nicht gefunden</h1>
          <a href="/projekte" className="btn">
            Zurück zur Übersicht
          </a>
        </div>
      </RequireAuth>
    );
  }

  const canJoin =
    project.allow_participants &&
    !isParticipant &&
    !isCreator &&
    (!project.max_participants || participants.length < project.max_participants);

  return (
    <RequireAuth>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
              <div className="text-sm text-neutral-500 space-x-3">
                <span>📅 Erstellt am {new Date(project.created_at).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric"
                })}</span>
              </div>
            </div>
            {isCreator && (
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/projekte/${project.slug}/bearbeiten`)}
                  className="btn-outline-sm"
                >
                  ✏️ Bearbeiten
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Löschen
                </button>
              </div>
            )}
          </div>

          {project.image_url && (
            <img
              src={project.image_url}
              alt={project.title}
              className="w-full max-h-96 object-cover rounded-lg"
            />
          )}

          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            {project.description}
          </p>
        </div>

        {/* External Links */}
        {project.external_links && project.external_links.length > 0 && (
          <div className="card space-y-2">
            <h3 className="font-medium">Links</h3>
            <div className="flex flex-wrap gap-2">
              {project.external_links.map((link, index) => (
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

        {/* Participants Section */}
        {project.allow_participants && (
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                Teilnehmer ({participants.length}
                {project.max_participants && ` / ${project.max_participants}`})
              </h3>
              {canJoin && (
                <button onClick={handleJoin} className="btn-sm">
                  👋 Mitmachen
                </button>
              )}
              {isParticipant && !isCreator && (
                <button onClick={handleLeave} className="btn-outline-sm">
                  Verlassen
                </button>
              )}
            </div>

            {participants.length > 0 ? (
              <div className="space-y-2">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className={`px-4 py-3 rounded-lg text-sm ${
                      p.user_id === project.creator_id
                        ? "bg-blue-100 dark:bg-blue-900"
                        : "bg-neutral-100 dark:bg-neutral-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-base">
                        {p.email}
                        {p.user_id === project.creator_id && " ⭐"}
                      </span>
                    </div>
                    {p.username && (
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                        {p.username}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                Noch keine Teilnehmer. Sei der Erste!
              </p>
            )}
          </div>
        )}

        {!project.allow_participants && (
          <div className="card">
            <p className="text-amber-600 dark:text-amber-400">
              🔒 Der Ersteller akzeptiert keine weiteren Teilnehmer für dieses Projekt.
            </p>
          </div>
        )}

        {/* Content */}
        <div className="card prose dark:prose-invert max-w-none">
          <ReactMarkdown>{project.content}</ReactMarkdown>
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

