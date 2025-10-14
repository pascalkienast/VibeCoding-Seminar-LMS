"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "authed" | "guest" | "not_admin">("checking");

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!mounted) return;
      if (!user) {
        setStatus("guest");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role === "admin") setStatus("authed");
      else setStatus("not_admin");
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (status === "guest") router.replace("/login");
    if (status === "not_admin") router.replace("/");
  }, [status, router]);

  if (status !== "authed") {
    return <div className="container py-8 text-sm text-neutral-500">Lädt…</div>;
  }
  return <>{children}</>;
}


