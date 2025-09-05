// app/api/ms/start/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const user_id = url.searchParams.get("user_id") || "";
    if (!user_id) {
      return NextResponse.json({ ok: false, reason: "missing_user_id" }, { status: 400 });
    }

    // Prefer MS_AUTH_TENANT for personal accounts; fallback to MS_TENANT_ID; final fallback "common"
    const tenant = process.env.MS_AUTH_TENANT || process.env.MS_TENANT_ID || "common";
    const clientId = process.env.MS_CLIENT_ID;
    const redirectUri = process.env.MS_REDIRECT_URI;
    const scopes = process.env.MS_SCOPES || "offline_access Mail.Read User.Read";

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        {
          ok: false,
          reason: "missing_ms_env",
          MS_CLIENT_ID: !!clientId,
          MS_REDIRECT_URI: !!redirectUri,
        },
        { status: 500 }
      );
    }

    const authorize = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`;

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      response_mode: "query",
      scope: scopes,
      state: JSON.stringify({ user_id, tenant }),
    });

    // Use absolute URL for reliability (works in middleware/edge contexts too)
    return NextResponse.redirect(new URL(`${authorize}?${params.toString()}`));
  } catch (e: any) {
    return NextResponse.json({ ok: false, reason: "server_error", error: String(e) }, { status: 500 });
  }
}
