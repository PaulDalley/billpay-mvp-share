import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import PropertyCards from "./_components/PropertyCards";
export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  const userId = await getCurrentUserId();
  const properties = await prisma.property.findMany({
    where: { userId },
    include: {
      bills: {
        where: { category: "PROPERTY" },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        take: 50,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!properties.length) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">No properties yet</h2>
        <p className="text-sm mt-2">Add your first property to start seeing bills.</p>
      </div>
    );
  }
  return <PropertyCards properties={properties} />;
}
