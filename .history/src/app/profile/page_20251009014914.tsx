"use client";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [about, setAbout] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    getSupabaseBrowserClient().auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
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

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="card space-y-2">
        <div className="text-sm text-neutral-600 dark:text-neutral-400">Email</div>
        <div>{email ?? "—"}</div>
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
    </div>
  );
}


