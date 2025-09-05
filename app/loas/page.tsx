import "server-only";
import { getPropertiesWithLoa } from "@/lib/server/data";

export const dynamic = "force-dynamic";

export default async function LoaAdmin() {
  const { properties, byProperty } = await getPropertiesWithLoa();
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">LOA (DB-backed)</h1>
      {properties.length === 0 ? (
        <p>No properties found. Add one via Prisma Studio or a seed.</p>
      ) : (
        <ul className="space-y-3">
          {properties.map(p => {
            const loa = byProperty.get(p.id) as any;
            const authorised = loa?.status === "GRANTED";
            return (
              <li key={p.id} className="border rounded p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm opacity-70">
                      {[p.street, p.suburb, p.city].filter(Boolean).join(", ")}
                    </div>
                    <div className="text-sm mt-1">
                      LOA: {authorised ? "GRANTED (read/discuss)" : (loa?.status ?? "None")}
                      {Array.isArray(loa?.scopes) && loa.scopes.length > 0 && (
                        <span className="ml-2 opacity-70">[{loa.scopes.join(", ")}]</span>
                      )}
                    </div>
                  </div>
                  <form method="post" action="/api/loa/grant" className="flex items-center gap-2">
                    <input type="hidden" name="propertyId" value={p.id} />
                    <input className="border rounded px-2 py-1 text-sm" name="signerName" placeholder="Signer name" />
                    <input className="border rounded px-2 py-1 text-sm" name="signerEmail" placeholder="Signer email" />
                    <input type="hidden" name="scopes" value='["READ_BILLING","DISCUSS_ACCOUNT"]' />
                    <button className="border rounded px-3 py-1 text-sm bg-black text-white" type="submit">
                      {authorised ? "Re-grant" : "Grant LOA"}
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
