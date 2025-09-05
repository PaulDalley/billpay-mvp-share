// app/api/ms/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateStr = url.searchParams.get("state") || "{}";
    const { user_id, tenant: stateTenant } = JSON.parse(stateStr);

    // ✅ Prefer MS_AUTH_TENANT for personal accounts, fallback to MS_TENANT_ID, then "common"
    const TENANT = stateTenant || process.env.MS_AUTH_TENANT || process.env.MS_TENANT_ID || "common";

    if (!code || !user_id) {
      return NextResponse.json({ step: "env", error: "missing_params", code, user_id }, { status: 400 });
    }

    if (!process.env.MS_CLIENT_ID || !process.env.MS_CLIENT_SECRET || !process.env.MS_REDIRECT_URI) {
      return NextResponse.json(
        {
          step: "env",
          error: "missing_ms_env",
          MS_CLIENT_ID: !!process.env.MS_CLIENT_ID,
          MS_CLIENT_SECRET: !!process.env.MS_CLIENT_SECRET,
          MS_REDIRECT_URI: !!process.env.MS_REDIRECT_URI,
        },
        { status: 500 }
      );
    }

    // Exchange code for tokens
    const tokenRes = await fetch(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.MS_CLIENT_ID!,
        client_secret: process.env.MS_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code: code!,
        redirect_uri: process.env.MS_REDIRECT_URI!,
        scope: process.env.MS_SCOPES || "offline_access Mail.Read User.Read",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return NextResponse.json({ step: "token", error: tokenData }, { status: 400 });
    }

    // Save tokens in Supabase using service role key (admin write)
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { error: dbErr } = await supabase.from("oauth_tokens").upsert({
      user_id,
      provider: "outlook",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + (tokenData.expires_in ?? 0) * 1000).toISOString(),
    });

    if (dbErr) {
      return NextResponse.json({ step: "db", error: dbErr }, { status: 500 });
    }

    // ✅ Use absolute URL to fix Next.js “middleware-relative-urls” error
    return NextResponse.redirect(new URL("/discover?connected=outlook", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));

  } catch (err: any) {
    return NextResponse.json({ step: "fatal", error: err.message || err }, { status: 500 });
  }
}
