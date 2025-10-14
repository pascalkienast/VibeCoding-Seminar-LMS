import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const RequestSchema = z.object({
  inviteCode: z.string().min(3),
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
  // Fetch invite hashes and compare using bcrypt to support salted hashes
  const { data: invites, error: invitesErr } = await admin
    .from("invite_codes")
    .select("id, role, max_uses, used_count, expires_at, code_hash")
    .limit(1000);

  if (invitesErr || !invites || invites.length === 0) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
  }
  const invite = invites.find((i: any) => bcrypt.compareSync(inviteCode, i.code_hash));
  if (!invite) {
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


