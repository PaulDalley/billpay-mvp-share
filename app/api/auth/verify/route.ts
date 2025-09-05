import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

type Rec = { code: string; expires: number };
const store: Map<string, Rec> = (global as any).__otpStore || new Map();
(global as any).__otpStore = store;

export async function POST(req: NextRequest) {
  const fd = await req.formData();
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const code = String(fd.get("code") || "").trim();
  const rec = store.get(email);
  if (!rec) return NextResponse.json({ ok: false, error: "no code" }, { status: 400 });
  if (Date.now() > rec.expires) { store.delete(email); return NextResponse.json({ ok: false, error: "expired" }, { status: 400 }); }
  if (rec.code !== code) return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  store.delete(email);
  const c = cookies();
  c.set("user_email", email, { httpOnly: false, path: "/" });
  return NextResponse.redirect(new URL("/properties", req.url), { status: 303 });
}
