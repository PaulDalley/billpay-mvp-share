'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Property = { id: string; user_id: string; address: string; created_at: string };
type Suggestion = { id: string; address: string; selected: boolean; source: 'outlook' | 'table' };

export default function Discover() {
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [connected, setConnected] = useState<null | { connected: boolean; expires_at?: string }>(null);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [manualAddress, setManualAddress] = useState('');
  const [existingProps, setExistingProps] = useState<Property[]>([]);

  const [loading, setLoading] = useState(true);
  const [finding, setFinding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setErrorMsg(null); setInfoMsg(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) { window.location.href = '/sign-in'; return; }
      setEmail(session.user.email || ''); setUserId(session.user.id);

      const { data: props, error } = await supabase
        .from('properties').select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (error) setErrorMsg(error.message);
      setExistingProps((props as Property[]) || []);

      // Check Outlook connection
      try {
        const res = await fetch(`/api/ms/status?user_id=${encodeURIComponent(session.user.id)}`);
        const json = await res.json();
        setConnected(json);
      } catch {
        setConnected({ connected: false });
      }

      // If just connected, auto-import once
      const params = new URLSearchParams(window.location.search);
      if (params.get('connected') === 'outlook') {
        await importFromOutlook(session.user.id);
      }

      setLoading(false);
    })();
  }, []);

  const existingSet = useMemo(
    () => new Set(existingProps.map(p => p.address.trim().toLowerCase())),
    [existingProps]
  );

  function addSuggestions(list: string[], source: 'outlook' | 'table') {
    const clean = list
      .map(a => (a || '').trim())
      .filter(Boolean)
      .filter(a => !existingSet.has(a.toLowerCase()));
    const newOnes = clean.map((addr, i) => ({ id: `${source}-${addr}-${i}`, address: addr, selected: true, source }));
    setSuggestions(prev => {
      const seen = new Set(prev.map(p => p.address.toLowerCase()));
      const merged = [...prev];
      for (const s of newOnes) if (!seen.has(s.address.toLowerCase())) merged.push(s);
      return merged;
    });
  }

  async function connectOutlook() {
    if (!userId) return;
    window.location.href = `/api/ms/start?user_id=${encodeURIComponent(userId)}`;
  }

  async function importFromOutlook(uid: string) {
    setErrorMsg(null); setInfoMsg(null); setImporting(true);
    try {
      const res = await fetch(`/api/ms/import?user_id=${encodeURIComponent(uid)}`);
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json?.error || 'Import failed.');
        setImporting(false);
        return;
      }
      const { addresses = [], scanned = 0 } = json;
      if (addresses.length === 0) {
        setInfoMsg(`Scanned ${scanned} emails. Found 0 address-like lines.`);
      } else {
        setInfoMsg(`Imported ${addresses.length} from ${scanned} emails.`);
      }
      addSuggestions(addresses, 'outlook');
    } catch (e: any) {
      setErrorMsg(e?.message || 'Import error');
    } finally {
      setImporting(false);
    }
  }

  // Table-based “Find addresses”
  async function onFind(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null); setInfoMsg(null); setFinding(true);
    try {
      // exact match first
      let q = supabase.from('mock_email_properties').select('address').eq('email', email);
      let { data, error } = await q;
      if (error) throw error;

      // if nothing, try lowercased fallback (in case table was seeded lowercased)
      if ((!data || data.length === 0) && email) {
        const { data: d2, error: e2 } = await supabase
          .from('mock_email_properties')
          .select('address')
          .eq('email', email.toLowerCase());
        if (e2) throw e2;
        data = d2 ?? [];
      }

      const addrs: string[] = (data || []).map((r: any) => r.address).filter(Boolean);
      if (addrs.length === 0) {
        setInfoMsg(`No suggestions found for ${email}. You can seed sample suggestions below.`);
      } else {
        setInfoMsg(`Loaded ${addrs.length} suggestion(s) from table.`);
      }
      addSuggestions(addrs, 'table');
    } catch (e: any) {
      setErrorMsg(e?.message || 'Lookup failed');
    } finally {
      setFinding(false);
    }
  }

  // One-click seed for your current email (so “Find addresses” shows something)
  async function seedSamples() {
    if (!email) { setErrorMsg('No email available.'); return; }
    setErrorMsg(null); setInfoMsg(null);
    const rows = [
      { email, address: 'Unit 3/12 Example St, Bondi NSW' },
      { email, address: '45 Ocean View Rd, Coogee NSW' },
      { email, address: '88 Park Parade, Randwick NSW' },
    ];
    const { error } = await supabase.from('mock_email_properties').insert(rows);
    if (error) { setErrorMsg(error.message); return; }
    setInfoMsg('Seeded sample suggestions. Click “Find addresses” again.');
  }

  async function onSave() {
    setErrorMsg(null); setInfoMsg(null); setSaving(true);
    try {
      const selected = suggestions.filter(s => s.selected).map(s => s.address.trim());
      const manual = manualAddress.trim();
      const combined = Array.from(new Set([...selected, manual].filter(Boolean).map(a => a.trim())))
        .filter(a => !existingSet.has(a.toLowerCase()));

      if (combined.length === 0) {
        setErrorMsg('Nothing to save — select at least one suggestion or add a new address.');
        setSaving(false);
        return;
      }

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userData.user; if (!user) { window.location.href = '/sign-in'; return; }

      const rows = combined.map(address => ({ user_id: user.id, address }));
      const { error } = await supabase.from('properties').insert(rows);
      if (error) throw error;

      window.location.href = '/dashboard';
    } catch (e: any) {
      setErrorMsg(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Discover Your Properties</h1>
        <p className="text-sm text-gray-500">Connect Outlook (optional) and/or load table suggestions. You can also add addresses manually.</p>
      </header>

      {errorMsg && <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</div>}
      {infoMsg && !errorMsg && <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700">{infoMsg}</div>}
      {loading ? <div className="text-sm text-gray-600">Loading…</div> : null}

      {/* Outlook connect/import */}
      <section className="space-y-2">
        <h2 className="text-sm font-medium">Outlook/Hotmail</h2>
        <div className="flex items-center gap-2">
          <button onClick={connectOutlook} className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
            Connect Outlook
          </button>
          <button onClick={() => importFromOutlook(userId)} className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50" disabled={importing}>
            {importing ? 'Importing…' : 'Import from Outlook'}
          </button>
          {connected?.connected === true ? (
            <span className="text-xs text-green-700">Connected ✓</span>
          ) : (
            <span className="text-xs text-gray-600">Not connected</span>
          )}
        </div>
        <p className="text-xs text-gray-500">We scan the last ~50 emails for address-like lines (demo regex).</p>
      </section>

      {/* Table-based suggestions */}
      <section className="space-y-3">
        <form onSubmit={onFind} className="space-y-2">
          <label className="block text-sm font-medium">Email (for table suggestions)</label>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="flex-1 rounded-md border px-3 py-2"
              placeholder="you@example.com"
            />
            <button type="submit" className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50" disabled={finding || !email.trim()}>
              {finding ? 'Finding…' : 'Find addresses'}
            </button>
          </div>
        </form>
        <button onClick={seedSamples} className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
          Seed sample suggestions for this email
        </button>
      </section>

      {/* Suggestions list */}
      {suggestions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium">Suggested addresses</h2>
          <ul className="space-y-2">
            {suggestions.map(s => (
              <li key={s.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={s.selected}
                    onChange={() => setSuggestions(prev => prev.map(x => x.id === s.id ? { ...x, selected: !x.selected } : x))}
                  />
                  <span className="truncate">{s.address}</span>
                </label>
                <span className="text-xs text-gray-500">{s.source === 'outlook' ? 'Outlook' : 'Table'}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Manual add + Save */}
      <section className="space-y-2">
        <h2 className="text-sm font-medium">Add an address manually</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualAddress}
            onChange={(e)=>setManualAddress(e.target.value)}
            className="flex-1 rounded-md border px-3 py-2"
            placeholder="e.g. 12 Smith St, Bondi NSW"
          />
          <button onClick={onSave} type="button" className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50" disabled={saving}>
            {saving ? 'Saving…' : 'Save selected'}
          </button>
        </div>
        {existingProps.length > 0 && <p className="text-xs text-gray-500">We’ll skip any addresses you’ve already saved.</p>}
      </section>
    </main>
  );
}
