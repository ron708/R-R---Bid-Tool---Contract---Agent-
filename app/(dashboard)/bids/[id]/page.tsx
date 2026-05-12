import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BidActions } from "./bid-actions";
import { PhotoUpload } from "./photo-upload";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, Pencil } from "lucide-react";

export default async function BidDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const bid = await prisma.bid.findUnique({
    where: { id: params.id },
    include: { customer: true, contractor: true, lineItems: { orderBy: { sortOrder: "asc" } }, photos: true },
  });

  const isAdmin = session?.user?.role === "SOLARPONICS_ADMIN";
  if (!bid || (!isAdmin && bid.contractorId !== session!.user.contractorId)) notFound();

  const statusVariantMap: Record<string, "draft" | "sent" | "signed" | "complete" | "voided"> = {
    DRAFT: "draft", SENT: "sent", SIGNED: "signed", COMPLETE: "complete", VOIDED: "voided",
  };

  const attachmentLabel: Record<string, string> = {
    LAG_BOLT: "Comp Attachment w/ Flashing",
    S5_CLAMP: "S-5 Clamp",
    TILE_HOOK: "Tile Hook w/ Flashing",
    FLAT_ROOF_BALLAST: "Flat Roof Ballast",
    SEAM_CLAMP: "Seam Clamp",
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/bids"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{bid.bidNumber}</h1>
            <Badge variant={statusVariantMap[bid.status]}>{bid.status}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">{formatDate(bid.createdAt)}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/bids/${bid.id}/edit`}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit Bid
          </Link>
        </Button>
      </div>

      {/* Customer */}
      <Card>
        <CardHeader><CardTitle className="text-base">Customer</CardTitle></CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p className="font-semibold text-base">{bid.customer.firstName} {bid.customer.lastName}</p>
          <p className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {bid.customer.siteAddress}{bid.customer.siteCity ? `, ${bid.customer.siteCity}` : ""}
            {bid.customer.siteState ? ` ${bid.customer.siteState}` : ""}
          </p>
          {bid.customer.phone && <p className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{bid.customer.phone}</p>}
          {bid.customer.email && <p className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{bid.customer.email}</p>}
        </CardContent>
      </Card>

      {/* System */}
      <Card>
        <CardHeader><CardTitle className="text-base">Solar System</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
          <div><span className="text-muted-foreground">Panels:</span> {bid.panelCount}</div>
          {bid.systemSizeKw && <div><span className="text-muted-foreground">Size:</span> {bid.systemSizeKw} kW</div>}
          {bid.panelBrand && <div><span className="text-muted-foreground">Brand:</span> {bid.panelBrand}</div>}
          {bid.panelModel && <div><span className="text-muted-foreground">Model:</span> {bid.panelModel}</div>}
          {bid.inverterType && <div><span className="text-muted-foreground">Inverter:</span> {bid.inverterType}</div>}
          {bid.inverterBrand && <div><span className="text-muted-foreground">Inverter Brand:</span> {bid.inverterBrand}</div>}
          <div>
            <span className="text-muted-foreground">Roof:</span>{" "}
            {bid.roofType === "FLAT" ? "Flat Roof" : bid.roofType ?? "—"}
          </div>
          {bid.roofType === "FLAT" && bid.flatRoofMaterial && (
            <div className="col-span-2"><span className="text-muted-foreground">Membrane:</span> {bid.flatRoofMaterial}</div>
          )}
          <div><span className="text-muted-foreground">Pitch:</span> {bid.pitchCategory ?? "—"}</div>
          <div><span className="text-muted-foreground">Stories:</span> {bid.stories}</div>
          {bid.railLinearFt && <div><span className="text-muted-foreground">Rail:</span> {bid.railLinearFt} lin ft</div>}
          {bid.attachmentType && <div><span className="text-muted-foreground">Attachment:</span> {attachmentLabel[bid.attachmentType] ?? bid.attachmentType}</div>}
          {bid.attachmentCount && <div><span className="text-muted-foreground">Attachment Count:</span> {bid.attachmentCount}</div>}
          <div><span className="text-muted-foreground">Scope:</span> {bid.workScope}</div>
        </CardContent>
      </Card>

      {/* Pricing — admin sees full breakdown, partners see total only */}
      {isAdmin ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Pricing Breakdown</CardTitle>
              {bid.saveTheDeal && (
                <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                  Save the Deal — 30% margin
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            {bid.lineItems.map((item) => (
              <div key={item.id} className={`flex justify-between ${item.internal ? "opacity-60 italic" : ""}`}>
                <span className="text-muted-foreground">
                  {item.description}
                  {item.unit !== "flat" && ` (${item.quantity} ${item.unit} × ${formatCurrency(item.unitPrice)})`}
                  {item.internal && " (internal)"}
                </span>
                <span className="tabular-nums">{formatCurrency(item.total)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal (costs)</span>
              <span className="tabular-nums">{formatCurrency(bid.subtotal ?? 0)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1">
              <span>Contract Total</span>
              <span className="text-solar-orange tabular-nums">{formatCurrency(bid.total ?? 0)}</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 space-y-3">
            {bid.saveTheDeal && (
              <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                Discount Bid applied
              </span>
            )}
            <div className="flex justify-between font-bold text-base">
              <span>Contract Total</span>
              <span className="text-solar-orange text-xl tabular-nums">{formatCurrency(bid.total ?? 0)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Schedule */}
      <Card>
        <CardHeader><CardTitle className="text-base">Payment Schedule</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <div>
              <p className="font-semibold">Deposit — Due upon signing</p>
              <p className="text-muted-foreground text-xs">10% of contract total</p>
            </div>
            <span className="text-lg font-bold tabular-nums">{formatCurrency(bid.depositAmount ?? 0)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <div>
              <p className="font-semibold">Balance — Due upon completion</p>
              <p className="text-muted-foreground text-xs">90% of contract total</p>
            </div>
            <span className="text-lg font-bold tabular-nums">{formatCurrency(bid.finalPayment ?? 0)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <PhotoUpload bidId={bid.id} existingPhotos={bid.photos} />

      {/* Actions */}
      <BidActions bid={{ id: bid.id, status: bid.status, customer: { email: bid.customer.email, firstName: bid.customer.firstName, lastName: bid.customer.lastName }, contractorName: bid.contractor.name, bidNumber: bid.bidNumber }} />

      {bid.pipedriveDealId && (
        <p className="text-xs text-muted-foreground">Pipedrive Deal ID: {bid.pipedriveDealId}</p>
      )}
    </div>
  );
}
