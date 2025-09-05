export const dynamic = "force-dynamic";
export default function AddProperty() {
  return (
    <main className="p-6 space-y-6 max-w-3xl mx-auto">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Add Property</h1>
        <a className="underline" href="/properties">Back to properties</a>
      </header>

      <form method="post" action="/api/property/create" className="border rounded p-4 space-y-3">
        <div className="grid gap-2 sm:grid-cols-4">
          <input className="border rounded px-2 py-1 text-sm sm:col-span-2" name="name"   placeholder="Name (e.g. 1 Paul Street)" required />
          <input className="border rounded px-2 py-1 text-sm" name="street" placeholder="Street" />
          <input className="border rounded px-2 py-1 text-sm" name="suburb" placeholder="Suburb" />
          <input className="border rounded px-2 py-1 text-sm" name="city"   placeholder="City/State" />
        </div>
        <input type="hidden" name="next" value="/properties" />
        <button className="border rounded px-3 py-1 text-sm bg-black text-white" type="submit">Create property</button>
      </form>
    </main>
  );
}
