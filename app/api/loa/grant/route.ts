import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

const ALLOWED = new Set(["READ_BILLING","DISCUSS_ACCOUNT","CHANGE_PLAN"]);

export async function POST(req: Request) {
  let body: any = {};
  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) body = await req.json();
    else if (ct.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      body = Object.fromEntries(form.entries());
      if (typeof body.scopes === "string") {
        try { body.scopes = JSON.parse(body.scopes); } catch { body.scopes = [String(body.scopes)]; }
      }
    }
  } catch { /* fallthrough */ }

  const propertyId = String(body.propertyId || "").trim();
  const signerName = String(body.signerName || "").trim();
  const signerEmail = String(body.signerEmail || "").trim();
  let scopes = Array.isArray(body.scopes) ? body.scopes.map(String) : ["READ_BILLING","DISCUSS_ACCOUNT"];
  scopes = scopes.filter(s => ALLOWED.has(s));

  if (!propertyId) return NextResponse.json({ ok:false, error:"propertyId required" }, { status: 400 });
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) return NextResponse.json({ ok:false, error:"property not found" }, { status: 404 });

  const now = new Date();
  const loa = await prisma.loa.upsert({
    where: { propertyId },
    update: { status: "GRANTED", scopes, signerName, signerEmail, grantedAt: now },
    create: { propertyId, status: "GRANTED", scopes, signerName, signerEmail, grantedAt: now },
  });

  return NextResponse.json({ ok:true, loa });
}
