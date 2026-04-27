import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, Building2 } from "lucide-react";

const attachmentLabel: Record<string, string> = {
  LAG_BOLT: "Comp Attachment w/ Flashing",
  S5_CLAMP: "S-5 Clamp",
  TILE_HOOK: "Tile Hook w/ Flashing",
  FLAT_ROOF_BALLAST: "Flat Roof Ballast",
  SEAM_CLAMP: "Seam Clamp",
};

const scopeLabel: Record<string, string> = {
  FULL_RR: "Full R&R (Remove & Replace)",
  REMOVAL_ONLY: "Removal Only",
  INSTALL_ONLY: "Reinstall Only",
};

const roofLabel: Record<string, string> = {
  COMP_SHINGLE: "Comp Shingle", TILE: "Tile", METAL: "Metal", FLAT: "Flat Roof",
};

const statusVariantMap: Record<string, "draft" | "sent" | "signed" | "complete" | "voided"> = {
  DRAFT: "draft", SENT: "sent", SIGNED: "signed", COMPLETE: "complete", VOIDED: "voided",
};

export default async function AdminBidDetailPage({ params }: { params: { id: string } }) {
  const bid = await prisma.bid.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      contractor: true,
      lineItems: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!bid) notFound();

  const marginRate = bid.saveTheDeal ? 0.30 : 0.35;
  const grossProfit = bid.grossProfit ?? ((bid.total ?? 0) - (bid.subtotal ?? 0));
  const marginPercent = bid.total ? ((grossProfit / bid.total) * 100).toFixed(1) : "—";

  const visibleItems = bid.lineItems.filter((i) => !i.internal);
  const internalItems = bid.lineItems.filter((i) => i.internal);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/bids"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{bid.bidNumber}</h1>
            <Badge variant={statusVariantMap[bid.status]}>{bid.status}</Badge>
            {bid.saveTheDeal && (
              <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                Discount Bid — 30% margin
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">{formatDate(bid.createdAt)}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Partner */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Strategic Partner</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p className="font-semibold">{bid.contractor.name}</p>
            {bid.contractor.email && <p className="text-muted-foreground">{bid.contractor.email}</p>}
            {bid.contractor.phone && <p className="text-muted-foreground">{bid.contractor.phone}</p>}
          </CardContent>
        </Card>

        {/* Customer */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Customer</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-semibold">{bid.customer.firstName} {bid.customer.lastName}</p>
            <p className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {bid.customer.siteAddress}{bid.customer.siteCity ? `, ${bid.customer.siteCity}` : ""}
              {bid.customer.siteState ? ` ${bid.customer.siteState}` : ""}
            </p>
            {bid.customer.phone && <p className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" />{bid.customer.phone}</p>}
            {bid.customer.email && <p className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" />{bid.customer.email}</p>}
          </CardContent>
        </Card>
      </div>

      {/* System & Scope */}
      <Card>
        <CardHeader><CardTitle className="text-base">Solar System & Scope</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1.5 text-sm">
          <div><span className="text-muted-foreground">Scope: </span>{scopeLabel[bid.workScope] ?? bid.workScope}</div>
          <div><span className="text-muted-foreground">Panels: </span>{bid.panelCount}{bid.panelBrand ? ` — ${bid.panelBrand}` : ""}{bid.panelModel ? ` ${bid.panelModel}` : ""}</div>
          {bid.systemSizeKw && <div><span className="text-muted-foreground">System Size: </span>{bid.systemSizeKw} kW</div>}
          {bid.inverterType && <div><span className="text-muted-foreground">Inverter: </span>{bid.inverterType}{bid.inverterBrand ? ` — ${bid.inverterBrand}` : ""}</div>}
          <div><span className="text-muted-foreground">Roof: </span>{roofLabel[bid.roofType ?? ""] ?? bid.roofType ?? "—"}</div>
          {bid.roofType === "FLAT" && bid.flatRoofMaterial && (
            <div className="col-span-2"><span className="text-muted-foreground">Membrane: </span>{bid.flatRoofMaterial}</div>
          )}
          <div><span className="text-muted-foreground">Pitch: </span>{bid.pitchCategory ?? "—"}</div>
          <div><span className="text-muted-foreground">Stories: </span>{bid.stories}</div>
          {bid.railLinearFt && <div><span className="text-muted-foreground">Rail: </span>{bid.railLinearFt} lin ft</div>}
          {bid.attachmentType && <div><span className="text-muted-foreground">Attachment: </span>{attachmentLabel[bid.attachmentType] ?? bid.attachmentType}</div>}
          {bid.attachmentCount && <div><span className="text-muted-foreground">Attachment Count: </span>{bid.attachmentCount}</div>}
          {bid.notes && <div className="col-span-3 italic text-muted-foreground">Note: {bid.notes}</div>}
        </CardContent>
      </Card>

      {/* Cost Inputs */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="text-base">Cost Inputs (Estimator-Entered)</CardTitle>
          <p className="text-xs text-muted-foreground">Raw inputs fed into the pricing engine — not visible to partner or customer</p>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Parts Estimate: </span>
            <span className="font-semibold">{formatCurrency(bid.partsEstimate)}</span>
          </div>
          {bid.morePartsEstimate > 0 && (
            <div>
              <span className="text-muted-foreground">Misc Parts: </span>
              <span className="font-semibold">{formatCurrency(bid.morePartsEstimate)}</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Crew: </span>
            <span className="font-semibold">{bid.crewCount} people × {bid.crewDays} day{bid.crewDays !== 1 ? "s" : ""}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Miles from Job: </span>
            <span className="font-semibold">{bid.milesFromJob} mi</span>
          </div>
          <div>
            <span className="text-muted-foreground">Commission: </span>
            <span className="font-semibold">{formatCurrency(bid.commissionAmount)}</span>
          </div>
          {bid.subContractorCost > 0 && (
            <div>
              <span className="text-muted-foreground">Sub-Contractor: </span>
              <span className="font-semibold">{formatCurrency(bid.subContractorCost)}</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Permit Fee: </span>
            <span className="font-semibold">{bid.permitFeeAmount > 0 ? formatCurrency(bid.permitFeeAmount) : "None"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Rack / Rail: </span>
            <span className="font-semibold">{bid.rackCost > 0 ? formatCurrency(bid.rackCost) : "None"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Full Pricing Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Full Pricing Breakdown</CardTitle>
          <p className="text-xs text-muted-foreground">Every cost line item calculated by the pricing engine</p>
        </CardHeader>
        <CardContent className="space-y-0">
          {/* Visible line items */}
          {visibleItems.map((item) => (
            <div key={item.id} className="flex justify-between items-baseline py-1.5 border-b last:border-0 text-sm">
              <div className="flex-1 pr-4">
                <span>{item.description}</span>
                {item.unit !== "flat" && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({item.quantity} {item.unit} × {formatCurrency(item.unitPrice)})
                  </span>
                )}
              </div>
              <span className="tabular-nums font-medium">{formatCurrency(item.total)}</span>
            </div>
          ))}

          {/* Internal line items (e.g. sub-contractor) */}
          {internalItems.length > 0 && (
            <>
              <div className="pt-3 pb-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Internal Only (not on customer PDF)</p>
              </div>
              {internalItems.map((item) => (
                <div key={item.id} className="flex justify-between items-baseline py-1.5 border-b last:border-0 text-sm opacity-70 italic">
                  <span className="flex-1 pr-4">{item.description}</span>
                  <span className="tabular-nums">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </>
          )}

          <Separator className="my-3" />

          {/* Subtotal */}
          <div className="flex justify-between text-sm text-muted-foreground py-1">
            <span>Total Costs (Subtotal)</span>
            <span className="tabular-nums font-medium">{formatCurrency(bid.subtotal ?? 0)}</span>
          </div>

          {/* Margin formula */}
          <div className="flex justify-between text-sm text-muted-foreground py-1">
            <span>
              Margin Applied ({(marginRate * 100).toFixed(0)}%
              {bid.saveTheDeal ? " — Discount Bid" : " — Standard"})
              <span className="ml-1 text-xs">÷ (1 − {(marginRate * 100).toFixed(0)}%)</span>
            </span>
            <span className="tabular-nums font-medium text-solar-green">{formatCurrency(grossProfit)}</span>
          </div>

          <Separator className="my-3" />

          {/* Contract Total */}
          <div className="flex justify-between font-bold text-base py-1">
            <span>Contract Total</span>
            <span className="tabular-nums text-solar-orange text-lg">{formatCurrency(bid.total ?? 0)}</span>
          </div>

          {/* Gross profit summary */}
          <div className="mt-3 p-3 bg-muted rounded-lg grid grid-cols-3 gap-4 text-sm text-center">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Total Costs</p>
              <p className="font-semibold tabular-nums">{formatCurrency(bid.subtotal ?? 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Gross Profit</p>
              <p className="font-semibold tabular-nums text-solar-green">{formatCurrency(grossProfit)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Margin %</p>
              <p className={`font-bold text-lg tabular-nums ${bid.saveTheDeal ? "text-amber-600" : "text-solar-green"}`}>
                {marginPercent}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Schedule */}
      <Card>
        <CardHeader><CardTitle className="text-base">Payment Schedule</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-semibold">Deposit — Due upon signing</p>
            <p className="text-xs text-muted-foreground mb-1">10% of contract total</p>
            <p className="text-xl font-bold tabular-nums">{formatCurrency(bid.depositAmount ?? 0)}</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-semibold">Balance — Due upon completion</p>
            <p className="text-xs text-muted-foreground mb-1">90% of contract total</p>
            <p className="text-xl font-bold tabular-nums">{formatCurrency(bid.finalPayment ?? 0)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
