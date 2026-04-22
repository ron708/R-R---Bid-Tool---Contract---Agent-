import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";

export default async function BidsPage() {
  const session = await getServerSession(authOptions);
  const bids = await prisma.bid.findMany({
    where: { contractorId: session!.user.contractorId! },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  const statusVariantMap: Record<string, "draft" | "sent" | "signed" | "complete" | "voided"> = {
    DRAFT: "draft", SENT: "sent", SIGNED: "signed", COMPLETE: "complete", VOIDED: "voided",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bids</h1>
        <Button asChild variant="solar">
          <Link href="/bids/new"><Plus className="h-4 w-4" /> New Bid</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{bids.length} bid{bids.length !== 1 ? "s" : ""}</CardTitle>
        </CardHeader>
        <CardContent>
          {bids.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No bids yet.</p>
              <Button asChild className="mt-4" variant="solar"><Link href="/bids/new">Create First Bid</Link></Button>
            </div>
          ) : (
            <div className="divide-y">
              {bids.map((bid) => (
                <Link
                  key={bid.id}
                  href={`/bids/${bid.id}`}
                  className="flex items-center justify-between py-3 px-2 hover:bg-muted/50 rounded transition-colors"
                >
                  <div>
                    <p className="font-medium">{bid.bidNumber}</p>
                    <p className="text-sm text-muted-foreground">{bid.customer.firstName} {bid.customer.lastName} — {bid.customer.siteAddress}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(bid.createdAt)} · {bid.panelCount} panels</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatCurrency(bid.total ?? 0)}</span>
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
