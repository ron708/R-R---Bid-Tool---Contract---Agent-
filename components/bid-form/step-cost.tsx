"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, Users, Wrench } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { BidFormData } from "./bid-form-wizard";

interface Props {
  form: BidFormData;
  update: (patch: Partial<BidFormData>) => void;
  milesLoading: boolean;
}

export function StepCost({ form, update, milesLoading }: Props) {
  return (
    <div className="space-y-6">
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
            {milesLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto mt-1" />
            ) : (
              <p className="font-semibold text-sm">{form.milesFromJob} mi</p>
            )}
          </div>
        </div>
      </div>

      {/* Miles — auto-filled, user can override */}
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
        <p className="text-xs text-muted-foreground">
          Auto-calculated from job site address. Override if needed.
        </p>
      </div>

      {/* Optional manual inputs */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Additional Costs (enter 0 if not applicable)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="permitFeeAmount">Permit Fee ($)</Label>
            <Input
              id="permitFeeAmount"
              type="number"
              step="0.01"
              min="0"
              value={form.permitFeeAmount}
              onChange={(e) => update({ permitFeeAmount: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="rackCost">Rack / Rail Cost ($)</Label>
            <Input
              id="rackCost"
              type="number"
              step="0.01"
              min="0"
              value={form.rackCost}
              onChange={(e) => update({ rackCost: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-xs text-muted-foreground">From management</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="subContractorCost">Sub-Contractor ($)</Label>
            <Input
              id="subContractorCost"
              type="number"
              step="0.01"
              min="0"
              value={form.subContractorCost}
              onChange={(e) => update({ subContractorCost: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
