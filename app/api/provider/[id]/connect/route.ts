import { PrismaClient, ProviderStatus } from "@prisma/client";
import { redirect } from "next/navigation";
const prisma = new PrismaClient();
export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params?.id;
  if (!id) return new Response("Bad request", { status: 400 });
  await prisma.providerAccount.update({ where: { id }, data: { status: ProviderStatus.CONNECTED } });
  redirect("/properties");
}
