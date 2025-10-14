"use client";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type NavbarProps = {
  layout?: "horizontal" | "vertical";
};

export default function Navbar({ layout = "horizontal" }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        setIsAuthed(!!user);
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          setIsAdmin(profile?.role === "admin");
        } else {
          setIsAdmin(false);
        }
      } catch (_) {
        setIsAuthed(false);
        setIsAdmin(false);
      }
    };
    run();
  }, [pathname]);

  // Hide on auth pages
  if (pathname?.startsWith("/login") || pathname?.startsWith("/register")) {
    return null;
  }

  const containerClass =
    layout === "vertical"
      ? "flex flex-col items-stretch gap-2 text-sm"
      : "flex items-center gap-2 text-sm";

  const fillIfVertical = layout === "vertical" ? " w-full" : "";

  if (!isAuthed) {
    return (
      <div className={containerClass}>
        <a className={`btn-sm${fillIfVertical}`} href="/login">Login</a>
        <a className={`btn-outline-sm${fillIfVertical}`} href="/register">Register</a>
      </div>
    );
  }

  const onLogout = async () => {
    await getSupabaseBrowserClient().auth.signOut();
    router.replace("/login");
  };

  return (
    <div className={containerClass}>
      {isAdmin && <a className={`btn-outline-sm${fillIfVertical}`} href="/admin">Admin</a>}
      <a className={`btn-outline-sm${fillIfVertical}`} href="/profile">Profile</a>
      <button className={`btn-sm${fillIfVertical}`} onClick={onLogout}>Logout</button>
    </div>
  );
}


