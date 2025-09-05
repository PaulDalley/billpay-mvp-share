import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const sb = createClient(url, anon, { auth: { persistSession: false } });

    const { data, error } = await sb.from('mock_email_properties').select('id').limit(1);
    return NextResponse.json({ ok: !error, error, sample: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, thrown: e?.message || String(e) }, { status: 500 });
  }
}
