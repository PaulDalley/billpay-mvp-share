import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const user_id = url.searchParams.get('user_id') || '';
    if (!user_id) return NextResponse.json({ ok: false, error: 'missing_user_id' }, { status: 400 });

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data, error } = await sb
      .from('oauth_tokens')
      .select('id, provider, user_id, expires_at')
      .eq('provider', 'microsoft')
      .eq('user_id', user_id)
      .limit(1);

    return NextResponse.json({ ok: !error, error, rows: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, thrown: e?.message || String(e) }, { status: 500 });
  }
}
