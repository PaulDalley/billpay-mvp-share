export default function SignIn() {
  return (
    <main className="p-6 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>

      <form method="POST" action="/api/auth/start" className="space-y-2">
        <label className="block text-sm">Email</label>
        <input name="email" type="email" required className="border px-3 py-2 w-full" placeholder="you@example.com" />
        <button type="submit" className="border px-3 py-2">Send code</button>
      </form>

      <form method="POST" action="/api/auth/verify" className="space-y-2">
        <label className="block text-sm">Enter code</label>
        <input name="code" type="text" inputMode="numeric" pattern="[0-9]*" className="border px-3 py-2 w-full" placeholder="6-digit code" />
        <button type="submit" className="border px-3 py-2">Verify</button>
      </form>

      <form method="POST" action="/api/auth/logout">
        <button className="underline text-sm" type="submit">Log out</button>
      </form>
    </main>
  );
}
