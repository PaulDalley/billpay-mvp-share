import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const form = await req.formData();
  const name = String(form.get("name") || "");
  const street = String(form.get("street") || "");
  const suburb = String(form.get("suburb") || "");
  const city = String(form.get("city") || "");

  const jar = cookies();
  const email =
    jar.get("user_email")?.value ||
    jar.get("auth_email")?.value ||
    jar.get("bc_email")?.value;

  if (!email) {
    return NextResponse.redirect(new URL("/sign-in?need=1", req.url), { status: 303 });
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
