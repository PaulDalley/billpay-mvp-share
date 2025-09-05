import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/server/prisma";

// Next 15: searchParams is now a Promise in server components.
type SP = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = "force-dynamic";

export default async function UserPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await searchParams; // ✅ await first
  const rawP = Array.isArray(sp?.p) ? sp.p[0] : sp?.p;
  const urlP = Number.isFinite(Number(rawP)) ? Number(rawP) : NaN;

  const c = cookies();

  // Use DB-backed properties (keeps /u useful)
  const properties = await prisma.property.findMany({ orderBy: { name: "asc" } });

  // Preserve the old cookie override behavior (if you still use it)
  const cookieP = Number(c.get("prop_idx")?.value ?? NaN);

  let idx = 0;
  if (!Number.isNaN(urlP) && urlP >= 0 && urlP < properties.length) idx = urlP;
  else if (!Number.isNaN(cookieP) && cookieP >= 0 && cookieP < properties.length) idx = cookieP;

  // Render a super simple view; this matches the old util-page vibe
  return (
    <main className="p-6 space-y-4">
      <a className="border rounded px-2 py-1 text-sm" href="/">Back</a>
      <h1 className="text-2xl font-semibold">User tools</h1>

      {properties.length === 0 ? (
        <p>No properties yet. <a className="underline" href="/onboard">Add one</a>.</p>
      ) : (
        <>
          <div className="text-sm opacity-70">
            {properties.length} propert{properties.length === 1 ? "y" : "ies"} in DB.
          </div>
          <ul className="space-y-2">
            {properties.map((p, i) => (
              <li key={p.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs opacity-70">
                      {[p.street, p.suburb, p.city].filter(Boolean).join(", ")}
                    </div>
                  </div>
                  <a className="underline text-sm" href={`/u?p=${i}`}>Select</a>
                </div>
              </li>
            ))}
          </ul>
          <div className="text-sm">
            Selected index: <b>{idx}</b>
          </div>
        </>
      )}
    </main>
  );
}
