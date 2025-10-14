"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
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
    const { data } = await supabase
      .from("invite_codes")
      .select("id, label, max_uses, used_count, expires_at, role")
      .order("id", { ascending: false });
    setInvites(data || []);
  };

  useEffect(() => { refresh(); }, []);

  const createInvite = async () => {
    if (!plainCode) return alert("Enter a code to hash");
    const code_hash = bcrypt.hashSync(plainCode, 10);
    const { error } = await supabase.from("invite_codes").insert({
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
      alert("Invite created");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Invites</h1>
      <div className="card space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className="block text-sm mb-1">Plain Code (hashed before save)</label>
            <input className="input" value={plainCode} onChange={(e) => setPlainCode(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Label</label>
            <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Role</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value as any)}>
              <option value="student">student</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Max Uses</label>
            <input className="input" type="number" value={maxUses} onChange={(e) => setMaxUses(Number(e.target.value))} />
          </div>
        </div>
        <button className="btn w-fit" onClick={createInvite}>Create Invite</button>
      </div>

      <div className="grid gap-3">
        {invites.map((i) => (
          <div className="card" key={i.id}>
            <div className="flex items-center justify-between">
              <div className="font-medium">{i.label || `#${i.id}`}</div>
              <div className="text-sm">{i.role}</div>
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {i.used_count}/{i.max_uses ?? 1} uses
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


