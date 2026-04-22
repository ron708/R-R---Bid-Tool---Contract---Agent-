"use client";

import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import type { BidFormData } from "./bid-form-wizard";
import type { PricingResult } from "@/lib/pricing-engine";

interface Props {
  form: BidFormData;
  customers: { id: string; firstName: string; lastName: string; siteAddress: string; siteCity: string | null }[];
  pricing: PricingResult;
}

const scopeLabel: Record<string, string> = {
  FULL_RR: "Full R&R (Remove & Replace)",
  REMOVAL_ONLY: "Removal Only",
  INSTALL_ONLY: "Reinstall Only",
};

const roofLabel: Record<string, string> = {
  COMP_SHINGLE: "Comp Shingle", TILE: "Tile", METAL: "Metal",
  FLAT_TPO: "Flat (TPO)", FLAT_EPDM: "Flat (EPDM)", FLAT_MOD_BIT: "Flat (Mod Bit)",
};

const pitchLabel: Record<string, string> = {
  LOW: "Low (1–3/12)", MEDIUM: "Medium (4–7/12)", STEEP: "Steep (8+/12)",
};

export function StepReview({ form, customers, pricing }: Props) {
  const customer = customers.find((c) => c.id === form.customerId);

  return (
    <div className="space-y-5 text-sm">
      <section>
        <p className="font-semibold text-base mb-2">Customer</p>
        {customer ? (
          <p>{customer.firstName} {customer.lastName} — {customer.siteAddress}{customer.siteCity ? `, ${customer.siteCity}` : ""}</p>
        ) : <p className="text-destructive">No customer selected</p>}
      </section>

      <Separator />

      <section>
        <p className="font-semibold text-base mb-2">Solar System</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          <div><span className="text-muted-foreground">Panels:</span> {form.panelCount}</div>
          {form.systemSizeKw && <div><span className="text-muted-foreground">System Size:</span> {form.systemSizeKw} kW</div>}
          {form.panelBrand && <div><span className="text-muted-foreground">Brand:</span> {form.panelBrand} {form.panelModel}</div>}
          {form.inverterType && <div><span className="text-muted-foreground">Inverter:</span> {form.inverterType}{form.inverterBrand ? ` — ${form.inverterBrand}` : ""}</div>}
        </div>
      </section>

      <Separator />

      <section>
        <p className="font-semibold text-base mb-2">Roof & Scope</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          <div><span className="text-muted-foreground">Scope:</span> {scopeLabel[form.workScope] || form.workScope}</div>
          <div><span className="text-muted-foreground">Roof:</span> {roofLabel[form.roofType] || form.roofType || "—"}</div>
          <div><span className="text-muted-foreground">Pitch:</span> {pitchLabel[form.pitchCategory] || form.pitchCategory}</div>
          <div><span className="text-muted-foreground">Stories:</span> {form.stories}</div>
          {form.railLinearFt && <div><span className="text-muted-foreground">Rail:</span> {form.railLinearFt} lin ft</div>}
          {form.attachmentCount && <div><span className="text-muted-foreground">Attachments:</span> {form.attachmentCount}</div>}
        </div>
        {form.notes && <p className="mt-2 italic text-muted-foreground">"{form.notes}"</p>}
      </section>

      <Separator />

      <section>
        <p className="font-semibold text-base mb-2">Cost Inputs</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          <div><span className="text-muted-foreground">Parts:</span> {formatCurrency(form.partsEstimate)}</div>
          {form.morePartsEstimate > 0 && <div><span className="text-muted-foreground">Add'l Parts:</span> {formatCurrency(form.morePartsEstimate)}</div>}
          {form.rackCost > 0 && <div><span className="text-muted-foreground">Rack/Rail:</span> {formatCurrency(form.rackCost)}</div>}
          <div><span className="text-muted-foreground">Crew:</span> {form.crewCount} people × {form.crewDays} day{form.crewDays !== 1 ? "s" : ""}</div>
          {form.milesFromJob > 0 && <div><span className="text-muted-foreground">Miles:</span> {form.milesFromJob} mi</div>}
          {form.commissionAmount > 0 && <div><span className="text-muted-foreground">Commission:</span> {formatCurrency(form.commissionAmount)}</div>}
          {form.subContractorCost > 0 && <div><span className="text-muted-foreground">Sub-Contractor:</span> {formatCurrency(form.subContractorCost)}</div>}
          {form.permitFeeAmount > 0 && <div><span className="text-muted-foreground">Permit Fee:</span> {formatCurrency(form.permitFeeAmount)}</div>}
        </div>
      </section>

      <Separator />

      <section>
        <p className="font-semibold text-base mb-3">Pricing Breakdown</p>
        <div className="space-y-1.5">
          {pricing.lineItems.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-muted-foreground">
                {item.description}
                {item.unit !== "flat" && ` (${item.quantity} ${item.unit} × ${formatCurrency(item.unitPrice)})`}
              </span>
              <span className="font-medium tabular-nums">{formatCurrency(item.total)}</span>
            </div>
          ))}
        </div>
        <Separator className="my-3" />
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal (costs)</span>
            <span className="tabular-nums">{formatCurrency(pricing.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Gross profit ({pricing.profitPercent.toFixed(1)}%)</span>
            <span className="tabular-nums">{formatCurrency(pricing.grossProfit)}</span>
          </div>
        </div>
        <Separator className="my-3" />
        <div className="flex justify-between font-bold text-base">
          <span>Contract Total</span>
          <span className="text-solar-orange text-lg tabular-nums">{formatCurrency(pricing.total)}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Deposit (10%):</span>{" "}
            <span className="tabular-nums">{formatCurrency(pricing.depositAmount)}</span>
          </div>
          <div>
            <span className="font-medium text-foreground">Final Payment (90%):</span>{" "}
            <span className="tabular-nums">{formatCurrency(pricing.finalPayment)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
