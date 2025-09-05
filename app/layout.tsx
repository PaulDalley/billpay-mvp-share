import "./globals.css";
import Link from "next/link";
import { cookies } from "next/headers";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const c = await cookies();
  const email = c.get("auth_email")?.value || c.get("bc_email")?.value || c.get("user_email")?.value || "";
  const signedIn = Boolean(c.get("sid") || email);

  return (
    <html lang="en">
      <body>
        <header className="border-b px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-semibold">Bill Concierge</Link>
              <nav className="flex items-center gap-4">
                <Link href="/properties" className="underline">Dashboard</Link>
              </nav>
            </div>
            <div>
              {signedIn ? (
                <form action="/api/auth/logout" method="post">
                  <button className="px-3 py-1 rounded border">Sign out{email ? ` (${email})` : ""}</button>
                </form>
              ) : (
                <Link href="/sign-in" className="px-3 py-1 rounded border">Sign in</Link>
              )}
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
