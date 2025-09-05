import { NextResponse } from "next/server";
export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    // Supabase
    urlLen: (process.env.SUPABASE_URL || "").length,
    anonLen: (process.env.SUPABASE_ANON_KEY || "").length,
    serviceLen: (process.env.SUPABASE_SERVICE_ROLE_KEY || "").length,

    // Microsoft
    clientIdLen: (process.env.MS_CLIENT_ID || "").length,
    tenantIdLen: (process.env.MS_TENANT_ID || "").length,
    secretLen: (process.env.MS_CLIENT_SECRET || "").length,
    redirect: process.env.MS_REDIRECT_URI || "",

    nodeEnv: process.env.NODE_ENV,
  });
}
