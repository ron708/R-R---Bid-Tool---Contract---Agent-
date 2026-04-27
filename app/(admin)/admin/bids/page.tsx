import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { TrendingUp, DollarSign, FileText, AlertCircle } from "lucide-react";

export default async function AdminBidsPage() {
  const bids = await prisma.bid.findMany({
    include: { customer: true, contractor: true },
    orderBy: { createdAt: "desc" },
  });

  const statusVariantMap: Record<string, "draft" | "sent" | "signed" | "complete" | "voided"> = {
    DRAFT: "draft", SENT: "sent", SIGNED: "signed", COMPLETE: "complete", VOIDED: "voided",
  };

  const totalRevenue = bids.reduce((s, b) => s + (b.total ?? 0), 0);
  const totalCosts = bids.reduce((s, b) => s + (b.subtotal ?? 0), 0);
  const totalGrossProfit = bids.reduce((s, b) => s + (b.grossProfit ?? 0), 0);
  const discountBids = bids.filter((b) => b.saveTheDeal).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Bids</h1>
        <p className="text-muted-foreground text-sm mt-1">{bids.length} bids across all partners — full cost and margin visibility</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Total Bids
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{bids.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> Total Contract Value
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Total Gross Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-solar-green">{formatCurrency(totalGrossProfit)}</p>
            {totalRevenue > 0 && (
              <p className="text-xs text-muted-foreground">{((totalGrossProfit / totalRevenue) * 100).toFixed(1)}% blended margin</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" /> Discount Bids
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{discountBids}</p>
            <p className="text-xs text-muted-foreground">30% margin applied</p>
          </CardContent>
        </Card>
      </div>

      {/* Bids table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Bid #</th>
                  <th className="text-left p-3 font-semibold">Date</th>
                  <th className="text-left p-3 font-semibold">Partner</th>
                  <th className="text-left p-3 font-semibold">Customer</th>
                  <th className="text-right p-3 font-semibold">Panels</th>
                  <th className="text-right p-3 font-semibold">Total Costs</th>
                  <th className="text-right p-3 font-semibold">Contract Price</th>
                  <th className="text-right p-3 font-semibold">Gross Profit</th>
                  <th className="text-right p-3 font-semibold">Margin</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {bids.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-muted-foreground">No bids submitted yet.</td>
                  </tr>
                ) : bids.map((bid) => {
                  const margin = bid.total && bid.grossProfit
                    ? ((bid.grossProfit / bid.total) * 100).toFixed(1)
                    : null;
                  return (
                    <tr key={bid.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <Link
                          href={`/admin/bids/${bid.id}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {bid.bidNumber}
                        </Link>
                      </td>
                      <td className="p-3 text-muted-foreground whitespace-nowrap">{formatDate(bid.createdAt)}</td>
                      <td className="p-3 font-medium">{bid.contractor.name}</td>
                      <td className="p-3">{bid.customer.firstName} {bid.customer.lastName}</td>
                      <td className="p-3 text-right tabular-nums">{bid.panelCount}</td>
                      <td className="p-3 text-right tabular-nums text-muted-foreground">{formatCurrency(bid.subtotal ?? 0)}</td>
                      <td className="p-3 text-right tabular-nums font-semibold">{formatCurrency(bid.total ?? 0)}</td>
                      <td className="p-3 text-right tabular-nums text-solar-green font-medium">{formatCurrency(bid.grossProfit ?? 0)}</td>
                      <td className="p-3 text-right">
                        {margin ? (
                          <span className={`font-semibold ${bid.saveTheDeal ? "text-amber-600" : "text-solar-green"}`}>
                            {margin}%{bid.saveTheDeal ? " ↓" : ""}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="p-3">
                        <Badge variant={statusVariantMap[bid.status]}>{bid.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {bids.length > 0 && (
                <tfoot>
                  <tr className="bg-muted/50 font-semibold border-t-2">
                    <td colSpan={5} className="p-3 text-muted-foreground">Totals ({bids.length} bids)</td>
                    <td className="p-3 text-right tabular-nums text-muted-foreground">{formatCurrency(totalCosts)}</td>
                    <td className="p-3 text-right tabular-nums">{formatCurrency(totalRevenue)}</td>
                    <td className="p-3 text-right tabular-nums text-solar-green">{formatCurrency(totalGrossProfit)}</td>
                    <td className="p-3 text-right text-solar-green">
                      {totalRevenue > 0 ? `${((totalGrossProfit / totalRevenue) * 100).toFixed(1)}%` : "—"}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
