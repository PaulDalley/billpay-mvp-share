import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const fd = await req.formData();
  const name = String(fd.get("name") || "").trim();
  const street = String(fd.get("street") || "").trim() || null;
  const suburb = String(fd.get("suburb") || "").trim() || null;
  const city = String(fd.get("city") || "").trim() || null;

  const jar = cookies();
  const email =
    jar.get("user_email")?.value ||
    jar.get("auth_email")?.value ||
    jar.get("bc_email")?.value ||
    "";

  if (!email) {
    return NextResponse.redirect(new URL("/sign-in", req.url), { status: 303 });
  }
  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const created = await prisma.property.create({
    data: { name, street, suburb, city, ownerEmail: email },
  });

  await prisma.provider.createMany({
    data: [
      { propertyId: created.id, name: "Council" },
      { propertyId: created.id, name: "Water" },
      { propertyId: created.id, name: "Electricity" },
      { propertyId: created.id, name: "Strata" },
    ],
  });

  return NextResponse.redirect(new URL("/properties", req.url), { status: 303 });
}
