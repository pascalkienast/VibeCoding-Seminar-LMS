"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "authed" | "guest">("checking");

  useEffect(() => {
    let mounted = true;
    getSupabaseBrowserClient().auth.getUser().then(({ data }) => {
      if (!mounted) return;
      if (data.user) setStatus("authed");
      else setStatus("guest");
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (status === "guest") router.replace("/login");
  }, [status, router]);

  if (status !== "authed") {
    return <div className="container py-8 text-sm text-neutral-500">Lädt…</div>;
  }
  return <>{children}</>;
}


