import { cookies } from "next/headers";
import Link from "next/link";

export default async function LandingPage() {
    const jar = await cookies();
const signedIn = !!jar.get("session_email")?.value;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <section className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-center">
          All your property bills in one place.
        </h1>
        <p className="mt-2 text-lg text-gray-600 text-center italic">
          effortless, organised, secure.
        </p>

        <div className="mt-4 text-center">
          {signedIn ? (
            <Link href="/properties" className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-white font-medium shadow hover:bg-blue-700 transition">
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/login" className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-white font-medium shadow hover:bg-blue-700 transition">
              Quick Login
            </Link>
          )}
        </div>

        {/* Compact card with prominent steps */}
        <div className="mt-6 mx-auto max-w-xl rounded-xl bg-white ring-1 ring-gray-200 shadow-sm p-5">
          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">1</span>
            <div className="text-lg font-semibold">Add your property</div>
          </div>

          {/* Step 2 */}
          <div className="mt-3 flex items-start gap-3">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">2</span>
            <div className="text-lg font-semibold">We fetch your current bills</div>
          </div>

          <hr className="my-4 border-gray-200" />

          {/* Extras, smaller and lighter */}
          <ul className="space-y-1.5 text-[15px] leading-6 text-gray-800">
            <li>⚡ <strong>Optional</strong> — pay in one click</li>
            <li>🔮 <strong>Coming soon</strong> — better electricity deals</li>
            <li>📑 <strong>Coming soon</strong> — tax-time ready report</li>
          </ul>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Bill Concierge
      </footer>
    </main>
  );
}
