"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import RequireAuth from "@/components/RequireAuth";
import Link from "next/link";

type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string | null;
  creator_id: string;
  allow_participants: boolean;
  max_participants: number | null;
  created_at: string;
  creator_name?: string;
  participant_count?: number;
};

type Tool = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string | null;
  presentation_date: string | null;
  max_presenters: number | null;
  created_at: string;
  presenter_count?: number;
};

export default function ProjectsOverviewPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
    loadTools();
  }, []);

  const loadProjects = async () => {
    const supabase = getSupabaseBrowserClient();
    
    // Load projects
    const { data: projectsData } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (projectsData) {
      // Load creator emails and participant counts
      const enrichedProjects = await Promise.all(
        projectsData.map(async (project) => {
          // Get creator email
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", project.creator_id)
            .single();

          // Get participant count
          const { count } = await supabase
            .from("project_participants")
            .select("*", { count: "exact", head: true })
            .eq("project_id", project.id);

          return {
            ...project,
            creator_name: profile?.email || "Unbekannt",
            participant_count: count || 0,
          };
        })
      );

      setProjects(enrichedProjects);
    }
    setLoading(false);
  };

  const loadTools = async () => {
    const supabase = getSupabaseBrowserClient();
    
    // Load presentation tools
    const { data: toolsData } = await supabase
      .from("presentation_tools")
      .select("*")
      .order("presentation_date", { ascending: true });

    if (toolsData) {
      // Load presenter counts
      const enrichedTools = await Promise.all(
        toolsData.map(async (tool) => {
          // Get presenter count
          const { count } = await supabase
            .from("presentation_tool_presenters")
            .select("*", { count: "exact", head: true })
            .eq("tool_id", tool.id);

          return {
            ...tool,
            presenter_count: count || 0,
          };
        })
      );

      setTools(enrichedTools);
    }
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">Projekte & Tools Übersicht</h1>
          <p>Lädt...</p>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/projekte" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
              ← Zurück zur Vortrags-Eintragung
            </Link>
          </div>
          <Link href="/projekte/neu" className="btn">
            + Neues Projekt
          </Link>
        </div>

        <h1 className="text-2xl font-semibold">Projekte & Tools Übersicht</h1>

        <h2 className="text-xl font-semibold">Projekte</h2>

        {projects.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Noch keine Projekte vorhanden.
            </p>
            <Link href="/projekte/neu" className="btn inline-block">
              Erstes Projekt erstellen
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projekte/${project.slug}`}
                className="card block hover:shadow-lg transition-shadow"
              >
                {project.image_url && (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-48 object-cover rounded-t-lg -m-4 mb-4"
                  />
                )}
                <h2 className="font-semibold text-lg mb-2">{project.title}</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3">
                  {project.description}
                </p>
                <div className="text-xs text-neutral-500 space-y-1">
                  <div>Erstellt von: {project.creator_name}</div>
                  <div>📅 {new Date(project.created_at).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })}</div>
                  {project.allow_participants && (
                    <div className="flex items-center gap-2">
                      <span>👥 {project.participant_count} Teilnehmer</span>
                      {project.max_participants && (
                        <span>
                          (max. {project.max_participants})
                        </span>
                      )}
                    </div>
                  )}
                  {!project.allow_participants && (
                    <div className="text-amber-600 dark:text-amber-400">
                      🔒 Keine weiteren Teilnehmer
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Tools Section */}
        <div className="mt-12 space-y-6">
          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">Vibe Coding Tools Vorstellen</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              Neue Tools können nur vom Admin hinzugefügt werden. Du kannst dich aber als Präsentator eintragen!
            </p>

            {tools.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-neutral-600 dark:text-neutral-400">
                  Noch keine Tools verfügbar. Kontaktiere einen Admin.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/projekte/tool-vortraege/${tool.slug}`}
                    className="card block hover:shadow-lg transition-shadow"
                  >
                    {tool.image_url && (
                      <img
                        src={tool.image_url}
                        alt={tool.title}
                        className="w-full h-48 object-cover rounded-t-lg -m-4 mb-4"
                      />
                    )}
                    <h3 className="font-semibold text-lg mb-2">{tool.title}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3">
                      {tool.description}
                    </p>
                    <div className="text-xs text-neutral-500 space-y-1">
                      {tool.presentation_date && (
                        <div>
                          📅 Vortrag am:{" "}
                          {new Date(tool.presentation_date).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span>
                          👥 {tool.presenter_count} Präsentator
                          {tool.presenter_count !== 1 ? "en" : ""}
                        </span>
                        {tool.max_presenters && (
                          <span>(max. {tool.max_presenters})</span>
                        )}
                      </div>
                      {tool.max_presenters &&
                        (tool.presenter_count || 0) >= tool.max_presenters && (
                          <div className="text-amber-600 dark:text-amber-400">
                            ⚠️ Voll belegt
                          </div>
                        )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
