import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function sbAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('missing_supabase_env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

async function refreshIfNeeded(row: any) {
  const exp = new Date(row.expires_at).getTime();
  if (Date.now() < exp - 60_000) return row.access_token;

  if (!row.refresh_token) return row.access_token;

  const res = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MS_CLIENT_ID!,
      client_secret: process.env.MS_CLIENT_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: row.refresh_token,
      redirect_uri: process.env.MS_REDIRECT_URI!,
    }),
  });
  const data = await res.json();
  if (!res.ok) return row.access_token;

  const access_token = data.access_token;
  const expires_at = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString();
  const { error: updErr } = await sbAdmin().from('oauth_tokens').update({ access_token, expires_at }).eq('id', row.id);
  if (updErr) throw new Error('db_update_failed: ' + updErr.message);
  return access_token;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const user_id = url.searchParams.get('user_id') || '';
    if (!user_id) return NextResponse.json({ error: 'missing_user_id' }, { status: 400 });

    const sb = sbAdmin();
    const { data: rows, error } = await sb
      .from('oauth_tokens')
      .select('*')
      .eq('provider', 'microsoft')
      .eq('user_id', user_id)
      .limit(1);

    if (error) return NextResponse.json({ error: 'db_error', details: error }, { status: 500 });
    if (!rows || rows.length === 0) return NextResponse.json({ error: 'not_connected' }, { status: 400 });

    const tokenRow = rows[0];
    const access_token = await refreshIfNeeded(tokenRow);

    const resp = await fetch(
      'https://graph.microsoft.com/v1.0/me/messages?$top=50&$select=subject,from,receivedDateTime,bodyPreview',
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const data = await resp.json();
    if (!resp.ok) return NextResponse.json({ error: 'graph_error', details: data }, { status: 400 });

    const items: any[] = data.value || [];
    const scanned = items.length;

    const text = items.map(i => `${i.subject || ''}\n${i.bodyPreview || ''}`).join('\n');
    const regex = /\b\d{1,4}\s+[A-Za-z][A-Za-z\s.'-]+(?:St|Street|Rd|Road|Ave|Avenue|Parade|Pde|Boulevard|Blvd|Ct|Court|Lane|Ln|Way|Place|Pl|Terrace|Tce)\b.*?(?:NSW|VIC|QLD|SA|WA|TAS|ACT|NT)\b/gi;
    const addresses = Array.from(new Set((text.match(regex) || []).map(s => s.trim()))).slice(0, 20);
    const subjects = items.slice(0, 5).map(i => i.subject || '').filter(Boolean);

    return NextResponse.json({ addresses, scanned, subjects });
  } catch (e: any) {
    return NextResponse.json({ error: 'fatal', details: String(e?.message || e) }, { status: 500 });
  }
}
