"use client";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [about, setAbout] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    getSupabaseBrowserClient()
      .auth
      .getUser()
      .then(async ({ data }) => {
        const user = data.user;
        setEmail(user?.email ?? null);
        if (user) {
          const { data: profile } = await getSupabaseBrowserClient()
            .from("profiles")
            .select("username, about")
            .eq("id", user.id)
            .single();
          setUsername(profile?.username ?? null);
          setAbout(profile?.about ?? "");
        }
      });
  }, []);

  const onSaveAbout = async () => {
    const { data: session } = await getSupabaseBrowserClient().auth.getUser();
    if (!session.user) return alert("Login required");
    const { error } = await getSupabaseBrowserClient()
      .from("profiles")
      .update({ about })
      .eq("id", session.user.id);
    if (error) alert(error.message);
    else alert("Saved");
  };

  const onChangePassword = async () => {
    const { error } = await getSupabaseBrowserClient().auth.updateUser({ password });
    if (error) alert(error.message);
    else alert("Password updated");
  };

  const onLogout = async () => {
    await getSupabaseBrowserClient().auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="card space-y-2">
        <div className="text-sm text-neutral-600 dark:text-neutral-400">Email</div>
        <div>{email ?? "—"}</div>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">Username</div>
        <div>{username ?? "—"}</div>
      </div>
      <div className="card space-y-2">
        <label className="block text-sm">About</label>
        <textarea className="textarea" value={about} onChange={(e) => setAbout(e.target.value)} />
        <button className="btn w-fit" onClick={onSaveAbout}>Save</button>
      </div>
      <div className="card space-y-2">
        <label className="block text-sm">Change Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn w-fit" onClick={onChangePassword}>Update Password</button>
      </div>
      <div>
        <button className="btn-outline" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}


