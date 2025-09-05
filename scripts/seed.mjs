import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function run() {
  let prop = await prisma.property.findFirst();
  if (!prop) {
    prop = await prisma.property.create({
      data: { name: "1 Paul Street", street: "1 Paul Street", suburb: "Bondi", city: "NSW" },
    });
  }
  const existing = await prisma.loa.findUnique({ where: { propertyId: prop.id } });
  if (!existing) {
    await prisma.loa.create({
      data: {
        propertyId: prop.id,
        status: "GRANTED",
        scopes: ["READ_BILLING","DISCUSS_ACCOUNT"],
        signerName: "Demo User",
        signerEmail: "demo@example.com",
        grantedAt: new Date(),
      },
    });
  }
  const counts = { properties: await prisma.property.count(), loas: await prisma.loa.count() };
  console.log(JSON.stringify({ ok: true, counts }, null, 2));
}
run().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
