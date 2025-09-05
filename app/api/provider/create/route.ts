import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
const prisma = new PrismaClient();
export async function POST(req: Request) {
  const fd = await req.formData();
  const propertyId = String(fd.get("propertyId") || "");
  const name = String(fd.get("name") || "").trim();
  const details = String(fd.get("details") || "");
  if (!propertyId || !name) return new Response("Bad request", { status: 400 });
  await prisma.providerAccount.create({ data: { propertyId, name, details } });
  redirect("/properties");
}
