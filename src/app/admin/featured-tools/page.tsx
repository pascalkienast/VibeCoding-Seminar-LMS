"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import RequireAdmin from "@/components/RequireAdmin";

type FeaturedTool = {
  id: number;
  title: string;
  description: string;
  long_description: string | null;
  youtube_url: string | null;
  links: Array<{ label: string; url: string }>;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export default function AdminFeaturedToolsPage() {
  const [tools, setTools] = useState<FeaturedTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTool, setEditingTool] = useState<FeaturedTool | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    long_description: "",
    youtube_url: "",
    links: [{ label: "", url: "" }],
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("featured_tools")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error loading featured tools:", error);
    } else {
      setTools(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (tool: FeaturedTool) => {
    setEditingTool(tool);
    setFormData({
      title: tool.title,
      description: tool.description,
      long_description: tool.long_description || "",
      youtube_url: tool.youtube_url || "",
      links: tool.links.length > 0 ? tool.links : [{ label: "", url: "" }],
      sort_order: tool.sort_order,
      is_active: tool.is_active,
    });
    setIsCreating(false);
    setImageFile(null);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingTool(null);
    setFormData({
      title: "",
      description: "",
      long_description: "",
      youtube_url: "",
      links: [{ label: "", url: "" }],
      sort_order: 0,
      is_active: true,
    });
    setImageFile(null);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTool(null);
    setImageFile(null);
  };

  const handleAddLink = () => {
    setFormData({
      ...formData,
      links: [...formData.links, { label: "", url: "" }],
    });
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = formData.links.filter((_, i) => i !== index);
    setFormData({ ...formData, links: newLinks });
  };

  const handleLinkChange = (index: number, field: "label" | "url", value: string) => {
    const newLinks = [...formData.links];
    newLinks[index][field] = value;
    setFormData({ ...formData, links: newLinks });
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setUploading(true);
    const supabase = getSupabaseBrowserClient();
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from("featured-tools")
      .upload(filePath, imageFile);

    setUploading(false);

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      alert("Fehler beim Hochladen des Bildes");
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("featured-tools")
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Bitte Titel und Beschreibung ausfüllen");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();

    // Filter out empty links
    const validLinks = formData.links.filter(
      (link) => link.label.trim() && link.url.trim()
    );

    let imageUrl = editingTool?.image_url || null;
    if (imageFile) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      long_description: formData.long_description.trim() || null,
      youtube_url: formData.youtube_url.trim() || null,
      links: validLinks,
      image_url: imageUrl,
      sort_order: formData.sort_order,
      is_active: formData.is_active,
      created_by: userData?.user?.id,
    };

    if (editingTool) {
      // Update
      const { error } = await supabase
        .from("featured_tools")
        .update(payload)
        .eq("id", editingTool.id);

      if (error) {
        console.error("Error updating featured tool:", error);
        alert("Fehler beim Aktualisieren");
      } else {
        alert("Featured Tool aktualisiert");
        handleCancel();
        loadTools();
      }
    } else {
      // Create
      const { error } = await supabase.from("featured_tools").insert(payload);

      if (error) {
        console.error("Error creating featured tool:", error);
        alert("Fehler beim Erstellen");
      } else {
        alert("Featured Tool erstellt");
        handleCancel();
        loadTools();
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Wirklich löschen?")) return;

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("featured_tools").delete().eq("id", id);

    if (error) {
      console.error("Error deleting featured tool:", error);
      alert("Fehler beim Löschen");
    } else {
      alert("Featured Tool gelöscht");
      loadTools();
    }
  };

  const handleToggleActive = async (tool: FeaturedTool) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("featured_tools")
      .update({ is_active: !tool.is_active })
      .eq("id", tool.id);

    if (error) {
      console.error("Error toggling active status:", error);
      alert("Fehler beim Aktualisieren");
    } else {
      loadTools();
    }
  };

  return (
    <RequireAdmin>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Featured Tools verwalten</h1>
          {!isCreating && !editingTool && (
            <button onClick={handleCreate} className="btn">
              Neues Featured Tool
            </button>
          )}
        </div>

        {/* Form */}
        {(isCreating || editingTool) && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">
              {editingTool ? "Featured Tool bearbeiten" : "Neues Featured Tool erstellen"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Titel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Kurzbeschreibung <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="textarea"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Lange Beschreibung</label>
                <textarea
                  className="textarea"
                  rows={4}
                  value={formData.long_description}
                  onChange={(e) =>
                    setFormData({ ...formData, long_description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Bild
                  {editingTool?.image_url && (
                    <span className="text-xs text-neutral-500 ml-2">(aktuell vorhanden)</span>
                  )}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="input"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                {editingTool?.image_url && (
                  <img
                    src={editingTool.image_url}
                    alt="Current"
                    className="mt-2 h-32 object-cover rounded"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">YouTube URL</label>
                <input
                  type="text"
                  className="input"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Links</label>
                {formData.links.map((link, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder="Link-Text"
                      value={link.label}
                      onChange={(e) => handleLinkChange(idx, "label", e.target.value)}
                    />
                    <input
                      type="url"
                      className="input flex-1"
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => handleLinkChange(idx, "url", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      className="btn-outline"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" onClick={handleAddLink} className="btn-outline text-sm">
                  + Link hinzufügen
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sortierung</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 mt-7">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <span className="text-sm font-medium">Aktiv</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn" disabled={uploading}>
                  {uploading ? "Lädt hoch..." : editingTool ? "Aktualisieren" : "Erstellen"}
                </button>
                <button type="button" onClick={handleCancel} className="btn-outline">
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        {loading ? (
          <p className="text-center py-8">Lädt...</p>
        ) : tools.length === 0 ? (
          <p className="text-center py-8 text-neutral-600 dark:text-neutral-400">
            Keine Featured Tools vorhanden.
          </p>
        ) : (
          <div className="space-y-4">
            {tools.map((tool) => (
              <div key={tool.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{tool.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          tool.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        }`}
                      >
                        {tool.is_active ? "Aktiv" : "Inaktiv"}
                      </span>
                      <span className="text-xs text-neutral-500">Sortierung: {tool.sort_order}</span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {tool.description}
                    </p>
                    {tool.image_url && (
                      <img
                        src={tool.image_url}
                        alt={tool.title}
                        className="mt-2 h-24 object-cover rounded"
                      />
                    )}
                    {tool.links.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {tool.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {link.label} →
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(tool)}
                      className="btn-outline text-sm"
                    >
                      {tool.is_active ? "Deaktivieren" : "Aktivieren"}
                    </button>
                    <button onClick={() => handleEdit(tool)} className="btn-outline text-sm">
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => handleDelete(tool.id)}
                      className="btn-outline text-sm text-red-600 dark:text-red-400"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireAdmin>
  );
}

