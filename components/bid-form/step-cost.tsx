"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, Users, Wrench, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { BidFormData } from "./bid-form-wizard";

interface Props {
  form: BidFormData;
  update: (patch: Partial<BidFormData>) => void;
  milesLoading: boolean;
  permitFeeAmount: number; // derived: $250 or $0
  rackCost: number;        // derived: panels × $18 or $0
}

function YesNoToggle({
  value,
  onChange,
  yesLabel = "Yes",
  noLabel = "No",
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
}) {
  return (
    <div className="flex rounded-md border overflow-hidden w-fit">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          "px-4 py-1.5 text-sm font-medium transition-colors",
          !value
            ? "bg-primary text-primary-foreground"
            : "bg-background text-muted-foreground hover:bg-muted"
        )}
      >
        {noLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          "px-4 py-1.5 text-sm font-medium transition-colors border-l",
          value
            ? "bg-primary text-primary-foreground"
            : "bg-background text-muted-foreground hover:bg-muted"
        )}
      >
        {yesLabel}
      </button>
    </div>
  );
}

export function StepCost({ form, update, milesLoading, permitFeeAmount, rackCost }: Props) {
  return (
    <div className="space-y-7">

      {/* Auto-calculated summary (read-only) */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Auto-Calculated
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted rounded-lg p-3 text-center">
            <Wrench className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Parts</p>
            <p className="font-semibold text-sm">{formatCurrency(form.partsEstimate)}</p>
            <p className="text-xs text-muted-foreground">{form.panelCount} panels</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Labor</p>
            <p className="font-semibold text-sm">{form.crewCount} crew</p>
            <p className="text-xs text-muted-foreground">{form.crewDays} days</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <MapPin className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Distance</p>
            {milesLoading
              ? <Loader2 className="h-4 w-4 animate-spin mx-auto mt-1" />
              : <p className="font-semibold text-sm">{form.milesFromJob} mi</p>
            }
          </div>
        </div>
      </div>

      {/* Miles override */}
      <div className="space-y-1">
        <Label htmlFor="milesFromJob">One-Way Miles from Shop</Label>
        <div className="relative">
          {milesLoading && (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          <Input
            id="milesFromJob"
            type="number"
            step="1"
            min="0"
            value={form.milesFromJob}
            onChange={(e) => update({ milesFromJob: parseFloat(e.target.value) || 0 })}
            className={milesLoading ? "pl-9" : ""}
          />
        </div>
        <p className="text-xs text-muted-foreground">Auto-calculated from job address. Override if needed.</p>
      </div>

      {/* Permit Fee */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label>Permit Required?</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Adds a flat $250 permit fee</p>
          </div>
          <div className="flex items-center gap-3">
            {form.includePermit && (
              <span className="text-sm font-semibold text-solar-orange">+{formatCurrency(permitFeeAmount)}</span>
            )}
            <YesNoToggle value={form.includePermit} onChange={(v) => update({ includePermit: v })} />
          </div>
        </div>
      </div>

      {/* Rack / Rail */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label>Rack / Rail System Required?</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Adds $18 × {form.panelCount} panels = {formatCurrency(form.panelCount * 18)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {form.includeRack && (
              <span className="text-sm font-semibold text-solar-orange">+{formatCurrency(rackCost)}</span>
            )}
            <YesNoToggle value={form.includeRack} onChange={(v) => update({ includeRack: v })} />
          </div>
        </div>
      </div>

      {/* Sub-Contractor */}
      <div className="space-y-1">
        <Label htmlFor="subContractorCost">Sub-Contractor Cost ($)</Label>
        <Input
          id="subContractorCost"
          type="number"
          step="0.01"
          min="0"
          value={form.subContractorCost}
          onChange={(e) => update({ subContractorCost: parseFloat(e.target.value) || 0 })}
          placeholder="0"
        />
        <p className="text-xs text-muted-foreground">
          Included in contract total but not shown on customer proposal.
        </p>
      </div>

      {/* Discount Bid */}
      <div className={cn(
        "rounded-lg border-2 p-4 transition-colors",
        form.saveTheDeal
          ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
          : "border-border"
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2">
            <Tag className={cn("h-5 w-5 mt-0.5 shrink-0", form.saveTheDeal ? "text-amber-600" : "text-muted-foreground")} />
            <div>
              <p className={cn("font-semibold text-sm", form.saveTheDeal && "text-amber-700 dark:text-amber-400")}>
                Discount Bid
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Apply a discounted contract price to close a price-sensitive job.
              </p>
            </div>
          </div>
          <YesNoToggle
            value={form.saveTheDeal}
            onChange={(v) => update({ saveTheDeal: v })}
          />
        </div>
      </div>

    </div>
  );
}
