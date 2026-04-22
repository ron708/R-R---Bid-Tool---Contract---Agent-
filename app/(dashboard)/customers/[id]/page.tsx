import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MapPin, Plus } from "lucide-react";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: { bids: { orderBy: { createdAt: "desc" } } },
  });

  if (!customer || customer.contractorId !== session!.user.contractorId) notFound();

  const statusVariantMap: Record<string, "draft" | "sent" | "signed" | "complete" | "voided"> = {
    DRAFT: "draft", SENT: "sent", SIGNED: "signed", COMPLETE: "complete", VOIDED: "voided",
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/customers"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <h1 className="text-2xl font-bold">{customer.firstName} {customer.lastName}</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />
            {customer.siteAddress}{customer.siteCity ? `, ${customer.siteCity}` : ""}{customer.siteState ? ` ${customer.siteState}` : ""} {customer.siteZip}
          </p>
          {customer.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{customer.phone}</p>}
          {customer.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{customer.email}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Bids ({customer.bids.length})</CardTitle>
          <Button asChild variant="solar" size="sm">
            <Link href={`/bids/new`}><Plus className="h-3.5 w-3.5" /> New Bid</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {customer.bids.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No bids yet for this customer.</p>
          ) : (
            <div className="divide-y">
              {customer.bids.map((bid) => (
                <Link
                  key={bid.id}
                  href={`/bids/${bid.id}`}
                  className="flex items-center justify-between py-3 hover:bg-muted/50 px-2 rounded"
                >
                  <div>
                    <p className="font-medium text-sm">{bid.bidNumber}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(bid.createdAt)} · {bid.panelCount} panels</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{formatCurrency(bid.total ?? 0)}</span>
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
