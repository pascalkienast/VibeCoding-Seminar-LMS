"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";

type Tool = {
  id: string;
  title: string;
  url: string;
  description: string;
  created_at: string;
  like_count: number;
  user_has_liked: boolean;
};

type Comment = {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
  };
};

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showAddToolForm, setShowAddToolForm] = useState(false);
  const [newTool, setNewTool] = useState({ title: "", url: "", description: "" });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadTools();
    loadUserId();
  }, []);

  const loadUserId = async () => {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    setUserId(data?.user?.id || null);
  };

  const loadTools = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData?.user?.id;

      // Get tools with like counts
      const { data: toolsData, error } = await supabase
        .from("tools")
        .select(`
          id,
          title,
          url,
          description,
          created_at
        `);

      if (error) throw error;

      if (!toolsData) {
        setTools([]);
        setLoading(false);
        return;
      }

      // Get like counts and user likes for each tool
      const toolsWithLikes = await Promise.all(
        toolsData.map(async (tool) => {
          const { count } = await supabase
            .from("tool_likes")
            .select("*", { count: "exact", head: true })
            .eq("tool_id", tool.id);

          let userHasLiked = false;
          if (currentUserId) {
            const { data: likeData } = await supabase
              .from("tool_likes")
              .select("id")
              .eq("tool_id", tool.id)
              .eq("user_id", currentUserId)
              .single();
            userHasLiked = !!likeData;
          }

          return {
            ...tool,
            like_count: count || 0,
            user_has_liked: userHasLiked,
          };
        })
      );

      // Sort by like count
      toolsWithLikes.sort((a, b) => b.like_count - a.like_count);
      setTools(toolsWithLikes);
    } catch (error) {
      console.error("Error loading tools:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (toolId: string, currentlyLiked: boolean) => {
    const supabase = getSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData?.user?.id;

    if (!currentUserId) return;

    try {
      if (currentlyLiked) {
        // Unlike
        await supabase
          .from("tool_likes")
          .delete()
          .eq("tool_id", toolId)
          .eq("user_id", currentUserId);
      } else {
        // Like
        await supabase
          .from("tool_likes")
          .insert({ tool_id: toolId, user_id: currentUserId });
      }
      
      // Reload tools to update counts
      loadTools();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const openCommentsModal = async (tool: Tool) => {
    setSelectedTool(tool);
    setNewComment("");
    
    const supabase = getSupabaseBrowserClient();
    
    // Fetch comments
    const { data: commentsData, error: commentsError } = await supabase
      .from("tool_comments")
      .select("id, comment, created_at, user_id")
      .eq("tool_id", tool.id)
      .order("created_at", { ascending: false });

    if (commentsError) {
      console.error("Error loading comments:", commentsError);
      return;
    }

    if (!commentsData || commentsData.length === 0) {
      setComments([]);
      return;
    }

    // Fetch profiles for all unique user IDs
    const userIds = [...new Set(commentsData.map(c => c.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", userIds);

    // Create a map of user_id to username
    const profileMap = new Map(
      profilesData?.map(p => [p.id, p.username]) || []
    );

    // Combine comments with usernames
    const commentsWithProfiles = commentsData.map(comment => ({
      ...comment,
      profiles: {
        username: profileMap.get(comment.user_id) || "Unbekannt"
      }
    }));

    setComments(commentsWithProfiles);
  };

  const closeCommentsModal = () => {
    setSelectedTool(null);
    setComments([]);
    setNewComment("");
  };

  const submitComment = async () => {
    if (!selectedTool || !newComment.trim()) return;

    setSubmittingComment(true);
    const supabase = getSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData?.user?.id;

    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from("tool_comments")
        .insert({
          tool_id: selectedTool.id,
          user_id: currentUserId,
          comment: newComment.trim(),
        });

      if (error) throw error;

      // Reload comments
      openCommentsModal(selectedTool);
      setNewComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTool.title.trim() || !newTool.url.trim() || !newTool.description.trim()) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData?.user?.id;

    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from("tools")
        .insert({
          title: newTool.title.trim(),
          url: newTool.url.trim(),
          description: newTool.description.trim(),
          created_by: currentUserId,
        });

      if (error) throw error;

      setNewTool({ title: "", url: "", description: "" });
      setShowAddToolForm(false);
      loadTools();
    } catch (error) {
      console.error("Error adding tool:", error);
    }
  };

  return (
    <RequireAuth>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Tools</h1>
          <button
            onClick={() => setShowAddToolForm(!showAddToolForm)}
            className="btn"
          >
            {showAddToolForm ? "Abbrechen" : "Tool hinzufügen"}
          </button>
        </div>

        {showAddToolForm && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Neues Tool hinzufügen</h2>
            <form onSubmit={handleAddTool} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titel</label>
                <input
                  type="text"
                  className="input"
                  value={newTool.title}
                  onChange={(e) => setNewTool({ ...newTool, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <input
                  type="url"
                  className="input"
                  value={newTool.url}
                  onChange={(e) => setNewTool({ ...newTool, url: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Beschreibung</label>
                <textarea
                  className="textarea"
                  value={newTool.description}
                  onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn">
                Tool speichern
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-center py-8">Lädt...</p>
        ) : tools.length === 0 ? (
          <p className="text-center py-8 text-neutral-600 dark:text-neutral-400">
            Keine Tools vorhanden. Sei der Erste und füge ein Tool hinzu!
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <div key={tool.id} className="card flex flex-col">
                <h3 className="text-lg font-semibold mb-2">{tool.title}</h3>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 break-all"
                >
                  {tool.url}
                </a>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 flex-grow">
                  {tool.description}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openCommentsModal(tool)}
                    className="btn-outline flex-1"
                  >
                    Kommentare
                  </button>
                  <button
                    onClick={() => handleLike(tool.id, tool.user_has_liked)}
                    className={`btn-outline flex items-center gap-1 ${
                      tool.user_has_liked ? "bg-red-50 dark:bg-red-950" : ""
                    }`}
                  >
                    <span className={tool.user_has_liked ? "text-red-500" : ""}>❤️</span>
                    <span>{tool.like_count}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comments Modal */}
        {selectedTool && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={closeCommentsModal}
          >
            <div
              className="bg-white dark:bg-neutral-950 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-neutral-200 dark:border-neutral-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedTool.title}</h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Kommentare</p>
                  </div>
                  <button
                    onClick={closeCommentsModal}
                    className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-4">
                  <textarea
                    className="textarea"
                    placeholder="Schreibe einen Kommentar..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button
                    onClick={submitComment}
                    disabled={submittingComment || !newComment.trim()}
                    className="btn mt-2"
                  >
                    {submittingComment ? "Wird gesendet..." : "Kommentar absenden"}
                  </button>
                </div>

                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center py-4">
                      Noch keine Kommentare. Sei der Erste!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="border border-neutral-200 dark:border-neutral-800 rounded-md p-3"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium">
                            {comment.profiles?.username || "Unbekannt"}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {new Date(comment.created_at).toLocaleDateString("de-DE", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{comment.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}

