import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Building2, Phone, Mail, User } from "lucide-react";
import { AddPartnerForm } from "@/components/admin/add-partner-form";

export default async function PartnersPage() {
  const partners = await prisma.contractor.findMany({
    include: {
      _count: { select: { bids: true, customers: true } },
      users: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roofing Partners</h1>
          <p className="text-muted-foreground text-sm mt-1">{partners.length} partner{partners.length !== 1 ? "s" : ""} on the platform</p>
        </div>
        <AddPartnerForm />
      </div>

      <div className="space-y-4">
        {partners.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No partners yet. Add your first Strategic Partner above.
            </CardContent>
          </Card>
        ) : partners.map((p) => (
          <Card key={p.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <CardTitle className="text-base">{p.name}</CardTitle>
                </div>
                <Badge variant={p.active ? "signed" : "voided"}>{p.active ? "Active" : "Inactive"}</Badge>
              </div>
              {p.licenseNumber && <p className="text-xs text-muted-foreground ml-6">License: {p.licenseNumber}</p>}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {p.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{p.phone}</span>}
                {p.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{p.email}</span>}
                {p.address && <span>{[p.address, p.city, p.state].filter(Boolean).join(", ")}</span>}
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-sm text-muted-foreground">
                <span><span className="font-semibold text-foreground">{p._count.bids}</span> bids</span>
                <span><span className="font-semibold text-foreground">{p._count.customers}</span> customers</span>
                <span>Joined {formatDate(p.createdAt)}</span>
              </div>

              {/* Login accounts */}
              {p.users.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Login Accounts</p>
                  <div className="space-y-1.5">
                    {p.users.map((u) => (
                      <div key={u.id} className="flex items-center gap-2 text-sm">
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="font-medium">{u.name}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{u.email}</span>
                        <Badge variant="draft" className="text-xs ml-auto">{u.role.replace("PARTNER_", "")}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
