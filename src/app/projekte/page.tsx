"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import Link from "next/link";

type PresentationSlot = {
  id: string;
  presenter_name: string;
  topic: string;
  presentation_date: string;
  group_members: string | null;
  created_at: string;
};

const STORAGE_KEY = "my_presentation_slots";

// Helper functions for localStorage
const getMySlotIds = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addMySlotId = (id: string) => {
  const ids = getMySlotIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
};

const removeMySlotId = (id: string) => {
  const ids = getMySlotIds().filter((i) => i !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

export default function ProjectsPage() {
  const [slots, setSlots] = useState<PresentationSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [mySlotIds, setMySlotIds] = useState<string[]>([]);
  
  // Form state
  const [presenterName, setPresenterName] = useState("");
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState<"2025-01-27" | "2025-02-03">("2025-01-27");
  const [groupMembers, setGroupMembers] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSlots();
    setMySlotIds(getMySlotIds());
  }, []);

  const loadSlots = async () => {
    const supabase = getSupabaseBrowserClient();
    
    const { data: slotsData, error: loadError } = await supabase
      .from("presentation_slots")
      .select("*")
      .order("presentation_date", { ascending: true })
      .order("created_at", { ascending: true });

    if (loadError) {
      console.error("Error loading slots:", loadError);
    }

    setSlots(slotsData || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!presenterName.trim()) {
      setError("Bitte gib deinen Namen ein.");
      setSubmitting(false);
      return;
    }

    if (!topic.trim()) {
      setError("Bitte gib ein Thema ein.");
      setSubmitting(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    const { data: insertedData, error: insertError } = await supabase
      .from("presentation_slots")
      .insert({
        presenter_name: presenterName.trim(),
        topic: topic.trim(),
        presentation_date: date,
        group_members: groupMembers.trim() || null,
      })
      .select()
      .single();

    if (insertError) {
      setError("Fehler beim Eintragen: " + insertError.message);
      setSubmitting(false);
      return;
    }

    // Save to localStorage so user can delete their own entry
    if (insertedData) {
      addMySlotId(insertedData.id);
      setMySlotIds(getMySlotIds());
    }

    // Reset form and reload
    setPresenterName("");
    setTopic("");
    setGroupMembers("");
    setSubmitting(false);
    loadSlots();
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm("Möchtest du diesen Eintrag wirklich löschen?")) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { error: deleteError } = await supabase
      .from("presentation_slots")
      .delete()
      .eq("id", slotId);

    if (deleteError) {
      alert("Fehler beim Löschen: " + deleteError.message);
      return;
    }

    // Remove from localStorage
    removeMySlotId(slotId);
    setMySlotIds(getMySlotIds());

    loadSlots();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("de-DE", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Group slots by date
  const slotsByDate = {
    "2025-01-27": slots.filter((s) => s.presentation_date === "2025-01-27"),
    "2025-02-03": slots.filter((s) => s.presentation_date === "2025-02-03"),
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Vorträge & Projekte</h1>
        <p>Lädt...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Vorträge & Projekte</h1>

      {/* Leistungsschein Info */}
      <div className="card bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800">
        <h2 className="text-xl font-semibold mb-3 text-blue-900 dark:text-blue-100">
          📋 Leistungsschein-Voraussetzung
        </h2>
        <div className="space-y-2 text-blue-900 dark:text-blue-100">
          <p>
            Um einen Leistungsschein zu erhalten, musst du am <strong>27. Januar 2025</strong> oder <strong>3. Februar 2025</strong> einen Vortrag halten.
          </p>
          <p className="font-medium">Du hast zwei Möglichkeiten:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Eigenes Projekt vorstellen</strong> – Erstelle ein neues Projekt in der Übersicht</li>
            <li><strong>Vibe Coding Tool vorstellen</strong> – Wähle ein Tool deiner Wahl!</li>
          </ul>
          <p className="text-sm mt-3 text-blue-700 dark:text-blue-300">
            💡 Tipp: Trage dich unten in der Tabelle ein, um deinen Vortragsslot zu reservieren! (ca. 5-10 Min. pro Person)
          </p>
        </div>
      </div>

      {/* Central Presentation Slots Table */}
      <div className="card bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800">
        <h2 className="text-xl font-semibold mb-4 text-green-900 dark:text-green-100">
          🎤 Vortrags-Eintragung
        </h2>

        {/* Add new slot form */}
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white dark:bg-neutral-800 rounded-lg">
          <h3 className="font-medium mb-3">Neuen Vortrag eintragen</h3>
          {error && (
            <div className="mb-3 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded text-sm">
              {error}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="block text-sm font-medium mb-1">Dein Name *</label>
              <input
                type="text"
                value={presenterName}
                onChange={(e) => setPresenterName(e.target.value)}
                placeholder="z.B. Max Mustermann"
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thema *</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="z.B. Mein Portfolio-Projekt"
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Datum *</label>
              <select
                value={date}
                onChange={(e) => setDate(e.target.value as "2025-01-27" | "2025-02-03")}
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
              >
                <option value="2025-01-27">27. Januar 2025</option>
                <option value="2025-02-03">3. Februar 2025</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weitere Mitglieder</label>
              <input
                type="text"
                value={groupMembers}
                onChange={(e) => setGroupMembers(e.target.value)}
                placeholder="z.B. Lisa, Tom"
                className="w-full px-3 py-2 border rounded-lg dark:bg-neutral-700 dark:border-neutral-600"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn w-full disabled:opacity-50"
              >
                {submitting ? "Wird eingetragen..." : "Eintragen"}
              </button>
            </div>
          </div>
        </form>

        {/* Slots Table */}
        <div className="space-y-6">
          {(["2025-01-27", "2025-02-03"] as const).map((dateKey) => (
            <div key={dateKey}>
              <h3 className="font-semibold text-lg mb-3 text-green-800 dark:text-green-200">
                📅 {formatDate(dateKey)}
              </h3>
              {slotsByDate[dateKey].length === 0 ? (
                <p className="text-sm text-neutral-500 italic">
                  Noch keine Einträge für diesen Tag.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b dark:border-neutral-700">
                        <th className="text-left py-2 px-3 font-medium">#</th>
                        <th className="text-left py-2 px-3 font-medium">Thema</th>
                        <th className="text-left py-2 px-3 font-medium">Präsentator(en)</th>
                        <th className="text-left py-2 px-3 font-medium w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {slotsByDate[dateKey].map((slot, index) => (
                        <tr
                          key={slot.id}
                          className="border-b dark:border-neutral-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                        >
                          <td className="py-2 px-3 text-neutral-500">{index + 1}</td>
                          <td className="py-2 px-3 font-medium">{slot.topic}</td>
                          <td className="py-2 px-3">
                            {slot.presenter_name}
                            {slot.group_members && (
                              <span className="text-neutral-500">
                                , {slot.group_members}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {mySlotIds.includes(slot.id) && (
                              <button
                                onClick={() => handleDelete(slot.id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs"
                              >
                                Löschen
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Link to detailed overview */}
      <div className="text-center">
        <Link
          href="/projekte/uebersicht"
          className="btn inline-flex items-center gap-2"
        >
          📂 Zur detaillierten Seite mit Überblick
        </Link>
      </div>
    </div>
  );
}
