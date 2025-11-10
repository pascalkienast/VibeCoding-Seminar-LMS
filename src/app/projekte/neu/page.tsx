"use client";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";
import { useRouter } from "next/navigation";

type ExternalLink = {
  label: string;
  url: string;
};

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [allowParticipants, setAllowParticipants] = useState(true);
  const [maxParticipants, setMaxParticipants] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addLink = () => {
    if (newLinkLabel.trim() && newLinkUrl.trim()) {
      setExternalLinks([...externalLinks, { label: newLinkLabel, url: newLinkUrl }]);
      setNewLinkLabel("");
      setNewLinkUrl("");
    }
  };

  const removeLink = (index: number) => {
    setExternalLinks(externalLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !content.trim()) {
      alert("Bitte fülle alle Pflichtfelder aus.");
      return;
    }

    setSubmitting(true);
    const supabase = getSupabaseBrowserClient();

    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        alert("Nicht eingeloggt");
        return;
      }

      // Generate slug
      const { data: slugData, error: slugError } = await supabase.rpc(
        "generate_project_slug",
        { title }
      );

      if (slugError) throw slugError;
      const slug = slugData as string;

      // Upload image if provided
      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${slug}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("projects")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("projects")
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      // Create project
      const { error: insertError } = await supabase.from("projects").insert({
        creator_id: userData.user.id,
        title,
        slug,
        description,
        content,
        image_url: imageUrl,
        external_links: externalLinks,
        allow_participants: allowParticipants,
        max_participants: maxParticipants ? parseInt(maxParticipants) : null,
      });

      if (insertError) throw insertError;

      // Redirect to project page
      router.push(`/projekte/${slug}`);
    } catch (error: any) {
      alert(`Fehler: ${error.message}`);
      setSubmitting(false);
    }
  };

  return (
    <RequireAuth>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Neues Projekt erstellen</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="card space-y-2">
            <label className="block text-sm font-medium">
              Titel <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. KI-gestützter Lernassistent"
              required
            />
          </div>

          {/* Description */}
          <div className="card space-y-2">
            <label className="block text-sm font-medium">
              Kurzbeschreibung <span className="text-red-500">*</span>
            </label>
            <textarea
              className="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Eine kurze Zusammenfassung des Projekts (wird in der Übersicht angezeigt)"
              required
            />
          </div>

          {/* Content */}
          <div className="card space-y-2">
            <label className="block text-sm font-medium">
              Ausführliche Beschreibung <span className="text-red-500">*</span>
            </label>
            <textarea
              className="textarea"
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detaillierte Projektbeschreibung mit allen wichtigen Informationen..."
              required
            />
            <p className="text-xs text-neutral-500">
              Markdown wird unterstützt
            </p>
          </div>

          {/* Image Upload */}
          <div className="card space-y-2">
            <label className="block text-sm font-medium">Projektbild</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-neutral-100 dark:file:bg-neutral-800 file:text-neutral-700 dark:file:text-neutral-300 hover:file:bg-neutral-200 dark:hover:file:bg-neutral-700"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Vorschau"
                className="mt-2 max-h-48 rounded-lg"
              />
            )}
          </div>

          {/* External Links */}
          <div className="card space-y-3">
            <label className="block text-sm font-medium">Externe Links</label>
            {externalLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
                <span className="flex-1 text-sm">
                  <strong>{link.label}:</strong> {link.url}
                </span>
                <button
                  type="button"
                  onClick={() => removeLink(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Entfernen
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1"
                placeholder="Link-Bezeichnung (z.B. GitHub)"
                value={newLinkLabel}
                onChange={(e) => setNewLinkLabel(e.target.value)}
              />
              <input
                type="url"
                className="input flex-1"
                placeholder="https://..."
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
              />
              <button
                type="button"
                onClick={addLink}
                className="btn-outline"
              >
                + Hinzufügen
              </button>
            </div>
          </div>

          {/* Participation Settings */}
          <div className="card space-y-4">
            <label className="block text-sm font-medium">Teilnahmeeinstellungen</label>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowParticipants"
                checked={allowParticipants}
                onChange={(e) => setAllowParticipants(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="allowParticipants" className="text-sm">
                Andere Nutzer dürfen mitmachen
              </label>
            </div>

            {allowParticipants && (
              <div className="space-y-2">
                <label className="block text-sm">
                  Maximale Teilnehmerzahl (optional)
                </label>
                <input
                  type="number"
                  min="1"
                  className="input w-32"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  placeholder="Unbegrenzt"
                />
                <p className="text-xs text-neutral-500">
                  Leer lassen für unbegrenzte Teilnehmerzahl
                </p>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn"
            >
              {submitting ? "Wird erstellt..." : "Projekt erstellen"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-outline"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </RequireAuth>
  );
}

