"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";

type Invite = {
  id: number;
  label: string | null;
  max_uses: number | null;
  used_count: number | null;
  expires_at: string | null;
  role: "student" | "admin";
};

export default function InvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [label, setLabel] = useState("");
  const [role, setRole] = useState<"student" | "admin">("student");
  const [maxUses, setMaxUses] = useState(1);
  const [plainCode, setPlainCode] = useState("");

  const refresh = async () => {
    const { data } = await getSupabaseBrowserClient()
      .from("invite_codes")
      .select("id, label, max_uses, used_count, expires_at, role")
      .order("id", { ascending: false });
    setInvites(data || []);
  };

  useEffect(() => { refresh(); }, []);

  const createInvite = async () => {
    if (!plainCode) return alert("Bitte einen Code zum Hashen eingeben");
    const code_hash = bcrypt.hashSync(plainCode, 10);
    const { error } = await getSupabaseBrowserClient().from("invite_codes").insert({
      code_hash,
      label,
      role,
      max_uses: maxUses,
    });
    if (error) alert(error.message);
    else {
      setPlainCode("");
      setLabel("");
      await refresh();
      alert("Einladung erstellt");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Einladungen</h1>
      <div className="card space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className="block text-sm mb-1">Klartext-Code (wird vor dem Speichern gehasht)</label>
            <input className="input" value={plainCode} onChange={(e) => setPlainCode(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Bezeichnung</label>
            <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Rolle</label>
            <select
              className="input"
              value={role}
              onChange={(e) => setRole((e.target.value as "student" | "admin"))}
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Max. Nutzungen</label>
            <input className="input" type="number" value={maxUses} onChange={(e) => setMaxUses(Number(e.target.value))} />
          </div>
        </div>
        <button className="btn w-fit" onClick={createInvite}>Einladung erstellen</button>
      </div>

      <div className="grid gap-3">
        {invites.map((i) => (
          <div className="card" key={i.id}>
            <div className="flex items-center justify-between">
              <div className="font-medium">{i.label || `#${i.id}`}</div>
              <div className="text-sm">{i.role === "admin" ? "Admin" : "Student"}</div>
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {i.used_count}/{i.max_uses ?? 1} Nutzungen
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


