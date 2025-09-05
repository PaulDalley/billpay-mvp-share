import { cookies } from "next/headers";

type Props = { searchParams: Promise<{ p?: string }> };

export default async function LoaDemo({ searchParams }: Props) {
  const { p } = await searchParams;
  const propertyId = p ?? "0";

  const jar = await cookies();
  let map: Record<string, boolean> = {};
  try { map = JSON.parse(jar.get("loa_map")?.value ?? "{}"); } catch {}
  const hasLoa = !!map[propertyId];

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">LOA Demo — Property {propertyId}</h1>
      <div className="rounded-xl border p-4">
        <div className="text-sm opacity-70 mb-2">Letter of Authority</div>
        <div className={`inline-flex items-center gap-2 text-sm ${hasLoa ? "text-green-600" : "text-amber-600"}`}>
          <span className="h-2 w-2 rounded-full border" />
          {hasLoa ? "Authority granted" : "Not granted"}
        </div>
        <div className="mt-3 flex gap-3">
          {!hasLoa && (
            <a href={`/api/loa/authorize?propertyId=${propertyId}`} className="rounded-lg border px-3 py-1.5 text-sm">
              Grant authority
            </a>
          )}
          {hasLoa && (
            <a href={`/api/loa/revoke?propertyId=${propertyId}`} className="rounded-lg border px-3 py-1.5 text-sm">
              Revoke
            </a>
          )}
        </div>
      </div>
      <p className="text-xs opacity-60">
        This is a safe demo page; your main UI (/u) remains untouched.
      </p>
    </main>
  );
}
