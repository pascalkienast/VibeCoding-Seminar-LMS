"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function ShowWhenLoggedOut({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    getSupabaseBrowserClient().auth.getUser().then(({ data }) => {
      setIsAuthed(!!data.user);
    });
  }, []);

  if (isAuthed === null) return null;
  if (isAuthed) return null;
  return <>{children}</>;
}


