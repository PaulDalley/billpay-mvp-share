import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const name = String(form.get("name") || "").trim();
  const street = String(form.get("street") || "").trim();
  const suburb = String(form.get("suburb") || "").trim();
  const city = String(form.get("city") || "").trim();

  const email =
    cookies().get("user_email")?.value ||
    cookies().get("auth_email")?.value ||
    cookies().get("bc_email")?.value ||
    "";

  if (!email) {
    return NextResponse.redirect(new URL("/sign-in", req.url), { status: 303 });
  }
  if (!name) {
    return new NextResponse("Missing property name", { status: 400 });
  }

  const property = await prisma.property.create({
    data: { name, street, suburb, city, ownerEmail: email },
  });

  await prisma.provider.createMany({
    data: [
      { propertyId: property.id, name: "Council" },
      { propertyId: property.id, name: "Water" },
      { propertyId: property.id, name: "Electricity" },
      { propertyId: property.id, name: "Strata" },
    ],
  });

  return NextResponse.redirect(new URL("/properties", req.url), { status: 303 });
}
