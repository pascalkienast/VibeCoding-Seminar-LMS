import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const RequestSchema = z.object({
  inviteCode: z.string().min(4),
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = RequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { inviteCode, email, username, password, confirmPassword } = parsed.data;
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords must match" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // Step 1: Verify invite code
  const codeHash = bcrypt.hashSync(inviteCode, 10);
  // To avoid revealing timing data, we compare via SQL equality on pre-hashed columns.
  // Here we assume a stored hash that matches bcrypt.hashSync with same cost.
  const { data: invite, error: inviteErr } = await admin
    .from("invite_codes")
    .select("id, role, max_uses, used_count, expires_at")
    .eq("code_hash", codeHash)
    .single();

  if (inviteErr || !invite) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
  }
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 400 });
  }
  if (invite.used_count >= invite.max_uses) {
    return NextResponse.json({ error: "Invite exhausted" }, { status: 400 });
  }

  // Step 2: Create user via Admin API
  const { data: userRes, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr || !userRes?.user) {
    return NextResponse.json({ error: createErr?.message || "Failed to create user" }, { status: 500 });
  }

  const userId = userRes.user.id;

  // Step 3: Create profile
  const { error: profileErr } = await admin.from("profiles").insert({
    id: userId,
    username,
    role: invite.role,
  });
  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 500 });
  }

  // Step 4: Increment usage
  const { error: incErr } = await admin
    .from("invite_codes")
    .update({ used_count: invite.used_count + 1 })
    .eq("id", invite.id);
  if (incErr) {
    return NextResponse.json({ error: incErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}


