import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { FileText, Users, CheckCircle, Clock, Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const contractorId = session!.user.contractorId!;

  const [bids, customerCount] = await Promise.all([
    prisma.bid.findMany({
      where: { contractorId },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.customer.count({ where: { contractorId } }),
  ]);

  const stats = {
    total: bids.length,
    open: bids.filter((b) => b.status === "DRAFT" || b.status === "SENT").length,
    signed: bids.filter((b) => b.status === "SIGNED" || b.status === "COMPLETE").length,
    totalValue: bids.reduce((s, b) => s + (b.total ?? 0), 0),
  };

  const statusVariantMap: Record<string, "draft" | "sent" | "signed" | "complete" | "voided"> = {
    DRAFT: "draft",
    SENT: "sent",
    SIGNED: "signed",
    COMPLETE: "complete",
    VOIDED: "voided",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">{session!.user.contractorName}</p>
        </div>
        <Button asChild variant="solar">
          <Link href="/bids/new"><Plus className="h-4 w-4" /> New Bid</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" /> Total Bids
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.total}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" /> Open
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.open}</p></CardContent>
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
              <Users className="h-4 w-4" /> Customers
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{customerCount}</p></CardContent>
        </Card>
      </div>

      {/* Recent bids */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Bids</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/bids">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {bids.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No bids yet. Create your first bid to get started.</p>
              <Button asChild className="mt-4" variant="solar">
                <Link href="/bids/new">Create Bid</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {bids.map((bid) => (
                <Link
                  key={bid.id}
                  href={`/bids/${bid.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{bid.bidNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {bid.customer.firstName} {bid.customer.lastName} — {bid.customer.siteAddress}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(bid.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm">{formatCurrency(bid.total ?? 0)}</span>
                    <Badge variant={statusVariantMap[bid.status]}>{bid.status}</Badge>
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
