type AnyLoa = { status?: string | null; scopes?: any };
type AnyProperty = {
  id: string; name: string;
  street?: string | null; suburb?: string | null; city?: string | null;
  loa?: AnyLoa | null;
};
export default function PropertyCard({ p }: { p: AnyProperty }) {
  const addr = [p.street, p.suburb, p.city].filter(Boolean).join(", ");
  const granted = p.loa?.status === "GRANTED";
  return (
    <div className="border rounded p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-medium">{p.name}</div>
        <span className={`text-xs border rounded px-2 py-0.5 ${granted ? "bg-green-100 border-green-300" : "bg-gray-100 border-gray-300"}`}>
          LOA: {granted ? "GRANTED" : (p.loa?.status ?? "None")}
        </span>
      </div>
      {addr && <div className="text-sm opacity-70">{addr}</div>}
      <div className="text-xs"><a className="underline" href="/loas">Manage LOA</a></div>
    </div>
  );
}
