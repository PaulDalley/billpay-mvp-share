"use client";
import type { Bill, Property } from "@prisma/client";
type PropWithBills = Property & { bills: Bill[] };

export default function PropertyCards({ properties }: { properties: PropWithBills[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {properties.map((p) => (
        <div key={p.id} className="rounded-2xl shadow p-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-semibold">{p.alias || p.label}</h3>
            <span className="text-sm opacity-70">
              {sumCents(p.bills) ? ("Total $" + (sumCents(p.bills)/100).toFixed(2)) : "No bills"}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {p.bills.length === 0 ? (
              <div className="text-sm opacity-70">No property bills yet.</div>
            ) : (
              p.bills.map((b) => (
                <div key={b.id} className="flex items-center justify-between text-sm">
                  <div className="truncate">
                    <div className="font-medium">{b.biller}</div>
                  </div>
                  <div className="text-right">
                    <div>\${(b.amountCents / 100).toFixed(2)}</div>
                    <div className="opacity-70">{b.dueDate ? fmt(b.dueDate) : "No due date"}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
function sumCents(bills: Bill[]) { return bills.reduce((n, b) => n + (b.amountCents ?? 0), 0); }
function fmt(d: Date | string) { return new Date(d).toLocaleDateString(); }
