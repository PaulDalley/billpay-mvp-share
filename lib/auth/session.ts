import { cookies } from "next/headers";

const COOKIE = "bc_email";

export async function setSession(email: string) {
  (await cookies()).set(COOKIE, email, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getSessionEmail(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE)?.value;
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}
