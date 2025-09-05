import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { writeFile } from "fs/promises";
import { randomBytes } from "crypto";
const prisma = new PrismaClient();
export async function POST(req: Request) {
  const fd = await req.formData();
  const providerId = String(fd.get("providerId") || "");
  const note = String(fd.get("note") || "");
  const file = fd.get("file") as File | null;
  if (!providerId || !file || file.size === 0) return new Response("Bad request", { status: 400 });
  const arrayBuffer = await file.arrayBuffer();
  const buf = Buffer.from(arrayBuffer);
  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-100) || "upload.dat";
  const rnd = randomBytes(6).toString("hex");
  const filename = `${Date.now()}-${rnd}-${safeName}`;
  const diskPath = `public/uploads/${filename}`;
  const publicPath = `/uploads/${filename}`;
  await writeFile(diskPath, buf);
  await prisma.bill.create({ data: { providerId, note, filePath: publicPath } });
  redirect("/properties");
}
