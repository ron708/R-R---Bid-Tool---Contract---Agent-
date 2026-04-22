import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Building2, Phone, Mail } from "lucide-react";

export default async function PartnersPage() {
  const partners = await prisma.contractor.findMany({
    include: { _count: { select: { bids: true, customers: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Roofing Partners</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" /> {partners.length} partner{partners.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {partners.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No partners yet.</p>
          ) : (
            <div className="divide-y">
              {partners.map((p) => (
                <div key={p.id} className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      {p.licenseNumber && <p className="text-xs text-muted-foreground">License: {p.licenseNumber}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {[p.address, p.city, p.state].filter(Boolean).join(", ")}
                      </p>
                      <div className="flex gap-4 mt-1">
                        {p.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{p.phone}</span>}
                        {p.email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{p.email}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={p.active ? "signed" : "voided"}>{p.active ? "Active" : "Inactive"}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-6 mt-2 text-sm text-muted-foreground">
                    <span>{p._count.bids} bids</span>
                    <span>{p._count.customers} customers</span>
                    <span>Joined {formatDate(p.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
