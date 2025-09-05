import "server-only";

export const dynamic = "force-dynamic";

export default async function Onboard() {
  return (
    <main className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">Add your first property</h1>
      <p className="opacity-80">After creating a property, you’ll see it on the dashboard.</p>

      <form method="post" action="/api/property/create" className="border rounded p-4 space-y-3">
        <input type="hidden" name="next" value="/dashboard" />
        <div className="grid gap-2 sm:grid-cols-4">
          <input className="border rounded px-2 py-1 text-sm" name="name"   placeholder="Name (e.g. 1 Paul Street)" required />
          <input className="border rounded px-2 py-1 text-sm" name="street" placeholder="Street" />
          <input className="border rounded px-2 py-1 text-sm" name="suburb" placeholder="Suburb" />
          <input className="border rounded px-2 py-1 text-sm" name="city"   placeholder="City/State" />
        </div>
        <button className="border rounded px-3 py-1 text-sm bg-black text-white" type="submit">
          Create property
        </button>
      </form>

      <p className="text-sm opacity-60">
        Or go back to <a className="underline" href="/dashboard">dashboard</a>.
      </p>
    </main>
  );
}
