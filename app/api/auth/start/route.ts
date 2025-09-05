import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendLoginCode } from "@/lib/server/mailer";

type Rec = { code: string; expires: number };
const store: Map<string, Rec> = (global as any).__otpStore || new Map();
(global as any).__otpStore = store;

export async function POST(req: NextRequest) {
  const fd = await req.formData();
  const email = String(fd.get("email") || "").trim().toLowerCase();
  if (!email) return NextResponse.json({ ok: false, error: "email required" }, { status: 400 });
  const code = String(Math.floor(100000 + Math.random() * 900000));
  store.set(email, { code, expires: Date.now() + 10 * 60 * 1000 });
  const c = cookies();
  c.set("auth_email", email, { httpOnly: false, path: "/" });
  try {
    await sendLoginCode(email, code);
    console.log("[mailer] sent", email, code);
  } catch (e: any) {
    console.log("[mailer] failed", e?.message || String(e), "code", code, "email", email);
  }
  return NextResponse.redirect(new URL("/sign-in?step=verify&sent=1", req.url), { status: 303 });
}
