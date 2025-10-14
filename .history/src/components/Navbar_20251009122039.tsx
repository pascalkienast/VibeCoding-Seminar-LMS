"use client";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState<boolean>(false);

  useEffect(() => {
    getSupabaseBrowserClient()
      .auth.getUser()
      .then(({ data }) => setIsAuthed(!!data.user))
      .catch(() => setIsAuthed(false));
  }, [pathname]);

  // Hide on auth pages
  if (pathname?.startsWith("/login") || pathname?.startsWith("/register")) {
    return null;
  }

  if (!isAuthed) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <a className="btn-sm" href="/login">Login</a>
        <a className="btn-outline-sm" href="/register">Register</a>
      </div>
    );
  }

  const onLogout = async () => {
    await getSupabaseBrowserClient().auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <a className="btn-outline-sm" href="/profile">Profile</a>
      <button className="btn-sm" onClick={onLogout}>Logout</button>
    </div>
  );
}


