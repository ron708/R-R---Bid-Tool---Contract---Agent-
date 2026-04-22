import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Building2, FileText, CheckCircle, DollarSign } from "lucide-react";

export default async function AdminDashboardPage() {
  const [partnerCount, bids, recentBids] = await Promise.all([
    prisma.contractor.count({ where: { active: true } }),
    prisma.bid.findMany({ select: { status: true, total: true } }),
    prisma.bid.findMany({
      include: { customer: true, contractor: true },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  const stats = {
    partners: partnerCount,
    totalBids: bids.length,
    signed: bids.filter((b) => b.status === "SIGNED" || b.status === "COMPLETE").length,
    totalValue: bids.reduce((s, b) => s + (b.total ?? 0), 0),
  };

  const statusVariantMap: Record<string, "draft" | "sent" | "signed" | "complete" | "voided"> = {
    DRAFT: "draft", SENT: "sent", SIGNED: "signed", COMPLETE: "complete", VOIDED: "voided",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground">All partner activity across the platform</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Partners
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.partners}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" /> Total Bids
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.totalBids}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Signed
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.signed}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Total Value
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Platform Bids</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/partners">View Partners</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentBids.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No bids yet on the platform.</p>
          ) : (
            <div className="space-y-1">
              {recentBids.map((bid) => (
                <div key={bid.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
                  <div>
                    <p className="font-medium text-sm">{bid.bidNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {bid.contractor.name} — {bid.customer.firstName} {bid.customer.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(bid.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm">{formatCurrency(bid.total ?? 0)}</span>
                    <Badge variant={statusVariantMap[bid.status]}>{bid.status}</Badge>
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
