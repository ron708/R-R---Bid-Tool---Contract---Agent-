"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BidFormData } from "./bid-form-wizard";

interface Props {
  form: BidFormData;
  update: (patch: Partial<BidFormData>) => void;
}

export function StepCost({ form, update }: Props) {
  const field = (
    id: keyof BidFormData,
    label: string,
    hint: string,
    step = "0.01",
    min = "0"
  ) => (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <Input
        id={id}
        type="number"
        step={step}
        min={min}
        value={form[id] as number}
        onChange={(e) => update({ [id]: parseFloat(e.target.value) || 0 })}
      />
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Enter the actual job costs below. The pricing engine will calculate the contract
          price using the Solarponics cost-plus margin model (35% service margin).
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Parts & Materials</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field("partsEstimate", "Parts Estimate ($)", "Flashings, mounts, hardware — actual cost")}
        {field("morePartsEstimate", "Additional Parts ($)", "Misc parts not in main estimate (0 if none)")}
        {field("rackCost", "Rack / Rail Cost ($)", "Rack or rail system cost from management (0 if none)")}
      </div>

      <div className="space-y-1 pt-2">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Labor</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field("crewCount", "Crew Size (# of people)", "Number of crew members on this job", "1", "1")}
        {field("crewDays", "Crew Days", "Estimated days to complete (0.5, 1, 1.5, 2, ...)", "0.5", "0.5")}
      </div>

      <div className="space-y-1 pt-2">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Travel & Other</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field("milesFromJob", "One-Way Miles from Shop", "Distance from Solarponics to job site (one way)", "1", "0")}
        {field("commissionAmount", "Commission ($)", "Sales rep commission (default $400)", "1", "0")}
        {field("subContractorCost", "Sub-Contractor Cost ($)", "Sub cost if using outside labor (0 if none)")}
        {field("permitFeeAmount", "Permit Fee ($)", "Actual permit fee if permit is required (0 if none)")}
      </div>
    </div>
  );
}
