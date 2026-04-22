import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Plus, Phone, Mail } from "lucide-react";

export default async function CustomersPage() {
  const session = await getServerSession(authOptions);
  const contractorId = session!.user.contractorId!;

  const customers = await prisma.customer.findMany({
    where: { contractorId },
    include: { _count: { select: { bids: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button asChild variant="solar">
          <Link href="/customers/new"><Plus className="h-4 w-4" /> Add Customer</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> {customers.length} customer{customers.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No customers yet.</p>
              <Button asChild className="mt-4" variant="solar">
                <Link href="/customers/new">Add First Customer</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {customers.map((c) => (
                <Link
                  key={c.id}
                  href={`/customers/${c.id}`}
                  className="flex items-center justify-between py-3 hover:bg-muted/50 px-2 rounded transition-colors"
                >
                  <div>
                    <p className="font-medium">{c.firstName} {c.lastName}</p>
                    <p className="text-sm text-muted-foreground">{c.siteAddress}{c.siteCity ? `, ${c.siteCity}` : ""}</p>
                    <div className="flex gap-4 mt-1">
                      {c.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
                      {c.email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {c._count.bids} bid{c._count.bids !== 1 ? "s" : ""}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
