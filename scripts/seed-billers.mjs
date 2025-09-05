import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const DEFAULT_BILLERS = ["Council","Water","Electricity","Strata"];
async function main(){
  const props = await prisma.property.findMany({ select: { id: true, name: true }});
  for (const p of props) {
    for (const name of DEFAULT_BILLERS) {
      await prisma.providerAccount.upsert({
        where: { propertyId_name: { propertyId: p.id, name } },
        update: {},
        create: { propertyId: p.id, name, details: null, status: "PENDING" }
      });
    }
  }
  const paCount = await prisma.providerAccount.count();
  console.log(JSON.stringify({ properties: props.length, providerAccounts: paCount }, null, 2));
}
main().catch(e=>{ console.error(e); process.exit(1)}).finally(()=>prisma.$disconnect());
