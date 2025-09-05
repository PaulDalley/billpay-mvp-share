import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/** Server-only Supabase admin client (uses Service Role key). */
function sbAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // admin key; never expose to client

  if (!url || !key) {
    throw new Error(
      `Missing Supabase envs. Have SUPABASE_URL? ${!!url} | SERVICE_ROLE_KEY? ${!!key}`
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id") || "";
    if (!user_id) {
      return NextResponse.json(
        { connected: false, reason: "missing_user_id" },
        { status: 400 }
      );
    }

    const supabase = sbAdmin();

    const { data, error } = await supabase
      .from("oauth_tokens")
      .select("id, expires_at")
      .eq("provider", "microsoft")
      .eq("user_id", user_id)
      .limit(1);

    if (error) {
      console.error("DB error in /api/ms/status:", error);
      return NextResponse.json(
        { connected: false, reason: "db_error" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ connected: false }, { status: 200 });
    }

    return NextResponse.json(
      { connected: true, expires_at: data[0].expires_at },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("Route error /api/ms/status:", e);
    return NextResponse.json(
      { connected: false, reason: "server_error", error: String(e) },
      { status: 500 }
    );
  }
}
