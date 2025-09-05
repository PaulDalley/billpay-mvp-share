import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const [properties, loas, byStatus] = await Promise.all([
      prisma.property.count(),
      prisma.loa.count(),
      prisma.loa.groupBy({ by: ["status"], _count: { _all: true } }).catch(() => []),
    ]);
    return NextResponse.json({ ok: true, db: "sqlite", properties, loas, byStatus });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
