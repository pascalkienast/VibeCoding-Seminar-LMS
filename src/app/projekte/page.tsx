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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const supabase = getSupabaseBrowserClient();
    
    // Load projects
    const { data: projectsData } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (projectsData) {
      // Load creator names and participant counts
      const enrichedProjects = await Promise.all(
        projectsData.map(async (project) => {
          // Get creator name
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", project.creator_id)
            .single();

          // Get participant count
          const { count } = await supabase
            .from("project_participants")
            .select("*", { count: "exact", head: true })
            .eq("project_id", project.id);

          return {
            ...project,
            creator_name: profile?.username || "Unbekannt",
            participant_count: count || 0,
          };
        })
      );

      setProjects(enrichedProjects);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <RequireAuth>
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">Projekte</h1>
          <p>Lädt...</p>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Projekte</h1>
          <Link href="/projekte/neu" className="btn">
            + Neues Projekt
          </Link>
        </div>

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
      </div>
    </RequireAuth>
  );
}

