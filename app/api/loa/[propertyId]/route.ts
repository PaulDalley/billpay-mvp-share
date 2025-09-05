import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { propertyId: string } }
) {
  const propertyId = params.propertyId;
  if (!propertyId) return NextResponse.json({ ok:false, error:"propertyId required" }, { status: 400 });
  const [property, loa] = await Promise.all([
    prisma.property.findUnique({ where: { id: propertyId } }),
    prisma.loa.findUnique({ where: { propertyId } }),
  ]);
  if (!property) return NextResponse.json({ ok:false, error:"property not found" }, { status: 404 });
  return NextResponse.json({ ok:true, property, loa });
}
