export default function SiteHeader() {
  return (
    <header className="w-full border-b">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <a href="/" className="font-semibold">Bill Concierge</a>
        <nav className="flex items-center gap-4">
          <a href="/properties" className="underline">Dashboard</a>
        </nav>
      </div>
    </header>
  );
}
