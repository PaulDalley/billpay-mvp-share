import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { loadEnvConfig } from '@next/env';

export const runtime = 'nodejs';

function truthy(v?: string) { return !!(v && v.length > 0); }

export async function GET() {
  const cwd = process.cwd();
  const envPath = path.join(cwd, '.env.local');
  const exists = fs.existsSync(envPath);

  // Snapshot BEFORE
  const before = {
    MS_CLIENT_ID_present: truthy(process.env.MS_CLIENT_ID),
    MS_REDIRECT_URI_present: truthy(process.env.MS_REDIRECT_URI),
    SUPABASE_SERVICE_ROLE_KEY_present: truthy(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  // Try to load .env.local explicitly (helpful if Next didn't load it)
  try {
    loadEnvConfig(cwd);
  } catch {}

  // Snapshot AFTER
  const after = {
    MS_CLIENT_ID_present: truthy(process.env.MS_CLIENT_ID),
    MS_REDIRECT_URI_present: truthy(process.env.MS_REDIRECT_URI),
    SUPABASE_SERVICE_ROLE_KEY_present: truthy(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  return NextResponse.json({
    cwd,
    envFileFoundAtCwd: exists,
    envFilePath: envPath,
    before,
    after,
    // Safe to show (not secrets)
    MS_CLIENT_ID: process.env.MS_CLIENT_ID || null,
    MS_REDIRECT_URI: process.env.MS_REDIRECT_URI || null,
  });
}
