export async function getCurrentUserId(): Promise<string> {
  const id = process.env.DEMO_USER_ID;
  if (!id) throw new Error("UNAUTHENTICATED");
  return id;
}
