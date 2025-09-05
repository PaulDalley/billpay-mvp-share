import "server-only";
import { prisma } from "./prisma";

export async function getPropertiesWithLoa() {
  const properties = await prisma.property.findMany({ orderBy: { name: "asc" } });
  const loas = await prisma.loa.findMany();
  const byProperty = new Map(loas.map(l => [l.propertyId, l]));
  return { properties, byProperty };
}
